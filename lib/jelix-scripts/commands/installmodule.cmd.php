<?php
/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @copyright   2009 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

class installmoduleCommand extends JelixScriptCommand {

    public  $name = 'installmodule';
    public  $allowed_options=array('-p'=>true);
    public  $allowed_parameters=array('module'=>true,'...'=>false);

    public  $syntaxhelp = '[-p "param1;param2=value;..."] MODULE [MODULE [....]]';

    public  $help = '';

    function __construct($config){
        $this->help= array(
            'fr'=>"
    Installe ou met à jour les modules indiqués, même si ils ne sont pas activés.
    Si un point d'entrée est indiqué, le module ne sera installé que pour
    ce point d'entrée.

    Option:
        -p : indique des paramètres d'installation, valable que si un seul
             module est indiqué
    ",
            'en'=>"
    Install or upgrade given modules even if there are not activated.
    if an entry point is indicated, the module is installed only for this
    entry point.

    Option:
        -p: parameters for the installation, valid if only one module is indicated
    ",
    );
        parent::__construct($config);
    }

    public function run(){
        require_once (JELIX_LIB_PATH.'installer/jInstaller.class.php');

        jAppManager::close();

        $module = $this->getParam('module');
        $modulesList = $this->getParam('...', array());
        array_unshift($modulesList, $module);

        $parameters = $this->getOption('-p');
        if ($parameters && count($modulesList) > 1) {
            throw new Exception ('Parameters are for only one module');
        }

        if ($parameters) {
            $params = explode(';', $parameters);
            $parameters = array();
            foreach($params as $param) {
                $kp = explode("=", $param);
                if (count($kp) > 1)
                    $parameters[$kp[0]] = $kp[1];
                else
                    $parameters[$kp[0]] = true;
            }
        }

        if ($this->verbose())
            $reporter = new textInstallReporter();
        else
            $reporter = new textInstallReporter('error');

        $installer = new jInstaller($reporter);

        if ($this->allEntryPoint) {
            if ($parameters)
                $installer->setModuleParameters($modulesList[0], $parameters);
            $installer->installModules($modulesList);
        }
        else {
            if ($parameters)
                $installer->setModuleParameters($modulesList[0], $parameters, $this->entryPointName);
            $installer->installModules($modulesList, $this->entryPointName);
        }

        try {
            jAppManager::clearTemp(jApp::tempBasePath());
        }
        catch(Exception $e) {
            if ($e->getCode() == 2) {
                echo "Error: bad path in jApp::tempBasePath(), it is equals to '".jApp::tempBasePath()."' !!\n";
                echo "       Jelix cannot clear the content of the temp directory.\n";
                echo "       you must clear it your self.\n";
                echo "       Correct the path in application.init.php or create the directory\n";
            }
            else echo "Error: ".$e->getMessage();
        }
        jAppManager::open();
    }
}
