<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class VectorLayerEditWidgetTest extends TestCase
{
    public function testFromXmlReader(): void
    {
        // Simple default
        $xmlStr = '
        <editWidget type="TextEdit">
          <config>
            <Option type="Map">
            <Option type="bool" value="false" name="IsMultiline"/>
            <Option type="bool" value="false" name="UseHtml"/>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = Qgis\Layer\VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('TextEdit', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(Qgis\Layer\EditWidget\TextEditConfig::class, $editWidget->config);

        $config = array(
            'IsMultiline' => false,
            'UseHtml' => false,
        );
        foreach($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->$prop, $prop);
        }
        $this->assertEquals($config, $editWidget->config->getData());

        // Simple default old
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
        $editWidget = Qgis\Layer\VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('TextEdit', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(Qgis\Layer\EditWidget\TextEditConfig::class, $editWidget->config);

        $config = array(
            'IsMultiline' => false,
            'UseHtml' => false,
        );
        foreach($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->$prop, $prop);
        }

        // Default config
        $xmlStr = '
        <editWidget type="TextEdit">
          <config>
            <Option/>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = Qgis\Layer\VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('TextEdit', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(Qgis\Layer\EditWidget\TextEditConfig::class, $editWidget->config);

        $config = array(
            'IsMultiline' => false,
            'UseHtml' => false,
        );
        foreach($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->$prop, $prop);
        }
    }

    public function testCheckBoxFromXmlReader(): void
    {
        // Config
        $xmlStr = '
        <editWidget type="CheckBox">
          <config>
            <Option type="Map">
              <Option value="1" type="QString" name="CheckedState"/>
              <Option value="0" type="QString" name="UncheckedState"/>
              <Option name="TextDisplayMethod" type="int" value="1"></Option>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = Qgis\Layer\VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('CheckBox', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(Qgis\Layer\EditWidget\CheckBoxConfig::class, $editWidget->config);

        $config = array(
            'CheckedState' => '1',
            'UncheckedState' => '0',
            'TextDisplayMethod' => 1,
        );
        foreach($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->$prop, $prop);
        }

        $xmlStr = '
        <editWidget type="CheckBox">
          <config>
            <Option type="Map">
              <Option value="1" type="QString" name="CheckedState"/>
              <Option value="0" type="QString" name="UncheckedState"/>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = Qgis\Layer\VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('CheckBox', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(Qgis\Layer\EditWidget\CheckBoxConfig::class, $editWidget->config);

        $config = array(
            'CheckedState' => '1',
            'UncheckedState' => '0',
            'TextDisplayMethod' => 0,
        );
        foreach($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->$prop, $prop);
        }

        // Default config
        $xmlStr = '
        <editWidget type="CheckBox">
          <config>
            <Option/>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = Qgis\Layer\VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('CheckBox', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(Qgis\Layer\EditWidget\CheckBoxConfig::class, $editWidget->config);

        $config = array(
            'CheckedState' => '',
            'UncheckedState' => '',
            'TextDisplayMethod' => 0,
        );
        foreach($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->$prop, $prop);
        }
    }

    public function testDateTimeFromXmlReader(): void
    {
        // Config
        $xmlStr = '
        <editWidget type="DateTime">
          <config>
            <Option type="Map">
              <Option value="false" type="bool" name="allow_null"/>
              <Option value="false" type="bool" name="calendar_popup"/>
              <Option value="" type="QString" name="display_format"/>
              <Option value="yyyy-MM-dd" type="QString" name="field_format"/>
              <Option value="false" type="bool" name="field_iso_format"/>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = Qgis\Layer\VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('DateTime', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(Qgis\Layer\EditWidget\DateTimeConfig::class, $editWidget->config);

        $config = array(
            'allow_null' => false,
            'calendar_popup' => false,
            'display_format' => '',
            'field_format' => 'yyyy-MM-dd',
            'field_iso_format' => false,
        );
        foreach($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->$prop, $prop);
        }

        // Default config
        $xmlStr = '
        <editWidget type="DateTime">
          <config>
            <Option/>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = Qgis\Layer\VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('DateTime', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(Qgis\Layer\EditWidget\DateTimeConfig::class, $editWidget->config);

        $config = array(
            'allow_null' => false,
            'calendar_popup' => false,
            'display_format' => '',
            'field_format' => 'yyyy-MM-dd',
            'field_iso_format' => false,
        );
        foreach($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->$prop, $prop);
        }
    }

    public function testRangeFromXmlReader(): void
    {
        // Config
        $xmlStr = '
        <editWidget type="Range">
          <config>
            <Option type="Map">
              <Option type="bool" name="AllowNull" value="true"/>
              <Option type="int" name="Max" value="2147483647"/>
              <Option type="int" name="Min" value="-2147483648"/>
              <Option type="int" name="Precision" value="0"/>
              <Option type="int" name="Step" value="1"/>
              <Option type="QString" name="Style" value="SpinBox"/>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = Qgis\Layer\VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('Range', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(Qgis\Layer\EditWidget\RangeConfig::class, $editWidget->config);

        $config = array(
            'AllowNull' => true,
            'Max' => 2147483647,
            'Min' => -2147483648,
            'Precision' => 0,
            'Step' => 1,
            'Style' => 'SpinBox',
        );
        foreach($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->$prop, $prop);
        }

        // Default config
        $xmlStr = '
        <editWidget type="Range">
          <config>
            <Option/>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = Qgis\Layer\VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('Range', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(Qgis\Layer\EditWidget\RangeConfig::class, $editWidget->config);

        $config = array(
            'AllowNull' => true,
            'Style' => 'SpinBox',
        );
        foreach($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->$prop, $prop);
        }
        $notSet = array(
            'Max',
            'Min',
            'Precision',
            'Step',
        );
        foreach($notSet as $not) {
            $this->assertFalse(isset($editWidget->config->$not), $not);
        }
    }
}
