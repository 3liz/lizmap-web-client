<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Request\WFSRequest;

require_once __DIR__.'/ClassesForTests.php';

class WFSRequestTest extends TestCase
{
    public function testParameters()
    {
        $wfs = new WFSRequest(new ProjectForOGC(), array('request' => 'notGetFeature'), null, new testContext());
        $expectedParameters = array(
            'request' => 'notGetFeature',
            'map' => null,
            'Lizmap_User' => '',
            'Lizmap_User_Groups' => '',
        );
        $parameters = $wfs->parameters();
        $this->assertEquals($expectedParameters, $parameters);
        $proj = new ProjectForOGC();
        $proj->setRepo(new Lizmap\Project\Repository('test', array(), '', null, new testContext()));
        $wfs = new WFSRequest($proj, array('request' => 'notGetFeature'), null, new testContext());
        $parameters = $wfs->parameters();
        $this->assertEquals($expectedParameters, $parameters);
    }

    public function getParametersWithFiltersData()
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
            'exp_filter' => 'filter AND test',
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
            'exp_filter' => 'testParam AND filter AND test',
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
    public function testParametersWithFilters($params, $loginFilters, $expectedParameters)
    {
        $testContext = new testContext();
        $testContext->setResult(array('lizmap.tools.loginFilteredLayers.override' => false));
        $proj = new ProjectForOGC();
        $proj->loginFilters = $loginFilters;
        $proj->setRepo(new Lizmap\Project\Repository('test', array(), '', null, $testContext));
        $wfs = new WFSRequest($proj, $params, null, $testContext);
        $parameters = $wfs->parameters();
        $this->assertEquals($expectedParameters, $parameters);
    }

    public function getBuildQueryBaseData()
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
            array($paramsComplete, $wfsFields, array('prop', 'name', 'key', 'geom', 'test'), ' SELECT prop, name, key, geom, test, geocol AS geosource FROM table'),
            array($paramsGeom, $wfsFields, array('prop', 'name', 'notProp', 'key', 'geom', 'test'), ' SELECT prop, name, notProp, key, geom, test, geocol AS geosource FROM table'),
            array($paramsProp, $wfsFields, array('prop', 'name', 'key', 'geom', 'test'), ' SELECT prop, name, key, geom, test FROM table'),
        );
    }

    /**
     * @dataProvider getBuildQueryBaseData
     */
    public function testBuildQueryBase($params, $wfsFields, $expectedSelectFields, $expectedSql)
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

    public function getGetBboxSqlData()
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
    public function testGetBboxSql($geocol, $params, $expectedSql)
    {
        $wfs = new WFSRequestForTests();
        $wfs->datasource = (object)array(
            'geocol' => $geocol,
        );
        $wfs->qgisLayer = new LayerForWFS();
        $sql = $wfs->getBboxSqlForTests($params);
        $this->assertEquals($expectedSql, $sql);
    }

    public function getParseExpFilterData()
    {
        return array(
            array(array(), '', ''),
            array(array('exp_filter' => 'select'), '', false),
            array(array('exp_filter' => 'filter for test'), '', ' AND filter for test'),
            array(array('exp_filter' => 'filter for test with $id = 5'), 'key', ' AND filter for test with key = 5'),
            array(array('exp_filter' => 'filter for test with $id = 5'), 'key,otherKey', false),
        );
    }

    /**
     * @dataProvider getParseExpFilterData
     */
    public function testParseExpFilter($params, $key, $expectedSql)
    {
        $wfs = new WFSRequestForTests();
        $wfs->appContext = new testContext();
        $wfs->datasource = (object)array('key' => $key, 'geocol' => 'geom');
        $result = $wfs->parseExpFilterForTests(new jDbConnectionForTests(), $params);
        $this->assertEquals($expectedSql, $result);
    }

    public function getParseFeatureData()
    {
        return array(
            array('', '', '', ''),
            array('type', 'type.test@@55', 'key,otherKey', ' AND (key = "test" AND otherKey = 55)'),
            array('type', 'type.test@@55,you shall not pass,type.name@@42', 'key,otherKey', ' AND (key = "test" AND otherKey = 55) OR (key = "name" AND otherKey = 42)'),
        );
    }

    /**
     * @dataProvider getParseFeatureData
     */
    public function testParseFeatureId($typename, $featureId, $keys, $expectedSql)
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

    public function getGetQueryOrderData()
    {
        return array(
            array(array(), array(), ''),
            array(array('sortby' => ''), array(), ''),
            array(array('sortby' => 'id a,test d,wfs a'), array(), ''),
            array(array('sortby' => 'id a,test d,wfs a'), array('test', 'field', 'wfs'), ' ORDER BY test DESC, wfs ASC'),
        );
    }

    /**
     * @dataProvider getGetQueryOrderData
     */
    public function testGetQueryOrder($params, $wfsFields, $expectedSql)
    {
        $wfs = new WFSRequestForTests();
        $result = '';
        $result = $wfs->getQueryOrderForTests(new jDbConnectionForTests(), $params, $wfsFields);
        $this->assertEquals($expectedSql, $result);
    }

    public function getValidateFilterData()
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
    public function testValidateFilter($filter, $expectedFilter)
    {
        $wfs = new WFSRequestForTests();
        $wfs->appContext = new testContext();
        $wfs->datasource = (object)array(
            'geocol' => 'column'
        );
        $this->assertEquals($expectedFilter, $wfs->validateFilterForTests($filter));
    }
}