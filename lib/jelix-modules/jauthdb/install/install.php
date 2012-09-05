<?php
/**
* @package     jelix
* @subpackage  jauthdb module
* @author      Laurent Jouanneau
* @contributor
* @copyright   2009-2011 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * parameters for this installer
 *    - defaultuser      add a default user, admin
 */
class jauthdbModuleInstaller extends jInstallerModule {

    function install() {
        //if ($this->entryPoint->type == 'cmdline')
        //    return;

        $authconfig = $this->config->getValue('auth','coordplugins');

        if ($authconfig && $this->firstExec($authconfig)) {
            // a config file for the auth plugin exists, so we can install
            // the module, else we ignore it

            $conf = new jIniFileModifier(jApp::configPath($authconfig));
            $driver = $conf->getValue('driver');

            if ($driver == '') {
                $driver = 'Db';
                $conf->setValue('driver','Db');
                $conf->setValue('dao','jauthdb~jelixuser', 'Db');
                $conf->save();
            }
            else if ($driver != 'Db') {
                return;
            }

            $this->useDbProfile($conf->getValue('profile', 'Db'));

            // FIXME: should use the given dao to create the table
            $daoName = $conf->getValue('dao', 'Db');
            if ($daoName == 'jauthdb~jelixuser' && $this->firstDbExec()) {

                $this->execSQLScript('install_jauth.schema');
                if ($this->getParameter('defaultuser')) {
                    require_once(JELIX_LIB_PATH.'auth/jAuth.class.php');
                    require_once(JELIX_LIB_PATH.'plugins/auth/db/db.auth.php');
                    $confIni = parse_ini_file(jApp::configPath($authconfig), true);
                    $driver = new dbAuthDriver($confIni['Db']);
                    $password = $driver->cryptPassword('admin');

                    $cn = $this->dbConnection();
                    $cn->exec("INSERT INTO ".$cn->prefixTable('jlx_user')." (usr_login, usr_password, usr_email ) VALUES
                                ('admin', ".$cn->quote($password)." , 'admin@localhost.localdomain')");
                }
            }
        }
    }
}
