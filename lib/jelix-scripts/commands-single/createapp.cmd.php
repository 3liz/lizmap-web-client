<?php

/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @contributor Loic Mathaud
* @contributor Gildas Givaja (bug #83)
* @contributor Christophe Thiriot
* @contributor Bastien Jaillot
* @contributor Dominique Papin, Olivier Demah
* @copyright   2005-2011 Laurent Jouanneau, 2006 Loic Mathaud, 2007 Gildas Givaja, 2007 Christophe Thiriot, 2008 Bastien Jaillot, 2008 Dominique Papin
* @copyright   2011 Olivier Demah
* @link        http://www.jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

class createappCommand extends JelixScriptSingleCommand {

    public  $name = 'createapp';
    public  $allowed_options=array('-nodefaultmodule'=>false,
                                   '-withcmdline'=>false,
                                   '-wwwpath'=>true);
    public  $allowed_parameters=array('path'=>true);

    public  $syntaxhelp = "[-nodefaultmodule] [-withcmdline] [-wwwpath a_path]";


    public $applicationRequirement = 1;

    function __construct(){
        $this->help= array(
            'fr'=>"
    Crée une nouvelle application avec tous les répertoires nécessaires et un module
    du même nom que l'application.

    Si l'option -nodefaultmodule est présente, le module n'est pas créé.

    Si l'option -withcmdline est présente, crée un point d'entrée afin de
    développer des scripts en ligne de commande.

    Si l'option -wwwpath est présente, sa valeur définit le document root de votre application.
    wwwpath doit être relatif au répertoire de l'application (valeur par défaut www/).

    le répertoire de la future application doit être indiquée en paramètre.
    ",
            'en'=>"
    Create a new application with all directories and one module named as your application.

    If you give -nodefaultmodule option, it won't create the module.

    If you give the -withcmdline option, it will create an entry point dedicated to
    command line scripts.

    If you give the -wwwpath option, it will replace your application default document root.
    wwwpath must be relative to your application directory (default value is 'www/').

    The application directory should be  indicated as parameter
    ",
    );
    }

    public function run() {
        require_once (LIB_PATH.'clearbricks/jelix.inc.php');
        require_once (JELIX_LIB_PATH.'installer/jInstaller.class.php');
        $appPath = $this->getParam('path');
        $appPath = $this->getRealPath($appPath);
        $appName = basename($appPath);
        $appPath .= '/';

        if (file_exists($appPath)) {
            throw new Exception("this application is already created");
        }

        $this->config = JelixScript::loadConfig($appName);
        $this->config->infoIDSuffix = $this->config->newAppInfoIDSuffix;
        $this->config->infoWebsite = $this->config->newAppInfoWebsite;
        $this->config->infoLicence = $this->config->newAppInfoLicence;
        $this->config->infoLicenceUrl = $this->config->newAppInfoLicenceUrl;
        $this->config->infoLocale = $this->config->newAppInfoLocale;
        $this->config->infoCopyright = $this->config->newAppInfoCopyright;
        $this->config->initAppPaths($appPath);

        jApp::setEnv('jelix-scripts');

        JelixScript::checkTempPath();

        if ($p = $this->getOption('-wwwpath')) {
            $wwwpath = path::real($appPath.$p, false).'/';
        }
        else {
            $wwwpath = jApp::wwwPath();
        }

        $this->createDir($appPath);
        $this->createDir(jApp::tempBasePath());
        $this->createDir($wwwpath);

        $varPath = jApp::varPath();
        $configPath = jApp::configPath();
        $this->createDir($varPath);
        $this->createDir(jApp::logPath());
        $this->createDir($configPath);
        $this->createDir($configPath.'index/');
        $this->createDir($varPath.'overloads/');
        $this->createDir($varPath.'themes/');
        $this->createDir($varPath.'themes/default/');
        $this->createDir($varPath.'uploads/');
        $this->createDir($varPath.'sessions/');
        $this->createDir($varPath.'mails/');
        $this->createDir($appPath.'install');
        $this->createDir($appPath.'modules');
        $this->createDir($appPath.'plugins');
        $this->createDir($appPath.'plugins/coord/');
        $this->createDir($appPath.'plugins/tpl/');
        $this->createDir($appPath.'plugins/tpl/common');
        $this->createDir($appPath.'plugins/tpl/html');
        $this->createDir($appPath.'plugins/tpl/text');
        $this->createDir($appPath.'plugins/db/');
        $this->createDir($appPath.'plugins/auth/');
        $this->createDir($appPath.'responses');
        $this->createDir($appPath.'tests');
        $this->createDir(jApp::scriptsPath());

        $param = array();
        $param['default_id'] = $appName.$this->config->infoIDSuffix;

        if($this->getOption('-nodefaultmodule')) {
            $param['tplname']    = 'jelix~defaultmain';
            $param['modulename'] = 'jelix';
        }
        else {
            // note: since module name are used for name of generated name,
            // only this characters are allowed
            $param['modulename'] = preg_replace('/([^a-zA-Z_0-9])/','_',$appName);
            $param['tplname']    = $param['modulename'].'~main';
        }

        $param['config_file'] = 'index/config.ini.php';

        $param['rp_temp']  = $this->getRelativePath($appPath, jApp::tempBasePath());
        $param['rp_var']   = $this->getRelativePath($appPath, jApp::varPath());
        $param['rp_log']   = $this->getRelativePath($appPath, jApp::logPath());
        $param['rp_conf']  = $this->getRelativePath($appPath, $configPath);
        $param['rp_www']   = $this->getRelativePath($appPath, $wwwpath);
        $param['rp_cmd']   = $this->getRelativePath($appPath, jApp::scriptsPath());
        $param['rp_jelix'] = $this->getRelativePath($appPath, JELIX_LIB_PATH);
        $param['rp_app']   = $this->getRelativePath($wwwpath, $appPath);

        $this->createFile(jApp::logPath().'.dummy', 'dummy.tpl', array());
        $this->createFile(jApp::varPath().'mails/.dummy', 'dummy.tpl', array());
        $this->createFile(jApp::varPath().'sessions/.dummy', 'dummy.tpl', array());
        $this->createFile(jApp::varPath().'overloads/.dummy', 'dummy.tpl', array());
        $this->createFile(jApp::varPath().'themes/default/.dummy', 'dummy.tpl', array());
        $this->createFile($appPath.'plugins/.dummy', 'dummy.tpl', array());
        $this->createFile(jApp::scriptsPath().'.dummy', 'dummy.tpl', array());
        $this->createFile(jApp::tempBasePath().'.dummy', 'dummy.tpl', array());

        $this->createFile($appPath.'.htaccess', 'htaccess_deny', $param, "Configuration file for Apache");
        $this->createFile($appPath.'project.xml','project.xml.tpl', $param, "Project description file");
        $this->createFile($appPath.'cmd.php','cmd.php.tpl', $param, "Script for developer commands");
        $this->createFile($configPath.'mainconfig.ini.php', 'var/config/mainconfig.ini.php.tpl', $param, "Main configuration file");
        $this->createFile($configPath.'localconfig.ini.php.dist', 'var/config/localconfig.ini.php.tpl', $param, "Configuration file for specific environment");
        $this->createFile($configPath.'profiles.ini.php', 'var/config/profiles.ini.php.tpl', $param, "Profiles file");
        $this->createFile($configPath.'profiles.ini.php.dist', 'var/config/profiles.ini.php.tpl', $param, "Profiles file for your repository");
        $this->createFile($configPath.'preferences.ini.php', 'var/config/preferences.ini.php.tpl', $param, "Preferences file");
        $this->createFile($configPath.'urls.xml', 'var/config/urls.xml.tpl', $param, "URLs mapping file");

        $this->createFile($configPath.'index/config.ini.php', 'var/config/index/config.ini.php.tpl', $param, "Entry point configuration file");
        $this->createFile($appPath.'responses/myHtmlResponse.class.php', 'responses/myHtmlResponse.class.php.tpl', $param, "Main response class");
        $this->createFile($appPath.'install/installer.php','installer/installer.php.tpl',$param, "Installer script");
        $this->createFile($appPath.'tests/runtests.php','tests/runtests.php', $param, "Tests script");

        $temp = dirname(jApp::tempBasePath());
        if (file_exists($temp.'/.gitignore')) {
            $gitignore = file_get_contents($temp.'/.gitignore'). "\n" .$appName."/*\n";
            file_put_contents($temp.'/.gitignore', $gitignore);
        }
        else {
            file_put_contents($temp.'/.gitignore', $appName."/*\n");
        }

        $this->createFile($wwwpath.'index.php', 'www/index.php.tpl',$param, "Main entry point");
        $this->createFile($wwwpath.'.htaccess', 'htaccess_allow',$param, "Configuration file for Apache");

        $param['php_rp_temp'] = $this->convertRp($param['rp_temp']);
        $param['php_rp_var']  = $this->convertRp($param['rp_var']);
        $param['php_rp_log']  = $this->convertRp($param['rp_log']);
        $param['php_rp_conf'] = $this->convertRp($param['rp_conf']);
        $param['php_rp_www']  = $this->convertRp($param['rp_www']);
        $param['php_rp_cmd']  = $this->convertRp($param['rp_cmd']);
        $param['php_rp_jelix']  = $this->convertRp($param['rp_jelix']);

        $this->createFile($appPath.'application.init.php','application.init.php.tpl',$param, "Bootstrap file");

        $installer = new jInstaller(new textInstallReporter('warning'));
        $installer->installApplication();

        $moduleok = true;

        if (!$this->getOption('-nodefaultmodule')) {
            try {
                $cmd = JelixScript::getCommand('createmodule', $this->config);
                $options = $this->getCommonActiveOption();
                $options['-addinstallzone'] = true;
                $cmd->initOptParam($options, array('module'=>$param['modulename']));
                $cmd->run();
                $this->createFile($appPath.'modules/'.$param['modulename'].'/templates/main.tpl', 'module/main.tpl.tpl', $param, "Main template");
            } catch (Exception $e) {
                $moduleok = false;
                echo "The module has not been created because of this error: ".$e->getMessage()."\nHowever the application has been created\n";
            }
        }

        if ($this->getOption('-withcmdline')) {
            if(!$this->getOption('-nodefaultmodule') && $moduleok){
                $agcommand = JelixScript::getCommand('createctrl', $this->config);
                $options = $this->getCommonActiveOption();
                $options['-cmdline'] = true;
                $agcommand->initOptParam($options, array('module'=>$param['modulename'], 'name'=>'default','method'=>'index'));
                $agcommand->run();
            }
            $agcommand = JelixScript::getCommand('createentrypoint', $this->config);
            $options = $this->getCommonActiveOption();
            $options['-type'] = 'cmdline';
            $parameters = array('name'=>$param['modulename']);
            $agcommand->initOptParam($options, $parameters);
            $agcommand->run();
        }
    }

    protected function convertRp($rp) {
        if(strpos($rp, './') === 0)
            $rp = substr($rp, 2);
        if (strpos($rp, '../') !== false) {
            return 'realpath(__DIR__.\'/'.$rp."').'/'";
        }
        else if (DIRECTORY_SEPARATOR == '/' && $rp[0] == '/') {
            return "'".$rp."'";
        }
        else if (DIRECTORY_SEPARATOR == '\\' && preg_match('/^[a-z]\:/i', $rp)) { // windows
            return "'".$rp."'";
        }
        else {
            return '__DIR__.\'/'.$rp."'";
        }
    }
}
