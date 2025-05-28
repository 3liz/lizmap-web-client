<?php

/**
 * Manage OGC request.
 *
 * @author    3liz
 * @copyright 2015 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Request;

/**
 * @see https://en.wikipedia.org/wiki/Web_Feature_Service.
 */
class WFSRequest extends OGCRequest
{
    protected $tplExceptions = 'lizmap~wfs_exception';

    /**
     * @var null|string the requested typename
     */
    protected $wfs_typename;

    /**
     * @var null|\qgisVectorLayer
     */
    protected $qgisLayer;

    /**
     * @var null|object datasource parameters
     */
    protected $datasource;

    protected $selectFields = array();

    protected $blockSqlWords = array(
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
        'create',
    );

    /**
     * @var bool apply edition context for request
     */
    protected $editingContext = false;

    /**
     * @return bool The edition context for request
     */
    public function getEditingContext()
    {
        return $this->editingContext;
    }

    /**
     * Set the edition context for request.
     *
     * @param bool $editingContext The edition context for request
     *
     * @return bool The edition context for request
     */
    public function setEditingContext($editingContext)
    {
        $this->editingContext = $editingContext ? true : false;

        return $this->editingContext;
    }

    public function parameters()
    {
        $params = parent::parameters();

        // Filter data by login if necessary
        // as configured in the plugin for login filtered layers.

        // Filter data by login for request: getfeature
        if (strtolower($this->param('request')) !== 'getfeature') {
            return $params;
        }

        // No filter data by login rights
        if ($this->appContext->aclCheck('lizmap.tools.loginFilteredLayers.override', $this->repository->getKey())) {
            return $params;
        }

        // filter data by login
        $typenames = $this->requestedTypename();
        if (is_string($typenames) && $typenames !== '') {
            $typenames = explode(',', $typenames);
        }

        // get login filters
        $loginFilters = array();

        if (is_array($typenames)) {
            $loginFilters = $this->project->getLoginFilters($typenames, $this->editingContext);
        }

        // login filters array is empty
        if (empty($loginFilters)) {
            return $params;
        }

        // filter by polygon: no need to add the expression here as it is done QGIS Server side
        // or in the method getfeaturePostgres
        // filter by polygon is compatible for
        // QGIS >= 3.10 and LWC >= 3.5 and Lizmap plugin >= 3.6.x

        // Initialize the list of filters to add
        $expFilters = array();

        // Get client exp_filter parameter
        $clientExpFilter = $this->param('exp_filter', '');
        if (!empty($clientExpFilter)) {
            $expFilters[] = '( '.$clientExpFilter.' )';
        }

        // Merge login filter
        $attribute = '';
        foreach ($loginFilters as $lfilter) {
            $expFilters[] = '( '.$lfilter['filter'].' )';
            $attribute = $lfilter['filterAttribute'];
        }

        // Update exp_filter parameter
        $params['exp_filter'] = implode(' AND ', $expFilters);

        // Update propertyname parameter
        $propertyName = $this->param('propertyname', '');
        if (!empty($propertyName)) {
            $propertyName = trim($propertyName).",{$attribute}";
            $params['propertyname'] = $propertyName;
        }

        return $params;
    }

    /**
     * Get the requested typename based on TYPENAME or FEATUREID parameter.
     *
     * @return string the requested typename
     */
    public function requestedTypename()
    {
        if (!is_string($this->wfs_typename)) {
            $typename = $this->param('typename', '');
            if (!$typename) {
                $featureid = $this->param('featureid', '');
                if ($featureid) {
                    $featureIds = explode(',', $featureid);
                    $typenames = array();
                    foreach ($featureIds as $fid) {
                        $exp_fid = explode('.', $fid);
                        if (count($exp_fid) == 2) {
                            $typenames[] = trim($exp_fid[0]);
                        }
                    }
                    $typenames = array_unique($typenames);
                    $typename = implode(',', $typenames);
                }
            }
            $this->wfs_typename = $typename;
        }

        return $this->wfs_typename;
    }

    /**
     * @return OGCResponse
     *
     * @see https://en.wikipedia.org/wiki/Web_Feature_Service#Static_Interfaces.
     */
    protected function process_getcapabilities()
    {
        $version = $this->param('version');
        // force version if not defined
        if (!$version) {
            $this->params['version'] = '1.0.0';
        }

        $result = parent::process_getcapabilities();

        $data = $result->data;
        if (empty($data) || floor($result->code / 100) >= 4) {
            if (empty($data)) {
                $this->appContext->logMessage('GetCapabilities empty data', 'lizmapadmin');
            } else {
                $this->appContext->logMessage('GetCapabilities result code: '.$result->code, 'lizmapadmin');
            }
            \jMessage::add('Server Error !', 'Error');

            return $this->serviceException();
        }

        if (preg_match('#ServiceExceptionReport#i', $data)) {
            return $result;
        }

        return new OGCResponse($result->code, $result->mime, $data, $result->cached);
    }

    /**
     * @return OGCResponse
     *
     * @see https://en.wikipedia.org/wiki/Web_Feature_Service#Static_Interfaces.
     */
    protected function process_describefeaturetype()
    {
        // Extensions to get aliases and type
        $returnJson = (strtolower($this->param('outputformat', '')) == 'json');
        if ($returnJson) {
            $this->params['outputformat'] = 'XMLSCHEMA';
        }

        // Get remote data
        $response = $this->request();
        $code = $response->code;
        $mime = $response->mime;
        $data = $response->data;

        if ($code < 400 && $returnJson) {
            $jsonData = array();

            $wfs_typename = $this->requestedTypename();
            $layer = $this->project->findLayerByAnyName($wfs_typename);
            if ($layer != null) {

                // Get data from XML
                $go = true;
                // Create a DOM instance
                $xml = $this->loadXmlString($data, 'describeFeatureType');
                if (!$xml) {
                    $go = false;
                }
                if ($go && $xml->complexType) {
                    $typename = (string) $xml->complexType->attributes()->name;
                    if ($typename == $wfs_typename.'Type') {
                        $jsonData['name'] = $layer->name;
                        $columns = array();
                        $types = array();
                        $elements = $xml->complexType->complexContent->extension->sequence->element;
                        foreach ($elements as $element) {
                            $columns[] = (string) $element->attributes()->name;
                            $types[(string) $element->attributes()->name] = (string) $element->attributes()->type;
                        }
                        $jsonData['columns'] = (object) $columns;
                        $jsonData['types'] = (object) $types;
                    }
                }

                /** @var \qgisVectorLayer $layer The QGIS vector layer instance */
                $layer = $this->project->getLayer($layer->id);
                $jsonData['aliases'] = (object) $layer->getAliasFields();
                $jsonData['defaults'] = (object) $layer->getDefaultValues();
            }
            $data = json_encode((object) $jsonData);
            $mime = 'application/json; charset=utf-8';
        }

        return new OGCResponse($code, $mime, $data);
    }

    /**
     * @return OGCResponse
     *
     * @see https://en.wikipedia.org/wiki/Web_Feature_Service#Static_Interfaces.
     */
    protected function process_getfeature()
    {
        if ($this->requestXml !== null) {
            return $this->getfeatureQgis();
        }

        // Get type name
        $typename = $this->requestedTypename();
        if (!$typename) {
            \jMessage::add('TYPENAME or FEATUREID is mandatory', 'RequestNotWellFormed');

            return $this->serviceException();
        }

        // add outputformat if not provided
        $output = $this->param('outputformat');
        if (!$output) {
            $output = $this->params['outputformat'] = 'GML2';
        }

        // Get Lizmap layer config
        $lizmapLayer = $this->project->findLayerByTypeName($typename);
        if (!$lizmapLayer) {
            \jMessage::add('The layer '.$typename.' does not exists !', 'Error');

            return $this->serviceException();
        }

        /** @var \qgisVectorLayer $qgisLayer The QGIS vector layer instance */
        $qgisLayer = $this->project->getLayer($lizmapLayer->id);
        $this->qgisLayer = $qgisLayer;

        // Get provider
        $provider = $qgisLayer->getProvider();
        $dtparams = null;
        if ($provider == 'postgres') {
            $dtparams = $qgisLayer->getDatasourceParameters();
            // Add key if not present ( WFS need to export id = typename.id for each feature)
            // To be sure to get the primary keys even if there is an issue in QGIS Server
            $propertyname = $this->param('propertyname', '');
            if (!empty($propertyname)) {
                $pfields = explode(',', $propertyname);
                $key = $dtparams->key;
                $keys = explode(',', $key);
                foreach ($keys as $k) {
                    if (!in_array($k, $pfields)) {
                        // prepend primary keys
                        array_unshift($pfields, $k);
                    }
                }
                $this->params['propertyname'] = implode(',', $pfields);
            }
        }

        // Get OGC filter
        $filter = $this->param('filter', '');

        // Use direct SQL query to improve performance for PostgreSQL layer
        // but only of not OGC filter is passed (complex to implement)
        // and only for GeoJSON (specific to Lizmap)
        // and only if it is not a complex query like table="(SELECT ...)"
        // and if FORCE_QGIS parameter is not set to 1
        if ($provider == 'postgres'
            && empty($filter)
            && strtolower($output) == 'geojson'
            && $dtparams !== null
            && $dtparams->table[0] != '('
            && $this->param('force_qgis', '') != '1'
        ) {
            return $this->getfeaturePostgres();
        }

        return $this->getfeatureQgis();
    }

    /**
     * Queries Qgis Server for getFeature.
     *
     * @return OGCResponse
     *
     * @see https://en.wikipedia.org/wiki/Web_Feature_Service#Static_Interfaces
     */
    protected function getfeatureQgis()
    {
        // In the WFS OGC standard FEATUREID and BBOX parameters cannot be mutually set
        // but in Lizmap, the user can do a selection, based on featureid, and can request
        // a download, a WFS GetFeature request, based on this selection with a restriction
        // to map extent, so featureid and bbox parameter can be set mutually and featureid
        // parameter needs to be transformed into an expression filter.
        // The transformation is only available if the QGIS layer has been set.
        if ($this->param('featureid')
            && $this->param('bbox')
            && $this->qgisLayer) {
            $typename = $this->requestedTypename();
            $featureid = $this->param('featureid', '');

            $expFilter = $this->getFeatureIdFilterExp($featureid, $typename, $this->qgisLayer);

            // Update parameters when expression filter has been build
            if ($expFilter) {
                $this->params['exp_filter'] = $expFilter;
                $this->params['typename'] = $typename;
                unset($this->params['featureid']);
            }
        }

        // Else pass query to QGIS Server
        // Get remote data
        return $this->request(true, true);
    }

    /**
     * @param string           $featureid The FEATUREID parameter
     * @param string           $typename  The layer's typename from TYPENAME or FEATUREID parameter
     * @param \qgisVectorLayer $qgisLayer The QGIS layer based on typename
     *
     * @return string The QGIS expression based on FEATUREID parameter
     */
    protected function getFeatureIdFilterExp($featureid, $typename, $qgisLayer)
    {
        if (empty($featureid)) {
            return '';
        }
        // Get QGIS Layer provider
        $provider = $qgisLayer->getProvider();

        // The featureid is based on multi fields key
        $hasDoubleAtSign = !empty(strstr($featureid, '@@'));

        // We can only build expression filter for multi
        // fields key for postgres layer
        if ($hasDoubleAtSign && $provider != 'postgres') {
            return '';
        }

        // get primary keys values
        $fids = preg_split('/\s*,\s*/', $featureid);
        $pks = array();
        foreach ($fids as $fid) {
            $exp = explode('.', $fid);
            if (count($exp) == 2 && $exp[0] == $typename && !empty($exp[1])) {
                if ($hasDoubleAtSign) {
                    $pks[] = explode('@@', $exp[1]);
                } else {
                    $pks[] = $exp[1];
                }
            }
        }

        if (count($pks) == 0) {
            return '';
        }

        // mapping primary keys values to be used in an
        // expression filter
        if (!$hasDoubleAtSign) {
            // for single field key
            $pks = array_map(
                function ($n) {
                    if (ctype_digit($n)) {
                        return $n;
                    }

                    return "'".addslashes($n)."'";
                },
                $pks
            );
        } else {
            // for multi fields key
            $formatPks = array();
            foreach ($pks as $pk) {
                $formatPks[] = array_map(
                    function ($n) {
                        if (ctype_digit($n)) {
                            return $n;
                        }

                        return "'".addslashes($n)."'";
                    },
                    $pk
                );
            }
            $pks = $formatPks;
        }

        // Building the expression filter
        $expFilter = '';
        if ($provider == 'postgres') {
            // for postgres layer we can build the expression filter for
            // simple and multi fields key
            $dtparams = $qgisLayer->getDatasourceParameters();
            $keys = preg_split('/\s*,\s*/', $dtparams->key);
            if (count($keys) == 1 && !$hasDoubleAtSign) {
                // for simple field key
                $expFilter = '"'.$keys[0].'" IN ('.implode(', ', $pks).')';
            }
            if (count($keys) > 1 && $hasDoubleAtSign) {
                // for multi fields key
                $filters = array();
                foreach ($pks as $pk) {
                    $filter = '(';
                    $i = 0;
                    $v = '';
                    foreach ($keys as $key) {
                        $filter .= $v.'"'.$key.'" = '.$pk[$i].'';
                        $v = ' AND ';
                        ++$i;
                    }
                    $filter .= ')';
                    $filters[] = $filter;
                }

                $expFilter = implode(' OR ', $filters);
            }
        } else {
            // for other layers with simple field key
            $expFilter = '$id IN ('.implode(', ', $pks).')';
        }

        if ($expFilter && $this->validateExpressionFilter($expFilter)) {
            return $expFilter;
        }

        return '';
    }

    protected function buildQueryBase($cnx, $params, $wfsFields)
    {
        $sql = ' SELECT ';
        $propertyname = '';
        if (array_key_exists('propertyname', $params)) {
            $propertyname = $params['propertyname'];
        }
        if (!empty($propertyname)) {
            $sfields = array();
            $pfields = explode(',', $propertyname);
            foreach ($pfields as $pfield) {
                if (in_array($pfield, $wfsFields)) {
                    $sfields[] = $pfield;
                }
            }
        } else {
            $sfields = $wfsFields;
        }
        // Add key if not present ( WFS need to export id = typename.id for each feature)
        $key = $this->datasource->key;
        $keys = explode(',', $key);
        foreach ($keys as $k) {
            if (!in_array($k, $sfields)) {
                $sfields[] = $k;
            }
        }
        // deduplicate columns to avoid SQL errors
        $sfields = array_values(array_unique($sfields));

        $this->selectFields = array_map(function ($item) use ($cnx) {
            return $cnx->encloseName($item);
        }, $sfields);

        $sql .= implode(', ', $this->selectFields);

        // Get spatial field
        $geometryname = '';
        if (array_key_exists('geometryname', $params)) {
            $geometryname = strtolower($params['geometryname']);
        }
        $geocol = $this->datasource->geocol;
        if (!empty($geocol) && $geometryname !== 'none') {
            $geocolalias = 'geosource';
            $sql .= ', '.$cnx->encloseName($geocol).' AS '.$cnx->encloseName($geocolalias);
        }

        // FROM
        $sql .= ' FROM '.$this->datasource->table;

        return $sql;
    }

    /**
     * Get the SQL clause to instersects bbox in the request parameters.
     *
     * @param array<string, string> $params the request parameters
     *
     * @return string the SQL clause to instersects bbox in the request parameters or empty string
     */
    protected function getBboxSql($params)
    {
        if (empty($this->datasource->geocol)) {
            // No geometry column
            return '';
        }

        if (!array_key_exists('bbox', $params)) {
            // No BBOX parameter in the request
            return '';
        }

        $bbox = $params['bbox'];
        if (empty($bbox)) {
            // BBOX parameter but it is empty
            return '';
        }

        // Check the BBOX parameter
        // It has to contain 4 numeric separated by comma
        $bboxitem = explode(',', $bbox);
        if (count($bboxitem) !== 4) {
            // BBOX parameter does not contain 4 elements
            return '';
        }

        // Check numeric elements
        foreach ($bboxitem as $coord) {
            if (!is_numeric(trim($coord))) {
                return '';
            }
        }

        $layerSrid = $this->qgisLayer->getSrid();
        $srid = $this->qgisLayer->getSrid();
        if (array_key_exists('srsname', $params)) {
            $srsname = $params['srsname'];
            if (!empty($srsname)) {
                // SRSNAME parameter is not empty
                // extracting srid
                $exp_srsname = explode(':', $srsname);
                $srsname_id = end($exp_srsname);
                if (ctype_digit($srsname_id)) {
                    $srid = intval($srsname_id);
                } else {
                    return '';
                }
            }
        }

        // Build the SQL
        $xmin = trim($bboxitem[0]);
        $ymin = trim($bboxitem[1]);
        $xmax = trim($bboxitem[2]);
        $ymax = trim($bboxitem[3]);

        $makeEnvelopeSql = 'ST_MakeEnvelope('.$xmin.','.$ymin.','.$xmax.','.$ymax.', '.$srid.')';
        if ($srid != $layerSrid) {
            $makeEnvelopeSql = 'ST_Transform('.$makeEnvelopeSql.', '.$layerSrid.')';
        }

        $sql = ' AND ST_Intersects("';
        $sql .= $this->datasource->geocol;
        $sql .= '", '.$makeEnvelopeSql.')';

        return $sql;
    }

    protected function parseExpFilter($cnx, $params)
    {
        $exp_filter = '';
        if (array_key_exists('exp_filter', $params)) {
            $exp_filter = $params['exp_filter'];
        }
        if (!empty($exp_filter)) {
            $validFilter = $this->validateFilter($exp_filter);
            if (!$validFilter) {
                return false;
            }
            if (strpos($validFilter, '$id') !== false) {
                $key = $this->datasource->key;
                if (count(explode(',', $key)) == 1) {
                    return ' AND ( '.str_replace('$id ', $cnx->encloseName($key).' ', $validFilter).' ) ';
                }

                return false;
            }

            return ' AND ( '.$validFilter.' ) ';
        }

        return '';
    }

    protected function parseFeatureId($cnx, $params)
    {
        $featureid = '';
        $sql = '';
        $typename = $this->requestedTypename();
        $keys = explode(',', $this->datasource->key);
        if (array_key_exists('featureid', $params)) {
            $featureid = $params['featureid'];
        }
        if (!empty($featureid)) {
            $fids = explode(',', $featureid);
            $fidsSql = array();
            foreach ($fids as $fid) {
                $exp = explode('.', $fid);
                if (count($exp) == 2 and $exp[0] == $typename) {
                    $fidSql = '(';
                    $pks = explode('@@', $exp[1]);
                    $i = 0;
                    $v = '';
                    foreach ($keys as $key) {
                        $fidSql .= $v.$cnx->encloseName($key).' = ';
                        if (ctype_digit($pks[$i])) {
                            $fidSql .= $pks[$i];
                        } else {
                            $fidSql .= $cnx->quote($pks[$i]);
                        }
                        $v = ' AND ';
                        ++$i;
                    }
                    $fidSql .= ')';
                    $fidsSql[] = $fidSql;
                }
            }
            // $this->appContext->logMessage(implode(' OR ', $fidsSql), 'error');
            $sql .= ' AND '.implode(' OR ', $fidsSql);
        }

        return $sql;
    }

    protected function getQueryOrder($cnx, $params, $wfsFields)
    {
        // séparé par virgule, et fini par espace + a ou d
        // si pas de a ou d , c'est a
        // SortBY=id a,name d
        $sortby = '';
        $sql = '';
        if (array_key_exists('sortby', $params)) {
            $sortby = $params['sortby'];
        }
        if (!empty($sortby)) {
            $sort_items = array();
            $items = explode(',', $sortby);
            foreach ($items as $item) {
                // !!! Validate on fields to avoid injection !!!
                $exp = explode(' ', $item);
                $field = $exp[0];
                if (in_array($field, $wfsFields)) {
                    $sort_items[$field] = 'ASC';
                    if (count($exp) == 2 and $exp[1] == 'd') {
                        $sort_items[$field] = 'DESC';
                    }
                }
            }
            if (count($sort_items) > 0) {
                $sql .= ' ORDER BY ';
                $sep = '';
                foreach ($sort_items as $f => $o) {
                    $sql .= $sep.$cnx->encloseName($f).' '.$o;
                    $sep = ', ';
                }
            }
        }

        return $sql;
    }

    /**
     * Queries The PostGreSQL Server for getFeature.
     *
     * @return OGCResponse
     *
     * @see https://en.wikipedia.org/wiki/Web_Feature_Service#Static_Interfaces
     */
    protected function getfeaturePostgres()
    {
        $params = $this->parameters();

        // Get database connexion for this layer
        $cnx = $this->qgisLayer->getDatasourceConnection();
        // Get datasource
        $this->datasource = $this->qgisLayer->getDatasourceParameters();

        // Get Db fields
        try {
            $dbFields = $this->qgisLayer->getDbFieldList();
        } catch (\Exception $e) {
            return $this->getfeatureQgis();
        }

        // Verifying that the datasource key is a db fields
        if (!array_key_exists($this->datasource->key, $dbFields)) {
            return $this->getfeatureQgis();
        }

        // Get WFS fields
        $wfsFields = $this->qgisLayer->getWfsFields();

        // Verifying that every wfs fields are db fields
        // if not return getfeatureQgis
        foreach ($wfsFields as $field) {
            if (!array_key_exists($field, $dbFields)) {
                return $this->getfeatureQgis();
            }
        }

        // Build SQL
        $sql = $this->buildQueryBase($cnx, $params, $wfsFields);

        // WHERE
        $sql .= ' WHERE True';

        $dtsql = trim($this->datasource->sql);
        if (!empty($dtsql)) {
            $sql .= ' AND '.$dtsql;
        }

        // BBOX
        $sql .= $this->getbboxSql($params);

        // EXP_FILTER
        // This also include the filter by login, as done above in the function "parameters"
        $expFilterSql = $this->parseExpFilter($cnx, $params);
        if ($expFilterSql === false) {
            // Do not use direct SQL query to PostgreSQL but a request to QGIS Server
            return $this->getfeatureQgis();
        }
        $sql .= $expFilterSql;

        // Filter by polygon
        $polygonFilter = $this->qgisLayer->getPolygonFilter($this->editingContext, 5);
        if ($polygonFilter) {
            $sql .= ' AND ( '.$polygonFilter.' ) ';
        }

        // FEATUREID
        $sql .= $this->parseFeatureId($cnx, $params);

        // ORDER BY
        $sql .= $this->getQueryOrder($cnx, $params, $wfsFields);

        // LIMIT
        $maxfeatures = '';
        if (array_key_exists('maxfeatures', $params)) {
            $maxfeatures = $params['maxfeatures'];
        }
        $maxfeatures = filter_var($maxfeatures, FILTER_VALIDATE_INT);
        // !!! validate integer to avoid injection !!!
        if (is_int($maxfeatures)) {
            $sql .= ' LIMIT '.$maxfeatures;
        }

        // OFFSET
        // !!! validate integer to avoid injection !!!
        $startindex = '';
        if (array_key_exists('startindex', $params)) {
            $startindex = $params['startindex'];
        }
        $startindex = filter_var($startindex, FILTER_VALIDATE_INT);
        if (is_int($startindex)) {
            $sql .= ' OFFSET '.$startindex;
        }

        $typename = $this->requestedTypename();
        $geometryname = '';
        if (array_key_exists('geometryname', $params)) {
            $geometryname = strtolower($params['geometryname']);
        }

        // $this->appContext->logMessage($sql);
        // Use PostgreSQL method to export geojson
        $sql = $this->setGeojsonSql($sql, $cnx, $typename, $geometryname);

        // $this->appContext->logMessage($sql);
        // Run query
        try {
            $q = $cnx->query($sql);
        } catch (\Exception $e) {
            $this->appContext->logException($e, 'lizmapadmin');

            return $this->getfeatureQgis();
        }

        return new OGCResponse(200, 'application/vnd.geo+json; charset=utf-8', (function () use ($q) {
            yield '{"type": "FeatureCollection", "features": [';
            $virg = '';
            foreach ($q as $d) {
                yield $virg.$d->geojson;
                $virg = ',';
            }

            yield ']}';
        })());
    }

    /**
     * Validate an expression filter.
     *
     * @param string $filter The expression filter to validate
     *
     * @return bool returns if the expression does not contains dangerous chars
     */
    protected function validateExpressionFilter($filter)
    {
        $block_items = array();
        if (preg_match('#'.implode('|', $this->blockSqlWords).'#i', $filter, $block_items)) {
            $this->appContext->logMessage('The EXP_FILTER param contains dangerous chars : '.implode(', ', $block_items), 'lizmadmin');

            return false;
        }

        return true;
    }

    /**
     * Parses and validate a filter for postgresql.
     *
     * @param string $filter The filter to parse
     *
     * @return false|string returns the validate filter if the expression does not contains dangerous chars
     */
    protected function validateFilter($filter)
    {
        if (!$this->validateExpressionFilter($filter)) {
            return false;
        }
        $vfilter = str_replace('intersects', 'ST_Intersects', $filter);
        $vfilter = str_replace('geom_from_gml', 'ST_GeomFromGML', $vfilter);

        return str_replace('$geometry', '"'.$this->datasource->geocol.'"', $vfilter);
    }

    /**
     * @param string         $sql
     * @param \jDbConnection $cnx
     * @param mixed          $typename
     * @param mixed          $geometryname
     *
     * @return string
     */
    private function setGeojsonSql($sql, $cnx, $typename, $geometryname)
    {
        $sql = '
        WITH source AS (
        '.$sql.'
        )';

        $sql .= "
        --SELECT row_to_json(fc, True) AS geojson
        --FROM (
        --    SELECT
        --        'FeatureCollection' As type,
        --        array_to_json(array_agg(f)) As features
        SELECT row_to_json(f, True) AS geojson
            FROM (
                SELECT
                    'Feature' AS type,
        ";

        // feature id
        // The feature ID is very fragile
        // it needs to be an integer, and only one columnn, and must be unique
        // this means some Lizmap features won't work with multiple keys or string ids
        // for example when using a filter clause in this query, row_number() will be false
        $sql .= ' Concat(
            '.$cnx->quote($typename).",
            '.',
            ";
        $key = $this->datasource->key;

        if (count(explode(',', $key)) == 1) {
            $sql .= $cnx->encloseName($key);
        } else {
            $sql .= ' row_number() OVER() ';
        }
        $sql .= ') AS id,';

        // Get geometryname param
        $geosql = '';
        if (!empty($this->datasource->geocol)) {
            // use PostGIS functions to change geometry based on geometryname
            if ($geometryname === 'extent') {
                $geosql = 'ST_Envelope(lg.geosource::geometry)';
            } elseif ($geometryname === 'centroid') {
                $geosql = 'ST_Centroid(lg.geosource::geometry)';
            } elseif ($geometryname === 'none') {
                $geosql = null;
            } else {
                $geosql = 'lg.geosource::geometry';
            }
        }

        if (!empty($geosql)) {
            // Define BBOX SQL
            $bboxsql = 'ST_Envelope(lg.geosource::geometry)';
            // For new QGIS versions, export into EPSG:4326
            $lizservices = $this->services;
            $geosql = 'ST_Transform('.$geosql.', 4326)';
            $bboxsql = 'ST_Transform('.$bboxsql.', 4326)';

            // Transform BBOX into JSON
            $sql .= '
                        array_to_json(ARRAY[
                            ST_XMin('.$bboxsql.'),
                            ST_YMin('.$bboxsql.'),
                            ST_XMax('.$bboxsql.'),
                            ST_YMax('.$bboxsql.')
                        ]) As bbox,
            ';

            // Transform into GeoJSON
            $sql .= '
                        ST_AsGeoJSON('.$geosql.')::json As geometry,
            ';
        } else {
            $sql .= '
                        Null As geometry,
            ';
        }

        // bbox
        // $sql.= "
        // trim(regexp_replace( Box2D(" . $geosql . ")::text, 'BOX', ''), '()') AS bbox,
        // ";

        $sql .= '
                    row_to_json(
                        ( SELECT l FROM
                            (
                                SELECT ';

        $sql .= implode(', ', $this->selectFields);
        $sql .= '
                            ) As l
                        )
                    ) As properties
                FROM source As lg
            ) As f
        --) As fc';

        return $sql;
    }
}
