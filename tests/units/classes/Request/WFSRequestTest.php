<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Request\WFSRequest;

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
        $proj->setRepo(new Lizmap\Project\Repository('test', array(), '', null, new ContextForTests()));
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
                'filterAttribute' => 'attr'
            ),
            'name' => array(
                'filter' => 'test',
                'filterAttribute' => 'test attr'
            )
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
            'propertyname' => 'prop  '
        );
        $expected2 = array(
            'request' => 'getfeature',
            'typename' => 'type,name,for,test',
            'map' => null,
            'Lizmap_User' => '',
            'Lizmap_User_Groups' => '',
            'exp_filter' => '( testParam ) AND ( filter ) AND ( test )',
            'propertyname' => 'prop,test attr'
        );
        return array(
            array($params1, $filters1, $expected1),
            array($params2, $filters1, $expected2),
        );
    }

    /**
     * @dataProvider getParametersWithFiltersData
     */
    public function testParametersWithFilters($params, $loginFilters, $expectedParameters): void
    {
        $testContext = new ContextForTests();
        $testContext->setResult(array('lizmap.tools.loginFilteredLayers.override' => false));
        $proj = new ProjectForOGCForTests($testContext);
        $proj->loginFilters = $loginFilters;
        $proj->setRepo(new Lizmap\Project\Repository('test', array(), '', null, $testContext));
        $wfs = new WFSRequest($proj, $params, null);
        $parameters = $wfs->parameters();
        $this->assertEquals($expectedParameters, $parameters);
    }

    public static function getGetFeatureIdFilterExpData()
    {
        return array(
            array('', '', '', array()), //nothing
            array('type.1', '', '', array()), // only featureid
            array('type', 'type', '', array()), // featureid not well formed
            array('type.', 'type', '', array()), // fetaureid not well formed
            array('type.1', 'typed', '', array()), // featureid and typename are not for the same layer
            array('type.test@@55', 'type', '', array()), // featureid with multi fields key not for postgres layer
            array('type.test@@55', 'type', '', array('provider'=>'postgres')), // featureid with multi fields key for postgres layer with simple field key
            array('type.1', 'type', '$id IN (1)', array()),
            array('type.1,type.2', 'type', '$id IN (1, 2)', array()),
            array('type.1', 'type', '"id" IN (1)', array('provider'=>'postgres')),
            array('type.1,type.2', 'type', '"id" IN (1, 2)', array('provider'=>'postgres')),
            array('type.test', 'type', '"id" IN (\'test\')', array('provider'=>'postgres')),
            array('type.test@@55', 'type', '("foo" = \'test\' AND "id" = 55)', array('provider'=>'postgres', 'dtparams'=>array('key' => 'foo,id'))),
            array('type.test@@55,type.bar@@44', 'type', '("foo" = \'test\' AND "id" = 55) OR ("foo" = \'bar\' AND "id" = 44)', array('provider'=>'postgres', 'dtparams'=>array('key' => 'foo,id'))),
        );
    }

    /**
     * @dataProvider getGetFeatureIdFilterExpData
     */
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
            'geometryname' => 'geom'
        );
        $wfsFields = array('prop', 'name', 'notProp');
        $paramsGeom = array(
            'geometryname' => 'geom'
        );
        $paramsProp = array(
            'propertyname' => 'prop,erty,name',
            'geometryname' => 'none'
        );
        return array(
            array($paramsComplete, $wfsFields, array('"prop"', '"name"', '"key"', '"geom"', '"test"'), ' SELECT "prop", "name", "key", "geom", "test", "geocol" AS "geosource" FROM table'),
            array($paramsGeom, $wfsFields, array('"prop"', '"name"', '"notProp"', '"key"', '"geom"', '"test"'), ' SELECT "prop", "name", "notProp", "key", "geom", "test", "geocol" AS "geosource" FROM table'),
            array($paramsProp, $wfsFields, array('"prop"', '"name"', '"key"', '"geom"', '"test"'), ' SELECT "prop", "name", "key", "geom", "test" FROM table'),
        );
    }

    /**
     * @dataProvider getBuildQueryBaseData
     */
    public function testBuildQueryBase($params, $wfsFields, $expectedSelectFields, $expectedSql): void
    {
        $cnx = new jDbConnectionForTests();
        $wfs = new WFSRequestForTests();
        $wfs->datasource = (object)array(
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
        );
    }

    /**
     * @dataProvider getGetBboxSqlData
     */
    public function testGetBboxSql($geocol, $params, $expectedSql): void
    {
        $wfs = new WFSRequestForTests();
        $wfs->datasource = (object)array(
            'geocol' => $geocol,
        );
        $wfs->qgisLayer = new LayerWFSForTests();
        $sql = $wfs->getBboxSqlForTests($params);
        $this->assertEquals($expectedSql, $sql);
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
     */
    public function testParseExpFilter($params, $key, $expectedSql): void
    {
        $wfs = new WFSRequestForTests();
        $wfs->appContext = new ContextForTests();
        $wfs->datasource = (object)array('key' => $key, 'geocol' => 'geom');
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
     */
    public function testParseFeatureId($typename, $featureId, $keys, $expectedSql): void
    {
        $params = array(
            'typename' => $typename,
            'featureid' => $featureId
        );
        $wfs = new WFSRequestForTests();
        $wfs->datasource = (object)array('key' => $keys);
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
        );
    }

    /**
     * @dataProvider getGetQueryOrderData
     */
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
     */
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
     */
    public function testValidateFilter($filter, $expectedFilter): void
    {
        $wfs = new WFSRequestForTests();
        $wfs->appContext = new ContextForTests();
        $wfs->datasource = (object)array(
            'geocol' => 'column'
        );
        $this->assertEquals($expectedFilter, $wfs->validateFilterForTests($filter));
    }
}
