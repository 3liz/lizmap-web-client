<?php

use Lizmap\App\SqlTools;

/**
 * Manage and give access to lizmap configuration.
 *
 * @author    3liz
 * @copyright 2017 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class filterDatasource
{
    protected $provider = 'postgres';
    private $status = false;
    private $errors = array();
    private $repository;
    private $project;
    private $layerId;
    private $layername;
    private $layer;
    private $datasource;
    private $cnx;
    private $lproj;
    private $config;
    private $data;

    /**
     * @var null|string the SQL conditions restricting the layer data,
     *                  null if not computed yet
     */
    private $restrictionSql;

    /**
     * Create the datasource of a layer used by the filter tools.
     *
     * The status is false, with errors, if the project is not accessible,
     * or if the layer is not a vector layer used by the form filter
     * or the time manager.
     *
     * @param string $repository the repository key
     * @param string $project    the project key
     * @param string $layerId    the layer id
     */
    public function __construct($repository, $project, $layerId)
    {

        // Check filter config
        jClasses::inc('filter~filterConfig');
        $dv = new filterConfig($repository, $project);
        if (!$dv->getStatus()) {
            $this->errors = $dv->getErrors();

            return;
        }
        $config = $dv->getConfig();
        if (empty($config)) {
            $this->errors = $dv->getErrors();

            return;
        }

        $this->repository = $repository;
        $this->project = $project;
        $this->layerId = $layerId;
        $this->lproj = lizmap::getProject($repository.'~'.$project);
        $this->config = $dv->getConfig();

        // Only the layers used by the form filter or the time manager can be queried
        if (!in_array($layerId, $this->getFilterLayerIds(), true)) {
            $this->errors = array(
                'status' => 'error',
                'title' => 'Invalid Query Parameter',
                'detail' => 'The layer '.$this->layerId.' is not configured for the filter tools',
            );

            return;
        }

        // The layer must exist in the project, and be a vector layer
        $layer = $this->lproj->getLayer($layerId);
        if (!$layer instanceof qgisVectorLayer) {
            $this->errors = array(
                'status' => 'error',
                'title' => 'Invalid Query Parameter',
                'detail' => 'The layer '.$this->layerId.' is not a vector layer of the project',
            );

            return;
        }
        $this->status = true;
        $this->layer = $layer;
        $this->layername = $layer->getName();

        $this->datasource = $layer->getDatasourceParameters();
        $this->cnx = $layer->getDatasourceConnection();

        // Get layer type
        $this->provider = $layer->getProvider();
    }

    /**
     * Get the ids of the layers which can be queried by the filter tools.
     *
     * These are the layers of the form filter configuration,
     * and the layers of the time manager, which uses the filter service
     * to get the min and max values of its date fields.
     *
     * @return string[] the layer ids
     */
    private function getFilterLayerIds()
    {
        $layerIds = array();

        // Layers of the form filter, configured field by field
        foreach ((array) $this->config as $fieldConfig) {
            if (is_object($fieldConfig) && property_exists($fieldConfig, 'layerId')) {
                $layerIds[] = $fieldConfig->layerId;
            }
        }

        // Layers of the time manager
        foreach ((array) $this->lproj->getTimemanagerLayersConfig() as $layerConfig) {
            if (is_object($layerConfig) && property_exists($layerConfig, 'layerId')) {
                $layerIds[] = $layerConfig->layerId;
            }
        }

        return array_values(array_unique($layerIds));
    }

    public function getStatus()
    {
        return $this->status;
    }

    public function getErrors()
    {
        return $this->errors;
    }

    /**
     * Validate the SQL filter.
     *
     * If it is not valid, we return 1>2 to force the return of empty data
     *
     * @param string $filter The SQL filter
     *
     * @return string The processed filter
     */
    private function validateFilter($filter)
    {
        // Return null if filter is null
        if (!$filter) {
            return '';
        }

        // For Spatialite and GeoPackage, replace ILIKE with LIKE
        if ($this->provider != 'postgres') {
            $filter = str_replace(' ILIKE ', ' LIKE ', $filter);
        }

        // If an error occurred, return a filter which will return no data
        $badFilter = ' 1>2 ';

        // Validate the SQL filter
        try {
            SqlTools::parseAndValidateSQLString($filter);
        } catch (Exception $e) {
            jLog::log('The EXP_FILTER param contains dangerous chars : '.$e->getMessage().' No data are returned !', 'lizmapadmin');

            return $badFilter;
        }

        return SqlTools::translateExpressionToPostgis($filter, $this->datasource->geocol);
    }

    /**
     * Get the SQL conditions restricting the layer data.
     *
     * The data returned by the filter service must be the same as the data
     * the user can get with WFS: the datasource SQL filter is applied, and,
     * unless the user can override them, the filter by login and the filter
     * by polygon configured in the Lizmap plugin.
     *
     * The filter by polygon is computed by the Lizmap plugin of QGIS Server.
     * If the request fails, the plugin helper returns a filter returning no
     * data, so that no feature is exposed.
     *
     * @return string the SQL conditions, each one starting with " AND ",
     *                or an empty string if the data is not restricted
     */
    private function getRestrictionSql()
    {
        // The conditions are computed once: the filter by polygon needs a request to QGIS Server
        if ($this->restrictionSql !== null) {
            return $this->restrictionSql;
        }

        $conditions = array();

        // Datasource SQL filter, defined in the QGIS layer properties
        if (!empty($this->datasource->sql)) {
            $conditions[] = $this->datasource->sql;
        }

        // The user can see all the data: no filter by login nor by polygon
        $repositoryKey = $this->lproj->getRepository()->getKey();
        if (!jAcl2::check('lizmap.tools.loginFilteredLayers.override', $repositoryKey)) {
            // Filter by login, as done for the WFS GetFeature request
            $loginFilter = $this->lproj->getLoginFilter($this->layername);
            if (!empty($loginFilter) && !empty($loginFilter['filter'])) {
                $conditions[] = $loginFilter['filter'];
            }

            // Filter by polygon, as done for the WFS GetFeature request
            // when the data is queried directly in the database
            $polygonFilter = $this->layer->getPolygonFilter(false, 5);
            if (!empty($polygonFilter)) {
                $conditions[] = $polygonFilter;
            }
        }

        // Build the SQL to be appended to the WHERE clause
        $this->restrictionSql = '';
        foreach ($conditions as $condition) {
            $this->restrictionSql .= ' AND ( '.$condition.' )';
        }

        return $this->restrictionSql;
    }

    /**
     * return data as jDbResultSet or errors as array.
     *
     * @param mixed $sql
     *
     * @return array|jDbResultSet
     */
    protected function getData($sql)
    {
        $data = array();

        try {
            $q = $this->cnx->query($sql);
        } catch (Exception $e) {
            jLog::log($e->getMessage(), 'lizmapadmin');

            $this->errors = array(
                'status' => 'error',
                'title' => 'Invalid Query',
                'detail' => '',
            );

            return $this->errors;
        }

        return $q;
    }

    /**
     * Check whether a SQL function is available on the SQLite/SpatiaLite connection.
     *
     * @param string $functionName the function name to look up (case-insensitive)
     *
     * @return bool true if available, or if availability cannot be determined
     */
    private function sqliteFunctionExists($functionName)
    {
        try {
            $sql = 'SELECT count(*) AS c FROM pragma_function_list';
            $sql .= ' WHERE lower(name) = '.$this->cnx->quote(strtolower($functionName));
            $res = $this->cnx->query($sql)->fetch();

            return $res && (int) $res->c > 0;
        } catch (Exception $e) {
            // pragma_function_list unavailable: assume the function exists
            // and let the caller attempt the query as before.
            return true;
        }
    }

    public function getFeatureCount($filter = null)
    {
        // validate filter
        $filter = $this->validateFilter($filter);

        // SQL
        $sql = ' SELECT count(*) AS c';
        $sql .= ' FROM '.$this->datasource->table;
        $sql .= ' WHERE 2>1';
        if ($filter) {
            $sql .= ' AND ( '.$filter.' )';
        }
        // Add the datasource SQL filter and the filters by login and by polygon
        $sql .= $this->getRestrictionSql();

        return $this->getData($sql);
    }

    public function getUniqueValues($fieldname, $filter = null)
    {

        // Check fieldname
        try {
            $dbFieldsInfo = $this->layer->getDbFieldsInfo();
            $dataFields = $dbFieldsInfo->dataFields;
            $lfields = array();
            foreach ($dataFields as $k => $v) {
                $lfields[] = $k;
            }
        } catch (Exception $e) {
            $lfields = $this->layer->getWfsFields();
        }

        if (!in_array($fieldname, $lfields)) {
            $this->errors = array(
                'status' => 'error',
                'title' => 'The field does not exists in the table: ',
                'detail' => 'given fieldname = '.$fieldname,
            );

            return $this->errors;
        }

        // validate filter
        $filter = $this->validateFilter($filter);

        // validate splitter
        $splitter = '';
        foreach ($this->config as $config) {
            if (
                property_exists($config, 'field')
                and $config->field == $fieldname
                and property_exists($config, 'splitter')
            ) {
                $splitter = $config->splitter;
            }
        }
        $split = false;
        if (!empty($splitter) && strlen($splitter) > 0 && strlen($splitter) <= 3) {
            $split = true;
        }

        // SQL
        if (!$split) {
            // SQL
            $sql = ' SELECT ';
            $sql .= ' "'.$fieldname.'" AS v,';
            $sql .= ' Count(*) AS c';
            $sql .= ' FROM '.$this->datasource->table;
            $sql .= ' WHERE 2>1';
            if ($filter) {
                $sql .= ' AND ( '.$filter.' )';
            }
            // Add the datasource SQL filter and the filters by login and by polygon
            $sql .= $this->getRestrictionSql();
            $sql .= ' GROUP BY v';
            $sql .= ' ORDER BY v';
        } else {
            // We need to split each field value into parts
            // Given the splitter text. Ex: ', '

            // Easy in PostgreSQL, more tricky in SQLite / GeoPackage
            if ($this->provider == 'postgres') {
                // SQL
                $sql = ' SELECT ';
                $sql .= ' v, count(*) AS c';
                $sql .= ' FROM (';
                $sql .= '     SELECT regexp_split_to_table(trim("'.$fieldname.'"), '.$this->cnx->quote($splitter).') as v';
                $sql .= '     FROM '.$this->datasource->table;
                $sql .= '     WHERE 2>1';
                if ($filter) {
                    $sql .= '     AND ( '.$filter.' )';
                }

                // Add the datasource SQL filter and the filters by login and by polygon
                $sql .= $this->getRestrictionSql();
                $sql .= ') t';
                $sql .= ' GROUP BY v';
                $sql .= ' ORDER BY v';
            } else {
                // For Spatialite and GeoPackage
                // With need a much more complex query
                try {
                    $pkfields = array();
                    $dbFieldsInfo = $this->layer->getDbFieldsInfo();
                    foreach ($dbFieldsInfo->primaryKeys as $key) {
                        $pkfields[] = '"'.$key.'"';
                    }
                } catch (Exception $e) {
                    $pkfields = array();
                    $key = $this->datasource->key;
                    foreach (explode(',', $key) as $k) {
                        $pkfields[] = '"'.$k.'"';
                    }
                }

                $sql = '';
                $sql .= ' WITH x( id, first_item, rest) AS';
                $sql .= ' (';
                $sql .= '    SELECT '.implode(' || ', $pkfields).' AS id,';
                $sql .= '        substr("'.$fieldname.'", 1, instr("'.$fieldname.'", '.$this->cnx->quote($splitter).')-1) as first_item,';
                $sql .= '        substr("'.$fieldname.'", instr("'.$fieldname.'", '.$this->cnx->quote($splitter).')+1) as rest';
                $sql .= '    FROM '.$this->datasource->table;
                $sql .= '    WHERE "'.$fieldname.'" LIKE '.$this->cnx->quote('%'.$splitter.'%');
                // Add the datasource SQL filter and the filters by login and by polygon
                $sql .= $this->getRestrictionSql();
                $sql .= '    UNION ALL';
                $sql .= '    SELECT id,';
                $sql .= '        substr(rest, 1, instr(rest, '.$this->cnx->quote($splitter).')-1) AS first_item,';
                $sql .= '        substr(rest, instr(rest, '.$this->cnx->quote($splitter).')+1) AS rest';
                $sql .= '    FROM x';
                $sql .= '    WHERE rest LIKE '.$this->cnx->quote('%'.$splitter.'%');
                $sql .= '    LIMIT 200';
                $sql .= ' ),';
                $sql .= ' source AS (';
                $sql .= '    SELECT trim(first_item) AS cat, count(id) AS nb';
                $sql .= '    FROM x';
                $sql .= '    GROUP BY first_item';
                $sql .= '    UNION ALL';
                $sql .= '    SELECT trim(rest) AS cat, count(id) AS nb';
                $sql .= '    FROM x';
                $sql .= '    WHERE rest NOT LIKE '.$this->cnx->quote('%'.$splitter.'%');
                $sql .= '    GROUP BY rest';
                $sql .= '    UNION ALL';
                $sql .= '    SELECT \'NULL\' AS cat, count('.implode(' || ', $pkfields).') AS nb';
                $sql .= '    FROM '.$this->datasource->table;
                $sql .= '    WHERE "'.$fieldname.'" IS NULL';
                // Add the datasource SQL filter and the filters by login and by polygon
                $sql .= $this->getRestrictionSql();
                $sql .= ' )';
                $sql .= ' SELECT cat AS v, sum(nb) AS c';
                $sql .= ' FROM source';
                $sql .= ' GROUP BY cat';
                $sql .= ' HAVING sum(nb) > 0';
                $sql .= ' ORDER BY v';
            }
        }

        return $this->getData($sql);
    }

    public function getMinAndMaxValues($fieldname, $filter = null)
    {
        // Check fieldname
        try {
            $dbFieldsInfo = $this->layer->getDbFieldsInfo();
            $dataFields = $dbFieldsInfo->dataFields;
            $lfields = array();
            foreach ($dataFields as $k => $v) {
                $lfields[] = $k;
            }
        } catch (Exception $e) {
            $lfields = $this->layer->getWfsFields();
        }
        $fields = explode(',', $fieldname);
        foreach ($fields as $field) {
            if (!in_array($field, $lfields)) {
                $this->errors = array(
                    'status' => 'error',
                    'title' => 'The field does not exists in the table: ',
                    'detail' => 'given fieldname = '.$field,
                );

                return $this->errors;
            }
        }

        // validate filter
        $filter = $this->validateFilter($filter);

        // SQL
        $sql = ' SELECT ';
        if ($this->provider == 'postgres') {
            $sql .= ' Min(Least("'.implode('","', $fields).'")) AS min,';
            $sql .= ' Max(Greatest("'.implode('","', $fields).'")) AS max';
        } else {
            if (count($fields) === 1) {
                $sql .= ' Min("'.$fields[0].'") AS min,';
                $sql .= ' Max("'.$fields[0].'") AS max';
            } else {
                // Use COALESCE to handle NULL values: SQLite's scalar Min/Max
                // return NULL if any argument is NULL, unlike PostgreSQL's Least/Greatest
                $sql .= ' Min(CASE WHEN "'.$fields[0].'" IS NULL THEN "'.$fields[1].'"';
                $sql .= ' WHEN "'.$fields[1].'" IS NULL THEN "'.$fields[0].'"';
                $sql .= ' ELSE Min("'.$fields[0].'","'.$fields[1].'") END) AS min,';
                $sql .= ' Max(CASE WHEN "'.$fields[0].'" IS NULL THEN "'.$fields[1].'"';
                $sql .= ' WHEN "'.$fields[1].'" IS NULL THEN "'.$fields[0].'"';
                $sql .= ' ELSE Max("'.$fields[0].'","'.$fields[1].'") END) AS max';
            }
        }
        $sql .= ' FROM '.$this->datasource->table;
        $sql .= ' WHERE 2>1';
        if ($filter) {
            $sql .= ' AND ( '.$filter.' )';
        }
        // Add the datasource SQL filter and the filters by login and by polygon
        $sql .= $this->getRestrictionSql();

        return $this->getData($sql);
    }

    public function getExtent($crs, $filter = null)
    {
        // Get geometry column
        $geom = $this->datasource->geocol;

        // validate filter
        $filter = $this->validateFilter($filter);

        // validate crs
        $vcrs = null;
        $a = explode(':', $crs);
        if (count($a) == 2 and $a[0] == 'EPSG' and ctype_digit($a[1])) {
            $vcrs = $a[1];
        }

        // SQL
        $geom = '"'.$geom.'"';
        if ($this->provider == 'postgres') {
            $st = 'ST_';
        } else {
            // Do not add ST_ for Spatialite or GeoPackage
            $st = '';
            // Provider OGR means GeoPackage: needs to convert geometry
            if ($this->provider == 'ogr' and preg_match('#gpkg$#', $this->datasource->dbname)) {
                // Decoding GeoPackage geometry blobs requires SpatiaLite built
                // with GeoPackage support (GeomFromGPB). When it is missing,
                // skip the filtered-extent query instead of flooding the logs
                // with "no such function: GeomFromGPB" errors (#6165).
                if (!$this->sqliteFunctionExists('GeomFromGPB')) {
                    $this->errors = array(
                        'status' => 'error',
                        'title' => 'Filtered extent not available',
                        'detail' => 'SpatiaLite has no GeoPackage support (GeomFromGPB)',
                    );

                    return $this->errors;
                }
                $geom = 'GeomFromGPB('.$geom.')';
            }
        }
        $sql = ' SELECT '.$st.'AsGeoJSON('.$st.'Extent(';
        if ($vcrs) {
            $sql .= ''.$st.'Transform(';
        }
        $sql .= $geom;
        if ($vcrs) {
            $sql .= ', '.$vcrs.')';
        }
        $sql .= '), 8, 1) AS bbox';
        $sql .= ' FROM '.$this->datasource->table;
        $sql .= ' WHERE 2>1';
        if ($filter) {
            $sql .= ' AND ( '.$filter.' )';
        }
        // Add the datasource SQL filter and the filters by login and by polygon
        $sql .= $this->getRestrictionSql();

        return $this->getData($sql);
    }
}
