<?php

use Lizmap\App;
use Lizmap\Project\Qgis;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class ProjectPropertiesTest extends TestCase
{
    public function testConstruct(): void
    {
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

        $properties = new Qgis\ProjectProperties($data);
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $properties->{$prop});
        }
        $this->assertNull($properties->Variables);
        $this->assertNull($properties->Gui);
    }

    public function testFromXmlReader(): void
    {
        $xmlStr = '
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
          <Variables>
            <variableNames type="QStringList"/>
            <variableValues type="QStringList"/>
          </Variables>
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
          <WMSKeywordList type="QStringList">
            <value></value>
          </WMSKeywordList>
          <WMSOnlineResource type="QString">http://www.3liz.com/lizmap.html</WMSOnlineResource>
          <WMSRestrictedComposers type="QStringList">
            <value>Composeur1</value>
          </WMSRestrictedComposers>
          <WMSRestrictedLayers type="QStringList"/>
          <WMSServiceAbstract type="QString">Demo project with bus and tramway lines in Montpellier, France.
Data is licensed under ODbl, OpenStreetMap contributors</WMSServiceAbstract>
          <WMSServiceCapabilities type="bool">true</WMSServiceCapabilities>
          <WMSServiceTitle type="QString">Montpellier - Transports</WMSServiceTitle>
          <WMSUseLayerIDs type="bool">false</WMSUseLayerIDs>
          <WMSAddWktGeometry type="bool">true</WMSAddWktGeometry>
        </properties>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $properties = Qgis\ProjectProperties::fromXmlReader($oXml);

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
            'WFSLayers' => null,
            'WMSUseLayerIDs' => false,
            'WMSAddWktGeometry' => true,
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $properties->{$prop}, $prop);
        }

        $this->assertNotNull($properties->Variables);
        $data = array(
            'variableNames' => array(),
            'variableValues' => array(),
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $properties->Variables->{$prop}, $prop);
        }

        $this->assertNotNull($properties->Gui);
        $data = array(
            'CanvasColorBluePart' => 255,
            'CanvasColorGreenPart' => 255,
            'CanvasColorRedPart' => 255,
            'SelectionColorAlphaPart' => 255,
            'SelectionColorBluePart' => 0,
            'SelectionColorGreenPart' => 255,
            'SelectionColorRedPart' => 255,
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $properties->Gui->{$prop}, $prop);
        }
    }

    public function testComplexFromXmlReader(): void
    {
        $xmlStr = '
        <properties>
          <DefaultStyles/>
          <Digitizing>
            <AvoidIntersectionsList type="QStringList"/>
            <AvoidIntersectionsMode type="int">2</AvoidIntersectionsMode>
            <DefaultSnapTolerance type="double">10</DefaultSnapTolerance>
            <DefaultSnapToleranceUnit type="int">1</DefaultSnapToleranceUnit>
            <DefaultSnapType type="QString">to vertex and segment</DefaultSnapType>
            <LayerSnapToList type="QStringList">
              <value>to_vertex_and_segment</value>
              <value>to_vertex_and_segment</value>
              <value>to_vertex_and_segment</value>
              <value>to_vertex_and_segment</value>
              <value>to_vertex_and_segment</value>
              <value>to_vertex_and_segment</value>
              <value>to_vertex_and_segment</value>
              <value>to_vertex_and_segment</value>
              <value>to_vertex_and_segment</value>
              <value>to_vertex_and_segment</value>
              <value>to_vertex_and_segment</value>
            </LayerSnapToList>
            <LayerSnappingEnabledList type="QStringList">
              <value>enabled</value>
              <value>enabled</value>
              <value>enabled</value>
              <value>enabled</value>
              <value>enabled</value>
              <value>enabled</value>
              <value>enabled</value>
              <value>enabled</value>
              <value>enabled</value>
              <value>enabled</value>
              <value>enabled</value>
            </LayerSnappingEnabledList>
            <LayerSnappingList type="QStringList">
              <value>SousQuartiers20160121124316563</value>
              <value>VilleMTP_MTP_Quartiers_2011_432620130116112351546</value>
              <value>VilleMTP_MTP_Quartiers_2011_432620130116112610876</value>
              <value>bus20121102133611751</value>
              <value>bus_stops20121106170806413</value>
              <value>edition_line20130409161630329</value>
              <value>edition_point20130118171631518</value>
              <value>edition_polygon20130409114333776</value>
              <value>publicbuildings20150420100958543</value>
              <value>tramstop20150328114203878</value>
              <value>tramway20150328114206278</value>
            </LayerSnappingList>
            <LayerSnappingToleranceList type="QStringList">
              <value>10.000000</value>
              <value>10.000000</value>
              <value>10.000000</value>
              <value>10.000000</value>
              <value>10.000000</value>
              <value>10.000000</value>
              <value>10.000000</value>
              <value>10.000000</value>
              <value>10.000000</value>
              <value>10.000000</value>
              <value>10.000000</value>
            </LayerSnappingToleranceList>
            <LayerSnappingToleranceUnitList type="QStringList">
              <value>1</value>
              <value>1</value>
              <value>1</value>
              <value>1</value>
              <value>1</value>
              <value>1</value>
              <value>1</value>
              <value>1</value>
              <value>1</value>
              <value>1</value>
              <value>1</value>
            </LayerSnappingToleranceUnitList>
            <SnappingMode type="QString">advanced</SnappingMode>
          </Digitizing>
          <Gui>
            <CanvasColorBluePart type="int">255</CanvasColorBluePart>
            <CanvasColorGreenPart type="int">255</CanvasColorGreenPart>
            <CanvasColorRedPart type="int">255</CanvasColorRedPart>
            <SelectionColorAlphaPart type="int">255</SelectionColorAlphaPart>
            <SelectionColorBluePart type="int">0</SelectionColorBluePart>
            <SelectionColorGreenPart type="int">255</SelectionColorGreenPart>
            <SelectionColorRedPart type="int">255</SelectionColorRedPart>
          </Gui>
          <Identify>
            <disabledLayers type="QStringList"/>
          </Identify>
          <Legend>
            <filterByMap type="bool">false</filterByMap>
          </Legend>
          <Macros>
            <pythonCode type="QString"></pythonCode>
          </Macros>
          <Mask>
            <layer_id type="QString"></layer_id>
            <parameters type="QString">KGxwMApJMDAKYUkxCmFJNQphSTAxCmFGMS4wCmFJMDAKYU5hTmEobHAxCmFOYUkyCmFJMAphTmFOYS4=</parameters>
          </Mask>
          <Measure>
            <Ellipsoid type="QString">NONE</Ellipsoid>
          </Measure>
          <Measurement>
            <AreaUnits type="QString">m2</AreaUnits>
            <DistanceUnits type="QString">meters</DistanceUnits>
          </Measurement>
          <PAL>
            <CandidatesLine type="int">50</CandidatesLine>
            <CandidatesLinePerCM type="double">5</CandidatesLinePerCM>
            <CandidatesPoint type="int">16</CandidatesPoint>
            <CandidatesPolygon type="int">30</CandidatesPolygon>
            <CandidatesPolygonPerCM type="double">2.5</CandidatesPolygonPerCM>
            <DrawRectOnly type="bool">false</DrawRectOnly>
            <DrawUnplaced type="bool">false</DrawUnplaced>
            <PlacementEngineVersion type="int">0</PlacementEngineVersion>
            <SearchMethod type="int">0</SearchMethod>
            <ShowingAllLabels type="bool">false</ShowingAllLabels>
            <ShowingCandidates type="bool">false</ShowingCandidates>
            <ShowingPartialsLabels type="bool">true</ShowingPartialsLabels>
            <TextFormat type="int">0</TextFormat>
            <UnplacedColor type="QString">255,0,0,255</UnplacedColor>
          </PAL>
          <Paths>
            <Absolute type="bool">false</Absolute>
          </Paths>
          <PositionPrecision>
            <Automatic type="bool">true</Automatic>
            <DecimalPlaces type="int">2</DecimalPlaces>
            <DegreeFormat type="QString">D</DegreeFormat>
          </PositionPrecision>
          <RenderMapTile type="bool">false</RenderMapTile>
          <SpatialRefSys>
            <ProjectCRSID type="int">3857</ProjectCRSID>
            <ProjectCRSProj4String type="QString">+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs</ProjectCRSProj4String>
            <ProjectCrs type="QString">EPSG:3857</ProjectCrs>
            <ProjectionsEnabled type="int">1</ProjectionsEnabled>
          </SpatialRefSys>
          <TimeManager>
            <active type="int">1</active>
            <animationFrameLength type="int">2000</animationFrameLength>
            <currentMapTimePosition type="int">1365537727</currentMapTimePosition>
            <loopAnimation type="int">0</loopAnimation>
            <playBackwards type="int">0</playBackwards>
            <timeFrameSize type="int">1</timeFrameSize>
            <timeFrameType type="QString">days</timeFrameType>
            <timeLayerList type="QStringList"/>
            <timeLayerManager type="QString"></timeLayerManager>
          </TimeManager>
          <Variables>
            <variableNames type="QStringList">
              <value>lizmap_repository</value>
              <value>lizmap_user</value>
              <value>lizmap_user_groups</value>
            </variableNames>
            <variableValues type="QStringList">
              <value>features</value>
              <value></value>
              <value></value>
            </variableValues>
          </Variables>
          <WCSLayers type="QStringList"/>
          <WCSUrl type="QString"></WCSUrl>
          <WFSLayers type="QStringList">
            <value>SousQuartiers20160121124316563</value>
            <value>VilleMTP_MTP_Quartiers_2011_432620130116112351546</value>
            <value>VilleMTP_MTP_Quartiers_2011_432620130116112610876</value>
            <value>bus20121102133611751</value>
            <value>bus_stops20121106170806413</value>
            <value>donnes_sociodemo_sous_quartiers20160121144525075</value>
            <value>edition_line20130409161630329</value>
            <value>edition_point20130118171631518</value>
            <value>edition_polygon20130409114333776</value>
            <value>jointure_tram_stop20150328114216806</value>
            <value>publicbuildings20150420100958543</value>
            <value>publicbuildings_tramstop20150420095614071</value>
            <value>tram_stop_work20150416102656130</value>
            <value>tramstop20150328114203878</value>
            <value>tramway20150328114206278</value>
            <value>tramway_ref20150612171109044</value>
          </WFSLayers>
          <WFSLayersPrecision>
            <ArbRemarq_point20170509160239869 type="int">8</ArbRemarq_point20170509160239869>
            <SousQuartiers20160121124316563 type="int">8</SousQuartiers20160121124316563>
            <VilleMTP_MTP_Quartiers_2011_432620130116112351546 type="int">8</VilleMTP_MTP_Quartiers_2011_432620130116112351546>
            <VilleMTP_MTP_Quartiers_2011_432620130116112610876 type="int">8</VilleMTP_MTP_Quartiers_2011_432620130116112610876>
            <VilleMTP_MTP_SousQuartiers_201120130929113137811 type="int">8</VilleMTP_MTP_SousQuartiers_201120130929113137811>
            <average_tenants_owners20170509164213410 type="int">8</average_tenants_owners20170509164213410>
            <bus20121102133611751 type="int">8</bus20121102133611751>
            <bus_stops20121106170806413 type="int">8</bus_stops20121106170806413>
            <donnes_sociodemo_sous_quartiers20160121144525075 type="int">8</donnes_sociodemo_sous_quartiers20160121144525075>
            <edition_line20130409161630329 type="int">8</edition_line20130409161630329>
            <edition_point20130118171631518 type="int">8</edition_point20130118171631518>
            <edition_polygon20130409114333776 type="int">8</edition_polygon20130409114333776>
            <jointure_tram_stop20150311122053595 type="int">8</jointure_tram_stop20150311122053595>
            <jointure_tram_stop20150328114216806 type="int">8</jointure_tram_stop20150328114216806>
            <publicbuildings20150420100958543 type="int">8</publicbuildings20150420100958543>
            <publicbuildings_tramstop20150420095614071 type="int">8</publicbuildings_tramstop20150420095614071>
            <route_tram20150311113517859 type="int">8</route_tram20150311113517859>
            <route_tram20150311113518037 type="int">8</route_tram20150311113518037>
            <tenants_and_owners20170509164904788 type="int">8</tenants_and_owners20170509164904788>
            <tram20150311115319564 type="int">8</tram20150311115319564>
            <tram_stop_work20150416102656130 type="int">8</tram_stop_work20150416102656130>
            <tram_stops20150311115247810 type="int">8</tram_stops20150311115247810>
            <tramstop20150328114203878 type="int">8</tramstop20150328114203878>
            <tramway20150328114206278 type="int">8</tramway20150328114206278>
            <tramway_ref20150612171109044 type="int">1</tramway_ref20150612171109044>
          </WFSLayersPrecision>
          <WFSTLayers>
            <Delete type="QStringList"/>
            <Insert type="QStringList"/>
            <Update type="QStringList"/>
          </WFSTLayers>
          <WFSUrl type="QString"></WFSUrl>
          <WMSAccessConstraints type="QString">None</WMSAccessConstraints>
          <WMSAddWktGeometry type="bool">true</WMSAddWktGeometry>
          <WMSContactMail type="QString">info@3liz.com</WMSContactMail>
          <WMSContactOrganization type="QString">3liz</WMSContactOrganization>
          <WMSContactPerson type="QString">3liz</WMSContactPerson>
          <WMSContactPhone type="QString">+334 67 16 64 51</WMSContactPhone>
          <WMSContactPosition type="QString"></WMSContactPosition>
          <WMSCrsList type="QStringList">
            <value>EPSG:2154</value>
            <value>EPSG:4326</value>
            <value>EPSG:3857</value>
          </WMSCrsList>
          <WMSDefaultMapUnitsPerMm type="double">1</WMSDefaultMapUnitsPerMm>
          <WMSExtent type="QStringList">
            <value>417006.61369999998714775</value>
            <value>5394910.3409000001847744</value>
            <value>447158.04889999999431893</value>
            <value>5414844.99480000045150518</value>
          </WMSExtent>
          <WMSFeatureInfoUseAttributeFormSettings type="bool">false</WMSFeatureInfoUseAttributeFormSettings>
          <WMSFees type="QString">conditions unknown</WMSFees>
          <WMSImageQuality type="int">90</WMSImageQuality>
          <WMSKeywordList type="QStringList">
            <value></value>
          </WMSKeywordList>
          <WMSMaxAtlasFeatures type="int">1</WMSMaxAtlasFeatures>
          <WMSOnlineResource type="QString">http://www.3liz.com/lizmap.html</WMSOnlineResource>
          <WMSPrecision type="QString">8</WMSPrecision>
          <WMSRestrictedComposers type="QStringList">
            <value>Composeur1</value>
          </WMSRestrictedComposers>
          <WMSRestrictedLayers type="QStringList"/>
          <WMSRootName type="QString">Montpellier-Transports</WMSRootName>
          <WMSSegmentizeFeatureInfoGeometry type="bool">false</WMSSegmentizeFeatureInfoGeometry>
          <WMSServiceAbstract type="QString">Demo project with bus and tramway lines in Montpellier, France.
      Data is licensed under ODbl, OpenStreetMap contributors</WMSServiceAbstract>
          <WMSServiceCapabilities type="bool">true</WMSServiceCapabilities>
          <WMSServiceTitle type="QString">Montpellier - Transports</WMSServiceTitle>
          <WMSTileBuffer type="int">0</WMSTileBuffer>
          <WMSUrl type="QString"></WMSUrl>
          <WMSUseLayerIDs type="bool">false</WMSUseLayerIDs>
          <WMTSGrids>
            <CRS type="QStringList"/>
            <Config type="QStringList"/>
          </WMTSGrids>
          <WMTSJpegLayers>
            <Group type="QStringList"/>
            <Layer type="QStringList"/>
            <Project type="bool">false</Project>
          </WMTSJpegLayers>
          <WMTSLayers>
            <Group type="QStringList"/>
            <Layer type="QStringList"/>
            <Project type="bool">false</Project>
          </WMTSLayers>
          <WMTSMinScale type="int">5000</WMTSMinScale>
          <WMTSPngLayers>
            <Group type="QStringList"/>
            <Layer type="QStringList"/>
            <Project type="bool">false</Project>
          </WMTSPngLayers>
          <WMTSUrl type="QString"></WMTSUrl>
          <quickfinder_plugin>
            <refreshLastAsked type="QString">2018-03-15</refreshLastAsked>
          </quickfinder_plugin>
        </properties>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $properties = Qgis\ProjectProperties::fromXmlReader($oXml);

        $data = array(
            'WMSServiceTitle' => 'Montpellier - Transports',
            'WMSServiceAbstract' => 'Demo project with bus and tramway lines in Montpellier, France.
      Data is licensed under ODbl, OpenStreetMap contributors',
            'WMSKeywordList' => array(''),
            'WMSExtent' => array('417006.61369999998714775', '5394910.3409000001847744', '447158.04889999999431893', '5414844.99480000045150518'),
            'WMSOnlineResource' => 'http://www.3liz.com/lizmap.html',
            'WMSContactMail' => 'info@3liz.com',
            'WMSContactOrganization' => '3liz',
            'WMSContactPerson' => '3liz',
            'WMSContactPhone' => '+334 67 16 64 51',
            'WMSRestrictedComposers' => array('Composeur1'),
            'WMSRestrictedLayers' => array(),
            // 'WFSLayers' => null,
            'WMSUseLayerIDs' => false,
            'WMSAddWktGeometry' => true,
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $properties->{$prop}, $prop);
        }

        $this->assertNotNull($properties->WFSLayers);
        $this->assertCount(16, $properties->WFSLayers);
        $this->assertEquals('SousQuartiers20160121124316563', $properties->WFSLayers[0]);

        $this->assertNotNull($properties->Variables);
        $data = array(
            'variableNames' => array(
                'lizmap_repository',
                'lizmap_user',
                'lizmap_user_groups',
            ),
            'variableValues' => array(
                'features',
                '',
                '',
            ),
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $properties->Variables->{$prop}, $prop);
        }

        $this->assertNotNull($properties->Gui);
        $data = array(
            'CanvasColorBluePart' => 255,
            'CanvasColorGreenPart' => 255,
            'CanvasColorRedPart' => 255,
            'SelectionColorAlphaPart' => 255,
            'SelectionColorBluePart' => 0,
            'SelectionColorGreenPart' => 255,
            'SelectionColorRedPart' => 255,
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $properties->Gui->{$prop}, $prop);
        }
    }
}
