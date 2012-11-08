<?php
/**
* @package    jelix-scripts
* @author     Laurent Jouanneau
* @copyright  2011 Laurent Jouanneau
* @link       http://jelix.org
* @licence    http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/


/**
 * configuration for commands
 */
class JelixScriptCommandConfig {

    /**
     * @var string the suffix part of generated name of new modules. value readed from project.xml
     */
    public $infoIDSuffix='@yourwebsite.undefined';

    /**
     * @var string the web site of the project or your company. value readed from project.xml
     */
    public $infoWebsite='http://www.yourwebsite.undefined';

    /**
     * @var string the licence of generated files. value readed from project.xml
     */
    public $infoLicence='All rights reserved';

    /**
     * @var string link to the licence. value readed from project.xml
     */
    public $infoLicenceUrl='';

    /**
     * @var string the creator's name inserted in new files headers
     */
    public $infoCreatorName='your name';

    /**
     * @var string the creator's mail inserted in new file headers
     */
    public $infoCreatorMail='your-email@yourwebsite.undefined';

    /**
     * @var string copyright of new files. value readed from project.xml
     */
    public $infoCopyright='2011 your name';

    /**
     * @var string default timezone for new app
     */
    public $infoTimezone='Europe/Paris';

    /**
     * @var string default locale for new app
     */
    public $infoLocale='en_US';

    /**
     * @var boolean true = a chmod is done on new files and directories
     */
    public $doChmod = false;

    /**
     * @var integer chmod value on new files
     */
    public $chmodFileValue = 0644;

    /**
     * @var integer chmod value on new dir
     */
    public $chmodDirValue = 0644;

    /**
     * @var boolean true = a chown is done on new files and directories
     */
    public $doChown = false;

    /**
     * @var string define the user owner of new files/dir
     */
    public $chownUser = '';

    /**
     * @var string define the group owner of new files/dir
     */
    public $chownGroup = '';

    /**
     * @var boolean true = help messages in console are displayed with utf-8 charset
     */
    public $displayHelpUtf8 = true;

    /**
     * @var string the lang code for help messages
     */
    public $helpLang = 'en';

    /**
     * @var boolean true = debug mode
     */
    public $debugMode = false;

    /**
     * @var boolean true = verbose mode, -v flag is implicit.
     */
    public $verboseMode = false;

    public $layoutTempPath = '%appdir%/../temp/%appname%/';
    public $layoutWwwPath = '%appdir%/www/';
    public $layoutVarPath = '%appdir%/var/';
    public $layoutLogPath = '%appdir%/var/log/';
    public $layoutConfigPath = '%appdir%/var/config/';
    public $layoutScriptsPath = '%appdir%/scripts/';

    /*
    // linux layout example
    // jelix is stored in /usr/local/lib/jelix-1.3/
    // apps are stored in /usr/local/lib/jelix-apps/%appname%/ (=%appdir%)
    public $layoutTempPath = '/var/tmp/jelix-apps/%appname%/';
    public $layoutWwwPath = '/var/www/jelix-apps/%appname%/';
    public $layoutVarPath = '/var/lib/jelix-apps/%appname%/';
    public $layoutLogPath = '/var/log/jelix-apps//%appname%/';
    public $layoutConfigPath = '/etc/jelix-apps/%appname%/';
    public $layoutScriptsPath = '%appdir%/scripts/';
    */

    /**
     * @var string the suffix part of generated name of modules in a new project
     */
    public $newAppInfoIDSuffix='@yourwebsite.undefined';

    /**
     * @var string the web site of the project or your company, used in a new project
     */
    public $newAppInfoWebsite='http://www.yourwebsite.undefined';

    /**
     * @var string the licence of generated files, for a new project
     */
    public $newAppInfoLicence='All rights reserved';

    /**
     * @var string link to the licence, for a new project
     */
    public $newAppInfoLicenceUrl='';

    /**
     * @var string copyright of new projects
     */
    public $newAppInfoCopyright='2011 your name';

    /**
     * @var string
     */
    public $newAppInfoLocale='en_US';

    /**
     * name of the application. cannot be indicated into configuration files
     */
    public $appName = '';

    function initAppPaths($applicationDir) {
        rtrim($applicationDir, '/');
        rtrim($applicationDir, '\\');
        $appname = basename($applicationDir);
        $search = array( '%appdir%', '%appname%');
        $replace = array($applicationDir, $appname);
        jApp::initPaths(
            $applicationDir.'/',
            str_replace($search, $replace, $this->layoutWwwPath),
            str_replace($search, $replace, $this->layoutVarPath),
            str_replace($search, $replace, $this->layoutLogPath),
            str_replace($search, $replace, $this->layoutConfigPath),
            str_replace($search, $replace, $this->layoutScriptsPath)
        );
        jApp::setTempBasePath(str_replace($search, $replace, $this->layoutTempPath));
    }

    /**
     * fill some properties from informations stored into the project.xml file.
     * @return string the application name
     */
    function loadFromProject() {

        $doc = new DOMDocument();

        if (!$doc->load(jApp::appPath('project.xml'))){
            throw new Exception("cannot load project.xml");
        }

        if ($doc->documentElement->namespaceURI != JELIX_NAMESPACE_BASE.'project/1.0'){
            throw new Exception("bad namespace in project.xml");
        }

        $info = $doc->getElementsByTagName('info');
        $info = $info->item(0);
        $id = $info->getAttribute('id');
        list($name, $suffix) = explode('@', $id);
        if ($suffix=='')
            $suffix = $name;
        $this->infoIDSuffix = $suffix;
        if ($info->getAttribute('name')) {
            $name = $info->getAttribute('name');
        }

        $licence = $info->getElementsByTagName('licence');
        if ($licence->length) {
            $licence = $licence->item(0);
            $this->infoLicence = $licence->textContent;
            $this->infoLicenceUrl = $licence->getAttribute('URL');
        }

        $copyright = $info->getElementsByTagName('copyright');
        if ($copyright->length) {
            $copyright = $copyright->item(0);
            $this->infoCopyright = $copyright->textContent;
        }

        $website = $info->getElementsByTagName('homepageURL');
        if ($website->length) {
            $website = $website->item(0);
            $this->infoWebsite = $website->textContent;
        }
        return $name;
    }

    /**
     * fill some properties from informations stored in an ini file.
     * @param string $iniFile the filename
     * @param string $appname the application name
     */
    function loadFromIni($iniFile, $appname='') {
        if (!file_exists($iniFile)) {
            return;
        }
        $ini = parse_ini_file($iniFile);
        foreach ($ini as $key=>$value) {
            if (!is_array($value) && isset($this->$key)) {
                $this->$key = $value;
            }
        }
        if ($appname && isset($ini[$appname])) {
            foreach ($ini[$appname] as $key=>$value) {
                if (isset($this->$key))
                    $this->$key = $value;
            }
        }
    }
}
