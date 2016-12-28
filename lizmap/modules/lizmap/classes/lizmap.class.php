<?php
/**
* Manage and give access to lizmap configuration.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2012 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class UnknownLizmapProjectException extends Exception { }

class lizmap{

    // Lizmap configuration file path (relative to the path folder)
    protected static $lizmapConfig = 'config/lizmapConfig.ini.php';
    protected static $lizmapLogConfig = 'config/lizmapLogConfig.ini.php';

    // repositories
    protected static $repositories = array();
    protected static $repositoryInstances = array();

    // projects
    protected static $projectInstances = array();

    // log items
    protected static $logItems = array();

    /**
     * this is a static class, so private constructor
     */
    private function __construct (){ }

    /**
     *
     */
    public static function getServices (){
      return jClasses::getService('lizmap~lizmapServices');
    }

    /**
     *
     */
    public static function getTheme (){
      return jClasses::getService('lizmap~lizmapTheme');
    }

    /**
     * Get a list of repository names.
     *
     */
    public static function getRepositoryList(){
      // read the lizmap configuration file
      $readConfigPath = parse_ini_file(jApp::varPath().self::$lizmapConfig, True);
      $repositoryList = array();
      foreach($readConfigPath as $section=>$data){
        $match = preg_match('#(^repository:)#', $section, $matches);
        if(isset($matches[0]))
          $repositoryList[] = str_replace($matches[0], '', $section);
      }
      self::$repositories = $repositoryList;
      return self::$repositories;
    }

    /**
     * Get the list of properties for a generic repository.
     *
     */
    public static function getRepositoryProperties(){
      return lizmapRepository::$properties;
    }

    /**
     * Get the list of properties options for a generic repository.
     *
     */
    public static function getRepositoryPropertiesOptions(){
      return lizmapRepository::$propertiesOptions;
    }

    /**
     * Get the jForm for a repository.
     *
     */
    public static function constructRepositoryForm( $rep, $form ){
        $services = lizmap::getServices();
        $rootRepositories = $services->getRootRepositories();

        $repositories = array();
        foreach(lizmap::getRepositoryList() as $repo){
            if ( $rep && $rep->getKey() == $repo )
                continue;
            $repositories[] = lizmap::getRepository($repo);
        }

        // reconstruct form fields based on repositoryPropertyList
        $propertiesOptions = lizmap::getRepositoryPropertiesOptions();

        foreach(lizmap::getRepositoryProperties() as $k){
            $ctrl = null;
            if ( $propertiesOptions[$k]['fieldType'] == 'checkbox' ) {
                $ctrl = new jFormsControlCheckbox($k);
            }
            else if ( $k == 'path' && $rootRepositories != '' ) {
                if ($rep == null || substr($rep->getPath(), 0, strlen($rootRepositories)) === $rootRepositories ) {
                    $ctrl = new jFormsControlMenulist($k);
                    $dataSource = new jFormsStaticDatasource();
                    $data = array();
                    $data[''] = '';
                    if ($dh = opendir($rootRepositories)) {
                        while (($file = readdir($dh)) !== false) {
                            if ($file == '.' || $file == '..')
                                continue;

                            $filePath = $rootRepositories.$file.'/';
                            if ( is_dir($filePath) ) {
                                $allreadyUsed = False;
                                foreach( $repositories as $repo ) {
                                    if ( $repo->getPath() == $filePath ) {
                                        $allreadyUsed = True;
                                        break;
                                    }
                                }
                                if( !$allreadyUsed )
                                    $data[$filePath] = $file;
                            }
                        }
                    }
                    $dataSource->data = $data;
                    $ctrl->datasource = $dataSource;
                } else {
                    $ctrl = new jFormsControlHidden($k);
                }
            }
            else {
                $ctrl = new jFormsControlInput($k);
                $ctrl->datatype = new jDatatypeString();
            }
            $ctrl->required = $propertiesOptions[$k]['required'];
            $ctrl->label = jLocale::get("admin~admin.form.admin_section.repository.".$k.".label");
            $ctrl->size = 100;
            $form->addControl($ctrl);
        }
        if ( $rep ) {
            foreach ( $rep->getProperties() as $k ) {
                $v = $rep->getData($k);
                if ( $k == 'path' && $rootRepositories != '' && substr($rep->getPath(), 0, strlen($rootRepositories)) === $rootRepositories)
                    $v = $rep->getPath();
                $form->setData($k, $v);
            }
        }
        return $form;
    }


    /**
     * Get a repository
     * @param string $key Key of the repository to get
     *
     */
    public static function getRepository ($key){
      if ( !in_array($key, self::$repositories) ) {
        if ( !in_array($key, self::getRepositoryList()) ) {
          return null;
        }
      }

      if ( array_key_exists($key, self::$repositoryInstances) )
        return self::$repositoryInstances[$key];

      $rep = new lizmapRepository($key);
      self::$repositoryInstances[$key] = $rep;
      return $rep;
    }


    /**
     * Create a repository
     */
    public static function createRepository ($key, $data){
      if ( in_array($key, self::$repositories)
        || in_array($key, self::getRepositoryList()) )
        return null;

      $rep = new lizmapRepository($key);
      $rep->update( $data );
      self::getRepositoryList();
      self::$repositoryInstances[$key] = $rep;
      return $rep;
    }

    /**
     * Removes a repository
     */
    public static function removeRepository ($key){
      if ( !in_array($key, self::$repositories) )
        if ( !in_array($key, self::getRepositoryList()) )
          return false;

      // Get access to the ini file
      $iniFile = jApp::configPath('lizmapConfig.ini.php');
      $ini = new jIniFileModifier($iniFile);

      // Remove the section corresponding to the repository
      $section = 'repository:'.$key;
      if($ini->isSection($section)){
        $ini->removeValue(null, $section);
        $ini->save();
        self::getRepositoryList();
        if ( array_key_exists($key, self::$repositoryInstances) )
            unset(self::$repositoryInstances[$key]);
        return true;
      }
      return false;
    }

    /**
     * Get a project
     * @return lizmapProject (null if it does not exist)
     * @FIXME all calls to getProject construct $key. Why not to
     * deliver directly $rep and $project? It could avoid
     * a preg_match
     */
    public static function getProject ($key){
      $match = preg_match('/(?P<rep>\w+)~(?P<proj>\w+)/', $key, $matches);
      if ( $match != 1 )
        return null;

      $rep = self::getRepository($matches['rep']);
      if ( $rep == null)
        return null;

      if ( isset(self::$projectInstances[$key]) )
        return self::$projectInstances[$key];

      try {
        $proj = new lizmapProject($matches['proj'], $rep);
      }
      catch(UnknownLizmapProjectException $e) {
          throw $e;
      }
      catch(Exception $e) {
        jLog::logEx($e, 'error');
        return null;
      }
      self::$projectInstances[$key] = $proj;
      return $proj;
    }


    /**
    * Get global configuration for logs
    */
    public static function getLogConfig(){
      return jClasses::getService('lizmap~lizmapLogConfig');
    }

    /**
     * Get a list of log items names.
     *
     */
    public static function getLogItemList(){
      // read the lizmap log configuration file
      $readConfigPath = parse_ini_file(jApp::varPath().self::$lizmapLogConfig, True);
      $logItemList = array();
      foreach($readConfigPath as $section=>$data){
        $match = preg_match('#(^item:)#', $section, $matches);
        if(isset($matches[0]))
          $logItemList[] = str_replace($matches[0], '', $section);
      }
      self::$logItems = $logItemList;
      return self::$logItems;
    }

    /**
     * Get the list of properties for a generic log item.
     *
     */
    public static function getLogItemProperties(){
      return lizmapLogItem::getSProperties();
    }

    /**
     * Get a log item
     * @param string $key Key of the log item to get
     *
     */
    public static function getLogItem ($key){
      if ( !in_array($key, self::$logItems) )
        if ( !in_array($key, self::getLogItemList()) )
          return null;

      return new lizmapLogItem($key);
    }


    /* Returns time spent in milliseconds from beginning of request
     * @param string $label Name of the action to lo
     */
    public static function logMetric( $label, $start='index' ){
        // Choose from when to calculate time: index, request or given $start
        if( $start == 'index' ){
            $start = $_SERVER["LIZMAP_BEGIN_TIME"];
        }
        elseif( $start == 'request' ){
            // For php < 5.4
            if (!isset($_SERVER['REQUEST_TIME_FLOAT'])) {
              $start = $_SERVER['REQUEST_TIME'];
            }else{
              $start = $_SERVER["REQUEST_TIME_FLOAT"];
            }
        }

        // Calculate time
        $time = ( microtime(true) - $start ) * 1000;

        // Create log content
        $log = array(
            'NAME'=> $label,
            'RESPONSE_TIME'=> $time
        );

        // Add cache parameter if given
        if( isset( $_SESSION['LIZMAP_GETMAP_CACHE_STATUS'] ) ){
          $log['CACHE_STATUS'] = $_SESSION['LIZMAP_GETMAP_CACHE_STATUS'];
        }
        jLog::log(json_encode($log), 'metric');
    }

}
