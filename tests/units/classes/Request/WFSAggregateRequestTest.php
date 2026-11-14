<?php

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * Tests of the aggregation of the features of a PostgreSQL layer in the
 * database: validation of the requested fields and functions, which protects
 * the SQL query, and the SQL query itself.
 *
 * The SQL query is executed by the end-to-end tests of the dataviz API.
 *
 * @internal
 *
 * @coversNothing
 */
class WFSAggregateRequestTest extends TestCase
{
    /**
     * Get the layer fields published in WFS, like the jDb field properties.
     *
     * Only the name and the type (PostgreSQL type name without size) are used.
     *
     * @return array<string, object> the fields: an integer key, a text category,
     *                               a float value, a text color and an interval
     */
    private static function getFields(): array
    {
        $fields = array();
        foreach (array('id' => 'int', 'category' => 'varchar', 'value' => 'float', 'color' => 'text', 'duration' => 'interval') as $name => $type) {
            $fields[$name] = (object) array('name' => $name, 'type' => $type);
        }

        return $fields;
    }

    /**
     * Create the request for a table with the primary key "id".
     *
     * @return WFSAggregateRequestForTests the request
     */
    private static function getRequest(): WFSAggregateRequestForTests
    {
        $request = new WFSAggregateRequestForTests();
        $request->appContext = new ContextForTests();
        $request->datasource = (object) array(
            'key' => 'id',
            'table' => '"schema"."table"',
        );

        return $request;
    }

    /**
     * Get valid and invalid aggregations.
     *
     * @return array<string, array> the group fields, the aggregates, the not null fields
     *                              and the expected failure reason (null if valid)
     */
    public static function getValidationData(): array
    {
        return array(
            'valid' => array(
                array('category'),
                array(array('sum', 'value'), array('count', null), array('first_not_empty', 'color')),
                array('category'),
                null,
            ),
            // The count does not need a field, first and last accept any field
            'count and first of text fields' => array(
                array('category'),
                array(array('count', null), array('first', 'color'), array('last', 'category')),
                array(),
                null,
            ),
            'no group field' => array(
                array(),
                array(array('count', null)),
                array(),
                'no group field',
            ),
            // Fields not published in WFS, or field names trying to inject SQL
            'unpublished group field' => array(
                array('secret'),
                array(array('count', null)),
                array(),
                'the field "secret" is not available',
            ),
            'injection in group field' => array(
                array('category" FROM pg_user; --'),
                array(array('count', null)),
                array(),
                'the field "category" FROM pg_user; --" is not available',
            ),
            'unpublished aggregated field' => array(
                array('category'),
                array(array('sum', 'secret')),
                array(),
                'the field "secret" is not available',
            ),
            'unpublished not null field' => array(
                array('category'),
                array(array('count', null)),
                array('secret'),
                'the field "secret" is not available',
            ),
            'unknown function' => array(
                array('category'),
                array(array('pg_sleep', 'value')),
                array(),
                'unknown aggregate function "pg_sleep"',
            ),
            // The numeric functions need a numeric field: the PHP aggregation
            // is used for the numeric strings of text fields
            'sum of a text field' => array(
                array('category'),
                array(array('sum', 'color')),
                array(),
                'the field "color" is not numeric',
            ),
            'median of an interval' => array(
                array('category'),
                array(array('median', 'duration')),
                array(),
                'the field "duration" is not numeric',
            ),
        );
    }

    /**
     * Test the validation of the fields and functions of the aggregation.
     *
     * @param array       $groupFields    the fields to group by
     * @param array       $aggregates     the aggregates: function and field
     * @param array       $notNullFields  the group fields which must not be null
     * @param null|string $expectedReason the expected failure reason, null if valid
     */
    #[DataProvider('getValidationData')]
    public function testValidateAggregation(array $groupFields, array $aggregates, array $notNullFields, ?string $expectedReason): void
    {
        $request = self::getRequest();

        $valid = $request->validateAggregationForTests(self::getFields(), $groupFields, $aggregates, $notNullFields);

        $this->assertSame($expectedReason === null, $valid);
        $this->assertSame($expectedReason, $request->getFailureReason());
    }

    /**
     * Get the aggregate functions and their SQL expression.
     *
     * @return array<string, array{0: string, 1: ?string, 2: string}> the function,
     *                                                                the field and the expected SQL
     */
    public static function getAggregateSqlData(): array
    {
        return array(
            'count' => array('count', null, 'count(*)'),
            // 0 instead of null, as the aggregation in PHP
            'sum' => array('sum', 'value', 'coalesce(sum("value"), 0)'),
            'avg' => array('avg', 'value', 'avg("value")'),
            'min' => array('min', 'value', 'min("value")'),
            'max' => array('max', 'value', 'max("value")'),
            'stddev' => array('stddev', 'value', 'stddev_pop("value")'),
            'median' => array('median', 'value', 'percentile_cont(0.5) WITHIN GROUP (ORDER BY "value"::double precision)'),
            // First and last in the order of the primary key
            'first' => array('first', 'value', '(array_agg("value" ORDER BY "lizmap_feature_order"))[1]'),
            'last' => array('last', 'value', '(array_agg("value" ORDER BY "lizmap_feature_order" DESC))[1]'),
            'first not empty' => array(
                'first_not_empty',
                'color',
                '(array_agg("color" ORDER BY "lizmap_feature_order") FILTER (WHERE "color" IS NOT NULL AND "color"::text <> \'\'))[1]',
            ),
        );
    }

    /**
     * Test the SQL expression of each aggregate function.
     *
     * @param string      $function    the aggregate function
     * @param null|string $field       the field
     * @param string      $expectedSql the expected SQL expression
     */
    #[DataProvider('getAggregateSqlData')]
    public function testGetAggregateSql(string $function, ?string $field, string $expectedSql): void
    {
        $sql = self::getRequest()->getAggregateSqlForTests(new jDbConnectionForTests(), $function, $field);

        $this->assertSame($expectedSql, $sql);
    }

    /**
     * Test the SQL query grouping the features.
     */
    public function testBuildAggregateSql(): void
    {
        $sql = self::getRequest()->buildAggregateSqlForTests(
            new jDbConnectionForTests(),
            ' WHERE True AND ( "value" > 10 )',
            array('parent', 'category'),
            array(array('sum', 'value'), array('first_not_empty', 'color')),
            array('category'),
        );
        // Compare without the indentation
        $sql = preg_replace('/\s+/', ' ', trim($sql));

        // The features: the selected fields, without duplicate, with their position
        // given by the primary key for first_not_empty, filtered by the WHERE clause,
        // without null category
        $this->assertStringContainsString(
            'WITH source AS ( SELECT "parent", "category", "value", "color",'
            .' row_number() OVER (ORDER BY "id") AS "lizmap_feature_order"'
            .' FROM "schema"."table" WHERE True AND ( "value" > 10 ) AND "category" IS NOT NULL )',
            $sql
        );

        // The groups, with the aggregated values
        $this->assertStringContainsString(
            'grouped AS ( SELECT "parent" AS "g0", "category" AS "g1",'
            .' coalesce(sum("value"), 0) AS "a0",',
            $sql
        );
        $this->assertStringContainsString('AS "a1" FROM source GROUP BY 1, 2 )', $sql);

        // The number of groups, and one JSON array per column, sorted by the group values
        $this->assertStringContainsString(
            'SELECT count(*) AS "lizmap_group_count",'
            .' json_agg("g0" ORDER BY "g0", "g1")::text AS "g0",'
            .' json_agg("g1" ORDER BY "g0", "g1")::text AS "g1",'
            .' json_agg("a0" ORDER BY "g0", "g1")::text AS "a0",'
            .' json_agg("a1" ORDER BY "g0", "g1")::text AS "a1" FROM grouped',
            $sql
        );
    }

    /**
     * Test that the position of the features is not computed when no
     * function uses it, and that no condition is added without not null field.
     */
    public function testBuildAggregateSqlWithoutFeatureOrder(): void
    {
        $sql = self::getRequest()->buildAggregateSqlForTests(
            new jDbConnectionForTests(),
            ' WHERE True',
            array('category'),
            array(array('count', null), array('sum', 'value')),
        );
        $sql = preg_replace('/\s+/', ' ', trim($sql));

        $this->assertStringNotContainsString('row_number()', $sql);
        $this->assertStringContainsString('WITH source AS ( SELECT "category", "value" FROM "schema"."table" WHERE True )', $sql);
        $this->assertStringContainsString('json_agg("a0" ORDER BY "g0")::text AS "a0"', $sql);
    }

    /**
     * Test that aggregate() builds one row per group from the JSON columns.
     */
    public function testAggregateRows(): void
    {
        $request = self::getRequest();
        $request->columnsForTests = array(
            'count' => 2,
            'groups' => array('["P1", null]', '["A", "B"]'),
            'aggregates' => array('[1.5, 2]', '["red", null]'),
        );

        // The group values and the aggregated values of each group
        $this->assertSame(
            array(
                array(array('P1', 'A'), array(1.5, 'red')),
                array(array(null, 'B'), array(2, null)),
            ),
            $request->aggregate(array('parent', 'category'), array(array('sum', 'value'), array('first_not_empty', 'color')))
        );

        // No group: no row
        $request->columnsForTests = array('count' => 0, 'groups' => array('[]'), 'aggregates' => array('[]'));
        $this->assertSame(array(), $request->aggregate(array('category'), array(array('count', null))));

        // Aggregation not possible
        $request->columnsForTests = null;
        $this->assertNull($request->aggregate(array('category'), array(array('count', null))));
    }
}
