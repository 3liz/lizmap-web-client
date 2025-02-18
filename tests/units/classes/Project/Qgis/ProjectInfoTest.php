<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class ProjectInfoTest extends TestCase
{
    public function testFromXmlReader(): void
    {
        $xml_path = __DIR__.'/../../Project/Ressources/montpellier.qgs';
        // Open the document with XML Reader at the root element document
        $oXml = App\XmlTools::xmlReaderFromFile($xml_path);
        $project = Qgis\ProjectInfo::fromXmlReader($oXml);

        $data = array(
          'version' => '3.10.5-A Coruña',
          'projectname' => 'Montpellier - Transports',
          'saveDateTime' => '',
          'title' => 'Montpellier - Transports',
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $project->$prop, $prop);
        }

        $this->assertNotNull($project->properties);
        $data = array(
          'WMSServiceTitle' => 'Montpellier - Transports',
          'WMSServiceAbstract' => 'Demo project with bus and tramway lines in Montpellier, France.
Data is licensed under ODbl, OpenStreetMap contributors',
          'WMSKeywordList' => array(''),
          'WMSExtent' => array('417006.61373760335845873', '5394910.34090302512049675', '447158.04891100589884445', '5414844.99480544030666351'),
          'WMSOnlineResource' => 'http://www.3liz.com/lizmap.html',
          'WMSContactMail' => 'info@3liz.com',
          'WMSContactOrganization' => '3liz',
          'WMSContactPerson' => '3liz',
          'WMSContactPhone' => '+334 67 16 64 51',
          'WMSRestrictedComposers' => array('Composeur1'),
          'WMSRestrictedLayers' => array(),
          'WMSUseLayerIDs' => false,
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $project->properties->$prop, $prop);
        }

        $this->assertNotNull($project->projectCrs);
        $data = array(
          'proj4' => '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
          'srid' => 0,
          'authid' => 'USER:100000',
          'description' => ' * SCR généré (+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs)',
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $project->projectCrs->$prop, $prop);
        }

        $this->assertNotNull($project->layerTreeRoot);
        $this->assertInstanceOf(Qgis\LayerTreeRoot::class, $project->layerTreeRoot);
        $this->assertNotNull($project->layerTreeRoot->customOrder);
        $this->assertInstanceOf(Qgis\LayerTreeCustomOrder::class, $project->layerTreeRoot->customOrder);
        $this->assertFalse($project->layerTreeRoot->customOrder->enabled);

        $this->assertNotNull($project->visibilityPresets);
        $this->assertTrue(is_array($project->visibilityPresets));
        $this->assertCount(3, $project->visibilityPresets);
        $this->assertInstanceOf(Qgis\ProjectVisibilityPreset::class, $project->visibilityPresets[0]);
        $this->assertCount(4, $project->visibilityPresets[0]->layers);
        $this->assertInstanceOf(Qgis\ProjectVisibilityPresetLayer::class, $project->visibilityPresets[0]->layers[0]);
        $data = array(
          'id' => 'SousQuartiers20160121124316563',
          'visible' => True,
          'style' => 'default',
          'expanded' => True,
        );
        foreach($data as $prop => $value) {
          $this->assertEquals($value, $project->visibilityPresets[0]->layers[0]->$prop, $prop);
        }

        $this->assertNotNull($project->projectlayers);
        $this->assertTrue(is_array($project->projectlayers));
        $this->assertCount(18, $project->projectlayers);

        $expectedWmsInformations = array(
          'WMSServiceTitle' => $project->properties->WMSServiceTitle,
          'WMSServiceAbstract' => $project->properties->WMSServiceAbstract,
          'WMSKeywordList' => '',
          'WMSExtent' => implode(', ', $project->properties->WMSExtent),
          'ProjectCrs' => $project->projectCrs->authid,
          'WMSOnlineResource' => $project->properties->WMSOnlineResource,
          'WMSContactMail' => $project->properties->WMSContactMail,
          'WMSContactOrganization' => $project->properties->WMSContactOrganization,
          'WMSContactPerson' => $project->properties->WMSContactPerson,
          'WMSContactPhone' => $project->properties->WMSContactPhone,
        );
        $this->assertEquals($expectedWmsInformations, $project->getWmsInformationsAsKeyArray());

        $layers = $project->getLayersAsKeyArray();
        $this->assertTrue(is_array($layers));
        $this->assertCount(18, $layers);

        $this->assertNotNull($project->relations);
        $this->assertTrue(is_array($project->relations));
        $this->assertCount(7, $project->relations);
        $this->assertInstanceOf(Qgis\ProjectRelation::class, $project->relations[0]);

        $relations = $project->getRelationsAsKeyArray();
        $this->assertNotNull($relations);
        $this->assertTrue(is_array($relations));
        $this->assertCount(6, $relations); // 5 layers + pivot
        $expectedRelationsKeys = array(
          'VilleMTP_MTP_Quartiers_2011_432620130116112610876',
          'tramstop20150328114203878',
          'tramway20150328114206278',
          'publicbuildings20150420100958543',
          'tramway_ref20150612171109044',
          'pivot',
        );
        $this->assertEquals($expectedRelationsKeys, array_keys($relations));
        $this->assertCount(1, $relations['VilleMTP_MTP_Quartiers_2011_432620130116112610876']);
        $this->assertCount(3, $relations['tramstop20150328114203878']);
        $this->assertCount(1, $relations['tramway20150328114206278']);
        $this->assertCount(1, $relations['publicbuildings20150420100958543']);
        $this->assertCount(1, $relations['tramway_ref20150612171109044']);
        $this->assertCount(2, $relations['pivot']);
        $expectedPivotKeys = array(
          'jointure_tram_stop20150328114216806',
          'publicbuildings_tramstop20150420095614071',
        );
        $this->assertEquals($expectedPivotKeys, array_keys($relations['pivot']));

        $relationFields = $project->getRelationFieldsAsKeyArray();
        $this->assertNotNull($relationFields);
        $this->assertTrue(is_array($relationFields));
        $this->assertCount(7, $relationFields);
        $this->assertEquals('Quartiers', $relationFields[0]['layerName']);
        $this->assertEquals('Quartiers', $relationFields[0]['typeName']);
        $this->assertEquals('LIBQUART', $relationFields[0]['previewField']);
        $this->assertEquals('QUARTMNO', $relationFields[0]['referencedField']);
        $this->assertEquals('QUARTMNO,LIBQUART', $relationFields[0]['propertyName']);
        $this->assertEquals('QUARTMNO', $relationFields[0]['referencingField']);

        $projections = $project->getProjAsKeyArray();
        $this->assertTrue(is_array($projections));
        $this->assertCount(4, $projections);
        $this->assertArrayHasKey('EPSG:4326', $projections);
        $this->assertArrayHasKey('EPSG:3857', $projections);

        $visibilityPresets = $project->getVisibilityPresetsAsKeyArray();
        $this->assertTrue(is_array($visibilityPresets));
        $this->assertCount(3, $visibilityPresets);
        $this->assertArrayHasKey('Administrative', $visibilityPresets);
        $this->assertArrayHasKey('Editable layers', $visibilityPresets);
        $this->assertArrayHasKey('Transport', $visibilityPresets);

        $this->assertNotNull($project->Layouts);
        $this->assertTrue(is_array($project->Layouts));
        $this->assertCount(3, $project->Layouts);
        $this->assertInstanceOf(Qgis\Layout\Layout::class, $project->Layouts[0]);
        $this->assertEquals('Composeur1', $project->Layouts[0]->name);
        $this->assertTrue(is_array($project->Layouts[0]->PageCollection));
        $this->assertCount(1, $project->Layouts[0]->PageCollection);
        $this->assertInstanceOf(Qgis\Layout\LayoutItemPage::class, $project->Layouts[0]->PageCollection[0]);
        $this->assertTrue(is_array($project->Layouts[0]->Items));
        $this->assertCount(5, $project->Layouts[0]->Items);
        $this->assertEquals(65642, $project->Layouts[0]->Items[0]->type);
        $this->assertEquals(65641, $project->Layouts[0]->Items[1]->type);
        $this->assertEquals(65640, $project->Layouts[0]->Items[2]->type);
        $this->assertEquals(65640, $project->Layouts[0]->Items[3]->type);
        $this->assertEquals(65639, $project->Layouts[0]->Items[4]->type);

        $layouts = $project->getLayoutsAsKeyArray();
        $this->assertTrue(is_array($layouts));
        $this->assertCount(2, $layouts); // 1 restricted layout
        $this->assertEquals('Landscape A4', $layouts[0]['title']);
        $this->assertEquals(297, $layouts[0]['width']);
        $this->assertEquals(210, $layouts[0]['height']);
        $this->assertCount(2, $layouts[0]['maps']);
        $this->assertCount(2, $layouts[0]['labels']);
        $this->assertFalse($layouts[0]['atlas']['enabled']);
        $this->assertEquals('District card', $layouts[1]['title']);
        $this->assertEquals(297, $layouts[1]['width']);
        $this->assertEquals(210, $layouts[1]['height']);
        $this->assertCount(2, $layouts[1]['maps']);
        $this->assertCount(1, $layouts[1]['labels']);
        $this->assertTrue($layouts[1]['atlas']['enabled']);
    }

    public function testFromQgisPath(): void
    {
        $xml_path = __DIR__.'/../../Project/Ressources/montpellier.qgs';
        $project = Qgis\ProjectInfo::fromQgisPath($xml_path);

        $data = array(
          'version' => '3.10.5-A Coruña',
          'projectname' => 'Montpellier - Transports',
          'saveDateTime' => '',
          'title' => 'Montpellier - Transports',
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $project->$prop, $prop);
        }

        $this->assertEquals(realpath($xml_path), Qgis\ProjectInfo::getQgisPath($project));
        $this->assertEquals(realpath($xml_path), $project->getPath());
    }

    public function testEmbeddedQgisProject(): void
    {
        $xml_path = __DIR__.'/../../Project/Ressources/relations_project_embed.qgs';
        $project = Qgis\ProjectInfo::fromQgisPath($xml_path);

        $data = array(
          'version' => '3.28.7-Firenze',
          'projectname' => '',
          'saveDateTime' => '2023-09-27T15:15:59',
          'title' => '',
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $project->$prop, $prop);
        }

        $this->assertNotNull($project->projectlayers);
        $this->assertTrue(is_array($project->projectlayers));
        $this->assertCount(2, $project->projectlayers);

        $layers = $project->getLayersAsKeyArray();
        $this->assertTrue(is_array($layers));
        $this->assertCount(2, $layers);

        $this->assertTrue($layers[0]['embedded']);
        $this->assertEquals('./relations_project.qgs', $layers[0]['projectPath']);
        $this->assertEquals(realpath(dirname(realpath($xml_path)).DIRECTORY_SEPARATOR.'./relations_project.qgs'), $layers[0]['file']);
        $this->assertEquals('child_layer_8dec6d75_eeed_494b_b97f_5f2c7e16fd00', $layers[0]['id']);
        $this->assertEquals('child_layer', $layers[0]['name']);

        $this->assertTrue($layers[1]['embedded']);
        $this->assertEquals('./relations_project.qgs', $layers[1]['projectPath']);
        $this->assertEquals(realpath(dirname(realpath($xml_path)).DIRECTORY_SEPARATOR.'./relations_project.qgs'), $layers[1]['file']);
        $this->assertEquals('father_layer_79f5a996_39db_4a1f_b270_dfe21d3e44ff', $layers[1]['id']);
        $this->assertEquals('father_layer', $layers[1]['name']);
    }

    public function testJsonEncode(): void
    {
        $xml_path = __DIR__.'/../../Project/Ressources/montpellier.qgs';
        // Open the document with XML Reader at the root element document
        $oXml = App\XmlTools::xmlReaderFromFile($xml_path);
        $project = Qgis\ProjectInfo::fromXmlReader($oXml);

        $json = json_encode($project);
        $this->assertNotNull($json);
        $this->assertStringStartsWith('{"version":', $json);
    }
}
