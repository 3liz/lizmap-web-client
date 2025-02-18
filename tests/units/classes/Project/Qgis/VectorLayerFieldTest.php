<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class VectorLayerFieldTest extends TestCase
{
    public function testFromXmlReader(): void
    {
        // Simple default
        $xmlStr = '
        <field name="fid" configurationFlags="None">
          <editWidget type="TextEdit">
            <config>
              <Option type="Map">
                <Option type="bool" value="false" name="IsMultiline"/>
                <Option type="bool" value="false" name="UseHtml"/>
              </Option>
            </config>
          </editWidget>
        </field>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $field = Qgis\Layer\VectorLayerField::fromXmlReader($oXml);

        $this->assertEquals('fid', $field->name);
        $this->assertFalse($field->isHideFromWms());
        $this->assertFalse($field->isHideFromWfs());
        $this->assertNotNull($field->editWidget);
        $this->assertEquals('TextEdit', $field->editWidget->type);
        $this->assertNotNull($field->editWidget->config);
        $this->assertInstanceOf(Qgis\Layer\EditWidget\TextEditConfig::class, $field->editWidget->config);
        //$this->assertCount(2, $field->editWidget->config);

        $config = array(
            'IsMultiline' => false,
            'UseHtml' => false,
        );
        foreach($config as $prop => $value) {
            $this->assertEquals($value, $field->editWidget->config->$prop, $prop);
        }

        // Old simple
        $xmlStr = '
        <field name="popdensity">
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
        $field = Qgis\Layer\VectorLayerField::fromXmlReader($oXml);

        $this->assertEquals('popdensity', $field->name);
        $this->assertFalse($field->isHideFromWms());
        $this->assertFalse($field->isHideFromWfs());
        $this->assertNotNull($field->editWidget);
        $this->assertEquals('TextEdit', $field->editWidget->type);
        $this->assertNotNull($field->editWidget->config);
        //$this->assertCount(2, $field->editWidget->config);

        $config = array(
            'IsMultiline' => false,
            'UseHtml' => false,
        );
        foreach($config as $prop => $value) {
            $this->assertEquals($value, $field->editWidget->config->$prop, $prop);
        }
        $this->assertEquals($config, $field->editWidget->config->getData());

        // Default config
        $xmlStr = '
        <field name="description" configurationFlags="None">
          <editWidget type="TextEdit">
            <config>
              <Option/>
            </config>
          </editWidget>
        </field>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $field = Qgis\Layer\VectorLayerField::fromXmlReader($oXml);

        $this->assertEquals('description', $field->name);
        $this->assertFalse($field->isHideFromWms());
        $this->assertFalse($field->isHideFromWfs());
        $this->assertNotNull($field->editWidget);
        $this->assertEquals('TextEdit', $field->editWidget->type);
        $this->assertNotNull($field->editWidget->config);
        //$this->assertCount(2, $field->editWidget->config);

        $config = array(
            'IsMultiline' => false,
            'UseHtml' => false,
        );
        foreach($config as $prop => $value) {
            $this->assertEquals($value, $field->editWidget->config->$prop, $prop);
        }
    }
}
