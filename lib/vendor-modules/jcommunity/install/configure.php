<?php
/**
 * @author      Laurent Jouanneau
 * @copyright   2018 Laurent Jouanneau
 * @license  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */
use \Jelix\Installer\Module\API\ConfigurationHelpers;

class jcommunityModuleConfigurator extends \Jelix\Installer\Module\Configurator {



    public function getDefaultParameters()
    {
        return array(
            'manualconfig' => false,
            'masteradmin' => false,
            'migratejauthdbusers' => true,
            'usejpref' => false,
            'defaultusers'=> '', // selector of a json file in an install/ of a module
            'defaultuser' => true, // install users from defaultusers.json
            'eps'=>array()
        );
    }

    public function configure(ConfigurationHelpers $helpers)
    {
        $cli = $helpers->cli();
        $this->parameters['eps'] = $cli->askEntryPoints(
            'Select entry points on which to setup authentication plugins.',
            $helpers->getEntryPointsByType('classic'),
            true
        );

        $alreadyConfig = false;
        foreach($this->parameters['eps'] as $epId) {
            $ep = $helpers->getEntryPointsById($epId);
            if ($ep->getConfigIni()->getValue('auth','coordplugins')) {
                $alreadyConfig = true;
                break;
            }
        }
        if ($alreadyConfig) {
            $this->parameters['manualconfig'] = $cli->askConfirmation('Do you will modify yourself the existing authcoord.ini.php configuration file?', false);
        }
        else {
            $this->parameters['manualconfig'] = false;
        }

        $this->parameters['migratejauthdbusers'] = $cli->askConfirmation('Do you want to migrate users from the jlx_user table to the jcommunity table?', $this->parameters['migratejauthdbusers']);
        $this->parameters['defaultuser'] = $cli->askConfirmation('Do you want to create default users into the jcommunity table?', $this->parameters['defaultuser']);
        $this->parameters['masteradmin'] = $cli->askConfirmation('Do you use jCommunity with the master_admin module?', $this->parameters['masteradmin']);
        $this->parameters['usejpref'] = $cli->askConfirmation('Do you want to use jPref to manage some parameters?', $this->parameters['usejpref']);


        // retrieve current jcommunity section
        $defaultConfig = array(
            'loginResponse' => 'html',
            'verifyNickname' =>true,
            'passwordChangeEnabled' =>true,
            'accountDestroyEnabled' =>true,
            'useJAuthDbAdminRights' =>false,
            'registrationEnabled' =>true,
            'resetPasswordEnabled' =>true,
            'resetPasswordAdminEnabled' =>true,
            'disableJPref' =>true,
            'publicProperties' =>array('login', 'nickname', 'create_date')
        );

        foreach($defaultConfig as $name => $defaultValue) {
            $value = $helpers->getConfigIni()->getValue($name, 'jcommunity');
            if ($value !== null) {
                $defaultConfig[$name] = $value;
            }
        }

        $defaultConfig['registrationEnabled'] = $cli->askConfirmation('Is the registration enabled?', $defaultConfig['registrationEnabled']);
        $defaultConfig['resetPasswordEnabled'] = $cli->askConfirmation('Can the user reset his password when he forgot it?', $defaultConfig['resetPasswordEnabled']);
        $defaultConfig['resetPasswordAdminEnabled'] = $cli->askConfirmation('Can administrators reset user password instead of setting a password himself?', $defaultConfig['resetPasswordAdminEnabled']);
        $defaultConfig['passwordChangeEnabled'] = $cli->askConfirmation('Can the user change his password?', $defaultConfig['passwordChangeEnabled']);
        $defaultConfig['accountDestroyEnabled'] = $cli->askConfirmation('Can the user destroy his account?', $defaultConfig['accountDestroyEnabled']);
        $helpers->getConfigIni()->setValues($defaultConfig, 'jcommunity');

        foreach($this->getParameter('eps') as $epId) {
            $this->configureEntryPoint($epId, $helpers);
        }
    }

    public function configureEntryPoint($epId, ConfigurationHelpers $helpers) {
        $entryPoint = $helpers->getEntryPointsById($epId);

        $configIni = $entryPoint->getConfigIni();

        $authconfig = $configIni->getValue('auth','coordplugins');

        if (!$authconfig) {
            $pluginIni = 'auth.coord.ini.php';
            $authconfig = dirname($entryPoint->getConfigFile()).'/auth.coord.ini.php';

            // no configuration, let's install the plugin for the entry point
            $configIni->setValue('auth', $authconfig, 'coordplugins');
            $helpers->copyFile('var/config/'.$pluginIni, 'config:'.$pluginIni);
        }
        else {
            list($conf, $section) = $entryPoint->getCoordPluginConfig('auth');

            if (!$this->getParameter('manualconfig')) {
                $conf->setValue('driver', 'Db');
                $conf->setValue('dao','jcommunity~user', 'Db');
                $conf->setValue('form','jcommunity~account_admin', 'Db');
                $conf->setValue('error_message', 'jcommunity~login.error.notlogged');
                $conf->setValue('on_error_action', 'jcommunity~login:out');
                $conf->setValue('bad_ip_action', 'jcommunity~login:out');
                $conf->setValue('after_logout', 'jcommunity~login:index');
                $conf->setValue('enable_after_login_override', 'on');
                $conf->setValue('enable_after_logout_override', 'on');
                $conf->setValue('after_login', 'jcommunity~account:show');
                $conf->save();
            }
            else {
                $daoSelector = $conf->getValue('dao', 'Db');
                if (!$daoSelector) {
                    $daoSelector = 'jcommunity~user';
                    $conf->setValue('dao', $daoSelector, 'Db');
                }

                if ($daoSelector == 'jcommunity~user') {
                    $conf->setValue('form', 'jcommunity~account_admin', 'Db');
                }
                $conf->save();
            }
        }

        if ($this->getParameter('masteradmin')) {
            list($conf, $section) = $entryPoint->getCoordPluginConfig('auth');
            $conf->setValue('after_login', 'master_admin~default:index');
            $conf->save();
            $configIni->setValue('loginResponse', 'htmlauth', 'jcommunity');
        }

        if ($this->getParameter('usejpref')) {
            $helpers->getConfigIni()->setValue('disableJPref', false, 'jcommunity');
            $prefIni = new \Jelix\IniFile\IniModifier(__DIR__.'/prefs.ini');
            $prefFile = $helpers->configFilePath('preferences.ini.php');
            if (file_exists($prefFile)) {
                $mainPref = new \Jelix\IniFile\IniModifier($prefFile);
                //import this way to not erase changed value.
                $prefIni->import($mainPref);
            }
            $prefIni->saveAs($prefFile);
        }
    }
}