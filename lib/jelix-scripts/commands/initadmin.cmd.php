<?php
/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @contributor
* @copyright   2008-2011 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

class initadminCommand extends JelixScriptCommand {

    public  $name = 'initadmin';
    public  $allowed_options=array('-noauthdb'=>false,
                                   '-noacl2db'=>false,
                                   '-profile'=>true);
    public  $allowed_parameters=array('entrypoint'=>true);

    public  $syntaxhelp = "[-noauthdb] [-noacl2db] [-profile a_jdb_profile] entrypoint";
    public  $help='';

    function __construct($config){
        $this->help= array(
            'fr'=>"
    Initialise l'application avec interface d'administration en utilisant
    le module master_admin ainsi que jAuth et jAcl.

    Les options -noauthdb et -noacl2db indiquent de ne pas utiliser et configurer
    respectivement le driver db pour jAuth et le driver db pour jAcl2. La configuration
    de jAcl2 et de jAuth pour l'accés à l'administration sera donc à votre charge.

    L'option -profile permet d'indiquer le profil jDb à utiliser pour les drivers
    db de jAuth et jAcl2.

    L'argument entrypoint permet d'indique le point d'entrée qui sera utilisé pour
    l'administration. Attention, si le point d'entrée existe déjà, il sera reconfiguré.
    ",
            'en'=>"
    Initialize the application with a web interface for administration, by activating
    the module master_admin and configuring jAuth and jAcl.

    Options -noauthdb and -noacl2db indicate to not use and to not configure
    the driver 'db' of jAuth and the driver 'db' of jAcl2. So you will have to
    configure jAuth and/or jAcl2 by yourself.

    The argument 'entrypoint' indicates the entry point to use for the administration.
    Carefull : if the entry point already exists, its configuration will be changed.
    ",
    );
        parent::__construct($config);
    }

    public function run(){
        $this->loadAppConfig();
        $entrypoint = $this->getParam('entrypoint');
        if (($p = strpos($entrypoint, '.php')) !== false)
            $entrypoint = substr($entrypoint,0,$p);

        $ep = $this->getEntryPointInfo($entrypoint);

        if ($ep == null) {
            try {
                $cmd = JelixScript::getCommand('createentrypoint', $this->config);
                $cmd->initOptParam(array(),array('name'=>$entrypoint));
                $cmd->run();
                $this->projectXml = null;
                $ep = $this->getEntryPointInfo($entrypoint);
            }
            catch (Exception $e) {
                throw new Exception("The entrypoint has not been created because of this error: ".$e->getMessage().". No other files have been created.\n");
            }
        }

        $installConfig = new jIniFileModifier(jApp::configPath('installer.ini.php'));

        $inifile = new jIniMultiFilesModifier(jApp::configPath('defaultconfig.ini.php'),
                                          jApp::configPath($ep['config']));

        $params = array();
        $this->createFile(jApp::appPath('responses/adminHtmlResponse.class.php'),'responses/adminHtmlResponse.class.php.tpl',$params, "Response for admin interface");
        $this->createFile(jApp::appPath('responses/adminLoginHtmlResponse.class.php'),'responses/adminLoginHtmlResponse.class.php.tpl',$params, "Response for login page");
        $inifile->setValue('html', 'adminHtmlResponse', 'responses');
        $inifile->setValue('htmlauth', 'adminLoginHtmlResponse', 'responses');


        $inifile->setValue('startModule', 'master_admin');
        $inifile->setValue('startAction', 'default:index');
        $modulePath = $inifile->getValue("modulesPath",0,null,true);
        if (strpos($modulePath, 'lib:jelix-admin-modules') === false) {
            // we set it on defaultconfig.ini.php, so if the url engine is "significant"
            // it could know the admin modules during the parsing of modules
            $inifile->setValue('modulesPath', 'lib:jelix-admin-modules/,'.$modulePath, 0, null, true);
        }

        $installConfig->setValue('jacl.installed', '0', $entrypoint);
        $inifile->setValue('jacl.access', '0', 'modules');
        $installConfig->setValue('jacldb.installed', '0', $entrypoint);
        $inifile->setValue('jacldb.access', '0', 'modules');
        $installConfig->setValue('junittests.installed', '0', $entrypoint);
        $inifile->setValue('junittests.access', '0', 'modules');
        $installConfig->setValue('jWSDL.installed', '0', $entrypoint);
        $inifile->setValue('jWSDL.access', '0', 'modules');

        $urlconf = $inifile->getValue($entrypoint, 'simple_urlengine_entrypoints', null, true);
        if ($urlconf === null || $urlconf == '') {
            // in defaultconfig
            $inifile->setValue($entrypoint, 'jacl2db_admin~*@classic, jauthdb_admin~*@classic, master_admin~*@classic, jpref_admin~*@classic', 'simple_urlengine_entrypoints', null, true);
            // in the config of the entry point
            $inifile->setValue($entrypoint, 'jacl2db~*@classic, jauth~*@classic, jacl2db_admin~*@classic, jauthdb_admin~*@classic, master_admin~*@classic, jpref_admin~*@classic', 'simple_urlengine_entrypoints');
        }
        else {
            $urlconf2 = $inifile->getValue($entrypoint, 'simple_urlengine_entrypoints');

            if(strpos($urlconf, 'jacl2db_admin~*@classic') === false)
                $urlconf .= ',jacl2db_admin~*@classic';
            if(strpos($urlconf, 'jauthdb_admin~*@classic') === false)
                $urlconf .= ',jauthdb_admin~*@classic';
            if(strpos($urlconf, 'master_admin~*@classic') === false)
                $urlconf .= ',master_admin~*@classic';
            if(strpos($urlconf2, 'jacl2db_admin~*@classic') === false)
                $urlconf2 .= ',jacl2db_admin~*@classic';
            if(strpos($urlconf2, 'jauthdb_admin~*@classic') === false)
                $urlconf2 .= ',jauthdb_admin~*@classic';
            if(strpos($urlconf2, 'master_admin~*@classic') === false)
                $urlconf2 .= ',master_admin~*@classic';
            if(strpos($urlconf2, 'jacl2db~*@classic') === false)
                $urlconf2 .= ',jacl2db~*@classic';
            if(strpos($urlconf2, 'jauth~*@classic') === false)
                $urlconf2 .= ',jauth~*@classic';
            if(strpos($urlconf2, 'jpref_admin~*@classic') === false)
                $urlconf2 .= ',jpref_admin~*@classic';

            $inifile->setValue($entrypoint, $urlconf, 'simple_urlengine_entrypoints', null, true);
            $inifile->setValue($entrypoint, $urlconf2, 'simple_urlengine_entrypoints');
        }

        if(null == $inifile->getValue($entrypoint, 'basic_significant_urlengine_entrypoints', null, true)) {
            $inifile->setValue($entrypoint, '1', 'basic_significant_urlengine_entrypoints',null,true);
        }

        $inifile->save();

        require_once (JELIX_LIB_PATH.'installer/jInstaller.class.php');
        $verbose = $this->verbose();

        $reporter = new textInstallReporter(($verbose? 'notice':'warning'));
        $installer = new jInstaller($reporter);
        $installer->installModules(array('master_admin'), $entrypoint.'.php');

        $authini = new jIniFileModifier(jApp::configPath($entrypoint.'/auth.coord.ini.php'));
        $authini->setValue('after_login','master_admin~default:index');
        $authini->setValue('timeout','30');
        $authini->save();

        $profile = $this->getOption('-profile');

        if (!$this->getOption('-noauthdb')) {
            if ($profile != '')
                $authini->setValue('profile',$profile, 'Db');
            $authini->save();
            $installer->setModuleParameters('jauthdb',array('defaultuser'=>true));
            $installer->installModules(array('jauthdb', 'jauthdb_admin'), $entrypoint.'.php');
        }
        else {
            $installConfig->setValue('jauthdb_admin.installed', '0', $entrypoint);
            $installConfig->save();
            $inifile->setValue('jauthdb_admin.access', '0', 'modules');
            $inifile->save();
        }

        if (!$this->getOption('-noacl2db')) {
            if ($profile != '') {
                $dbini = new jIniFileModifier(jApp::configPath('profiles.ini.php'));
                $dbini->setValue('jacl2_profile', $profile, 'jdb');
                $dbini->save();
            }
            $installer = new jInstaller($reporter);
            $installer->setModuleParameters('jacl2db',array('defaultuser'=>true));
            $installer->installModules(array('jacl2db', 'jacl2db_admin'), $entrypoint.'.php');
        }
        else {
            $installConfig->setValue('jacl2db_admin.installed', '0', $entrypoint);
            $installConfig->save();
            $inifile->setValue('jacl2db_admin.access', '0', 'modules');
            $inifile->save();
        }
        
        $installer->installModules(array('jpref_admin'), $entrypoint.'.php');
    }
}
