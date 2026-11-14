<?php

/**
 * Aggregate the features of a PostgreSQL layer directly in the database.
 *
 * @author    3liz
 * @copyright 2026 3liz
 *
 * @see      https://3liz.com
 *
 * @license    Mozilla Public License
 */

namespace Lizmap\Request;

use Lizmap\Project\Project;

/**
 * Compute aggregates (GROUP BY) on the features of a layer with a direct
 * SQL query to PostgreSQL, instead of getting all the features with WFS.
 *
 * The features are selected exactly as with a WFS GetFeature request:
 * the same checks of the layer publication and access rights, and the same
 * SQL WHERE clause (datasource filter, BBOX, EXP_FILTER, filter by login,
 * filter by polygon, FEATUREID).
 *
 * The aggregation is not always possible: not a PostgreSQL layer, OGC FILTER
 * parameter, expression filter not translatable to SQL, numeric function on
 * a non numeric field, database error... In these cases, aggregate() and
 * aggregateColumns() return null and the caller must use a GetFeature request
 * instead. The reason is given by getFailureReason().
 *
 * Usage:
 *     $request = new WFSAggregateRequest($project, array(
 *         'TYPENAME' => 'my_layer',
 *         'EXP_FILTER' => '"type" = \'A\'',
 *     ), $services);
 *     $rows = $request->aggregate(
 *         array('category'),
 *         array(array('sum', 'value'), array('count', null)),
 *     );
 *     // $rows = array(array(array('A'), array(12.5, 3)), ...)
 *
 * The groups are sorted by their values, ascending, with the null values
 * last, as the features of a GetFeature request with SORTBY.
 *
 * For many groups, aggregateColumns() gives the same values as JSON arrays
 * built by PostgreSQL, one per column, which do not need to be decoded.
 *
 * The extent of the selected features is given by extent(), without
 * getting their geometries.
 */
class WFSAggregateRequest extends WFSRequest
{
    /** Number of features */
    public const COUNT = 'count';

    /** Sum of the numeric values, 0 if none */
    public const SUM = 'sum';

    /** Mean of the numeric values */
    public const AVG = 'avg';

    /** Minimum of the numeric values */
    public const MIN = 'min';

    /** Maximum of the numeric values */
    public const MAX = 'max';

    /** Population standard deviation of the numeric values */
    public const STDDEV = 'stddev';

    /** Median of the numeric values */
    public const MEDIAN = 'median';

    /** Value of the first feature */
    public const FIRST = 'first';

    /** Value of the last feature */
    public const LAST = 'last';

    /** First value which is not null nor an empty string */
    public const FIRST_NOT_EMPTY = 'first_not_empty';

    /**
     * Aggregate functions which only use numeric values.
     */
    private const NUMERIC_FUNCTIONS = array(
        self::SUM,
        self::AVG,
        self::MIN,
        self::MAX,
        self::STDDEV,
        self::MEDIAN,
    );

    /**
     * Aggregate functions which use the order of the features.
     */
    private const FEATURE_ORDER_FUNCTIONS = array(
        self::FIRST,
        self::LAST,
        self::FIRST_NOT_EMPTY,
    );

    /**
     * All the supported aggregate functions.
     */
    private const FUNCTIONS = array(
        self::COUNT,
        self::SUM,
        self::AVG,
        self::MIN,
        self::MAX,
        self::STDDEV,
        self::MEDIAN,
        self::FIRST,
        self::LAST,
        self::FIRST_NOT_EMPTY,
    );

    /**
     * @var null|string Why the last aggregation was not possible
     */
    protected $failureReason;

    /**
     * Create the request.
     *
     * @param Project         $project  the Lizmap project
     * @param array           $params   the WFS GetFeature parameters selecting the features:
     *                                  TYPENAME (mandatory), EXP_FILTER, BBOX, FEATUREID...
     * @param \lizmapServices $services the Lizmap services
     */
    public function __construct($project, $params, $services)
    {
        // Select the features as a GetFeature request, so the filter
        // by login is added by parameters()
        $params['service'] = 'WFS';
        $params['request'] = 'GetFeature';
        parent::__construct($project, $params, $services);
    }

    /**
     * Get the reason why the last aggregation was not possible.
     *
     * @return null|string the reason, null if the aggregation succeeded
     */
    public function getFailureReason(): ?string
    {
        return $this->failureReason;
    }

    /**
     * Aggregate the features by group.
     *
     * Each aggregate is a function and a field name. The field is not used by
     * the count function. The numeric functions (sum, avg, min, max, stddev,
     * median) need a numeric field.
     *
     * The groups with a null value for one of the $notNullFields are ignored.
     *
     * All the values are decoded: for a large number of groups, prefer
     * aggregateColumns() which returns them as JSON arrays.
     *
     * @param list<string>                       $groupFields   the fields to group by
     * @param list<array{0: string, 1: ?string}> $aggregates    the aggregates: function and field
     * @param list<string>                       $notNullFields the group fields which must not be null
     *
     * @return null|list<array{0: list<mixed>, 1: list<mixed>}> for each group, sorted by value, the group values
     *                                                          and the aggregated values, in the order of the
     *                                                          parameters; null if the aggregation is not possible
     */
    public function aggregate(array $groupFields, array $aggregates, array $notNullFields = array()): ?array
    {
        $columns = $this->aggregateColumns($groupFields, $aggregates, $notNullFields);
        if ($columns === null) {
            return null;
        }

        // Decode the columns
        $decode = fn (string $json): mixed => json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        $groupColumns = array_map($decode, $columns['groups']);
        $aggregateColumns = array_map($decode, $columns['aggregates']);

        // Then build one row per group from the columns
        $rows = array();
        for ($i = 0; $i < $columns['count']; ++$i) {
            $rows[] = array(
                array_map(fn (array $column) => $column[$i], $groupColumns),
                array_map(fn (array $column) => $column[$i], $aggregateColumns),
            );
        }

        return $rows;
    }

    /**
     * Aggregate the features by group, and get each column as a JSON array.
     *
     * The parameters are the same as aggregate(). The JSON arrays are built by
     * PostgreSQL: the values can be sent to a client without being decoded,
     * which keeps a low memory usage when there are many groups. The values of
     * a group have the same position in all the arrays. JSON keeps the types
     * of the values (number, string, boolean).
     *
     * @param list<string>                       $groupFields   the fields to group by
     * @param list<array{0: string, 1: ?string}> $aggregates    the aggregates: function and field
     * @param list<string>                       $notNullFields the group fields which must not be null
     *
     * @return null|array{count: int, groups: list<string>, aggregates: list<string>} the number of groups,
     *                                                                                the JSON array of each group
     *                                                                                field and of each aggregate;
     *                                                                                null if not possible
     */
    public function aggregateColumns(array $groupFields, array $aggregates, array $notNullFields = array()): ?array
    {
        $this->failureReason = null;

        try {
            // Check the layer and get its fields
            $fields = $this->getAggregatableFields();
            if ($fields === null) {
                return null;
            }

            // Check the requested fields and functions
            if (!$this->validateAggregation($fields, $groupFields, $aggregates, $notNullFields)) {
                return null;
            }

            // Build the WHERE clause, as for a GetFeature request
            $cnx = $this->qgisLayer->getDatasourceConnection();
            $whereClause = $this->getWhereClause($cnx, $this->parameters());
            if ($whereClause === false) {
                return $this->fail('the filter can not be translated to SQL');
            }

            // Run the query
            $sql = $this->buildAggregateSql($cnx, $whereClause, $groupFields, $aggregates, $notNullFields);
            $result = $cnx->query($sql)->fetch();
        } catch (\Throwable $e) {
            $this->appContext->logException($e, 'lizmapadmin');

            return $this->fail('database error: '.$e->getMessage());
        }

        // Get the JSON array of each column. Without group,
        // json_agg returns null: the arrays are empty.
        $count = is_object($result) ? (int) $result->lizmap_group_count : 0;
        $columns = array('count' => $count, 'groups' => array(), 'aggregates' => array());
        foreach (array_keys($groupFields) as $i) {
            $columns['groups'][] = $count > 0 ? $result->{'g'.$i} : '[]';
        }
        foreach (array_keys($aggregates) as $i) {
            $columns['aggregates'][] = $count > 0 ? $result->{'a'.$i} : '[]';
        }

        return $columns;
    }

    /**
     * Get the extent of the selected features.
     *
     * The extent is computed by PostgreSQL from the envelope of each geometry,
     * transformed into the output CRS, as the "extent" GEOMETRYNAME of a
     * GetFeature request. The features without geometry are ignored.
     *
     * @param int $srid the SRID of the output CRS, EPSG:4326 by default as for GeoJSON
     *
     * @return null|array<int, float> the extent [xmin, ymin, xmax, ymax], an empty
     *                                array if no feature has a geometry; null if
     *                                not possible, see getFailureReason()
     */
    public function extent(int $srid = self::DEFAULT_OUTPUT_SRID): ?array
    {
        $this->failureReason = null;

        try {
            // Check the layer and its geometry column
            if (!$this->checkSqlLayer()) {
                return null;
            }
            if (empty($this->datasource->geocol)) {
                return $this->fail('the layer has no geometry');
            }

            // Build the WHERE clause, as for a GetFeature request
            $cnx = $this->qgisLayer->getDatasourceConnection();
            $whereClause = $this->getWhereClause($cnx, $this->parameters());
            if ($whereClause === false) {
                return $this->fail('the filter can not be translated to SQL');
            }

            // Run the query
            $sql = $this->buildExtentSql($cnx, $whereClause, $srid);
            $result = $cnx->query($sql)->fetch();
        } catch (\Throwable $e) {
            $this->appContext->logException($e, 'lizmapadmin');

            return $this->fail('database error: '.$e->getMessage());
        }

        // No feature with a geometry: the extent is null
        if (!is_object($result) || $result->xmin === null) {
            return array();
        }

        return array(
            (float) $result->xmin,
            (float) $result->ymin,
            (float) $result->xmax,
            (float) $result->ymax,
        );
    }

    /**
     * Check that the features of the layer can be requested with SQL.
     *
     * The conditions are the ones used by process_getfeature() to request
     * PostgreSQL directly instead of QGIS Server. The layer and its
     * datasource are stored in the qgisLayer and datasource properties.
     *
     * @return bool true if possible, false with a failure reason otherwise
     */
    protected function checkSqlLayer(): bool
    {
        // The layer must be published in WFS and visible by the user
        $typenameCheckingCode = $this->checkingTypename();
        if ($typenameCheckingCode !== 200) {
            return (bool) $this->fail('the layer is not available (HTTP code '.$typenameCheckingCode.')');
        }

        // Get the layer
        $lizmapLayer = $this->project->findLayerByTypeName($this->requestedTypename());
        if (!$lizmapLayer) {
            return (bool) $this->fail('the layer is not found');
        }
        $layer = $this->project->getLayer($lizmapLayer->id);

        // Only PostgreSQL tables, without OGC filter or forced QGIS Server request
        if (!$layer instanceof \qgisVectorLayer || $layer->getProvider() != 'postgres') {
            return (bool) $this->fail('the layer is not a PostgreSQL layer');
        }
        $this->qgisLayer = $layer;
        if (!empty($this->param('filter', ''))) {
            return (bool) $this->fail('OGC FILTER parameter is not supported');
        }
        if ($this->param('force_qgis', '') == '1') {
            return (bool) $this->fail('QGIS Server is forced');
        }
        // A table, not a SQL query: table="(SELECT ...)"
        $this->datasource = $this->qgisLayer->getDatasourceParameters();
        $table = (string) ($this->datasource->table ?? '');
        if ($table === '' || $table[0] == '(') {
            return (bool) $this->fail('the layer datasource is not a table');
        }

        return true;
    }

    /**
     * Check that the layer can be aggregated with SQL, and get its fields.
     *
     * @return null|array<string, \jDbFieldProperties> the database fields
     *                                                 published in WFS, null if not possible
     */
    protected function getAggregatableFields(): ?array
    {
        // The layer must be requested with SQL
        if (!$this->checkSqlLayer()) {
            return null;
        }

        // The primary key orders the features
        $dbFields = $this->qgisLayer->getDbFieldList();
        foreach (explode(',', $this->datasource->key) as $key) {
            if (!array_key_exists($key, $dbFields)) {
                return $this->fail('the primary key is not a table field');
            }
        }

        // Only the fields published in WFS can be used
        $fields = array();
        foreach ($this->qgisLayer->getWfsFields() as $field) {
            if (array_key_exists($field, $dbFields)) {
                $fields[$field] = $dbFields[$field];
            }
        }

        return $fields;
    }

    /**
     * Check the fields and the functions of the aggregation.
     *
     * The field names are checked against the fields published in WFS:
     * they are safe to be used in the SQL query once enclosed.
     *
     * @param array<string, \jDbFieldProperties> $fields        the available fields
     * @param list<string>                       $groupFields   the fields to group by
     * @param list<array{0: string, 1: ?string}> $aggregates    the aggregates: function and field
     * @param list<string>                       $notNullFields the group fields which must not be null
     *
     * @return bool true if the aggregation is valid
     */
    protected function validateAggregation(array $fields, array $groupFields, array $aggregates, array $notNullFields): bool
    {
        // At least one group field, all available
        if (count($groupFields) === 0) {
            return (bool) $this->fail('no group field');
        }
        foreach (array_merge($groupFields, $notNullFields) as $field) {
            if (!array_key_exists($field, $fields)) {
                return (bool) $this->fail('the field "'.$field.'" is not available');
            }
        }

        foreach ($aggregates as $aggregate) {
            list($function, $field) = $aggregate;

            // Supported function only
            if (!in_array($function, self::FUNCTIONS, true)) {
                return (bool) $this->fail('unknown aggregate function "'.$function.'"');
            }

            // The count does not use a field
            if ($function === self::COUNT) {
                continue;
            }
            if ($field === null || !array_key_exists($field, $fields)) {
                return (bool) $this->fail('the field "'.$field.'" is not available');
            }

            // The numeric functions need a numeric field: the values of a text
            // field must be converted, which can only be done outside SQL
            if (in_array($function, self::NUMERIC_FUNCTIONS, true) && !self::isNumericField($fields[$field])) {
                return (bool) $this->fail('the field "'.$field.'" is not numeric');
            }
        }

        return true;
    }

    /**
     * Build the SQL query aggregating the features.
     *
     * The query returns one row: the number of groups "lizmap_group_count",
     * then one JSON array per group field (g0, g1...) and per aggregate (a0,
     * a1...), with the values of the groups in the same order: sorted by the
     * group values, ascending, the null values last. JSON keeps the types of
     * the values (number, string, boolean).
     *
     * The position of each feature, given by the primary key, is computed
     * only for the functions using it: first, last and first not empty.
     *
     * @param \jDbConnection                     $cnx           the database connection
     * @param string                             $whereClause   the WHERE clause selecting the features
     * @param list<string>                       $groupFields   the fields to group by, already validated
     * @param list<array{0: string, 1: ?string}> $aggregates    the aggregates, already validated
     * @param list<string>                       $notNullFields the group fields which must not be null
     *
     * @return string the SQL query
     */
    protected function buildAggregateSql($cnx, string $whereClause, array $groupFields, array $aggregates, array $notNullFields): string
    {
        // Source: the selected features, with only the needed fields
        $sourceFields = array();
        foreach ($groupFields as $field) {
            $sourceFields[] = $cnx->encloseName($field);
        }
        foreach ($aggregates as $aggregate) {
            if ($aggregate[1] !== null) {
                $sourceFields[] = $cnx->encloseName($aggregate[1]);
            }
        }
        $sourceFields = array_unique($sourceFields);

        // Position of the features, given by the primary key, for the
        // functions using the order of the features
        $functions = array_map(fn (array $aggregate): string => $aggregate[0], $aggregates);
        if (array_intersect($functions, self::FEATURE_ORDER_FUNCTIONS)) {
            $keys = array_map(array($cnx, 'encloseName'), explode(',', $this->datasource->key));
            $sourceFields[] = 'row_number() OVER (ORDER BY '.implode(', ', $keys).') AS "lizmap_feature_order"';
        }

        // Ignore the features with null values for some group fields
        foreach ($notNullFields as $field) {
            $whereClause .= ' AND '.$cnx->encloseName($field).' IS NOT NULL';
        }

        // Group values, aliased g0, g1...
        $groupColumns = array();
        $groupAliases = array();
        foreach ($groupFields as $i => $field) {
            $groupColumns[] = $cnx->encloseName($field).' AS "g'.$i.'"';
            $groupAliases[] = '"g'.$i.'"';
        }

        // Aggregated values, aliased a0, a1...
        $aggregateColumns = array();
        $aggregateAliases = array();
        foreach ($aggregates as $i => $aggregate) {
            $aggregateColumns[] = $this->getAggregateSql($cnx, $aggregate[0], $aggregate[1]).' AS "a'.$i.'"';
            $aggregateAliases[] = '"a'.$i.'"';
        }

        // Order of the groups: by their values, ascending, the null values last
        $groupOrder = implode(', ', $groupAliases);

        // One JSON array per column, all in the same order of the groups
        $jsonColumns = array('count(*) AS "lizmap_group_count"');
        foreach (array_merge($groupAliases, $aggregateAliases) as $alias) {
            $jsonColumns[] = 'json_agg('.$alias.' ORDER BY '.$groupOrder.')::text AS '.$alias;
        }

        // Group the features, then build the JSON arrays of the groups
        $positions = implode(', ', range(1, count($groupFields)));

        return '
            WITH source AS (
                SELECT '.implode(', ', $sourceFields).'
                FROM '.$this->datasource->table.'
                '.$whereClause.'
            ),
            grouped AS (
                SELECT '.implode(', ', array_merge($groupColumns, $aggregateColumns)).'
                FROM source
                GROUP BY '.$positions.'
            )
            SELECT '.implode(', ', $jsonColumns).'
            FROM grouped
        ';
    }

    /**
     * Build the SQL query computing the extent of the features.
     *
     * The query returns one row with the columns xmin, ymin, xmax and ymax,
     * null if no feature has a geometry.
     *
     * @param \jDbConnection $cnx         the database connection
     * @param string         $whereClause the WHERE clause selecting the features
     * @param int            $srid        the SRID of the output CRS
     *
     * @return string the SQL query
     */
    protected function buildExtentSql($cnx, string $whereClause, int $srid): string
    {
        // Envelope of each geometry in the output CRS, as for the "extent"
        // GEOMETRYNAME: transforming the envelope is cheaper than the geometry
        $geometry = $cnx->encloseName($this->datasource->geocol).'::geometry';
        $envelope = 'ST_Transform(ST_Envelope('.$geometry.'), '.$srid.')';

        return '
            WITH extent AS (
                SELECT ST_Extent('.$envelope.') AS "bbox"
                FROM '.$this->datasource->table.'
                '.$whereClause.'
            )
            SELECT ST_XMin("bbox") AS "xmin", ST_YMin("bbox") AS "ymin",
                ST_XMax("bbox") AS "xmax", ST_YMax("bbox") AS "ymax"
            FROM extent
        ';
    }

    /**
     * Get the SQL expression of an aggregate function.
     *
     * @param \jDbConnection $cnx      the database connection
     * @param string         $function the aggregate function, already validated
     * @param null|string    $field    the field, already validated
     *
     * @return string the SQL expression
     */
    protected function getAggregateSql($cnx, string $function, ?string $field): string
    {
        $column = $field !== null ? $cnx->encloseName($field) : null;

        switch ($function) {
            case self::COUNT:
                return 'count(*)';

            case self::SUM:
                // 0 instead of null when there is no value
                return 'coalesce(sum('.$column.'), 0)';

            case self::AVG:
            case self::MIN:
            case self::MAX:
                return $function.'('.$column.')';

            case self::STDDEV:
                return 'stddev_pop('.$column.')';

            case self::MEDIAN:
                return 'percentile_cont(0.5) WITHIN GROUP (ORDER BY '.$column.'::double precision)';

            case self::FIRST:
                return '(array_agg('.$column.' ORDER BY "lizmap_feature_order"))[1]';

            case self::LAST:
                return '(array_agg('.$column.' ORDER BY "lizmap_feature_order" DESC))[1]';

            default:
                // FIRST_NOT_EMPTY
                return '(array_agg('.$column.' ORDER BY "lizmap_feature_order")'
                    .' FILTER (WHERE '.$column.' IS NOT NULL AND '.$column.'::text <> \'\'))[1]';
        }
    }

    /**
     * Tell if a database field is numeric.
     *
     * @param \jDbFieldProperties $field the field
     *
     * @return bool true if the field values are numbers
     */
    protected static function isNumericField($field): bool
    {
        // jDb gives the PostgreSQL type name without its size: int2, int4 and
        // int8 are "int", float4 and float8 are "float". The unified type is
        // not used, as it considers intervals as integers.
        return in_array($field->type, array('int', 'float', 'numeric'), true);
    }

    /**
     * Store the reason why the aggregation is not possible.
     *
     * It always returns null, so the callers can return its result directly.
     *
     * @param string $reason the reason
     */
    protected function fail(string $reason): null
    {
        $this->failureReason = $reason;

        return null;
    }
}
