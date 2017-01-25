<?php
/**
 * @package     jelix
 * @subpackage  urls_engine
 * @author      Laurent Jouanneau
 * @copyright   2005-2014 Laurent Jouanneau
 * @link        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * a specific selector for the xml files which contains the configuration of the engine
 * @package  jelix
 * @subpackage urls_engine
 * @author      Laurent Jouanneau
 * @copyright   2005-2006 Laurent Jouanneau
 */
class jSelectorUrlCfgSig extends jSelectorCfg {
    public $type = 'urlcfgsig';

    public function getCompiler(){
        require_once(__DIR__.'/jSignificantUrlsCompiler.class.php');
        $o = new jSignificantUrlsCompiler();
        return $o;
    }
    public function getCompiledFilePath (){ return jApp::tempPath('compiled/urlsig/'.$this->file.'.creationinfos_15.php');}
}

/**
 * a specific selector for user url handler
 * @package  jelix
 * @subpackage urls_engine
 * @author      Laurent Jouanneau
 * @copyright   2005-2006 Laurent Jouanneau
 */
class jSelectorUrlHandler extends jSelectorClass {
    public $type = 'urlhandler';
    protected $_suffix = '.urlhandler.php';

    protected function _createPath(){
        $conf = jApp::config();
        if (isset($conf->_modulesPathList[$this->module])) {
            $p = $conf->_modulesPathList[$this->module];
        } else if (isset($conf->_externalModulesPathList[$this->module])) {
            $p = $conf->_externalModulesPathList[$this->module];
        } else {
            throw new jExceptionSelector('jelix~errors.selector.module.unknown', $this->toString());
        }
        $this->_path = $p.$this->_dirname.$this->subpath.$this->className.$this->_suffix;

        if (!file_exists($this->_path) || strpos($this->subpath,'..') !== false ) { // second test for security issues
            throw new jExceptionSelector('jelix~errors.selector.invalid.target', array($this->toString(), $this->type));
        }
    }

}

/**
 * interface for user url handler
 * @package  jelix
 * @subpackage urls_engine
 * @author      Laurent Jouanneau
 * @copyright   2005-2006 Laurent Jouanneau
 */
interface jIUrlSignificantHandler {
    /**
    * create the jUrlAction corresponding to the given jUrl. Return false if it doesn't correspond
    * @param jUrl $url
    * @return jUrlAction|false
    */
    public function parse($url);

    /**
    * fill the given jurl object depending the jUrlAction object
    * @param jUrlAction $urlact
    * @param jUrl $url
    */
    public function create($urlact, $url);
}

/**
 * an url engine to parse,analyse and create significant url
 * it needs an urls.xml file in the config directory (see documentation)
 * @package  jelix
 * @subpackage urls_engine
 * @author      Laurent Jouanneau
 * @copyright   2005-2011 Laurent Jouanneau
 */
class significantUrlEngine implements jIUrlEngine {

    /**
    * data to create significant url
    * @var array
    */
    protected $dataCreateUrl = null;

    /**
    * data to parse and anaylise significant url, and to determine action, module etc..
    * @var array
    */
    protected $dataParseUrl =  null;

    /**
     * Parse a url from the request
     * @param jRequest $request
     * @param array  $params            url parameters
     * @return jUrlAction
     * @since 1.1
     */
    public function parseFromRequest ($request, $params) {

        $conf = & jApp::config()->urlengine;
        if ($conf['enableParser']) {

            $sel = new jSelectorUrlCfgSig($conf['significantFile']);
            jIncluder::inc($sel);
            $snp  = $conf['urlScriptIdenc'];
            $file = jApp::tempPath('compiled/urlsig/'.$sel->file.'.'.$snp.'.entrypoint.php');
            if (file_exists($file)) {
                require($file);
                $this->dataCreateUrl = & $GLOBALS['SIGNIFICANT_CREATEURL']; // given by jIncluder line 99
                $this->dataParseUrl = & $GLOBALS['SIGNIFICANT_PARSEURL'][$snp];
                $isHttps = ($request->getProtocol() == 'https://');
                return $this->_parse($request->urlScript, $request->urlPathInfo, $params, $isHttps);
            }
        }

        $urlact = new jUrlAction($params);
        return $urlact;
    }

    /**
    * Parse some url components
    * @param string $scriptNamePath    /path/index.php
    * @param string $pathinfo          the path info part of the url (part between script name and query)
    * @param array  $params            url parameters (query part e.g. $_REQUEST)
    * @return jUrlAction
    */
    public function parse($scriptNamePath, $pathinfo, $params){
        $conf = & jApp::config()->urlengine;

        if ($conf['enableParser']) {

            $sel = new jSelectorUrlCfgSig($conf['significantFile']);
            jIncluder::inc($sel);
            $basepath = $conf['basePath'];
            if (strpos($scriptNamePath, $basepath) === 0) {
                $snp = substr($scriptNamePath,strlen($basepath));
            }
            else {
                $snp = $scriptNamePath;
            }
            $pos = strrpos($snp, '.php');
            if ($pos !== false) {
                $snp = substr($snp,0,$pos);
            }
            $snp = rawurlencode($snp);
            $file = jApp::tempPath('compiled/urlsig/'.$sel->file.'.'.$snp.'.entrypoint.php');
            if (file_exists($file)) {
                require($file);
                $this->dataCreateUrl = & $GLOBALS['SIGNIFICANT_CREATEURL']; // given by jIncluder line 127
                $this->dataParseUrl = & $GLOBALS['SIGNIFICANT_PARSEURL'][$snp];
                return $this->_parse($scriptNamePath, $pathinfo, $params, false);
            }
        }
        $urlact = new jUrlAction($params);
        return $urlact;
    }

    /**
    *
    * @param string $scriptNamePath    /path/index.php
    * @param string $pathinfo          the path info part of the url (part between script name and query)
    * @param array  $params            url parameters (query part e.g. $_REQUEST)
    * @param boolean $isHttps          says if the given url is asked with https or not
    * @return jUrlAction
    */
    protected function _parse($scriptNamePath, $pathinfo, $params, $isHttps){

        $urlact = null;
        $isDefault = false;
        $url = new jUrl($scriptNamePath, $params, $pathinfo);

        foreach ($this->dataParseUrl as $ninf=>$infoparsing) {
            // the first element indicates if the entry point is a default entry point or not
            if ($ninf==0) {
                $isDefault = $infoparsing;
                continue;
            }

            if (count($infoparsing) < 7) {
                // an handler will parse the request URI
                list($module, $action, $reg, $selectorHandler, $secondariesActions, $needHttps) = $infoparsing;
                $url2 = clone $url;
                if ($reg != '') {
                    if (preg_match($reg, $pathinfo, $m))
                        $url2->pathInfo = isset($m[1])?$m[1]:'/';
                    else
                        continue;
                }
                $s = new jSelectorUrlHandler($selectorHandler);
                include_once($s->getPath());
                $c = $s->className.'UrlsHandler';
                $handler = new $c();

                $url2->params['module'] = $module;

                // if the action parameter exists in the current url
                // and if it is one of secondaries actions, then we keep it
                // else we take the action indicated in the url mapping
                if ($secondariesActions && isset($params['action'])) {
                    if (strpos($params['action'], ':') === false) {
                        $params['action'] = 'default:'.$params['action'];
                    }
                    if (in_array($params['action'], $secondariesActions))
                        // action peut avoir été écrasé par une itération précédente
                        $url2->params['action'] = $params['action'];
                    else
                        $url2->params['action'] = $action;
                }
                else {
                    $url2->params['action'] = $action;
                }
                // appel au handler
                if ($urlact = $handler->parse($url2)) {
                    break;
                }
            }
            elseif (preg_match ($infoparsing[2], $pathinfo, $matches)) {

                /* we have this array
                array( 0=>'module', 1=>'action', 2=>'regexp_pathinfo',
                3=>array('year','month'), // list of dynamic value included in the url,
                                      // alphabetical ascendant order
                4=>array(0, 1..), // list of integer which indicates for each
                                // dynamic value: 0: urlencode, 1:urlencode except '/', 2:escape, 4: lang, 8: locale

                5=>array('bla'=>'whatIWant' ), // list of static values
                6=>false or array('secondaries','actions')
                */
                list($module, $action, $reg, $dynamicValues, $escapes,
                     $staticValues, $secondariesActions, $needHttps) = $infoparsing;

                if (isset($params['module']) && $params['module'] !== $module)
                    continue;

                if ($module != '')
                    $params['module'] = $module;

                // if the action parameter exists in the current url
                // and if it is one of secondaries actions, then we keep it
                // else we take the action indicated in the url mapping
                if ($secondariesActions && isset($params['action']) ) {
                    if (strpos($params['action'], ':') === false) {
                        $params['action'] = 'default:'.$params['action'];
                    }
                    if (!in_array($params['action'], $secondariesActions) && $action !='') {
                        $params['action'] = $action;
                    }
                }
                else {
                    if ($action !='')
                        $params['action'] = $action;
                }

                // let's merge static parameters
                if ($staticValues) {
                    foreach ($staticValues as $n=>$v) {
                        if (!empty($v) && $v[0] == '$') { // special statique value
                            $typeStatic = $v[1];
                            $v = substr($v,2);
                            if ($typeStatic == 'l')
                                jApp::config()->locale = jLocale::langToLocale($v);
                            else if ($typeStatic == 'L')
                                jApp::config()->locale = $v;
                        }
                        $params[$n] = $v;
                    }
                }

                // now let's read dynamic parameters
                if (count($matches)) {
                    array_shift($matches);
                    foreach ($dynamicValues as $k=>$name){
                        if (isset($matches[$k])) {
                            if ($escapes[$k] & 2) {
                                $params[$name] = jUrl::unescape($matches[$k]);
                            }
                            else {
                                $params[$name] = $matches[$k];
                                if ($escapes[$k] & 4) {
                                    $v = $matches[$k];
                                    if (preg_match('/^\w{2,3}$/', $v, $m))
                                        jApp::config()->locale = jLocale::langToLocale($v);
                                    else {
                                        jApp::config()->locale = $v;
                                        $params[$name] = substr($v, 0, strpos($v, '_'));
                                    }
                                }
                                else if ($escapes[$k] & 8) {
                                    $v = $matches[$k];
                                    if (preg_match('/^\w{2,3}$/', $v, $m)) {
                                        jApp::config()->locale = $params[$name] = jLocale::langToLocale($v);
                                    }
                                    else
                                        jApp::config()->locale = $v;
                                }
                            }
                        }
                    }
                }
                $urlact = new jUrlAction($params);
                break;
            }
        }
        if (!$urlact) {
            if ($isDefault && $pathinfo == '') {
                // if we didn't find the url in the mapping, and if this is the default
                // entry point, then we do anything
                $urlact = new jUrlAction($params);
            }
            else {
                try {
                    $urlact = jUrl::get(jApp::config()->urlengine['notfoundAct'], array(), jUrl::JURLACTION);
                }
                catch (Exception $e) {
                    $urlact = new jUrlAction(array('module'=>'jelix', 'action'=>'error:notfound'));
                }
            }
        }
        else if ($needHttps && ! $isHttps) {
            // the url is declared for HTTPS, but the request does not come from HTTPS
            // -> 404 not found
            $urlact = new jUrlAction(array('module'=>'jelix', 'action'=>'error:notfound'));
        }
        return $urlact;
    }

    /**
     * Create a jurl object with the given action data
     * @param $urlact
     * @return jUrl the url correspondant to the action
     * @throws Exception
     * @internal param jUrlAction $url information about the action
     * @author      Laurent Jouanneau
     * @copyright   2005 CopixTeam, 2005-2006 Laurent Jouanneau
     *   very few lines of code are copyrighted by CopixTeam, written by Laurent Jouanneau
     *   and released under GNU Lesser General Public Licence,
     *   in an experimental version of Copix Framework v2.3dev20050901,
     *   http://www.copix.org.
     */
    public function create($urlact) {

        if ($this->dataCreateUrl == null) {
            $sel = new jSelectorUrlCfgSig(jApp::config()->urlengine['significantFile']);
            jIncluder::inc($sel);
            $this->dataCreateUrl = & $GLOBALS['SIGNIFICANT_CREATEURL'];
        }

        $url = new jUrl('', $urlact->params, '');

        $module = $url->getParam('module', jApp::getCurrentModule());
        $action = $url->getParam('action');

        // let's try to retrieve informations corresponding
        // to the given action. this informations will allow us to build
        // the url
        $id = $module.'~'.$action.'@'.$urlact->requestType;
        $urlinfo = null;
        if (isset ($this->dataCreateUrl [$id])) {
            $urlinfo = $this->dataCreateUrl[$id];
            $url->delParam('module');
            $url->delParam('action');
        }
        else {
            $id = $module.'~*@'.$urlact->requestType;
            if (isset ($this->dataCreateUrl[$id])) {
                $urlinfo = $this->dataCreateUrl[$id];
                if ($urlinfo[0] != 3 || $urlinfo[3] === true)
                    $url->delParam('module');
            }
            else {
                $id = '@'.$urlact->requestType;
                if (isset ($this->dataCreateUrl [$id])) {
                    $urlinfo = $this->dataCreateUrl[$id];
                }
                else {
                    throw new Exception("Significant url engine doesn't find corresponding url to this action :".$module.'~'.$action.'@'.$urlact->requestType);
                }
            }
        }
        /*
        urlinfo =
          or array(0,'entrypoint', https true/false, 'handler selector', 'basepathinfo')
          or array(1,'entrypoint', https true/false,
                  array('year','month',), // list of dynamic values included in the url
                  array(true, false..), // list of integers which indicates for each
                                        // dynamic value: 0: urlencode, 1:urlencode except '/', 2:escape
                  "/news/%1/%2/", // the url
                  true/false, // false : this is a secondary action
                  array('bla'=>'whatIWant' ) // list of static values
                  )
          or array(2,'entrypoint', https true/false), // for the patterns "@request"
          or array(3,'entrypoint', https true/false), // for the patterns "module~@request"
          or array(4, array(1,...), array(1,...)...)
        */
        if ($urlinfo[0] == 4) {
            // an action is mapped to several urls
            // so it isn't finished. Let's find building information
            // into the array
            $l = count($urlinfo);
            $urlinfofound = null;
            for ($i=1; $i < $l; $i++) {
                $ok = true;
                // verify that given static parameters of the action correspond
                // to those defined for this url
                foreach ($urlinfo[$i][7] as $n=>$v) {
                    // specialStatic are static values for which the url engine
                    // can compare not only with a given url parameter value, but
                    // also with a value stored some where (typically, a configuration value)
                    $specialStatic = (!empty($v) && $v[0] == '$');
                    $paramStatic = $url->getParam($n, null);
                    if ($specialStatic) { // special statique value
                        $typePS = $v[1];
                        $v = substr($v,2);
                        if ($typePS == 'l') {
                            if ($paramStatic === null)
                                $paramStatic = jLocale::getCurrentLang();
                            else if (preg_match('/^(\w{2,3})_\w{2,3}$/', $paramStatic, $m)) { // if the value is a locale instead of lang, translate it
                                $paramStatic = $m[1];
                            }
                        }
                        elseif ($typePS == 'L') {
                            if ($paramStatic === null)
                                $paramStatic = jApp::config()->locale;
                            else if (preg_match('/^\w{2,3}$/', $paramStatic, $m)) { // if the value is a lang instead of locale, translate it
                                $paramStatic = jLocale::langToLocale($paramStatic);
                            }
                        }
                    }

                    if ($paramStatic != $v) {
                        $ok = false;
                        break;
                    }
                }
                if ($ok) {
                    // static parameters correspond: we found our informations
                    $urlinfofound = $urlinfo[$i];
                    break;
                }
            }
            if ($urlinfofound !== null) {
                $urlinfo = $urlinfofound;
            }
            else {
                $urlinfo = $urlinfo[1];
            }
        }

        // at this step, we have informations to build the url

        $url->scriptName = jApp::urlBasePath().$urlinfo[1];
        if ($urlinfo[2])
            $url->scriptName = jApp::coord()->request->getServerURI(true).$url->scriptName;

        if ($urlinfo[1] && !jApp::config()->urlengine['multiview']) {
            $url->scriptName .= '.php';
        }

        // for some request types, parameters aren't in the url
        // so we remove them
        // it's a bit dirty to do that hardcoded here, but it would be a pain
        // to load the request class to check whether we can remove or not
        if (in_array($urlact->requestType, array('xmlrpc','jsonrpc','soap'))) {
            $url->clearParam();
            return $url;
        }

        if ($urlinfo[0] == 0) {
            $s = new jSelectorUrlHandler($urlinfo[3]);
            $c = $s->resource.'UrlsHandler';
            $handler = new $c();
            $handler->create($urlact, $url);
            if ($urlinfo[4] != '') {
                $url->pathInfo = $urlinfo[4].$url->pathInfo;
            }
        }
        elseif($urlinfo[0] == 1) {
            $pi = $urlinfo[5];
            foreach ($urlinfo[3] as $k=>$param){
                $typeParam = $urlinfo[4][$k];
                $value = $url->getParam($param,'');
                if ($typeParam & 2) {
                    $value = jUrl::escape($value, true);
                }
                else if ($typeParam & 1) {
                    $value = str_replace('%2F', '/', urlencode($value));
                }
                else if ($typeParam & 4) {
                    if ($value == '') {
                        $value = jLocale::getCurrentLang();
                    }
                    else if (preg_match('/^(\w{2,3})_\w{2,3}$/', $value, $m)) {
                        $value = $m[1];
                    }
                }
                else if ($typeParam & 8) {
                    if ($value == '') {
                        $value = jApp::config()->locale;
                    }
                    else if (preg_match('/^\w{2,3}$/', $value, $m)) {
                        $value = jLocale::langToLocale($value);
                    }
                }
                else {
                    $value = urlencode($value);
                }
                $pi = str_replace(':'.$param, $value, $pi);
                $url->delParam($param);
            }
            $url->pathInfo = $pi;
            if ($urlinfo[6])
                $url->setParam('action',$action);
            // removed parameters corresponding to static values
            foreach ($urlinfo[7] as $name=>$value) {
                $url->delParam($name);
            }
        }
        elseif ($urlinfo[0] == 3) {
            if ($urlinfo[3]) {
                $url->delParam('module');
            }
        }

        return $url;
    }
}
