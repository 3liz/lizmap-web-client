<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;

class Person extends Qgis\BaseQgisObject
{
    /** @var Array<string> The instance properties*/
    protected $properties = array(
        'name',
        'parent',
        'children',
    );

    /** @var Array<string> The not null properties */
    protected $mandatoryProperties = array(
        'name',
    );
}

/**
 * @internal
 * @coversNothing
 */
class BaseQgisObjectTest extends TestCase
{
    public function testConstruct(): void
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('$data has to contain `name` keys! Missing keys: name!');
        $p1 = new Person(array());
    }

    public function testGetData(): void
    {
        $p1Data = array('name' => 'Foo');
        $p1 = new Person($p1Data);

        $this->assertEquals($p1Data, $p1->getData());

        $p2 = new Person(array('name' => 'Bar', 'parent' => $p1));
        $p2Data = array('name' => 'Bar', 'parent' => $p1Data);

        $this->assertEquals($p2Data, $p2->getData());

        $p3 = new Person(array('name' => 'FooBar', 'children' => array($p1)));
        $p3Data = array('name' => 'FooBar', 'children' => array($p1Data));

        $this->assertEquals($p3Data, $p3->getData());
    }
}
