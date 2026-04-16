<?php

use Lizmap\Project\Repository;
use Lizmap\Request\WFSRequest;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class WFSRequestTest extends TestCase
{
    public function testParameters(): void
    {
        $wfs = new WFSRequest(new ProjectForOGCForTests(), array('request' => 'notGetFeature'), null);
        $expectedParameters = array(
            'request' => 'notGetFeature',
            'map' => null,
            'Lizmap_User' => '',
            'Lizmap_User_Groups' => '',
        );
        $parameters = $wfs->parameters();
        $this->assertEquals($expectedParameters, $parameters);
        $proj = new ProjectForOGCForTests();
        $proj->setRepo(new Repository('test', array(), '', null, new ContextForTests()));
        $wfs = new WFSRequest($proj, array('request' => 'notGetFeature'), null);
        $parameters = $wfs->parameters();
        $this->assertEquals($expectedParameters, $parameters);
    }

    public static function getParametersWithFiltersData()
    {
        $params1 = array(
            'request' => 'getfeature',
            'typename' => 'type,name,for,test',
        );
        $filters1 = array(
            'type' => array(
                'filter' => 'filter',
                'filterAttribute' => 'attr',
            ),
            'name' => array(
                'filter' => 'test',
                'filterAttribute' => 'test attr',
            ),
        );
        $expected1 = array(
            'request' => 'getfeature',
            'typename' => 'type,name,for,test',
            'map' => null,
            'Lizmap_User' => '',
            'Lizmap_User_Groups' => '',
            'exp_filter' => '( filter ) AND ( test )',
        );

        $params2 = array(
            'request' => 'getfeature',
            'typename' => 'type,name,for,test',
            'exp_filter' => 'testParam',
            'propertyname' => 'prop  ',
        );
        $expected2 = array(
            'request' => 'getfeature',
            'typename' => 'type,name,for,test',
            'map' => null,
            'Lizmap_User' => '',
            'Lizmap_User_Groups' => '',
            'exp_filter' => '( testParam ) AND ( filter ) AND ( test )',
            'propertyname' => 'prop,test attr',
        );

        return array(
            array($params1, $filters1, $expected1),
            array($params2, $filters1, $expected2),
        );
    }

    /**
     * @dataProvider getParametersWithFiltersData
     *
     * @param mixed $params
     * @param mixed $loginFilters
     * @param mixed $expectedParameters
     */
    #[DataProvider('getParametersWithFiltersData')]
    public function testParametersWithFilters($params, $loginFilters, $expectedParameters): void
    {
        $testContext = new ContextForTests();
        $testContext->setResult(array('lizmap.tools.loginFilteredLayers.override' => false));
        $proj = new ProjectForOGCForTests($testContext);
        $proj->loginFilters = $loginFilters;
        $proj->setRepo(new Repository('test', array(), '', null, $testContext));
        $wfs = new WFSRequest($proj, $params, null);
        $parameters = $wfs->parameters();
        $this->assertEquals($expectedParameters, $parameters);
    }

    public static function getGetFeatureIdFilterExpData()
    {
        return array(
            array('', '', '', array()), // nothing
            array('type.1', '', '', array()), // only featureid
            array('type', 'type', '', array()), // featureid not well formed
            array('type.', 'type', '', array()), // fetaureid not well formed
            array('type.1', 'typed', '', array()), // featureid and typename are not for the same layer
            array('type.test@@55', 'type', '', array()), // featureid with multi fields key not for postgres layer
            array('type.test@@55', 'type', '', array('provider' => 'postgres')), // featureid with multi fields key for postgres layer with simple field key
            array('type.1', 'type', '$id IN (1)', array()),
            array('type.1,type.2', 'type', '$id IN (1, 2)', array()),
            array('type.1', 'type', '"id" IN (1)', array('provider' => 'postgres')),
            array('type.1,type.2', 'type', '"id" IN (1, 2)', array('provider' => 'postgres')),
            array('type.test', 'type', '"id" IN (\'test\')', array('provider' => 'postgres')),
            array('type.test@@55', 'type', '("foo" = \'test\' AND "id" = 55)', array('provider' => 'postgres', 'dtparams' => array('key' => 'foo,id'))),
            array('type.test@@55,type.bar@@44', 'type', '("foo" = \'test\' AND "id" = 55) OR ("foo" = \'bar\' AND "id" = 44)', array('provider' => 'postgres', 'dtparams' => array('key' => 'foo,id'))),
        );
    }

    /**
     * @dataProvider getGetFeatureIdFilterExpData
     *
     * @param mixed $featureid
     * @param mixed $typename
     * @param mixed $expectedExpFilter
     * @param mixed $layerOptions
     */
    #[DataProvider('getGetFeatureIdFilterExpData')]
    public function testGetFeatureIdFilterExp($featureid, $typename, $expectedExpFilter, $layerOptions): void
    {
        $wfs = new WFSRequestForTests();
        $qgisLayer = new LayerWFSForTests();
        if ($layerOptions) {
            if (array_key_exists('provider', $layerOptions)) {
                $qgisLayer->provider = $layerOptions['provider'];
            }
            if (array_key_exists('dtparams', $layerOptions)) {
                $qgisLayer->dtparams = $layerOptions['dtparams'];
            }
        }
        $expFilter = $wfs->getFeatureIdFilterExpForTests($featureid, $typename, $qgisLayer);
        $this->assertEquals($expectedExpFilter, $expFilter);
    }

    public static function getBuildQueryBaseData()
    {
        $paramsComplete = array(
            'propertyname' => 'prop,erty,name',
            'geometryname' => 'geom',
        );
        $wfsFields = array('prop', 'name', 'notProp');
        $paramsGeom = array(
            'geometryname' => 'geom',
        );
        $paramsProp = array(
            'propertyname' => 'prop,erty,name',
            'geometryname' => 'none',
        );

        return array(
            array($paramsComplete, $wfsFields, array('"prop"', '"name"', '"key"', '"geom"', '"test"'), ' SELECT "prop", "name", "key", "geom", "test", "geocol" AS "geosource" FROM table'),
            array($paramsGeom, $wfsFields, array('"prop"', '"name"', '"notProp"', '"key"', '"geom"', '"test"'), ' SELECT "prop", "name", "notProp", "key", "geom", "test", "geocol" AS "geosource" FROM table'),
            array($paramsProp, $wfsFields, array('"prop"', '"name"', '"key"', '"geom"', '"test"'), ' SELECT "prop", "name", "key", "geom", "test" FROM table'),
        );
    }

    /**
     * @dataProvider getBuildQueryBaseData
     *
     * @param mixed $params
     * @param mixed $wfsFields
     * @param mixed $expectedSelectFields
     * @param mixed $expectedSql
     */
    #[DataProvider('getBuildQueryBaseData')]
    public function testBuildQueryBase($params, $wfsFields, $expectedSelectFields, $expectedSql): void
    {
        $cnx = new jDbConnectionForTests();
        $wfs = new WFSRequestForTests();
        $wfs->datasource = (object) array(
            'key' => 'key,prop,geom,test',
            'geocol' => 'geocol',
            'table' => 'table',
        );
        $sql = $wfs->buildQueryBaseForTests($cnx, $params, $wfsFields);
        $this->assertEquals($expectedSql, $sql);
        $this->assertEquals($expectedSelectFields, $wfs->selectFields);
    }

    public static function getGetBboxSqlData()
    {
        return array(
            array('', array(), ''),
            array('geocol', array(), ''),
            array('geocol', array('bbox' => 'test, not, 4'), ''),
            array('geocol', array('bbox' => 'test, not, num, eric'), ''),
            array('geocol', array('bbox' => '1  , 2.2323, 1234, 4242'), ' AND ST_Intersects("geocol", ST_MakeEnvelope(1,2.2323,1234,4242, SRID))'),

            // WFS 1.1.0: CRS appended as 5th BBOX element → extracted and used as input SRID;
            // envelope is then reprojected to the layer SRID (returned as 'SRID' by the mock).
            array('geocol', array('bbox' => '421900,5397601,440825,5412976,EPSG:3857'), ' AND ST_Intersects("geocol", ST_Transform(ST_MakeEnvelope(421900,5397601,440825,5412976, 3857), SRID))'),

            // Explicit SRSNAME param takes priority over the 5th BBOX element.
            array('geocol', array('bbox' => '421900,5397601,440825,5412976,EPSG:3857', 'srsname' => 'EPSG:2154'), ' AND ST_Intersects("geocol", ST_Transform(ST_MakeEnvelope(421900,5397601,440825,5412976, 2154), SRID))'),

            // 6 elements → still invalid, returns empty.
            array('geocol', array('bbox' => '1,2,3,4,5,6'), ''),

            // 5 elements but 5th is not a valid CRS string → a warning is logged and
            // the input CRS falls back to the layer SRID (no ST_Transform wrapping).
            array('geocol', array('bbox' => '1,2,3,4,notacrs'), ' AND ST_Intersects("geocol", ST_MakeEnvelope(1,2,3,4, SRID))'),

            // Garbage SRSNAME param → logged and fallback to layer SRID (no ST_Transform).
            array('geocol', array('bbox' => '1,2,3,4', 'srsname' => 'not-a-crs'), ' AND ST_Intersects("geocol", ST_MakeEnvelope(1,2,3,4, SRID))'),
        );
    }

    /**
     * @dataProvider getGetBboxSqlData
     *
     * @param mixed $geocol
     * @param mixed $params
     * @param mixed $expectedSql
     */
    #[DataProvider('getGetBboxSqlData')]
    public function testGetBboxSql($geocol, $params, $expectedSql): void
    {
        $wfs = new WFSRequestForTests();
        $wfs->datasource = (object) array(
            'geocol' => $geocol,
        );
        $wfs->qgisLayer = new LayerWFSForTests();
        // Needed for the invalid-SRSNAME code path which calls logMessage.
        $wfs->appContext = new ContextForTests();
        $sql = $wfs->getBboxSqlForTests($params);
        $bboxDesc = isset($params['bbox']) ? $params['bbox'] : '(none)';
        $srsDesc = isset($params['srsname']) ? $params['srsname'] : '(none)';
        $this->assertEquals(
            $expectedSql,
            $sql,
            "getBboxSql mismatch — geocol=\"{$geocol}\" bbox=\"{$bboxDesc}\" srsname=\"{$srsDesc}\"\n"
            ."Expected SQL : \"{$expectedSql}\"\n"
            ."Actual SQL   : \"{$sql}\""
        );
    }

    public static function getParseExpFilterData()
    {
        return array(
            array(array(), '', ''),
            array(array('exp_filter' => 'select'), '', false),
            array(array('exp_filter' => 'filter for test'), '', ' AND ( filter for test ) '),
            array(array('exp_filter' => 'filter for test with $id = 5'), 'key', ' AND ( filter for test with "key" = 5 ) '),
            array(array('exp_filter' => 'filter for test with $id = 5'), 'key,otherKey', false),
        );
    }

    /**
     * @dataProvider getParseExpFilterData
     *
     * @param mixed $params
     * @param mixed $key
     * @param mixed $expectedSql
     */
    #[DataProvider('getParseExpFilterData')]
    public function testParseExpFilter($params, $key, $expectedSql): void
    {
        $wfs = new WFSRequestForTests();
        $wfs->appContext = new ContextForTests();
        $wfs->datasource = (object) array('key' => $key, 'geocol' => 'geom');
        $result = $wfs->parseExpFilterForTests(new jDbConnectionForTests(), $params);
        $this->assertEquals($expectedSql, $result);
    }

    public static function getParseFeatureData()
    {
        return array(
            array('', '', '', ''),
            array('type', 'type.test@@55', 'key,otherKey', ' AND ("key" = \'test\' AND "otherKey" = 55)'),
            array('type', 'type.test@@55,you shall not pass,type.name@@42', 'key,otherKey', ' AND ("key" = \'test\' AND "otherKey" = 55) OR ("key" = \'name\' AND "otherKey" = 42)'),
            array('', 'type.test@@55', 'key,otherKey', ' AND ("key" = \'test\' AND "otherKey" = 55)'),
        );
    }

    /**
     * @dataProvider getParseFeatureData
     *
     * @param mixed $typename
     * @param mixed $featureId
     * @param mixed $keys
     * @param mixed $expectedSql
     */
    #[DataProvider('getParseFeatureData')]
    public function testParseFeatureId($typename, $featureId, $keys, $expectedSql): void
    {
        $params = array(
            'typename' => $typename,
            'featureid' => $featureId,
        );
        $wfs = new WFSRequestForTests();
        $wfs->datasource = (object) array('key' => $keys);
        $sql = $wfs->parseFeatureIdForTests(new jDbConnectionForTests(), $params);
        $this->assertEquals($expectedSql, $sql);
    }

    public static function getGetQueryOrderData()
    {
        return array(
            array(array(), array(), ''),
            array(array('sortby' => ''), array(), ''),
            array(array('sortby' => 'id a,test d,wfs a'), array(), ''),
            array(array('sortby' => 'id a,test d,wfs a'), array('test', 'field', 'wfs'), ' ORDER BY "test" DESC, "wfs" ASC'),
            // Test with uppercase 'D'
            array(array('sortby' => 'id a,test D,wfs a'), array('test', 'field', 'wfs'), ' ORDER BY "test" DESC, "wfs" ASC'),
            // Test with 'desc' keyword (lowercase)
            array(array('sortby' => 'id a,test desc,wfs a'), array('test', 'field', 'wfs'), ' ORDER BY "test" DESC, "wfs" ASC'),
            // Test with 'DESC' keyword (uppercase)
            array(array('sortby' => 'id a,test DESC,wfs a'), array('test', 'field', 'wfs'), ' ORDER BY "test" DESC, "wfs" ASC'),
            // Test with '+d' prefix
            array(array('sortby' => 'id a,test +d,wfs a'), array('test', 'field', 'wfs'), ' ORDER BY "test" DESC, "wfs" ASC'),
            // Test with '+D' prefix
            array(array('sortby' => 'id a,test +D,wfs a'), array('test', 'field', 'wfs'), ' ORDER BY "test" DESC, "wfs" ASC'),
            // Test with '+desc' prefix
            array(array('sortby' => 'id a,test +desc,wfs a'), array('test', 'field', 'wfs'), ' ORDER BY "test" DESC, "wfs" ASC'),
            // Test with '+DESC' prefix
            array(array('sortby' => 'id a,test +DESC,wfs a'), array('test', 'field', 'wfs'), ' ORDER BY "test" DESC, "wfs" ASC'),
            // Test with mixed case variations
            array(array('sortby' => 'id Desc,test +D,wfs desc'), array('id', 'test', 'wfs'), ' ORDER BY "id" DESC, "test" DESC, "wfs" DESC'),
            // Test single field with DESC
            array(array('sortby' => 'id desc'), array('id'), ' ORDER BY "id" DESC'),
            // Test single field with +DESC
            array(array('sortby' => 'id +DESC'), array('id'), ' ORDER BY "id" DESC'),
        );
    }

    /**
     * @dataProvider getGetQueryOrderData
     *
     * @param mixed $params
     * @param mixed $wfsFields
     * @param mixed $expectedSql
     */
    #[DataProvider('getGetQueryOrderData')]
    public function testGetQueryOrder($params, $wfsFields, $expectedSql): void
    {
        $wfs = new WFSRequestForTests();
        $result = '';
        $result = $wfs->getQueryOrderForTests(new jDbConnectionForTests(), $params, $wfsFields);
        $this->assertEquals($expectedSql, $result);
    }

    public static function getValidateExpressionFilterData()
    {
        return array(
            array(';', false),
            array('select', false),
            array('delete', false),
            array('insert', false),
            array('update', false),
            array('drop', false),
            array('alter', false),
            array('--', false),
            array('truncate', false),
            array('vacuum', false),
            array('create', false),
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

    /**
     * @dataProvider getValidateExpressionFilterData
     *
     * @param mixed $filter
     * @param mixed $expectedResult
     */
    #[DataProvider('getValidateExpressionFilterData')]
    public function testValidateExpressionFilter($filter, $expectedResult): void
    {
        $wfs = new WFSRequestForTests();
        $wfs->appContext = new ContextForTests();
        $this->assertEquals($expectedResult, $wfs->validateExpressionFilterForTests($filter));
    }

    public static function getValidateFilterData()
    {
        return array(
            array('select', false),
            array('selectoioio', false),
            array('test intersects other test', 'test ST_Intersects other test'),
            array('test geom_from_gml other test', 'test ST_GeomFromGML other test'),
            array('test intersects $geometry', 'test ST_Intersects "column"'),
        );
    }

    /**
     * @dataProvider getValidateFilterData
     *
     * @param mixed $filter
     * @param mixed $expectedFilter
     */
    #[DataProvider('getValidateFilterData')]
    public function testValidateFilter($filter, $expectedFilter): void
    {
        $wfs = new WFSRequestForTests();
        $wfs->appContext = new ContextForTests();
        $wfs->datasource = (object) array(
            'geocol' => 'column',
        );
        $this->assertEquals($expectedFilter, $wfs->validateFilterForTests($filter));
    }

    public static function getParseDatasourceSqlData()
    {
        return array(
            array('', ''),
            array('"field_a" > 30 ', ' AND ( "field_a" > 30 ) '),
            array('  "field_a" > 30 OR "other" = 10       ', ' AND ( "field_a" > 30 OR "other" = 10 ) '),
        );
    }

    /**
     * @dataProvider getParseDatasourceSqlData
     *
     * @param mixed $sql
     * @param mixed $expectedSql
     */
    #[DataProvider('getParseDatasourceSqlData')]
    public function testParseDatasourceSql($sql, $expectedSql): void
    {
        $wfs = new WFSRequestForTests();
        $wfs->appContext = new ContextForTests();
        $wfs->datasource = (object) array('sql' => $sql);
        $result = $wfs->getDatasourceSqlForTests();
        $this->assertEquals($expectedSql, $result);
    }

    public static function getSetGeojsonSqlOutputSridData()
    {
        return array(
            // Default: no SRSNAME → output geometry and bbox use EPSG:4326.
            array(4326, 'ST_Transform(lg.geosource::geometry, 4326)', 'ST_Transform(ST_Envelope(lg.geosource::geometry), 4326)'),
            // SRSNAME = EPSG:3857 → output in Web Mercator.
            array(3857, 'ST_Transform(lg.geosource::geometry, 3857)', 'ST_Transform(ST_Envelope(lg.geosource::geometry), 3857)'),
            // SRSNAME = EPSG:2154 → output in Lambert-93.
            array(2154, 'ST_Transform(lg.geosource::geometry, 2154)', 'ST_Transform(ST_Envelope(lg.geosource::geometry), 2154)'),
        );
    }

    /**
     * @dataProvider getSetGeojsonSqlOutputSridData
     *
     * @param mixed $outputSrid
     * @param mixed $expectedGeomTransform
     * @param mixed $expectedBboxTransform
     */
    #[DataProvider('getSetGeojsonSqlOutputSridData')]
    public function testSetGeojsonSqlOutputSrid($outputSrid, $expectedGeomTransform, $expectedBboxTransform): void
    {
        $wfs = new WFSRequestForTests();
        $wfs->datasource = (object) array('key' => 'id', 'geocol' => 'geom');
        $wfs->selectFields = array('"id"');

        $sql = $wfs->setGeojsonSqlForTests(
            'SELECT "id", "geom" AS "geosource" FROM mytable',
            new jDbConnectionForTests(),
            'my_layer',
            'geom',
            $outputSrid
        );

        $this->assertStringContainsString(
            $expectedGeomTransform,
            $sql,
            "outputSrid={$outputSrid}: geometry transform not found in generated SQL.\n"
            ."Expected to contain : \"{$expectedGeomTransform}\"\n"
            ."Generated SQL snippet:\n".substr($sql, strpos($sql, 'ST_Transform') ?: 0, 300)
        );
        $this->assertStringContainsString(
            $expectedBboxTransform,
            $sql,
            "outputSrid={$outputSrid}: bbox transform not found in generated SQL.\n"
            ."Expected to contain : \"{$expectedBboxTransform}\"\n"
            ."Generated SQL snippet:\n".substr($sql, strpos($sql, 'ST_Envelope') ?: 0, 300)
        );
    }

    public static function getParseSrsnameSridData()
    {
        return array(
            // Typical EPSG short form.
            array('EPSG:4326', 4326),
            array('EPSG:3857', 3857),
            array('EPSG:2154', 2154),
            // OGC URN form.
            array('urn:ogc:def:crs:EPSG::4326', 4326),
            // Empty string → null.
            array('', null),
            // No digits at the end → null.
            array('not-a-crs', null),
            array('EPSG:foo', null),
            array('EPSG:', null),
            // Negative / sign prefix is not considered ctype_digit → null.
            array('EPSG:-4326', null),
        );
    }

    /**
     * @dataProvider getParseSrsnameSridData
     *
     * @param mixed $srsname
     * @param mixed $expected
     */
    #[DataProvider('getParseSrsnameSridData')]
    public function testParseSrsnameSrid($srsname, $expected): void
    {
        $wfs = new WFSRequestForTests();
        $this->assertSame($expected, $wfs->parseSrsnameSridForTests($srsname));
    }
}
