<?php
/**
* @package     jelix
* @subpackage  urls_engine
* @author      Laurent Jouanneau
* @contributor GeekBay
* @copyright   2005-2012 Laurent Jouanneau, 2010 Geekbay
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * simple url engine
 * generated url are "dirty" jelix url, with full of parameter in the query (module, action etc..)
 * @package  jelix
 * @subpackage urls_engine
 * @see jIUrlEngine
 * @deprecated 1.4
 */
class simpleUrlEngine implements jIUrlEngine {

    protected $urlspe = null;
    protected $urlhttps = null;

    /**
     * Parse a url from the request
     * @param jRequest $request
     * @param array  $params            url parameters
     * @return jUrlAction
     * @since 1.1
     */
    public function parseFromRequest($request, $params){
        return new jUrlAction($params, $request->type);
    }

    /**
    * Parse some url components
    * @param string $scriptNamePath    /path/index.php
    * @param string $pathinfo          the path info part of the url (part between script name and query)
    * @param array  $params            url parameters (query part e.g. $_REQUEST)
    * @return jUrlAction
    */
    public function parse($scriptNamePath, $pathinfo, $params ){
        return new jUrlAction($params);
    }


    /**
    * Create a jurl object with the given action data
    * @param jUrlAction $urlact  information about the action
    * @return jUrl the url correspondant to the action
    */
    public function create($urlact){

        $m = $urlact->getParam('module');
        $a = $urlact->getParam('action');

        $scriptName = $this->getBasePath($urlact->requestType, $m, $a);
        $scriptName .= $this->getScript($urlact->requestType, $m, $a);

        if(!jApp::config()->urlengine['multiview']){
            $scriptName .= '.php';
        }

        $url = new jUrl($scriptName, $urlact->params, '');
        // for some request types, parameters aren't in the url
        // so we remove them
        // it's a bit dirty to do that hardcoded here, but it would be a pain
        // to load the request class to check whether we can remove or not
        if(in_array($urlact->requestType ,array('xmlrpc','jsonrpc','soap')))
          $url->clearParam();

        return $url;
    }

    /**
     * Read the configuration and return an url part according of the
     * of the https configuration
     * @param string $requestType
     * @param string $module
     * @param string  $action
     * @return string the url base path
     */
    protected function getBasePath($requestType, $module=null, $action=null) {

        if($this->urlhttps == null){
            $this->urlhttps=array();
            $selectors = preg_split("/[\s,]+/", jApp::config()->urlengine['simple_urlengine_https']);
            foreach($selectors as $sel2){
                $this->urlhttps[$sel2]= true;
            }
        }

        $usehttps= false;
        if (count($this->urlhttps)) {
          if($action && isset($this->urlhttps[$module.'~'.$action.'@'.$requestType])){
              $usehttps = true;
          }elseif($module &&  isset($this->urlhttps[$module.'~*@'.$requestType])){
              $usehttps = true;
          }elseif(isset($this->urlhttps['@'.$requestType])){
              $usehttps = true;
          }
        }

        if ($usehttps)
          return jApp::coord()->request->getServerURI(true).jApp::urlBasePath();
        else
          return jApp::urlBasePath();
    }


    /**
     * Read the configuration and gets the script path corresponding to the given parameters
     * @param string $requestType
     * @param string $module
     * @param string  $action
     * @return string the script path
     */
    protected function getScript($requestType, $module=null, $action=null){

        $script = jApp::config()->urlengine['defaultEntrypoint'];

        if(count(jApp::config()->simple_urlengine_entrypoints)){
            if($this->urlspe == null){
                $this->urlspe = array();
                foreach(jApp::config()->simple_urlengine_entrypoints as $entrypoint=>$sel){
                    $selectors = preg_split("/[\s,]+/", $sel);
                    foreach($selectors as $sel2){
                        $this->urlspe[$sel2] = str_replace('__','/',$entrypoint);
                    }
                }
            }

            if ($action && isset($this->urlspe[$s1 = $module.'~'.$action.'@'.$requestType])){
                $script = $this->urlspe[$s1];
            }elseif($action && isset($this->urlspe[$s1 = $module.'~'.substr($action,0,strrpos($action,":")).':*@'.$requestType])){
                $script = $this->urlspe[$s1];
            }elseif($module &&  isset($this->urlspe[$s2 = $module.'~*@'.$requestType])){
                $script = $this->urlspe[$s2];
            }elseif( isset($this->urlspe[$s3 = '@'.$requestType])){
                $script = $this->urlspe[$s3];
            }
        }
        return $script;
    }
}
