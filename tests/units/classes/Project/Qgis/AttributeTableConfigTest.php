<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class AttributeTableConfigTest extends TestCase
{
    public function testFromXmlReader(): void
    {
        // Simple default
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
        $config = Qgis\Layer\AttributeTableConfig::fromXmlReader($oXml);

        $this->assertEquals('"field_communes"', $config->sortExpression);
        $this->assertEquals(1, $config->sortOrder);
        $this->assertCount(15, $config->columns);

        $columns = array(
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
        foreach($columns as $idx => $data) {
            foreach($data as $prop => $value) {
                $this->assertEquals($value, $config->columns[$idx]->$prop, $idx.' '.$prop);
            }
        }

        $configKeyArray = $config->toKeyArray();
        $this->assertTrue(is_array($configKeyArray));
        $this->assertArrayHasKey('columns', $configKeyArray);
        $this->assertCount(9, $configKeyArray['columns']);
        $columns = array(
            array(
                'index' => 0,
                'type' => 'field',
                'name' => 'nid',
            ),
            array(
                'index' => 1,
                'type' => 'field',
                'name' => 'titre',
            ),
            array(
                'index' => 4,
                'type' => 'field',
                'name' => 'field_date',
            ),
            array(
                'index' => 6,
                'type' => 'field',
                'name' => 'field_communes',
            ),
            array(
                'index' => 7,
                'type' => 'field',
                'name' => 'field_lieu',
            ),
            array(
                'index' => 8,
                'type' => 'field',
                'name' => 'field_access',
            ),
            array(
                'index' => 9,
                'type' => 'field',
                'name' => 'field_thematique',
            ),
            array(
                'index' => 12,
                'type' => 'field',
                'name' => 'url',
            ),
            array(
                'index' => 14,
                'type' => 'field',
                'name' => 'fid',
            ),
        );
        foreach($columns as $idx => $data) {
            foreach($data as $prop => $value) {
                $this->assertEquals($value, $configKeyArray['columns'][$idx][$prop], $idx.' '.$prop);
            }
        }
    }
}
