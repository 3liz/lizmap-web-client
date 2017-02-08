<?php
/**
* @package     jelix
* @subpackage  installer
* @author      Laurent Jouanneau
* @copyright   2008-2011 Laurent Jouanneau
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
    protected $identityNamespace = 'http://jelix.org/ns/module/1.0';

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
     * @param jIniMultiFilesModifier $config
     */
    protected function _setAccess($config) {
        $access = $config->getValue($this->name.'.access', 'modules');
        if ($access == 0 || $access == null) {
            $config->setValue($this->name.'.access', 2, 'modules');
            $config->save();
        }
        else if ($access == 3) {
            $config->setValue($this->name.'.access', 1, 'modules');
            $config->save();
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

        $this->_setAccess($ep->configIni);

        // false means that there isn't an installer for the module
        if ($this->moduleInstaller === false) {
            return null;
        }

        $epId = $ep->getEpId();

        if ($this->moduleInstaller === null) {
            if (!file_exists($this->path.'install/install.php') || $this->moduleInfos[$epId]->skipInstaller) {
                $this->moduleInstaller = false;
                return null;
            }
            require_once($this->path.'install/install.php');
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

        if ($this->moduleUpgraders === null) {

            $this->moduleUpgraders = array();

            $p = $this->path.'install/';
            if (!file_exists($p)  || $this->moduleInfos[$epId]->skipInstaller)
                return array();

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

            if (!count($fileList)) {
                return array();
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
                $this->moduleUpgraders[] = $upgrader;
            }
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
