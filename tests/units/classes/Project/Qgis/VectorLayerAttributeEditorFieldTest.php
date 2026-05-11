<?php

use Lizmap\App;
use Lizmap\Project\Qgis;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class VectorLayerAttributeEditorFieldTest extends TestCase
{
    public function testFromXmlReader(): void
    {
        // simple field
        $xmlStr = '
        <attributeEditorField showLabel="1" horizontalStretch="0" index="1" verticalStretch="0" name="natural_area_name">
            <labelStyle labelColor="0,0,0,255,rgb:0,0,0,1" overrideLabelFont="0" overrideLabelColor="0">
            <labelFont description="Noto Sans,9,-1,5,50,0,0,0,0,0" style="" underline="0" bold="0" italic="0" strikethrough="0"/>
            </labelStyle>
        </attributeEditorField>
        ';
        $config = array(
            'name' => 'natural_area_name',
            'showLabel' => '1',
        );
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $field = Qgis\Layer\VectorLayerAttributeEditorField::fromXmlReader($oXml);

        foreach ($config as $prop => $value) {
            $this->assertEquals($value, $field->{$prop});
        }
    }
}
