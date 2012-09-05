<?php

/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @contributor Loic Mathaud
* @contributor Bastien Jaillot
* @copyright   2005-2007 Laurent Jouanneau, 2008 Bastien Jaillot
* @link        http://www.jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

class createctrlCommand extends JelixScriptCommand {

    public  $name = 'createctrl';
    public  $allowed_options=array('-cmdline'=>false, '-addinstallzone'=>false);
    public  $allowed_parameters=array('module'=>true,'name'=>true, 'method'=>false);

    public  $syntaxhelp = "[-addinstallzone] [-cmdline] MODULE CONTROLLER [METHOD]";
    public  $help=array(
        'fr'=>"
    Crée un nouveau contrôleur de type jController ou jControllerCmdLine.
    -addinstallzone (facultatif) : ajoute la zone check_install pour une nouvelle application

    Si l'option -cmdline est présente, le contrôleur est de type 
    jControllerCmdLine (pour développer des scripts en ligne de commande).
    
    MODULE : le nom du module concerné.
    CONTROLLER : nom du contrôleur que vous voulez créer.
    METHOD (facultatif) : nom de la première méthode. Par défaut, elle a
                              le nom index.",
        'en'=>"
    Create a new controller, either a jController or jControllerCmdLine.
    -addinstallzone (optional) : add the check_install zone for new application
    
    To create a jControllerCmdLine (for command line scripts), you should 
    provide -cmdline option
    
    MODULE : module name where to create the controller.
    CONTROLLER : name of your new controller.
    METHOD (optional) : name of the first method ('index' by default)."
    );

    public function run(){
       $path = $this->getModulePath($this->_parameters['module']);

       $agfilename = $path.'controllers/';
       $this->createDir($agfilename);
       
       if ($this->getOption('-cmdline')) { 
            $type = 'cmdline';
       } else {
            $type = 'classic';
       }
       $ctrlname = strtolower($this->_parameters['name']).'.'. $type .'.php';
       $agfilename.= $ctrlname;

       $method = $this->getParam('method','index');

       $param= array('name'=>$this->_parameters['name'] ,
                     'method'=>$method,
                     'module'=>$this->_parameters['module']);

       if ($this->getOption('-cmdline')) {
            $tplname = 'module/controller.cmdline.tpl';
       } else {
            if ($this->getOption('-addinstallzone')) {
                $tplname = 'module/controller.newapp.tpl';
            }
            else {
                $tplname = 'module/controller.tpl';
            }
       }
       $this->createFile($agfilename, $tplname, $param, 'Controller');
    }
}

