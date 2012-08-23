<?php
/**
* @package    jelix
* @subpackage installer
* @author     Laurent Jouanneau
* @copyright  2011 Laurent Jouanneau
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
     * @var string the project xml filename
     */
    protected $projectXmlFilename = 'project.xml';

    /**
     * @var array list of entry point (jInstallerEntryPoint)
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

    public function getEntryPointsList() {

        if ($this->entryPointList !== null)
            return $this->entryPointList;

        $listEps = $this->projectXml->documentElement->getElementsByTagName("entrypoints");
        if (!$listEps->length) {
            $this->entryPointList = array();
            return $this->entryPointList;
        }

        $listEp = $listEps->item(0)->getElementsByTagName("entry");
        if(!$listEp->length) {
            $this->entryPointList = array();
            return $this->entryPointList;
        }

        $defaultConfig = new jIniFileModifier(jApp::configPath('defaultconfig.ini.php'));

        $this->entryPointList = array();
        for ($i=0; $i < $listEp->length; $i++) {
            $epElt = $listEp->item($i);
            $ep = new jInstallerEntryPoint($defaultConfig,
                                           $epElt->getAttribute("config"),
                                           $epElt->getAttribute("file"),
                                           $epElt->getAttribute("type"));
            $this->entryPointList[] = $ep;
        }
        return $this->entryPointList;
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
