<?php

use Lizmap\App;
use Lizmap\Project\Qgis\Layer\EditWidget;
use Lizmap\Project\Qgis\Layer\VectorLayerEditWidget;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
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
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('TextEdit', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\TextEditConfig::class, $editWidget->config);

        $config = array(
            'IsMultiline' => false,
            'UseHtml' => false,
        );
        foreach ($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->{$prop}, $prop);
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
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('TextEdit', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\TextEditConfig::class, $editWidget->config);

        $config = array(
            'IsMultiline' => false,
            'UseHtml' => false,
        );
        foreach ($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->{$prop}, $prop);
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
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('TextEdit', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\TextEditConfig::class, $editWidget->config);

        $config = array(
            'IsMultiline' => false,
            'UseHtml' => false,
        );
        foreach ($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->{$prop}, $prop);
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
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('CheckBox', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\CheckBoxConfig::class, $editWidget->config);

        $config = array(
            'CheckedState' => '1',
            'UncheckedState' => '0',
            'TextDisplayMethod' => 1,
            'AllowNullState' => false,
        );
        foreach ($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->{$prop}, $prop);
        }
        $this->assertEquals($config, $editWidget->config->getData());

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
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('CheckBox', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\CheckBoxConfig::class, $editWidget->config);

        $config = array(
            'CheckedState' => '1',
            'UncheckedState' => '0',
            'TextDisplayMethod' => 0,
            'AllowNullState' => false,
        );
        foreach ($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->{$prop}, $prop);
        }
        $this->assertEquals($config, $editWidget->config->getData());

        // Default config
        $xmlStr = '
        <editWidget type="CheckBox">
          <config>
            <Option/>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('CheckBox', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\CheckBoxConfig::class, $editWidget->config);

        $config = array(
            'CheckedState' => '',
            'UncheckedState' => '',
            'TextDisplayMethod' => 0,
            'AllowNullState' => false,
        );
        foreach ($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->{$prop}, $prop);
        }
        $this->assertEquals($config, $editWidget->config->getData());

        // invalid CheckedState and UncheckedState
        // allow NULL
        $xmlStr = '
        <editWidget type="CheckBox">
          <config>
            <Option type="Map">
              <Option name="AllowNullState" type="bool" value="true"/>
              <Option name="CheckedState" type="invalid"/>
              <Option name="TextDisplayMethod" type="int" value="0"/>
              <Option name="UncheckedState" type="invalid"/>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('CheckBox', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\CheckBoxConfig::class, $editWidget->config);

        $config = array(
            'CheckedState' => '',
            'UncheckedState' => '',
            'TextDisplayMethod' => 0,
            'AllowNullState' => true,
        );
        foreach ($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->{$prop}, $prop);
        }
        $this->assertEquals($config, $editWidget->config->getData());
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
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('DateTime', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\DateTimeConfig::class, $editWidget->config);

        $config = array(
            'allow_null' => false,
            'calendar_popup' => false,
            'display_format' => '',
            'field_format' => 'yyyy-MM-dd',
            'field_iso_format' => false,
        );
        foreach ($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->{$prop}, $prop);
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
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('DateTime', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\DateTimeConfig::class, $editWidget->config);

        $config = array(
            'allow_null' => false,
            'calendar_popup' => false,
            'display_format' => '',
            'field_format' => 'yyyy-MM-dd',
            'field_iso_format' => false,
        );
        foreach ($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->{$prop}, $prop);
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
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('Range', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\RangeConfig::class, $editWidget->config);

        $config = array(
            'AllowNull' => true,
            'Max' => 2147483647,
            'Min' => -2147483648,
            'Precision' => 0,
            'Step' => 1,
            'Style' => 'SpinBox',
        );
        foreach ($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->{$prop}, $prop);
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
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('Range', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\RangeConfig::class, $editWidget->config);

        $config = array(
            'AllowNull' => true,
            'Style' => 'SpinBox',
        );
        foreach ($config as $prop => $value) {
            $this->assertEquals($value, $editWidget->config->{$prop}, $prop);
        }
        $notSet = array(
            'Max',
            'Min',
            'Precision',
            'Step',
        );
        foreach ($notSet as $not) {
            $this->assertFalse(isset($editWidget->config->{$not}), $not);
        }
    }

    public function testValueRelationFromXmlReader(): void
    {
        // No filter Expression
        $xmlStr = '
        <editWidget type="ValueRelation">
          <config>
            <Option type="Map">
              <Option type="bool" value="false" name="AllowMulti"/>
              <Option value="true" name="AllowNull" type="bool"/>
              <Option name="FilterExpression" type="invalid"/>
              <Option value="es_id" name="Key" type="QString"/>
              <Option value="espece20160621120237434" name="Layer" type="QString"/>
              <Option value="espece" name="LayerName" type="QString"/>
              <Option value="postgres" name="LayerProviderName" type="QString"/>
              <Option value="service=\'PG_SERVICE\' sslmode=disable key=\'es_id\' estimatedmetadata=true checkPrimaryKeyUnicity=\'1\' table=&quot;observatoire&quot;.&quot;espece&quot; sql=" name="LayerSource" type="QString"/>
              <Option value="1" name="NofColumns" type="int"/>
              <Option value="true" name="OrderByValue" type="bool"/>
              <Option value="false" name="UseCompleter" type="bool"/>
              <Option value="es_nom_commun" name="Value" type="QString"/>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('ValueRelation', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\ValueRelationConfig::class, $editWidget->config);

        $config = array(
            'AllowMulti' => false,
            'AllowNull' => true,
            'FilterExpression' => '',
            'Key' => 'es_id',
            'Layer' => 'espece20160621120237434',
            'LayerName' => 'espece',
            'LayerProviderName' => 'postgres',
            'NofColumns' => 1,
            'OrderByValue' => true,
            'UseCompleter' => false,
            'Value' => 'es_nom_commun',
        );
        foreach ($config as $prop => $value) {
            $this->assertSame($value, $editWidget->config->{$prop}, $prop);
        }

        // Old Value relation
        $xmlStr = '
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
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertSame('ValueRelation', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\ValueRelationConfig::class, $editWidget->config);

        $config = array(
            'AllowMulti' => false,
            'AllowNull' => true,
            'FilterExpression' => '',
            'Key' => 'osm_id',
            'Layer' => 'tramway20150328114206278',
            'LayerName' => null,
            'LayerProviderName' => null,
            'OrderByValue' => true,
            'UseCompleter' => false,
            'Value' => 'test',
        );
        foreach ($config as $prop => $value) {
            $this->assertSame($value, $editWidget->config->{$prop}, $prop);
        }

        // FilterExpression with geometry
        $xmlStr = '
        <editWidget type="ValueRelation">
          <config>
            <Option type="Map">
              <Option value="false" type="bool" name="AllowMulti"/>
              <Option value="true" type="bool" name="AllowNull"/>
              <Option value="intersects(@current_geometry , $geometry)" type="QString" name="FilterExpression"/>
              <Option value="code" type="QString" name="Key"/>
              <Option value="form_edition_vr_list_934681e5_2397_4451_a9f4_37d292240173" type="QString" name="Layer"/>
              <Option value="form_edition_vr_list" type="QString" name="LayerName"/>
              <Option value="postgres" type="QString" name="LayerProviderName"/>
              <Option value="service=\'lizmapdb\' sslmode=prefer key=\'id\' estimatedmetadata=true srid=4326 type=Polygon checkPrimaryKeyUnicity=\'0\' table=&quot;tests_projects&quot;.&quot;form_edition_vr_list&quot; (geom) sql=" type="QString" name="LayerSource"/>
              <Option value="1" type="int" name="NofColumns"/>
              <Option value="false" type="bool" name="OrderByValue"/>
              <Option value="false" type="bool" name="UseCompleter"/>
              <Option value="label" type="QString" name="Value"/>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertSame('ValueRelation', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\ValueRelationConfig::class, $editWidget->config);

        $config = array(
            'AllowMulti' => false,
            'AllowNull' => true,
            'FilterExpression' => 'intersects(@current_geometry , $geometry)',
            'Key' => 'code',
            'Layer' => 'form_edition_vr_list_934681e5_2397_4451_a9f4_37d292240173',
            'LayerName' => 'form_edition_vr_list',
            'LayerProviderName' => 'postgres',
            'NofColumns' => 1,
            'OrderByValue' => false,
            'UseCompleter' => false,
            'Value' => 'label',
        );
        foreach ($config as $prop => $value) {
            $this->assertSame($value, $editWidget->config->{$prop}, $prop);
        }
    }

    public function testRelationReferenceFromXmlReader(): void
    {
        $xmlStr = '
        <editWidget type="RelationReference">
          <config>
            <Option type="Map">
              <Option type="bool" value="false" name="AllowAddFeatures"/>
              <Option type="bool" value="true" name="AllowNULL"/>
              <Option type="bool" value="false" name="MapIdentification"/>
              <Option type="bool" value="false" name="OrderByValue"/>
              <Option type="bool" value="false" name="ReadOnly"/>
              <Option type="QString" value="service=lizmap sslmode=prefer key=\'fid\' checkPrimaryKeyUnicity=\'0\' table=&quot;lizmap_data&quot;.&quot;risque&quot;" name="ReferencedLayerDataSource"/>
              <Option type="QString" value="risque_66cb8d43_86b7_4583_9217_f7ead54463c3" name="ReferencedLayerId"/>
              <Option type="QString" value="risque" name="ReferencedLayerName"/>
              <Option type="QString" value="postgres" name="ReferencedLayerProviderKey"/>
              <Option type="QString" value="tab_demand_risque_risque_66c_risque" name="Relation"/>
              <Option type="bool" value="false" name="ShowForm"/>
              <Option type="bool" value="true" name="ShowOpenFormButton"/>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('RelationReference', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\RelationReferenceConfig::class, $editWidget->config);

        $config = array(
            'AllowAddFeatures' => false,
            'AllowNULL' => true,
            'MapIdentification' => false,
            'OrderByValue' => false,
            'ReadOnly' => false,
            'ReferencedLayerId' => 'risque_66cb8d43_86b7_4583_9217_f7ead54463c3',
            'ReferencedLayerName' => 'risque',
            'ReferencedLayerProviderKey' => 'postgres',
            'Relation' => 'tab_demand_risque_risque_66c_risque',
            'ShowForm' => false,
            'ShowOpenFormButton' => true,
        );
        foreach ($config as $prop => $value) {
            $this->assertSame($value, $editWidget->config->{$prop}, $prop);
        }
    }

    public function testValueMapFromXmlReader(): void
    {
        $xmlStr = '
        <editWidget type="ValueMap">
          <config>
            <Option type="Map">
              <Option name="map" type="List">
                <Option type="Map">
                  <Option name="&lt;NULL>" type="QString" value="{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}"></Option>
                </Option>
                <Option type="Map">
                  <Option name="True" type="QString" value="true"></Option>
                </Option>
                <Option type="Map">
                  <Option name="False" type="QString" value="false"></Option>
                </Option>
              </Option>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('ValueMap', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\ValueMapConfig::class, $editWidget->config);
        $this->assertNotNull($editWidget->config->map);

        $config = array(
            '{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}' => '<NULL>',
            'true' => 'True',
            'false' => 'False',
        );
        foreach ($config as $prop => $value) {
            $this->assertSame($value, $editWidget->config->map[$prop], $prop);
        }

        $xmlStr = '
        <editWidget type="ValueMap">
          <config>
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
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('ValueMap', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\ValueMapConfig::class, $editWidget->config);
        $this->assertNotNull($editWidget->config->map);

        $config = array(
            '{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}' => 'No Zone',
            'A' => 'Zone A',
            'B' => 'Zone B',
        );
        foreach ($config as $prop => $value) {
            $this->assertSame($value, $editWidget->config->map[$prop], $prop);
        }

        $xmlStr = '
        <editWidget type="ValueMap">
          <config>
            <Option type="Map">
              <Option type="List" name="map">
                <Option value="A" type="QString" name="Zone A"/>
                <Option value="B" type="QString" name="Zone B"/>
                <Option value="{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}" type="QString" name="No Zone"/>
              </Option>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('ValueMap', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\ValueMapConfig::class, $editWidget->config);
        $this->assertNotNull($editWidget->config->map);

        $config = array(
            '{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}' => 'No Zone',
            'A' => 'Zone A',
            'B' => 'Zone B',
        );
        foreach ($config as $prop => $value) {
            $this->assertSame($value, $editWidget->config->map[$prop], $prop);
        }

        $xmlStr = '
        <editWidget type="ValueMap">
          <config>
            <Option type="Map">
              <Option name="map" type="List">
                <Option type="Map">
                  <Option name="one" type="QString" value="1"></Option>
                </Option>
                <Option type="Map">
                  <Option name="two" type="QString" value="2"></Option>
                </Option>
                <Option type="Map">
                  <Option name="three" type="QString" value="3"></Option>
                </Option>
              </Option>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('ValueMap', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\ValueMapConfig::class, $editWidget->config);
        $this->assertNotNull($editWidget->config->map);

        $config = array(
            '1' => 'one',
            '2' => 'two',
            '3' => 'three',
        );
        foreach ($config as $prop => $value) {
            $this->assertSame($value, $editWidget->config->map[$prop], $prop);
        }
    }

    public function testClassificationFromXmlReader(): void
    {
        $xmlStr = '
        <editWidget type="Classification">
          <config>
            <Option/>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('Classification', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        // Empty config
        $this->assertCount(0, $editWidget->config);
    }

    public function testExternalResourceFromXmlReader(): void
    {
        // Default
        $xmlStr = '
        <editWidget type="ExternalResource">
          <config>
            <Option type="Map">
              <Option type="int" name="DocumentViewer" value="0"/>
              <Option type="int" name="DocumentViewerHeight" value="0"/>
              <Option type="int" name="DocumentViewerWidth" value="0"/>
              <Option type="bool" name="FileWidget" value="true"/>
              <Option type="bool" name="FileWidgetButton" value="true"/>
              <Option type="QString" name="FileWidgetFilter" value=""/>
              <Option type="Map" name="PropertyCollection">
                <Option type="QString" name="name" value=""/>
                <Option type="invalid" name="properties"/>
                <Option type="QString" name="type" value="collection"/>
              </Option>
              <Option type="int" name="RelativeStorage" value="0"/>
              <Option type="QString" name="StorageAuthConfigId" value=""/>
              <Option type="int" name="StorageMode" value="0"/>
              <Option type="QString" name="StorageType" value=""/>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('ExternalResource', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\ExternalResourceConfig::class, $editWidget->config);

        $config = array(
            'DocumentViewer' => 0,
            'DocumentViewerHeight' => 0,
            'DocumentViewerWidth' => 0,
            'FileWidget' => true,
            'FileWidgetButton' => true,
            'FileWidgetFilter' => '',
            'UseLink' => false,
            'FullUrl' => false,
            'PropertyCollection' => array(
                'name' => '',
                'properties' => null,
                'type' => 'collection',
            ),
            'RelativeStorage' => 0,
            'StorageAuthConfigId' => '',
            'StorageType' => '',
            'StorageMode' => 0,
            'DefaultRoot' => '',
        );
        foreach ($config as $prop => $value) {
            $this->assertSame($value, $editWidget->config->{$prop}, $prop);
        }

        // Image
        $xmlStr = '
        <editWidget type="ExternalResource">
          <config>
            <Option type="Map">
              <Option value="1" type="QString" name="DocumentViewer"/>
              <Option value="400" type="QString" name="DocumentViewerHeight"/>
              <Option value="400" type="QString" name="DocumentViewerWidth"/>
              <Option value="1" type="QString" name="FileWidget"/>
              <Option value="1" type="QString" name="FileWidgetButton"/>
              <Option value="Images (*.gif *.jpeg *.jpg *.png)" type="QString" name="FileWidgetFilter"/>
              <Option value="0" type="QString" name="StorageMode"/>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('ExternalResource', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\ExternalResourceConfig::class, $editWidget->config);

        $config = array(
            'DocumentViewer' => 1,
            'DocumentViewerHeight' => 400,
            'DocumentViewerWidth' => 400,
            'FileWidget' => true,
            'FileWidgetButton' => true,
            'FileWidgetFilter' => 'Images (*.gif *.jpeg *.jpg *.png)',
            'UseLink' => false,
            'FullUrl' => false,
            'PropertyCollection' => array(),
            'RelativeStorage' => 0,
            'StorageAuthConfigId' => '',
            'StorageType' => '',
            'StorageMode' => 0,
            'DefaultRoot' => '',
        );
        foreach ($config as $prop => $value) {
            $this->assertSame($value, $editWidget->config->{$prop}, $prop);
        }

        // WebDAV
        $xmlStr = '
        <editWidget type="ExternalResource">
          <config>
            <Option type="Map">
              <Option type="int" name="DocumentViewer" value="1"/>
              <Option type="int" name="DocumentViewerHeight" value="0"/>
              <Option type="int" name="DocumentViewerWidth" value="0"/>
              <Option type="bool" name="FileWidget" value="true"/>
              <Option type="bool" name="FileWidgetButton" value="true"/>
              <Option type="QString" name="FileWidgetFilter" value=""/>
              <Option type="Map" name="PropertyCollection">
                <Option type="QString" name="name" value=""/>
                <Option type="Map" name="properties">
                  <Option type="Map" name="storageUrl">
                    <Option type="bool" name="active" value="true"/>
                    <Option type="QString" name="expression" value="\'http://webdav/shapeData/\'||file_name(@selected_file_path)"/>
                    <Option type="int" name="type" value="3"/>
                  </Option>
                </Option>
                <Option type="QString" name="type" value="collection"/>
              </Option>
              <Option type="int" name="RelativeStorage" value="0"/>
              <Option type="QString" name="StorageAuthConfigId" value="k6k7lv8"/>
              <Option type="int" name="StorageMode" value="0"/>
              <Option type="QString" name="StorageType" value="WebDAV"/>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('ExternalResource', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\ExternalResourceConfig::class, $editWidget->config);

        $config = array(
            'DocumentViewer' => 1,
            'DocumentViewerHeight' => 0,
            'DocumentViewerWidth' => 0,
            'FileWidget' => true,
            'FileWidgetButton' => true,
            'FileWidgetFilter' => '',
            'UseLink' => false,
            'FullUrl' => false,
            'RelativeStorage' => 0,
            'StorageAuthConfigId' => 'k6k7lv8',
            'StorageType' => 'WebDAV',
            'StorageMode' => 0,
            'DefaultRoot' => '',
        );
        foreach ($config as $prop => $value) {
            $this->assertSame($value, $editWidget->config->{$prop}, $prop);
        }

        $this->assertNotNull($editWidget->config->PropertyCollection);
        $propertyCollection = array(
            'name' => '',
            'properties' => array(
                'storageUrl' => array(
                    'active' => true,
                    'expression' => '\'http://webdav/shapeData/\'||file_name(@selected_file_path)',
                    'type' => 3,
                ),
            ),
            'type' => 'collection',
        );
        foreach ($propertyCollection as $prop => $value) {
            $this->assertSame($value, $editWidget->config->PropertyCollection[$prop], $prop);
        }

        // DefaultRoot
        $xmlStr = '
          <editWidget type="ExternalResource">
            <config>
              <Option type="Map">
                <Option name="DefaultRoot" type="QString" value="../media/specific_media_folder"></Option>
                <Option name="DocumentViewer" type="int" value="1"></Option>
                <Option name="DocumentViewerHeight" type="int" value="0"></Option>
                <Option name="DocumentViewerWidth" type="int" value="0"></Option>
                <Option name="FileWidget" type="bool" value="true"></Option>
                <Option name="FileWidgetButton" type="bool" value="true"></Option>
                <Option name="FileWidgetFilter" type="QString" value=""></Option>
                <Option name="PropertyCollection" type="Map">
                  <Option name="name" type="QString" value=""></Option>
                  <Option name="properties" type="invalid"></Option>
                  <Option name="type" type="QString" value="collection"></Option>
                </Option>
                <Option name="RelativeStorage" type="int" value="1"></Option>
                <Option name="StorageAuthConfigId" type="QString" value=""></Option>
                <Option name="StorageMode" type="int" value="0"></Option>
                <Option name="StorageType" type="QString" value=""></Option>
              </Option>
            </config>
          </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('ExternalResource', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\ExternalResourceConfig::class, $editWidget->config);

        $config = array(
            'DocumentViewer' => 1,
            'DocumentViewerHeight' => 0,
            'DocumentViewerWidth' => 0,
            'FileWidget' => true,
            'FileWidgetButton' => true,
            'FileWidgetFilter' => '',
            'UseLink' => false,
            'FullUrl' => false,
            'PropertyCollection' => array(
                'name' => '',
                'properties' => null,
                'type' => 'collection',
            ),
            'RelativeStorage' => 1,
            'StorageAuthConfigId' => '',
            'StorageType' => '',
            'StorageMode' => 0,
            'DefaultRoot' => '../media/specific_media_folder',
        );
        foreach ($config as $prop => $value) {
            $this->assertSame($value, $editWidget->config->{$prop}, $prop);
        }

        // Expression root path
        $xmlStr = '
          <editWidget type="ExternalResource">
            <config>
              <Option type="Map">
                <Option name="DocumentViewer" type="int" value="1"></Option>
                <Option name="DocumentViewerHeight" type="int" value="0"></Option>
                <Option name="DocumentViewerWidth" type="int" value="0"></Option>
                <Option name="FileWidget" type="bool" value="true"></Option>
                <Option name="FileWidgetButton" type="bool" value="true"></Option>
                <Option name="FileWidgetFilter" type="QString" value=""></Option>
                <Option name="PropertyCollection" type="Map">
                  <Option name="name" type="QString" value=""></Option>
                  <Option name="properties" type="Map">
                    <Option name="propertyRootPath" type="Map">
                      <Option name="active" type="bool" value="true"></Option>
                      <Option name="expression" type="QString" value="concat(&#xA;&#x9;\'media/expression_root_folder/\',&#xA;&#x9;CASE&#xA;&#x9;&#x9;WHEN lower(trim(to_string(current_value(\'feature_code\')))) IN (\'\', \'null\') OR current_value(\'feature_code\') IS NULL &#xA;&#x9;&#x9;&#x9;THEN \'0\'&#xA;&#x9;&#x9;ELSE trim(to_string(current_value(\'feature_code\')))&#xA;&#x9;END,&#xA;&#x9;\'/\'&#xA;)"></Option>
                      <Option name="type" type="int" value="3"></Option>
                    </Option>
                  </Option>
                  <Option name="type" type="QString" value="collection"></Option>
                </Option>
                <Option name="RelativeStorage" type="int" value="1"></Option>
                <Option name="StorageAuthConfigId" type="QString" value=""></Option>
                <Option name="StorageMode" type="int" value="0"></Option>
                <Option name="StorageType" type="QString" value=""></Option>
              </Option>
            </config>
          </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('ExternalResource', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\ExternalResourceConfig::class, $editWidget->config);

        $config = array(
            'DocumentViewer' => 1,
            'DocumentViewerHeight' => 0,
            'DocumentViewerWidth' => 0,
            'FileWidget' => true,
            'FileWidgetButton' => true,
            'FileWidgetFilter' => '',
            'UseLink' => false,
            'FullUrl' => false,
            'RelativeStorage' => 1,
            'StorageAuthConfigId' => '',
            'StorageType' => '',
            'StorageMode' => 0,
            'DefaultRoot' => '',
        );
        foreach ($config as $prop => $value) {
            $this->assertSame($value, $editWidget->config->{$prop}, $prop);
        }

        $this->assertNotNull($editWidget->config->PropertyCollection);
        $propertyCollection = array(
            'name' => '',
            'properties' => array(
                'propertyRootPath' => array(
                    'active' => true,
                    'expression' => 'concat(
	\'media/expression_root_folder/\',
	CASE
		WHEN lower(trim(to_string(current_value(\'feature_code\')))) IN (\'\', \'null\') OR current_value(\'feature_code\') IS NULL '.'
			THEN \'0\'
		ELSE trim(to_string(current_value(\'feature_code\')))
	END,
	\'/\'
)',
                    'type' => 3,
                ),
            ),
            'type' => 'collection',
        );
        foreach ($propertyCollection as $prop => $value) {
            $this->assertSame($value, $editWidget->config->PropertyCollection[$prop], $prop);
        }
    }

    public function testUniqueValuesFromXmlReader(): void
    {
        $xmlStr = '
        <editWidget type="UniqueValues">
          <config>
            <Option type="Map">
              <Option value="1" type="QString" name="Editable"/>
            </Option>
          </config>
        </editWidget>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $editWidget = VectorLayerEditWidget::fromXmlReader($oXml);

        $this->assertEquals('UniqueValues', $editWidget->type);
        $this->assertNotNull($editWidget->config);
        $this->assertInstanceOf(EditWidget\UniqueValuesConfig::class, $editWidget->config);

        $config = array(
            'Editable' => true,
        );
        foreach ($config as $prop => $value) {
            $this->assertSame($value, $editWidget->config->{$prop}, $prop);
        }
    }
}
