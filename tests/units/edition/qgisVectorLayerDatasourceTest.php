<?php

class qgisVectorLayerDatasourceTest extends PHPUnit_Framework_TestCase {


    function testPostgresqlDatasource() {

        $provider = 'postgres';
        $datasource = "dbname='test_dbname' host=127.0.0.1 port=5432 user='test_user' password='test_password' sslmode=disable key='id' srid=4326 type=Polygon checkPrimaryKeyUnicity='1' table=\"test_schema\".\"test_table\" (geom) sql=";

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('test_dbname', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('', $element->getDatasourceParameter('service'));
        $this->assertEquals('127.0.0.1', $element->getDatasourceParameter('host'));
        $this->assertEquals('5432', $element->getDatasourceParameter('port'));
        $this->assertEquals('test_user', $element->getDatasourceParameter('user'));
        $this->assertEquals('test_password', $element->getDatasourceParameter('password'));
        $this->assertEquals('disable', $element->getDatasourceParameter('sslmode'));
        $this->assertEquals('id', $element->getDatasourceParameter('key'));
        $this->assertEquals('', $element->getDatasourceParameter('estimatedmetadata'));
        $this->assertEquals('', $element->getDatasourceParameter('selectatid'));
        $this->assertEquals('4326', $element->getDatasourceParameter('srid'));
        $this->assertEquals('Polygon', $element->getDatasourceParameter('type'));
        $this->assertEquals('1', $element->getDatasourceParameter('checkPrimaryKeyUnicity'));
        $this->assertEquals('"test_schema"."test_table"', $element->getDatasourceParameter('table'));
        $this->assertEquals('test_table', $element->getDatasourceParameter('tablename'));
        $this->assertEquals('test_schema', $element->getDatasourceParameter('schema'));
        $this->assertEquals('geom', $element->getDatasourceParameter('geocol'));
        $this->assertEquals('', $element->getDatasourceParameter('sql'));

    }

    function testPostgresDatasourceWithoutGeometry() {
        $provider = 'postgres';
        $datasource = "dbname='test_dbname' host=test_host port=5432 user='test_user' password='test_password' sslmode=disable key='id' estimatedmetadata=true checkPrimaryKeyUnicity='1' table=\"test_schema\".\"test_table\" sql=";

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('test_dbname', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('', $element->getDatasourceParameter('service'));
        $this->assertEquals('test_host', $element->getDatasourceParameter('host'));
        $this->assertEquals('5432', $element->getDatasourceParameter('port'));
        $this->assertEquals('test_user', $element->getDatasourceParameter('user'));
        $this->assertEquals('test_password', $element->getDatasourceParameter('password'));
        $this->assertEquals('disable', $element->getDatasourceParameter('sslmode'));
        $this->assertEquals('id', $element->getDatasourceParameter('key'));
        $this->assertEquals('true', $element->getDatasourceParameter('estimatedmetadata'));
        $this->assertEquals('', $element->getDatasourceParameter('selectatid'));
        $this->assertEquals('', $element->getDatasourceParameter('srid'));
        $this->assertEquals('', $element->getDatasourceParameter('type'));
        $this->assertEquals('1', $element->getDatasourceParameter('checkPrimaryKeyUnicity'));
        $this->assertEquals('"test_schema"."test_table"', $element->getDatasourceParameter('table'));
        $this->assertEquals('test_table', $element->getDatasourceParameter('tablename'));
        $this->assertEquals('test_schema', $element->getDatasourceParameter('schema'));
        $this->assertEquals('', $element->getDatasourceParameter('geocol'));
        $this->assertEquals('', $element->getDatasourceParameter('sql'));

    }

    function testPostgresqlDatasourceWithService() {

        $provider = 'postgres';
        $datasource = "dbname='test_dbname' service='test_service' sslmode=disable key='id' srid=2193 type=Polygon checkPrimaryKeyUnicity='1' table=\"public\".\"EditTest\" (geom) sql=";

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('test_dbname', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('test_service', $element->getDatasourceParameter('service'));
        $this->assertEquals('', $element->getDatasourceParameter('host'));
        $this->assertEquals('', $element->getDatasourceParameter('port'));
        $this->assertEquals('', $element->getDatasourceParameter('user'));
        $this->assertEquals('', $element->getDatasourceParameter('password'));
        $this->assertEquals('disable', $element->getDatasourceParameter('sslmode'));
        $this->assertEquals('id', $element->getDatasourceParameter('key'));
        $this->assertEquals('', $element->getDatasourceParameter('estimatedmetadata'));
        $this->assertEquals('', $element->getDatasourceParameter('selectatid'));
        $this->assertEquals('2193', $element->getDatasourceParameter('srid'));
        $this->assertEquals('Polygon', $element->getDatasourceParameter('type'));
        $this->assertEquals('1', $element->getDatasourceParameter('checkPrimaryKeyUnicity'));
        $this->assertEquals('"public"."EditTest"', $element->getDatasourceParameter('table'));
        $this->assertEquals('EditTest', $element->getDatasourceParameter('tablename'));
        $this->assertEquals('public', $element->getDatasourceParameter('schema'));
        $this->assertEquals('geom', $element->getDatasourceParameter('geocol'));
        $this->assertEquals('', $element->getDatasourceParameter('sql'));

    }

    function testComplexQueryDatasource() {

        $provider = 'postgres';
        $datasource = "service='test_service' key='id' estimatedmetadata=true checkPrimaryKeyUnicity='1' table=\"((             SELECT                 o.id,&#xD;
                 so_unique_id AS spatial_object_code,&#xD;
				 so.geom,&#xD;
				 ob_timestamp AS observation_timestamp
FROM gobs.observation AS o             &#xD;
INNER JOIN gobs.spatial_object AS so                 ON so.id = o.fk_id_spatial_object             &#xD;
WHERE fk_id_series = 2  )
)\" (geom) sql=\"observation_timestamp\" &lt; '2017-01-01T00:00:00' AND \"observation_timestamp\" &gt;= '2016-01-01T00:00:00' ";

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('test_service', $element->getDatasourceParameter('service'));
        $this->assertEquals('', $element->getDatasourceParameter('host'));
        $this->assertEquals('', $element->getDatasourceParameter('port'));
        $this->assertEquals('', $element->getDatasourceParameter('user'));
        $this->assertEquals('', $element->getDatasourceParameter('password'));
        $this->assertEquals('', $element->getDatasourceParameter('sslmode'));
        $this->assertEquals('id', $element->getDatasourceParameter('key'));
        $this->assertEquals('true', $element->getDatasourceParameter('estimatedmetadata'));
        $this->assertEquals('', $element->getDatasourceParameter('selectatid'));
        $this->assertEquals('', $element->getDatasourceParameter('srid'));
        $this->assertEquals('', $element->getDatasourceParameter('type'));
        $this->assertEquals('1', $element->getDatasourceParameter('checkPrimaryKeyUnicity'));
        $table = "((             SELECT                 o.id,&#xD;
                 so_unique_id AS spatial_object_code,&#xD;
				 so.geom,&#xD;
				 ob_timestamp AS observation_timestamp
FROM gobs.observation AS o             &#xD;
INNER JOIN gobs.spatial_object AS so                 ON so.id = o.fk_id_spatial_object             &#xD;
WHERE fk_id_series = 2  )
) fooliz";

        $this->assertEquals($table, $element->getDatasourceParameter('table'));
        $this->assertEquals($table, $element->getDatasourceParameter('tablename'));
        $this->assertEquals('', $element->getDatasourceParameter('schema'));
        $this->assertEquals('geom', $element->getDatasourceParameter('geocol'));
        $sql = "\"observation_timestamp\" &lt; '2017-01-01T00:00:00' AND \"observation_timestamp\" &gt;= '2016-01-01T00:00:00'";
        $this->assertEquals($sql, $element->getDatasourceParameter('sql'));

    }

    function testGeopackageDatasource() {

        $provider = 'ogr';
        $datasource = './edition/events.gpkg|layername=events';

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('./edition/events.gpkg', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('events', $element->getDatasourceParameter('table'));
        $this->assertEquals('', $element->getDatasourceParameter('sql'));
    }

    function testGeopackageDatasourceWithSql() {

        $provider = 'ogr';
        $datasource = './edition/events.gpkg|layername=events|subset="counter" > 3';

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('./edition/events.gpkg', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('events', $element->getDatasourceParameter('table'));
        $this->assertEquals('"counter" > 3', $element->getDatasourceParameter('sql'));
    }


}
