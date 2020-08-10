<?php

class lizmapLogConfigTest extends PHPUnit_Framework_TestCase
{
    public function getTestModifyData()
    {
        $data1 = array(
            'general' => array(
                'active' => true,
                'profile' => 'lizlog'
            )
        );
        $data2 = array(
            'general' => array(
                'active' => true,
                'profile' => 'lizlog',
                'notExistingProp' => 'test'
            )
        );
        $data3 = array();
        $data4 = array('general' => array(
            'notExistingProp' => true
            )
        );
        return array(
            array($data1, $data1['general'], true),
            array($data1, null, false),
            array($data3, $data1['general'], true),
            array($data1, $data2['general'], true),
            array($data3, $data4, false),
            array($data4, $data3, false),
        );
    }

    /**
     * @dataProvider getTestModifyData
     */

    public function testModify($data, $newData, $expectedReturnValue)
    {
        $testLizmapLogConfig = new lizmapLogConfig($data);
        $this->assertEquals($expectedReturnValue, $testLizmapLogConfig->modify($newData));
        unset($testLizmapLogConfig);
    }

    public function getTestSaveData()
    {
        $data = array(
            'general' => array(
                'active' => true,
                'profile' => 'lizlog'
            )
        );
        $expectedData = array(
            'general' => array(
                'active' => false,
                'profile' => 'lizlog'
            )
        );
        $expectedData2 = array(
            'general' => array(
                'profile' => 'lizlog'            )
        );
        return array(
            array($data, $data, null, null, false),
            array($data, $expectedData, 'active', false, false),
            array($data, $expectedData2, 'active', '', false),
            array($data, $expectedData2, 'active', null, false)
        );
    }

    /**
     * @dataProvider getTestSaveData
     */

    public function testSave($data, $expectedData, $changedProp, $changedValue, $expectedReturnValue)
    {
        $iniFile = __DIR__.'/../tmp/logConfig.ini.php';
        file_put_contents($iniFile, '');

        $ini = new jIniFileModifier($iniFile);
        $testLizmapLogConfig = new lizmapLogConfig($data);
        if ($changedProp) {
            $data['general'][$changedProp] = $changedValue;
        }
        $testLizmapLogConfig->modify($data['general']);
        $this->assertEquals($expectedReturnValue, $testLizmapLogConfig->save($ini));
        $this->assertEquals($expectedData['general'], $ini->getValues('general'));
        unset($ini);
        unset($testLizmapLogConfig);
        unlink($iniFile);
    }
}
