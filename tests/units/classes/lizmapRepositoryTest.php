<?php

class lizmapRepositoryTest extends PHPUnit_Framework_TestCase
{
    public function getTestGetPathData()
    {
        $repo1 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => realpath(__DIR__.'/../tmp/'),
                'allowUserDefinedThemes' => '1'
            )
        );
        $repo2 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => realpath(__DIR__.'/../tmp').'/../tmp/',
                'allowUserDefinedThemes' => '1'
            )
        );
        $repo3 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => '/does/not/exists',
                'allowUserDefinedThemes' => '1'
            )
        );
        $repo4 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => 'C:/test/Windows',
                'allowUserDefinedThemes' => '1'
            )
        );
        $repo5 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => '',
                'allowUserDefinedThemes' => '1'
            )
        );
        print_r(realpath(__DIR__.'/../tmp/'));
        return array(
            array($repo1, 'test', realpath(__DIR__.'/../tmp/config'), $repo1['repository:test']['path'].'/'),
            array($repo2, 'test', realpath(__DIR__.'/../tmp/config'), realpath($repo2['repository:test']['path']).'/'),
            array($repo3, 'test', realpath(__DIR__.'/../tmp/config'), false),
            array($repo4, 'test', realpath(__DIR__.'/../tmp/config'), false),
            array($repo5, 'test', realpath(__DIR__.'/../tmp/config'), false)
        );
    }

    /**
     * @dataProvider getTestGetPathData
     */

    public function testGetPath($repo, $key, $varPath, $expectedPath)
    {
        $services = new lizmapServices($repo, (object)array(), true, $varPath);
        $rep = $services->getLizmapRepository($key);
        $this->assertEquals($expectedPath, $rep->getPath());
        unset($services);
        unset($rep);
    }

    public function getUpdateData()
    {
        $data1 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => '/path/to/test',
                'allowUserDefinedThemes' => '1'
            )
        );
        $data2 = array(
            'repository:test' => array()
        );
        $data3 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => '/path/to/test',
                'notExistingProperty' => '1'
            )
        );
        $expectedData1 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => '/path/to/test',
                'allowUserDefinedThemes' => '1'
            )
        );
        $expectedData2 = array(
            'repository:test' => array(
                'label' => 'other test',
                'path' => '/path/to/test',
                'allowUserDefinedThemes' => '1'
            )
        );
        $expectedData3 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => '/path/to/test',
            )
        );
        $expectedData4 = array(
            'repository:test' => array(
                'label' => 'test'
            )
        );
        return array(
            array($data1, $expectedData1, null, null, true),
            array($data1, $expectedData2, 'label', 'other test', true),
            array($data1, $expectedData1, 'label', '', true),
            array($data2, $data2, null, null, false),
            array($data2, $expectedData4, 'label', 'test', true),
            array($data3, $expectedData3, null, null, true)
        );
    }

    /**
     * @dataProvider getUpdateData
     */

    public function testUpdate($data, $expectedData, $changedProp, $changedValue, $expectedReturnValue)
    {
        $iniFile = realpath(__DIR__.'/../tmp').'/config.ini.php';
        $section = 'repository:test';

        file_put_contents($iniFile, '');
        $ini = new jIniFileModifier($iniFile);
        $services = new lizmapServices($data, (object)array(), true, '');
        $repo = $services->getLizmapRepository('test');
        if ($changedProp && $changedValue) {
            $data[$section][$changedProp] = $changedValue;
        }
        $ret = $repo->update($data[$section], $ini);
        $this->assertEquals($expectedReturnValue, $ret);
        $this->assertEquals($expectedData[$section], $ini->getValues($section));
        unlink($iniFile);
        unset($services);
        unset($repo);
        unset($ini);
    }
}
