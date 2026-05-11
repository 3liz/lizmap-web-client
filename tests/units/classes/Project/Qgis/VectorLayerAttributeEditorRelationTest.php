<?php

use Lizmap\App;
use Lizmap\Project\Qgis;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class VectorLayerAttributeEditorRelationTest extends TestCase
{
    public function testFromXmlReader(): void
    {
        // 1:n relation
        $xmlStr = '
        <attributeEditorRelation label="card" relation="birds_area_natural_area_id_natural_ar_id_1" showLabel="1" horizontalStretch="0" nmRelationId="" verticalStretch="0" forceSuppressFormPopup="0" name="birds_area_natural_area_id_natural_ar_id_1" relationWidgetTypeId="relation_editor">
            <labelStyle labelColor="" overrideLabelFont="0" overrideLabelColor="0">
            <labelFont description="Noto Sans,9,-1,5,50,0,0,0,0,0" style="" underline="0" bold="0" italic="0" strikethrough="0"/>
            </labelStyle>
            <editor_configuration type="Map">
            <Option value="false" type="bool" name="allow_add_child_feature_with_no_geometry"/>
            <Option value="AllButtons" type="QString" name="buttons"/>
            <Option type="invalid" name="filter_expression"/>
            <Option value="true" type="bool" name="show_first_feature"/>
            </editor_configuration>
        </attributeEditorRelation>
        ';
        $config = array(
            'label' => 'card',
            'name' => 'birds_area_natural_area_id_natural_ar_id_1',
            'relation' => 'birds_area_natural_area_id_natural_ar_id_1',
            'nmRelationId' => '',
            'showLabel' => '1',
        );
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $relation = Qgis\Layer\VectorLayerAttributeEditorRelation::fromXmlReader($oXml);

        foreach ($config as $prop => $value) {
            $this->assertEquals($value, $relation->{$prop});
        }

        $this->assertFalse($relation->isnmRelation());

        // n:m relation
        $xmlStr = '
        <attributeEditorRelation label="Associated birds" relation="birds_area_natural_area_id_natural_ar_id" showLabel="1" horizontalStretch="0" nmRelationId="birds_area_bird_id_birds_4069_id" verticalStretch="0" forceSuppressFormPopup="0" name="birds_area_natural_area_id_natural_ar_id" relationWidgetTypeId="relation_editor">
            <labelStyle labelColor="0,0,0,255,rgb:0,0,0,1" overrideLabelFont="0" overrideLabelColor="0">
            <labelFont description="Noto Sans,9,-1,5,50,0,0,0,0,0" style="" underline="0" bold="0" italic="0" strikethrough="0"/>
            </labelStyle>
            <editor_configuration type="Map">
            <Option value="false" type="bool" name="allow_add_child_feature_with_no_geometry"/>
            <Option value="AllButtons" type="QString" name="buttons"/>
            <Option type="invalid" name="filter_expression"/>
            <Option value="true" type="bool" name="show_first_feature"/>
            </editor_configuration>
        </attributeEditorRelation>
        ';
        $config = array(
            'label' => 'Associated birds',
            'name' => 'birds_area_natural_area_id_natural_ar_id',
            'relation' => 'birds_area_natural_area_id_natural_ar_id',
            'nmRelationId' => 'birds_area_bird_id_birds_4069_id',
            'showLabel' => '1',
        );
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $relation = Qgis\Layer\VectorLayerAttributeEditorRelation::fromXmlReader($oXml);

        foreach ($config as $prop => $value) {
            $this->assertEquals($value, $relation->{$prop});
        }

        $this->assertTrue($relation->isnmRelation());
    }
}
