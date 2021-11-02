<?php
/**
* @package    jelix
* @subpackage installer
* @author     Laurent Jouanneau
* @copyright  2011-2021 Laurent Jouanneau
* @link       http://jelix.org
* @licence    http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
* Application configuration reader and manager
* @package    jelix
* @subpackage installer
* @since 1.3
*/
class jInstallerApplication {

    /**
     * @var DOMDocument the content of the project.xml file, loaded by loadProjectXml
     */
    protected $projectXml = null;

    /**
     * @var array list of entrypoints declared into localframework.ini.php
     */
    protected $localFrameworkConfig = array();

    /**
     * @var string the project xml filename
     */
    protected $projectXmlFilename = 'project.xml';

    /**
     * @var jInstallerEntryPoint[] list of entry points
     */
    protected $entryPointList = null;

    /**
     * @var string the application name
     */
    protected $appName = '';

    /**
     * @param string $projectFile the filename of the XML project file
     */
    function __construct($projectFile='') {

        if ($projectFile != '')
            $this->projectXmlFilename = $projectFile;

        $this->loadProjectXml();
        $this->loadFrameworkConfig();
    }

    /**
     * load the content of the project.xml file, and store the corresponding DOM
     * into the $projectXml property
     */
    protected function loadProjectXml() {
    
        $doc = new DOMDocument();

        if (!$doc->load(jApp::appPath($this->projectXmlFilename))){
           throw new Exception("cannot load ".$this->projectXmlFilename);
        }

        $root = $doc->documentElement;

        if ($root->namespaceURI != JELIX_NAMESPACE_BASE.'project/1.0'){
           throw new Exception("bad namespace in ".$this->projectXmlFilename);
        }

        $info = $root->getElementsByTagName("info");
        if ($info->length && $info->item(0)->hasAttribute('name')) {
            $this->appName = $info->item(0)->getAttribute('name');
        }

        $this->projectXml = $doc;
    }

    protected function loadFrameworkConfig()
    {
        $localFmkFile = jApp::configPath('localframework.ini.php');
        if (!file_exists($localFmkFile)) {
            return;
        }
        $localFmkConfig = parse_ini_file($localFmkFile, true);
        foreach($localFmkConfig as $section => $epConfig) {
            if (!is_array($epConfig) ) {
                continue;
            }
            if (!preg_match('/^entrypoint:(.*)$/', $section, $m)) {
                continue;
            }
            $epConfig['file'] = $m[1];
            $this->localFrameworkConfig[] = $epConfig;
        }
    }

    public function getEntryPointsList()
    {
        if ($this->entryPointList !== null) {
            return $this->entryPointList;
        }
        $this->entryPointList = array();
        $mainConfig = new jIniFileModifier(jApp::mainConfigFile());
        $this->fillEntryPointsListFromXml($mainConfig);
        $this->fillEntryPointsListFromIni($mainConfig);
        return $this->entryPointList;
    }

    /**
     * @param jIniFileModifier $mainConfig
     */
    protected function fillEntryPointsListFromXml($mainConfig)
    {
        $listEps = $this->projectXml->documentElement->getElementsByTagName("entrypoints");
        if (!$listEps->length) {
            return;
        }

        $listEp = $listEps->item(0)->getElementsByTagName("entry");
        if(!$listEp->length) {
            return;
        }

        for ($i=0; $i < $listEp->length; $i++) {
            $epElt = $listEp->item($i);
            $ep = new jInstallerEntryPoint($mainConfig,
                                           $epElt->getAttribute("config"),
                                           $epElt->getAttribute("file"),
                                           $epElt->getAttribute("type"));
            $this->entryPointList[] = $ep;
        }
    }

    /**
     * @param jIniFileModifier $mainConfig
     */
    protected function fillEntryPointsListFromIni($mainConfig)
    {
        if (!count($this->localFrameworkConfig)) {
            return;
        }

        foreach ($this->localFrameworkConfig as $epConfig) {
            $ep = new jInstallerEntryPoint($mainConfig,
                                           $epConfig['config'],
                                           $epConfig['file'],
                                           $epConfig['type']);
            $this->entryPointList[] = $ep;
        }
    }

    public function getEntryPointInfo($name) {
        if (($p = strpos($name, '.php')) !== false)
           $name = substr($name,0,$p);

        $eplist = $this->getEntryPointsList();
        foreach ($eplist as $ep) {
            if ($ep->getEpId() == $name)
                return $ep;
        }
        return null;
    }
}
