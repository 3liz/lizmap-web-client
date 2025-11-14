<?php

use Lizmap\Project\Qgis;
use PHPUnit\Framework\TestCase;

class Person extends Qgis\BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'name',
        'parent',
        'children',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'name',
    );
}

class Car extends Qgis\BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'color',
    );

    /** @var array The default values */
    protected $defaultValues = array(
        'color' => 'white',
    );
}

/**
 * @internal
 *
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

        $this->assertSame($p1Data, $p1->getData());

        $p2 = new Person(array('name' => 'Bar', 'parent' => $p1));
        $p2Data = array('name' => 'Bar', 'parent' => $p1Data);

        $this->assertSame($p2Data, $p2->getData());

        $p3 = new Person(array('name' => 'FooBar', 'children' => array($p1)));
        $p3Data = array('name' => 'FooBar', 'children' => array($p1Data));

        $this->assertSame($p3Data, $p3->getData());
    }

    public function testDefaultValues(): void
    {
        $defaultData = array(
            'color' => 'white',
        );
        $blueData = array(
            'color' => 'blue',
        );
        $nullData = array(
            'color' => null,
        );

        // empty data
        $c1 = new Car(array());
        $this->assertSame($defaultData, $c1->getData());
        $this->assertNotSame($blueData, $c1->getData());
        $this->assertNotSame($nullData, $c1->getData());

        // null data
        $c2 = new Car($nullData);
        $this->assertSame($defaultData, $c2->getData());
        $this->assertNotSame($blueData, $c2->getData());
        $this->assertNotSame($nullData, $c2->getData());
        $this->assertSame($c1->getData(), $c2->getData());

        // blue data
        $c3 = new Car($blueData);
        $this->assertSame($blueData, $c3->getData());
        $this->assertNotSame($defaultData, $c3->getData());
        $this->assertNotSame($nullData, $c3->getData());
        $this->assertNotSame($c1->getData(), $c3->getData());
    }
}
