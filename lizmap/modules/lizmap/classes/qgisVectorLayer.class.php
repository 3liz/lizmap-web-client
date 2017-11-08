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

  public function getDatasourceParameters() {
    // Get datasource information from QGIS
    $datasourceMatch = preg_match(
      "#(?:dbname='([^ ]+)' )?(?:service='([^ ]+)' )?(?:host=([^ ]+) )?(?:port=([0-9]+) )?(?:user='([^ ]+)' )?(?:password='([^ ]+)' )?(?:sslmode=([^ ]+) )?(?:key='([^ ]+)' )?(?:estimatedmetadata=([^ ]+) )?(?:selectatid=([^ ]+) )?(?:srid=([0-9]+) )?(?:type=([a-zA-Z]+) )?(?:table=\"(.+)?\" )?(?:\()?(?:([^ ]+)\) )?(?:sql=(.*))?#s",
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

    return (object) $ds;
  }

  public function getDatasourceConnection() {
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

    $profile = $this->id;
    jProfiles::createVirtualProfile('jdb', $profile, $jdbParams);
    return jDb::getConnection($profile);
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
}
