<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class ProjectVisibilityPresetTest extends TestCase
{
    public function testFromXmlReader(): void
    {
        $xmlStr = '
        <visibility-preset has-checked-group-info="1" name="theme1" has-expanded-info="1">
          <layer visible="1" expanded="1" id="quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d" style="style1"/>
          <expanded-legend-nodes id="quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d"/>
          <checked-group-nodes/>
          <expanded-group-nodes>
            <expanded-group-node id="group1"/>
          </expanded-group-nodes>
        </visibility-preset>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $visibilityPreset = Qgis\ProjectVisibilityPreset::fromXmlReader($oXml);

        $this->assertEquals('theme1', $visibilityPreset->name);
        $this->assertCount(0, $visibilityPreset->checkedGroupNodes);
        $this->assertCount(1, $visibilityPreset->expandedGroupNodes);
        $this->assertCount(1, $visibilityPreset->layers);
        $this->assertInstanceOf(Qgis\ProjectVisibilityPresetLayer::class, $visibilityPreset->layers[0]);
        $data = array(
          'id' => 'quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d',
          'visible' => True,
          'style' => 'style1',
          'expanded' => True,
        );
        foreach($data as $prop => $value) {
          $this->assertEquals($value, $visibilityPreset->layers[0]->$prop, $prop);
        }

        $dataArray = $visibilityPreset->toKeyArray();
        $this->assertCount(1, $dataArray['layers']);
        $this->assertArrayHasKey('quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d', $dataArray['layers']);
        $this->assertEquals('style1', $dataArray['layers']['quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d']['style']);
        $this->assertTrue($dataArray['layers']['quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d']['expanded']);
        $this->assertCount(0, $dataArray['checkedGroupNode']);
        $this->assertCount(1, $dataArray['expandedGroupNode']);

        $xmlStr = '
        <visibility-preset has-checked-group-info="1" name="theme1" has-expanded-info="1">
          <layer visible="0" expanded="1" id="sousquartiers_7c49d0fc_0ee0_4308_a66d_45c144e59872" style="défaut"/>
          <expanded-legend-nodes id="sousquartiers_7c49d0fc_0ee0_4308_a66d_45c144e59872"/>
          <layer visible="1" expanded="1" id="quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d" style="style1"/>
          <expanded-legend-nodes id="quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d"/>
          <checked-group-nodes/>
          <expanded-group-nodes>
            <expanded-group-node id="group1"/>
          </expanded-group-nodes>
        </visibility-preset>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $visibilityPreset = Qgis\ProjectVisibilityPreset::fromXmlReader($oXml);

        $this->assertEquals('theme1', $visibilityPreset->name);
        $this->assertCount(0, $visibilityPreset->checkedGroupNodes);
        $this->assertCount(1, $visibilityPreset->expandedGroupNodes);
        $this->assertCount(2, $visibilityPreset->layers);
        $this->assertInstanceOf(Qgis\ProjectVisibilityPresetLayer::class, $visibilityPreset->layers[0]);
        $data = array(
          'id' => 'sousquartiers_7c49d0fc_0ee0_4308_a66d_45c144e59872',
          'visible' => False,
          'style' => 'défaut',
          'expanded' => True,
        );
        foreach($data as $prop => $value) {
          $this->assertEquals($value, $visibilityPreset->layers[0]->$prop, $prop);
        }
        $data = array(
          'id' => 'quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d',
          'visible' => True,
          'style' => 'style1',
          'expanded' => True,
        );
        foreach($data as $prop => $value) {
          $this->assertEquals($value, $visibilityPreset->layers[1]->$prop, $prop);
        }

        $dataArray = $visibilityPreset->toKeyArray();
        $this->assertCount(1, $dataArray['layers']);
        $this->assertArrayHasKey('quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d', $dataArray['layers']);
        $this->assertEquals('style1', $dataArray['layers']['quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d']['style']);
        $this->assertTrue($dataArray['layers']['quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d']['expanded']);
        $this->assertCount(0, $dataArray['checkedGroupNode']);
        $this->assertCount(1, $dataArray['expandedGroupNode']);
    }
}
