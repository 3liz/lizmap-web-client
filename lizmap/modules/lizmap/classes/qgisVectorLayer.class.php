<?php
/**
* Give access to qgis mapLayer configuration.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2013 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/


class qgisVectorLayer extends qgisMapLayer{
  // layer type
  protected $type = 'vector';

  protected $fields = array();

  protected $aliases = array();

  protected $wfsFields = array();

  // to avoid multiple request
  protected $dtParams = null;
  protected $connection = null;
  protected $dbFieldList = null;
  protected $dbFieldsInfo = null;

  // Map data type as geometry type
  private $geometryDatatypeMap = array(
    'point', 'linestring', 'polygon', 'multipoint',
    'multilinestring', 'multipolygon', 'geometrycollection', 'geometry'
  );

  /**
   * constructor
   * @param lizmapProject $project
   * @param array $propLayer  list of properties values
   */
  public function __construct ( $project, $propLayer ) {
    parent::__construct( $project, $propLayer );
    $this->fields = $propLayer['fields'];
    $this->aliases = $propLayer['aliases'];
    $this->wfsFields = $propLayer['wfsFields'];
  }

  public function getFields() {
      return $this->fields;
  }

  public function getAliasFields() {
      return $this->aliases;
  }

  public function getWfsFields() {
      return $this->wfsFields;
  }

  public function getDatasourceParameters() {
      if ( $this->dtParams )
          return $this->dtParams;

    // Get datasource information from QGIS
    $datasourceMatch = preg_match(
      "#(?:dbname='([^ ]+)' )?(?:service='([^ ]+)' )?(?:host=([^ ]+) )?(?:port=([0-9]+) )?(?:user='([^ ]+)' )?(?:password='([^ ]+)' )?(?:sslmode=([^ ]+) )?(?:key='([^ ]+)' )?(?:estimatedmetadata=([^ ]+) )?(?:selectatid=([^ ]+) )?(?:srid=([0-9]+) )?(?:type=([a-zA-Z]+) )?(?:table=\"([^ ]+)\" )?(?:\()?(?:([^ ]+)\) )?(?:sql=(.*))?#s",
      $this->datasource,
      $dt
    );

    $ds = array(
      "dbname" => $dt[1],
      "service" => $dt[2],
      "host" => $dt[3],
      "port" => $dt[4],
      "user" => $dt[5],
      "password" => $dt[6],
      "sslmode" => $dt[7],
      "key" => $dt[8],
      "estimatedmetadata" => $dt[9],
      "selectatid" => $dt[10],
      "srid" => $dt[11],
      "type" => $dt[12],
      "table" => $dt[13],
      "geocol" => $dt[14],
      "sql" => $dt[15]
    );

    $table = $ds['table'];
    $tableAlone = $table;
    $schema = '';
    if(preg_match('#"."#', $table)){
      $table = '"'.$table.'"';
      $exp = explode('.', str_replace('"', '', $table));
      $tableAlone = $exp[1];
      $schema = $exp[0];
    }
    // Handle subqueries
    if( substr($table, 0, 1) == '(' and substr($table, -1) == ')' ){
      $table = $tableAlone = $table . ' fooliz';
      // remove \" which escapes table and schema names in QGIS WML within subquery
      $table = str_replace('\"', '"', $table);
    }
    $ds['schema'] = $schema;
    $ds['table'] = $table;
    $ds['tablename'] = $tableAlone;

    $this->dtParams = (object) $ds;
    return $this->dtParams;
  }

  public function getDatasourceConnection() {
    if ( $this->connection )
        return $this->connection;

    if( $this->provider != 'spatialite' && $this->provider != 'postgres') {
        jLog::log('Unkown provider "'.$this->provider.'" to get connection!','error');
        return null;
    }

    // get or create profile
    $profile = $this->id;
    try {
        // try to get the profile to do not rebuild it
        jProfiles::get('jdb', $profile, true);
    } catch (Exception $e) {
        // transform datasource params to jDb params
        $dtParams = $this->getDatasourceParameters();
        $jdbParams = array();
        if( $this->provider == 'spatialite' ){
          $repository = $this->project->getRepository();
          $jdbParams = array(
            "driver" => 'sqlite3',
            "database" => realpath($repository->getPath().$dtParams->dbname),
            "extensions"=>"libspatialite.so,mod_spatialite.so"
          );
        } else if( $this->provider == 'postgres' ){
          if(!empty($dtParams->service)){
            $jdbParams = array(
              "driver" => 'pgsql',
              "service" => $dtParams->service
            );
          }else{
            $jdbParams = array(
              "driver" => 'pgsql',
              "host" => $dtParams->host,
              "port" => (integer)$dtParams->port,
              "database" => $dtParams->dbname,
              "user" => $dtParams->user,
              "password" => $dtParams->password
            );
          }
        } else
          return null;

        // create profile
        jProfiles::createVirtualProfile('jdb', $profile, $jdbParams);
    }
    $cnx = jDb::getConnection($profile);
    $this->connection = $cnx;
    return $cnx;
  }

  public function getDbFieldList() {
      if ( $this->dbFieldList )
        return $this->dbFieldList;

      $dtParams = $this->getDatasourceParameters();
      if ( !$dtParams )
        return array();

      $cnx = $this->getDatasourceConnection();
      if ( !$cnx )
        return array();

      $tools = $cnx->tools();
      $sequence = null;

      $this->dbFieldList = $tools->getFieldList($dtParams->tablename, $sequence, $dtParams->schema);
      return $this->dbFieldList;
  }

  public function getDbFieldsInfo() {
      if ( $this->dbFieldsInfo )
        return $this->dbFieldsInfo;

      $dtParams = $this->getDatasourceParameters();
      if ( !$dtParams ) {
          jLog::log('Cant get datasource params for the layer "'.$this->name.'"','error');
          return null;
      }

      $cnx = $this->getDatasourceConnection();
      if ( !$cnx ) {
          jLog::log('Cant get datasource connection for the layer "'.$this->name.'"','error');
          return null;
      }

      $fields = $this->getDbFieldList();
      $wfsFields = $this->getWfsFields();

      $dataFields = array();
      foreach($fields as $fieldName=>$prop){
          if( in_array($fieldName, $wfsFields) || in_array( strtolower($prop->type), $this->geometryDatatypeMap ) )
              $dataFields[$fieldName] = $prop;
      }

      $primaryKeys = array();
      $geometryColumn = '';
      $geometryType = '';
      foreach($dataFields as $fieldName=>$prop){
          // Detect primary key column
          if($prop->primary && !in_array($fieldName, $primaryKeys)){
              $primaryKeys[] = $fieldName;
          }

          // Detect geometry column
          if(in_array( strtolower($prop->type), $this->geometryDatatypeMap)) {
              $geometryColumn = $fieldName;
              $geometryType = strtolower($prop->type);
              // If postgresql, get real geometryType from geometry_columns (jelix prop gives 'geometry')
              if( $this->provider == 'postgres' and $geometryType == 'geometry' ){
                  $sql = "SELECT type FROM geometry_columns";
                  $sql.= " WHERE 2>1";
                  $sql.= " AND f_table_schema = " . $cnx->quote($dtParams->schema);
                  $sql.= " AND f_table_name = " . $cnx->quote($dtParams->tablename);
                  $res = $cnx->query($sql);
                  $res = $res->fetch();
                  if( $res )
                      $geometryType = strtolower($res->type);
              }
          }
      }

      // For views : add key from datasource
      if(!$primaryKeys and $dtParams->key){
          // check if layer is a view
          if($this->provider == 'postgres'){
            $sql = " SELECT table_name FROM INFORMATION_SCHEMA.views";
            $sql.= " WHERE 2>1";
            $sql.= " AND (table_schema = ANY (current_schemas(false)) OR table_schema = " . $cnx->quote($dtParams->schema) . ")";
            $sql.= " AND table_name=".$cnx->quote($dtParams->tablename);
          }
          if($this->provider == 'spatialite'){
            $sql = " SELECT name FROM sqlite_master WHERE type = 'view'";
            $sql.= " AND name=".$cnx->quote($dtParams->tablename);
          }
          $res = $cnx->query($sql);
          if($res->rowCount() > 0)
            $this->primaryKeys[] = $dtParams->key;
      }

      $this->dbFieldsInfo = (object) array(
          'dataFields'=> $dataFields,
          'primaryKeys'=> $primaryKeys,
          'geometryColumn'=> $geometryColumn,
          'geometryType'=> $geometryType
      );
      return $this->dbFieldsInfo;
  }

  public function getDbFieldDefaultValues() {
      $dbFieldsInfo = $this->getDbFieldsInfo();

      $provider = $this->getProvider();
      $cnx = null;
      if ( $provider == 'postgres' )
            $cnx = $this->getDatasourceConnection();

      $dataFields = $dbFieldsInfo->dataFields;
      $defaultValues = array();
      foreach ( $dataFields as $ref=>$prop ) {
          if ( !$prop->hasDefault )
            continue;
          if ( $prop->default == '' )
              continue;
          $defaultValues[ $ref ] = $prop->default;
          // if provider is postgres evaluate default value
          if ( $provider == 'postgres' ) {
              $ds = $cnx->query ('SELECT '.$prop->default.' AS v;');
              $d = $ds->fetch();
              if( $d )
                $defaultValues[ $ref ] = $d->v;
          }
      }
      return $defaultValues;
  }

  public function getDbFieldDistinctValues( $field ) {
      $dtParams = $this->getDatasourceParameters();

      // Get database connection object
      $cnx = $this->getDatasourceConnection();

      // Build the SQL query to retrieve data from the table
      $sql = 'SELECT DISTINCT "'.$field.'"';
      $sql.= ' FROM '.$dtParams->table;

      // Run the query and loop through the result to set the form data
      $rs = $cnx->query( $sql );
      $values = array();
      foreach ( $rs as $record ) {
          $values[] = $record->$field;
      }

      return $values;
  }

  public function getDbFieldValues( $feature ) {
      $dbFieldsInfo = $this->getDbFieldsInfo();

      $dtParams = $this->getDatasourceParameters();

      // Get database connection object
      $cnx = $this->getDatasourceConnection();

      $geometryColumn = $dbFieldsInfo->geometryColumn;
      // Build the SQL query to retrieve data from the table
      $sql = 'SELECT *';
      if ( $geometryColumn != '' )
          $sql.= ', ST_AsText('.$geometryColumn.') AS astext';
      $sql.= ' FROM '.$dtParams->table;

      $sqlw = array();
      $primaryKeys = $dbFieldsInfo->primaryKeys;
      $dataFields = $dbFieldsInfo->dataFields;
      foreach($primaryKeys as $key){
          $val = $feature->properties->$key;
          if( $dataFields[$key]->unifiedType != 'integer' )
              $val = $cnx->quote($val);
          $sqlw[] = '"' . $key . '"' . ' = ' . $val;
      }
      $sql.= ' WHERE ';
      $sql.= implode(' AND ', $sqlw );

      // Run the query and loop through the result to set the form data
      $rs = $cnx->query( $sql );
      $values = array();
      foreach ( $rs as $record ) {
          // Loop through the data fields
          foreach($dataFields as $ref=>$prop){
              $values[ $ref ] = $record->$ref;
          }
          // geometry column : override binary with text representation
          if ( $geometryColumn != '' )
              $values[ $geometryColumn ] = $record->astext;
      }
      return $values;
  }

  public function getGeometryAsSql( $value ) {
      $nvalue = "ST_GeomFromText('".filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES)."', ".$this->srid.")";

      // Get database connection object
      $cnx = $this->getDatasourceConnection();
      $dbFieldsInfo = $this->getDbFieldsInfo();

      // test type
      $rs = $cnx->query('SELECT GeometryType('.$nvalue.') as geomtype');
      $rs = $rs->fetch();
      if ( !preg_match('/'.$dbFieldsInfo->geometryType.'/',strtolower($rs->geomtype)) )
          if ( preg_match('/'.str_replace('multi','',$dbFieldsInfo->geometryType).'/',strtolower($rs->geomtype)) )
              $nvalue = 'ST_Multi('.$nvalue.')';
          else
              throw new Exception('The geometry type does not match!');
      return $nvalue;
  }

  public function insertFeature( $values ) {
      // Get database connection object
      $dtParams = $this->getDatasourceParameters();
      $cnx = $this->getDatasourceConnection();
      $dbFieldsInfo = $this->getDbFieldsInfo();

      $refs = array();
      $insert = array();
      $primaryKeys = $dbFieldsInfo->primaryKeys;
      $dataFields = $dbFieldsInfo->dataFields;
      $dataLogInfo = array();
      foreach ( $values as $ref=>$value ) {
          // For insert, only for not NULL values to allow serial and default values to work
          if( $value != 'NULL' ){
            $insert[]=$value;
            $refs[]='"'.$ref.'"';
            // For log
            if ( in_array( $ref, $primaryKeys ) ) {
                $val = $value;
                if( $dataFields[$key]->unifiedType != 'integer' )
                    $val = $cnx->quote($val);
                $dataLogInfo[] = '"' . $ref . '"' . ' = ' . $val;
            }
          }
      }

      $sql = ' INSERT INTO '.$dtParams->table.' (';
      $sql.= implode(', ', $refs);
      $sql.= ' ) VALUES (';
      $sql.= implode(', ', $insert);
      $sql.= ' )';

      // Get select clause for primary keys (used when inserting data in postgresql)
      $returnKeys = array();
      foreach($primaryKeys as $key){
          $returnKeys[] = '"' . $key . '"';
      }
      $returnKeysString = implode(', ', $returnKeys);
      // For spatialite, we will run a complentary query to retrieve the pkeys
      if( $this->provider == 'postgres' ){
          $sql.= '  RETURNING '. $returnKeysString;
      }
      $sql.= ';';

      try {
          // Begin transaction
          $cnx->beginTransaction();
          // Retrieve PK for created objects
          $pkvals = array();
          if( $this->provider == 'postgres' ) {
              // Query the request
              $rs = $cnx->query($sql);
              foreach($rs as $line){
                  foreach($primaryKeys as $key){
                      $pkvals[$key] = $line->$key;
                  }
                  break;
              }
          } else {
              // Exec the request
              $rs = $cnx->exec($sql);
              $sqlpk = 'SELECT ' . $returnKeysString . ' FROM '.$dtParams->table.' WHERE rowid = last_insert_rowid();';
              $rspk = $cnx->query($sqlpk);
              foreach($rspk as $line){
                  foreach($primaryKeys as $key){
                      $pkvals[$key] = $line->$key;
                  }
                  break;
              }
          }
          $cnx->commit();

          // Log
          $content = 'INSERT table=' . $dtParams->table;
          if( count($pkvals) > 0 )
            $content.= ', pkeys=' . json_encode($pkvals);
          $content.= ', ('.implode(', ', $dataLogInfo).')';
          $eventParams = array(
            'key' => 'editionSaveFeature',
            'content' => $content,
            'repository' => $this->project->getRepository()->getKey(),
            'project' => $this->project->getKey()
          );
          jEvent::notify('LizLogItem', $eventParams);

          return $pkvals;
      } catch (Exception $e) {
          jLog::log("SQL = ".$sql);
          throw $e;
      }
  }

  public function updateFeature( $feature, $values, $loginFilteredLayers ) {
      // Get database connection object
      $dtParams = $this->getDatasourceParameters();
      $cnx = $this->getDatasourceConnection();
      $dbFieldsInfo = $this->getDbFieldsInfo();

      $update = array();
      foreach ( $values as $ref=>$value ) {
          // For update, keep fields with NULL to allow deletion of values
          $update[]='"'.$ref.'"='.$value;
      }

      // SQL for updating on line in the edition table
      $sql = ' UPDATE '.$dtParams->table.' SET ';
      $sql.= implode(', ', $update);

      // Add where clause with primary keys
      $sqlw = array();
      $primaryKeys = $dbFieldsInfo->primaryKeys;
      $dataFields = $dbFieldsInfo->dataFields;
      foreach($primaryKeys as $key){
          $val = $feature->properties->$key;
          if( $dataFields[$key]->unifiedType != 'integer' )
              $val = $cnx->quote($val);
          $sqlw[] = '"' . $key . '"' . ' = ' . $val;
      }
      // Store WHere clause to retrieve primary keys in spatialite
      $uwhere = '';
      $uwhere.= ' WHERE ';
      $uwhere.= implode(' AND ', $sqlw );

      // Add login filter if needed
      if( $loginFilteredLayers and is_array( $loginFilteredLayers ) ){
          $sql.= ' AND '.$loginFilteredLayers['where'];
      }
      $sql.= $uwhere;

      // Get select clause for primary keys (used when inserting data in postgresql)
      $returnKeys = array();
      foreach($primaryKeys as $key){
          $returnKeys[] = '"' . $key . '"';
      }
      $returnKeysString = implode(', ', $returnKeys);
      // For spatialite, we will run a complentary query to retrieve the pkeys
      if( $this->provider == 'postgres' ){
          $sql.= '  RETURNING '. $returnKeysString;
      }
      $sql.= ';';

      try {
          // Begin transaction
          $cnx->beginTransaction();
          // Retrieve PK for created objects
          $pkvals = array();
          if( $this->provider == 'postgres' ) {
              // Query the request
              $rs = $cnx->query($sql);
              foreach($rs as $line){
                  foreach($primaryKeys as $key){
                      $pkvals[$key] = $line->$key;
                  }
                  break;
              }
          } else {
              // Exec the request
              $rs = $cnx->exec($sql);
              $sqlpk = 'SELECT ' . $returnKeysString . ' FROM '.$dtParams->table.$uwhere;
              $rspk = $cnx->query($sqlpk);
              foreach($rspk as $line){
                  foreach($primaryKeys as $key){
                      $pkvals[$key] = $line->$key;
                  }
                  break;
              }
          }
          $cnx->commit();

          // Log
          $content = 'UPDATE table=' . $dtParams->table;
          $content.= ', id=' . $feature->id;
          if( count($pkvals) > 0 )
            $content.= ', pkeys=' . json_encode($pkvals);
          $content.= ', ('.implode(', ', $update).')';
          $eventParams = array(
            'key' => 'editionSaveFeature',
            'content' => $content,
            'repository' => $this->project->getRepository()->getKey(),
            'project' => $this->project->getKey()
          );
          jEvent::notify('LizLogItem', $eventParams);

          return $pkvals;
      } catch (Exception $e) {
          jLog::log("SQL = ".$sql);
          throw $e;
      }
  }

  public function deleteFeature( $feature, $loginFilteredLayers ) {
      // Get database connection object
      $dtParams = $this->getDatasourceParameters();
      $cnx = $this->getDatasourceConnection();
      $dbFieldsInfo = $this->getDbFieldsInfo();

      // SQL for deleting on line in the edition table
      $sql = ' DELETE FROM '.$dtParams->table;

      // Add where clause with primary keys
      $sqlw = array();
      $primaryKeys = $dbFieldsInfo->primaryKeys;
      $dataFields = $dbFieldsInfo->dataFields;
      $pkLogInfo = array();
      foreach($primaryKeys as $key){
          $val = $feature->properties->$key;
          if( $dataFields[$key]->unifiedType != 'integer' )
              $val = $cnx->quote($val);
          $sqlw[] = '"' . $key . '"' . ' = ' . $val;
          $pkLogInfo[] = $val;
      }
      $sql.= ' WHERE ';
      $sql.= implode(' AND ', $sqlw );

      // Add login filter if needed
      if( $loginFilteredLayers and is_array( $loginFilteredLayers ) ){
          $sql.= ' AND '.$loginFilteredLayers['where'];
      }

      try {
          $rs = $cnx->exec($sql);

          // Log
          $content = 'table=' . $dtParams->table;
          $content.= ', id=' . $feature->id;
          if( count($pkLogInfo) > 0 )
            $content.= ', pk=' . implode(',', $pkLogInfo);
          $eventParams = array(
            'key' => 'editionDeleteFeature',
            'content' => $content,
            'repository' => $this->project->getRepository()->getKey(),
            'project' => $this->project->getKey()
          );
          jEvent::notify('LizLogItem', $eventParams);

          return $rs;
      } catch (Exception $e) {
          jLog::log("SQL = ".$sql);
          throw $e;
      }
  }

  public function linkChildren( $fkey, $fval, $pkey, $pvals ) {
      // Get database connection object
      $dtParams = $this->getDatasourceParameters();
      $cnx = $this->getDatasourceConnection();
      $dbFieldsInfo = $this->getDbFieldsInfo();
      $dataFields = $dbFieldsInfo->dataFields;

      $results = array();
      $one = (int) $fval;
      if( $dataFields[$fkey]->unifiedType != 'integer' )
          $one = $cnx->quote( $one );
      foreach( $pvals as $pval ) {
          $two = (int) $pval;
          if( $dataFields[$pkey]->unifiedType != 'integer' )
              $two = $cnx->quote( $two );

          // Build SQL
          $sql = ' UPDATE '.$dtParams->table;
          $sql.= ' SET "' . $fkey . '" = ' . $one;
          $sql.= ' WHERE "' . $pkey . '" = ' . $two ;
          $sql.= ';';

          try {
              $results[] = $cnx->exec($sql);
          } catch (Exception $e) {
              jLog::log("SQL = ".$sql);
              throw $e;
          }
      }
      return $results;
  }

  public function insertRelations( $fkey, $fvals, $pkey, $pvals ) {
      // Get database connection object
      $dtParams = $this->getDatasourceParameters();
      $cnx = $this->getDatasourceConnection();
      $dbFieldsInfo = $this->getDbFieldsInfo();
      $dataFields = $dbFieldsInfo->dataFields;

      $results = array();
      foreach( $fvals as $fval ) {
          $one = (int) $fval;
          if( $dataFields[$fkey]->unifiedType != 'integer' )
              $one = $cnx->quote( $one );
          foreach( $pvals as $pval ) {
              $two = (int) $pval;
              if( $dataFields[$pkey]->unifiedType != 'integer' )
                  $two = $cnx->quote( $two );

              // Build SQL
              $sql = ' INSERT INTO '.$dtParams->table.' (';
              $sql.= ' "' . $fkey . '" , ';
              $sql.= ' "' . $pkey . '" )';
              $sql.= ' SELECT '. $one . ', ' . $two ;
              $sql.= ' WHERE NOT EXISTS';
              $sql.= ' ( SELECT ';
              $sql.= ' "' . $fkey . '" , ';
              $sql.= ' "' . $pkey . '" ';
              $sql.= ' FROM '.$dtParams->table;
              $sql.= ' WHERE "' . $fkey . '" = ' . $one ;
              $sql.= ' AND "' . $pkey . '" = ' . $two . ')';
              $sql.= ';';

              try {
                  $results[] = $cnx->exec($sql);
              } catch (Exception $e) {
                  jLog::log("SQL = ".$sql);
                  throw $e;
              }
          }
      }
      return $results;
  }

  public function unlinkChild( $fkey, $pkey, $pval ) {
      // Get database connection object
      $dtParams = $this->getDatasourceParameters();
      $cnx = $this->getDatasourceConnection();
      $dbFieldsInfo = $this->getDbFieldsInfo();
      $dataFields = $dbFieldsInfo->dataFields;

      // Build SQL
      $val = (int) $val;
      if( $dataFields[$pkey]->unifiedType != 'integer' )
          $val = $cnx->quote( $val );

      $sql = ' UPDATE '.$dtParams->table;
      $sql.= ' SET "' . $fkey . '" = NULL';
      $sql.= ' WHERE "' . $pkey . '" = ' . $val ;
      $sql.= ';';

      try {
          $rs = $cnx->exec($sql);
          return $rs;
      } catch (Exception $e) {
          jLog::log("SQL = ".$sql);
          throw $e;
      }
  }

  public function isEditable() {
      $layerName = $this->name;
      $eLayers  = $this->project->getEditionLayers();
      if ( !property_exists( $eLayers, $layerName ) ) {
          return false;
      }
      $eLayer = $eLayers->$layerName;
      if ( $eLayer->capabilities->modifyGeometry != "True"
           && $eLayer->capabilities->modifyAttribute != "True"
           && $eLayer->capabilities->deleteFeature != "True"
           && $eLayer->capabilities->createFeature != "True" ) {
        return false;
      }
      return true;
  }

  public function getEditionCapabilities() {
      $layerName = $this->name;
      $eLayers  = $this->project->getEditionLayers();
      if ( !property_exists( $eLayers, $layerName ) ) {
          return null;
      }
      return $eLayers->$layerName;
  }
}
