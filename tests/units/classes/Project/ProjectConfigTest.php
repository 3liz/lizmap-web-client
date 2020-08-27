<?php

use Lizmap\Project;

class projectConfigTest extends PHPUnit_Framework_TestCase
{

    public function getConstructData()
    {
        $file = __DIR__.'/Ressources/events.qgs.cfg';

        return array(
            array(null, json_decode(file_get_contents($file))),
            array(array('cfg' => json_decode(file_get_contents($file))), json_decode(file_get_contents($file)))
        );
    }

    /**
     * @dataProvider getConstructData
     */
    public function testConstruct($data, $expectedData)
    {
        $file = __DIR__.'/Ressources/events.qgs.cfg';
        $testCfg = new Project\ProjectConfig($file, $data);
        $this->assertEquals($expectedData, $testCfg->getData());
    }
}