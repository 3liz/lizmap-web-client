<?php
/**
 * @package     jelix-scripts
 * @author      Bisse Romain
 * @contributor
 * @copyright   2009 Bisse Romain
 * @link        http://www.jelix.org
 * @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
 */

class createclassfromdaoCommand extends JelixScriptCommand {

    public  $name = 'createclassfromdao';
    public  $allowed_options=array();
    public  $allowed_parameters=array('module'=>true,'classname'=>true, 'daoname'=>true);

    public  $syntaxhelp = "MODULE CLASSE DAO";
    public  $help=array(

            "fr"=>"
    
    Permet de générer une classe dans le répertoire classes 
    à partir d’un fichier xml de dao.
    La classe ainsi générée peut servir de base pour 
    l'emploi d'un motif de conception de type 
    Data Transfer Object (DTO) par ex.

    MODULE : le nom du module concerné.
    CLASSNAME : le nom de la classe (qui détermine également 
    		 le nom du fichier généré)
    DAONAME : le nom du dao dont la classe est issue",

    		"en"=>"

    Allow to create a class into classes directory from a *dao.xml file.
    Usable in a Data Transfer Object pattern (DTO) for example.

    MODULE : the target module where the class will be generated.
    CLASSNAME : the name of the class.
    DAONAME : the name of the dao from which the class will be generated."
    );

    public function run() {
        
        /*
         * Computing some paths and filenames
         */
        
        $modulePath= $this->getModulePath($this->_parameters['module']);
        
        $sourceDaoPath=$modulePath.'daos/';
        $sourceDaoPath.=strtolower($this->_parameters['daoname']).'.dao.xml';
        
        if (!file_exists($sourceDaoPath)) {
            throw new Exception("The file $sourceDaoPath doesn't exist");
        }
        
        $targetClassPath=$modulePath.'classes/';
        $targetClassPath.=strtolower($this->_parameters['classname']).'.class.php';
        
        /*
         * Parsing the dao xml file
         */
        
        $selector = new jSelectorDao($this->_parameters['module'].'~'.$this->_parameters['daoname'], '');
        $tools = jDb::getConnection()->tools();
        
        $doc = new DOMDocument();
        
        if(!$doc->load($sourceDaoPath)){
           throw new jException('jelix~daoxml.file.unknown', $sourceDaoPath);
        }
        if($doc->documentElement->namespaceURI != JELIX_NAMESPACE_BASE.'dao/1.0'){
           throw new jException('jelix~daoxml.namespace.wrong',array($sourceDaoPath, $doc->namespaceURI));
        }
        
        $parser = new jDaoParser($selector);
        $parser->parse(simplexml_import_dom($doc), $tools);
        $properties = $parser->GetProperties();
        
        /*
         * Generating the class
         */
        
        $classContent = '';
        foreach($properties as $name=>$property) {
            $classContent .= "    public \$$name;\n";     
        }
        $this->createFile($targetClassPath,'module/classfromdao.class.tpl', array('properties'=>$classContent, 'name'=>$this->_parameters['classname']), "Class");
    }
}

