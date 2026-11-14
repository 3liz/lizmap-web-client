<?php

use Lizmap\Request\WFSAggregateRequest;

/**
 * WFSAggregateRequest without project, exposing its protected methods
 * to test them without database.
 */
class WFSAggregateRequestForTests extends WFSAggregateRequest
{
    public $datasource;

    public $appContext;

    /** @var null|array The result of aggregateColumns(), without database */
    public $columnsForTests;

    /**
     * Create the request without project: set the needed properties directly.
     */
    public function __construct() {}

    /**
     * Check the fields and the functions of the aggregation.
     *
     * @param array $fields        the available fields
     * @param array $groupFields   the fields to group by
     * @param array $aggregates    the aggregates: function and field
     * @param array $notNullFields the group fields which must not be null
     *
     * @return bool true if the aggregation is valid
     */
    public function validateAggregationForTests(array $fields, array $groupFields, array $aggregates, array $notNullFields = array()): bool
    {
        return $this->validateAggregation($fields, $groupFields, $aggregates, $notNullFields);
    }

    /**
     * Build the SQL query aggregating the features.
     *
     * @param jDbConnectionForTests $cnx           the database connection
     * @param string                $whereClause   the WHERE clause
     * @param array                 $groupFields   the fields to group by
     * @param array                 $aggregates    the aggregates: function and field
     * @param array                 $notNullFields the group fields which must not be null
     *
     * @return string the SQL query
     */
    public function buildAggregateSqlForTests($cnx, string $whereClause, array $groupFields, array $aggregates, array $notNullFields = array()): string
    {
        return $this->buildAggregateSql($cnx, $whereClause, $groupFields, $aggregates, $notNullFields);
    }

    /**
     * Get the JSON arrays of the aggregation, without database.
     *
     * @param array $groupFields   the fields to group by
     * @param array $aggregates    the aggregates: function and field
     * @param array $notNullFields the group fields which must not be null
     *
     * @return null|array the columns given in $columnsForTests
     */
    public function aggregateColumns(array $groupFields, array $aggregates, array $notNullFields = array()): ?array
    {
        return $this->columnsForTests;
    }

    /**
     * Get the SQL expression of an aggregate function.
     *
     * @param jDbConnectionForTests $cnx      the database connection
     * @param string                $function the aggregate function
     * @param null|string           $field    the field
     *
     * @return string the SQL expression
     */
    public function getAggregateSqlForTests($cnx, string $function, ?string $field): string
    {
        return $this->getAggregateSql($cnx, $function, $field);
    }
}
