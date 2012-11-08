<?php
/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @copyright   2011 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/


class resetfilesrightsCommand extends JelixScriptCommand {

    public  $name = 'resetfilesrights';
    public  $allowed_options=array();
    public  $allowed_parameters=array();

    public  $syntaxhelp = "";
    public  $help=array(
            'fr'=>"
    Remet les bons droits et propriétaires sur les répertoires et fichiers de l'application, selon
    la configuration jelix-scripts.ini.
    
    Cela peut necessiter de lancer la commande en tant qu'utilisateur 'root'.",
            'en'=>"
    Set rights and owners on files and directories of the application, according to the configuration
    in your jelix-scripts.ini.
    
    It could need to launch this command as 'root' user.",
            );


    public function run(){
        
        $paths = array();
        $paths[] = jApp::tempBasePath();
        $paths[] = jApp::logPath();
        $paths[] = jApp::varPath('mails');
        $paths[] = jApp::varPath('db');
        
        foreach($paths as $path) {
            $this->setRights($path);
        }
    }

    protected function setRights($path) {

        if($path == '' || $path == '/' || $path == DIRECTORY_SEPARATOR || !file_exists($path))
            return false;

        if (is_file($path)) {
            if ($this->config->doChmod) {
                chmod($path, intval($this->config->chmodFileValue,8));
            }

            if ($this->config->doChown) {
                chown($path, $this->config->chownUser);
                chgrp($path, $this->config->chownGroup);
            }
            return true;
        }

        if (!is_dir($path))
            return false;

         if ($this->config->doChmod) {
            chmod($path, intval($this->config->chmodDirValue,8));
         }

         if ($this->config->doChown) {
            chown($path, $this->config->chownUser);
            chgrp($path, $this->config->chownGroup);
         }

        $dir = new DirectoryIterator($path);
        foreach ($dir as $dirContent) {
            if (!$dirContent->isDot()) {
                $this->setRights($dirContent->getPathName());
            }
        }
        unset($dir);
        unset($dirContent);
		return true;
    }
}
