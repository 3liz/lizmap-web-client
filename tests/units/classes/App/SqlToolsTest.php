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
            array('--', false),
            array('truncate ', false),
            array('vacuum ', false),
            array('create ', false),
            array('grant ', false),
            array('revoke ', false),
            array('selectoioio', false),
            array('test intersects other test', true),
            array('test geom_from_gml other test', true),
            array('test intersects $geometry', true),
            array('$id IN (1)', true),
            array('$id IN (1, 2)', true),
            array('"id" IN (1)', true),
            array('"id" IN (1, 2)', true),
            array('"id" IN (\'test\')', true),
            array('("foo" = \'test\' AND "id" = 55)', true),
            array('("foo" = \'test\' AND "id" = 55) OR ("foo" = \'bar\' AND "id" = 44)', true),
            array('("foo" = \'test\' AND "id" = 55) OR ("foo" = \'bar\' AND "id" = 44); -- SELECT * FROM jlx_user', false),
        );
    }

    #[DataProvider('getValidateExpressionFilterData')]
    public function testValidateExpressionFilter($filter, $expectedResult): void
    {
        [$valid, $blocked] = SqlTools::validateExpressionFilter($filter);
        $this->assertEquals($expectedResult, $valid);
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
