<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class QgisProjectParserTest extends TestCase
{
    public function testReadVersion()
    {
        $xml_path = __DIR__.'/../Project/Ressources/montpellier.qgs';
        // Open the document with XML Reader at the root element document
        $oXml = App\XmlTools::xmlReaderFromFile($xml_path);
        $this->assertEquals(XMLReader::ELEMENT, $oXml->nodeType);
        $this->assertEquals(0, $oXml->depth);
        $this->assertEquals('qgis', $oXml->localName);
        $this->assertEquals('3.10.5-A Coruña', $oXml->getAttribute('version'));
    }

    public function testReadQgisGuiProperties()
    {
        $xmlStr = '
        <Gui>
          <CanvasColorBluePart type="int">255</CanvasColorBluePart>
          <CanvasColorGreenPart type="int">255</CanvasColorGreenPart>
          <CanvasColorRedPart type="int">255</CanvasColorRedPart>
          <SelectionColorAlphaPart type="int">255</SelectionColorAlphaPart>
          <SelectionColorBluePart type="int">0</SelectionColorBluePart>
          <SelectionColorGreenPart type="int">255</SelectionColorGreenPart>
          <SelectionColorRedPart type="int">255</SelectionColorRedPart>
        </Gui>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisGuiProperties($oXml);
        $expected = array(
            'CanvasColorBluePart' => 255,
            'CanvasColorGreenPart' => 255,
            'CanvasColorRedPart' => 255,
            'SelectionColorAlphaPart' => 255,
            'SelectionColorBluePart' => 0,
            'SelectionColorGreenPart' => 255,
            'SelectionColorRedPart' => 255,
        );
        $this->assertEquals($expected, $data);
    }

    public function testReadQgisVariablesProperties()
    {
        /*$oXml = new XMLReader();
        $xml_path = __DIR__.'/../Project/Ressources/montpellier.qgs';
        $oXml->open($xml_path);

        $data = array();
        while($oXml->read()){
            if($oXml->nodeType == XMLReader::ELEMENT
               && $oXml->localName == 'Variables'
               && $oXml->depth == 2) {
                $data = Project\QgisProjectParser::readQgisVariablesProperties($oXml);
                break;
            }
        }*/
        $xmlStr = '
        <Variables>
          <variableNames type="QStringList"/>
          <variableValues type="QStringList"/>
        </Variables>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisVariablesProperties($oXml);
        $expected = array(
            'variableNames' => array(),
            'variableValues' => array(),
        );
        $this->assertEquals($expected, $data);

        $xmlStr = '
        <Variables>
          <variableNames type="QStringList">
            <value>lizmap_user</value>
            <value>lizmap_user_groups</value>
          </variableNames>
          <variableValues type="QStringList">
            <value>lizmap</value>
            <value>lizmap-group</value>
          </variableValues>
        </Variables>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisVariablesProperties($oXml);
        $expected = array(
            'variableNames' => array(
                'lizmap_user',
                'lizmap_user_groups',
            ),
            'variableValues' => array(
                'lizmap',
                'lizmap-group',
            ),
        );
        $this->assertEquals($expected, $data);
    }

    public function testReadQgisProperties()
    {
        $oXml = new XMLReader();
        $xml_path = __DIR__.'/../Project/Ressources/montpellier.qgs';
        $oXml->open($xml_path);

        $data = array();
        while($oXml->read()){
            if($oXml->nodeType == XMLReader::ELEMENT
               && $oXml->localName == 'properties'
               && $oXml->depth == 1) {
                $data = Project\QgisProjectParser::readQgisProperties($oXml);
                break;
            }
        }
        $expected = array(
            'WMSServiceTitle' => 'Montpellier - Transports',
            'WMSServiceAbstract' => 'Demo project with bus and tramway lines in Montpellier, France.
Data is licensed under ODbl, OpenStreetMap contributors',
            'WMSKeywordList' => array(''),
            'WMSExtent' => array('417006.61373760335845873', '5394910.34090302512049675', '447158.04891100589884445', '5414844.99480544030666351'),
            // 'ProjectCrs' => 'EPSG:3857',
            'WMSOnlineResource' => 'http://www.3liz.com/lizmap.html',
            'WMSContactMail' => 'info@3liz.com',
            'WMSContactOrganization' => '3liz',
            'WMSContactPerson' => '3liz',
            'WMSContactPhone' => '+334 67 16 64 51',
            'WMSRestrictedComposers' => array('Composeur1'),
            'WMSUseLayerIDs' => false,
        );
        $this->assertEquals($expected, $data);

        $oXml = new XMLReader();
        $xml_path = __DIR__.'/../Project/Ressources/WMSInfotest.qgs';
        $oXml->open($xml_path);

        $data = array();
        while($oXml->read()){
            if($oXml->nodeType == XMLReader::ELEMENT
               && $oXml->localName == 'properties'
               && $oXml->depth == 1) {
                $data = Project\QgisProjectParser::readQgisProperties($oXml);
                break;
            }
        }
        $expected = array(
            'WMSServiceTitle' => 'Touristic events around Montpellier, France',
            'WMSServiceAbstract' => '',
            'WMSKeywordList' => array(''),
            'WMSExtent' => array('390483.99668047408340499', '5375009.91444000415503979', '477899.4732063576229848', '5436768.56305211596190929'),
            'WMSOnlineResource' => '',
            'WMSContactMail' => '',
            'WMSContactOrganization' => '',
            'WMSContactPerson' => '',
            'WMSContactPhone' => '',
            'WMSRestrictedComposers' => array(),
            'WMSUseLayerIDs' => false,
        );
        $this->assertEquals($expected, $data);
    }

    public function testReadQgisVisibilityPresets()
    {
        $oXml = new XMLReader();
        $xml_path = __DIR__.'/../Project/Ressources/themes-3_22.qgs';
        $oXml->open($xml_path);

        $data = array();
        while($oXml->read()){
            if($oXml->nodeType == XMLReader::ELEMENT
               && $oXml->localName == 'visibility-presets'
               && $oXml->depth == 1) {
                $data = Project\QgisProjectParser::readQgisVisibilityPresets($oXml);
                break;
            }
        }
        $expected = array(
            array(
                'name'=>'theme1',
                'layers' => array(
                    array(
                        'id' => 'quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d',
                        'visible' => true,
                        'style' => 'style1',
                        'expanded' => true,
                    ),
                ),
                'checkedGroupNodes' => array(),
                'expandedGroupNodes' => array(
                    'group1'
                ),
            ),
            array(
                'name'=>'theme2',
                'layers' => array(
                    array(
                        'id' => 'sousquartiers_7c49d0fc_0ee0_4308_a66d_45c144e59872',
                        'visible' => true,
                        'style' => 'défaut',
                        'expanded' => true,
                    ),
                    array(
                        'id' => 'quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d',
                        'visible' => true,
                        'style' => 'style2',
                        'expanded' => true,
                    ),
                ),
                'checkedGroupNodes' => array(
                    'group1'
                ),
                'expandedGroupNodes' => array(
                    'group1'
                ),

            ),
        );
        $this->assertEquals($expected, $data);

        $oXml = new XMLReader();
        $xml_path = __DIR__.'/../Project/Ressources/themes-3_26.qgs';
        $oXml->open($xml_path);

        $data = array();
        while($oXml->read()){
            if($oXml->nodeType == XMLReader::ELEMENT
               && $oXml->localName == 'visibility-presets'
               && $oXml->depth == 1) {
                $data = Project\QgisProjectParser::readQgisVisibilityPresets($oXml);
                break;
            }
        }
        $expected = array(
            array(
                'name'=>'theme1',
                'layers' => array(
                    array(
                        'id' => 'sousquartiers_7c49d0fc_0ee0_4308_a66d_45c144e59872',
                        'visible' => false,
                        'style' => 'défaut',
                        'expanded' => true,
                    ),
                    array(
                        'id' => 'quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d',
                        'visible' => true,
                        'style' => 'style1',
                        'expanded' => true,
                    ),
                ),
                'checkedGroupNodes' => array(),
                'expandedGroupNodes' => array(
                    'group1'
                ),
            ),
            array(
                'name'=>'theme2',
                'layers' => array(
                    array(
                        'id' => 'sousquartiers_7c49d0fc_0ee0_4308_a66d_45c144e59872',
                        'visible' => true,
                        'style' => 'défaut',
                        'expanded' => true,
                    ),
                    array(
                        'id' => 'quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d',
                        'visible' => true,
                        'style' => 'style2',
                        'expanded' => true,
                    ),
                ),
                'checkedGroupNodes' => array(
                    'group1'
                ),
                'expandedGroupNodes' => array(
                    'group1'
                ),

            ),
        );
        $this->assertEquals($expected, $data);
    }

    public function testReadQgisMapLayer()
    {
        $oXml = new XMLReader();
        $xml_path = __DIR__.'/../Project/Ressources/montpellier.qgs';
        $oXml->open($xml_path);

        $data = array();
        while($oXml->read()){
            if($oXml->nodeType == XMLReader::ELEMENT
               && $oXml->localName == 'maplayer'
               && $oXml->depth == 2) {
                $data = Project\QgisProjectParser::readQgisMapLayer($oXml);
                break;
            }
        }
        $expected = array(
            'type' => 'vector',
            'embedded' => false,
            'id' => 'SousQuartiers20160121124316563',
            'layername' => 'SousQuartiers',
            'srs' => array(
                'proj4' => '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
                'srid' => 2154,
                'authid' => 'EPSG:2154',
                'description' => 'RGF93 / Lambert-93',
            ),
            'datasource' => './data/vector/VilleMTP_MTP_SousQuartiers_2011.shp',
            'provider' => 'ogr',
            'keywordList' => array(''),
        );
        $this->assertEquals($expected, $data);
    }

    public function testReadSpatialRefSys()
    {
        $oXml = new XMLReader();
        $xml_path = __DIR__.'/../Project/Ressources/montpellier.qgs';
        $oXml->open($xml_path);

        $data = array();
        // qgis/projectlayers/maplayer/srs/spatialrefsys
        while($oXml->read()){
            if($oXml->nodeType == XMLReader::ELEMENT
               && $oXml->localName == 'maplayer'
               && $oXml->depth == 2) {
                while($oXml->read()){
                    if($oXml->nodeType == XMLReader::ELEMENT
                        && $oXml->localName == 'spatialrefsys'
                        && $oXml->depth == 4) {
                        $data = Project\QgisProjectParser::readSpatialRefSys($oXml);
                        break;
                    }
                }
                break;
            }
        }
        $expected = array(
            'proj4' => '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
            'srid' => 2154,
            'authid' => 'EPSG:2154',
            'description' => 'RGF93 / Lambert-93',
        );
        $this->assertEquals($expected, $data);
    }

    public function testReadQgisMapLayerAliases()
    {
        $oXml = new XMLReader();
        $xml_path = __DIR__.'/../Project/Ressources/montpellier.qgs';
        $oXml->open($xml_path);

        $data = array();
        while($oXml->read()){
            if($oXml->nodeType == XMLReader::ELEMENT
               && $oXml->localName == 'maplayer'
               && $oXml->depth == 2) {
                while($oXml->read()){
                    if($oXml->nodeType == XMLReader::ELEMENT
                        && $oXml->localName == 'aliases'
                        && $oXml->depth == 3) {
                        $data = Project\QgisProjectParser::readQgisMapLayerAliases($oXml);
                        break;
                    }
                }
                break;
            }
        }
        $this->assertCount(11, $data);
        $expected = array(
            array(
                'index' => 0,
                'field' => 'QUARTMNO',
                'name' => 'District',
            ),
            array(
                'index' => 1,
                'field' => 'SQUARTMNO',
                'name' => 'Code',
            ),
            array(
                'index' => 2,
                'field' => 'LIBSQUART',
                'name' => 'Name',
            ),
            array(
                'index' => 3,
                'field' => 'socio_population_2009',
                'name' => 'Population (2009)',
            ),
            array(
                'index' => 4,
                'field' => 'socio_population_percentage',
                'name' => '% population Montpellier',
            ),
            array(
                'index' => 5,
                'field' => 'socio_average_income',
                'name' => 'Average income (€)',
            ),
            array(
                'index' => 6,
                'field' => 'socio_prop_percentage',
                'name' => 'Owners (%)',
            ),
            array(
                'index' => 7,
                'field' => 'socio_loc_percentage',
                'name' => 'Tenants (%)',
            ),
            array(
                'index' => 8,
                'field' => 'Quartiers_LIBQUART',
                'name' => 'District',
            ),
            array(
                'index' => 9,
                'field' => 'popdensity',
                'name' => 'Density ( inhabitants / km2 )',
            ),
            array(
                'index' => 10,
                'field' => 'area',
                'name' => 'Area ( km2)',
            ),
        );
        $this->assertEquals($expected, $data);
    }

    public function testReadQgisMapLayerDefaults()
    {
        $oXml = new XMLReader();
        $xml_path = __DIR__.'/../Project/Ressources/montpellier.qgs';
        $oXml->open($xml_path);

        $data = array();
        while($oXml->read()){
            if($oXml->nodeType == XMLReader::ELEMENT
               && $oXml->localName == 'maplayer'
               && $oXml->depth == 2) {
                while($oXml->read()){
                    if($oXml->nodeType == XMLReader::ELEMENT
                        && $oXml->localName == 'defaults'
                        && $oXml->depth == 3) {
                        $data = Project\QgisProjectParser::readQgisMapLayerDefaults($oXml);
                        break;
                    }
                }
                break;
            }
        }
        $this->assertCount(11, $data);
        $expected = array(
            'field' => 'QUARTMNO',
            'expression' => '',
            'applyOnUpdate' => false,
        );
        $this->assertEquals($expected, $data[0]);
        $expected = array(
            'field' => 'socio_average_income',
            'expression' => '',
            'applyOnUpdate' => false,
        );
        $this->assertEquals($expected, $data[5]);
        $expected = array(
            'field' => 'area',
            'expression' => '',
            'applyOnUpdate' => false,
        );
        $this->assertEquals($expected, $data[10]);
    }

    public function testReadQgisMapLayerConstraints()
    {
        $oXml = new XMLReader();
        $xml_path = __DIR__.'/../Project/Ressources/montpellier.qgs';
        $oXml->open($xml_path);

        $data = array();
        while($oXml->read()){
            if($oXml->nodeType == XMLReader::ELEMENT
               && $oXml->localName == 'maplayer'
               && $oXml->depth == 2) {
                while($oXml->read()){
                    if($oXml->nodeType == XMLReader::ELEMENT
                        && $oXml->localName == 'constraints'
                        && $oXml->depth == 3) {
                        $data = Project\QgisProjectParser::readQgisMapLayerConstraints($oXml);
                        break;
                    }
                }
                break;
            }
        }
        $this->assertCount(11, $data);
        $expected = array(
            'field' => 'QUARTMNO',
            'constraints' => 0,
            'notnull_strength' => false,
            'unique_strength' => false,
            'exp_strength' => false,
        );
        $this->assertEquals($expected, $data[0]);
        $expected = array(
            'field' => 'socio_average_income',
            'constraints' => 0,
            'notnull_strength' => false,
            'unique_strength' => false,
            'exp_strength' => false,
        );
        $this->assertEquals($expected, $data[5]);
        $expected = array(
            'field' => 'area',
            'constraints' => 0,
            'notnull_strength' => false,
            'unique_strength' => false,
            'exp_strength' => false,
        );
        $this->assertEquals($expected, $data[10]);
    }

    public function testReadQgisMapLayerConstraintExpressions()
    {
        $oXml = new XMLReader();
        $xml_path = __DIR__.'/../Project/Ressources/montpellier.qgs';
        $oXml->open($xml_path);

        $data = array();
        while($oXml->read()){
            if($oXml->nodeType == XMLReader::ELEMENT
               && $oXml->localName == 'maplayer'
               && $oXml->depth == 2) {
                while($oXml->read()){
                    if($oXml->nodeType == XMLReader::ELEMENT
                        && $oXml->localName == 'constraintExpressions'
                        && $oXml->depth == 3) {
                        $data = Project\QgisProjectParser::readQgisMapLayerConstraintExpressions($oXml);
                        break;
                    }
                }
                break;
            }
        }
        $this->assertCount(11, $data);
        $expected = array(
            'field' => 'QUARTMNO',
            'exp' => '',
            'desc' => '',
        );
        $this->assertEquals($expected, $data[0]);
        $expected = array(
            'field' => 'socio_average_income',
            'exp' => '',
            'desc' => '',
        );
        $this->assertEquals($expected, $data[5]);
        $expected = array(
            'field' => 'area',
            'exp' => '',
            'desc' => '',
        );
        $this->assertEquals($expected, $data[10]);
    }

    public function testReadQgisMapLayerStyleManager()
    {
        $xmlStr = '
        <map-layer-style-manager current="default">
          <map-layer-style name="default"/>
        </map-layer-style-manager>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisMapLayerStyleManager($oXml);
        $this->assertTrue(is_array($data));
        $expected = array(
            'current' => 'default',
            'styles' => array('default'),
        );
        $this->assertEquals($expected, $data);

        $xmlStr = '
        <map-layer-style-manager current="black">
          <map-layer-style name="black"/>
          <map-layer-style name="colored">
            <qgis hasScaleBasedVisibilityFlag="0" maximumScale="1e+08" minLabelScale="1" scaleBasedLabelVisibilityFlag="0" simplifyLocal="1" simplifyMaxScale="1" minimumScale="-4.65661e-10" version="2.14.2-Essen" maxLabelScale="1e+08" simplifyDrawingTol="1" simplifyDrawingHints="1">
              <edittypes>
                <edittype widgetv2type="TextEdit" name="OGC_FID">
                  <widgetv2config fieldEditable="1" labelOnTop="0" UseHtml="0" IsMultiline="0"/>
                </edittype>
              </edittypes>
              <aliases>
                <alias index="0" field="OGC_FID" name="Id"/>
                <alias index="6" field="colour" name="Colour"/>
                <alias index="4" field="from" name="From"/>
                <alias index="2" field="name" name="Line"/>
                <alias index="1" field="osm_id" name="Id OSM"/>
                <alias index="3" field="ref" name="Ref"/>
                <alias index="5" field="to" name="To"/>
              </aliases>
            </qgis>
        </map-layer-style-manager>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisMapLayerStyleManager($oXml);
        $this->assertTrue(is_array($data));
        $expected = array(
            'current' => 'black',
            'styles' => array(
                'black',
                'colored',
            ),
        );
        $this->assertEquals($expected, $data);
    }

    public function testReadQgisMapLayerAttributeTableColumns()
    {
        $xmlStr = '
          <columns>
            <column type="field" hidden="0" width="100" name="nid"/>
            <column type="field" hidden="0" width="371" name="titre"/>
            <column type="field" hidden="1" width="-1" name="vignette_src"/>
            <column type="field" hidden="1" width="-1" name="vignette_alt"/>
            <column type="field" hidden="0" width="226" name="field_date"/>
            <column type="field" hidden="1" width="-1" name="description"/>
            <column type="field" hidden="0" width="190" name="field_communes"/>
            <column type="field" hidden="0" width="234" name="field_lieu"/>
            <column type="field" hidden="0" width="100" name="field_access"/>
            <column type="field" hidden="0" width="166" name="field_thematique"/>
            <column type="field" hidden="1" width="-1" name="x"/>
            <column type="field" hidden="1" width="-1" name="y"/>
            <column type="field" hidden="0" width="186" name="url"/>
            <column type="actions" hidden="1" width="-1"/>
            <column type="field" hidden="0" width="-1" name="fid"/>
          </columns>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisMapLayerAttributeTableColumns($oXml);
        $this->assertTrue(is_array($data));
        $this->assertCount(15, $data);
        $expected = array(
            array(
                'type' => 'field',
                'name' => 'nid',
                'hidden' => false,
            ),
            array(
                'type' => 'field',
                'name' => 'titre',
                'hidden' => false,
            ),
            array(
                'type' => 'field',
                'name' => 'vignette_src',
                'hidden' => true,
            ),
            array(
                'type' => 'field',
                'name' => 'vignette_alt',
                'hidden' => true,
            ),
            array(
                'type' => 'field',
                'name' => 'field_date',
                'hidden' => false,
            ),
            array(
                'type' => 'field',
                'name' => 'description',
                'hidden' => true,
            ),
            array(
                'type' => 'field',
                'name' => 'field_communes',
                'hidden' => false,
            ),
            array(
                'type' => 'field',
                'name' => 'field_lieu',
                'hidden' => false,
            ),
            array(
                'type' => 'field',
                'name' => 'field_access',
                'hidden' => false,
            ),
            array(
                'type' => 'field',
                'name' => 'field_thematique',
                'hidden' => false,
            ),
            array(
                'type' => 'field',
                'name' => 'x',
                'hidden' => true,
            ),
            array(
                'type' => 'field',
                'name' => 'y',
                'hidden' => true,
            ),
            array(
                'type' => 'field',
                'name' => 'url',
                'hidden' => false,
            ),
            array(
                'type' => 'actions',
                'name' => null,
                'hidden' => true,
            ),
            array(
                'type' => 'field',
                'name' => 'fid',
                'hidden' => false,
            ),
        );
        $this->assertEquals($expected, $data);
    }

    public function testReadQgisMapLayerAttributeTableConfig()
    {
        $xmlStr = '
        <attributetableconfig actionWidgetStyle="dropDown" sortExpression="&quot;field_communes&quot;" sortOrder="1">
          <columns>
            <column type="field" hidden="0" width="100" name="nid"/>
            <column type="field" hidden="0" width="371" name="titre"/>
            <column type="field" hidden="1" width="-1" name="vignette_src"/>
            <column type="field" hidden="1" width="-1" name="vignette_alt"/>
            <column type="field" hidden="0" width="226" name="field_date"/>
            <column type="field" hidden="1" width="-1" name="description"/>
            <column type="field" hidden="0" width="190" name="field_communes"/>
            <column type="field" hidden="0" width="234" name="field_lieu"/>
            <column type="field" hidden="0" width="100" name="field_access"/>
            <column type="field" hidden="0" width="166" name="field_thematique"/>
            <column type="field" hidden="1" width="-1" name="x"/>
            <column type="field" hidden="1" width="-1" name="y"/>
            <column type="field" hidden="0" width="186" name="url"/>
            <column type="actions" hidden="1" width="-1"/>
            <column type="field" hidden="0" width="-1" name="fid"/>
          </columns>
        </attributetableconfig>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisMapLayerAttributeTableConfig($oXml);
        $this->assertTrue(is_array($data));
        $this->assertTrue(array_key_exists('columns', $data));
        $this->assertCount(15, $data['columns']);
        $expected = array(
            'columns' => array(
                array(
                    'type' => 'field',
                    'name' => 'nid',
                    'hidden' => false,
                ),
                array(
                    'type' => 'field',
                    'name' => 'titre',
                    'hidden' => false,
                ),
                array(
                    'type' => 'field',
                    'name' => 'vignette_src',
                    'hidden' => true,
                ),
                array(
                    'type' => 'field',
                    'name' => 'vignette_alt',
                    'hidden' => true,
                ),
                array(
                    'type' => 'field',
                    'name' => 'field_date',
                    'hidden' => false,
                ),
                array(
                    'type' => 'field',
                    'name' => 'description',
                    'hidden' => true,
                ),
                array(
                    'type' => 'field',
                    'name' => 'field_communes',
                    'hidden' => false,
                ),
                array(
                    'type' => 'field',
                    'name' => 'field_lieu',
                    'hidden' => false,
                ),
                array(
                    'type' => 'field',
                    'name' => 'field_access',
                    'hidden' => false,
                ),
                array(
                    'type' => 'field',
                    'name' => 'field_thematique',
                    'hidden' => false,
                ),
                array(
                    'type' => 'field',
                    'name' => 'x',
                    'hidden' => true,
                ),
                array(
                    'type' => 'field',
                    'name' => 'y',
                    'hidden' => true,
                ),
                array(
                    'type' => 'field',
                    'name' => 'url',
                    'hidden' => false,
                ),
                array(
                    'type' => 'actions',
                    'name' => null,
                    'hidden' => true,
                ),
                array(
                    'type' => 'field',
                    'name' => 'fid',
                    'hidden' => false,
                ),
            ),
        );
        $this->assertEquals($expected, $data);
    }

    public function testReadQgisMapLayerVectorJoins()
    {
        $xmlStr = '
        <vectorjoins>
          <join joinFieldName="squartmno" dynamicForm="0" targetFieldName="SQUARTMNO" hasCustomPrefix="1" memoryCache="0" cascadedDelete="0" editable="0" customPrefix="socio_" joinLayerId="donnes_sociodemo_sous_quartiers20160121144525075" upsertOnEdit="0"/>
          <join joinFieldName="QUARTMNO" dynamicForm="0" targetFieldName="QUARTMNO" memoryCache="0" cascadedDelete="0" editable="0" joinLayerId="VilleMTP_MTP_Quartiers_2011_432620130116112610876" upsertOnEdit="0">
            <joinFieldsSubset>
              <field name="LIBQUART"/>
            </joinFieldsSubset>
          </join>
        </vectorjoins>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisMapLayerVectorJoins($oXml);
        $this->assertTrue(is_array($data));
        $this->assertCount(2, $data);
        $expected = array(
            array(
                'joinLayerId' => 'donnes_sociodemo_sous_quartiers20160121144525075',
                'joinFieldName' => 'squartmno',
                'targetFieldName' => 'SQUARTMNO',
            ),
            array(
                'joinLayerId' => 'VilleMTP_MTP_Quartiers_2011_432620130116112610876',
                'joinFieldName' => 'QUARTMNO',
                'targetFieldName' => 'QUARTMNO',
            ),
        );
        $this->assertEquals($expected, $data);
    }

    public function testReadAttributes()
    {
        $xmlStr = '
        <excludeAttributesWFS>
          <attribute>OGC_FID</attribute>
          <attribute>wkt</attribute>
          <attribute>from</attribute>
          <attribute>html</attribute>
          <attribute>to</attribute>
          <attribute>colour</attribute>
        </excludeAttributesWFS>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $values = Project\QgisProjectParser::readAttributes($oXml);
        $this->assertTrue(is_array($values));
        $this->assertCount(6, $values);
        $expected = array(
            'OGC_FID',
            'wkt',
            'from',
            'html',
            'to',
            'colour',
        );
        $this->assertEquals($expected, $values);
    }

    public function testReadItems()
    {
        $xmlStr = '
            <custom-order enabled="0">
              <item>edition_point20130118171631518</item>
              <item>edition_line20130409161630329</item>
              <item>edition_polygon20130409114333776</item>
              <item>bus_stops20121106170806413</item>
              <item>bus20121102133611751</item>
              <item>VilleMTP_MTP_Quartiers_2011_432620130116112610876</item>
              <item>VilleMTP_MTP_Quartiers_2011_432620130116112351546</item>
              <item>tramstop20150328114203878</item>
              <item>tramway20150328114206278</item>
              <item>publicbuildings20150420100958543</item>
              <item>SousQuartiers20160121124316563</item>
              <item>osm_stamen_toner20180315181710198</item>
              <item>osm_mapnik20180315181738526</item>
            </custom-order>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $values = Project\QgisProjectParser::readItems($oXml);
        $this->assertTrue(is_array($values));
        $this->assertCount(13, $values);
        $this->assertEquals('edition_point20130118171631518', $values[0]);
        $this->assertEquals('VilleMTP_MTP_Quartiers_2011_432620130116112610876', $values[5]);
        $this->assertEquals('VilleMTP_MTP_Quartiers_2011_432620130116112351546', $values[6]);
        $this->assertEquals('osm_mapnik20180315181738526', $values[12]);
    }

    public function testReadValues()
    {
        $xmlStr = '
        <WMSCrsList type="QStringList">
          <value>EPSG:2154</value>
          <value>EPSG:4326</value>
          <value>EPSG:3857</value>
        </WMSCrsList>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $values = Project\QgisProjectParser::readValues($oXml);
        $this->assertTrue(is_array($values));
        $this->assertCount(3, $values);
        $expected = array(
            'EPSG:2154',
            'EPSG:4326',
            'EPSG:3857',
        );
        $this->assertEquals($expected, $values);
    }

    public function testReadOption()
    {
        $xmlStr = '
              <Option type="Map">
                <Option value="A" type="QString" name="Zone A"/>
              </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $options = Project\QgisProjectParser::readOption($oXml);
        $this->assertTrue(is_array($options));
        $this->assertCount(1, $options);
        $expectedOptions = array(
            'Zone A' => 'A',
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
          <Option type="Map">
            <Option value="0" type="QString" name="IsMultiline"/>
            <Option value="0" type="QString" name="UseHtml"/>
          </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $options = Project\QgisProjectParser::readOption($oXml);
        $this->assertTrue(is_array($options));
        $this->assertCount(2, $options);
        $expectedOptions = array(
            'IsMultiline' => '0',
            'UseHtml' => '0',
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
          <Option type="Map">
            <Option value="0" type="int" name="IsMultiline"/>
            <Option value="0" type="int" name="UseHtml"/>
          </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $options = Project\QgisProjectParser::readOption($oXml);
        $this->assertTrue(is_array($options));
        $this->assertCount(2, $options);
        $expectedOptions = array(
            'IsMultiline' => 0,
            'UseHtml' => 0,
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
              <Option type="Map">
                <Option value="false" type="bool" name="IsMultiline"/>
                <Option value="false" type="bool" name="UseHtml"/>
              </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $options = Project\QgisProjectParser::readOption($oXml);
        $this->assertTrue(is_array($options));
        $this->assertCount(2, $options);
        $expectedOptions = array(
            'IsMultiline' => false,
            'UseHtml' => false,
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
          <Option type="Map">
            <Option name="AllowNull" type="bool" value="true"></Option>
            <Option name="Max" type="int" value="2147483647"></Option>
            <Option name="Min" type="int" value="-2147483648"></Option>
            <Option name="Precision" type="int" value="0"></Option>
            <Option name="Step" type="int" value="1"></Option>
            <Option name="Style" type="QString" value="SpinBox"></Option>
          </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $options = Project\QgisProjectParser::readOption($oXml);
        $this->assertTrue(is_array($options));
        $expectedOptions = array(
            'AllowNull' => true,
            'Max' => 2147483647,
            'Min' => -2147483648,
            'Precision' => 0,
            'Step' => 1,
            'Style' => 'SpinBox',
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
           <Option type="Map">
           <Option type="List" name="map">
             <Option type="Map">
               <Option value="A" type="QString" name="Zone A"/>
             </Option>
             <Option type="Map">
               <Option value="B" type="QString" name="Zone B"/>
             </Option>
             <Option type="Map">
               <Option value="{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}" type="QString" name="No Zone"/>
             </Option>
           </Option>
           </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $options = Project\QgisProjectParser::readOption($oXml);
        $this->assertTrue(is_array($options));
        $expectedOptions = array(
            'map' => array(
                'A' => 'Zone A',
                'B' => 'Zone B',
                '{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}' => 'No Zone',
            ),
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
           <Option type="StringList">
               <Option type="QString" value="Zone A"></Option>
               <Option type="QString" value="Zone B"></Option>
               <Option type="QString" value="No Zone"></Option>
           </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $this->assertEquals('StringList', $oXml->getAttribute('type'));

        $options = Project\QgisProjectParser::readOption($oXml);
        $this->assertTrue(is_array($options));
        $expectedOptions = array(
                'Zone A',
                'Zone B',
                'No Zone',
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
        <Option type="Map">
          <Option value="1" name="DocumentViewer" type="int"/>
          <Option value="0" name="DocumentViewerHeight" type="int"/>
          <Option value="0" name="DocumentViewerWidth" type="int"/>
          <Option value="true" name="FileWidget" type="bool"/>
          <Option value="true" name="FileWidgetButton" type="bool"/>
          <Option value="" name="FileWidgetFilter" type="QString"/>
          <Option name="PropertyCollection" type="Map">
            <Option value="" name="name" type="QString"/>
            <Option name="properties" type="Map">
              <Option name="storageUrl" type="Map">
                <Option value="true" name="active" type="bool"/>
                <Option value="\'http://webdav/shapeData/\'||file_name(@selected_file_path)" name="expression" type="QString"/>
                <Option value="3" name="type" type="int"/>
              </Option>
            </Option>
            <Option value="collection" name="type" type="QString"/>
          </Option>
          <Option value="0" name="RelativeStorage" type="int"/>
          <Option value="k6k7lv8" name="StorageAuthConfigId" type="QString"/>
          <Option value="0" name="StorageMode" type="int"/>
          <Option value="WebDAV" name="StorageType" type="QString"/>
        </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $this->assertEquals('Map', $oXml->getAttribute('type'));

        $options = Project\QgisProjectParser::readOption($oXml);

        $this->assertTrue(is_array($options));
        $expectedOptions = array(
                'DocumentViewer' => 1,
                'DocumentViewerHeight' => 0,
                'DocumentViewerWidth' => 0,
                'FileWidget' => true,
                'FileWidgetButton' => true,
                'FileWidgetFilter' => '',
                'PropertyCollection' => array(
                  'name' => '',
                  'properties' => array(
                    'storageUrl' => array (
                      'active' => true,
                      'expression' => '\'http://webdav/shapeData/\'||file_name(@selected_file_path)',
                      'type' => 3,
                    ),
                  ),
                  'type' => 'collection',
                ),
                'RelativeStorage' => 0,
                'StorageAuthConfigId' => 'k6k7lv8',
                'StorageMode' => 0,
                'StorageType' => 'WebDAV',
        );
        $this->assertEquals($expectedOptions, $options);
    }

    public function testReadQgisMapLayerEditWidgetConfig()
    {
        $xmlStr = '
            <config>
              <Option type="Map">
                <Option value="0" type="QString" name="IsMultiline"/>
                <Option value="0" type="QString" name="UseHtml"/>
              </Option>
            </config>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisMapLayerEditWidgetConfig($oXml);
        $this->assertTrue(is_array($data));
        $expectedOptions = array(
            array(
                'IsMultiline' => '0',
                'UseHtml' => '0',
            ),
        );
        $this->assertEquals($expectedOptions, $data);
    }

    public function testReadQgisMapLayerEditWidget()
    {
        $xmlStr = '
          <editWidget type="TextEdit">
            <config>
              <Option type="Map">
                <Option value="0" type="QString" name="IsMultiline"/>
                <Option value="0" type="QString" name="UseHtml"/>
              </Option>
            </config>
          </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisMapLayerEditWidget($oXml);
        $this->assertTrue(is_array($data));
        $expectedOptions = array(
            'type' => 'TextEdit',
            'config' => array(
                array(
                    'IsMultiline' => '0',
                    'UseHtml' => '0',
                ),
            ),
        );
        $this->assertEquals($expectedOptions, $data);
    }

    public function testReadQgisMapLayerField()
    {
        $xmlStr = '
        <field configurationFlags="HideFromWms|HideFromWfs" name="OGC_FID">
          <editWidget type="TextEdit">
            <config>
              <Option type="Map">
                <Option value="0" type="QString" name="IsMultiline"/>
                <Option value="0" type="QString" name="UseHtml"/>
              </Option>
            </config>
          </editWidget>
        </field>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisMapLayerField($oXml);
        $this->assertTrue(is_array($data));
        $expectedOptions = array(
            'name' => 'OGC_FID',
            'configurationFlags' => 'HideFromWms|HideFromWfs',
            'editWidget' => array(
                'type' => 'TextEdit',
                'config' => array(
                    array(
                        'IsMultiline' => '0',
                        'UseHtml' => '0',
                    ),
                ),
            ),
        );
        $this->assertEquals($expectedOptions, $data);
    }

    public function testReadQgisMapLayerFieldConfiguration()
    {
        $xmlStr = '
      <fieldConfiguration>
        <field configurationFlags="HideFromWms" name="OGC_FID">
          <editWidget type="TextEdit">
            <config>
              <Option type="Map">
                <Option value="0" type="QString" name="IsMultiline"/>
                <Option value="0" type="QString" name="UseHtml"/>
              </Option>
            </config>
          </editWidget>
        </field>
        <field name="tram_id">
          <editWidget type="ValueRelation">
            <config>
              <Option type="Map">
                <Option value="0" type="QString" name="AllowMulti"/>
                <Option value="1" type="QString" name="AllowNull"/>
                <Option value="" type="QString" name="FilterExpression"/>
                <Option value="osm_id" type="QString" name="Key"/>
                <Option value="tramway20150328114206278" type="QString" name="Layer"/>
                <Option value="1" type="QString" name="OrderByValue"/>
                <Option value="0" type="QString" name="UseCompleter"/>
                <Option value="test" type="QString" name="Value"/>
              </Option>
            </config>
          </editWidget>
        </field>
      </fieldConfiguration>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisMapLayerFieldConfiguration($oXml);
        $this->assertTrue(is_array($data));
        $this->assertCount(2, $data);
        $expectedOptions = array(
            array(
                'name' => 'OGC_FID',
                'configurationFlags' => 'HideFromWms',
                'editWidget' => array(
                    'type' => 'TextEdit',
                    'config' => array(
                        array(
                            'IsMultiline' => '0',
                            'UseHtml' => '0',
                        ),
                    ),
                ),
            ),
            array(
                'name' => 'tram_id',
                'configurationFlags' => null,
                'editWidget' => array(
                    'type' => 'ValueRelation',
                    'config' => array(
                        array(
                            'AllowMulti' => '0',
                            'AllowNull' => '1',
                            'FilterExpression' => '',
                            'Key' => 'osm_id',
                            'Layer' => 'tramway20150328114206278',
                            'OrderByValue' => '1',
                            'UseCompleter' => '0',
                            'Value' => 'test',
                        ),
                    ),
                ),
            ),
        );
        $this->assertEquals($expectedOptions, $data);
    }

    public function testReadQgisCustomOrder()
    {
        $xmlStr = '
            <custom-order enabled="0">
              <item>edition_point20130118171631518</item>
              <item>edition_line20130409161630329</item>
              <item>edition_polygon20130409114333776</item>
              <item>bus_stops20121106170806413</item>
              <item>bus20121102133611751</item>
              <item>VilleMTP_MTP_Quartiers_2011_432620130116112610876</item>
              <item>VilleMTP_MTP_Quartiers_2011_432620130116112351546</item>
              <item>tramstop20150328114203878</item>
              <item>tramway20150328114206278</item>
              <item>publicbuildings20150420100958543</item>
              <item>SousQuartiers20160121124316563</item>
              <item>osm_stamen_toner20180315181710198</item>
              <item>osm_mapnik20180315181738526</item>
            </custom-order>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisCustomOrder($oXml);
        $this->assertTrue(is_array($data));
        $this->assertFalse($data['enabled']);
        $this->assertFalse(array_key_exists('items', $data));

        $xmlStr = '
            <custom-order enabled="1">
              <item>edition_point20130118171631518</item>
              <item>edition_line20130409161630329</item>
              <item>edition_polygon20130409114333776</item>
              <item>bus_stops20121106170806413</item>
              <item>bus20121102133611751</item>
              <item>VilleMTP_MTP_Quartiers_2011_432620130116112610876</item>
              <item>VilleMTP_MTP_Quartiers_2011_432620130116112351546</item>
              <item>tramstop20150328114203878</item>
              <item>tramway20150328114206278</item>
              <item>publicbuildings20150420100958543</item>
              <item>SousQuartiers20160121124316563</item>
              <item>osm_stamen_toner20180315181710198</item>
              <item>osm_mapnik20180315181738526</item>
            </custom-order>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisCustomOrder($oXml);
        $this->assertTrue(is_array($data));
        $this->assertTrue($data['enabled']);
        $this->assertTrue(array_key_exists('items', $data));
        $this->assertCount(13, $data['items']);
    }

    public function testReadQgisProjectCrs()
    {
        $xmlStr = '
          <projectCrs>
            <spatialrefsys>
              <wkt>PROJCS["unnamed",GEOGCS["unnamed ellipse",DATUM["unknown",SPHEROID["unnamed",6378137,0],EXTENSION["PROJ4_GRIDS","@null"]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Mercator_2SP"],PARAMETER["standard_parallel_1",0],PARAMETER["central_meridian",0],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["Meter",1],EXTENSION["PROJ4","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"]]</wkt>
              <proj4>+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs</proj4>
              <srsid>100000</srsid>
              <srid>0</srid>
              <authid>USER:100000</authid>
              <description> * SCR généré (+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs)</description>
              <projectionacronym>merc</projectionacronym>
              <ellipsoidacronym></ellipsoidacronym>
              <geographicflag>false</geographicflag>
            </spatialrefsys>
          </projectCrs>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisProjectCrs($oXml);
        $this->assertTrue(is_array($data));
        $expected = array(
            'proj4' => '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
            'srid' => 0,
            'authid' => 'USER:100000',
            'description' => ' * SCR généré (+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs)',
        );
        $this->assertEquals($expected, $data);
    }

    public function testReadQgisLayoutItem()
    {
        $xmlStr = '
        <LayoutItem templateUuid="{c7f5eda5-28b1-4804-b7d2-50154503de18}" positionOnPage="0,0,mm" id="" size="297,210,mm" referencePoint="0" outlineWidthM="0.3,mm" itemRotation="0" blendMode="0" opacity="1" type="65638" groupUuid="" positionLock="false" frameJoinStyle="miter" background="true" visibility="1" position="0,0,mm" frame="false" uuid="{c7f5eda5-28b1-4804-b7d2-50154503de18}" excludeFromExports="0" zValue="0">
          <FrameColor red="0" alpha="255" green="0" blue="0"/>
          <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
          <LayoutObject>
            <dataDefinedProperties>
              <Option type="Map">
                <Option value="" type="QString" name="name"/>
                <Option name="properties"/>
                <Option value="collection" type="QString" name="type"/>
              </Option>
            </dataDefinedProperties>
            <customproperties/>
          </LayoutObject>
          <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="fill" name="">
            <layer locked="0" enabled="1" class="SimpleFill" pass="0">
              <prop v="3x:0,0,0,0,0,0" k="border_width_map_unit_scale"/>
              <prop v="255,255,255,255" k="color"/>
              <prop v="miter" k="joinstyle"/>
              <prop v="0,0" k="offset"/>
              <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
              <prop v="MM" k="offset_unit"/>
              <prop v="35,35,35,255" k="outline_color"/>
              <prop v="no" k="outline_style"/>
              <prop v="0.26" k="outline_width"/>
              <prop v="MM" k="outline_width_unit"/>
              <prop v="solid" k="style"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </LayoutItem>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisLayoutItem($oXml);
        $this->assertTrue(is_array($data));
        $expected = array(
            'type' => '65638',
            'typeName' => 'page',
            'width' => 297,
            'height' => 210,
            'x' => 0,
            'y' => 0,
        );
        $this->assertEquals($expected, $data);

        $xmlStr = '
        <LayoutItem templateUuid="{1882e5b6-7d46-4bbc-af77-e0c6ab1681f6}" positionOnPage="8.10892,83.121,mm" labelText="Tram stops in the district" id="" valign="32" marginY="1" halign="1" size="278.374,7.59424,mm" referencePoint="0" outlineWidthM="0.3,mm" itemRotation="0" blendMode="0" opacity="1" type="65641" groupUuid="" positionLock="false" frameJoinStyle="miter" background="false" visibility="1" position="8.10892,303.121,mm" marginX="1" frame="false" uuid="{1882e5b6-7d46-4bbc-af77-e0c6ab1681f6}" excludeFromExports="0" zValue="24" htmlState="0">
          <FrameColor red="0" alpha="255" green="0" blue="0"/>
          <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
          <LayoutObject>
            <dataDefinedProperties>
              <Option type="Map">
                <Option value="" type="QString" name="name"/>
                <Option name="properties"/>
                <Option value="collection" type="QString" name="type"/>
              </Option>
            </dataDefinedProperties>
            <customproperties/>
          </LayoutObject>
          <LabelFont description="Bitstream Vera Sans,16,-1,5,50,2,0,0,0,0" style=""/>
          <FontColor red="0" alpha="255" green="0" blue="0"/>
        </LayoutItem>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisLayoutItem($oXml);
        $this->assertTrue(is_array($data));
        $expected = array(
            'type' => '65641',
            'typeName' => 'label',
            'id' => '',
            'htmlState' => false,
            'text' => 'Tram stops in the district',
        );
        $this->assertEquals($expected, $data);

        $xmlStr = '
        <LayoutItem templateUuid="{a50537f9-5e73-4610-955e-31b092d81b94}" positionOnPage="237.35,162.072,mm" mapRotation="0" id="" size="60.5889,45,mm" referencePoint="0" outlineWidthM="0.3,mm" itemRotation="0" mapFlags="0" blendMode="0" opacity="1" type="65639" groupUuid="" positionLock="false" drawCanvasItems="true" labelMargin="0,mm" frameJoinStyle="miter" background="true" visibility="1" position="237.35,162.072,mm" keepLayerSet="true" frame="false" uuid="{a50537f9-5e73-4610-955e-31b092d81b94}" excludeFromExports="0" followPresetName="" followPreset="false" zValue="3">
          <FrameColor red="0" alpha="255" green="0" blue="0"/>
          <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
          <LayoutObject>
            <dataDefinedProperties>
              <Option type="Map">
                <Option value="" type="QString" name="name"/>
                <Option name="properties"/>
                <Option value="collection" type="QString" name="type"/>
              </Option>
            </dataDefinedProperties>
            <customproperties/>
          </LayoutObject>
          <Extent xmax="448907.96636085514910519" ymax="5417374.24027335178107023" ymin="5392381.09543511364609003" xmin="415256.69628775410819799"/>
          <LayerSet>
            <Layer provider="ogr" source="/home/nboisteault/3liz/infra/lizmap-qgis-3.10/extra-modules/lizmapdemo/qgis-projects/demoqgis/data/vector/VilleMTP_MTP_Quartiers_2011_4326.shp" name="VilleMTP_MTP_Quartiers_2011_4326">VilleMTP_MTP_Quartiers_2011_432620130116112351546</Layer>
          </LayerSet>
          <ComposerMapGrid showAnnotation="0" rightAnnotationDirection="0" gridFrameMargin="0" bottomAnnotationDisplay="0" bottomFrameDivisions="0" topAnnotationDirection="0" annotationExpression="" rightAnnotationDisplay="0" gridFrameWidth="2" topAnnotationDisplay="0" rightAnnotationPosition="1" annotationPrecision="3" bottomAnnotationDirection="0" gridFramePenColor="0,0,0,255" show="0" gridStyle="0" annotationFormat="0" name="Grille 1" unit="0" crossLength="3" gridFrameSideFlags="15" topFrameDivisions="0" uuid="{79ab9045-ef71-4cf1-83f1-f90bfe64ad9f}" intervalX="0" gridFrameStyle="0" offsetY="0" rightFrameDivisions="0" leftAnnotationPosition="1" leftFrameDivisions="0" intervalY="0" offsetX="0" annotationFontColor="0,0,0,255" leftAnnotationDisplay="0" bottomAnnotationPosition="1" frameFillColor1="255,255,255,255" frameAnnotationDistance="1" topAnnotationPosition="1" leftAnnotationDirection="0" blendMode="0" maximumIntervalWidth="100" position="3" gridFramePenThickness="0.5" frameFillColor2="0,0,0,255" minimumIntervalWidth="50">
            <lineStyle>
              <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="line" name="">
                <layer locked="0" enabled="1" class="SimpleLine" pass="0">
                  <prop v="flat" k="capstyle"/>
                  <prop v="5;2" k="customdash"/>
                  <prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/>
                  <prop v="MM" k="customdash_unit"/>
                  <prop v="0" k="draw_inside_polygon"/>
                  <prop v="bevel" k="joinstyle"/>
                  <prop v="0,0,0,255" k="line_color"/>
                  <prop v="solid" k="line_style"/>
                  <prop v="0.3" k="line_width"/>
                  <prop v="MM" k="line_width_unit"/>
                  <prop v="0" k="offset"/>
                  <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
                  <prop v="MM" k="offset_unit"/>
                  <prop v="0" k="ring_filter"/>
                  <prop v="0" k="use_custom_dash"/>
                  <prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/>
                  <data_defined_properties>
                    <Option type="Map">
                      <Option value="" type="QString" name="name"/>
                      <Option name="properties"/>
                      <Option value="collection" type="QString" name="type"/>
                    </Option>
                  </data_defined_properties>
                </layer>
              </symbol>
            </lineStyle>
            <markerStyle>
              <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="marker" name="">
                <layer locked="0" enabled="1" class="SimpleMarker" pass="0">
                  <prop v="0" k="angle"/>
                  <prop v="0,0,0,255" k="color"/>
                  <prop v="1" k="horizontal_anchor_point"/>
                  <prop v="bevel" k="joinstyle"/>
                  <prop v="circle" k="name"/>
                  <prop v="0,0" k="offset"/>
                  <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
                  <prop v="MM" k="offset_unit"/>
                  <prop v="0,0,0,255" k="outline_color"/>
                  <prop v="solid" k="outline_style"/>
                  <prop v="0" k="outline_width"/>
                  <prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/>
                  <prop v="MM" k="outline_width_unit"/>
                  <prop v="area" k="scale_method"/>
                  <prop v="2" k="size"/>
                  <prop v="3x:0,0,0,0,0,0" k="size_map_unit_scale"/>
                  <prop v="MM" k="size_unit"/>
                  <prop v="1" k="vertical_anchor_point"/>
                  <data_defined_properties>
                    <Option type="Map">
                      <Option value="" type="QString" name="name"/>
                      <Option name="properties"/>
                      <Option value="collection" type="QString" name="type"/>
                    </Option>
                  </data_defined_properties>
                </layer>
              </symbol>
            </markerStyle>
            <annotationFontProperties description="Cantarell,11,-1,5,50,0,0,0,0,0" style=""/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
          </ComposerMapGrid>
          <ComposerMapOverview uuid="{cccfa4de-c508-4cc3-a6fb-7d18d2491b66}" blendMode="0" position="3" frameMap="{a228885d-4d7a-4ae0-af9b-02a4fe7cd814}" show="1" inverted="0" centered="0" name="Overview 1">
            <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="fill" name="">
              <layer locked="0" enabled="1" class="SimpleLine" pass="0">
                <prop v="square" k="capstyle"/>
                <prop v="5;2" k="customdash"/>
                <prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/>
                <prop v="MM" k="customdash_unit"/>
                <prop v="0" k="draw_inside_polygon"/>
                <prop v="bevel" k="joinstyle"/>
                <prop v="227,26,28,255" k="line_color"/>
                <prop v="solid" k="line_style"/>
                <prop v="0.78" k="line_width"/>
                <prop v="MM" k="line_width_unit"/>
                <prop v="0" k="offset"/>
                <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
                <prop v="MM" k="offset_unit"/>
                <prop v="0" k="ring_filter"/>
                <prop v="0" k="use_custom_dash"/>
                <prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/>
                <data_defined_properties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </data_defined_properties>
              </layer>
            </symbol>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
          </ComposerMapOverview>
          <AtlasMap scalingMode="2" atlasDriven="0" margin="0.10000000000000001"/>
          <labelBlockingItems/>
        </LayoutItem>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisLayoutItem($oXml);
        $this->assertTrue(is_array($data));
        $expected = array(
            'type' => '65639',
            'typeName' => 'map',
            'uuid' => '{a50537f9-5e73-4610-955e-31b092d81b94}',
            'width' => 60,
            'height' => 45,
            'grid' => false,
            'overviewMap' => '{a228885d-4d7a-4ae0-af9b-02a4fe7cd814}',
        );
        $this->assertEquals($expected, $data);
    }

    public function testReadQgisLayout()
    {
        $xmlStr = '
        <Layout units="mm" worldFileMap="" printResolution="300" name="District card">
          <Snapper snapToGuides="1" snapToGrid="0" snapToItems="1" tolerance="5"/>
          <Grid resolution="10" resUnits="mm" offsetX="0" offsetY="0" offsetUnits="mm"/>
          <PageCollection>
            <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="fill" name="">
              <layer locked="0" enabled="1" class="SimpleFill" pass="0">
                <prop v="3x:0,0,0,0,0,0" k="border_width_map_unit_scale"/>
                <prop v="255,255,255,255" k="color"/>
                <prop v="bevel" k="joinstyle"/>
                <prop v="0,0" k="offset"/>
                <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
                <prop v="MM" k="offset_unit"/>
                <prop v="0,0,0,255" k="outline_color"/>
                <prop v="no" k="outline_style"/>
                <prop v="0.26" k="outline_width"/>
                <prop v="MM" k="outline_width_unit"/>
                <prop v="solid" k="style"/>
                <data_defined_properties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </data_defined_properties>
              </layer>
            </symbol>
            <LayoutItem templateUuid="{c7f5eda5-28b1-4804-b7d2-50154503de18}" positionOnPage="0,0,mm" id="" size="297,210,mm" referencePoint="0" outlineWidthM="0.3,mm" itemRotation="0" blendMode="0" opacity="1" type="65638" groupUuid="" positionLock="false" frameJoinStyle="miter" background="true" visibility="1" position="0,0,mm" frame="false" uuid="{c7f5eda5-28b1-4804-b7d2-50154503de18}" excludeFromExports="0" zValue="0">
              <FrameColor red="0" alpha="255" green="0" blue="0"/>
              <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
              <LayoutObject>
                <dataDefinedProperties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </dataDefinedProperties>
                <customproperties/>
              </LayoutObject>
              <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="fill" name="">
                <layer locked="0" enabled="1" class="SimpleFill" pass="0">
                  <prop v="3x:0,0,0,0,0,0" k="border_width_map_unit_scale"/>
                  <prop v="255,255,255,255" k="color"/>
                  <prop v="miter" k="joinstyle"/>
                  <prop v="0,0" k="offset"/>
                  <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
                  <prop v="MM" k="offset_unit"/>
                  <prop v="35,35,35,255" k="outline_color"/>
                  <prop v="no" k="outline_style"/>
                  <prop v="0.26" k="outline_width"/>
                  <prop v="MM" k="outline_width_unit"/>
                  <prop v="solid" k="style"/>
                  <data_defined_properties>
                    <Option type="Map">
                      <Option value="" type="QString" name="name"/>
                      <Option name="properties"/>
                      <Option value="collection" type="QString" name="type"/>
                    </Option>
                  </data_defined_properties>
                </layer>
              </symbol>
            </LayoutItem>
            <LayoutItem templateUuid="{1d5a7d54-5d42-48e7-bd61-ce5e75ac2a21}" positionOnPage="0,0,mm" id="" size="297,210,mm" referencePoint="0" outlineWidthM="0.3,mm" itemRotation="0" blendMode="0" opacity="1" type="65638" groupUuid="" positionLock="false" frameJoinStyle="miter" background="true" visibility="1" position="0,220,mm" frame="false" uuid="{1d5a7d54-5d42-48e7-bd61-ce5e75ac2a21}" excludeFromExports="0" zValue="0">
              <FrameColor red="0" alpha="255" green="0" blue="0"/>
              <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
              <LayoutObject>
                <dataDefinedProperties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </dataDefinedProperties>
                <customproperties/>
              </LayoutObject>
              <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="fill" name="">
                <layer locked="0" enabled="1" class="SimpleFill" pass="0">
                  <prop v="3x:0,0,0,0,0,0" k="border_width_map_unit_scale"/>
                  <prop v="255,255,255,255" k="color"/>
                  <prop v="miter" k="joinstyle"/>
                  <prop v="0,0" k="offset"/>
                  <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
                  <prop v="MM" k="offset_unit"/>
                  <prop v="35,35,35,255" k="outline_color"/>
                  <prop v="no" k="outline_style"/>
                  <prop v="0.26" k="outline_width"/>
                  <prop v="MM" k="outline_width_unit"/>
                  <prop v="solid" k="style"/>
                  <data_defined_properties>
                    <Option type="Map">
                      <Option value="" type="QString" name="name"/>
                      <Option name="properties"/>
                      <Option value="collection" type="QString" name="type"/>
                    </Option>
                  </data_defined_properties>
                </layer>
              </symbol>
            </LayoutItem>
            <LayoutItem templateUuid="{d363d24e-9507-4022-87cb-e2d2cf53faf2}" positionOnPage="0,0,mm" id="" size="297,210,mm" referencePoint="0" outlineWidthM="0.3,mm" itemRotation="0" blendMode="0" opacity="1" type="65638" groupUuid="" positionLock="false" frameJoinStyle="miter" background="true" visibility="1" position="0,440,mm" frame="false" uuid="{d363d24e-9507-4022-87cb-e2d2cf53faf2}" excludeFromExports="0" zValue="0">
              <FrameColor red="0" alpha="255" green="0" blue="0"/>
              <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
              <LayoutObject>
                <dataDefinedProperties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </dataDefinedProperties>
                <customproperties/>
              </LayoutObject>
              <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="fill" name="">
                <layer locked="0" enabled="1" class="SimpleFill" pass="0">
                  <prop v="3x:0,0,0,0,0,0" k="border_width_map_unit_scale"/>
                  <prop v="255,255,255,255" k="color"/>
                  <prop v="miter" k="joinstyle"/>
                  <prop v="0,0" k="offset"/>
                  <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
                  <prop v="MM" k="offset_unit"/>
                  <prop v="35,35,35,255" k="outline_color"/>
                  <prop v="no" k="outline_style"/>
                  <prop v="0.26" k="outline_width"/>
                  <prop v="MM" k="outline_width_unit"/>
                  <prop v="solid" k="style"/>
                  <data_defined_properties>
                    <Option type="Map">
                      <Option value="" type="QString" name="name"/>
                      <Option name="properties"/>
                      <Option value="collection" type="QString" name="type"/>
                    </Option>
                  </data_defined_properties>
                </layer>
              </symbol>
            </LayoutItem>
            <GuideCollection visible="1"/>
          </PageCollection>
          <LayoutItem templateUuid="{1882e5b6-7d46-4bbc-af77-e0c6ab1681f6}" positionOnPage="8.10892,83.121,mm" labelText="Tram stops in the district" id="" valign="32" marginY="1" halign="1" size="278.374,7.59424,mm" referencePoint="0" outlineWidthM="0.3,mm" itemRotation="0" blendMode="0" opacity="1" type="65641" groupUuid="" positionLock="false" frameJoinStyle="miter" background="false" visibility="1" position="8.10892,303.121,mm" marginX="1" frame="false" uuid="{1882e5b6-7d46-4bbc-af77-e0c6ab1681f6}" excludeFromExports="0" zValue="24" htmlState="0">
            <FrameColor red="0" alpha="255" green="0" blue="0"/>
            <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
            <LabelFont description="Bitstream Vera Sans,16,-1,5,50,2,0,0,0,0" style=""/>
            <FontColor red="0" alpha="255" green="0" blue="0"/>
          </LayoutItem>
          <LayoutItem templateUuid="{70f96bb4-c794-43f1-8d56-5e9d18a4e5e6}" positionOnPage="8.10892,1.752,mm" labelText="Sub-districts" id="" valign="32" marginY="1" halign="1" size="281.133,7.59424,mm" referencePoint="0" outlineWidthM="0.3,mm" itemRotation="0" blendMode="0" opacity="1" type="65641" groupUuid="" positionLock="false" frameJoinStyle="miter" background="false" visibility="1" position="8.10892,221.752,mm" marginX="1" frame="false" uuid="{70f96bb4-c794-43f1-8d56-5e9d18a4e5e6}" excludeFromExports="0" zValue="12" htmlState="0">
            <FrameColor red="0" alpha="255" green="0" blue="0"/>
            <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
            <LabelFont description="Bitstream Vera Sans,16,-1,5,50,2,0,0,0,0" style=""/>
            <FontColor red="0" alpha="255" green="0" blue="0"/>
          </LayoutItem>
          <LayoutItem templateUuid="{01c30beb-689e-4062-8d01-f18b54f75b86}" positionOnPage="8.10892,9.346,mm" id="" hideBackgroundIfEmpty="0" size="252.506,73.7749,mm" referencePoint="0" sectionY="0" outlineWidthM="0.3,mm" multiFrameTemplateUuid="{0a4df0de-7063-482e-9052-814773b52c9c}" itemRotation="0" blendMode="0" opacity="1" sectionHeight="73.7749" type="65647" groupUuid="" positionLock="false" hidePageIfEmpty="0" frameJoinStyle="miter" background="false" visibility="1" position="8.10892,229.346,mm" sectionWidth="252.506" multiFrame="{0a4df0de-7063-482e-9052-814773b52c9c}" frame="false" sectionX="0" uuid="{01c30beb-689e-4062-8d01-f18b54f75b86}" excludeFromExports="0" zValue="11">
            <FrameColor red="0" alpha="255" green="0" blue="0"/>
            <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
          </LayoutItem>
          <LayoutItem templateUuid="{0ca22a63-0559-4361-be91-4b2cd4443a9e}" positionOnPage="8.10892,0,mm" id="" hideBackgroundIfEmpty="0" size="77.9078,197.439,mm" referencePoint="0" sectionY="119.284" outlineWidthM="0.3,mm" multiFrameTemplateUuid="{541e35d6-31ec-4e26-903d-4bdd9533a581}" itemRotation="0" blendMode="0" opacity="1" sectionHeight="197.439" type="65647" groupUuid="" positionLock="false" hidePageIfEmpty="1" frameJoinStyle="miter" background="false" visibility="1" position="8.10892,440,mm" sectionWidth="77.9078" multiFrame="{541e35d6-31ec-4e26-903d-4bdd9533a581}" frame="false" sectionX="0" uuid="{0ca22a63-0559-4361-be91-4b2cd4443a9e}" excludeFromExports="0" zValue="10">
            <FrameColor red="0" alpha="255" green="0" blue="0"/>
            <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
          </LayoutItem>
          <LayoutItem templateUuid="{6e11b61b-5cdc-4b0a-a1b9-3552f564d3ee}" positionOnPage="0,0,mm" labelText="[%CASE WHEN  @atlas_featureid = $id THEN \'District : \' || &quot;LIBQUART&quot; ELSE \'No district\' END%]" id="" valign="128" marginY="1" halign="4" size="237.35,17.85,mm" referencePoint="0" outlineWidthM="0.3,mm" itemRotation="0" blendMode="0" opacity="1" type="65641" groupUuid="" positionLock="false" frameJoinStyle="miter" background="false" visibility="1" position="0,0,mm" marginX="1" frame="false" uuid="{6e11b61b-5cdc-4b0a-a1b9-3552f564d3ee}" excludeFromExports="0" zValue="9" htmlState="0">
            <FrameColor red="0" alpha="255" green="0" blue="0"/>
            <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
            <LabelFont description="Bitstream Vera Sans,24,-1,5,50,2,0,0,0,0" style=""/>
            <FontColor red="0" alpha="255" green="0" blue="0"/>
          </LayoutItem>
          <LayoutItem templateUuid="{13115e2d-3dda-4c17-b2f6-ae6e09766183}" positionOnPage="8.10892,90.716,mm" id="" hideBackgroundIfEmpty="0" size="77.9078,119.284,mm" referencePoint="0" sectionY="0" outlineWidthM="0.3,mm" multiFrameTemplateUuid="{541e35d6-31ec-4e26-903d-4bdd9533a581}" itemRotation="0" blendMode="0" opacity="1" sectionHeight="119.284" type="65647" groupUuid="" positionLock="false" hidePageIfEmpty="0" frameJoinStyle="miter" background="false" visibility="1" position="8.10892,310.716,mm" sectionWidth="77.9078" multiFrame="{541e35d6-31ec-4e26-903d-4bdd9533a581}" frame="false" sectionX="0" uuid="{13115e2d-3dda-4c17-b2f6-ae6e09766183}" excludeFromExports="0" zValue="8">
            <FrameColor red="0" alpha="255" green="0" blue="0"/>
            <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
          </LayoutItem>
          <LayoutItem segmentSizeMode="0" positionLock="false" maxBarWidth="150" referencePoint="0" outlineWidthM="0.3,mm" mapUuid="{a228885d-4d7a-4ae0-af9b-02a4fe7cd814}" groupUuid="" numUnitsPerSegment="0.01" templateUuid="{b2df3140-8939-4713-bd6c-062c42863c9f}" numSegmentsLeft="2" height="3" frameJoinStyle="miter" lineJoinStyle="miter" alignment="0" boxContentSpace="1" labelHorizontalPlacement="0" itemRotation="0" uuid="{b2df3140-8939-4713-bd6c-062c42863c9f}" segmentMillimeters="0.000275764" unitLabel=" m" labelBarSpace="3" type="65646" size="19.2453,12,mm" zValue="7" lineCapStyle="square" positionOnPage="182.834,195.486,mm" outlineWidth="1" unitType="meters" labelVerticalPlacement="0" opacity="1" background="true" numSegments="4" id="" excludeFromExports="0" minBarWidth="50" numMapUnitsPerScaleBarUnit="1" blendMode="0" style="Numeric" position="182.834,195.486,mm" frame="false" visibility="1">
            <FrameColor red="0" alpha="255" green="0" blue="0"/>
            <BackgroundColor red="255" alpha="150" green="255" blue="255"/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
            <text-style fontCapitals="0" fontItalic="0" textOpacity="1" fontSizeUnit="Point" fontSize="12" fontKerning="1" textColor="0,0,0,255" fontWeight="50" previewBkgrdColor="255,255,255,255" blendMode="0" multilineHeight="1" namedStyle="" fontSizeMapUnitScale="3x:0,0,0,0,0,0" fontWordSpacing="0" fontLetterSpacing="0" fontUnderline="0" fontFamily="Ubuntu" fontStrikeout="0" textOrientation="horizontal">
              <text-buffer bufferSizeUnits="MM" bufferColor="255,255,255,255" bufferSize="1" bufferSizeMapUnitScale="3x:0,0,0,0,0,0" bufferNoFill="1" bufferDraw="0" bufferBlendMode="0" bufferOpacity="1" bufferJoinStyle="128"/>
              <background shapeType="0" shapeDraw="0" shapeSizeType="0" shapeOffsetMapUnitScale="3x:0,0,0,0,0,0" shapeOffsetUnit="MM" shapeOpacity="1" shapeRotationType="0" shapeSizeY="0" shapeJoinStyle="64" shapeBorderWidth="0" shapeSVGFile="" shapeSizeUnit="MM" shapeBorderWidthMapUnitScale="3x:0,0,0,0,0,0" shapeFillColor="255,255,255,255" shapeBorderWidthUnit="MM" shapeBlendMode="0" shapeRotation="0" shapeRadiiX="0" shapeOffsetY="0" shapeRadiiMapUnitScale="3x:0,0,0,0,0,0" shapeBorderColor="128,128,128,255" shapeRadiiY="0" shapeRadiiUnit="MM" shapeSizeX="0" shapeOffsetX="0" shapeSizeMapUnitScale="3x:0,0,0,0,0,0"/>
              <shadow shadowRadiusUnit="MM" shadowRadiusMapUnitScale="3x:0,0,0,0,0,0" shadowOffsetGlobal="1" shadowDraw="0" shadowOpacity="0.7" shadowColor="0,0,0,255" shadowOffsetAngle="135" shadowRadius="1.5" shadowRadiusAlphaOnly="0" shadowOffsetDist="1" shadowOffsetMapUnitScale="3x:0,0,0,0,0,0" shadowUnder="0" shadowScale="100" shadowOffsetUnit="MM" shadowBlendMode="6"/>
              <dd_properties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dd_properties>
            </text-style>
            <fillColor red="0" alpha="255" green="0" blue="0"/>
            <fillColor2 red="255" alpha="255" green="255" blue="255"/>
            <strokeColor red="0" alpha="255" green="0" blue="0"/>
          </LayoutItem>
          <LayoutItem svgBorderWidth="0.2" templateUuid="{3d36198c-b71f-4be4-9dc0-e540e737e3ce}" positionOnPage="216.926,191.227,mm" id="" pictureWidth="12.5735" size="14.2361,16.2837,mm" referencePoint="0" outlineWidthM="0.3,mm" northMode="0" itemRotation="0" blendMode="0" mapUuid="{a228885d-4d7a-4ae0-af9b-02a4fe7cd814}" opacity="1" pictureRotation="0" type="65640" groupUuid="" positionLock="false" frameJoinStyle="miter" background="true" svgFillColor="255,255,255,255" visibility="1" resizeMode="0" position="216.926,191.227,mm" file="arrows/NorthArrow_10.svg" frame="false" anchorPoint="4" uuid="{3d36198c-b71f-4be4-9dc0-e540e737e3ce}" excludeFromExports="0" svgBorderColor="0,0,0,255" pictureHeight="16.2837" northOffset="0" zValue="6">
            <FrameColor red="0" alpha="255" green="0" blue="0"/>
            <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option type="Map" name="properties">
                    <Option type="Map" name="dataDefinedSource">
                      <Option value="false" type="bool" name="active"/>
                      <Option value="" type="QString" name="expression"/>
                      <Option value="3" type="int" name="type"/>
                    </Option>
                  </Option>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
          </LayoutItem>
          <LayoutItem templateUuid="{370ffed0-dfde-40b2-9f68-c2bf847b6435}" positionOnPage="8.10892,165,mm" labelText="Description" id="description" valign="32" marginY="0" halign="1" size="160.345,39.1449,mm" referencePoint="0" outlineWidthM="0.3,mm" itemRotation="0" blendMode="0" opacity="1" type="65641" groupUuid="" positionLock="false" frameJoinStyle="miter" background="true" visibility="1" position="8.10892,165,mm" marginX="0" frame="false" uuid="{370ffed0-dfde-40b2-9f68-c2bf847b6435}" excludeFromExports="0" zValue="5" htmlState="0">
            <FrameColor red="0" alpha="255" green="0" blue="0"/>
            <BackgroundColor red="255" alpha="150" green="255" blue="255"/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
            <LabelFont description="Cantarell,10,-1,5,50,0,0,0,0,0" style=""/>
            <FontColor red="0" alpha="255" green="0" blue="0"/>
          </LayoutItem>
          <LayoutItem templateUuid="{a50537f9-5e73-4610-955e-31b092d81b94}" positionOnPage="237.35,162.072,mm" mapRotation="0" id="" size="60.5889,45,mm" referencePoint="0" outlineWidthM="0.3,mm" itemRotation="0" mapFlags="0" blendMode="0" opacity="1" type="65639" groupUuid="" positionLock="false" drawCanvasItems="true" labelMargin="0,mm" frameJoinStyle="miter" background="true" visibility="1" position="237.35,162.072,mm" keepLayerSet="true" frame="false" uuid="{a50537f9-5e73-4610-955e-31b092d81b94}" excludeFromExports="0" followPresetName="" followPreset="false" zValue="3">
            <FrameColor red="0" alpha="255" green="0" blue="0"/>
            <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
            <Extent xmax="448907.96636085514910519" ymax="5417374.24027335178107023" ymin="5392381.09543511364609003" xmin="415256.69628775410819799"/>
            <LayerSet>
              <Layer provider="ogr" source="/home/nboisteault/3liz/infra/lizmap-qgis-3.10/extra-modules/lizmapdemo/qgis-projects/demoqgis/data/vector/VilleMTP_MTP_Quartiers_2011_4326.shp" name="VilleMTP_MTP_Quartiers_2011_4326">VilleMTP_MTP_Quartiers_2011_432620130116112351546</Layer>
            </LayerSet>
            <ComposerMapGrid showAnnotation="0" rightAnnotationDirection="0" gridFrameMargin="0" bottomAnnotationDisplay="0" bottomFrameDivisions="0" topAnnotationDirection="0" annotationExpression="" rightAnnotationDisplay="0" gridFrameWidth="2" topAnnotationDisplay="0" rightAnnotationPosition="1" annotationPrecision="3" bottomAnnotationDirection="0" gridFramePenColor="0,0,0,255" show="0" gridStyle="0" annotationFormat="0" name="Grille 1" unit="0" crossLength="3" gridFrameSideFlags="15" topFrameDivisions="0" uuid="{79ab9045-ef71-4cf1-83f1-f90bfe64ad9f}" intervalX="0" gridFrameStyle="0" offsetY="0" rightFrameDivisions="0" leftAnnotationPosition="1" leftFrameDivisions="0" intervalY="0" offsetX="0" annotationFontColor="0,0,0,255" leftAnnotationDisplay="0" bottomAnnotationPosition="1" frameFillColor1="255,255,255,255" frameAnnotationDistance="1" topAnnotationPosition="1" leftAnnotationDirection="0" blendMode="0" maximumIntervalWidth="100" position="3" gridFramePenThickness="0.5" frameFillColor2="0,0,0,255" minimumIntervalWidth="50">
              <lineStyle>
                <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="line" name="">
                  <layer locked="0" enabled="1" class="SimpleLine" pass="0">
                    <prop v="flat" k="capstyle"/>
                    <prop v="5;2" k="customdash"/>
                    <prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/>
                    <prop v="MM" k="customdash_unit"/>
                    <prop v="0" k="draw_inside_polygon"/>
                    <prop v="bevel" k="joinstyle"/>
                    <prop v="0,0,0,255" k="line_color"/>
                    <prop v="solid" k="line_style"/>
                    <prop v="0.3" k="line_width"/>
                    <prop v="MM" k="line_width_unit"/>
                    <prop v="0" k="offset"/>
                    <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
                    <prop v="MM" k="offset_unit"/>
                    <prop v="0" k="ring_filter"/>
                    <prop v="0" k="use_custom_dash"/>
                    <prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/>
                    <data_defined_properties>
                      <Option type="Map">
                        <Option value="" type="QString" name="name"/>
                        <Option name="properties"/>
                        <Option value="collection" type="QString" name="type"/>
                      </Option>
                    </data_defined_properties>
                  </layer>
                </symbol>
              </lineStyle>
              <markerStyle>
                <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="marker" name="">
                  <layer locked="0" enabled="1" class="SimpleMarker" pass="0">
                    <prop v="0" k="angle"/>
                    <prop v="0,0,0,255" k="color"/>
                    <prop v="1" k="horizontal_anchor_point"/>
                    <prop v="bevel" k="joinstyle"/>
                    <prop v="circle" k="name"/>
                    <prop v="0,0" k="offset"/>
                    <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
                    <prop v="MM" k="offset_unit"/>
                    <prop v="0,0,0,255" k="outline_color"/>
                    <prop v="solid" k="outline_style"/>
                    <prop v="0" k="outline_width"/>
                    <prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/>
                    <prop v="MM" k="outline_width_unit"/>
                    <prop v="area" k="scale_method"/>
                    <prop v="2" k="size"/>
                    <prop v="3x:0,0,0,0,0,0" k="size_map_unit_scale"/>
                    <prop v="MM" k="size_unit"/>
                    <prop v="1" k="vertical_anchor_point"/>
                    <data_defined_properties>
                      <Option type="Map">
                        <Option value="" type="QString" name="name"/>
                        <Option name="properties"/>
                        <Option value="collection" type="QString" name="type"/>
                      </Option>
                    </data_defined_properties>
                  </layer>
                </symbol>
              </markerStyle>
              <annotationFontProperties description="Cantarell,11,-1,5,50,0,0,0,0,0" style=""/>
              <LayoutObject>
                <dataDefinedProperties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </dataDefinedProperties>
                <customproperties/>
              </LayoutObject>
            </ComposerMapGrid>
            <ComposerMapOverview uuid="{cccfa4de-c508-4cc3-a6fb-7d18d2491b66}" blendMode="0" position="3" frameMap="{a228885d-4d7a-4ae0-af9b-02a4fe7cd814}" show="1" inverted="0" centered="0" name="Overview 1">
              <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="fill" name="">
                <layer locked="0" enabled="1" class="SimpleLine" pass="0">
                  <prop v="square" k="capstyle"/>
                  <prop v="5;2" k="customdash"/>
                  <prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/>
                  <prop v="MM" k="customdash_unit"/>
                  <prop v="0" k="draw_inside_polygon"/>
                  <prop v="bevel" k="joinstyle"/>
                  <prop v="227,26,28,255" k="line_color"/>
                  <prop v="solid" k="line_style"/>
                  <prop v="0.78" k="line_width"/>
                  <prop v="MM" k="line_width_unit"/>
                  <prop v="0" k="offset"/>
                  <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
                  <prop v="MM" k="offset_unit"/>
                  <prop v="0" k="ring_filter"/>
                  <prop v="0" k="use_custom_dash"/>
                  <prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/>
                  <data_defined_properties>
                    <Option type="Map">
                      <Option value="" type="QString" name="name"/>
                      <Option name="properties"/>
                      <Option value="collection" type="QString" name="type"/>
                    </Option>
                  </data_defined_properties>
                </layer>
              </symbol>
              <LayoutObject>
                <dataDefinedProperties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </dataDefinedProperties>
                <customproperties/>
              </LayoutObject>
            </ComposerMapOverview>
            <AtlasMap scalingMode="2" atlasDriven="0" margin="0.10000000000000001"/>
            <labelBlockingItems/>
          </LayoutItem>
          <LayoutItem legendFilterByAtlas="0" positionLock="false" referencePoint="0" boxSpace="2" symbolWidth="6" outlineWidthM="0.3,mm" groupUuid="" title="Légende" wmsLegendWidth="50" templateUuid="{c63c2fc5-19e6-4fbf-a0b9-be5900bd4a45}" frameJoinStyle="miter" symbolAlignment="1" rasterBorderColor="0,0,0,255" itemRotation="0" uuid="{c63c2fc5-19e6-4fbf-a0b9-be5900bd4a45}" titleAlignment="1" rasterBorderWidth="0" type="65642" size="45.7234,139.4,mm" zValue="2" map_uuid="{a228885d-4d7a-4ae0-af9b-02a4fe7cd814}" positionOnPage="237.35,0,mm" lineSpacing="1" rasterBorder="1" resizeToContents="1" wrapChar="" columnSpace="2" opacity="1" splitLayer="1" background="true" wmsLegendHeight="25" columnCount="1" id="" excludeFromExports="0" fontColor="#000000" equalColumnWidth="1" blendMode="0" position="237.35,0,mm" symbolHeight="3" frame="false" visibility="1">
            <FrameColor red="0" alpha="255" green="0" blue="0"/>
            <BackgroundColor red="255" alpha="150" green="255" blue="255"/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
            <styles>
              <style marginBottom="2" alignment="1" name="title">
                <styleFont description="Ubuntu,14,-1,5,50,0,0,0,0,0" style=""/>
              </style>
              <style alignment="1" marginTop="2" name="group">
                <styleFont description="Ubuntu,12,-1,5,50,0,0,0,0,0" style=""/>
              </style>
              <style alignment="1" marginTop="2" name="subgroup">
                <styleFont description="Ubuntu,11,-1,5,50,0,0,0,0,0" style=""/>
              </style>
              <style alignment="1" marginTop="2" name="symbol">
                <styleFont description="Cantarell,11,-1,5,50,0,0,0,0,0" style=""/>
              </style>
              <style marginLeft="2" alignment="1" marginTop="2" name="symbolLabel">
                <styleFont description="Ubuntu,9,-1,5,50,0,0,0,0,0" style=""/>
              </style>
            </styles>
            <layer-tree-group>
              <customproperties/>
              <layer-tree-layer providerKey="spatialite" legend_exp="" source="dbname=\'/home/nboisteault/3liz/infra/lizmap-qgis-3.10/extra-modules/lizmapdemo/qgis-projects/demoqgis/edition/edition_db.sqlite\' table=&quot;edition_point&quot; (geometry) sql=" id="edition_point20130118171631518" expanded="1" checked="Qt::Checked" name="points of interest">
                <customproperties>
                  <property value="Points of interest" key="legend/title-label"/>
                  <property value="subgroup" key="legend/title-style"/>
                </customproperties>
              </layer-tree-layer>
              <layer-tree-layer providerKey="spatialite" legend_exp="" source="dbname=\'/home/nboisteault/3liz/infra/lizmap-qgis-3.10/extra-modules/lizmapdemo/qgis-projects/demoqgis/edition/edition_db.sqlite\' table=&quot;edition_line&quot; (geom) sql=" id="edition_line20130409161630329" expanded="1" checked="Qt::Checked" name="edition_line">
                <customproperties>
                  <property value="Bicycle rides" key="legend/title-label"/>
                  <property value="subgroup" key="legend/title-style"/>
                </customproperties>
              </layer-tree-layer>
              <layer-tree-layer providerKey="spatialite" legend_exp="" source="dbname=\'/home/nboisteault/3liz/infra/lizmap-qgis-3.10/extra-modules/lizmapdemo/qgis-projects/demoqgis/edition/edition_db.sqlite\' table=&quot;edition_polygon&quot; (geom) sql=" id="edition_polygon20130409114333776" expanded="1" checked="Qt::Checked" name="areas_of_interest">
                <customproperties>
                  <property value="subgroup" key="legend/title-style"/>
                </customproperties>
              </layer-tree-layer>
              <layer-tree-layer providerKey="ogr" legend_exp="" source="./data/vector/bus_stops.shp" id="bus_stops20121106170806413" expanded="1" checked="Qt::Checked" name="bus_stops">
                <customproperties>
                  <property value="hidden" key="legend/title-style"/>
                </customproperties>
              </layer-tree-layer>
              <layer-tree-layer providerKey="ogr" legend_exp="" source="./data/vector/VilleMTP_MTP_Quartiers_2011_4326.shp" id="VilleMTP_MTP_Quartiers_2011_432620130116112610876" expanded="1" checked="Qt::Checked" name="Quartiers">
                <customproperties>
                  <property value="subgroup" key="legend/title-style"/>
                </customproperties>
              </layer-tree-layer>
              <layer-tree-layer legend_exp="" id="VilleMTP_MTP_SousQuartiers_201120130929113137811" expanded="1" checked="Qt::Checked" name="SousQuartiers">
                <customproperties>
                  <property value="Sous-Quartiers" key="legend/title-label"/>
                  <property value="hidden" key="legend/title-style"/>
                </customproperties>
              </layer-tree-layer>
              <custom-order enabled="0"/>
            </layer-tree-group>
          </LayoutItem>
          <LayoutItem templateUuid="{a228885d-4d7a-4ae0-af9b-02a4fe7cd814}" positionOnPage="0,18,mm" mapRotation="0" id="" size="237.2,191.85,mm" referencePoint="0" outlineWidthM="0.3,mm" itemRotation="0" mapFlags="0" blendMode="0" opacity="1" type="65639" groupUuid="" positionLock="false" drawCanvasItems="true" labelMargin="0,mm" frameJoinStyle="miter" background="true" visibility="1" position="0,18,mm" keepLayerSet="false" frame="true" uuid="{a228885d-4d7a-4ae0-af9b-02a4fe7cd814}" excludeFromExports="0" followPresetName="" followPreset="false" zValue="1">
            <FrameColor red="0" alpha="255" green="0" blue="0"/>
            <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
            <Extent xmax="435811.24219820165308192" ymax="5414235.69606313016265631" ymin="5404643.1960533456876874" xmin="423951.2421861044713296"/>
            <LayerSet/>
            <ComposerMapGrid showAnnotation="0" rightAnnotationDirection="0" gridFrameMargin="0" bottomAnnotationDisplay="0" bottomFrameDivisions="0" topAnnotationDirection="0" annotationExpression="" rightAnnotationDisplay="0" gridFrameWidth="2" topAnnotationDisplay="0" rightAnnotationPosition="1" annotationPrecision="3" bottomAnnotationDirection="0" gridFramePenColor="0,0,0,255" show="0" gridStyle="0" annotationFormat="0" name="Grille 1" unit="0" crossLength="3" gridFrameSideFlags="15" topFrameDivisions="0" uuid="{6e0cb54d-dd79-43cd-8dd0-c8c92632e8e3}" intervalX="0" gridFrameStyle="0" offsetY="0" rightFrameDivisions="0" leftAnnotationPosition="1" leftFrameDivisions="0" intervalY="0" offsetX="0" annotationFontColor="0,0,0,255" leftAnnotationDisplay="0" bottomAnnotationPosition="1" frameFillColor1="255,255,255,255" frameAnnotationDistance="1" topAnnotationPosition="1" leftAnnotationDirection="0" blendMode="0" maximumIntervalWidth="100" position="3" gridFramePenThickness="0.5" frameFillColor2="0,0,0,255" minimumIntervalWidth="50">
              <lineStyle>
                <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="line" name="">
                  <layer locked="0" enabled="1" class="SimpleLine" pass="0">
                    <prop v="flat" k="capstyle"/>
                    <prop v="5;2" k="customdash"/>
                    <prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/>
                    <prop v="MM" k="customdash_unit"/>
                    <prop v="0" k="draw_inside_polygon"/>
                    <prop v="bevel" k="joinstyle"/>
                    <prop v="0,0,0,255" k="line_color"/>
                    <prop v="solid" k="line_style"/>
                    <prop v="0.3" k="line_width"/>
                    <prop v="MM" k="line_width_unit"/>
                    <prop v="0" k="offset"/>
                    <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
                    <prop v="MM" k="offset_unit"/>
                    <prop v="0" k="ring_filter"/>
                    <prop v="0" k="use_custom_dash"/>
                    <prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/>
                    <data_defined_properties>
                      <Option type="Map">
                        <Option value="" type="QString" name="name"/>
                        <Option name="properties"/>
                        <Option value="collection" type="QString" name="type"/>
                      </Option>
                    </data_defined_properties>
                  </layer>
                </symbol>
              </lineStyle>
              <markerStyle>
                <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="marker" name="">
                  <layer locked="0" enabled="1" class="SimpleMarker" pass="0">
                    <prop v="0" k="angle"/>
                    <prop v="0,0,0,255" k="color"/>
                    <prop v="1" k="horizontal_anchor_point"/>
                    <prop v="bevel" k="joinstyle"/>
                    <prop v="circle" k="name"/>
                    <prop v="0,0" k="offset"/>
                    <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
                    <prop v="MM" k="offset_unit"/>
                    <prop v="0,0,0,255" k="outline_color"/>
                    <prop v="solid" k="outline_style"/>
                    <prop v="0" k="outline_width"/>
                    <prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/>
                    <prop v="MM" k="outline_width_unit"/>
                    <prop v="area" k="scale_method"/>
                    <prop v="2" k="size"/>
                    <prop v="3x:0,0,0,0,0,0" k="size_map_unit_scale"/>
                    <prop v="MM" k="size_unit"/>
                    <prop v="1" k="vertical_anchor_point"/>
                    <data_defined_properties>
                      <Option type="Map">
                        <Option value="" type="QString" name="name"/>
                        <Option name="properties"/>
                        <Option value="collection" type="QString" name="type"/>
                      </Option>
                    </data_defined_properties>
                  </layer>
                </symbol>
              </markerStyle>
              <annotationFontProperties description="Cantarell,11,-1,5,50,0,0,0,0,0" style=""/>
              <LayoutObject>
                <dataDefinedProperties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </dataDefinedProperties>
                <customproperties/>
              </LayoutObject>
            </ComposerMapGrid>
            <AtlasMap scalingMode="1" atlasDriven="1" margin="0.10000000000000001"/>
            <labelBlockingItems/>
          </LayoutItem>
          <LayoutMultiFrame showOnlyVisibleFeatures="0" maxFeatures="30" templateUuid="{0a4df0de-7063-482e-9052-814773b52c9c}" horizontalGrid="1" headerHAlignment="0" backgroundColor="255,255,255,255" headerFontColor="0,0,0,255" filterToAtlasIntersection="0" wrapString="" type="65649" wrapBehavior="0" cellMargin="1" gridColor="0,0,0,255" source="0" resizeMode="0" vectorLayerProvider="ogr" gridStrokeWidth="0.5" showGrid="1" showEmptyRows="0" showUniqueRowsOnly="0" verticalGrid="1" uuid="{0a4df0de-7063-482e-9052-814773b52c9c}" relationId="" filterFeatures="true" featureFilter="&quot;QUARTMNO&quot; = attribute( @atlas_feature ,  \'QUARTMNO\')" headerMode="0" vectorLayerSource="/home/nboisteault/3liz/infra/lizmap-qgis-3.10/extra-modules/lizmapdemo/qgis-projects/demoqgis/data/vector/VilleMTP_MTP_SousQuartiers_2011.shp" emptyTableMessage="" vectorLayerName="SousQuartiers" emptyTableMode="0" contentFontColor="0,0,0,255" vectorLayer="SousQuartiers20160121124316563">
            <childFrame uuid="{01c30beb-689e-4062-8d01-f18b54f75b86}" templateUuid="{01c30beb-689e-4062-8d01-f18b54f75b86}"/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
            <headerFontProperties description="Ubuntu,11,-1,5,50,0,0,0,0,0" style=""/>
            <contentFontProperties description="Ubuntu,11,-1,5,50,0,0,0,0,0" style=""/>
            <displayColumns>
              <column width="0" sortOrder="0" hAlignment="1" vAlignment="128" sortByRank="0" attribute="LIBSQUART" heading="Name">
                <backgroundColor red="0" alpha="0" green="0" blue="0"/>
              </column>
              <column width="0" sortOrder="0" hAlignment="1" vAlignment="128" sortByRank="0" attribute="socio_population_2009" heading="Population (2009)">
                <backgroundColor red="0" alpha="0" green="0" blue="0"/>
              </column>
              <column width="0" sortOrder="0" hAlignment="1" vAlignment="128" sortByRank="0" attribute="socio_population_percentage" heading="% population Montpellier">
                <backgroundColor red="0" alpha="0" green="0" blue="0"/>
              </column>
              <column width="0" sortOrder="0" hAlignment="1" vAlignment="128" sortByRank="0" attribute="socio_average_income" heading="Average income (€)">
                <backgroundColor red="0" alpha="0" green="0" blue="0"/>
              </column>
              <column width="0" sortOrder="0" hAlignment="1" vAlignment="128" sortByRank="0" attribute="socio_prop_percentage" heading="Owners (%)">
                <backgroundColor red="0" alpha="0" green="0" blue="0"/>
              </column>
              <column width="0" sortOrder="0" hAlignment="1" vAlignment="128" sortByRank="0" attribute="socio_loc_percentage" heading="Tenants (%)">
                <backgroundColor red="0" alpha="0" green="0" blue="0"/>
              </column>
              <column width="0" sortOrder="0" hAlignment="1" vAlignment="128" sortByRank="0" attribute="popdensity" heading="Density ( inhabitants / km2 )">
                <backgroundColor red="0" alpha="0" green="0" blue="0"/>
              </column>
              <column width="0" sortOrder="0" hAlignment="1" vAlignment="128" sortByRank="0" attribute="area" heading="Area ( km2)">
                <backgroundColor red="0" alpha="0" green="0" blue="0"/>
              </column>
            </displayColumns>
            <cellStyles>
              <oddColumns cellBackgroundColor="255,255,255,255" enabled="0"/>
              <evenColumns cellBackgroundColor="255,255,255,255" enabled="0"/>
              <oddRows cellBackgroundColor="255,255,255,255" enabled="0"/>
              <evenRows cellBackgroundColor="255,255,255,255" enabled="0"/>
              <firstColumn cellBackgroundColor="255,255,255,255" enabled="0"/>
              <lastColumn cellBackgroundColor="255,255,255,255" enabled="0"/>
              <headerRow cellBackgroundColor="255,255,255,255" enabled="0"/>
              <firstRow cellBackgroundColor="255,255,255,255" enabled="0"/>
              <lastRow cellBackgroundColor="255,255,255,255" enabled="0"/>
            </cellStyles>
          </LayoutMultiFrame>
          <LayoutMultiFrame showOnlyVisibleFeatures="0" maxFeatures="30" templateUuid="{541e35d6-31ec-4e26-903d-4bdd9533a581}" horizontalGrid="1" headerHAlignment="0" backgroundColor="255,255,255,255" headerFontColor="0,0,0,255" filterToAtlasIntersection="1" wrapString="" type="65649" wrapBehavior="0" cellMargin="1" gridColor="0,0,0,255" source="0" resizeMode="0" vectorLayerProvider="spatialite" gridStrokeWidth="0.5" showGrid="1" showEmptyRows="0" showUniqueRowsOnly="0" verticalGrid="1" uuid="{541e35d6-31ec-4e26-903d-4bdd9533a581}" relationId="" filterFeatures="false" featureFilter="" headerMode="1" vectorLayerSource="dbname=\'/home/nboisteault/3liz/infra/lizmap-qgis-3.10/extra-modules/lizmapdemo/qgis-projects/demoqgis/edition/transport.sqlite\' table=&quot;tramstop&quot; (geometry) sql=" emptyTableMessage="" vectorLayerName="tramstop" emptyTableMode="1" contentFontColor="0,0,0,255" vectorLayer="tramstop20150328114203878">
            <childFrame uuid="{13115e2d-3dda-4c17-b2f6-ae6e09766183}" templateUuid="{13115e2d-3dda-4c17-b2f6-ae6e09766183}"/>
            <childFrame uuid="{0ca22a63-0559-4361-be91-4b2cd4443a9e}" templateUuid="{0ca22a63-0559-4361-be91-4b2cd4443a9e}"/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
            <headerFontProperties description="Ubuntu,11,-1,5,50,0,0,0,0,0" style=""/>
            <contentFontProperties description="Ubuntu,11,-1,5,50,0,0,0,0,0" style=""/>
            <displayColumns>
              <column width="0" sortOrder="0" hAlignment="1" vAlignment="128" sortByRank="0" attribute="OGC_FID" heading="Id">
                <backgroundColor red="0" alpha="0" green="0" blue="0"/>
              </column>
              <column width="0" sortOrder="0" hAlignment="1" vAlignment="128" sortByRank="0" attribute="osm_id" heading="Id OSM">
                <backgroundColor red="0" alpha="0" green="0" blue="0"/>
              </column>
              <column width="0" sortOrder="0" hAlignment="1" vAlignment="128" sortByRank="0" attribute="name" heading="Stop name">
                <backgroundColor red="0" alpha="0" green="0" blue="0"/>
              </column>
              <column width="0" sortOrder="0" hAlignment="1" vAlignment="128" sortByRank="0" attribute="wkt" heading="wkt">
                <backgroundColor red="0" alpha="0" green="0" blue="0"/>
              </column>
              <column width="0" sortOrder="0" hAlignment="1" vAlignment="128" sortByRank="0" attribute="unique_name" heading="Unique name">
                <backgroundColor red="0" alpha="0" green="0" blue="0"/>
              </column>
            </displayColumns>
            <cellStyles>
              <oddColumns cellBackgroundColor="255,255,255,255" enabled="0"/>
              <evenColumns cellBackgroundColor="255,255,255,255" enabled="0"/>
              <oddRows cellBackgroundColor="255,255,255,255" enabled="0"/>
              <evenRows cellBackgroundColor="255,255,255,255" enabled="0"/>
              <firstColumn cellBackgroundColor="255,255,255,255" enabled="0"/>
              <lastColumn cellBackgroundColor="255,255,255,255" enabled="0"/>
              <headerRow cellBackgroundColor="255,255,255,255" enabled="0"/>
              <firstRow cellBackgroundColor="255,255,255,255" enabled="0"/>
              <lastRow cellBackgroundColor="255,255,255,255" enabled="0"/>
            </cellStyles>
          </LayoutMultiFrame>
          <customproperties>
            <property value="png" key="atlasRasterFormat"/>
          </customproperties>
          <Atlas hideCoverage="0" coverageLayerProvider="ogr" filenamePattern="\'output_\'||@atlas_featurenumber" coverageLayerSource="/home/nboisteault/3liz/infra/lizmap-qgis-3.10/extra-modules/lizmapdemo/qgis-projects/demoqgis/data/vector/VilleMTP_MTP_Quartiers_2011_4326.shp" enabled="1" filterFeatures="0" pageNameExpression="" sortFeatures="0" coverageLayerName="Quartiers" coverageLayer="VilleMTP_MTP_Quartiers_2011_432620130116112610876"/>
        </Layout>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisLayout($oXml);
        $this->assertTrue(is_array($data));
        $this->assertEquals('District card', $data['name']);

        $this->assertTrue(array_key_exists('pages', $data));
        $this->assertCount(3, $data['pages']);

        $expectedPage = array(
            'type' => '65638',
            'typeName' => 'page',
            'width' => 297,
            'height' => 210,
            'x' => 0,
            'y' => 0,
        );
        $this->assertEquals($expectedPage, $data['pages'][0]);

        $expectedPage = array(
            'type' => '65638',
            'typeName' => 'page',
            'width' => 297,
            'height' => 210,
            'x' => 0,
            'y' => 220,
        );
        $this->assertEquals($expectedPage, $data['pages'][1]);

        $expectedPage = array(
            'type' => '65638',
            'typeName' => 'page',
            'width' => 297,
            'height' => 210,
            'x' => 0,
            'y' => 440,
        );
        $this->assertEquals($expectedPage, $data['pages'][2]);

        $this->assertTrue(array_key_exists('labels', $data));
        $this->assertCount(1, $data['labels']);
        $expectedLabel = array(
            'type' => '65641',
            'typeName' => 'label',
            'id' => 'description',
            'htmlState' => false,
            'text' => 'Description',
        );
        $this->assertEquals($expectedLabel, $data['labels'][0]);

        $this->assertTrue(array_key_exists('maps', $data));
        $this->assertCount(2, $data['maps']);

        $expectedMap = array(
            'type' => '65639',
            'typeName' => 'map',
            'uuid' => '{a50537f9-5e73-4610-955e-31b092d81b94}',
            'width' => 60,
            'height' => 45,
            'grid' => false,
            'overviewMap' => '{a228885d-4d7a-4ae0-af9b-02a4fe7cd814}',
            'id' => 'map0',
        );
        $this->assertEquals($expectedMap, $data['maps'][0]);

        $expectedMap = array(
            'type' => '65639',
            'typeName' => 'map',
            'uuid' => '{a228885d-4d7a-4ae0-af9b-02a4fe7cd814}',
            'width' => 237,
            'height' => 191,
            'grid' => false,
            'id' => 'map1',
        );
        $this->assertEquals($expectedMap, $data['maps'][1]);
        $this->assertEquals($data['maps'][1]['uuid'], $data['maps'][0]['overviewMap']);

        $this->assertTrue(array_key_exists('atlas', $data));
        $expectedAtlas = array(
            'enabled' => true,
            'coverageLayer' => 'VilleMTP_MTP_Quartiers_2011_432620130116112610876',
        );
        $this->assertEquals($expectedAtlas, $data['atlas']);
    }

    public function testReadQgisDocument()
    {
        $xmlStr = '
        <qgis version="3.10.5-A Coruña" projectname="Montpellier - Transports">
          <title>Montpellier - Transports</title>
          <projectCrs>
            <spatialrefsys>
              <wkt>PROJCS["unnamed",GEOGCS["unnamed ellipse",DATUM["unknown",SPHEROID["unnamed",6378137,0],EXTENSION["PROJ4_GRIDS","@null"]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Mercator_2SP"],PARAMETER["standard_parallel_1",0],PARAMETER["central_meridian",0],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["Meter",1],EXTENSION["PROJ4","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"]]</wkt>
              <proj4>+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs</proj4>
              <srsid>100000</srsid>
              <srid>0</srid>
              <authid>USER:100000</authid>
              <description> * SCR généré (+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs)</description>
              <projectionacronym>merc</projectionacronym>
              <ellipsoidacronym></ellipsoidacronym>
              <geographicflag>false</geographicflag>
            </spatialrefsys>
          </projectCrs>
          <layer-tree-group>
            <custom-order enabled="0">
              <item>edition_point20130118171631518</item>
              <item>edition_line20130409161630329</item>
              <item>edition_polygon20130409114333776</item>
              <item>bus_stops20121106170806413</item>
              <item>bus20121102133611751</item>
              <item>VilleMTP_MTP_Quartiers_2011_432620130116112610876</item>
              <item>VilleMTP_MTP_Quartiers_2011_432620130116112351546</item>
              <item>tramstop20150328114203878</item>
              <item>tramway20150328114206278</item>
              <item>publicbuildings20150420100958543</item>
              <item>SousQuartiers20160121124316563</item>
              <item>osm_stamen_toner20180315181710198</item>
              <item>osm_mapnik20180315181738526</item>
            </custom-order>
          </layer-tree-group>
          <properties>
            <Gui>
              <CanvasColorBluePart type="int">255</CanvasColorBluePart>
              <CanvasColorGreenPart type="int">255</CanvasColorGreenPart>
              <CanvasColorRedPart type="int">255</CanvasColorRedPart>
              <SelectionColorAlphaPart type="int">255</SelectionColorAlphaPart>
              <SelectionColorBluePart type="int">0</SelectionColorBluePart>
              <SelectionColorGreenPart type="int">255</SelectionColorGreenPart>
              <SelectionColorRedPart type="int">255</SelectionColorRedPart>
            </Gui>
            <SpatialRefSys>
              <ProjectCRSID type="int">3857</ProjectCRSID>
              <ProjectCRSProj4String type="QString">+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs</ProjectCRSProj4String>
              <ProjectCrs type="QString">EPSG:3857</ProjectCrs>
              <ProjectionsEnabled type="int">1</ProjectionsEnabled>
            </SpatialRefSys>
            <Variables>
              <variableNames type="QStringList"/>
              <variableValues type="QStringList"/>
            </Variables>
            <WMSAccessConstraints type="QString">None</WMSAccessConstraints>
            <WMSAddWktGeometry type="bool">true</WMSAddWktGeometry>
            <WMSContactMail type="QString">info@3liz.com</WMSContactMail>
            <WMSContactOrganization type="QString">3liz</WMSContactOrganization>
            <WMSContactPerson type="QString">3liz</WMSContactPerson>
            <WMSContactPhone type="QString">+334 67 16 64 51</WMSContactPhone>
            <WMSContactPosition type="QString"></WMSContactPosition>
            <WMSExtent type="QStringList">
              <value>417006.61373760335845873</value>
              <value>5394910.34090302512049675</value>
              <value>447158.04891100589884445</value>
              <value>5414844.99480544030666351</value>
            </WMSExtent>
            <WMSFees type="QString">conditions unknown</WMSFees>
            <WMSImageQuality type="int">90</WMSImageQuality>
            <WMSKeywordList type="QStringList">
              <value></value>
            </WMSKeywordList>
            <WMSOnlineResource type="QString">http://www.3liz.com/lizmap.html</WMSOnlineResource>
            <WMSPrecision type="QString">8</WMSPrecision>
            <WMSRestrictedComposers type="QStringList">
              <value>Composeur1</value>
            </WMSRestrictedComposers>
            <WMSRestrictedLayers type="QStringList"/>
            <WMSServiceAbstract type="QString">Demo project with bus and tramway lines in Montpellier, France.
Data is licensed under ODbl, OpenStreetMap contributors</WMSServiceAbstract>
            <WMSServiceCapabilities type="bool">true</WMSServiceCapabilities>
            <WMSServiceTitle type="QString">Montpellier - Transports</WMSServiceTitle>
            <WMSUrl type="QString"></WMSUrl>
            <WMSUseLayerIDs type="bool">false</WMSUseLayerIDs>
          </properties>
        </qgis>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $data = Project\QgisProjectParser::readQgisDocument($oXml);
        $this->assertTrue(is_array($data));
        $this->assertTrue(array_key_exists('version', $data));
        $this->assertEquals('3.10.5-A Coruña', $data['version']);
        $this->assertTrue(array_key_exists('projectname', $data));
        $this->assertEquals('Montpellier - Transports', $data['projectname']);
        $this->assertTrue(array_key_exists('title', $data));
        $this->assertEquals('Montpellier - Transports', $data['title']);
        $this->assertTrue(array_key_exists('projectCrs', $data));
        $expectedProjectCrs = array(
            'proj4' => '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
            'srid' => 0,
            'authid' => 'USER:100000',
            'description' => ' * SCR généré (+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs)',
        );
        $this->assertEquals($expectedProjectCrs, $data['projectCrs']);
        $this->assertTrue(array_key_exists('properties', $data));
        $expectedProperties = array(
            'WMSServiceTitle' => 'Montpellier - Transports',
            'WMSServiceAbstract' => 'Demo project with bus and tramway lines in Montpellier, France.
Data is licensed under ODbl, OpenStreetMap contributors',
            'WMSKeywordList' => array(''),
            'WMSExtent' => array('417006.61373760335845873', '5394910.34090302512049675', '447158.04891100589884445', '5414844.99480544030666351'),
            // 'ProjectCrs' => 'EPSG:3857',
            'WMSOnlineResource' => 'http://www.3liz.com/lizmap.html',
            'WMSContactMail' => 'info@3liz.com',
            'WMSContactOrganization' => '3liz',
            'WMSContactPerson' => '3liz',
            'WMSContactPhone' => '+334 67 16 64 51',
            'WMSRestrictedComposers' => array('Composeur1'),
            'WMSUseLayerIDs' => false,
        );
        $this->assertEquals($expectedProperties, $data['properties']);
    }


}
