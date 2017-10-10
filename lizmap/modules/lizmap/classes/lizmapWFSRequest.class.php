<?php
/**
* Manage OGC request.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2015 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class lizmapWFSRequest extends lizmapOGCRequest {

    protected $tplExceptions = 'lizmap~wfs_exception';

    protected $qgisLayer = Null;

    protected $datasource = Null;

    protected $selectFields = array();

    protected function getcapabilities ( ) {
        $result = parent::getcapabilities();

        $data = $result->data;
        if ( empty( $data ) or floor( $result->code / 100 ) >= 4 ) {
            jMessage::add('Server Error !', 'Error');
            return $this->serviceException();
        }

        if ( preg_match( '#ServiceExceptionReport#i', $data ) )
            return $result;

        // Replace qgis server url in the XML (hide real location)
        $sUrl = jUrl::getFull(
          "lizmap~service:index",
          array("repository"=>$this->repository->getKey(), "project"=>$this->project->getKey())
        );
        $sUrl = str_replace('&', '&amp;', $sUrl);
        preg_match('/<get>.*\n*.+xlink\:href="(.+)"/i', $data, $matches);
        if ( count( $matches ) < 2 )
            preg_match('/get onlineresource="(.+)"/i', $data, $matches);
        if ( count( $matches ) > 1 )
            $data = str_replace($matches[1], $sUrl, $data);
        $data = str_replace('&amp;&amp;', '&amp;', $data);

        return (object) array(
            'code' => 200,
            'mime' => $result->mime,
            'data' => $data,
            'cached' => False
        );
    }

    function describefeaturetype(){
        $querystring = $this->constructUrl();

        // Get remote data
        $getRemoteData = lizmapProxy::getRemoteData(
          $querystring,
          $this->services->proxyMethod,
          $this->services->debugMode
        );
        $data = $getRemoteData[0];
        $mime = $getRemoteData[1];
        $code = $getRemoteData[2];

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => False
        );
    }

    function getfeature() {
        // add outputformat if not provided
        $output = $this->param('outputformat');
        if(!$output)
            $this->params['outputformat'] = 'GML2';

        // Get Lizmap layer config
        $typename = $this->params['typename'];
        $lizmapLayer = $this->project->findLayerByTypeName( $typename );
        $qgisLayer = $this->project->getLayer( $lizmapLayer->id );
        $this->qgisLayer = $qgisLayer;

        // Get provider
        $provider = $qgisLayer->getProvider();
        $filter = '';
        if( array_key_exists('filter', $this->params) )
            $filter = $this->params['filter'];

        // Use direct SQL query to improve performance for PostgreSQL layer
        // but only of not OGC filter is passed (complex to implement)
        // and only for GeoJSON (specific to Lizmap)
        if( $provider == 'postgres'
            and empty($filter)
            and strtolower($output) == 'geojson'
            //and false
        ){
            return $this->getfeaturePostgres();
        }else{
            return $this->getfeatureQgis();
        }
    }

    function getfeatureQgis(){

        // Else pass query to QGIS Server
        $querystring = $this->constructUrl();

        // Get remote data
        $getRemoteData = lizmapProxy::getRemoteData(
            $querystring,
            $this->services->proxyMethod,
            $this->services->debugMode
        );
        $data = $getRemoteData[0];
        $mime = $getRemoteData[1];
        $code = $getRemoteData[2];

        if ( $mime == 'text/plain' && strtolower( $this->param('outputformat') ) == 'geojson' ) {
            $mime = 'text/json';
            $layer = $this->project->findLayerByAnyName( $this->params['typename'] );
            if ( $layer != null ) {
                $layer = $this->project->getLayer( $layer->id );
                $aliases = $layer->getAliasFields();
                $layer = json_decode( $data );
                $layer->aliases = (object) $aliases;
                $data = json_encode( $layer );
            }
        }

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => False
        );
    }

    function getfeaturePostgres(){

        // Get database connexion for this layer
        $cnx = $this->qgisLayer->getDatasourceConnection();
        // Get datasource
        $ds = $this->qgisLayer->getDatasourceParameters();
        $this->datasource = $ds;

        // Get fields
        $wfsFields = $this->qgisLayer->getWfsFields();

        // Build SQL
        $sql = '';

        // SELECT
        $sql.= ' SELECT ';
        $propertyname = '';
        if( array_key_exists( 'propertyname', $this->params ) )
            $propertyname = $this->params['propertyname'];
        if( !empty( $propertyname ) ){
            $sfields = array();
            $pfields = explode( ',', $propertyname );
            foreach( $pfields as $pfield ){
                if( in_array( $pfield, $wfsFields) ){
                    $sfields[] = $pfield;
                }
            }
        }else{
            $sfields = $wfsFields;
        }
        // Add key if not present ( WFS need to export id = typename.id for each feature)
        $key = $this->datasource->key;
        $keys = explode(',', $key);
        foreach($keys as $k){
            if( !in_array($k, $sfields) )
                $sfields[] = $k;
        }
        $this->selectFields = $sfields;
        $sql.= '"' . implode( '", "', $sfields ) . '"';

        // Get spatial field
        $geocol = $ds->geocol;
        if( !empty( $geocol ) ){
            $geocolalias = 'geosource';
            $sql.= ', "' . $geocol . '" AS "' . $geocolalias . '"';
        }


        // FROM
        $sql.= ' FROM ' . $ds->table ;

        // WHERE
        $sql.= ' WHERE True';

        // EXP_FILTER
        $exp_filter = '';
        if( array_key_exists( 'exp_filter', $this->params ) )
            $exp_filter = $this->params['exp_filter'];
        if( ! empty( $exp_filter ) ){
            $validFilter = $this->validateFilter($exp_filter);
            if(!$validFilter){
                jLog::log('Dangerous filter, use QGIS Server to get features');
                return $this->getfeatureQgis();
            }
            $sql.= ' AND ' . $validFilter;
        }

        // ORDER BY
        // séparé par virgule, et fini par espace + a ou d
        // si pas de a ou d , c'est a
        // SortBY=id a,name d
        $sortby = '';
        if( array_key_exists( 'sortby', $this->params ) )
            $sortby = $this->params['sortby'];
        if( !empty( $sortby ) ){
            $sort_items = array();
            $items = explode( ',', $sortby );
            foreach($items as $item){
                // !!! Validate on fields to avoid injection !!!
                $exp = explode( ' ', $item );
                $field = $exp[0];
                if( in_array( $field, $wfsFields) ){
                    $sort_items[$field] = 'ASC';
                    if( count( $exp ) == 2 and $exp[1] =='d' ){
                        $sort_items[$field] = 'DESC';
                    }
                }
            }
            if( count( $sort_items ) > 0 ){
                $sql.= " ORDER BY ";
                $sep = '';
                foreach( $sort_items as $f=>$o ){
                    $sql.= $sep . '"' . $f .'" ' . $o;
                    $sep = ', ';
                }
            }
        }

        // LIMIT
        $maxfeatures = '';
        if( array_key_exists( 'maxfeatures', $this->params ) )
            $maxfeatures = $this->params['maxfeatures'];
        $maxfeatures = filter_var($maxfeatures, FILTER_VALIDATE_INT);
        // !!! validate integer to avoid injection !!!
        if( is_int( $maxfeatures ) ){
            $sql.= " LIMIT " . $maxfeatures;
        }

        // OFFSET
        // !!! validate integer to avoid injection !!!
        $startindex = '';
        if( array_key_exists( 'startindex', $this->params ) )
            $startindex = $this->params['startindex'];
        $startindex = filter_var($startindex, FILTER_VALIDATE_INT);
        if( is_int( $startindex ) ){
            $sql.= " OFFSET " . $startindex;
        }

        // Use PostgreSQL method to export geojson
        $sql = $this->setGeojsonSql($sql);

        // Run query
        try{
            $q = $cnx->query( $sql );
        }catch(Exception $e){
            jLog::log($e->getMessage(), 'error');
            return $this->getfeatureQgis();
        }
        $return = '';
        foreach( $q as $d){
            $geojson =  $d->geojson;
            break;
        }

        // Return response
        return (object) array(
            'code' => '200',
            'mime' => 'text/json; charset=utf-8',
            'data' => $geojson,
            'cached' => False
        );

    }

    private function validateFilter($filter){
        if( preg_match('#;|select|delete|insert|update|drop|alter|from|--|truncate|vacuum|create#i', $filter) ){
            return False;
        }else{
            $filter = str_replace('intersects', 'ST_Intersects', $filter );
            $filter = str_replace('geom_from_gml', 'ST_GeomFromGML', $filter );
            $filter = str_replace('$geometry', '"' . $this->datasource->geocol . '"', $filter );
            return $filter;
        }

    }

    private function setGeojsonSql($sql){
        $sql = "
        WITH source AS (
        ".$sql. "
        )";

        $sql.= "
        SELECT row_to_json(fc, True) AS geojson
        FROM (
            SELECT
                'FeatureCollection' As type,
                array_to_json(array_agg(f)) As features
            FROM (
                SELECT
                    'Feature' AS type,
        ";

        // feature id
        $sql.= " Concat(
            '" . $this->params['typename'] . "',
            '.',
            ";
        $key = $this->datasource->key;
        if( count(explode(',', $key)) == 1 ){
            $sql.= '"' . $key . '"';
        }
        else{
            $sql.= " row_number() OVER() ";
        }
        $sql.= ') AS id,';


        // Get geometryname param
        $geometryname = '';
        if( array_key_exists('geometryname', $this->params ) ){
            $geometryname = $this->params['geometryname'];
        }

        if( $geometryname == 'extent' ){
            $geosql = 'ST_Envelope(lg.geosource)';
        }
        elseif ( $geometryname == 'centroid' ){
            $geosql = 'ST_Centroid(lg.geosource)';
        }
        elseif ( $geometryname == 'none' ){
            $geosql = Null;
        }
        else{
            $geosql = 'lg.geosource';
        }
        if( $geosql ){
            // For new QGIS versions, export into EPSG:4326
            $lizservices = lizmap::getServices();
            $qgisServerVersion = (integer)str_replace('.', '', $lizservices->qgisServerVersion);
            if( $qgisServerVersion >= 218 ){
                $geosql = 'ST_Transform(' . $geosql . ', 4326)';
            }

            // Transform into GeoJSON
            $sql.= "
                        ST_AsGeoJSON(" . $geosql . ")::json As geometry,
            ";
        }

        // bbox
        //$sql.= "
            //trim(regexp_replace( Box2D(" . $geosql . ")::text, 'BOX', ''), '()') AS bbox,
        //";

        $sql.= "
                    row_to_json(
                        ( SELECT l FROM
                            (
                                SELECT ";

        $sql.= '"' . implode( '", "', $this->selectFields ) . '"';
        $sql.= "
                            ) As l
                        )
                    ) As properties
                FROM source As lg
            ) As f
        ) As fc";

        return $sql;
    }
}
