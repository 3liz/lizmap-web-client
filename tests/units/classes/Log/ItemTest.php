<?php

use Lizmap\Logger as Log;
use PHPUnit\Framework\TestCase;

class ItemTest extends TestCase
{
    protected $context = null;

    public function setUp() : void
    {
        if (!$this->context) {
            $this->context = new ContextForTests();
        }
    }

    public static function getConstructData()
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
    public function testConstruct($config): void
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

    public static function getLogDetailData()
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
    public function testInsertLogDetail($data): void
    {
        $context = new ContextForTests();
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
        $resultRecord = $context->getResult()['createDaoRecord'];
        if (!$data) {
            $this->assertNull($resultRecord->key);
            $this->assertNull($resultRecord->user);
            $this->assertNull($resultRecord->content);
            $this->assertNull($resultRecord->repository);
            $this->assertNull($resultRecord->project);
            $this->assertNull($resultRecord->ip);
            $this->assertNull($resultRecord->email);
            return ;
        }


        foreach ($data as $key => $value) {
            if (in_array($key, $item->getRecordKeys())) {
                $this->assertEquals($value, $resultRecord->$key);
            }
            else {
                $this->assertFalse(isset($resultRecord->$key));
            }
        }
    }
}
