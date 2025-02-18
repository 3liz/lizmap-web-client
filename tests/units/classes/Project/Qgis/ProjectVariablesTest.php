<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class ProjectVariablesTest extends TestCase
{
    public function testConstruct(): void
    {
        $data = array(
            'variableNames' => array('lizmap_user', 'lizmap_user_groups'),
            'variableValues' => array('lizmap', 'lizmap-group'),
        );

        $variables = new Qgis\ProjectVariables($data);
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $variables->$prop);
        }
        $this->assertTrue($variables->hasVariableName('lizmap_user'));
        $this->assertEquals('lizmap', $variables->getVariableValue('lizmap_user'));
    }

    public function testFromXmlReader(): void
    {
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
        $variables = Qgis\ProjectVariables::fromXmlReader($oXml);

        $data = array(
            'variableNames' => array('lizmap_user', 'lizmap_user_groups'),
            'variableValues' => array('lizmap', 'lizmap-group'),
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $variables->$prop, $prop);
        }
        $this->assertTrue($variables->hasVariableName('lizmap_user'));
        $this->assertEquals('lizmap', $variables->getVariableValue('lizmap_user'));

        $xmlStr = '
        <Variables>
          <variableNames type="QStringList"/>
          <variableValues type="QStringList"/>
        </Variables>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $variables = Qgis\ProjectVariables::fromXmlReader($oXml);

        $data = array(
            'variableNames' => array(),
            'variableValues' => array(),
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $variables->$prop, $prop);
        }
        $this->assertFalse($variables->hasVariableName('lizmap_user'));
    }

    public function testGetVariablesAsKeyArray(): void
    {
        $data = array(
            'variableNames' => array('lizmap_user', 'lizmap_user_groups'),
            'variableValues' => array('lizmap', 'lizmap-group'),
        );

        $variables = new Qgis\ProjectVariables($data);
        $variables = $variables->getVariablesAsKeyArray();
        foreach($data['variableNames'] as $varIndex => $prop) {
            $this->assertArrayHasKey($prop, $variables);
            $this->assertEquals($data['variableValues'][$varIndex], $variables[$prop], $prop);
        }
    }
}
