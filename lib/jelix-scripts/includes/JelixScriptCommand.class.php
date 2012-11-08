<?php
/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @contributor Loic Mathaud
* @copyright   2005-2012 Laurent Jouanneau, 2008 Loic Mathaud
* @link        http://www.jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

/**
* base class for commands implementation
*/
abstract class JelixScriptCommand {

   /**
    * @var string the name of the command
    */
   public $name;

   /**
    * options available for the command
    * the array contains items like :
    *   key =  name of the option '-foo'
    *   value = boolean: true if the option need a value after it
    * @var array
    */
   public $allowed_options=array();


   /**
    * common options to all commands
    */
   protected $commonOptions = array('-ep'=>true, '-v'=>false);

   /**
    * parameters needed for the command
    * the array contains items like :
    *   key =  name of the variable which will contains the parameter value
    *   value = boolean: false if the parameter is optional
    * Optional parameters should be declared at the end of the array
    * The last parameter declaration could have '...' as name, so it will contains
    * in an array any additional values given in the command line
    * @var array
    */
   public $allowed_parameters = array();

   /**
    * @var array readed options
    */
   protected $_options;

   /**
    * @var array readed parameters
    */
   protected $_parameters;

   /**
    * @var array|string  help text for the syntax
    */
   public $syntaxhelp = '';

   /**
    * @var array|string detailed help
    */
   public $help = 'No help for this command';

   public $commonSyntaxOptions = '[-ep ENTRYPOINT] [-v] ';
   public $commonOptionsHelp = array(
        'en'=>"
    Other options:
    -ep ENTRYPOINT: indicate the entry point on which this command should be applied
    -v: verbose mode
",
        'fr'=>"
    Autres options:
    -ep ENTRYPOINT: indique le point d'entrée sur lequel la commande doit s'appliquer
    -v: mode verbeux. Affiche plus d'informations.
"
    );

   const APP_MUST_NOT_EXIST = 1;
   const APP_MUST_EXIST = 2;
   const APP_MAY_EXIST = 3;

   /**
    * @var integer indicate how the application is required for the command
    * @see APP_* const
    */
   public $applicationRequirement = 2;

   /**
    * indicate if the command apply for any entrypoints.
    * Filled by the option reader
    */
   protected $allEntryPoint = true;

   /**
    * indicate the entry point name on which the command should apply.
    * Filled by the option reader
    */
   protected $entryPointName = 'index.php';

   /**
    * indicate the entry point id on which the command should apply.
    * Filled by the option reader
    */
   protected $entryPointId = 'index';


   /**
    * @var JelixScriptCommandConfig
    */
   protected $config;

   /**
    * @param JelixScriptCommandConfig $config
    */
   function __construct($config) {
      $this->config = $config;
   }

   /**
    * @param array $argv  list of command line elements
    */
   public function init($argv) {
      $this->_options = array();
      $this->_parameters = array();

      //---------- get the switches
      while (count($argv) && $argv[0]{0} == '-') {

         if (!array_key_exists($argv[0], $this->allowed_options)) {
            if (!array_key_exists($argv[0], $this->commonOptions)) {
               throw new Exception("unknown option '".$argv[0]."'");
            }
            $needArgument = $this->commonOptions[$argv[0]];
         }
         else {
            $needArgument = $this->allowed_options[$argv[0]];
         }

         if ($needArgument) {
            if (isset($argv[1]) && $argv[1]{0} != '-') {
               $sw = array_shift($argv);
               $this->_options[$sw] = array_shift($argv);
            }
            else {
               throw new Exception("value missing for the '".$argv[0]."' option");
            }
         }
         else {
            $sw = array_shift($argv);
            $this->_options[$sw] = true;
         }
      }

      //---------- get the parameters

      foreach ($this->allowed_parameters as $pname => $needed) {
         if (count($argv)==0) {
            if ($needed) {
               throw new Exception("'".$pname."' parameter missing");
            }
            else {
               break;
            }
         }
         if ($pname == '...') {
            $this->_parameters['...'] = $argv;
            $argv = array();
         }
         else {
            $this->_parameters[$pname] = array_shift($argv);
         }
      }

      if(count($argv)){
         throw new Exception("too many parameters");
      }

      $this->getEPOption();
   }

   /**
    * @param array $options  list of options
    * @param array $parameters list of parameters
    */
   public function initOptParam($options, $parameters) {
      $this->_options = $options;
      $this->_parameters = $parameters;
      $this->getEPOption();
   }


   protected function getEPOption() {
      // check entry point
      $ep = $this->getOption('-ep');
      if ($ep) {
         $this->entryPointName = $ep;
         $this->allEntryPoint = false;
         if (($p =strpos($this->entryPointName,'.php')) === false) {
            $this->entryPointId = $this->entryPointName;
            $this->entryPointName.='.php';
         }
         else {
            $this->entryPointId = substr($this->entryPointName, 0, $p);
         }
      }
   }

   protected function verbose() {
      return ($this->getOption('-v') || $this->config->verboseMode);
   }

   /**
    * main method which execute the process for the command
    */
   abstract public function run();

   function loadAppConfig() {

      if (jApp::config())
         return;

      $xml = simplexml_load_file(jApp::appPath('project.xml'));
      $configFile = '';

      foreach ($xml->entrypoints->entry as $entrypoint) {
         $file = (string)$entrypoint['file'];
         if ($file == $this->entryPointName) {
            $configFile = (string)$entrypoint['config'];
            break;
         }
      }

      if ($configFile == '')
         throw new Exception("Entry point is unknown");

      require_once(JELIX_LIB_PATH."core/jConfigCompiler.class.php");
      jApp::setConfig(jConfigCompiler::read($configFile, true, true, $this->entryPointName));
   }

   /**
    * helper method to retrieve the path of the module
    * @param string $module the name of the module
    * @return string the path of the module
    */
   protected function getModulePath($module) {
      $this->loadAppConfig();

      $config = jApp::config();
      if (!isset($config->_modulesPathList[$module])) {
        if (isset($config->_externalModulesPathList[$module]))
            return $config->_externalModulesPathList[$module];
        throw new Exception("The module $module doesn't exist");
      }
      return $config->_modulesPathList[$module];
   }

   /**
    * helper method to create a file from a template stored in the templates/
    * directory of jelix-scripts. it set the rights
    * on the file as indicated in the configuration of jelix-scripts
    *
    * @param string $filename the path of the new file created from the template
    * @param string $template relative path to the templates/ directory, of the
    *               template file
    * @param array  $param template values, which will replace some template variables
    * @return boolean true if it is ok
    */
   protected function createFile($filename, $template, $tplparam=array(), $fileType = 'File') {
      $parts = explode('/', $filename);
      while(count($parts)>3)
         array_shift($parts);
      $displayedFilename = implode('/', $parts);

      $defaultparams = array (
         'default_website'       => $this->config->infoWebsite ,
         'default_license'       => $this->config->infoLicence,
         'default_license_url'   => $this->config->infoLicenceUrl,
         'default_creator_name'  => $this->config->infoCreatorName,
         'default_creator_email' => $this->config->infoCreatorMail,
         'default_copyright'     => $this->config->infoCopyright,
         'createdate'            => date('Y-m-d'),
         'jelix_version'         => file_get_contents(JELIX_LIB_PATH.'VERSION'),
         'appname'               => $this->config->appName,
         'default_timezone'      => $this->config->infoTimezone,
         'default_locale'        => $this->config->infoLocale,
      );

      $v = explode('.', $defaultparams['jelix_version']);
      if (count($v) < 2)
        $v[1] = '0';

      $defaultparams['jelix_version_next'] = $v[0].'.'.$v[1].'.*';

      $tplparam = array_merge($defaultparams, $tplparam);

      if (file_exists($filename)) {
         echo "Warning: $fileType ".$displayedFilename." already exists\n";
         return false;
      }
      $tplpath = JELIX_SCRIPTS_PATH.'templates/'.$template;

      if (!file_exists($tplpath)) {
         echo "Error: to create $displayedFilename, template file '".$tplpath."' doesn't exist\n";
         return false;
      }
      $tpl = file($tplpath);
      $this->tplparam = $tplparam;

      foreach($tpl as $k=>$line){
         $tpl[$k]= preg_replace_callback('|\%\%([a-zA-Z0-9_]+)\%\%|',
                                         array(&$this, 'replaceCallback'),
                                         $line);
      }

      $f = fopen($filename, 'w');
      fwrite($f, implode("", $tpl));
      fclose($f);

      if ($this->config->doChmod) {
         chmod($filename, intval($this->config->chmodFileValue,8));
      }

      if ($this->config->doChown) {
         chown($filename, $this->config->chownUser);
         chgrp($filename, $this->config->chownGroup);
      }
      if (!file_exists($filename)) {
         echo "Error: $fileType ".$displayedFilename." could not be created\n";
         return false;
      }
      if ($this->verbose())
         echo "$fileType $displayedFilename has been created.\n";
      return true;
   }

   /**
    * helper method to create a new directory. it set the rights
    * on the directory as indicated in the configuration of jelix-scripts
    *
    * @param string $dirname the path of the directory
    */
   protected function createDir($dirname) {
      if ($dirname == '' || $dirname == '/')
         return;
      if (!file_exists($dirname)) {
         $this->createDir(dirname($dirname));

         mkdir($dirname);
         if ($this->config->doChmod) {
            chmod($dirname, intval($this->config->chmodDirValue,8));
         }

         if ($this->config->doChown) {
            chown($dirname, $this->config->chownUser);
            chgrp($dirname, $this->config->chownGroup);
         }
      }
   }

   /**
    * @internal callback function used by createFile
    */
   protected function replaceCallback($matches){
      if (isset($this->tplparam[$matches[1]])) {
         return $this->tplparam[$matches[1]];
      } else
         return '';
   }

   /**
    * helper function to retrieve a command parameter
    * @param string $param the parameter name
    * @param string $defaultvalue the default value to return if
    *                the parameter does not exist
    * @return string the value
    */
   public function getParam($param, $defaultvalue=null){
      if (isset($this->_parameters[$param])) {
         return $this->_parameters[$param];
      }
      else{
         return $defaultvalue;
      }
   }

   /**
    * helper function to retrieve a command option
    * @param string $name the option name
    * @return string the value of the option, or false if it doesn't exist
    */
   public function getOption($name){
      if (isset($this->_options[$name])) {
         return $this->_options[$name];
      }
      else {
         return false;
      }
   }

   protected function getCommonActiveOption() {
      $options = array();
      if ($ep = $this->getOption('-ep'))
         $options['-ep'] = $ep;
      if ($this->getOption('-v'))
         $options['-v'] = true;
      return $options;
   }

    protected function removeOption($name) {
        if (isset($this->_options[$name])) {
            unset($this->_options[$name]);
        }
    }

   /**
    * @var DOMDocument the content of the project.xml file, loaded by loadProjectXml
    */
   protected $projectXml = null;

   /**
    * load the content of the project.xml file, and store the corresponding DOM
    * into the $projectXml property
    */
   protected function loadProjectXml() {

      if ($this->projectXml)
         return;

      $doc = new DOMDocument();

      if (!$doc->load(jApp::appPath('project.xml'))){
         throw new Exception("cannot load project.xml");
      }

      if ($doc->documentElement->namespaceURI != JELIX_NAMESPACE_BASE.'project/1.0'){
         throw new Exception("bad namespace in project.xml");
      }
      $this->projectXml = $doc;
   }

   protected function getEntryPointsList() {
      $this->loadProjectXml();
      $listEps = $this->projectXml->documentElement->getElementsByTagName("entrypoints");
      if (!$listEps->length) {
         return array();
      }

      $listEp = $listEps->item(0)->getElementsByTagName("entry");
      if(!$listEp->length) {
         return array();
      }

      $list = array();
      for ($i=0; $i < $listEp->length; $i++) {
         $epElt = $listEp->item($i);
         $ep = array(
            'file'=>$epElt->getAttribute("file"),
            'config'=>$epElt->getAttribute("config"),
            'isCli'=> ($epElt->getAttribute("type") == 'cmdline'),
            'type'=>$epElt->getAttribute("type"),
         );
         if (($p = strpos($ep['file'], '.php')) !== false)
            $ep['id'] = substr($ep['file'],0,$p);
         else
            $ep['id'] = $ep['file'];

         $list[] = $ep;
      }
      return $list;
   }

   protected function getEntryPointInfo($name) {
      $this->loadProjectXml();
      $listEps = $this->projectXml->documentElement->getElementsByTagName("entrypoints");
      if (!$listEps->length) {
         return null;
      }

      $listEp = $listEps->item(0)->getElementsByTagName("entry");
      if(!$listEp->length) {
         return null;
      }

      for ($i=0; $i < $listEp->length; $i++) {
         $epElt = $listEp->item($i);
         $ep = array(
            'file'=>$epElt->getAttribute("file"),
            'config'=>$epElt->getAttribute("config"),
            'isCli'=> ($epElt->getAttribute("type") == 'cmdline'),
            'type'=>$epElt->getAttribute("type"),
         );
         if (($p = strpos($ep['file'], '.php')) !== false)
            $ep['id'] = substr($ep['file'],0,$p);
         else
            $ep['id'] = $ep['file'];
         if ($ep['id'] == $name)
            return $ep;
      }
      return null;
   }

   protected function getSupportedJelixVersion() {
       $this->loadProjectXml();

       $deps = $this->projectXml->getElementsByTagName('dependencies');
       $minversion = '';
       $maxversion = '';
       if($deps && $deps->length > 0) {
           $jelix = $deps->item(0)->getElementsByTagName('jelix');
           if ($jelix && $jelix->length > 0) {
               $minversion = $jelix->item(0)->getAttribute('minversion');
               $maxversion = $jelix->item(0)->getAttribute('maxversion');
           }
       }
       return array($minversion, $maxversion);
   }

   /**
    * @param string $path a path to a directory (full path)
    * @param string $targetPath a path to the directory (full path)
    * @return string relative path from $path to go to $targetPath
    */
   protected function getRelativePath($path, $targetPath){

      $last = substr($path, -1,1);
      if ($last != '/' && $last != DIRECTORY_SEPARATOR) {
         $path .= DIRECTORY_SEPARATOR;
      }
      $last = substr($targetPath, -1,1);
      if ($last != '/' && $last != DIRECTORY_SEPARATOR) {
         $targetPath .= DIRECTORY_SEPARATOR;
      }
      $cut = (DIRECTORY_SEPARATOR == '/'? '!/!': "![/\\\\]!");
      $sep = DIRECTORY_SEPARATOR;
      $path = preg_split($cut,$path);
      $targetPath = preg_split($cut,$targetPath);

      $dir = '';
      $targetdir = '';

      if (count($path)) {
         $dir = array_shift($path);
         $targetdir = array_shift($targetPath);
         if (preg_match('/^[a-z]\:/i', $targetdir) && preg_match('/^[a-z]\:/i', $dir)) {
            if (strcasecmp($dir, $targetdir) != 0) {
               $targetPath = $targetdir.$sep.implode($sep, $targetPath);
               if (substr($targetPath, -1) != $sep)
                  $targetPath .= $sep;
               return $targetPath;
            }
         }
      }

      while(count($path)){
         $dir = array_shift($path);
         $targetdir = array_shift($targetPath);
         if ($dir != $targetdir)
            break;
      }

      if (count($path)) {
         $relativePath = str_repeat('..'.$sep, count($path));
      }
      else {
         $relativePath = '.'.$sep;
      }

      if(count($targetPath) && $dir != $targetdir){
         $relativePath .= $targetdir.$sep.implode($sep, $targetPath);
      }
      elseif (count($targetPath)) {
         $relativePath .= implode($sep, $targetPath);
      }

      if (substr($relativePath, -1) != $sep)
         $relativePath .= $sep;

      if ($sep =='\\') {
         $relativePath = str_replace('\\','/', $relativePath);
      }
      return $relativePath;
   }

   /**
    * similar to realpath, but for non existant path
    */
   protected function getRealPath($path) {

      $prefix = '';
      if (substr($path, 1,2) == ':\\') {
         $prefix = substr($path, 0,3);
         $path = substr($path, 3);
      }
      elseif ( substr($path, 1,2) == ':/') {
         //it's seemed to be a WINOS Directoy Seprator
         //replace all "/" by "\" in the path
         $path = preg_replace("/\//","\\",$path,-1);
         $prefix = substr($path, 0,3);
         $path = substr($path,3);
      }
      else if (substr($path, 0,1) == '/') {
         $prefix = substr($path, 0,1);
         $path = substr($path, 1);
      }
      else {
         $path = getcwd().'/'.$path;
         if (substr($path, 1,2) == ':\\') {
            $prefix = substr($path, 0,3);
            $path = substr($path, 3);
         }
         else if (substr($path, 0,1) == '/') {
            $prefix = substr($path, 0,1);
            $path = substr($path, 1);
         }
      }
      $cut = (DIRECTORY_SEPARATOR == '/'? '!/!': "![/\\\]!");
      $sep = DIRECTORY_SEPARATOR;
      $path = preg_split($cut, $path);
      $newPath = array();
      while(count($path)){
         $dir = array_shift($path);
         if ($dir == '..') {
            array_pop($newPath);
         }
         else if ($dir != '.' && $dir != '' ) {
            array_push($newPath, $dir);
         }
      }

      return $prefix.implode($sep, $newPath);
   }
}
