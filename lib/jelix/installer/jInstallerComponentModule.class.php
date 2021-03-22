<?php
/**
* @package     jelix
* @subpackage  installer
* @author      Laurent Jouanneau
* @copyright   2008-2018 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* a class to install a module.
* @package     jelix
* @subpackage  installer
* @since 1.2
*/
class jInstallerComponentModule extends jInstallerComponentBase {

    /**
     * @var string the namespace of the xml file
     */
    protected $identityNamespace = '!^https?\\://jelix\\.org/ns/module/1\\.0$!';

    /**
     * @var string the expected name of the root element in the xml file
     */
    protected $rootName = 'module';

    /**
     * @var string the name of the xml file
     */
    protected $identityFile = 'module.xml';

    /**
     * @var jInstallerBase
     */
    protected $moduleInstaller = null;

    /**
     * @var jInstallerBase[]
     */
    protected $moduleUpgraders = null;

    /**
     * @var jInstallerModule
     */
    protected $moduleMainUpgrader = null;

    /**
     * list of sessions Id of the component
     */
    protected $installerContexts = array();

    protected $upgradersContexts = array();

    function __construct($name, $path, $mainInstaller) {
        parent::__construct($name, $path, $mainInstaller);
        if ($mainInstaller) {
            $ini = $mainInstaller->installerIni;
            $contexts = $ini->getValue($this->name.'.contexts','__modules_data');
            if ($contexts !== null && $contexts !== "") {
                $this->installerContexts = explode(',', $contexts);
            }
        }
    }

    /**
     * If no access is defined for the module, we should set it one
     *
     *
     * @param jIniMultiFilesModifier $config mainconfig.ini.php (master) and entrypoint config (overrider)
     * @param jIniMultiFilesModifier $localconfig mainconfig.ini.php + localconfig.ini.php
     */
    protected function _setAccess($config, $localconfig)
    {
        $epConfig = $config->getOverrider();
        $access = $epConfig->getValue($this->name.'.access', 'modules');

        if ($access === 0 || $access === null || $access === '') {
            // access is not defined or is defined to 0. We must set it to 1 or 2
            $localAccess = $localconfig->getValue($this->name.'.access', 'modules');
            if ($localAccess === 0 || $localAccess === null || $localAccess === '') {
                // if there is no global access value, let's set to 2
                $epConfig->setValue($this->name . '.access', 2, 'modules');
            }
            else if ($localAccess === 3) {
                $epConfig->setValue($this->name.'.access', 1, 'modules');
            }
            else {
                // there is a global access value to 1 or 2, be sure we remove
                // the access value from the ep config, to avoid duplication
                // and to remove possible "0" value
                $epConfig->removeValue($this->name . '.access', 'modules');
            }
            $epConfig->save();
        }
        else if ($access == 3) {
            $epConfig->setValue($this->name.'.access', 1, 'modules');
            $epConfig->save();
        }
    }

    /**
     * get the object which is responsible to install the component. this
     * object should implement jIInstallerComponent.
     *
     * @param jInstallerEntryPoint $ep the entry point
     * @param boolean $installWholeApp true if the installation is done during app installation
     * @return jIInstallerComponent the installer, or null if there isn't any installer
     *         or false if the installer is useless for the given parameter
     * @throws jInstallerException
     */
    function getInstaller($ep, $installWholeApp) {

        $this->_setAccess($ep->configIni, $ep->localConfigIni->getMaster());

        // false means that there isn't an installer for the module
        if ($this->moduleInstaller === false) {
            return null;
        }

        $epId = $ep->getEpId();

        if ($this->moduleInstaller === null) {
            if ($this->moduleInfos[$epId]->skipInstaller) {
                $this->moduleInstaller = false;
                return null;
            }
            // script name for modules that provide install.php for Jelix 1.7
            // and install_1_6.php for Jelix 1.6
            $script = 'install_1_6.php';
            if (!file_exists($this->path.'install/'.$script)) {
                $script = 'install.php'; // deprecated script name for Jelix 1.6
                if (!file_exists($this->path.'install/'.$script)) {
                    $this->moduleInstaller = false;
                    return null;
                }
            }
            require_once($this->path.'install/'.$script);
            $cname = $this->name.'ModuleInstaller';
            if (!class_exists($cname))
                throw new jInstallerException("module.installer.class.not.found",array($cname,$this->name));
            $this->moduleInstaller = new $cname($this->name,
                                                $this->name,
                                                $this->path,
                                                $this->sourceVersion,
                                                $installWholeApp
                                                );
        }

        $this->moduleInstaller->setParameters($this->moduleInfos[$epId]->parameters);
        if ($ep->localConfigIni) {
            $sparam = $ep->localConfigIni->getValue($this->name.'.installparam','modules');
        }
        else {
            $sparam = $ep->configIni->getValue($this->name.'.installparam','modules');
        }
        if ($sparam === null)
            $sparam = '';
        $sp = $this->moduleInfos[$epId]->serializeParameters();
        if ($sparam != $sp) {
            $ep->configIni->setValue($this->name.'.installparam', $sp, 'modules');
        }

        $this->moduleInstaller->setEntryPoint($ep,
                                              $ep->configIni,
                                              $this->moduleInfos[$epId]->dbProfile,
                                              $this->installerContexts);

        return $this->moduleInstaller;
    }

    /**
     * return the list of objects which are responsible to upgrade the component
     * from the current installed version of the component.
     *
     * this method should be called after verifying and resolving
     * dependencies. Needed components (modules or plugins) should be
     * installed/upgraded before calling this method
     *
     * @param jInstallerEntryPoint $ep the entry point
     * @return jIInstallerComponent[]
     * @throws jInstallerException
     * @throw jInstallerException  if an error occurs during the install.
     */
    function getUpgraders($ep) {

        $epId = $ep->getEpId();


        if ($this->moduleMainUpgrader === null) {
            // script name for Jelix 1.6 in modules compatibles with both Jelix 1.7 and 1.6
            if (file_exists($this->path . 'install/upgrade_1_6.php')) {
                $file = $this->path . 'install/upgrade_1_6.php';
            }
            // script name for modules compatible with Jelix <=1.6
            else if (file_exists($this->path . 'install/upgrade.php')) {
                $file = $this->path . 'install/upgrade.php';
            }
            else {
                $file = '';
            }

            if ($file == '' || $this->moduleInfos[$epId]->skipInstaller) {
                $this->moduleMainUpgrader = false;
            }
            else {
                require_once($file);

                $cname = $this->name.'ModuleUpgrader';
                if (!class_exists($cname)) {
                    throw new Exception("module.upgrader.class.not.found", array($cname, $this->name));
                }

                $this->moduleMainUpgrader = new $cname($this->name,
                    $this->name,
                    $this->path,
                    $this->moduleInfos[$epId]->version,
                    false
                );

                $this->moduleMainUpgrader->targetVersions= array($this->moduleInfos[$epId]->version);
            }
        }

        if ($this->moduleUpgraders === null) {

            $this->moduleUpgraders = array();

            $p = $this->path.'install/';
            if (!file_exists($p)  || $this->moduleInfos[$epId]->skipInstaller) {
                return array();
            }

            // we get the list of files for the upgrade
            $fileList = array();
            if ($handle = opendir($p)) {
                while (false !== ($f = readdir($handle))) {
                    if (!is_dir($p.$f)) {
                        if (preg_match('/^upgrade_to_([^_]+)_([^\.]+)\.php$/', $f, $m)) {
                            $fileList[] = array($f, $m[1], $m[2]);
                        }
                        else if (preg_match('/^upgrade_([^\.]+)\.php$/', $f, $m)){
                            $fileList[] = array($f, '', $m[1]);
                        }
                    }
                }
                closedir($handle);
            }

            // now we order the list of file
            foreach($fileList as $fileInfo) {
                require_once($p.$fileInfo[0]);
                $cname = $this->name.'ModuleUpgrader_'.$fileInfo[2];
                if (!class_exists($cname))
                    throw new jInstallerException("module.upgrader.class.not.found",array($cname,$this->name));

                $upgrader = new $cname($this->name,
                                        $fileInfo[2],
                                        $this->path,
                                        $fileInfo[1],
                                        false);

                if ($fileInfo[1] && count($upgrader->targetVersions) == 0) {
                    $upgrader->targetVersions = array($fileInfo[1]);
                }
                if (count($upgrader->targetVersions) == 0) {
                    throw new jInstallerException("module.upgrader.missing.version",array($fileInfo[0], $this->name));
                }
                $this->moduleUpgraders[] = $upgrader;
            }
        }

        if ((count($this->moduleUpgraders) || $this->moduleMainUpgrader) && $this->moduleInfos[$epId]->version == '') {
            throw new jInstallerException("installer.ini.missing.version", array($this->name));
        }

        $list = array();

        foreach($this->moduleUpgraders as $upgrader) {

            $foundVersion = '';
            // check the version
            foreach($upgrader->targetVersions as $version) {
                if (jVersionComparator::compareVersion($this->moduleInfos[$epId]->version, $version) >= 0 ) {
                    // we don't execute upgraders having a version lower than the installed version (they are old upgrader)
                    continue;
                }
                if (jVersionComparator::compareVersion($this->sourceVersion, $version) < 0 ) {
                    // we don't execute upgraders having a version higher than the version indicated in the module.xml
                    continue;
                }
                $foundVersion = $version;
                // when multiple version are specified, we take the first one which is ok
                break;
            }
            if (!$foundVersion)
                continue;

            $upgrader->version = $foundVersion;

            // we have to check now the date of versions
            // we should not execute the updater in some case.
            // for example, we have an updater for the 1.2 and 2.3 version
            // we have the 1.4 installed, and want to upgrade to the 2.5 version
            // we should not execute the update for 2.3 since modifications have already been
            // made into the 1.4. The only way to now that, is to compare date of versions
            if ($upgrader->date != '' && $this->mainInstaller) {
                $upgraderDate = $this->_formatDate($upgrader->date);

                // the date of the first version installed into the application
                $firstVersionDate = $this->_formatDate($this->mainInstaller->installerIni->getValue($this->name.'.firstversion.date', $epId));
                if ($firstVersionDate !== null) {
                    if ($firstVersionDate >= $upgraderDate)
                        continue;
                }

                // the date of the current installed version
                $currentVersionDate = $this->_formatDate($this->mainInstaller->installerIni->getValue($this->name.'.version.date', $epId));
                if ($currentVersionDate !== null) {
                    if ($currentVersionDate >= $upgraderDate)
                        continue;
                }
            }

            $upgrader->setParameters($this->moduleInfos[$epId]->parameters);
            $class = get_class($upgrader);

            if (!isset($this->upgradersContexts[$class])) {
                $this->upgradersContexts[$class] = array();
            }

            $upgrader->setEntryPoint($ep,
                                    $ep->configIni,
                                    $this->moduleInfos[$epId]->dbProfile,
                                    $this->upgradersContexts[$class]);
            $list[] = $upgrader;
        }
        // now let's sort upgrader, to execute them in the right order (oldest before newest)
        usort($list, function ($upgA, $upgB) {
                return jVersionComparator::compareVersion($upgA->version, $upgB->version);
        });

        if ($this->moduleMainUpgrader && jVersionComparator::compareVersion($this->moduleInfos[$epId]->version, $this->sourceVersion) < 0 ) {
            $list[] = $this->moduleMainUpgrader;
            $class = $this->name.'ModuleUpgrader';
            if (!isset($this->upgradersContexts[$class])) {
                $this->upgradersContexts[$class] = array();
            }

            $this->moduleMainUpgrader->setEntryPoint($ep,
                $ep->configIni,
                $this->moduleInfos[$epId]->dbProfile,
                $this->upgradersContexts[$class]);
        }

        return $list;
    }

    public function installFinished($ep) {
        $this->installerContexts = $this->moduleInstaller->getContexts();
        if ($this->mainInstaller)
            $this->mainInstaller->installerIni->setValue($this->name.'.contexts', implode(',',$this->installerContexts), '__modules_data');
    }

    public function upgradeFinished($ep, $upgrader) {
        $class = get_class($upgrader);
        $this->upgradersContexts[$class] = $upgrader->getContexts();
    }


    protected function _formatDate($date) {
        if ($date !== null) {
            if (strlen($date) == 10)
                $date.=' 00:00';
            else if (strlen($date) > 16) {
                $date = substr($date, 0, 16);
            }
        }
        return $date;
    }

}
