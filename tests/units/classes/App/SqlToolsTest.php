<?php

use Lizmap\App\SqlTools;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 */
#[CoversNothing]
class SqlToolsTest extends TestCase
{
    public static function getValidateExpressionFilterData()
    {
        return array(
            array(';', false),
            array('select * from test', false),
            array('delete table', false),
            array('insert ', false),
            array('update ', false),
            array('drop ', false),
            array('alter ', false),
            array('--', true),
            array("-- foo\n\"foo\" = 'bar'", true),
            array("-- foo\r\n\"foo\" = 'bar'", true),
            array("-- foo\r\"foo\" = 'bar'", true),
            array("\"foo\" = 1 -- foo\r) UNION SELECT 1 --", false),
            array("\"foo\" = 1 -- foo\r\n) UNION SELECT 1 --", false),
            array("/* hello\n   world */ \"foo\" = 'bar'", true),
            array("foo = 'bar'", false), // columns must be quoted
            array('truncate ', false),
            array('vacuum ', false),
            array('create ', false),
            array('grant ', false),
            array('revoke ', false),
            array('selectoioio', false),
            array('"id" = 1 UNION SELECT bird_name AS v, bird_scientific_name AS c FROM tests_projects.birds--', false),
            array('("foo" = \'test\' AND "id" = 55) OR ("foo" = \'bar\' AND "id" = 44); -- SELECT * FROM jlx_user', false),
            array('intersects( $geometry', false),
            array('$id IN (1)', true),
            array('$id IN (1)', true),
            array('$id IN (1, 2)', true),
            array('"id" IN (1)', true),
            array('"id" IN (1, 2)', true),
            array('"id" IN (\'test\')', true),
            array('("foo" = \'test\' AND "id" = 55)', true),
            array('("foo" = \'test\' AND "id" = 55) OR ("foo" = \'bar\' AND "id" = 44)', true),
            array('intersects($geometry, geom_from_gml(\'some gml\'))', true),
            // A double quoted identifier can not be used as a function
            array('"upper"(\'a\') = \'A\'', false),
            array('"upper" (\'a\') = \'A\'', false),
            array('"upper" /* a */ (\'a\') = \'A\'', false),
            array("\"upper\" -- a\n('a') = 'A'", false),
            array('"id" IN (1)', true),
            array('"id" = 1 AND ("id" > 0)', true),
        );
    }

    #[DataProvider('getValidateExpressionFilterData')]
    public function testValidateExpressionFilter($filter, $expectedResult): void
    {
        $valid = SqlTools::validateExpressionFilter($filter);
        $this->assertEquals($expectedResult, $valid);
    }

    /**
     * Provide filters of the features table, with the field names of the layer, and the expected validity.
     *
     * @return array the filters, the field names and the expected results
     */
    public static function getValidateFeaturesTableFilterData()
    {
        $fields = array('quartmno', 'LIBQUART', 'env', 'attribute');

        return array(
            // Filters of the features table, built by Lizmap or written in a maptip
            array("quartmno = 'MC'", $fields, true),
            array("LIBQUART ILIKE 'M%'", $fields, true),
            array("libquart = 'a' AND \"quartmno\" IN ('MC', 'PA')", $fields, true),
            array('FALSE', $fields, true),
            array('null', $fields, true),
            // Operators and QGIS functions without risk
            array("\"quartmno\" <> 'MC'", $fields, true),
            array("\"libquart\" || 'x' = 'ax'", $fields, true),
            array('"quartmno" + 1 > 2 AND "quartmno" * 2 < 10', $fields, true),
            array("\"libquart\" ~ '^M'", $fields, true),
            array("if(\"quartmno\" = 'MC', true, false)", $fields, true),
            array("to_string(\"quartmno\") = '1'", $fields, true),
            array("regexp_match(\"libquart\", 'M')", $fields, true),
            array("year(to_date('2024-01-02')) = 2024", $fields, true),
            array("array_contains(string_to_array(\"libquart\", ','), 'a')", $fields, true),
            array("attribute('quartmno') = 'MC'", $fields, true),
            // A field name, not a function
            array("env = 'MC'", $fields, true),
            array("env('HOME') = '/home/qgis'", $fields, false),
            array("env ('HOME') = '/home/qgis'", $fields, false),
            array("env /* comment */ ('HOME') = '/home/qgis'", $fields, false),
            // Unknown field or function
            array("other = 'MC'", $fields, false),
            array("quartmno = 'MC'", array(), false),
            array("represent_value(\"quartmno\") = 'MC'", $fields, false),
            // Functions reading other layers or the server environment
            array("aggregate('layer', 'count', 1) = 3", $fields, false),
            array("attribute(get_feature_by_id('layer', 1), 'user') = 'admin'", $fields, false),
            array("get_feature('layer', 'id', 1) IS NOT NULL", $fields, false),
            array("relation_aggregate('relation', 'count', 1) > 0", $fields, false),
            array("overlay_intersects('layer')", $fields, false),
            array("file_exists('/etc/passwd')", $fields, false),
            array('@project_path IS NOT NULL', $fields, false),
            array("eval('1') = 1", $fields, false),
            // Not a single expression
            array("quartmno = 'MC'; SELECT 1", $fields, false),
        );
    }

    /**
     * Check the validation of a filter of the features table.
     *
     * The QGIS expression tokens without risk are allowed, and the field names
     * of the layer, which can not be used as functions.
     *
     * @param string   $filter         The filter to validate
     * @param string[] $fields         The field names of the layer
     * @param bool     $expectedResult The expected validity
     */
    #[DataProvider('getValidateFeaturesTableFilterData')]
    public function testValidateFeaturesTableFilter($filter, $fields, $expectedResult): void
    {
        $valid = SqlTools::validateExpressionFilter($filter, SqlTools::QGIS_EXPRESSION_TOKENS, $fields);
        $this->assertEquals($expectedResult, $valid, $filter);
    }

    /**
     * The QGIS expression tokens are not allowed in the WFS filters run as SQL.
     */
    public function testQgisExpressionTokensNotInSqlFilters(): void
    {
        $this->assertFalse(SqlTools::validateExpressionFilter("\"name\" || 'x' = 'ax'"));
        $this->assertFalse(SqlTools::validateExpressionFilter('if("id" = 1, true, false)'));
        $this->assertFalse(SqlTools::validateExpressionFilter('"id" + 1 > 2'));
    }

    /**
     * Provide SQL filters and the column names they reference.
     *
     * @return array the filters and the expected column names
     */
    public static function getSQLStringColumnNamesData()
    {
        return array(
            // No column
            array('', array()),
            array('1 = 1', array()),
            // Quoted columns, with escaped double quotes and spaces
            array('"id" IN (1, 2)', array('id')),
            array('("foo" = \'test\' AND "id" = 55) OR ("foo" = \'bar\')', array('foo', 'id')),
            array('"my ""quoted"" field" = 1', array('my "quoted" field')),
            array('"Name" ILIKE \'%a%\'', array('Name')),
            // Strings and comments are ignored
            array('"name" = \'"secret" it intersects here\'', array('name')),
            array('"name" = \'it\'\'s "secret"\'', array('name')),
            array("\"a\" = 1 -- \"secret\"\n AND \"b\" = 2", array('a', 'b')),
            array('"a" = 1 /* "secret" */', array('a')),
            // Keywords, variables and function calls are not columns
            array('"a" IS NOT NULL AND "b" BETWEEN 1 AND 2', array('a', 'b')),
            array('"d" < current_date', array('d')),
            array('$id IN (1)', array()),
            array('intersects($geometry, geom_from_gml(\'g\'))', array()),
            array('lower ("name") = \'a\'', array('name')),
            // Whitelisted bare words used as columns, in lowercase
            array('age > 30', array('age')),
            array('"a" = 1 AND Length = 2', array('a', 'length')),
            // The table qualifier is also returned
            array('"table"."secret" = 1', array('table', 'secret')),
        );
    }

    /**
     * Test the column names referenced by a SQL filter.
     *
     * @param string   $filter   the SQL filter
     * @param string[] $expected the expected column names
     */
    #[DataProvider('getSQLStringColumnNamesData')]
    public function testGetSQLStringColumnNames($filter, $expected): void
    {
        $this->assertEquals($expected, SqlTools::getSQLStringColumnNames($filter));
    }

    public static function getTranslateExpressionToPostgisData()
    {
        return array(
            // Every geometry predicate offered by the selection tool must be
            // translated to its PostGIS ST_* equivalent, not only "intersects".
            array('intersects($geometry, geom_from_gml(\'g\'))', 'geom', 'ST_Intersects("geom", ST_GeomFromGML(\'g\'))'),
            array('contains($geometry, geom_from_gml(\'g\'))', 'geom', 'ST_Contains("geom", ST_GeomFromGML(\'g\'))'),
            array('within($geometry, geom_from_gml(\'g\'))', 'geom', 'ST_Within("geom", ST_GeomFromGML(\'g\'))'),
            array('crosses($geometry, geom_from_gml(\'g\'))', 'geom', 'ST_Crosses("geom", ST_GeomFromGML(\'g\'))'),
            array('overlaps($geometry, geom_from_gml(\'g\'))', 'geom', 'ST_Overlaps("geom", ST_GeomFromGML(\'g\'))'),
            array('touches($geometry, geom_from_gml(\'g\'))', 'geom', 'ST_Touches("geom", ST_GeomFromGML(\'g\'))'),
            array('disjoint($geometry, geom_from_gml(\'g\'))', 'geom', 'ST_Disjoint("geom", ST_GeomFromGML(\'g\'))'),
            // Operators are matched case-insensitively and tolerate whitespace before "(".
            array('INTERSECTS ($geometry, geom_from_gml(\'g\'))', 'geom', 'ST_Intersects("geom", ST_GeomFromGML(\'g\'))'),
            // A predicate combined with another expression must keep both parts.
            array('"field" > 3 AND within($geometry, geom_from_gml(\'g\'))', 'the_geom', '"field" > 3 AND ST_Within("the_geom", ST_GeomFromGML(\'g\'))'),
            // A bare word that is not a function call must be left untouched.
            array('"name" = \'it intersects here\'', 'geom', '"name" = \'it intersects here\''),
        );
    }

    /**
     * @param mixed $filter
     * @param mixed $geometryColumn
     * @param mixed $expected
     */
    #[DataProvider('getTranslateExpressionToPostgisData')]
    public function testTranslateExpressionToPostgis($filter, $geometryColumn, $expected): void
    {
        $this->assertEquals($expected, SqlTools::translateExpressionToPostgis($filter, $geometryColumn));
    }
}
