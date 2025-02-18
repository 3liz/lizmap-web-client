<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class SpatialRefSysTest extends TestCase
{
    public function testConstruct(): void
    {
        $data = array(
            'proj4' => '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
            'srid' => 2154,
            'authid' => 'EPSG:2154',
            'description' => 'RGF93 / Lambert-93',
        );

        $srs = new Qgis\SpatialRefSys($data);
        $this->assertEquals($data['proj4'], $srs->proj4);
        $this->assertEquals($data['srid'], $srs->srid);
        $this->assertEquals($data['authid'], $srs->authid);
        $this->assertEquals($data['description'], $srs->description);
    }

    public function testExceptionNoSuchProperty(): void
    {
        $data = array(
            'wkt' => 'PROJCS["WGS 84 / Pseudo-Mercator",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]],PROJECTION["Mercator_1SP"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["X",EAST],AXIS["Y",NORTH],EXTENSION["PROJ4","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs"],AUTHORITY["EPSG","3857"]]',
            'proj4' => '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
            'srid' => 2154,
            'authid' => 'EPSG:2154',
            'description' => 'RGF93 / Lambert-93',
        );

        $srs = new Qgis\SpatialRefSys($data);
        $this->assertEquals($data['proj4'], $srs->proj4);
        $this->assertEquals($data['srid'], $srs->srid);
        $this->assertEquals($data['authid'], $srs->authid);
        $this->assertEquals($data['description'], $srs->description);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('no such property `wkt`.');
        $srs->wkt;
    }

    public function testExceptionMandatoryProperties(): void
    {
        $data = array(
            'srid' => 2154,
            'authid' => 'EPSG:2154',
            'description' => 'RGF93 / Lambert-93',
        );

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('$data has to contain `authid`, `proj4` keys!');
        $srs = new Qgis\SpatialRefSys($data);
    }

    public function testGetInstance(): void
    {
        Qgis\SpatialRefSys::clearInstances();
        $this->assertCount(0, Qgis\SpatialRefSys::allInstances());

        $data = array(
            'proj4' => '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
            'srid' => 2154,
            'authid' => 'EPSG:2154',
            'description' => 'RGF93 / Lambert-93',
        );
        $srs = Qgis\SpatialRefSys::getInstance($data);
        $this->assertEquals($data['proj4'], $srs->proj4);
        $this->assertEquals($data['srid'], $srs->srid);
        $this->assertEquals($data['authid'], $srs->authid);
        $this->assertEquals($data['description'], $srs->description);

        $this->assertCount(1, Qgis\SpatialRefSys::allInstances());

        $data = array(
            'proj4' => '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs',
            'srid' => 3857,
            'authid' => 'EPSG:3857',
            'description' => 'WGS 84 / Pseudo-Mercator',
        );
        $srs = Qgis\SpatialRefSys::getInstance($data);
        $this->assertEquals($data['proj4'], $srs->proj4);
        $this->assertEquals($data['srid'], $srs->srid);
        $this->assertEquals($data['authid'], $srs->authid);
        $this->assertEquals($data['description'], $srs->description);

        $this->assertCount(2, Qgis\SpatialRefSys::allInstances());

        $data = array(
            'proj4' => '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
            'authid' => 'EPSG:2154',
        );
        $srs = Qgis\SpatialRefSys::getInstance($data);
        $this->assertEquals($data['proj4'], $srs->proj4);
        $this->assertNotNull($srs->srid);
        $this->assertEquals($data['authid'], $srs->authid);
        $this->assertNotNull($srs->description);

        $this->assertCount(2, Qgis\SpatialRefSys::allInstances());
    }

    public function testFromXmlReader(): void
    {
        $xmlStr = '
        <spatialrefsys>
          <wkt>PROJCS["WGS 84 / Pseudo-Mercator",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]],PROJECTION["Mercator_1SP"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["X",EAST],AXIS["Y",NORTH],EXTENSION["PROJ4","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs"],AUTHORITY["EPSG","3857"]]</wkt>
          <proj4>+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs</proj4>
          <srsid>3857</srsid>
          <srid>3857</srid>
          <authid>EPSG:3857</authid>
          <description>WGS 84 / Pseudo-Mercator</description>
          <projectionacronym>merc</projectionacronym>
          <ellipsoidacronym>WGS84</ellipsoidacronym>
          <geographicflag>false</geographicflag>
        </spatialrefsys>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $data = Qgis\SpatialRefSys::fromXmlReader($oXml);
        $expected = new Qgis\SpatialRefSys(
          array(
            'proj4' => '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs',
            'srid' => 3857,
            'authid' => 'EPSG:3857',
            'description' => 'WGS 84 / Pseudo-Mercator',
          )
        );
        $this->assertEquals($expected->proj4, $data->proj4);
        $this->assertEquals($expected->srid, $data->srid);
        $this->assertEquals($expected->authid, $data->authid);
        $this->assertEquals($expected->description, $data->description);
    }

    public function testExceptionMandatoryElements(): void
    {
        $xmlStr = '
        <spatialrefsys>
          <srsid>3857</srsid>
          <srid>3857</srid>
          <authid>EPSG:3857</authid>
          <description>WGS 84 / Pseudo-Mercator</description>
          <projectionacronym>merc</projectionacronym>
          <ellipsoidacronym>WGS84</ellipsoidacronym>
          <geographicflag>false</geographicflag>
        </spatialrefsys>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('`spatialrefsys` element has to contain `authid`, `proj4` elements!');
        Qgis\SpatialRefSys::fromXmlReader($oXml);
    }

}
