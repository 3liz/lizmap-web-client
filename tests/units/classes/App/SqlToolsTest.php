<?php

use Lizmap\App\SqlTools;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
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
        );
    }

    #[DataProvider('getValidateExpressionFilterData')]
    public function testValidateExpressionFilter($filter, $expectedResult): void
    {
        $valid = SqlTools::validateExpressionFilter($filter);
        $this->assertEquals($expectedResult, $valid);
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
     * @dataProvider getTranslateExpressionToPostgisData
     *
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
