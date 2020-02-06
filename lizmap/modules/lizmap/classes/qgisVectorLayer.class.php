<?php
/**
 * Give access to qgis mapLayer configuration.
 *
 * @author    3liz
 * @copyright 2013 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class qgisVectorLayer extends qgisMapLayer
{
    // layer type
    protected $type = 'vector';

    protected $fields = array();

    protected $aliases = array();

    protected $wfsFields = array();

    /**
     * @var null|object connection parameters
     */
    protected $dtParams;

    /**
     * @var null|jDbConnection
     */
    protected $connection;

    /** @var jDbFieldProperties[] */
    protected $dbFieldList;
    protected $dbFieldsInfo;

    // Map data type as geometry type
    private $geometryDatatypeMap = array(
        'point', 'linestring', 'polygon', 'multipoint',
        'multilinestring', 'multipolygon', 'geometrycollection', 'geometry',
    );

    /**
     * constructor.
     *
     * @param lizmapProject|qgisProject $project
     * @param array                     $propLayer list of properties values
     */
    public function __construct($project, $propLayer)
    {
        parent::__construct($project, $propLayer);
        $this->fields = $propLayer['fields'];
        $this->aliases = $propLayer['aliases'];
        $this->wfsFields = $propLayer['wfsFields'];
    }

    public function getFields()
    {
        return $this->fields;
    }

    public function getAliasFields()
    {
        return $this->aliases;
    }

    public function getWfsFields()
    {
        return $this->wfsFields;
    }

    /**
     * @return object
     */
    public function getDatasourceParameters()
    {
        if ($this->dtParams) {
            return $this->dtParams;
        }

        // Get datasource information from QGIS
        $datasourceMatch = preg_match(
            "#(?:dbname='([^ ]+)' )?(?:service='([^ ]+)' )?(?:host=([^ ]+) )?(?:port=([0-9]+) )?(?:user='([^ ]+)' )?(?:password='([^ ]+)' )?(?:sslmode=([^ ]+) )?(?:key='([^ ]+)' )?(?:estimatedmetadata=([^ ]+) )?(?:selectatid=([^ ]+) )?(?:srid=([0-9]+) )?(?:type=([a-zA-Z]+) )?(?:checkPrimaryKeyUnicity='([0-1]+)' )?(?:table=\"([^ ]+)\" )?(?:\\()?(?:([^ ]+)\\) )?(?:sql=(.*))?#s",
            $this->datasource,
            $dt
        );

        if (count($dt) < 15 or $dt[14] == '') {
            // if table not found, try again for complex tables, such as table="(SELECT count(*) FROM table WHERE bla)"
            $datasourceMatch = preg_match(
                "#(?:dbname='([^ ]+)' )?(?:service='([^ ]+)' )?(?:host=([^ ]+) )?(?:port=([0-9]+) )?(?:user='([^ ]+)' )?(?:password='([^ ]+)' )?(?:sslmode=([^ ]+) )?(?:key='([^ ]+)' )?(?:estimatedmetadata=([^ ]+) )?(?:selectatid=([^ ]+) )?(?:srid=([0-9]+) )?(?:type=([a-zA-Z]+) )?(?:checkPrimaryKeyUnicity='([0-1]+)' )?(?:table=\"(.+)\" )?(?:\\()?(?:([^ ]+)\\) )?(?:sql=(.*))?#s",
                $this->datasource,
                $dt
            );
        }
        $ds = array(
            'dbname' => $dt[1],
            'service' => $dt[2],
            'host' => $dt[3],
            'port' => $dt[4],
            'user' => $dt[5],
            'password' => $dt[6],
            'sslmode' => $dt[7],
            'key' => $dt[8],
            'estimatedmetadata' => $dt[9],
            'selectatid' => $dt[10],
            'srid' => $dt[11],
            'type' => $dt[12],
            'checkPrimaryKeyUnicity' => $dt[13],
            'table' => $dt[14],
            'geocol' => $dt[15],
            'sql' => $dt[16],
        );

        $table = $ds['table'];
        $tableAlone = $table;
        $schema = '';
        if (preg_match('#"."#', $table)) {
            $table = '"'.$table.'"';
            $exp = explode('.', str_replace('"', '', $table));
            $tableAlone = $exp[1];
            $schema = $exp[0];
        }
        // Handle subqueries
        if (substr($table, 0, 1) == '(' and substr($table, -1) == ')') {
            $table = $tableAlone = $table.' fooliz';
            // remove \" which escapes table and schema names in QGIS WML within subquery
            $table = str_replace('\"', '"', $table);
        }
        $ds['schema'] = $schema;
        $ds['table'] = $table;
        $ds['tablename'] = $tableAlone;

        $this->dtParams = (object) $ds;

        return $this->dtParams;
    }

    /**
     * @throws jException
     *
     * @return jDbConnection
     */
    public function getDatasourceConnection()
    {
        if ($this->connection) {
            return $this->connection;
        }

        if ($this->provider != 'spatialite' && $this->provider != 'postgres') {
            jLog::log('Unknown provider "'.$this->provider.'" to get connection!', 'error');

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
            if ($this->provider == 'spatialite') {
                $spatialiteExt = $this->project->getSpatialiteExtension();
                $repository = $this->project->getRepository();
                $jdbParams = array(
                    'driver' => 'sqlite3',
                    'database' => realpath($repository->getPath().$dtParams->dbname),
                    'extensions' => $spatialiteExt,
                );
            } elseif ($this->provider == 'postgres') {
                if (!empty($dtParams->service)) {
                    $jdbParams = array(
                        'driver' => 'pgsql',
                        'service' => $dtParams->service,
                    );
                } else {
                    $jdbParams = array(
                        'driver' => 'pgsql',
                        'host' => $dtParams->host,
                        'port' => (int) $dtParams->port,
                        'database' => $dtParams->dbname,
                        'user' => $dtParams->user,
                        'password' => $dtParams->password,
                    );
                }
            } else {
                return null;
            }

            // create profile
            jProfiles::createVirtualProfile('jdb', $profile, $jdbParams);
        }
        $cnx = jDb::getConnection($profile);
        $this->connection = $cnx;

        return $cnx;
    }

    /**
     * @return jDbFieldProperties[]
     */
    public function getDbFieldList()
    {
        if ($this->dbFieldList) {
            return $this->dbFieldList;
        }

        $dtParams = $this->getDatasourceParameters();
        if (!$dtParams) {
            return array();
        }

        $cnx = $this->getDatasourceConnection();
        if (!$cnx) {
            return array();
        }

        $tools = $cnx->tools();
        $sequence = null;

        $this->dbFieldList = $tools->getFieldList($dtParams->tablename, $sequence, $dtParams->schema);

        return $this->dbFieldList;
    }

    /**
     * @return null|qgisLayerDbFieldsInfo
     */
    public function getDbFieldsInfo()
    {
        if ($this->dbFieldsInfo) {
            return $this->dbFieldsInfo;
        }

        $dtParams = $this->getDatasourceParameters();
        if (!$dtParams) {
            jLog::log('Cant get datasource params for the layer "'.$this->name.'"', 'error');

            return null;
        }

        $cnx = $this->getDatasourceConnection();
        if (!$cnx) {
            jLog::log('Cant get datasource connection for the layer "'.$this->name.'"', 'error');

            return null;
        }

        $fields = $this->getDbFieldList();
        $wfsFields = $this->getWfsFields();

        $dbInfo = new qgisLayerDbFieldsInfo();
        $dbInfo->dataFields = array();
        foreach ($fields as $fieldName => $prop) {
            if (in_array($fieldName, $wfsFields) || in_array(strtolower($prop->type), $this->geometryDatatypeMap)) {
                $dbInfo->dataFields[$fieldName] = $prop;
            }
        }

        $dbInfo->primaryKeys = array();
        foreach ($dbInfo->dataFields as $fieldName => $prop) {
            // Detect primary key column
            if ($prop->primary && !in_array($fieldName, $dbInfo->primaryKeys)) {
                $dbInfo->primaryKeys[] = $fieldName;
            }

            // Detect geometry column
            if (in_array(strtolower($prop->type), $this->geometryDatatypeMap)) {
                $dbInfo->geometryColumn = $fieldName;
                $dbInfo->geometryType = strtolower($prop->type);
                // If postgresql, get real geometryType from pg_attribute (jelix prop gives 'geometry')
                // Issue #902, "geometry_columns" is not giving the Z value
                if ($this->provider == 'postgres' and $dbInfo->geometryType == 'geometry') {
                    $tablename = '"'.$dtParams->schema.'"."'.$dtParams->tablename.'"';
                    $sql = 'SELECT format_type(atttypid,atttypmod) AS type';
                    $sql .= ' FROM pg_attribute';
                    $sql .= ' WHERE attname = '.$cnx->quote($dbInfo->geometryColumn);
                    $sql .= ' AND attrelid = '.$cnx->quote($tablename).'::regclass';
                    $res = $cnx->query($sql);
                    $res = $res->fetch();
                    // It returns something like "geometry(PointZ,32620) as type"
                    if ($res && preg_match('/^geometry\\(([^,\\)]*)/i', $res->type, $m)) {
                        $dbInfo->geometryType = strtolower($m[1]);
                    }
                }
            }
        }

        // For views : add key from datasource
        if (count($dbInfo->primaryKeys) == 0 and $dtParams->key) {
            // check if layer is a view
            if ($this->provider == 'postgres') {
                $sql = ' SELECT table_name FROM INFORMATION_SCHEMA.views';
                $sql .= ' WHERE 2>1';
                $sql .= ' AND (table_schema = ANY (current_schemas(false)) OR table_schema = '.$cnx->quote($dtParams->schema).')';
                $sql .= ' AND table_name='.$cnx->quote($dtParams->tablename);
            }
            if ($this->provider == 'spatialite') {
                $sql = " SELECT name FROM sqlite_master WHERE type = 'view'";
                $sql .= ' AND name='.$cnx->quote($dtParams->tablename);
            }
            $res = $cnx->query($sql);
            if ($res->rowCount() > 0) {
                $dbInfo->primaryKeys[] = $dtParams->key;
            }
        }

        $this->dbFieldsInfo = $dbInfo;

        return $this->dbFieldsInfo;
    }

    public function getDbFieldDefaultValues()
    {
        $dbFieldsInfo = $this->getDbFieldsInfo();

        $provider = $this->getProvider();
        $cnx = null;
        if ($provider == 'postgres') {
            $cnx = $this->getDatasourceConnection();
        }

        $defaultValues = array();
        foreach ($dbFieldsInfo->dataFields as $ref => $prop) {
            if (!$prop->hasDefault) {
                continue;
            }
            if ($prop->default == '') {
                continue;
            }
            $defaultValues[$ref] = $prop->default;
            // if provider is postgres evaluate default value
            if ($provider == 'postgres') {
                $ds = $cnx->query('SELECT '.$prop->default.' AS v;');
                $d = $ds->fetch();
                if ($d) {
                    $defaultValues[$ref] = $d->v;
                }
            }
        }

        return $defaultValues;
    }

    public function getDbFieldDistinctValues($field)
    {
        $dtParams = $this->getDatasourceParameters();

        // Get database connection object
        $cnx = $this->getDatasourceConnection();

        // Build the SQL query to retrieve data from the table
        $sql = 'SELECT DISTINCT "'.$field.'"';
        $sql .= ' FROM '.$dtParams->table;

        // Run the query and loop through the result to set the form data
        $rs = $cnx->query($sql);
        $values = array();
        foreach ($rs as $record) {
            $values[] = $record->{$field};
        }

        // Add default value
        $dbFieldsInfo = $this->getDbFieldsInfo();
        $dataFields = $dbFieldsInfo->dataFields;
        if (array_key_exists($field, $dataFields)) {
            $prop = $dataFields[$field];
            if ($prop->hasDefault && $prop->default != '' &&
                !in_array($prop->default, $values)) {

                $provider = $this->getProvider();
                $cnx = null;
                if ($provider == 'postgres') {
                    $cnx = $this->getDatasourceConnection();
                }
                // if provider is postgres evaluate default value
                if ($provider == 'postgres') {
                    $ds = $cnx->query('SELECT '.$prop->default.' AS v;');
                    $d = $ds->fetch();
                    if ($d && !in_array($d->v, $values)) {
                        array_unshift($values, $d->v);
                    }
                } else {
                    array_unshift($values, $prop->default);
                }
            }
        }

        return $values;
    }

    public function getDbFieldValues($feature)
    {
        $dbFieldsInfo = $this->getDbFieldsInfo();

        $dtParams = $this->getDatasourceParameters();

        // Get database connection object
        $cnx = $this->getDatasourceConnection();

        $geometryColumn = $dbFieldsInfo->geometryColumn;
        // Build the SQL query to retrieve data from the table
        $sql = 'SELECT *';
        if ($geometryColumn != '') {
            $sql .= ', ST_AsText('.$geometryColumn.') AS astext';
        }
        $sql .= ' FROM '.$dtParams->table;

        $sqlw = array();
        $dataFields = $dbFieldsInfo->dataFields;
        foreach ($dbFieldsInfo->primaryKeys as $key) {
            $val = $feature->properties->{$key};
            if ($dataFields[$key]->unifiedType != 'integer') {
                $val = $cnx->quote($val);
            }
            $sqlw[] = $cnx->encloseName($key).' = '.$val;
        }
        $sql .= ' WHERE ';
        $sql .= implode(' AND ', $sqlw);

        // Run the query and loop through the result to set the form data
        $rs = $cnx->query($sql);
        $values = array();
        foreach ($rs as $record) {
            // Loop through the data fields
            foreach ($dataFields as $ref => $prop) {
                $values[$ref] = $record->{$ref};
            }
            // geometry column : override binary with text representation
            if ($geometryColumn != '') {
                $values[$geometryColumn] = $record->astext;
            }
        }

        return $values;
    }

    public function getGeometryAsSql($value)
    {
        $nvalue = "ST_GeomFromText('".filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES)."', ".$this->srid.')';

        // Get database connection object
        $cnx = $this->getDatasourceConnection();
        $dbFieldsInfo = $this->getDbFieldsInfo();

        // test type
        $rs = $cnx->query('SELECT GeometryType('.$nvalue.') as geomtype');
        $rs = $rs->fetch();
        $geomtype = strtolower($rs->geomtype);
        if (!preg_match('/'.preg_quote($dbFieldsInfo->geometryType).'/', $geomtype)) {
            if (preg_match('/'.preg_quote(str_replace('multi', '', $dbFieldsInfo->geometryType)).'/', $geomtype)) {
                $nvalue = 'ST_Multi('.$nvalue.')';
            }
        }

        if (substr($dbFieldsInfo->geometryType, -2) == 'zm') {
            $nvalue = 'ST_Force_4D('.$nvalue.')';
        } elseif (substr($dbFieldsInfo->geometryType, -1) == 'z') {
            $nvalue = 'ST_Force_3DZ('.$nvalue.')';
        } elseif (substr($dbFieldsInfo->geometryType, -1) == 'm') {
            $nvalue = 'ST_Force_3DM('.$nvalue.')';
        }

        return $nvalue;
    }

    /**
     * @param array $values
     *
     * @throws Exception
     *
     * @return array list of primary keys with their values
     */
    public function insertFeature($values)
    {
        // Get database connection object
        $dtParams = $this->getDatasourceParameters();
        $cnx = $this->getDatasourceConnection();
        $dbFieldsInfo = $this->getDbFieldsInfo();

        $refs = array();
        $insert = array();
        $primaryKeys = $dbFieldsInfo->primaryKeys;
        $dataFields = $dbFieldsInfo->dataFields;
        $dataLogInfo = array();
        foreach ($values as $ref => $value) {
            // For insert, only for not NULL values to allow serial and default values to work
            if ($value !== 'NULL') {
                $insert[] = $value;
                $refs[] = $cnx->encloseName($ref);
                // For log
                if (in_array($ref, $primaryKeys)) {
                    $val = $value;
                    if ($dataFields[$ref]->unifiedType != 'integer') {
                        $val = $cnx->quote($val);
                    }
                    $dataLogInfo[] = $cnx->encloseName($ref).' = '.$val;
                }
            }
        }

        $sql = ' INSERT INTO '.$dtParams->table.' (';
        $sql .= implode(', ', $refs);
        $sql .= ' ) VALUES (';
        $sql .= implode(', ', $insert);
        $sql .= ' )';

        // Get select clause for primary keys (used when inserting data in postgresql)
        $returnKeys = array();
        foreach ($primaryKeys as $key) {
            $returnKeys[] = $cnx->encloseName($key);
        }
        $returnKeysString = implode(', ', $returnKeys);
        // For spatialite, we will run a complentary query to retrieve the pkeys
        if ($this->provider == 'postgres') {
            $sql .= '  RETURNING '.$returnKeysString;
        }
        $sql .= ';';

        try {
            // Begin transaction
            $cnx->beginTransaction();
            // Retrieve PK for created objects
            $pkvals = array();
            if ($this->provider == 'postgres') {
                // Query the request
                $rs = $cnx->query($sql);
                foreach ($rs as $line) {
                    foreach ($primaryKeys as $key) {
                        $pkvals[$key] = $line->{$key};
                    }

                    break;
                }
            } else {
                // Exec the request
                $rs = $cnx->exec($sql);
                $sqlpk = 'SELECT '.$returnKeysString.' FROM '.$dtParams->table.' WHERE rowid = last_insert_rowid();';
                $rspk = $cnx->query($sqlpk);
                foreach ($rspk as $line) {
                    foreach ($primaryKeys as $key) {
                        $pkvals[$key] = $line->{$key};
                    }

                    break;
                }
            }
            $cnx->commit();

            // Log
            $content = 'INSERT table='.$dtParams->table;
            if (count($pkvals) > 0) {
                $content .= ', pkeys='.json_encode($pkvals);
            }
            $content .= ', ('.implode(', ', $dataLogInfo).')';
            $eventParams = array(
                'key' => 'editionSaveFeature',
                'content' => $content,
                'repository' => $this->project->getRepository()->getKey(),
                'project' => $this->project->getKey(),
            );
            jEvent::notify('LizLogItem', $eventParams);

            return $pkvals;
        } catch (Exception $e) {
            jLog::log('SQL = '.$sql);

            throw $e;
        }
    }

    /**
     * @param object     $feature
     * @param array      $values
     * @param null|array $loginFilteredLayers array with these keys:
     *                                        - where: SQL WHERE statement
     *                                        - type: 'groups' or 'login'
     *                                        - attribute: filter attribute from the layer
     *
     * @throws Exception
     *
     * @return array list of primary keys with their values
     */
    public function updateFeature($feature, $values, $loginFilteredLayers)
    {
        // Get database connection object
        $dtParams = $this->getDatasourceParameters();
        $cnx = $this->getDatasourceConnection();
        $dbFieldsInfo = $this->getDbFieldsInfo();
        $primaryKeys = $dbFieldsInfo->primaryKeys;

        $update = array();
        foreach ($values as $ref => $value) {
            // For update, do not update primary keys
            if (in_array($ref, $primaryKeys)) {
                continue;
            }
            // For update, keep fields with NULL to allow deletion of values
            $update[] = $cnx->encloseName($ref).'='.$value;
        }

        // SQL for updating on line in the edition table
        $sql = ' UPDATE '.$dtParams->table.' SET ';
        $sql .= implode(', ', $update);

        // Add where clause with primary keys
        $sqlw = array();
        $dataFields = $dbFieldsInfo->dataFields;
        foreach ($primaryKeys as $key) {
            $val = $feature->properties->{$key};
            if ($dataFields[$key]->unifiedType !== 'integer'
                && $dataFields[$key]->unifiedType !== 'numeric'
                && $dataFields[$key]->unifiedType !== 'float'
                && $dataFields[$key]->unifiedType !== 'decimal') {
                $val = $cnx->quote($val);
            }
            $sqlw[] = $cnx->encloseName($key).' = '.$val;
        }
        // Store WHere clause to retrieve primary keys in spatialite
        $uwhere = '';
        $uwhere .= ' WHERE ';
        $uwhere .= implode(' AND ', $sqlw);

        // Add login filter if needed
        if ($loginFilteredLayers and is_array($loginFilteredLayers)) {
            $uwhere .= ' AND '.$loginFilteredLayers['where'];
        }
        $sql .= $uwhere;

        // Get select clause for primary keys (used when inserting data in postgresql)
        $returnKeys = array();
        foreach ($primaryKeys as $key) {
            $returnKeys[] = $cnx->encloseName($key);
        }
        $returnKeysString = implode(', ', $returnKeys);
        // For spatialite, we will run a complementary query to retrieve the pkeys
        if ($this->provider == 'postgres') {
            $sql .= '  RETURNING '.$returnKeysString;
        }
        $sql .= ';';

        try {
            // Begin transaction
            $cnx->beginTransaction();
            // Retrieve PK for created objects
            $pkvals = array();
            if ($this->provider == 'postgres') {
                // Query the request
                $rs = $cnx->query($sql);
                foreach ($rs as $line) {
                    foreach ($primaryKeys as $key) {
                        $pkvals[$key] = $line->{$key};
                    }

                    break;
                }
            } else {
                // Exec the request
                $cnx->exec($sql);
                $sqlpk = 'SELECT '.$returnKeysString.' FROM '.$dtParams->table.$uwhere;
                $rspk = $cnx->query($sqlpk);
                foreach ($rspk as $line) {
                    foreach ($primaryKeys as $key) {
                        $pkvals[$key] = $line->{$key};
                    }

                    break;
                }
            }
            $cnx->commit();

            // Log
            $content = 'UPDATE table='.$dtParams->table;
            $content .= ', id='.$feature->id;
            if (count($pkvals) > 0) {
                $content .= ', pkeys='.json_encode($pkvals);
            }
            $content .= ', ('.implode(', ', $update).')';
            $eventParams = array(
                'key' => 'editionSaveFeature',
                'content' => $content,
                'repository' => $this->project->getRepository()->getKey(),
                'project' => $this->project->getKey(),
            );
            jEvent::notify('LizLogItem', $eventParams);

            return $pkvals;
        } catch (Exception $e) {
            jLog::log('SQL = '.$sql);

            throw $e;
        }
    }

    /**
     * @param object     $feature
     * @param null|array $loginFilteredLayers array with these keys:
     *                                        - where: SQL WHERE statement
     *                                        - type: 'groups' or 'login'
     *                                        - attribute: filter attribute from the layer
     *
     * @throws Exception
     *
     * @return int
     */
    public function deleteFeature($feature, $loginFilteredLayers)
    {
        // Get database connection object
        $dtParams = $this->getDatasourceParameters();
        $cnx = $this->getDatasourceConnection();
        $dbFieldsInfo = $this->getDbFieldsInfo();

        // SQL for deleting on line in the edition table
        $sql = ' DELETE FROM '.$dtParams->table;

        // Add where clause with primary keys
        $sqlw = array();
        $dataFields = $dbFieldsInfo->dataFields;
        $pkLogInfo = array();
        foreach ($dbFieldsInfo->primaryKeys as $key) {
            $val = $feature->properties->{$key};
            if ($dataFields[$key]->unifiedType !== 'integer'
                && $dataFields[$key]->unifiedType !== 'numeric'
                && $dataFields[$key]->unifiedType !== 'float'
                && $dataFields[$key]->unifiedType !== 'decimal') {
                $val = $cnx->quote($val);
            }
            $sqlw[] = $cnx->encloseName($key).' = '.$val;
            $pkLogInfo[] = $val;
        }
        $sql .= ' WHERE ';
        $sql .= implode(' AND ', $sqlw);

        // Add login filter if needed
        if ($loginFilteredLayers and is_array($loginFilteredLayers)) {
            $sql .= ' AND '.$loginFilteredLayers['where'];
        }

        try {
            $rs = $cnx->exec($sql);

            // Log
            $content = 'table='.$dtParams->table;
            $content .= ', id='.$feature->id;
            if (count($pkLogInfo) > 0) {
                $content .= ', pk='.implode(',', $pkLogInfo);
            }
            $eventParams = array(
                'key' => 'editionDeleteFeature',
                'content' => $content,
                'repository' => $this->project->getRepository()->getKey(),
                'project' => $this->project->getKey(),
            );
            jEvent::notify('LizLogItem', $eventParams);

            return $rs;
        } catch (Exception $e) {
            jLog::log('SQL = '.$sql);

            throw $e;
        }
    }

    public function linkChildren($fkey, $fval, $pkey, $pvals)
    {
        // Get database connection object
        $dtParams = $this->getDatasourceParameters();
        $cnx = $this->getDatasourceConnection();
        $dbFieldsInfo = $this->getDbFieldsInfo();
        $dataFields = $dbFieldsInfo->dataFields;

        $results = array();
        $one = (int) $fval;
        if ($dataFields[$fkey]->unifiedType != 'integer') {
            $one = $cnx->quote($one);
        }
        foreach ($pvals as $pval) {
            $two = (int) $pval;
            if ($dataFields[$pkey]->unifiedType != 'integer') {
                $two = $cnx->quote($two);
            }

            // Build SQL
            $sql = ' UPDATE '.$dtParams->table;
            $sql .= ' SET '.$cnx->encloseName($fkey).' = '.$one;
            $sql .= ' WHERE '.$cnx->encloseName($pkey).' = '.$two;
            $sql .= ';';

            try {
                $results[] = $cnx->exec($sql);
            } catch (Exception $e) {
                jLog::log('SQL = '.$sql);

                throw $e;
            }
        }

        return $results;
    }

    public function insertRelations($fkey, $fvals, $pkey, $pvals)
    {
        // Get database connection object
        $dtParams = $this->getDatasourceParameters();
        $cnx = $this->getDatasourceConnection();
        $dbFieldsInfo = $this->getDbFieldsInfo();
        $dataFields = $dbFieldsInfo->dataFields;

        $results = array();
        foreach ($fvals as $fval) {
            $one = (int) $fval;
            if ($dataFields[$fkey]->unifiedType != 'integer') {
                $one = $cnx->quote($one);
            }
            foreach ($pvals as $pval) {
                $two = (int) $pval;
                if ($dataFields[$pkey]->unifiedType != 'integer') {
                    $two = $cnx->quote($two);
                }

                // Build SQL
                $sql = ' INSERT INTO '.$dtParams->table.' (';
                $sql .= ' '.$cnx->encloseName($fkey).' , ';
                $sql .= ' '.$cnx->encloseName($pkey).' )';
                $sql .= ' SELECT '.$one.', '.$two;
                $sql .= ' WHERE NOT EXISTS';
                $sql .= ' ( SELECT ';
                $sql .= ' '.$cnx->encloseName($fkey).' , ';
                $sql .= ' '.$cnx->encloseName($pkey).' ';
                $sql .= ' FROM '.$dtParams->table;
                $sql .= ' WHERE '.$cnx->encloseName($fkey).' = '.$one;
                $sql .= ' AND '.$cnx->encloseName($pkey).' = '.$two.')';
                $sql .= ';';

                try {
                    $results[] = $cnx->exec($sql);
                } catch (Exception $e) {
                    jLog::log('SQL = '.$sql);

                    throw $e;
                }
            }
        }

        return $results;
    }

    public function unlinkChild($fkey, $pkey, $pval)
    {
        // Get database connection object
        $dtParams = $this->getDatasourceParameters();
        $cnx = $this->getDatasourceConnection();
        $dbFieldsInfo = $this->getDbFieldsInfo();
        $dataFields = $dbFieldsInfo->dataFields;

        // Build SQL
        $val = (int) $pval;
        if ($dataFields[$pkey]->unifiedType != 'integer') {
            $val = $cnx->quote($val);
        }

        $sql = ' UPDATE '.$dtParams->table;
        $sql .= ' SET '.$cnx->encloseName($fkey).' = NULL';
        $sql .= ' WHERE '.$cnx->encloseName($pkey).' = '.$val;
        $sql .= ';';

        try {
            return $cnx->exec($sql);
        } catch (Exception $e) {
            jLog::log('SQL = '.$sql);

            throw $e;
        }
    }

    public function isEditable()
    {
        $layerName = $this->name;
        $eLayers = $this->project->getEditionLayers();
        if (!property_exists($eLayers, $layerName)) {
            return false;
        }
        $eLayer = $eLayers->{$layerName};
        if ($eLayer->capabilities->modifyGeometry != 'True'
           && $eLayer->capabilities->modifyAttribute != 'True'
           && $eLayer->capabilities->deleteFeature != 'True'
           && $eLayer->capabilities->createFeature != 'True'
        ) {
            return false;
        }

        return true;
    }

    public function getEditionCapabilities()
    {
        $layerName = $this->name;
        $eLayers = $this->project->getEditionLayers();
        if (!property_exists($eLayers, $layerName)) {
            return null;
        }

        return $eLayers->{$layerName};
    }
}
