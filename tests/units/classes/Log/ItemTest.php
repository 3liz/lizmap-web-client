<?php

use Lizmap\Logger as Log;
use PHPUnit\Framework\TestCase;

class ItemTest extends TestCase
{
    protected $context = null;

    public function setUp()
    {
        if (!$this->context) {
            $this->context = new testContext();
        }
    }

    public function getConstructData()
    {
        $data1 = array(
            'label' => 'test',
            'logCounter' => 'counter',
            'logDetail' => 'detail',
            'logIp' => 'Ip',
            'logEmail' => 'Email',
            'unknownProp' => 'whatever'
        );
        $data2 = array(
            'label' => 'test',
            'logCounter' => null
        );
        return array(
            array($data1),
            array($data2),
            array(array()),
        );
    }

    /**
     * @dataProvider getConstructData
     */
    public function testConstruct($config)
    {
        $props = Log\Item::getSProperties();
        $item = new Log\Item('key', $config, $this->context);
        foreach ($props as $prop) {
            if (isset($config[$prop])) {
                $this->assertEquals($config[$prop], $item->getData($prop));
            } else {
                $this->assertNull($item->getData($prop));
            }
        }
    }

    public function getLogDetailData()
    {
        $data1 = array(
            'key' => 'key',
            'user' => 'user',
            'content' => 'content',
            'repository' => 'repository',
            'project' => 'project',
            'ip' => 'ip',
            'email' => 'email',
        );
        $data2 = array(
            'key' => '1234',
            'unknownProp' => 'test'
        );
        return array(
            array($data1),
            array($data1),
            array(array()),
            array(null),
        );
    }

    /**
     * @dataProvider getLogDetailData
     */
    public function testInsertLogDetail($data)
    {
        $context = new TestContext();
        $context->setResult(array(
            'getDao' => $context,
            'createDaoRecord' => (object)array(
                'key' => null,
                'user' => null,
                'content' => null,
                'repository' => null,
                'project' => null,
                'ip' => null,
                'email' => null,
            )
        ));
        $item = new Log\Item('test', array(), $context);
        $item->insertLogDetail($data);
        if (!$data) {
            return ;
        }
        foreach ($data as $key => $value) {
            if (in_array($key, $item->getRecordKeys())) {
                $this->assertEquals($value, $context->getResult()['createDaoRecord']->$key);
            }
        }
    }
}
