<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class VectorLayerConstraintTest extends TestCase
{
    public function testNoConstraint(): void
    {
        $xmlStr = '<constraint field="name" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $constraint = Qgis\Layer\VectorLayerConstraint::fromXmlReader($oXml);

        $this->assertInstanceOf(Qgis\Layer\VectorLayerConstraint::class, $constraint);
        $this->assertEquals('name', $constraint->field);
        $this->assertEquals(0, $constraint->constraints);
        $this->assertFalse($constraint->notnull_strength);
        $this->assertFalse($constraint->unique_strength);
        $this->assertFalse($constraint->exp_strength);
    }

    public function testNotNull(): void
    {
        $xmlStr = '<constraint field="pkuid" notnull_strength="1" constraints="3" unique_strength="1" exp_strength="0"/>';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $constraint = Qgis\Layer\VectorLayerConstraint::fromXmlReader($oXml);

        $this->assertInstanceOf(Qgis\Layer\VectorLayerConstraint::class, $constraint);
        $this->assertEquals('pkuid', $constraint->field);
        $this->assertEquals(3, $constraint->constraints);
        $this->assertTrue($constraint->notnull_strength);
        $this->assertTrue($constraint->unique_strength);
        $this->assertFalse($constraint->exp_strength);
    }

    public function testEnforceNotNull(): void
    {
        $xmlStr = '<constraint constraints="1" unique_strength="0" field="test_not_null_only" notnull_strength="2" exp_strength="0"/>';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $constraint = Qgis\Layer\VectorLayerConstraint::fromXmlReader($oXml);

        $this->assertInstanceOf(Qgis\Layer\VectorLayerConstraint::class, $constraint);
        $this->assertEquals('test_not_null_only', $constraint->field);
        $this->assertEquals(1, $constraint->constraints);
        $this->assertTrue($constraint->notnull_strength);
        $this->assertFalse($constraint->unique_strength);
        $this->assertFalse($constraint->exp_strength);
    }
}
