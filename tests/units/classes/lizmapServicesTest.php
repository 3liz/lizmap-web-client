<?php

/**
 * @internal
 * @coversNothing
 */
class lizmapServicesTest extends PHPUnit_Framework_TestCase
{
    public function getContactEmail()
    {
        return array(
            array('', ''),
            array('  ', ''),
            array('root@localhost', ''),
            array('root@localhost.localdomain', ''),
            array('laurent@jelix.org', 'laurent@jelix.org'),
            array('test.test@test.com', 'test.test@test.com'),
        );
    }

    /**
     * @dataProvider getContactEmail
     *
     * @param mixed $email_test
     * @param mixed $expected_email
     */
    public function testAdminContactEmail($email_test, $expected_email)
    {
        $ini_tab = array('hideSensitiveServicesProperties' => '0',
            'services' => array(
                'appName' => 'Lizmap',
                'adminContactEmail' => $email_test, ),
        );

        $testLizmapServices = new lizmapServices($ini_tab, array(), true, '', null, null);
        $this->assertEquals($expected_email, $testLizmapServices->adminContactEmail);
        unset($testLizmapServices);
    }

    /**
     * @dataProvider getContactEmail
     *
     * @param mixed $email_test
     * @param mixed $expected_email
     */
    public function testAdminSenderEmail($email_test, $expected_email)
    {
        $ini_tab = array('hideSensitiveServicesProperties' => '0',
            'services' => array(
                'appName' => 'Lizmap',
                'adminSenderEmail' => $email_test, ),
        );

        $ini_tab2 = (object) array(
            'mailer' => array(
                'webmasterEmail' => $email_test, ),
        );

        $testLizmapServices = new lizmapServices($ini_tab, array(), true, '', null);
        $this->assertEquals('', $testLizmapServices->adminSenderEmail);
        unset($testLizmapServices);
        $testLizmapServices = new lizmapServices(array(), $ini_tab2, true, '', null);
        $this->assertEquals($expected_email, $testLizmapServices->adminSenderEmail);
        unset($testLizmapServices);
    }

    public function getAllowUserAccountRequestsData()
    {
        return array(
            array(false, '', true, false),
            array(false, '', false, false),
            array(true, '', false, false),
            array(false, 'valid.email@gmail.com', false, false),
            array(true, 'valid.email@gmail.com', false, true),
        );
    }

    /**
     * @dataProvider getAllowUserAccountRequestsData
     *
     * @param mixed $allowValue
     * @param mixed $senderEmail
     * @param mixed $isUsingLdap
     * @param mixed $expectedResult
     */
    public function testAllowUserAccountRequests($allowValue, $senderEmail, $isUsingLdap, $expectedResult)
    {
        $ini_tab = array(
            'mailer' => array(
                'webmasterEmail' => $senderEmail, ),
            'jcommunity' => array(
                'registrationEnabled' => $allowValue, ),
        );

        $testLizmapServices = new lizmapServices(array(), (object) $ini_tab, $isUsingLdap, '', null);
        $this->assertEquals($expectedResult, $testLizmapServices->allowUserAccountRequests);
        unset($testLizmapServices);
    }

    public function getHideSensitivePropertiesData()
    {
        return array(
            array(true, true),
            array(false, false),
        );
    }

    /**
     * @dataProvider getHideSensitivePropertiesData
     *
     * @param mixed $testValue
     * @param mixed $expectedReturnValue
     */
    public function testHideSensitiveProperties($testValue, $expectedReturnValue)
    {
        $ini_tab = array(
            'hideSensitiveServicesProperties' => $testValue,
        );

        $testLizmapServices = new LizmapServices($ini_tab, array(), false, '', null);
        $this->assertEquals($expectedReturnValue, $testLizmapServices->HideSensitiveProperties());
        unset($testLizmapServices);
    }

    public function getRootRepositoriesData()
    {
        $path = realpath(__DIR__.'/../../../');

        return array(
            array($path.'/tests/qgis-projects', $path.'/lizmap/var/', $path.'/tests/qgis-projects/'),
            array('', $path.'/lizmap/var/', ''),
            array($path.'/tests/qgis-projects', '', $path.'/tests/qgis-projects/'),
            array('', '', ''),
            array('C:\Program Files\Lizmap', '', 'C:\Program Files\Lizmap/'),
            array('../var/log/.././', $path.'/lizmap/var/', $path.'/lizmap/var/'),
            array('../file/not/existing', $path.'/lizmap/var/', false),
        );
    }

    /**
     * @dataProvider getRootRepositoriesData
     *
     * @param mixed $testIniValue
     * @param mixed $testVarPathValue
     * @param mixed $expectedReturnValue
     */
    public function testRootRepositories($testIniValue, $testVarPathValue, $expectedReturnValue)
    {
        $ini_tab = array(
            'services' => array(
                'rootRepositories' => $testIniValue, ),
        );

        $testLizmapServices = new LizmapServices($ini_tab, array(), false, $testVarPathValue, null);
        $this->assertEquals($expectedReturnValue, $testLizmapServices->getRootRepositories());
        unset($testLizmapServices);
    }

    public function getModifyGlobalData()
    {
        $testModify1 = array(
            'jcommunity' => array('registrationEnabled' => 'off'),
            'mailer' => array('webmasterEmail' => 'test.test@test.com'),
        );
        $testModify3 = array(
            'undefined' => array('test' => 'on'),
            'jcommunity' => array('registrationEnabled' => 'off'),
            'mailer' => array('webmasterEmail' => 'test.test@test.com'),
        );
        $testModify1_1 = array(
            'allowUserAccountRequests' => false,
            'adminSenderEmail' => 'test.test@test.com',
        );
        $testModify2_1 = array(
            'allowUserAccountRequests' => false,
            'adminSenderEmail' => 'test.test@3liz.org',
        );
        $testModify3_1 = array(
            'undefined' => 'test',
        );

        return array(
            array($testModify1, $testModify1_1, null, null, true),
            array($testModify1, $testModify2_1, 'adminSenderEmail', 'test.test@3liz.org', true),
            array($testModify3, $testModify1_1, null, null, true),
            array($testModify1, null, null, null, false),
            array(null, $testModify1_1, 'adminSenderEmail', 'test.test@test.com', true),
            array(null, $testModify3_1, null, null, false),
        );
    }

    /**
     * @dataProvider getModifyGlobalData
     *
     * @param mixed $globalConfig
     * @param mixed $newConfig
     * @param mixed $changedProperty
     * @param mixed $changedValue
     * @param mixed $expectedReturnValue
     */
    public function testModifyGlobal($globalConfig, $newConfig, $changedProperty, $changedValue, $expectedReturnValue)
    {
        $testLizmapServices = new LizmapServices(array(), (object) $globalConfig, false, '', null);
        $this->assertEquals($expectedReturnValue, $testLizmapServices->modify($newConfig));
        if ($changedProperty) {
            $this->assertEquals($changedValue, $testLizmapServices->{$changedProperty});
        }
        unset($testLizmapServices);
    }

    public function getModifyLocalData()
    {
        $testModify1 = array(
            'services' => array(
                'appName' => 'Lizmap',
                'adminContactEmail' => 'test.test@test.com', ),
        );
        $testModify2 = array(
            'test' => 'test',
        );
        $testModify1_1 = array(
            'appName' => 'Lizmap',
            'adminContactEmail' => 'test.test@test.com',
        );
        $testModify2_1 = array(
            'appName' => 'Lizmap',
            'adminContactEmail' => 'test.test@3liz.org',
        );
        $testModify3_1 = array(
            'appName' => 'Lizmap',
            'adminContactEmail' => 'test.test@test.com',
            'debugMode' => 'off',
        );

        return array(
            array($testModify1, $testModify1_1, null, null, true),
            array($testModify1, $testModify2_1, 'adminContactEmail', 'test.test@3liz.org', true),
            array($testModify1, $testModify3_1, 'debugMode', 'off', true),
            array($testModify1, null, null, null, false),
            array($testModify2, $testModify1_1, 'adminContactEmail', 'test.test@test.com', true),
            array(null, $testModify1_1, 'adminContactEmail', 'test.test@test.com', true),
        );
    }

    /**
     * @dataProvider getModifyLocalData
     *
     * @param mixed $localConfig
     * @param mixed $newConfig
     * @param mixed $changedProperty
     * @param mixed $changedValue
     * @param mixed $expectedReturnValue
     */
    public function testModifyLocal($localConfig, $newConfig, $changedProperty, $changedValue, $expectedReturnValue)
    {
        $testLizmapServices = new LizmapServices($localConfig, null, false, '', null);
        $this->assertEquals($expectedReturnValue, $testLizmapServices->modify($newConfig));
        if (isset($changedProperty)) {
            $this->assertEquals($changedValue, $testLizmapServices->{$changedProperty});
        }
        unset($testLizmapServices);
    }

    public function getSaveIntoIniData()
    {
        $ini1 = array(
            'appName' => 'Lizmap',
            'adminContactEmail' => 'test.test@test.com',
        );
        $ini1_1 = array(
            'appName' => 'Lizmap',
        );
        $ini2 = array();
        $liveIni = array(
            'webmasterEmail' => 'test.test@test.com',
            'webmasterName' => 'Adrien',
        );
        $evalTab1 = array(
            'appName' => 'Lizmap',
            'debugMode' => false,
        );
        $evalTab2 = array(
            'adminSenderEmail' => 'test.test@test.com',
            'adminSenderName' => 'Adrien',
        );

        return array(
            array($ini1, $ini1, null, 'services', false),
            array($evalTab1, $ini1_1, null, 'services', true),
            array($evalTab2, null, $liveIni, 'mailer', false),
            array($evalTab2, null, $ini2, 'mailer', true),
        );
    }

    /**
     * @dataProvider getSaveIntoIniData
     *
     * @param mixed $dataModification
     * @param mixed $expectedIniValues
     * @param mixed $expectedLiveIniValues
     * @param mixed $section_name
     * @param mixed $hide
     */
    public function testSaveIntoIni($dataModification, $expectedIniValues, $expectedLiveIniValues, $section_name, $hide)
    {
        $iniPath = __DIR__.'/../tmp/local.ini.php';
        $liveIniPath = __DIR__.'/../tmp/live.ini.php';
        file_put_contents($iniPath, '');
        file_put_contents($liveIniPath, '');

        $defaultPropList = array(
            'appName',
            'qgisServerVersion',
            'wmsMaxWidth',
            'wmsMaxHeight',
            'relativeWMSPath',
            'requestProxyType',
            'requestProxyNotForDomain',
            'cacheRedisHost',
            'cacheRedisPort',
        );

        $testLizmapServices = new LizmapServices(array('hideSensitiveServicesProperties' => $hide), (object) array(), false, '', null);

        foreach ($defaultPropList as $prop) {
            $testLizmapServices->{$prop} = '';
        }

        foreach ($dataModification as $key => $val) {
            $testLizmapServices->{$key} = $val;
        }

        $ini = new jIniFileModifier($iniPath);
        $liveIni = new jIniFileModifier($liveIniPath);
        $testLizmapServices->saveIntoIni($ini, $liveIni);
        if (isset($expectedIniValues)) {
            $this->assertEquals($expectedIniValues, $ini->getValues($section_name));
        }
        if (isset($expectedLiveIniValues)) {
            $this->assertEquals($expectedLiveIniValues, $liveIni->getValues($section_name));
        }
        unlink($iniPath);
        unlink($liveIniPath);
        unset($testLizmapServices);
    }

    public function getRepoData()
    {
        $repo1 = array(
            'repository:test' => array(
                'label' => 'Test',
                'path' => '/path/to/test',
                'allowUserDefinedThemes' => '1',
            ),
        );
        $repo2 = array(
            'repository:test' => array(
                'path' => '/path/to/test',
                'allowUserDefinedThemes' => '1',
            ),
        );
        $repo3 = array(
            'repository:' => array(
                'label' => 'Test',
                'path' => '/path/to/test',
                'allowUserDefinedThemes' => '',
            ),
        );

        return array(
            array($repo1, 'test', true),
            array($repo1, null, false),
            array($repo2, 'test', true),
            array($repo3, '', false),
            array($repo3, null, false),
        );
    }

    /**
     * @dataProvider getRepoData
     *
     * @param mixed $repoInfos
     * @param mixed $key
     * @param mixed $expectedReturnValue
     */
    public function testGetLizmapRepository($repoInfos, $key, $expectedReturnValue)
    {
        $testLizmapServices = new lizmapServices($repoInfos, (object) array(), true, '', null);
        $repo = $testLizmapServices->getLizmapRepository($key);
        $this->assertEquals($expectedReturnValue, (bool) $repo);
        if ($expectedReturnValue === false) {
            return;
        }
        $this->assertEquals($key, $repo->getKey());
        $properties = lizmapRepository::getProperties();
        foreach ($properties as $prop) {
            if (!isset($repoInfos['repository:'.$key][$prop])) {
                continue;
            }
            $this->assertEquals($repoInfos['repository:'.$key][$prop], $repo->getData($prop));
        }
        unset($testLizmapServices, $repo);
    }
}
