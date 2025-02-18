<?php
use PHPUnit\Framework\TestCase;
use Lizmap\Project;

/**
 * @internal
 * @coversNothing
 */
class ProjectMainDataTest extends TestCase
{
    public function testConstruct(): void
    {
        $context = new ContextForTests();

        $file = __DIR__.'/Ressources/montpellier.qgs';
        $p = new Project\ProjectMainData('tests', 'montpellier', $file, 30200, $context);
        $this->assertEquals('tests', $p->getRepository());
        $this->assertEquals('montpellier', $p->getId());
        $this->assertEquals('Montpellier - Transports', $p->getTitle());
        $this->assertStringStartsWith('Demo project with bus and tramway lines in Montpellier', $p->getAbstract());
        $this->assertEquals('', $p->getKeywordList());
        $this->assertEquals('USER:100000', $p->getProj());
        $this->assertEquals('417006.6137376, 5394910.340903, 447158.04891101, 5414844.9948054', $p->getBbox());
        $this->assertFalse($p->needsUpdateError());
        $this->assertTrue($p->getAcl());
        $this->assertFalse($p->getHidden());
        //$this->assertEquals(array(), $p->getData());

        $file = __DIR__.'/Ressources/montpellier_intranet.qgs';
        $p = new Project\ProjectMainData('tests', 'montpellier_intranet', $file, 30200, $context);
        $this->assertEquals('tests', $p->getRepository());
        $this->assertEquals('montpellier_intranet', $p->getId());
        $this->assertEquals('Montpellier - Intranet map example', $p->getTitle());
        $this->assertStringStartsWith('Some data from OpenDataMontpellier shown on a map', $p->getAbstract());
        $this->assertEquals('', $p->getKeywordList());
        $this->assertEquals('EPSG:4326', $p->getProj());
        $this->assertEquals('3.78300108, 43.54854151, 3.97065725, 43.67333749', $p->getBbox());
        $this->assertFalse($p->needsUpdateError());
        $this->assertTrue($p->getAcl());
        $this->assertFalse($p->getHidden());

        $file = __DIR__.'/Ressources/events.qgs';
        $p = new Project\ProjectMainData('tests', 'events', $file, 30800, $context);
        $this->assertEquals('tests', $p->getRepository());
        $this->assertEquals('events', $p->getId());
        $this->assertEquals('Touristic events around Montpellier, France', $p->getTitle());
        $this->assertEquals('', $p->getAbstract());
        $this->assertEquals('', $p->getKeywordList());
        $this->assertEquals('EPSG:4242', $p->getProj());
        $this->assertEquals('390483.99668047, 5375009.91444, 477899.47320636, 5436768.5630521', $p->getBbox());
        $this->assertTrue($p->needsUpdateError());
        $this->assertTrue($p->getAcl());
        $this->assertFalse($p->getHidden());

        $file = __DIR__.'/Ressources/embed_parent.qgs';
        $p = new Project\ProjectMainData('tests', 'embed_parent', $file, 30600, $context);
        $this->assertEquals('tests', $p->getRepository());
        $this->assertEquals('embed_parent', $p->getId());
        $this->assertEquals('embed_parent', $p->getTitle());
        $this->assertEquals('', $p->getAbstract());
        $this->assertEquals('', $p->getKeywordList());
        $this->assertEquals('EPSG:4326', $p->getProj());
        $this->assertEquals('3.72495035999999979, 43.54176487699999853, 4.03651796000000029, 43.68444261700000197', $p->getBbox());
        $this->assertFalse($p->needsUpdateError());
        $this->assertTrue($p->getAcl());
        $this->assertFalse($p->getHidden());

        $file = __DIR__.'/../../../qgis-projects/tests/test_tags_nature_flower.qgs';
        $p = new Project\ProjectMainData('tests', 'test_tags_nature_flower', $file, 30600, $context);
        $this->assertEquals('tests', $p->getRepository());
        $this->assertEquals('test_tags_nature_flower', $p->getId());
        $this->assertEquals('Test tags: nature, flower', $p->getTitle());
        $this->assertEquals('This is an abstract', $p->getAbstract());
        $this->assertEquals('nature, flower', $p->getKeywordList());
        $this->assertEquals('EPSG:4326', $p->getProj());
        $this->assertEquals('-1.2459627329192546, -1.0, 1.2459627329192546, 1.0', $p->getBbox());
        $this->assertFalse($p->needsUpdateError());
        $this->assertTrue($p->getAcl());
        $this->assertFalse($p->getHidden());
    }
}
