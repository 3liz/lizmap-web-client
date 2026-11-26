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

use Lizmap\App\SqlTools;

/**
 * @see https://en.wikipedia.org/wiki/Web_Feature_Service.
 */
class WFSRequest extends OGCRequest
{
    /**
     * Default output SRID when no SRSNAME is provided on the WFS GetFeature request
     * (EPSG:4326 — the historical WFS default).
     */
    protected const DEFAULT_OUTPUT_SRID = 4326;

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

    /**
     * @var string[] the fields to select
     */
    protected $selectFields = array();

    /**
     * @var null|array{key: string, result: false|string} the last parsed expression filter,
     *                                                    see parseExpFilter()
     */
    private $parsedExpFilter;

    /**
     * @var array<string, string> Generic GetFeature request parameters
     */
    public static $genericGetFeatureParameters = array(
        'SERVICE' => 'WFS',
        'VERSION' => '1.0.0',
        'REQUEST' => 'GetFeature',
        'OUTPUTFORMAT' => 'GeoJSON',
    );

    /**
     * @var array<string, string> The special hits GetFeature request parameters to get number of features
     */
    public static $hitsGetFeatureParameters = array(
        'RESULTTYPE' => 'hits',
    );

    /**
     * Build GetFeature request parameters for a type name and optional other parameters.
     *
     * @param string                  $typeName        The type name of features
     * @param (array<string, string>) $otherParameters Other parameters to add to the request
     *
     * @return array<string, string> The parameters
     */
    public static function buildGetFeatureParameters(string $typeName, array $otherParameters = array()): array
    {
        return array_merge(
            self::$genericGetFeatureParameters,
            array(
                'TYPENAME' => $typeName,
            ),
            $otherParameters,
        );
    }

    /**
     * Build GetFeature request parameters to get number of features
     * for a type name and optional other parameters.
     *
     * @param string                $typeName        The type name of features
     * @param array<string, string> $otherParameters Optional, other parameters to add to the request
     *
     * @return array<string, string> The parameters
     */
    public static function buildGetFeatureHitsParameters(string $typeName, array $otherParameters = array()): array
    {
        return array_merge(
            self::buildGetFeatureParameters($typeName),
            array(
                'RESULTTYPE' => 'hits',
            ),
            $otherParameters,
        );
    }

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
    public function setEditingContext(bool $editingContext): bool
    {
        $this->editingContext = $editingContext;

        return $this->editingContext;
    }

    /**
     * Provide the parameters with the lizmap extra parameters for filtering the request.
     *
     * Lizmap_User, Lizmap_User_Groups, Lizmap_Override_Filter
     * have been added to the OGC request parameters.
     * The filter by login is not added to the EXP_FILTER parameter: it is applied
     * by the lizmap_server plugin of QGIS Server, and added as a SQL filter
     * when the data is queried directly in the database, see getWhereClause().
     *
     * @return array<string, string> the WFS request parameters with Lizmap extra parameters for filtering request
     */
    public function parameters(): array
    {
        return parent::parameters();
    }

    /**
     * Get the SQL filters by login of the requested layers.
     *
     * They are used when the data is queried directly in the database.
     * Otherwise, the filter by login is applied by the lizmap_server plugin of QGIS Server.
     *
     * @return array the filters by login, by layer name, empty if the user can override them
     */
    protected function getRequestLoginFilters(): array
    {
        // No filter data by login rights
        if ($this->appContext->aclCheck('lizmap.tools.loginFilteredLayers.override', $this->repository->getKey())) {
            return array();
        }

        // Requested layers
        $typenames = $this->requestedTypename();
        if (is_string($typenames) && $typenames !== '') {
            $typenames = explode(',', $typenames);
        }
        if (!is_array($typenames)) {
            return array();
        }

        return $this->project->getLoginFilters($typenames, $this->editingContext, true);
    }

    /**
     * Get the requested typename based on TYPENAME or FEATUREID parameter.
     *
     * @return string the requested typename
     */
    public function requestedTypename(): string
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
     * @return int An HTTP code
     */
    public function checkingTypename(): int
    {
        $wfsLayerIds = $this->project->getWfsLayerIds();
        // No layers published in WFS
        if (empty($wfsLayerIds)) {
            \jLog::log('No WFS layer available in project', 'error');
            // Add a message for service exception report
            \jMessage::add('No TYPENAME available', 'OperationNotSupported');

            return 400;
        }

        $typenames = $this->requestedTypename();
        // No typename given
        if (!$typenames || !is_string($typenames)) {
            if ($this->param('request') === 'getfeature') {
                \jMessage::add('TYPENAME or FEATUREID is mandatory', 'RequestNotWellFormed');
            } else {
                \jMessage::add('TYPENAME is mandatory', 'RequestNotWellFormed');
            }

            return 400;
        }

        // Get user groups to check layouts, layers visibility and layers export permissions
        $userGroups = array('');
        if ($this->appContext->userIsConnected()) {
            $userGroups = $this->appContext->aclUserGroupsId();
        }

        $typenames = explode(',', $typenames);
        foreach ($typenames as $typename) {
            $layer = $this->project->findLayerByAnyName($typename);
            // Layer not found
            if (!$layer) {
                \jMessage::add('TYPENAME \''.$typename.'\' is not available', 'RequestNotWellFormed');

                return 400;
            }
            // Layer not published in WFS
            if (!in_array($layer->id, $wfsLayerIds)) {
                \jMessage::add('TYPENAME \''.$typename.'\' is not available', 'RequestNotWellFormed');

                return 400;
            }

            // no group_visibility config, nothing to do
            if (!property_exists($layer, 'group_visibility')
                || empty($layer->group_visibility)) {
                continue;
            }

            // get group visibility as trimmed array
            $groupVisibility = array_map('trim', $layer->group_visibility);
            // check if user groups and the group visibility have no common values (disjoint)
            if (count(array_intersect($userGroups, $groupVisibility)) == 0) {
                if ($this->appContext->userIsConnected()) {
                    // Forbidden : user has no right to see the layer
                    \jMessage::add('Access forbidden to TYPENAME \''.$typename.'\'', 'Forbidden');

                    return 403;
                }
                \jMessage::add('Unauthorized access to TYPENAME \''.$typename.'\'', 'AuthorizationRequired');

                return 401;

            }
        }

        return 200;
    }

    /**
     * @see https://en.wikipedia.org/wiki/Web_Feature_Service#Static_Interfaces.
     */
    protected function process_getcapabilities(): OGCResponse
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
     * @see https://en.wikipedia.org/wiki/Web_Feature_Service#Static_Interfaces.
     */
    protected function process_describefeaturetype(): OGCResponse
    {
        // Checking Typename which is mandatory for DescribeFeatureType
        $typenameCheckingCode = $this->checkingTypename();
        if ($typenameCheckingCode !== 200) {
            return $this->serviceException($typenameCheckingCode);
        }

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

                /** @var \qgisVectorLayer $qgisLayer The QGIS vector layer instance */
                $qgisLayer = $this->project->getLayer($layer->id);
                $jsonData['aliases'] = (object) $qgisLayer->getAliasFields();
                $jsonData['defaults'] = (object) $qgisLayer->getDefaultValues();
            }
            $data = json_encode((object) $jsonData);
            $mime = 'application/json; charset=utf-8';
        }

        return new OGCResponse($code, $mime, $data);
    }

    /**
     * @see https://en.wikipedia.org/wiki/Web_Feature_Service#Static_Interfaces.
     */
    protected function process_getfeature(): OGCResponse
    {
        if ($this->requestXml !== null) {
            return $this->getfeatureQgis();
        }

        // Checking Typename which is mandatory for GetFeature
        // Check only if we are not in the editing context
        // To let editors not publish some vector layers in WFS/OAPIF
        // to fill in the value relation or relation references
        // of some form fields
        if (!$this->editingContext) {
            $typenameCheckingCode = $this->checkingTypename();
            if ($typenameCheckingCode !== 200) {
                return $this->serviceException($typenameCheckingCode);
            }
        }

        // Get type name
        $typename = $this->requestedTypename();

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

        // Use direct SQL query to improve performance for PostgreSQL layer, when possible
        if ($this->getFeatureSqlFailureReason($qgisLayer) === null) {
            return $this->getfeaturePostgres();
        }

        return $this->getfeatureQgis();
    }

    /**
     * Get the table fields of the requested layer, if the GetFeature request is run as SQL.
     *
     * It tells if Lizmap will query PostgreSQL directly instead of QGIS Server
     * for this GetFeature request, so that the request parameters can use database
     * features unknown by QGIS Server, see getFeatureSqlFailureReason().
     *
     * @return null|array<string, \jDbFieldProperties> the table fields of the layer,
     *                                                 null if the request is sent to QGIS Server
     */
    public function getSqlTableFields(): ?array
    {
        // The requested vector layer
        $lizmapLayer = $this->project->findLayerByTypeName($this->requestedTypename());
        if (!$lizmapLayer) {
            return null;
        }
        $layer = $this->project->getLayer($lizmapLayer->id);
        if (!$layer instanceof \qgisVectorLayer) {
            return null;
        }

        // The request must be run as SQL
        if ($this->getFeatureSqlFailureReason($layer) !== null) {
            return null;
        }

        return $layer->getDbFieldList();
    }

    /**
     * Get the reason why the GetFeature request can not be run as SQL by Lizmap.
     *
     * In addition to the conditions of getSqlFailureReason(), the request
     * must ask for GeoJSON with GET parameters, and the primary key must be
     * a single table field, to build the feature ids.
     *
     * @param \qgisVectorLayer $layer The requested layer
     *
     * @return null|string null if the request can be run as SQL, the reason otherwise
     */
    protected function getFeatureSqlFailureReason(\qgisVectorLayer $layer): ?string
    {
        // GeoJSON only (specific to Lizmap) and no XML request
        if ($this->requestXml !== null) {
            return 'XML requests are not supported';
        }
        if (strtolower($this->param('outputformat', '')) != 'geojson') {
            return 'only the GeoJSON output format is supported';
        }

        // Common conditions, the selected fields are checked unless only the features are counted
        $params = $this->parameters();
        $isHitsRequest = array_key_exists('resulttype', $params) && $params['resulttype'] == 'hits';
        $reason = $this->getSqlFailureReason($layer, $isHitsRequest);
        if ($reason !== null) {
            return $reason;
        }

        // The primary key is a table field
        if (!array_key_exists($this->datasource->key, $layer->getDbFieldList())) {
            return 'the primary key is not a table field';
        }

        return null;
    }

    /**
     * Get the reason why the features of a layer can not be requested with SQL by Lizmap.
     *
     * The features are requested directly in PostgreSQL, instead of QGIS Server, if:
     *
     * - the layer is a PostgreSQL table, not a SQL query like table="(SELECT ...)",
     * - the request has no OGC FILTER (complex to implement) and no FORCE_QGIS=1 parameter,
     * - the fields used by the query are table fields, not virtual fields only known by QGIS Server,
     * - the expression filter can be translated to SQL.
     *
     * The layer and its datasource are stored in the qgisLayer and datasource properties.
     *
     * @param \qgisVectorLayer $layer         The requested layer
     * @param bool             $isHitsRequest True if the features are only counted or aggregated:
     *                                        the selected fields are not checked
     *
     * @return null|string null if the features can be requested with SQL, the reason otherwise
     */
    protected function getSqlFailureReason(\qgisVectorLayer $layer, bool $isHitsRequest): ?string
    {
        // Only PostgreSQL layers
        if ($layer->getProvider() != 'postgres') {
            return 'the layer is not a PostgreSQL layer';
        }
        $this->qgisLayer = $layer;

        // No OGC filter, no forced QGIS Server request
        if (!empty($this->param('filter', ''))) {
            return 'OGC FILTER parameter is not supported';
        }
        if ($this->param('force_qgis', '') == '1') {
            return 'QGIS Server is forced';
        }

        // A table, not a SQL query: table="(SELECT ...)"
        $this->datasource = $layer->getDatasourceParameters();
        $table = (string) ($this->datasource->table ?? '');
        if ($table === '' || $table[0] == '(') {
            return 'the layer datasource is not a table';
        }

        // The table fields
        try {
            $dbFields = $layer->getDbFieldList();
        } catch (\Exception $e) {
            return 'the table fields can not be read';
        }
        if (empty($dbFields)) {
            return 'the table fields can not be read';
        }

        // The fields used by the query must be table fields:
        // a virtual field is only known by QGIS Server
        $params = $this->parameters();
        foreach ($this->getQueryFields($params, $layer->getWfsFields(), $isHitsRequest) as $field) {
            if (!array_key_exists($field, $dbFields)) {
                return 'the field "'.$field.'" is not a table field';
            }
        }

        // The expression filter must be translated to SQL
        if ($this->parseExpFilter($layer->getDatasourceConnection(), $params) === false) {
            return 'the expression filter can not be translated to SQL';
        }

        return null;
    }

    /**
     * Queries Qgis Server for getFeature.
     *
     * @see https://en.wikipedia.org/wiki/Web_Feature_Service#Static_Interfaces
     */
    protected function getfeatureQgis(): OGCResponse
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

            // Update parameters when expression filter has been build,
            // keeping the expression filter sent by the client
            if ($expFilter) {
                $this->params['exp_filter'] = $this->mergeExpFilters($this->param('exp_filter', ''), $expFilter);
                $this->params['typename'] = $typename;
                unset($this->params['featureid']);
            }
        }

        // Else pass query to QGIS Server
        // Get remote data
        return $this->request(true, true);
    }

    /**
     * Merge the expression filter sent by the client with another expression filter.
     *
     * Both filters are enclosed with parenthesis, so that an OR operator
     * of a filter does not apply to the other one.
     *
     * @param string $clientFilter The expression filter sent by the client, can be empty
     * @param string $filter       The other expression filter
     *
     * @return string The merged expression filter
     */
    protected function mergeExpFilters(string $clientFilter, string $filter): string
    {
        // No client filter: the other filter only
        if (trim($clientFilter) === '') {
            return $filter;
        }

        return '( '.$clientFilter.' ) AND ( '.$filter.' )';
    }

    /**
     * @param string           $featureid The FEATUREID parameter
     * @param string           $typename  The layer's typename from TYPENAME or FEATUREID parameter
     * @param \qgisVectorLayer $qgisLayer The QGIS layer based on typename
     *
     * @return string The QGIS expression based on FEATUREID parameter
     */
    protected function getFeatureIdFilterExp(string $featureid, string $typename, $qgisLayer): string
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

        if (!$expFilter) {
            return '';
        }

        // Validate the SQL filter
        try {
            SqlTools::parseAndValidateSQLString($expFilter);
        } catch (\Exception $e) {
            $this->appContext->logException($e, 'lizmapadmin');

            return '';
        }

        return $expFilter;
    }

    /**
     * Build the base SQL query to fetch data from the database.
     *
     * @param mixed $cnx           Database connection
     * @param mixed $params        Request parameters
     * @param mixed $wfsFields     List of WFS fields
     * @param bool  $isHitsRequest True if the request must only get the features count
     */
    protected function buildQueryBase($cnx, $params, $wfsFields, $isHitsRequest = false): string
    {
        // For hits requests, no need to get the fields or geometry
        if ($isHitsRequest) {
            return 'SELECT * FROM '.$this->datasource->table;
        }

        $sql = ' SELECT ';
        // Fields requested by PROPERTYNAME, or every WFS field
        $sfields = $this->getSelectedFields($params, $wfsFields);
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
     * Parse a WFS SRSNAME string and return its SRID.
     *
     * Accepts the colon-separated forms used by WFS clients:
     *   "EPSG:4326", "urn:ogc:def:crs:EPSG::4326"
     * The last colon-separated segment must be a positive integer.
     *
     * @param string $srsname the raw SRSNAME value
     *
     * @return null|int the SRID on success, null if the input is empty or malformed
     */
    protected function parseSrsnameSrid(string $srsname): ?int
    {
        if ($srsname === '') {
            return null;
        }
        $parts = explode(':', $srsname);
        $last = end($parts);
        if ($last !== false && ctype_digit($last)) {
            return intval($last);
        }

        return null;
    }

    /**
     * Get the SQL clause to instersects bbox in the request parameters.
     *
     * @param array<string, string> $params the request parameters
     *
     * @return string the SQL clause to instersects bbox in the request parameters or empty string
     */
    protected function getBboxSql(array $params): string
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
        // WFS 1.0.0 sends 4 numeric values; WFS 1.1.0 appends the CRS as a 5th element
        // e.g. "xmin,ymin,xmax,ymax,EPSG:3857"
        $bboxitem = explode(',', $bbox);
        $bboxCount = count($bboxitem);
        if ($bboxCount !== 4 && $bboxCount !== 5) {
            // BBOX parameter does not contain 4 or 5 elements
            return '';
        }

        // Check the 4 coordinate elements are numeric
        for ($i = 0; $i < 4; ++$i) {
            if (!is_numeric(trim($bboxitem[$i]))) {
                return '';
            }
        }

        $layerSrid = $this->qgisLayer->getSrid();
        $srid = $layerSrid;

        // CRS priority: explicit SRSNAME param > 5th BBOX element
        $srsname = null;
        if (array_key_exists('srsname', $params) && !empty($params['srsname'])) {
            $srsname = $params['srsname'];
        } elseif ($bboxCount === 5) {
            $srsname = trim($bboxitem[4]);
        }

        if ($srsname !== null) {
            $parsedSrid = $this->parseSrsnameSrid($srsname);
            if ($parsedSrid !== null) {
                $srid = $parsedSrid;
            } else {
                $this->appContext->logMessage(
                    'WFSRequest::getBboxSql: invalid SRSNAME "'.$srsname.'" — falling back to layer SRID',
                    'lizmapadmin'
                );
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

    /**
     * Get the SQL filter configured in QGIS layer datasource.
     *
     * @return string The SQL filter enclosed with parenthesis
     */
    protected function getDatasourceSql(): string
    {
        // Get the SQL filter from QGIS layer datasource
        $dtsql = trim($this->datasource->sql);

        // Add it
        if (!empty($dtsql)) {
            return ' AND ( '.trim($dtsql).' ) ';
        }

        return '';
    }

    /**
     * Parse the expression filter parameter.
     *
     * @param \jDbConnection $cnx    The database connection
     * @param array          $params The request parameters
     *
     * @return false|string The SQL filter enclosed with parenthesis if the expression filter is valid, false otherwise
     */
    protected function parseExpFilter($cnx, $params): false|string
    {
        if (!array_key_exists('exp_filter', $params)) {
            return '';
        }
        $exp_filter = $params['exp_filter'];
        if (empty($exp_filter)) {
            return '';
        }

        // The filter is parsed once per request: it is checked by getSqlFailureReason()
        // before being used by getWhereClause(), and an invalid filter is logged once
        $cacheKey = serialize(array(
            $exp_filter,
            $this->param('exp_filter', ''),
            $this->datasource->key,
            $this->datasource->geocol ?? '',
        ));
        if ($this->parsedExpFilter !== null && $this->parsedExpFilter['key'] === $cacheKey) {
            return $this->parsedExpFilter['result'];
        }
        $result = $this->translateExpFilter($cnx, $exp_filter);
        $this->parsedExpFilter = array('key' => $cacheKey, 'result' => $result);

        return $result;
    }

    /**
     * Validate the expression filter and translate it to SQL.
     *
     * @param \jDbConnection $cnx       The database connection
     * @param string         $expFilter The expression filter, with the filters merged to the client filter
     *
     * @return false|string The SQL filter enclosed with parenthesis if the expression filter is valid, false otherwise
     */
    private function translateExpFilter($cnx, string $expFilter): false|string
    {
        // The client filter is put between parenthesis and combined with the other filters:
        // it must be valid on its own, so that it cannot get out of its parenthesis
        if (!$this->validateClientExpFilter()) {
            return false;
        }

        $validFilter = $this->validateFilter($expFilter);
        if (!$validFilter) {
            return false;
        }

        // The $id variable is replaced by the primary key column, if it is a single column
        $key = $this->datasource->key;
        $idColumn = (count(explode(',', $key)) == 1) ? $cnx->encloseName($key) : null;
        $sqlFilter = SqlTools::replaceIdVariable($validFilter, $idColumn);
        if ($sqlFilter === null) {
            return false;
        }

        return ' AND ( '.$sqlFilter.' )';
    }

    /**
     * Build the SQL condition matching the FEATUREID parameter.
     *
     * The returned condition is not a single self contained block, it has to be
     * put under paranthesis with an AND operator before being used in a WHERE clause.
     *
     * @param \jDbConnection $cnx    The database connection
     * @param array          $params The request parameters
     *
     * @return string The SQL condition or an empty string
     */
    protected function parseFeatureId($cnx, $params): string
    {
        // No FEATUREID parameter
        if (!array_key_exists('featureid', $params)) {
            return '';
        }

        $featureid = $params['featureid'];
        // No FEATUREID value
        if (empty($featureid)) {
            return '';
        }

        $typename = $this->requestedTypename();
        $keys = explode(',', $this->datasource->key);
        $fids = explode(',', $featureid);

        // Single column primary key: use one IN () clause.
        // A chain of "key = a OR key = b OR ..." forces PostgreSQL to evaluate one
        // expression per feature id and per row, which does not scale when a large
        // selection is exported.
        if (count($keys) == 1) {
            $values = array();
            foreach ($fids as $fid) {
                $exp = explode('.', $fid);
                if (count($exp) == 2 and $exp[0] == $typename) {
                    $pk = explode('@@', $exp[1])[0];
                    $values[] = ctype_digit($pk) ? $pk : $cnx->quote($pk);
                }
            }

            // A FEATUREID matching no feature must not widen the result set
            if (count($values) == 0) {
                return 'FALSE';
            }

            return $cnx->encloseName($keys[0]).' IN ('.implode(', ', $values).')';
        }
        // Multiple columns primary key: one parenthesized block per feature id
        $fidsSql = array();
        foreach ($fids as $fid) {
            $exp = explode('.', $fid);
            if (count($exp) == 2 and $exp[0] == $typename) {
                $fidSql = '';
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
                if ($i !== 1) {
                    $fidsSql[] = '('.$fidSql.')';
                } else {
                    $fidsSql[] = $fidSql;
                }
            }
        }
        // A FEATUREID matching no feature must not widen the result set
        if (count($fidsSql) == 0) {
            return 'FALSE';
        }

        // The OR chain must be parenthesized as a whole, otherwise its members would
        // escape every other AND condition of the WHERE clause: datasource filter,
        // BBOX, EXP_FILTER, filter by login and filter by polygon.
        if (count($fidsSql) == 1) {
            return $fidsSql[0];
        }

        return implode(' OR ', $fidsSql);
    }

    /**
     * Build the SQL WHERE clause for the request.
     *
     * It combines the datasource SQL filter, the BBOX parameter, the EXP_FILTER parameter,
     * and the FEATUREID parameter
     *
     * @param \jDbConnection $cnx    The database connection
     * @param array          $params The request parameters
     *
     * @return false|string The SQL Where clause if the expression filter is valid, false otherwise
     */
    protected function getWhereClause($cnx, $params): false|string
    {
        // WHERE
        $sql = ' WHERE True';

        // Add datasource SQL filter
        $sql .= $this->getDatasourceSql();

        // BBOX
        $sql .= $this->getbboxSql($params);

        // EXP_FILTER sent by the client
        $expFilterSql = $this->parseExpFilter($cnx, $params);
        if ($expFilterSql === false) {
            // Do not use direct SQL query to PostgreSQL but a request to QGIS Server
            return false;
        }
        $sql .= $expFilterSql;

        // Filter by login, as a SQL filter matching exactly the multiple values of the field
        foreach ($this->getRequestLoginFilters() as $loginFilter) {
            $sql .= ' AND '.$loginFilter['filter'];
        }

        // Filter by polygon
        $polygonFilter = $this->qgisLayer->getPolygonFilter($this->editingContext, 5);
        if ($polygonFilter) {
            $sql .= ' AND ( '.$polygonFilter.' )';
        }

        // FEATUREID
        $featureIdsFilter = $this->parseFeatureId($cnx, $params);
        if ($featureIdsFilter) {
            $sql .= ' AND ( '.$featureIdsFilter.' )';
        }

        return $sql;
    }

    /**
     * Build the SQL ORDER BY clause for the request.
     *
     * @param \jDbConnection $cnx       The database connection
     * @param array          $params    The request parameters
     * @param array          $wfsFields The WFS fields
     *
     * @return string The SQL ORDER BY clause
     */
    protected function getQueryOrder($cnx, $params, $wfsFields): string
    {
        $sortItems = $this->getSortFields($params, $wfsFields);
        if (count($sortItems) == 0) {
            return '';
        }

        // Build the ORDER BY clause with the validated fields
        $sql = ' ORDER BY ';
        $sep = '';
        foreach ($sortItems as $f => $o) {
            $sql .= $sep.$cnx->encloseName($f).' '.$o;
            $sep = ', ';
        }

        return $sql;
    }

    /**
     * Get the sort fields and directions requested by the SORTBY parameter.
     *
     * SORTBY is a comma separated list of fields, each one optionally followed
     * by a space and a direction, for example `id a,name d`. The direction is
     * ascending by default. Fields which are not WFS fields are ignored.
     *
     * A field name can be enclosed in double quotes, with inner double quotes
     * doubled, as in QGIS expressions: `"Sewer type" d`. Without quotes, a name
     * with spaces is accepted if the whole item is a WFS field.
     *
     * @param array    $params    The request parameters
     * @param string[] $wfsFields The WFS fields of the layer
     *
     * @return array<string, string> The sort direction, ASC or DESC, by field name
     */
    protected function getSortFields($params, $wfsFields): array
    {
        $sortItems = array();
        if (!array_key_exists('sortby', $params) || empty($params['sortby'])) {
            return $sortItems;
        }

        // Each item: a quoted field name and the rest, or an unquoted item
        preg_match_all('/\s*(?:"((?:[^"]|"")*)"([^,]*)|([^,]+))(?:,|$)/', $params['sortby'], $matches, PREG_SET_ORDER);
        foreach ($matches as $match) {
            if (isset($match[3])) {
                // Unquoted: the whole item is a field, or the direction follows the last space
                $field = trim($match[3]);
                $direction = '';
                $space = strrpos($field, ' ');
                if (!in_array($field, $wfsFields) && $space !== false) {
                    $direction = substr($field, $space + 1);
                    $field = rtrim(substr($field, 0, $space));
                }
            } else {
                // Quoted: the direction follows the closing quote
                $field = str_replace('""', '"', $match[1]);
                $direction = trim($match[2]);
            }

            // !!! Validate on fields to avoid injection !!!
            if (!in_array($field, $wfsFields)) {
                continue;
            }
            // Ascending by default, descending only with an explicit direction
            $sortItems[$field] = 'ASC';
            if (in_array(strtolower($direction), array('d', '+d', 'desc', '+desc'))) {
                $sortItems[$field] = 'DESC';
            }
        }

        return $sortItems;
    }

    /**
     * Get the WFS fields selected by the PROPERTYNAME parameter.
     *
     * Requested fields which are not WFS fields are ignored. Without
     * PROPERTYNAME, every WFS field is selected. The primary keys are not added.
     *
     * @param array    $params    The request parameters
     * @param string[] $wfsFields The WFS fields of the layer
     *
     * @return string[] The selected WFS fields
     */
    protected function getSelectedFields($params, $wfsFields): array
    {
        $propertyname = '';
        if (array_key_exists('propertyname', $params)) {
            $propertyname = $params['propertyname'];
        }
        if (empty($propertyname)) {
            return array_values($wfsFields);
        }

        // Keep only the requested fields published in WFS, in the requested order
        $sfields = array();
        foreach (explode(',', $propertyname) as $pfield) {
            if (in_array($pfield, $wfsFields)) {
                $sfields[] = $pfield;
            }
        }

        return $sfields;
    }

    /**
     * Get the WFS fields the direct SQL query depends on.
     *
     * The query reads the fields selected by PROPERTYNAME (except for a hits request),
     * sorts on the fields of SORTBY and filters on the fields cited in EXP_FILTER.
     * A field is considered cited in EXP_FILTER when its name appears as a whole word,
     * so a name inside a string literal is also returned: the request is then
     * sent to QGIS Server, which is always correct.
     *
     * @param array    $params        The request parameters
     * @param string[] $wfsFields     The WFS fields of the layer
     * @param bool     $isHitsRequest True if the request only counts the features
     *
     * @return string[] The WFS fields used by the SQL query, without duplicates
     */
    protected function getQueryFields($params, $wfsFields, bool $isHitsRequest = false): array
    {
        $fields = array();

        // Fields read by the SELECT clause
        if (!$isHitsRequest) {
            $fields = $this->getSelectedFields($params, $wfsFields);
            // Fields used by the ORDER BY clause
            $fields = array_merge($fields, array_keys($this->getSortFields($params, $wfsFields)));
        }

        // Fields cited by the expression filter, which includes the filter by login
        $expFilter = '';
        if (array_key_exists('exp_filter', $params)) {
            $expFilter = $params['exp_filter'];
        }
        if (!empty($expFilter)) {
            foreach ($wfsFields as $field) {
                $pattern = '/(?<![\p{L}\p{N}_])'.preg_quote($field, '/').'(?![\p{L}\p{N}_])/u';
                if (preg_match($pattern, $expFilter)) {
                    $fields[] = $field;
                }
            }
        }

        return array_values(array_unique($fields));
    }

    /**
     * Queries The PostGreSQL Server for getFeature.
     *
     * @see https://en.wikipedia.org/wiki/Web_Feature_Service#Static_Interfaces
     */
    protected function getfeaturePostgres(): OGCResponse
    {
        $params = $this->parameters();

        // Get database connexion for this layer
        // The layer and its datasource are checked by getFeatureSqlFailureReason()
        $cnx = $this->qgisLayer->getDatasourceConnection();

        // For getFeature with parameter RESULTTYPE=hits
        // We should just return the number of features
        $isHitsRequest = false;
        if (array_key_exists('resulttype', $params) && $params['resulttype'] == 'hits') {
            $isHitsRequest = true;
        }

        // Get WFS fields
        $wfsFields = $this->qgisLayer->getWfsFields();

        // Build SQL
        $sql = $this->buildQueryBase($cnx, $params, $wfsFields, $isHitsRequest);

        // WHERE clause
        $whereClause = $this->getWhereClause($cnx, $params);
        if ($whereClause === false) {
            return $this->getfeatureQgis();
        }
        $sql .= $whereClause;

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

        // Determine the output SRID: explicit SRSNAME param takes priority,
        // then fall back to the CRS suffix of a 5-element WFS 1.1.0 BBOX.
        $outputSrid = self::DEFAULT_OUTPUT_SRID;
        $srsname = null;
        if (array_key_exists('srsname', $params) && !empty($params['srsname'])) {
            $srsname = $params['srsname'];
        } elseif (array_key_exists('bbox', $params)) {
            $bboxParts = explode(',', $params['bbox']);
            if (count($bboxParts) === 5) {
                $srsname = trim($bboxParts[4]);
            }
        }
        if ($srsname !== null) {
            $parsedSrid = $this->parseSrsnameSrid($srsname);
            if ($parsedSrid !== null) {
                $outputSrid = $parsedSrid;
            } else {
                $this->appContext->logMessage(
                    'WFSRequest::getfeaturePostgres: invalid SRSNAME "'.$srsname.'" — falling back to EPSG:'.self::DEFAULT_OUTPUT_SRID,
                    'lizmapadmin'
                );
            }
        }

        // For getFeature with parameter RESULTTYPE=hits
        // We should just return the number of features
        if ($isHitsRequest) {
            $sql = $this->getResultTypeHitsSql($sql);
        } else {
            // Else we should return all corresponding features
            // $this->appContext->logMessage($sql);
            // Use PostgreSQL method to export geojson
            $sql = $this->setGeojsonSql($sql, $cnx, $typename, $geometryname, $outputSrid);
        }

        // $this->appContext->logMessage($sql);
        // Run query
        try {
            $q = $cnx->query($sql);
        } catch (\Exception $e) {
            $this->appContext->logException($e, 'lizmapadmin');

            return $this->getfeatureQgis();
        }

        // For Hits request, get simple result
        if ($isHitsRequest) {
            return new OGCResponse(
                200,
                'application/vnd.geo+json; charset=utf-8',
                (function () use ($q) {
                    yield '{"type": "FeatureCollection", ';
                    foreach ($q as $d) {
                        yield ' "numberOfFeatures": '.$d->numberOfFeatures.', ';

                        yield ' "timeStamp": "'.$d->timeStamp.'" ';

                        break;
                    }

                    yield '}';
                })()
            );
        } else {
            // Standard GetFeature request returning all features
            return new OGCResponse(
                200,
                'application/vnd.geo+json; charset=utf-8',
                (function () use ($q) {
                    yield '{"type": "FeatureCollection", "features": [';
                    $virg = '';
                    foreach ($q as $d) {
                        yield $virg.$d->geojson;
                        $virg = ',';
                    }

                    yield ']}';
                })()
            );
        }
    }

    /**
     * Validate the EXP_FILTER parameter sent by the client, before any combination.
     *
     * The client filter is put between parenthesis and combined with the other
     * filters, e.g. the filter by login. Validating only a combined filter is not
     * enough: a client filter like `1=1 ) OR ( 1=1` would get out of its parenthesis.
     * The client filter is therefore validated alone, so that its parenthesis are
     * balanced, and between parenthesis, so that a final comment cannot hide the
     * closing parenthesis.
     *
     * @return bool true if there is no client filter or if it is valid
     */
    protected function validateClientExpFilter(): bool
    {
        // No client filter
        $clientExpFilter = $this->param('exp_filter', '');
        if (empty($clientExpFilter)) {
            return true;
        }

        // Validate the filter alone, then between parenthesis as when merged
        try {
            SqlTools::parseAndValidateSQLString($clientExpFilter);
            SqlTools::parseAndValidateSQLString('( '.$clientExpFilter.' )');
        } catch (\Exception $e) {
            $this->appContext->logException($e, 'lizmapadmin');

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
    protected function validateFilter(string $filter): false|string
    {
        try {
            SqlTools::parseAndValidateSQLString($filter);
        } catch (\Exception $e) {
            $this->appContext->logException($e, 'lizmapadmin');

            return false;
        }

        return SqlTools::translateExpressionToPostgis($filter, $this->datasource->geocol);
    }

    /**
     * @param string         $sql
     * @param \jDbConnection $cnx
     * @param mixed          $typename
     * @param mixed          $geometryname
     */
    protected function setGeojsonSql($sql, $cnx, $typename, $geometryname, int $outputSrid = 4326): string
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
            // Export geometry in the requested output CRS (defaults to EPSG:4326)
            $geosql = 'ST_Transform('.$geosql.', '.$outputSrid.')';
            $bboxsql = 'ST_Transform('.$bboxsql.', '.$outputSrid.')';

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

    /**
     * Get the SQL used to count the features.
     *
     * This is used for RESULTTYPE=hits
     */
    private function getResultTypeHitsSql(string $sql): string
    {
        $hitsSql = ' SELECT ';
        $hitsSql .= ' count(*) AS "numberOfFeatures", ';
        $hitsSql .= ' to_char(now(), \'YYYY-MM-DD"T"HH24:MI:SS\') AS "timeStamp"';
        $hitsSql .= ' FROM (';
        $hitsSql .= $sql;
        $hitsSql .= ' ) AS hits';

        return $hitsSql;
    }
}
