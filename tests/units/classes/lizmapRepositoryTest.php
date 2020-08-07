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
}
