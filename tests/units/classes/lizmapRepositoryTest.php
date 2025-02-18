<?php
use PHPUnit\Framework\TestCase;
/**
 * @internal
 * @coversNothing
 */
class lizmapRepositoryTest extends TestCase
{
    public static function getTestGetPathData()
    {
        $repo1 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => realpath(__DIR__.'/../tmp/'),
                'allowUserDefinedThemes' => true,
            ),
        );
        $repo2 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => realpath(__DIR__.'/../tmp').'/../tmp/',
                'allowUserDefinedThemes' => true,
            ),
        );
        $repo3 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => '/does/not/exists',
                'allowUserDefinedThemes' => true,
            ),
        );
        $repo4 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => 'C:/test/Windows',
                'allowUserDefinedThemes' => true,
            ),
        );
        $repo5 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => '',
                'allowUserDefinedThemes' => true,
            ),
        );

        return array(
            array($repo1, 'test', realpath(__DIR__.'/../tmp/config'), $repo1['repository:test']['path'].'/'),
            array($repo2, 'test', realpath(__DIR__.'/../tmp/config'), realpath($repo2['repository:test']['path']).'/'),
            array($repo3, 'test', realpath(__DIR__.'/../tmp/config'), false),
            array($repo4, 'test', realpath(__DIR__.'/../tmp/config'), false),
            array($repo5, 'test', realpath(__DIR__.'/../tmp/config'), false),
        );
    }

    /**
     * @dataProvider getTestGetPathData
     *
     * @param mixed $repo
     * @param mixed $key
     * @param mixed $varPath
     * @param mixed $expectedPath
     */
    public function testGetPath($repo, $key, $varPath, $expectedPath): void
    {
        $services = new lizmapServices($repo, (object) array(), true, $varPath, null);
        $rep = $services->getLizmapRepository($key);
        $this->assertEquals($expectedPath, $rep->getPath());
        unset($services, $rep);
    }

    public static function getTestUpdateData()
    {
        $data1 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => '/path/to/test',
                'allowUserDefinedThemes' => true,
            ),
        );
        $data2 = array(
            'repository:test' => array(),
        );
        $data3 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => '/path/to/test',
                'notExistingProperty' => true,
            ),
        );
        $expectedData1 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => '/path/to/test',
                'allowUserDefinedThemes' => true,
            ),
        );
        $expectedData2 = array(
            'repository:test' => array(
                'label' => 'other test',
                'path' => '/path/to/test',
                'allowUserDefinedThemes' => true,
            ),
        );
        $expectedData3 = array(
            'repository:test' => array(
                'label' => 'test',
                'path' => '/path/to/test',
            ),
        );
        $expectedData4 = array(
            'repository:test' => array(
                'label' => 'test',
            ),
        );

        return array(
            array($data1, $expectedData1, null, null, true),
            array($data1, $expectedData2, 'label', 'other test', true),
            array($data1, $expectedData1, 'label', '', true),
            array($data2, $data2, null, null, false),
            array($data2, $expectedData4, 'label', 'test', true),
            array($data3, $expectedData3, null, null, true),
        );
    }

    /**
     * @dataProvider getTestUpdateData
     *
     * @param mixed $data
     * @param mixed $expectedData
     * @param mixed $changedProp
     * @param mixed $changedValue
     * @param mixed $expectedReturnValue
     */
    public function testUpdate($data, $expectedData, $changedProp, $changedValue, $expectedReturnValue): void
    {
        $iniFile = realpath(__DIR__.'/../tmp').'/config.ini.php';
        $section = 'repository:test';

        file_put_contents($iniFile, '');
        $ini = new \Jelix\IniFile\IniModifier($iniFile);
        $services = new lizmapServices($data, (object) array(), true, '', null);
        $repo = $services->getLizmapRepository('test');
        if ($changedProp && $changedValue) {
            $data[$section][$changedProp] = $changedValue;
        }
        $ret = $repo->update($data[$section], $ini);
        $this->assertEquals($expectedReturnValue, $ret);
        $this->assertEquals($expectedData[$section], $ini->getValues($section));
        unlink($iniFile);
        unset($services, $repo, $ini);
    }

    // Tests for after the lizmapProject class refactorisation

/*  public function testGetProject()
    {
        $ini = parse_ini_file(jApp::varConfigPath('lizmapConfig.ini.php'), true);
        $services = new lizmapServices($ini, jApp::config(), true, jApp::varPath());
        $rep = $services->getLizmapRepository('montpellier');
        $proj = $rep->getProject('events');
        $proj2 = $rep->getProject('events');

        $this->AssertNotEquals(null, $proj);
        $this->assertSame($proj, $proj2);
        unset($proj, $proj2, $rep, $services);
    }

    public function testGetProjects()
    {
        $repo = array(
            'repository:montpellier' => array(
                'label' => 'Demo',
                'path' => realpath(__DIR__.'/../../qgis-projects/demoqgis'),
                'allowUserDefinedThemes' => true,
            ),
        );

        $projKeys = array('events', 'montpellier');
        $ini = parse_ini_file(jApp::varConfigPath('lizmapConfig.ini.php'), true);
        $services = new lizmapServices($ini, jApp::config(), true, jApp::varPath());
        $rep = $services->getLizmapRepository('montpellier');
        $projects = $rep->getProjects();
        $this->assertEquals(count($projKeys), count($projects));
        foreach ($projKeys as $key => $projKey) {
            $this->assertEquals($projKey, $projects[$key]->getKey());
        }
        unset($projects, $rep, $services);
    } */
}
