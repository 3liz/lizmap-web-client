<?php

use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class qgisVectorLayerDatasourceTest extends TestCase
{
    public function testPostgresqlDatasource(): void
    {
        $provider = 'postgres';
        // Host without '
        $datasource = "dbname='test_dbname' host=127.0.0.1 port=5432 user='test_user' password='test_password' sslmode=disable key='id' srid=4326 type=Polygon checkPrimaryKeyUnicity='1' table=\"test_schema\".\"test_table\" (geom) sql=";

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('test_dbname', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('', $element->getDatasourceParameter('service'));
        $this->assertEquals('127.0.0.1', $element->getDatasourceParameter('host'));
        $this->assertEquals('5432', $element->getDatasourceParameter('port'));
        $this->assertEquals('test_user', $element->getDatasourceParameter('user'));
        $this->assertEquals('test_password', $element->getDatasourceParameter('password'));
        $this->assertEquals('', $element->getDatasourceParameter('authcfg'));
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

        // Host with '
        $datasource = "dbname='test_dbname' host='test_host' port=5432 user='test_user' password='test_password' sslmode=disable key='id' srid=4326 type=Polygon checkPrimaryKeyUnicity='1' table=\"test_schema\".\"test_table\" (geom) sql=";

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('test_dbname', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('', $element->getDatasourceParameter('service'));
        $this->assertEquals('test_host', $element->getDatasourceParameter('host'));
        $this->assertEquals('5432', $element->getDatasourceParameter('port'));
        $this->assertEquals('test_user', $element->getDatasourceParameter('user'));
        $this->assertEquals('test_password', $element->getDatasourceParameter('password'));
        $this->assertEquals('', $element->getDatasourceParameter('authcfg'));
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

    public function testPostgresDatasourceWithoutGeometry(): void
    {
        $provider = 'postgres';
        $datasource = "dbname='test_dbname' host=test_host port=5432 user='test_user' password='test_password' sslmode=disable key='id' estimatedmetadata=true checkPrimaryKeyUnicity='1' table=\"test_schema\".\"test_table\" sql=";

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('test_dbname', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('', $element->getDatasourceParameter('service'));
        $this->assertEquals('test_host', $element->getDatasourceParameter('host'));
        $this->assertEquals('5432', $element->getDatasourceParameter('port'));
        $this->assertEquals('test_user', $element->getDatasourceParameter('user'));
        $this->assertEquals('test_password', $element->getDatasourceParameter('password'));
        $this->assertEquals('', $element->getDatasourceParameter('authcfg'));
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

    public function testPostgresqlDatasourceWithService(): void
    {
        $provider = 'postgres';
        $datasource = "dbname='test_dbname' service='test_service' sslmode=disable key='id' srid=2193 type=Polygon checkPrimaryKeyUnicity='1' table=\"public\".\"EditTest\" (geom) sql=";

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('test_dbname', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('test_service', $element->getDatasourceParameter('service'));
        $this->assertEquals('', $element->getDatasourceParameter('host'));
        $this->assertEquals('', $element->getDatasourceParameter('port'));
        $this->assertEquals('', $element->getDatasourceParameter('user'));
        $this->assertEquals('', $element->getDatasourceParameter('password'));
        $this->assertEquals('', $element->getDatasourceParameter('authcfg'));
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

    public function testPostgresqlDatasourceWithoutGeometryWithServiceWithoutSql(): void
    {
        $provider = 'postgres';
        $datasource = "dbname='test_dbname' service='test_service' sslmode=disable key='id' srid=2193 checkPrimaryKeyUnicity='1' table=\"public\".\"EditTest\"";

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('test_dbname', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('test_service', $element->getDatasourceParameter('service'));
        $this->assertEquals('', $element->getDatasourceParameter('host'));
        $this->assertEquals('', $element->getDatasourceParameter('port'));
        $this->assertEquals('', $element->getDatasourceParameter('user'));
        $this->assertEquals('', $element->getDatasourceParameter('password'));
        $this->assertEquals('', $element->getDatasourceParameter('authcfg'));
        $this->assertEquals('disable', $element->getDatasourceParameter('sslmode'));
        $this->assertEquals('id', $element->getDatasourceParameter('key'));
        $this->assertEquals('', $element->getDatasourceParameter('estimatedmetadata'));
        $this->assertEquals('', $element->getDatasourceParameter('selectatid'));
        $this->assertEquals('2193', $element->getDatasourceParameter('srid'));
        $this->assertEquals('', $element->getDatasourceParameter('type'));
        $this->assertEquals('1', $element->getDatasourceParameter('checkPrimaryKeyUnicity'));
        $this->assertEquals('"public"."EditTest"', $element->getDatasourceParameter('table'));
        $this->assertEquals('EditTest', $element->getDatasourceParameter('tablename'));
        $this->assertEquals('public', $element->getDatasourceParameter('schema'));
        $this->assertEquals('', $element->getDatasourceParameter('geocol'));
        $this->assertEquals('', $element->getDatasourceParameter('sql'));
    }

    public function testPostgresqlDatasourceWithAuthcfg(): void
    {
        $provider = 'postgres';
        $datasource = "dbname='test_dbname' host=127.0.0.1 port=5432 authcfg='lizmap-test' sslmode=disable key='id' srid=4326 type=Polygon checkPrimaryKeyUnicity='1' table=\"test_schema\".\"test_table\" (geom) sql=";

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('test_dbname', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('', $element->getDatasourceParameter('service'));
        $this->assertEquals('127.0.0.1', $element->getDatasourceParameter('host'));
        $this->assertEquals('5432', $element->getDatasourceParameter('port'));
        $this->assertEquals('', $element->getDatasourceParameter('user'));
        $this->assertEquals('', $element->getDatasourceParameter('password'));
        $this->assertEquals('lizmap-test', $element->getDatasourceParameter('authcfg'));
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

    public function testPostgresqlDatasourceWithoutGeometryWithAuthcfgWithoutSql(): void
    {
        $provider = 'postgres';
        $datasource = "dbname='test_dbname' host=127.0.0.1 port=5432 authcfg='lizmap-test' sslmode=disable key='id' srid=2193 checkPrimaryKeyUnicity='1' table=\"public\".\"EditTest\"";

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('test_dbname', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('', $element->getDatasourceParameter('service'));
        $this->assertEquals('127.0.0.1', $element->getDatasourceParameter('host'));
        $this->assertEquals('5432', $element->getDatasourceParameter('port'));
        $this->assertEquals('', $element->getDatasourceParameter('user'));
        $this->assertEquals('', $element->getDatasourceParameter('password'));
        $this->assertEquals('lizmap-test', $element->getDatasourceParameter('authcfg'));
        $this->assertEquals('disable', $element->getDatasourceParameter('sslmode'));
        $this->assertEquals('id', $element->getDatasourceParameter('key'));
        $this->assertEquals('', $element->getDatasourceParameter('estimatedmetadata'));
        $this->assertEquals('', $element->getDatasourceParameter('selectatid'));
        $this->assertEquals('2193', $element->getDatasourceParameter('srid'));
        $this->assertEquals('', $element->getDatasourceParameter('type'));
        $this->assertEquals('1', $element->getDatasourceParameter('checkPrimaryKeyUnicity'));
        $this->assertEquals('"public"."EditTest"', $element->getDatasourceParameter('table'));
        $this->assertEquals('EditTest', $element->getDatasourceParameter('tablename'));
        $this->assertEquals('public', $element->getDatasourceParameter('schema'));
        $this->assertEquals('', $element->getDatasourceParameter('geocol'));
        $this->assertEquals('', $element->getDatasourceParameter('sql'));
    }

    public function testPostgresDatasourceSimpleTableWithSql(): void
    {
        $provider = 'postgres';
        $datasource = "dbname='test_dbname' host=127.0.0.1 port=5432 user='test_user' password='test_password' sslmode=disable key='id_lieux' srid=2154 type=MultiPolygon checkPrimaryKeyUnicity='1' table=\"referentiel\".\"lieux\" (geom) sql=\"code_com\" = '010'";

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('test_dbname', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('', $element->getDatasourceParameter('service'));
        $this->assertEquals('127.0.0.1', $element->getDatasourceParameter('host'));
        $this->assertEquals('5432', $element->getDatasourceParameter('port'));
        $this->assertEquals('test_user', $element->getDatasourceParameter('user'));
        $this->assertEquals('test_password', $element->getDatasourceParameter('password'));
        $this->assertEquals('', $element->getDatasourceParameter('authcfg'));
        $this->assertEquals('disable', $element->getDatasourceParameter('sslmode'));
        $this->assertEquals('id_lieux', $element->getDatasourceParameter('key'));
        $this->assertEquals('', $element->getDatasourceParameter('estimatedmetadata'));
        $this->assertEquals('', $element->getDatasourceParameter('selectatid'));
        $this->assertEquals('2154', $element->getDatasourceParameter('srid'));
        $this->assertEquals('MultiPolygon', $element->getDatasourceParameter('type'));
        $this->assertEquals('1', $element->getDatasourceParameter('checkPrimaryKeyUnicity'));
        $this->assertEquals('"referentiel"."lieux"', $element->getDatasourceParameter('table'));
        $this->assertEquals('lieux', $element->getDatasourceParameter('tablename'));
        $this->assertEquals('referentiel', $element->getDatasourceParameter('schema'));
        $this->assertEquals('geom', $element->getDatasourceParameter('geocol'));
        $this->assertEquals("\"code_com\" = '010'", $element->getDatasourceParameter('sql'));
    }

    public function testPostgresqlDatasourceWithoutSql(): void
    {
        $provider = 'postgres';
        $datasource = "dbname='test_dbname' host=127.0.0.1 port=5432 user='test_user' password='test_password' sslmode=disable key='id' srid=4326 type=Point checkPrimaryKeyUnicity='0' table=\"test_schema\".\"test_table\" (geom)";

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('test_dbname', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('', $element->getDatasourceParameter('service'));
        $this->assertEquals('127.0.0.1', $element->getDatasourceParameter('host'));
        $this->assertEquals('5432', $element->getDatasourceParameter('port'));
        $this->assertEquals('test_user', $element->getDatasourceParameter('user'));
        $this->assertEquals('test_password', $element->getDatasourceParameter('password'));
        $this->assertEquals('', $element->getDatasourceParameter('authcfg'));
        $this->assertEquals('disable', $element->getDatasourceParameter('sslmode'));
        $this->assertEquals('id', $element->getDatasourceParameter('key'));
        $this->assertEquals('', $element->getDatasourceParameter('estimatedmetadata'));
        $this->assertEquals('', $element->getDatasourceParameter('selectatid'));
        $this->assertEquals('4326', $element->getDatasourceParameter('srid'));
        $this->assertEquals('Point', $element->getDatasourceParameter('type'));
        $this->assertEquals('0', $element->getDatasourceParameter('checkPrimaryKeyUnicity'));
        $this->assertEquals('"test_schema"."test_table"', $element->getDatasourceParameter('table'));
        $this->assertEquals('test_table', $element->getDatasourceParameter('tablename'));
        $this->assertEquals('test_schema', $element->getDatasourceParameter('schema'));
        $this->assertEquals('geom', $element->getDatasourceParameter('geocol'));
        $this->assertEquals('', $element->getDatasourceParameter('sql'));
    }

    public function testComplexQueryDatasource(): void
    {
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
        $table = '((             SELECT                 o.id,&#xD;
                 so_unique_id AS spatial_object_code,&#xD;
				 so.geom,&#xD;
				 ob_timestamp AS observation_timestamp
FROM gobs.observation AS o             &#xD;
INNER JOIN gobs.spatial_object AS so                 ON so.id = o.fk_id_spatial_object             &#xD;
WHERE fk_id_series = 2  )
) fooliz';

        $this->assertEquals($table, $element->getDatasourceParameter('table'));
        $this->assertEquals($table, $element->getDatasourceParameter('tablename'));
        $this->assertEquals('', $element->getDatasourceParameter('schema'));
        $this->assertEquals('geom', $element->getDatasourceParameter('geocol'));
        $sql = "\"observation_timestamp\" &lt; '2017-01-01T00:00:00' AND \"observation_timestamp\" &gt;= '2016-01-01T00:00:00'";
        $this->assertEquals($sql, $element->getDatasourceParameter('sql'));
    }

    public function testComplexQueryDatasourceWithEscapedDoubleQuotes(): void
    {
        $provider = 'postgres';
        $datasource = "service='test_service' key='id' checkPrimaryKeyUnicity='1' table=\"( SELECT o.id, so_unique_id AS spatial_object_code, so.geom, to_char(ob_start_timestamp, 'YYYY') AS observation_start, to_char(ob_end_timestamp, 'YYYY') AS observation_end, ob_start_timestamp AS observation_start_timestamp, ob_end_timestamp AS observation_end_timestamp, (ob_value->>0)::integer AS \\\"population\\\" FROM gobs.observation AS o INNER JOIN gobs.spatial_object AS so ON so.id = o.fk_id_spatial_object WHERE fk_id_series = 2         )\" (geom) sql=";

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('test_service', $element->getDatasourceParameter('service'));
        $this->assertEquals('', $element->getDatasourceParameter('host'));
        $this->assertEquals('', $element->getDatasourceParameter('port'));
        $this->assertEquals('', $element->getDatasourceParameter('user'));
        $this->assertEquals('', $element->getDatasourceParameter('password'));
        $this->assertEquals('', $element->getDatasourceParameter('sslmode'));
        $this->assertEquals('id', $element->getDatasourceParameter('key'));
        $this->assertEquals('', $element->getDatasourceParameter('selectatid'));
        $this->assertEquals('', $element->getDatasourceParameter('srid'));
        $this->assertEquals('', $element->getDatasourceParameter('type'));
        $this->assertEquals('1', $element->getDatasourceParameter('checkPrimaryKeyUnicity'));
        $table = "( SELECT o.id, so_unique_id AS spatial_object_code, so.geom, to_char(ob_start_timestamp, 'YYYY') AS observation_start, to_char(ob_end_timestamp, 'YYYY') AS observation_end, ob_start_timestamp AS observation_start_timestamp, ob_end_timestamp AS observation_end_timestamp, (ob_value->>0)::integer AS \"population\" FROM gobs.observation AS o INNER JOIN gobs.spatial_object AS so ON so.id = o.fk_id_spatial_object WHERE fk_id_series = 2         ) fooliz";

        $this->assertEquals($table, $element->getDatasourceParameter('table'));
        $this->assertEquals($table, $element->getDatasourceParameter('tablename'));
        $this->assertEquals('', $element->getDatasourceParameter('schema'));
        $this->assertEquals('geom', $element->getDatasourceParameter('geocol'));
        $sql = '';
        $this->assertEquals($sql, $element->getDatasourceParameter('sql'));
    }

    public function testGeopackageDatasource(): void
    {
        $provider = 'ogr';
        $datasource = './edition/events.gpkg|layername=events';

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('./edition/events.gpkg', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('events', $element->getDatasourceParameter('table'));
        $this->assertEquals('', $element->getDatasourceParameter('sql'));
    }

    public function testGeopackageDatasourceWithSql(): void
    {
        $provider = 'ogr';
        $datasource = './edition/events.gpkg|layername=events|subset="counter" > 3';

        $element = new qgisVectorLayerDatasource($provider, $datasource);

        $this->assertEquals('./edition/events.gpkg', $element->getDatasourceParameter('dbname'));
        $this->assertEquals('events', $element->getDatasourceParameter('table'));
        $this->assertEquals('"counter" > 3', $element->getDatasourceParameter('sql'));
    }
}
