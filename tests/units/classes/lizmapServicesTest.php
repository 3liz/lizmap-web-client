<?php

class lizmapServicesTest extends PHPUnit_Framework_TestCase {
    
    public function getContactEmail()   {
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
     */

    public function testAdminContactEmail($email_test, $expected_email)  {

        $ini_tab = array('hideSensitiveServicesProperties' => '0',
			'services' => array(
				'appName' => 'Lizmap',
				'adminContactEmail' => $email_test)
		);

        $testLizmapServices = new lizmapServices($ini_tab, array(), true, '');
        $this->assertEquals($expected_email, $testLizmapServices->adminContactEmail);
        unset($testLizmapServices);
    }

    /**
     * @dataProvider getContactEmail
     */
    
     public function testAdminSenderEmail($email_test, $expected_email)  {       
        
        $ini_tab = array('hideSensitiveServicesProperties' => '0',
			'services' => array(
				'appName' => 'Lizmap',
				'adminSenderEmail' => $email_test)
		);

        $ini_tab2 = (object)array(
			'mailer' => array(
				'webmasterEmail' => $email_test)
		);

        $testLizmapServices = new lizmapServices($ini_tab, array(), true, '');
        $this->assertEquals('', $testLizmapServices->adminSenderEmail);
        unset($testLizmapServices);
        $testLizmapServices = new lizmapServices(array(), $ini_tab2, true, '');
        $this->assertEquals($expected_email, $testLizmapServices->adminSenderEmail);
        unset($testLizmapServices);
    }

	public function	getAllowUserAccountRequestsData() {
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
	 */

	public function	testAllowUserAccountRequests($allowValue, $senderEmail, $isUsingLdap, $expectedResult)	{
		$ini_tab = array(
			'mailer' => array(
				'webmasterEmail' => $senderEmail),
			'jcommunity' => array(
				'registrationEnabled' => $allowValue)
			);

			$testLizmapServices = new lizmapServices(array(), (object)$ini_tab, $isUsingLdap, '');
			$this->assertEquals($expectedResult, $testLizmapServices->allowUserAccountRequests);
			unset($testLizmapServices);
	}

	public function getHideSensitivePropertiesData()	{
		return array(
			array(true, true),
			array(false, false)
		);
	}

	/**
	 * @dataProvider getHideSensitivePropertiesData
	 */

	public function testHideSensitiveProperties($testValue, $expectedReturnValue)	{
		$ini_tab = array(
			'hideSensitiveServicesProperties' => $testValue
		);

		$testLizmapServices = new LizmapServices($ini_tab, array(), false, '');
		$this->assertEquals($expectedReturnValue, $testLizmapServices->HideSensitiveProperties());
		unset($testLizmapServices);
	}

	public function	getRootRepositoriesData()	{
		return array(
			array('/srv/lzm/tests/qgis-projects', '/srv/lzm/lizmap/var/', '/srv/lzm/tests/qgis-projects/'),
			array('', '/srv/lzm/lizmap/var/', ''),
			array('/srv/lzm/tests/qgis-projects', '', '/srv/lzm/tests/qgis-projects/'),
			array('', '', ''),
			array('C:\Program Files\Lizmap', '', 'C:\Program Files\Lizmap/'),
			array('../var/log/.././', '/srv/lzm/lizmap/var/', '/srv/lzm/lizmap/var/'),
			array('../file/not/existing', '/srv/lzm/lizmap/var/', FALSE)
		);
	}

	/**
	 * @dataProvider getRootRepositoriesData
	 */

	public function	testRootRepositories($testIniValue, $testVarPathValue, $expectedReturnValue)	{
		$ini_tab = array(
			'services' => array(
				'rootRepositories' => $testIniValue)
		);

		$testLizmapServices = new LizmapServices($ini_tab, array(), false, $testVarPathValue);
		$this->assertEquals($expectedReturnValue, $testLizmapServices->getRootRepositories());
		unset($testLizmapServices);
	}

	public function	getModifyGlobalData()	{

		$testModify1 = array(
			'jcommunity' => array('registrationEnabled' => 'off'),
			'mailer' => array('webmasterEmail' => 'test.test@test.com')
		);
		$testModify3 = array(
			'undefined' => array('test' => 'on'),
			'jcommunity' => array('registrationEnabled' => 'off'),
			'mailer' => array('webmasterEmail' => 'test.test@test.com')
		);
		$testModify1_1 = array(
			'allowUserAccountRequests' => false,
			'adminSenderEmail' => 'test.test@test.com'
		);
		$testModify2_1 = array(
			'allowUserAccountRequests' => false,
			'adminSenderEmail' => 'test.test@3liz.org'
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
			array(null, $testModify3_1, null, null, false)
		);
	}

	/**
	 * @dataProvider getModifyGlobalData
	 */

	public function	testModifyGlobal($globalConfig, $newConfig, $changedProperty, $changedValue, $expectedReturnValue)	{

		$testLizmapServices = new LizmapServices(array(), (object)$globalConfig, false, '');
		$this->assertEquals($expectedReturnValue, $testLizmapServices->modify($newConfig));
		if (isset($changedProperty))	{
			$this->assertEquals($changedValue, $testLizmapServices->$changedProperty);
		}
		unset($testLizmapServices);
	}

	public function getModifyLocalData()	{
		$testModify1 = array(
			'services' => array(
				'appName' => 'Lizmap',
				'adminContactEmail' => 'test.test@test.com')
		);
		$testModify2 = array(
			'test' => 'test'
		);
		$testModify1_1 = array(
			'appName' => 'Lizmap',
			'adminContactEmail' => 'test.test@test.com'
		);
		$testModify2_1 = array(
			'appName' => 'Lizmap',
			'adminContactEmail' => 'test.test@3liz.org'
		);
		$testModify3_1 = array(
			'appName' => 'Lizmap',
			'adminContactEmail' => 'test.test@test.com',
			'debugMode' => 'off'
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
	 */

	public function testModifyLocal($localConfig, $newConfig, $changedProperty, $changedValue, $expectedReturnValue)	{

		$testLizmapServices = new LizmapServices($localConfig, null, false, '');
		$this->assertEquals($expectedReturnValue, $testLizmapServices->modify($newConfig));
		if (isset($changedProperty))	{
			$this->assertEquals($changedValue, $testLizmapServices->$changedProperty);
		}
		unset($testLizmapServices);
	}

	public function getSaveIntoIniData()	{
		$ini1 = array(
			'appName' => 'Lizmap',
			'adminContactEmail' => 'test.test@test.com'
		);
		$ini1_1 = array(
			'appName' => 'Lizmap'
		);
		$ini2 = array();
		$liveIni = array(
			'webmasterEmail' => 'test.test@test.com',
			'webmasterName' => 'Adrien'
		);
		return array(
			array('$testLizmapServices->appName = "Lizmap"; $testLizmapServices->adminContactEmail = "test.test@test.com";', $ini1, null, 'services', false),
			array('$testLizmapServices->appName = "Lizmap"; $testLizmapServices->debugMode = false;', $ini1_1, null, 'services', true),
			array('$testLizmapServices->adminSenderEmail = "test.test@test.com"; $testLizmapServices->adminSenderName = "Adrien";', null, $liveIni, 'mailer', false),
			array('$testLizmapServices->adminSenderEmail = "test.test@test.com"; $testLizmapServices->adminSenderName = "Adrien";', null, $ini2, 'mailer', true),
		);
	}

	/**
	 * @dataProvider getSaveIntoIniData
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

		$testLizmapServices = new LizmapServices(array('hideSensitiveServicesProperties' => $hide), (object)array(), false, '');
		
		foreach($defaultPropList as $prop)
		{
			$testLizmapServices->$prop = '';
		}

		eval($dataModification);
		$ini = new jIniFileModifier($iniPath);
		$liveIni = new jIniFileModifier($liveIniPath);
		$testLizmapServices->saveIntoIni($ini, $liveIni);
		if (isset($expectedIniValues))	{
			$this->assertEquals($expectedIniValues, $ini->getValues($section_name));
		}
		if (isset($expectedLiveIniValues))	{
			$this->assertEquals($expectedLiveIniValues, $liveIni->getValues($section_name));
		}
		unlink($iniPath);
		unlink($liveIniPath);
	}
}

?>