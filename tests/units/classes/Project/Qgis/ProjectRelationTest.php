<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class ProjectRelationTest extends TestCase
{
    public function testFromXmlReader(): void
    {
        $xmlStr = '
        <relation id="SousQuartiers20160121124316563_QUARTMNO_VilleMTP_MTP_Quartiers_2011_432620130116112610876_QUARTMNO" referencingLayer="SousQuartiers20160121124316563" referencedLayer="VilleMTP_MTP_Quartiers_2011_432620130116112610876" strength="Association" name="Subdistricts by district">
          <fieldRef referencingField="QUARTMNO" referencedField="QUARTMNO"/>
        </relation>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $relation = Qgis\ProjectRelation::fromXmlReader($oXml);

        $this->assertEquals('SousQuartiers20160121124316563_QUARTMNO_VilleMTP_MTP_Quartiers_2011_432620130116112610876_QUARTMNO', $relation->id);
        $this->assertEquals('Subdistricts by district', $relation->name);
        $this->assertEquals('SousQuartiers20160121124316563', $relation->referencingLayer);
        $this->assertEquals('QUARTMNO', $relation->referencingField);
        $this->assertEquals('VilleMTP_MTP_Quartiers_2011_432620130116112610876', $relation->referencedLayer);
        $this->assertEquals('QUARTMNO', $relation->referencedField);
        $this->assertEquals('Association', $relation->strength);
    }
}
