<?php

use Lizmap\Project;
use Lizmap\Project\ProjectFilesFinder;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class ProjectTest extends TestCase
{
    public function testReadProject(): void
    {
        $data = array(
            'WMSInformation' => array(),
            'layers' => array(),
        );
        $qgis_default = new QgisProjectForTests($data);
        $qgis_default->setXmlForTest(new SimpleXMLElement('<root></root>'));
        $this->assertNotNull($qgis_default->getXmlForTest());
        $rep = new Project\Repository('key', array(), null, null, null);
        $proj = new ProjectForTests();
        $cfg = json_decode(file_get_contents(__DIR__.'/Ressources/readProject.qgs.cfg'));
        $config = new Project\ProjectConfig($cfg);
        $proj->setCfg($config);
        $proj->setQgis($qgis_default);
        $proj->setRepo($rep);
        $proj->setKey('test');
        $proj->readProjectForTest();

        $this->assertEquals('key', $proj->getRepositoryKey());
        $this->assertEquals('test', $proj->getKey());
        $this->assertEquals('Test', $proj->getTitle());
        $this->assertEquals('', $proj->getAbstract());
        $this->assertEquals('EPSG:4242', $proj->getProj());
        $this->assertEquals('42.42, 21.21, 20.2, 48.84', $proj->getBbox());

    }

    public static function getQgisPathData()
    {
        return array(
            array(__DIR__.'/../../../qgis-projects/demoqgis', 'montpellier', realpath(__DIR__.'/../../../qgis-projects/demoqgis/montpellier.qgs')),
            array('/srv/lzm/tests/qgis-projects/notexisting', 'montpellier', false),
            array(__DIR__.'/../false', 'montpellier', false),
        );
    }

    /**
     * @dataProvider getQgisPathData
     *
     * @param mixed $repPath
     * @param mixed $key
     * @param mixed $expectedPath
     */
    public function testGetQgisPath($repPath, $key, $expectedPath): void
    {
        $rep = new Project\Repository($key, array('path' => $repPath), null, null, null);
        $proj = new ProjectForTests();
        $proj->setRepo($rep);
        $proj->setKey($key);
        $this->assertEquals($expectedPath, $proj->getQgisPath());
    }

    public static function getRelativeQgisPathData()
    {
        return array(
            array('',   null,                      '/srv/lzm/absolute/path',              '/srv/lzm/absolute/path'),
            array('1',  '/srv/lzm/repo/root/path', '/srv/lzm/repo/root/path/project.qgs', 'project.qgs'),
            array('1', '/srv/lzm/repo/root/path',  '/srv/lzm/not/the/same/project.qgs',   '/srv/lzm/not/the/same/project.qgs'),
        );
    }

    /**
     * @dataProvider getRelativeQgisPathData
     *
     * @param mixed $relative
     * @param mixed $root
     * @param mixed $file
     * @param mixed $expectedPath
     */
    public function testGetRelativeQgisPath($relative, $root, $file, $expectedPath): void
    {
        $services = new lizmapServices(
            array('services' =>
                      array('relativeWMSPath' => $relative,
                            'rootRepositories' => $root)
            ), (object) array(), false, null, null);
        $proj = new ProjectForTests();
        $proj->setRepo(new Project\Repository(null, array('path' => ''), null, null, null));
        $proj->setServices($services);
        $proj->setFile($file, 0, 0);
        $path = $proj->getRelativeQgisPath();
        $this->assertEquals($expectedPath, $path);
    }

    public static function getAttributeLayersData()
    {
        $aLayer1 = (object) array(
            'layer1' => (object) array('hideLayer' => 'true'),
            'layer2' => (object) array('hideLayer' => 'true'),
            'layer3' => (object) array('hideLayer' => 'true'),
        );
        $aLayer2 = (object) array(
            'layer1' => (object) array('hideLayer' => 'false'),
            'layer2' => (object) array('hideLayer' => 'false'),
            'layer3' => (object) array('hideLayer' => 'false'),
        );
        $aLayer3 = (object) array(
            'layer1' => (object) array('UnknownProp' => ''),
            'layer2' => (object) array('UnknownProp' => ''),
            'layer3' => (object) array('UnknownProp' => ''),
        );

        return array(
            array(true, $aLayer1, false),
            array(false, $aLayer1, true),
            array(true, $aLayer2, true),
            array(false, $aLayer2, true),
            array(true, $aLayer3, true),
            array(false, $aLayer3, true),
            array(false, (object) array(), false),
            array(true, (object) array(), false),
        );
    }

    /**
     * @dataProvider getAttributeLayersData
     *
     * @param mixed $only
     * @param mixed $attributeLayers
     * @param mixed $expectedReturn
     */
    public function testHasAttributeLayer($only, $attributeLayers, $expectedReturn): void
    {
        $config = new Project\ProjectConfig((object)array('attributeLayers' => $attributeLayers));
        $proj = new ProjectForTests();
        $proj->setCfg($config);
        $this->assertEquals($expectedReturn, $proj->hasAttributeLayers($only));
    }

    public static function getEditionLayersData()
    {
        $eLayers = (object) array(
            'layer1' => (object) array(
                'acl' => '',
                'order' => 0,
            ),
            'layer2' => (object) array(
                'acl' => 'group1, other',
                'order' => 0,
            ),
            'layer3' => (object) array(
                'acl' => 'group2, other',
                'order' => 0,
            ),
        );
        $acl1 = array(
            'lizmap.tools.edition.use' => true,
            'lizmap.admin.repositories.delete' => false,
            'groups' => array('group1'),
        );
        $acl2 = array('lizmap.tools.edition.use' => false);
        $acl3 = array(
            'lizmap.tools.edition.use' => true,
            'lizmap.admin.repositories.delete' => true,
            'groups' => array('none'),
        );
        $acl4 = array(
            'lizmap.tools.edition.use' => true,
            'lizmap.admin.repositories.delete' => false,
            'groups' => array('none'),
        );
        $unset1 = array(
            'layer2' => false,
            'layer3' => true,
        );
        $unset3 = array(
            'layer2' => false,
            'layer3' => false,
        );
        $unset4 = array(
            'layer2' => true,
            'layer3' => true,
        );

        return array(
            array($eLayers, $acl1, $unset1, true),
            array($eLayers, $acl2, array(), false),
            array($eLayers, $acl3, $unset3, true),
            array($eLayers, $acl4, $unset4, true),
        );
    }

    /**
     * @dataProvider getEditionLayersData
     *
     * @param mixed $editionLayers
     * @param mixed $acl
     * @param mixed $unset
     * @param mixed $expectedRet
     */
    public function testHasEditionLayers($editionLayers, $acl, $unset, $expectedRet): void
    {
        $eLayers = clone $editionLayers;
        foreach ($editionLayers as $key => $obj) {
            $eLayers->{$key} = clone $obj;
        }
        $config = new Project\ProjectConfig((object) array('editionLayers' => $eLayers));
        $rep = new Project\Repository(null, array(), null, null, null);
        $context = new ContextForTests();
        $context->setResult($acl);
        $proj = new ProjectForTests($context);
        $proj->setRepo($rep);
        $proj->setCfg($config);
        $this->assertEquals($expectedRet, $proj->hasEditionLayersForCurrentUser());
        $eLayer = $proj->getEditionLayersForCurrentUser();
        foreach ($unset as $key => $value) {
            if ($value) {
                $this->assertFalse(isset($eLayer->{$key}));
            } else {
                $this->assertFalse(isset($eLayer->{$key}->acl));
            }
        }
    }

    public static function getLoginFilteredData()
    {
        $layers = (object) array(
            'layer1' => (object) array(
                'name' => 'layer1',
                'typeName' => 'layer1',
            ),
        );
        $lfLayers = (object) array(
            'layer1' => 'layer1',
        );

        return array(
            array($lfLayers, $layers, 'layer1', 'layer1'),
            array($lfLayers, $layers, null, null),
            array($lfLayers, $layers, 'layer3', null),
        );
    }

    /**
     * @dataProvider getLoginFilteredData
     *
     * @param mixed $lfLayers
     * @param mixed $layers
     * @param mixed $ln
     * @param mixed $expectedLn
     */
    public function testGetLoginFilteredConfig($lfLayers, $layers, $ln, $expectedLn): void
    {
        $config = new Project\ProjectConfig((object) array(
            'loginFilteredLayers' => $lfLayers,
            'layers' => $layers));
        $proj = new ProjectForTests();
        $proj->setCfg($config);
        $this->assertEquals($expectedLn, $proj->getLoginFilteredConfig($ln));
    }

    public static function getFiltersData()
    {
        $aclData1 = array(
            'userIsConnected' => true,
            'userSession' => (object) array('login' => 'admin'),
            'groups' => array('admin', 'groups', 'lizmap'),
        );
        $aclData2 = array(
            'userIsConnected' => false,
        );
        //$filter1 = '"descr" IN ( \'admin\' , \'groups\' , \'lizmap\' , \'all\' )';
        $filter1 = '( "descr" = \'admin\' OR "descr" LIKE \'admin,%\' OR "descr" LIKE \'%,admin\' OR "descr" LIKE \'%,admin,%\'';
        $filter1 .= ' OR ';
        $filter1 .= '"descr" = \'groups\' OR "descr" LIKE \'groups,%\' OR "descr" LIKE \'%,groups\' OR "descr" LIKE \'%,groups,%\'';
        $filter1 .= ' OR ';
        $filter1 .= '"descr" = \'lizmap\' OR "descr" LIKE \'lizmap,%\' OR "descr" LIKE \'%,lizmap\' OR "descr" LIKE \'%,lizmap,%\'';
        $filter1 .= ' OR ';
        $filter1 .= '"descr" = \'all\' OR "descr" LIKE \'all,%\' OR "descr" LIKE \'%,all\' OR "descr" LIKE \'%,all,%\' )';

        //$filter2 = '"Group" = \'all\'';
        $filter2 = '( "descr" = \'all\' OR "descr" LIKE \'all,%\' OR "descr" LIKE \'%,all\' OR "descr" LIKE \'%,all,%\' )';

        return array(
            array($aclData1, $filter1),
            array($aclData2, $filter2),
        );
    }

    /**
     * @dataProvider getFiltersData
     *
     * @param mixed $aclData
     * @param mixed $expectedFilters
     */
    public function testGetLoginFilters($aclData, $expectedFilters): void
    {
        $data = array(
            'WMSInformation' => array(),
            'layers' => array(),
        );
        $file = __DIR__.'/Ressources/embed_parent.qgs';
        $context = new ContextForTests();
        $context->setResult($aclData);
        $proj = new ProjectForTests($context);
        $testQgis = new QgisProjectForTests($data);
        $rep = new Project\Repository('key', array(), null, null, null);
        $testQgis->setPath($file);
        $testQgis->readXMLProjectTest($file);

        $cfg = json_decode(file_get_contents( __DIR__.'/Ressources/embed_parent_filtered.qgs.cfg'));
        $config = new Project\ProjectConfig($cfg);
        $proj->setCfg($config);
        $proj->setQgis($testQgis);
        $proj->setRepo($rep);
        $proj->setKey('test');

        // Test
        $expectedFilters = array(
            'edition_layer_embed_point' => array_merge((array)$cfg->loginFilteredLayers->edition_layer_embed_point,
                                          array('layername' => 'edition_layer_embed_point',
                                                'filter' => $expectedFilters)),
        );
        $filters = $proj->getLoginFilters(array('edition_layer_embed_point'));
        $this->assertEquals($expectedFilters, $filters);

    }

    public static function getFiltersDataNotMultiple()
    {
        $aclData1 = array(
            'userIsConnected' => true,
            'userSession' => (object) array('login' => 'admin'),
            'groups' => array('admin', 'groups', 'lizmap'),
        );
        $aclData2 = array(
            'userIsConnected' => false,
        );
        $filter1 = '( "descr" = \'admin\' OR "descr" = \'groups\' OR "descr" = \'lizmap\' OR "descr" = \'all\' )';
        $filter2 = '( "descr" = \'all\' )';

        return array(
            array($aclData1, $filter1),
            array($aclData2, $filter2),
        );
    }

    /**
     * @dataProvider getFiltersDataNotMultiple
     *
     * @param mixed $aclData
     * @param mixed $expectedFilters
     */
    public function testGetLoginFiltersNotMultiple($aclData, $expectedFilters): void
    {
        $data = array(
            'WMSInformation' => array(),
            'layers' => array(),
        );
        $file = __DIR__.'/Ressources/embed_parent.qgs';
        $context = new ContextForTests();
        $context->setResult($aclData);
        $proj = new ProjectForTests($context);
        $testQgis = new QgisProjectForTests($data);
        $rep = new Project\Repository('key', array(), null, null, null);
        $testQgis->setPath($file);
        $testQgis->readXMLProjectTest($file);

        $cfg = json_decode(file_get_contents( __DIR__.'/Ressources/embed_parent_filtered.qgs.cfg'));
        $config = new Project\ProjectConfig($cfg);
        $proj->setCfg($config);
        $proj->setQgis($testQgis);
        $proj->setRepo($rep);
        $proj->setKey('test');

        // test
        $expectedFilters = array(
            'edition_layer_embed_line' => array_merge((array)$cfg->loginFilteredLayers->edition_layer_embed_line,
                                          array('layername' => 'edition_layer_embed_line',
                                                'filter' => $expectedFilters)),
        );
        $filters = $proj->getLoginFilters(array('edition_layer_embed_line'));
        $this->assertEquals($expectedFilters, $filters);

    }

    public static function getGoogleData()
    {
        $options1 = (object) array(
            'googleStreets' => 'False',
            'googleSatellite' => 'False',
            'googleTerrain' => 'False',
        );
        $options2 = (object) array(
            'googleStreets' => 'False',
            'googleSatellite' => 'True',
            'googleTerrain' => 'False',
        );
        $options3 = (object) array(
            'googleStreets' => 'true',
            'googleSatellite' => 'True',
            'googleTerrain' => 'true',
            'googleKey' => 'gKey',
        );
        $options4 = (object) array(
            'noGoogleProp' => 'true',
        );
        $options5 = (object) array(
            'noGoogleProp' => 'true',
            'externalSearch' => 'google',
            'googleKey' => 'gKey',
        );

        return array(
            array($options1, false, ''),
            array($options2, true, ''),
            array($options3, true, 'gKey'),
            array($options4, false, ''),
            array($options5, true, 'gKey'),
        );
    }

    /**
     * @dataProvider getGoogleData
     *
     * @param mixed $options
     * @param mixed $needGoogle
     * @param mixed $gKey
     */
    public function testGoogle($options, $needGoogle, $gKey): void
    {
        $config = new Project\ProjectConfig((object) array('options' => $options));
        $proj = new ProjectForTests();
        $proj->setCfg($config);
        $this->assertEquals($needGoogle, $proj->needsGoogle());
        $this->assertEquals($gKey, $proj->getGoogleKey());
    }

    public static function getCheckAclData()
    {
        $result1 = array('lizmap.repositories.view' => false);
        $result2 = array(
            'lizmap.repositories.view' => true,
            'userIsConnected' => false,
        );
        $result3 = array(
            'lizmap.repositories.view' => true,
            'userIsConnected' => true,
            'lizmap.admin.repositories.delete' => false,
            'groups' => array('group1', 'group2'),
        );
        $result4 = array(
            'lizmap.repositories.view' => true,
            'userIsConnected' => true,
            'lizmap.admin.repositories.delete' => true,
        );
        $options1 = (object) array(
            'acl' => array('none'),
        );
        $options2 = (object) array(
            'acl' => '',
        );
        $options3 = (object) array(
            'acl' => array('group1'),
        );

        return array(
            array($result1, (object) array(), false),
            array($result2, $options2, true),
            array($result2, $options1, false),
            array($result3, $options1, false),
            array($result3, $options3, true),
            array($result4, $options1, false),
        );
    }

    /**
     * @dataProvider getCheckAclData
     *
     * @param mixed $aclData
     * @param mixed $options
     * @param mixed $expectedRet
     */
    public function testCheckAcl($aclData, $options, $expectedRet): void
    {
        $rep = new Project\Repository('key', array(), null, null, null);
        $context = new ContextForTests();
        $context->setResult($aclData);
        $config = new Project\ProjectConfig((object)array('options' => $options));
        $proj = new ProjectForTests($context);
        $proj->setRepo($rep);
        $proj->setCfg($config);
        $this->assertEquals($expectedRet, $proj->checkAcl());
    }

    public static function userFiles4Projets() {
        $eventsBaseURL = 'view~media:getMedia?repository=repo1&project=events&';
        return array(
            array(
                'montpellier',
                'montpellier',
                array('path' => __DIR__.'/../../../qgis-projects/demoqgis'),
                array(
                    'css'=> array(),
                    'mjs' => array(),
                    'js' => array()
                    ),
                ),
            array(
                'events',
                'repo1',
                array('path' => __DIR__.'/Ressources/root4Repository/repo1'),
                array('css'=> array(
                    'view~media:getCssFile?repository=repo1&project=events&path=media/js/events/style1.css'
                    ),
                    'mjs' => array(
                    'view~media:getMedia?repository=repo1&project=events&path=media/js/events/mjs.mjs'
                    ),
                    'js' => array(
                    $eventsBaseURL.'path=media/js/default/jsdefaultinrepo.js',
                    $eventsBaseURL.'path=../media/js/default/jsdefaultinroot.js',
                    $eventsBaseURL.'path=media/js/events/subfolder/jsinsubfolder.js',
                    $eventsBaseURL.'path=media/js/events/jsprojetinrepo.js',
                    $eventsBaseURL.'path=../media/js/events/jsprojetinroot.js',
                    )
                    )
                )
               ,
        );
    }

    /**
     * @dataProvider userFiles4Projets
     */
    public function testFinder(string $projectName, $repoName, array $projectData, array $expectedFiles): void {
        $repo = new Project\Repository($repoName, $projectData
           , null, null, null
        );

        $project = new ProjectForTests();
        $project->setRepo($repo);
        $project->setKey($projectName);
        $finder = new ProjectFilesFinder();
        $listFiles = $finder->listFileURLS($project, true);
        foreach($listFiles as $fileExt => $list) {
            // remove mtime=XXX From URLs
            $urlsWithoutMtime = array_map( function ($url) {
                $urlok = preg_replace('/&mtime=[0-9]*/', '', $url);
                return $urlok;
            }, $list);
            // sorting to ensure list are in same order
            sort($urlsWithoutMtime);
            sort($expectedFiles[$fileExt]);
            $this->assertEquals($urlsWithoutMtime, $expectedFiles[$fileExt]);
        }
    }
}
