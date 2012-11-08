<?php
/**
* @package     jelix
* @subpackage  urls_engine
* @author      Laurent Jouanneau
* @copyright   2005-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

require_once (dirname(__FILE__).'/../simple/simple.urls.php');

/**
 * basic significant url engine
 * generated url are like module/controller/action and others parameters are in the query
 * @package  jelix
 * @subpackage urls_engine
 * @see jIUrlEngine
 */
class basic_significantUrlEngine extends simpleUrlEngine {

    function __construct() {
        foreach(jApp::config()->basic_significant_urlengine_entrypoints as $script => $val) {
            if (strpos($script, '__') !== false) {
                $script = str_replace('__','/',$script);
                jApp::config()->basic_significant_urlengine_entrypoints[$script] = $val;
            }
        }
    }

    /**
     * Parse a url from the request
     * @param jRequest $request           
     * @param array  $params            url parameters
     * @return jUrlAction
     * @since 1.1
     */
    public function parseFromRequest($request, $params){
        return $this->parse($request->urlScript, $request->urlPathInfo, $params);
    }

    /**
    * Parse some url components
    * @param string $scriptNamePath    /path/index.php
    * @param string $pathinfo          the path info part of the url (part between script name and query)
    * @param array  $params            url parameters (query part e.g. $_REQUEST)
    * @return jUrlAction
    */
    public function parse($scriptNamePath, $pathinfo, $params ){

        if (jApp::config()->urlengine['enableParser']){
            $pathinfo = trim($pathinfo,'/');
            if ($pathinfo != '') {
                $list = explode('/', $pathinfo);
                $co = count($list);
                if ($co == 1) {
                    $params['module'] = $list[0];
                    $params['action'] = 'default:index';
                }
                else if ($co == 2) {
                    $params['module'] = $list[0];
                    $params['action'] = $list[1].':index';
                }
                else {
                    $params['module'] = $list[0];
                    $params['action'] = $list[1].':'.$list[2];
                }
            }
        }
        return new jUrlAction($params);
    }

    /**
    * Create a jurl object with the given action data
    * @param jUrlAction $url  information about the action
    * @return jUrl the url correspondant to the action
    */
    public function create($urlact){
        $m = $urlact->getParam('module');
        $a = $urlact->getParam('action');

        $scriptName = $this->getBasePath($urlact->requestType, $m, $a);
        $script = $this->getScript($urlact->requestType, $m, $a);
        if (isset(jApp::config()->basic_significant_urlengine_entrypoints[$script])
            && jApp::config()->basic_significant_urlengine_entrypoints[$script]) {

            if(!jApp::config()->urlengine['multiview']){
                $script .= jApp::config()->urlengine['entrypointExtension'];
            }
            $scriptName .= $script;
        }

        $url = new jUrl($scriptName, $urlact->params, '');

        // for some request types, parameters aren't in the url
        // so we remove them
        // it's a bit dirty to do that hardcoded here, but it would be a pain
        // to load the request class to check whether we can remove or not
        if(in_array($urlact->requestType ,array('xmlrpc','jsonrpc','soap'))) {

            $url->clearParam();

        } else {

            $pi = '/'.$m.'/';
            if ($a != 'default:index') {
                list($c, $a) = explode(':', $a);
                $pi .= $c.'/';
                if ( $a !='index')
                    $pi.= $a;
            }
            $url->pathInfo = $pi;
            $url->delParam('module');
            $url->delParam('action');
        }
        return $url;
    }
}

