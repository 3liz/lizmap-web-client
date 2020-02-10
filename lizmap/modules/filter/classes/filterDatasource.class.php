<?php
/**
* Manage and give access to lizmap configuration.
* @package   lizmap
* @subpackage filter
* @author    3liz
* @copyright 2017 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class filterDatasource {

    protected $provider = 'postgres';
    private $status = false;
    private $errors = array();
    private $repository = null;
    private $project = null;
    private $layerId = null;
    private $layername = null;
    private $layer = null;
    private $datasource = null;
    private $cnx = null;
    private $lproj = null;
    private $config = null;
    private $data = null;

    protected $blackSqlWords = array(
        ';',
        'select',
        'delete',
        'insert',
        'update',
        'drop',
        'alter',
        '--',
        'truncate',
        'vacuum',
        'create'
    );


    function __construct( $repository, $project, $layerId ){

        // Check filter config
        jClasses::inc('filter~filterConfig');
        $dv = new filterConfig($repository, $project);
        if(!$dv->getStatus()){
            return $this->error($dv->getErrors());
        }
        $config = $dv->getConfig();
        if( empty($config) ){
            return $this->error($dv->getErrors());
        }

        $this->repository = $repository;
        $this->project = $project;
        $this->lproj = lizmap::getProject($repository.'~'.$project);
        $this->status = true;
        $this->config = $dv->getConfig();

        $layer = $this->lproj->getLayer( $layerId );
        $this->layer = $layer;
        $this->layername = $layer->getName();
        $this->datasource = $layer->getDatasourceParameters();
        $this->cnx = $layer->getDatasourceConnection();

        // Get layer type
        $this->provider = $layer->getProvider();
    }

    public function getStatus(){
        return $this->status;
    }

    public function getErrors(){
        return $this->errors;
    }

    private function validateFilter($filter){
        // For Spatialite and GeoPackage, replace ILIKE with LIKE
        if( $this->provider != 'postgres' ){
            $filter = str_replace( ' ILIKE ', ' LIKE ', $filter );
        }
        $black_items = array();

        if( preg_match('#'.implode( '|', $this->blackSqlWords ).'#i', $filter, $black_items) ){
            jLog::log("The EXP_FILTER param contains dangerous chars : " . implode(', ', $black_items ) );
            return null;
        }else{
            $filter = str_replace('intersects', 'ST_Intersects', $filter );
            $filter = str_replace('geom_from_gml', 'ST_GeomFromGML', $filter );
            $filter = str_replace('$geometry', '"' . $this->datasource->geocol . '"', $filter );
            return $filter;
        }

    }

    protected function getData($sql){

        $data = array();
        try{
            $q = $this->cnx->query( $sql );
            foreach( $q as $d){
                $data[] = $d;
            }
        }catch(Exception $e){
            jLog::log($e->getMessage(), 'error');
            $this->errors = array(
                'status'=>'error',
                'title'=>'Invalid Query',
                'detail'=>$e->getMessage()
            );
            return $this->errors;
        }
        return $data;
    }

    public function getFeatureCount($filter=null){

        // validate filter
        $filter = $this->validateFilter($filter);

        // SQL
        $sql = ' SELECT count(*) AS c';
        $sql.= ' FROM ' . $this->datasource->table;
        $sql.= ' WHERE 2>1';
        if($filter){
            $sql.= " AND ( " . $filter ." )";
        }
        return $this->getData($sql);

    }

    public function getUniqueValues($fieldname, $filter=null){

        // Check fieldname
        $dbFieldsInfo = $this->layer->getDbFieldsInfo();
        $dataFields = $dbFieldsInfo->dataFields;
        if( !array_key_exists( $fieldname, $dataFields ) ){
            $this->errors = array(
                'status'=>'error',
                'title'=>'The field does not exists in the table: ',
                'detail'=>'given fieldname = ' . $fieldname
            );
            return $this->errors;
        }

        // validate filter
        $filter = $this->validateFilter($filter);

        // validate splitter
        $splitter = '';
        foreach($this->config as $config){
            if(
                property_exists($config, 'field')
                and $config->field == $fieldname
                and property_exists($config, 'splitter')
            ){
                $splitter = $config->splitter;
            }
        }
        $split = False;
        if(!empty($splitter) && strlen($splitter) > 0 && strlen($splitter) <= 3){
            $split = True;
        }

        // SQL
        if(!$split){
            // SQL
            $sql = ' SELECT ';
            $sql.= ' "' . $fieldname . '" AS v,';
            $sql.= ' Count(*) AS c';
            $sql.= ' FROM ' . $this->datasource->table;
            $sql.= ' WHERE 2>1';
            if($filter){
                $sql.= " AND ( " . $filter ." )";
            }
            $sql.= ' GROUP BY v';
            $sql.= ' ORDER BY v';
        } else {
            // We need to split each field value into parts
            // Given the splitter text. Ex: ', '

            // Easy in PostgreSQL, more tricky in SQLite / GeoPackage
            if( $this->provider == 'postgres' ){
                // SQL
                $sql = ' SELECT ';
                $sql.= ' v, count(*) AS c';
                $sql.= ' FROM (';
                $sql.= '     SELECT regexp_split_to_table(trim("' . $fieldname . '"), ' . $this->cnx->quote($splitter) . ') as v';
                $sql.= '     FROM ' . $this->datasource->table;
                $sql.= '     WHERE 2>1';
                if($filter){
                    $sql.= "    AND ( " . $filter ." )";
                }
                $sql.= ') t';
                $sql.= ' GROUP BY v';
                $sql.= ' ORDER BY v';

            } else {
                // For Spatialite and GeoPackage
                // With need a much more complex query
                $dbFieldsInfo = $this->layer->getDbFieldsInfo();
                $pkfields = array();
                foreach ($dbFieldsInfo->primaryKeys as $key) {
                    $pkfields[] = '"' . $key . '"';
                }
                $sql = '';
                $sql.= ' WITH x( id, first_item, rest) AS';
                $sql.= ' (';
                $sql.= '    SELECT ' . implode(' || ', $pkfields) . ' AS id,';
                $sql.= '        substr("' . $fieldname . '", 1, instr("' . $fieldname . '", ' . $this->cnx->quote($splitter). ')-1) as first_item,';
                $sql.= '        substr("' . $fieldname . '", instr("' . $fieldname . '", ' . $this->cnx->quote($splitter). ')+1) as rest';
                $sql.= '    FROM events';
                $sql.= '    WHERE "' . $fieldname . '" LIKE ' . $this->cnx->quote('%' . $splitter . '%' );
                $sql.= '    UNION ALL';
                $sql.= '    SELECT id,';
                $sql.= '        substr(rest, 1, instr(rest, ' . $this->cnx->quote($splitter) .')-1) AS first_item,';
                $sql.= '        substr(rest, instr(rest, ' . $this->cnx->quote($splitter) . ')+1) AS rest';
                $sql.= '    FROM x';
                $sql.= '    WHERE rest LIKE ' . $this->cnx->quote('%' . $splitter . '%' );
                $sql.= '    LIMIT 200';
                $sql.= ' ),';
                $sql.= ' source AS (';
                $sql.= '    SELECT trim(first_item) AS cat, count(id) AS nb';
                $sql.= '    FROM x';
                $sql.= '    GROUP BY first_item';
                $sql.= '    UNION ALL';
                $sql.= '    SELECT trim(rest) AS cat, count(id) AS nb';
                $sql.= '    FROM x';
                $sql.= '    WHERE rest NOT LIKE ' . $this->cnx->quote('%' . $splitter . '%' );
                $sql.= '    GROUP BY rest';
                $sql.= '    UNION ALL';
                $sql.= '    SELECT \'NULL\' AS cat, count(' . implode(' || ', $pkfields) . ') AS nb';
                $sql.= '    FROM events';
                $sql.= '    WHERE "' . $fieldname . '" IS NULL';
                $sql.= ' )';
                $sql.= ' SELECT cat AS v, sum(nb) AS c';
                $sql.= ' FROM source';
                $sql.= ' GROUP BY cat';
                $sql.= ' ORDER BY v';
            }

        }

//jLog::log($sql);


        return $this->getData($sql);
    }

    public function getMinAndMaxValues($fieldname, $filter=null){
        // Check fieldname
        $dbFieldsInfo = $this->layer->getDbFieldsInfo();
        $dataFields = $dbFieldsInfo->dataFields;
        $fields = explode(',', $fieldname);
        foreach($fields as $field){
            if( !array_key_exists( $field, $dataFields ) ){
                $this->errors = array(
                    'status'=>'error',
                    'title'=>'The field does not exists in the table: ',
                    'detail'=>'given fieldname = ' . $field
                );
                return $this->errors;
            }
        }

        // validate filter
        $filter = $this->validateFilter($filter);

        // SQL
        $sql = ' SELECT ';
        if( $this->provider == 'postgres' ){
            $sql.= ' Min(Least("' . implode('","', $fields) . '")) AS min,';
            $sql.= ' Max(Greatest("' . implode('","', $fields) . '")) AS max';
        } else {
            if (count($fields) === 1) {
                $sql .= ' Min("' . $fields[0] . '") AS min,';
                $sql .= ' Max("' . $fields[0] . '") AS max';
            } else {
                $sql .= ' Min(Min("' . implode('","', $fields) . '")) AS min,';
                $sql .= ' Max(Max("' . implode('","', $fields) . '")) AS max';
            }
        }
        $sql.= ' FROM ' . $this->datasource->table;
        $sql.= ' WHERE 2>1';
        if($filter){
            $sql.= " AND ( " . $filter ." )";
        }
        return $this->getData($sql);
    }

    public function getExtent($crs, $filter=null){
        // Get geometry column
        $dbFieldsInfo = $this->layer->getDbFieldsInfo();
        $geom = $dbFieldsInfo->geometryColumn;

        // validate filter
        $filter = $this->validateFilter($filter);

        // validate crs
        $vcrs = null;
        $a = explode(':', $crs);
        if( count($a) == 2 and $a[0] == 'EPSG' and ctype_digit($a[1]) ){
            $vcrs = $a[1];
        }

        // SQL
        $geom = '"' . $geom .'"';
        if( $this->provider == 'postgres' ){
            $st = 'ST_';
        } else {
            // Do not add ST_ for Spatialite or GeoPackage
            $st = '';
            // Provider OGR means GeoPackage: needs to convert geometry
            if( $this->provider == 'ogr' and preg_match('#gpkg$#', $this->datasource->dbname ) ){
                $geom = 'GeomFromGPB(' . $geom . ')';
            }
        }
        $sql = ' SELECT ' . $st . 'AsGeoJSON(' . $st . 'Extent(';
        if($vcrs)
            $sql.= '' . $st . 'Transform(';
        $sql.= $geom;
        if($vcrs)
            $sql.= ", " . $vcrs . ")";
        $sql.= '), 8, 1) AS bbox';
        $sql.= ' FROM ' . $this->datasource->table;
        $sql.= ' WHERE 2>1';
        if($filter){
            $sql.= " AND ( " . $filter ." )";
        }
        return $this->getData($sql);
    }

}
