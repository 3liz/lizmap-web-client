<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class VectorLayerConstraintExpressionTest extends TestCase
{
    public function testEmpty(): void
    {
        $xmlStr ='<constraint desc="" exp="" field="id"></constraint>';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $constraint = Qgis\Layer\VectorLayerConstraintExpression::fromXmlReader($oXml);

        $this->assertInstanceOf(Qgis\Layer\VectorLayerConstraintExpression::class, $constraint);
        $this->assertEquals('id', $constraint->field);
        $this->assertEquals('', $constraint->exp);
        $this->assertEquals('', $constraint->desc);
    }

    public function testExpression(): void
    {
        $xmlStr ='<constraint desc="Web site URL must start with \'http\'" exp="left( &quot;website&quot;, 4) = \'http\'" field="website"></constraint>';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $constraint = Qgis\Layer\VectorLayerConstraintExpression::fromXmlReader($oXml);

        $this->assertInstanceOf(Qgis\Layer\VectorLayerConstraintExpression::class, $constraint);
        $this->assertEquals('website', $constraint->field);
        $this->assertEquals('left( "website", 4) = \'http\'', $constraint->exp);
        $this->assertEquals('Web site URL must start with \'http\'', $constraint->desc);
    }
}
