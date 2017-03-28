<?php
/**
* @package     jelix
* @subpackage  urls_engine
* @author      Laurent Jouanneau
* @contributor Thibault Piront (nuKs), Julien Issler
* @copyright   2005-2012 Laurent Jouanneau
* @copyright   2007 Thibault Piront
* @copyright   2016 Julien Issler
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class significantUrlInfoParsing {
    public $entryPoint = '';
    public $entryPointUrl = '';
    public $isHttps = false;
    public $isDefault = false;
    public $action = '';
    public $module = '';
    public $actionOverride = false;
    public $requestType = '';
    public $statics = array();
    public $params = array();
    public $escapes = array();

    function __construct($rt, $ep, $isDefault, $isHttps) {
        $this->requestType = $rt;
        $this->entryPoint = $this->entryPointUrl = $ep;
        $this->isDefault = $isDefault;
        $this->isHttps = $isHttps;
    }

    function getFullSel() {
        if ($this->action) {
            $act = $this->action;
            if (substr($act,-1) == ':') // this is a rest action
                // we should add index because jSelectorAct resolve a "ctrl:" as "ctrl:index"
                // and then create the corresponding selector so url create infos will be found
                $act .= 'index';
        }
        else
            $act = '*';
        return $this->module.'~'.$act.'@'.$this->requestType;
    }
}

/**
* Compiler for significant url engine
* @package  jelix
* @subpackage urls_engine
*/
class jSignificantUrlsCompiler implements jISimpleCompiler{

    protected $requestType;
    protected $defaultUrl;
    protected $parseInfos;
    protected $createUrlInfos;
    protected $createUrlContent;
    protected $createUrlContentInc;
    protected $checkHttps = true;

    protected $typeparam = array('string'=>'([^\/]+)','char'=>'([^\/])', 'letter'=>'(\w)',
        'number'=>'(\d+)', 'int'=>'(\d+)', 'integer'=>'(\d+)', 'digit'=>'(\d)',
        'date'=>'([0-2]\d{3}\-(?:0[1-9]|1[0-2])\-(?:[0-2][1-9]|3[0-1]))',
        'year'=>'([0-2]\d{3})', 'month'=>'(0[1-9]|1[0-2])', 'day'=>'([0-2][1-9]|[1-2]0|3[0-1])',
        'path'=>'(.*)', 'locale'=>'(\w{2,3}(?:(?:\-|_)\w{2,3})?)', 'lang'=>'(\w{2,3})'
        );

    /**
     *
     */
    public function compile($aSelector) {

        $sourceFile = $aSelector->getPath();

        $xml = simplexml_load_file ($sourceFile);
        if (!$xml) {
           return false;
        }
        /*
        <urls>
         <classicentrypoint name="index" default="true">
            <url pathinfo="/test/:mois/:annee" module="" action="">
                  <param name="mois" escape="true" regexp="\d{4}"/>
                  <param name="annee" escape="false" />
                  <static name="bla" value="cequejeveux" />
            </url>
            <url handler="" module="" action=""  />
         </classicentrypoint>
        </urls>

        The compiler generates two files.

        It generates a php file for each entrypoint. A file contains a $PARSE_URL
        array:

            $PARSE_URL = array($isDefault, $infoparser, $infoparser, ... )

        where:
            $isDefault: true if it is the default entry point. In this case and
            where the url parser doesn't find a corresponding action, it will
            ignore else it will generate an error

            $infoparser = array('module','action', 'regexp_pathinfo',
                                'handler selector', array('secondaries','actions'),
                                false // needs https or not
                                )
            or
            $infoparser = array('module','action','regexp_pathinfo',
               array('year','month'), // list of dynamic value included in the url,
                                      // alphabetical ascendant order
               array(true, false),    // list of boolean which indicates for each
                                      // dynamic value, if it is an escaped value or not
               array('bla'=>'whatIWant' ), // list of static values
               array('secondaries','actions'),
               false  // need https or not
            )

        It generates an other file common to all entry point. It contains an
        array which contains informations to create urls

            $CREATE_URL = array(
               'news~show@classic' => // the action selector
                  array(0,'entrypoint', https true/false, 'handler selector')
                  or
                  array(1,'entrypoint', https true/false,
                        array('year','month',), // list of dynamic values included in the url
                        array(0, 1..), // list of integer which indicates for each
                                       // dynamic value: 0: urlencode, 1:urlencode except '/', 2:escape, 4: lang, 8: locale
                        "/news/%1/%2/", // the url
                        array('bla'=>'whatIWant' ) // list of static values
                        )
                  or
                  When there are  several urls to the same action, it is an array of this kind of the previous array:
                  array(4, array(1,...), array(1,...)...)

                  or
                  array(2,'entrypoint', https true/false), // for the patterns "@request"
                  or
                  array(3,'entrypoint', https true/false), // for the patterns "module~@request"
        */

        $this->createUrlInfos = array();
        $this->createUrlContent = "<?php \nif (jApp::config()->compilation['checkCacheFiletime'] &&( \n";
        $this->createUrlContent .= "filemtime('".$sourceFile.'\') > '.filemtime($sourceFile);
        $this->createUrlContentInc = '';
        $this->readProjectXml();
        $this->retrieveModulePaths(basename(jApp::mainConfigFile()));

        // for an app on a simple http server behind an https proxy, we shouldn't check HTTPS
        $this->checkHttps = jApp::config()->urlengine['checkHttpsOnParsing'];

        foreach ($xml->children() as $tagname => $tag) {
            if (!preg_match("/^(.*)entrypoint$/", $tagname, $m)) {
                //TODO : error
                continue;
            }
            $type = $m[1];
            if ($type == '') {
                if (isset($tag['type']))
                    $type = (string)$tag['type'];
                if ($type == '')
                    $type = 'classic';
            }

            $this->defaultUrl = new significantUrlInfoParsing (
                $type,
                (string)$tag['name'],
                (isset($tag['default']) ? (((string)$tag['default']) == 'true'):false),
                (isset($tag['https']) ? (((string)$tag['https']) == 'true'):false)
            );

            if (isset($tag['noentrypoint']) && (string)$tag['noentrypoint'] == 'true')
                $this->defaultUrl->entryPointUrl = '';

            $optionalTrailingSlash = (isset($tag['optionalTrailingSlash']) && $tag['optionalTrailingSlash'] == 'true');

            $this->parseInfos = array($this->defaultUrl->isDefault);

            //let's read the modulesPath of the entry point
            $this->retrieveModulePaths($this->getEntryPointConfig($this->defaultUrl->entryPoint), $this->defaultUrl->entryPoint);

            // if this is the default entry point for the request type,
            // then we add a rule which will match urls which are not
            // defined.
            if ($this->defaultUrl->isDefault) {
                $this->createUrlInfos['@'.$this->defaultUrl->requestType] = array(2, $this->defaultUrl->entryPoint, $this->defaultUrl->isHttps);
            }

            $createUrlInfosDedicatedModules = array();
            $parseContent = "<?php \n";

            foreach ($tag->children() as $tagnameChild => $url) {
                $u = clone $this->defaultUrl;
                $u->module = (string)$url['module'];

                if (isset($url['https'])) {
                    $u->isHttps = (((string)$url['https']) == 'true');
                }

                if (isset($url['noentrypoint']) && ((string)$url['noentrypoint']) == 'true') {
                    $u->entryPointUrl = '';
                }

                if (isset($url['include'])) {
                    $this->readInclude($url, $u);
                    continue;
                }

                // in the case of a non default entry point, if there is just an
                // <url module="" />, so all actions of this module will be assigned
                // to this entry point.
                if (!$u->isDefault && !isset($url['action']) && !isset($url['handler'])) {
                    $this->parseInfos[] = array($u->module, '', '/.*/', array(),
                                                array(), array(), false,
                                                ($this->checkHttps && $u->isHttps));
                    $createUrlInfosDedicatedModules[$u->getFullSel()] = array(3, $u->entryPointUrl, $u->isHttps, true);
                    continue;
                }

                $u->action = (string)$url['action'];

                if (strpos($u->action, ':') === false) {
                    $u->action = 'default:'.$u->action;
                }

                if (isset($url['actionoverride'])) {
                    $u->actionOverride = preg_split("/[\s,]+/", (string)$url['actionoverride']);
                    foreach ($u->actionOverride as &$each) {
                        if (strpos($each, ':') === false) {
                            $each = 'default:'.$each;
                        }
                    }
                }

                // if there is an indicated handler, so, for the given module
                // (and optional action), we should call the given handler to
                // parse or create an url
                if (isset($url['handler'])) {
                    $this->newHandler($u, $url);
                    continue;
                }

                // parse dynamic parameters
                if (isset($url['pathinfo'])) {
                    $path = (string)$url['pathinfo'];
                    $regexppath = $this->extractDynamicParams($url, $path, $u);
                }
                else {
                    $regexppath = '.*';
                    $path = '';
                }

                $tempOptionalTrailingSlash = $optionalTrailingSlash;
                if (isset($url['optionalTrailingSlash'])) {
                    $tempOptionalTrailingSlash = ($url['optionalTrailingSlash'] == 'true');
                }
                if ($tempOptionalTrailingSlash) {
                    if (substr($regexppath, -1) == '/') {
                        $regexppath .= '?';
                    }
                    else {
                        $regexppath .= '\/?';
                    }
                }

                // parse static parameters
                foreach ($url->static as $var) {
                    $t = "";
                    if (isset($var['type'])) {
                        switch ((string) $var['type']) {
                            case 'lang': $t = '$l'; break;
                            case 'locale': $t = '$L'; break;
                            default:
                                throw new Exception('urls definition: invalid type on a <static> element');
                        }
                    }
                    $u->statics[(string)$var['name']] = $t . (string)$var['value'];
                }

                $this->parseInfos[] = array($u->module, $u->action, '!^'.$regexppath.'$!',
                                            $u->params, $u->escapes, $u->statics,
                                            $u->actionOverride, ($this->checkHttps && $u->isHttps));
                $this->appendUrlInfo($u, $path, false);

                if ($u->actionOverride) {
                    foreach ($u->actionOverride as $ao) {
                        $u->action = $ao;
                        $this->appendUrlInfo($u, $path, true);
                    }
                }
            }
            $c = count($createUrlInfosDedicatedModules);
            foreach ($createUrlInfosDedicatedModules as $k=>$inf) {
                if ($c > 1)
                    $inf[3] = false;
                $this->createUrlInfos[$k] = $inf;
            }

            $parseContent .= '$GLOBALS[\'SIGNIFICANT_PARSEURL\'][\''.rawurlencode($this->defaultUrl->entryPoint).'\'] = '
                            .var_export($this->parseInfos, true).";\n?>";

            jFile::write(jApp::tempPath('compiled/urlsig/'.$aSelector->file.'.'.rawurlencode($this->defaultUrl->entryPoint).'.entrypoint.php'),$parseContent);
        }
        $this->createUrlContent .= ")) { return false; } else {\n";
        $this->createUrlContent .= $this->createUrlContentInc;
        $this->createUrlContent .= '$GLOBALS[\'SIGNIFICANT_CREATEURL\'] ='.var_export($this->createUrlInfos, true).";\nreturn true;";
        $this->createUrlContent .= "\n}\n";
        jFile::write(jApp::tempPath('compiled/urlsig/'.$aSelector->file.'.creationinfos_15.php'), $this->createUrlContent);
        return true;
    }

    protected function readProjectXml() {
        $xml = simplexml_load_file(jApp::appPath('project.xml'));
        foreach ($xml->entrypoints->entry as $entrypoint) {
            $file = (string)$entrypoint['file'];
            if (substr($file, -4) != '.php')
                $file.='.php';
            $configFile = (string)$entrypoint['config'];
            $this->entryPoints[$file] = $configFile;
        }
    }

    protected function getEntryPointConfig($entrypoint) {
        if (substr($entrypoint, -4) != '.php')
            $entrypoint.='.php';
        if (!isset($this->entryPoints[$entrypoint]))
            throw new Exception('The entry point "'.$entrypoint.'" is not declared into project.xml');
        return $this->entryPoints[$entrypoint];
    }
    /**
     * list all entry points and their config
     */
    protected $entryPoints = array();

    /**
     * list all modules path
     */
    protected $modulesPath = array();

    /**
     * since urls.xml declare all entrypoints, current entry point does not have
     * access to all modules, so doesn't know all their paths.
     * this method retrieve all module paths declared in the configuration
     * of an entry point or the global configuration
     * @param string $configFile the config file name
     */
    protected function retrieveModulePaths($configFile, $entrypoint = '') {
        $conf = jConfigCompiler::read($configFile, true, false, $entrypoint);
        $this->modulesPath = array_merge( $this->modulesPath,
            jConfigCompiler::getModulesPaths($conf));
    }

    /**
     * @param significantUrlInfoParsing $u
     * @param simpleXmlElement $url
    */
    protected function newHandler($u, $url, $pathinfo = '') {
        $class = (string)$url['handler'];
        // we must have a module name in the selector, because, during the parsing of
        // the url in the request process, we are not still in a module context
        $p = strpos($class,'~');
        if ($p === false)
            $selclass = $u->module.'~'.$class;
        elseif ($p == 0)
            $selclass = $u->module.$class;
        else
            $selclass = $class;

        $s = new jSelectorUrlHandler($selclass);
        if (!isset($url['action'])) {
            $u->action = '*';
        }
        $regexp = '';

        if (isset($url['pathinfo'])) {
            $pathinfo .= '/'.trim((string)$url['pathinfo'], '/');
        }

        if ($pathinfo != '/') {
            $regexp = '!^'.preg_quote($pathinfo, '!').'(/.*)?$!';
        }

        $this->createUrlContentInc .= "include_once('".$s->getPath()."');\n";
        $this->parseInfos[] = array($u->module, $u->action, $regexp, $selclass, $u->actionOverride, ($this->checkHttps && $u->isHttps));
        $this->createUrlInfos[$u->getFullSel()] = array(0, $u->entryPointUrl, $u->isHttps, $selclass, $pathinfo);
        if ($u->actionOverride) {
            foreach ($u->actionOverride as $ao) {
                $u->action = $ao;
                $this->createUrlInfos[$u->getFullSel()] = array(0, $u->entryPointUrl, $u->isHttps, $selclass, $pathinfo);
            }
        }
    }

    /**
     * extract all dynamic parts of a pathinfo, and read <param> elements
     * @param simpleXmlElement $url the url element
     * @param string $path  the path info
     * @param significantUrlInfoParsing $u
     * @return string the correponding regular expression
     */
    protected function extractDynamicParams($url, $pathinfo, $u) {
        $regexppath = preg_quote($pathinfo , '!');
        if (preg_match_all("/(?<!\\\\)\\\:([a-zA-Z_0-9]+)/", $regexppath, $m, PREG_PATTERN_ORDER)) {
            $u->params = $m[1];

            // process parameters which are declared in a <param> element
            foreach ($url->param as $var) {

                $name = (string) $var['name'];
                $k = array_search($name, $u->params);
                if ($k === false) {
                    // TODO error
                    continue;
                }

                $type = '';
                if (isset($var['type'])) {
                    $type = (string)$var['type'];
                    if (isset($this->typeparam[$type]))
                        $regexp = $this->typeparam[$type];
                    else
                        $regexp = '([^\/]+)';
                }
                elseif (isset ($var['regexp'])) {
                    $regexp = '('.(string)$var['regexp'].')';
                }
                else {
                    $regexp = '([^\/]+)';
                }

                $u->escapes[$k] = 0;
                if ($type == 'path') {
                    $u->escapes[$k] = 1;
                }
                else if (isset($var['escape'])) {
                    $u->escapes[$k] = (((string)$var['escape']) == 'true'?2:0);
                }

                if ($type == 'lang') {
                    $u->escapes[$k] |= 4;
                }
                else if ($type == 'locale') {
                    $u->escapes[$k] |= 8;
                }

                $regexppath = str_replace('\:'.$name, $regexp, $regexppath);
            }

            // process parameters that are only declared in the pathinfo
            foreach ($u->params as $k=>$name) {
                if (isset($u->escapes[$k])) {
                    continue;
                }
                $u->escapes[$k] = 0;
                $regexppath = str_replace('\:'.$name, '([^\/]+)', $regexppath);
            }
        }
        $regexppath = str_replace("\\\\\\:", "\:", $regexppath);
        return $regexppath;
    }

    /**
     * register the given url informations
     * @param significantUrlInfoParsing $u
     * @param string $path
     */
    protected function appendUrlInfo($u, $path, $secondaryAction) {
        $cuisel = $u->getFullSel();
        $arr = array(1, $u->entryPointUrl, $u->isHttps, $u->params, $u->escapes, $path, $secondaryAction, $u->statics);
        if (isset($this->createUrlInfos[$cuisel])) {
            if ($this->createUrlInfos[$cuisel][0] == 4) {
                $this->createUrlInfos[$cuisel][] = $arr;
            }
            else {
                $this->createUrlInfos[$cuisel] = array(4, $this->createUrlInfos[$cuisel], $arr);
            }
        }
        else {
            $this->createUrlInfos[$cuisel] = $arr;
        }
    }

    /**
     * @param simpleXmlElement $url
     * @param significantUrlInfoParsing $uInfo
     * @throws Exception
     */
    protected function readInclude($url, $uInfo) {

        $file = (string)$url['include'];
        $pathinfo = '/'.trim((string)$url['pathinfo'], '/');

        if (!isset($this->modulesPath[$uInfo->module]))
            throw new Exception ('urls.xml: the module '.$uInfo->module.' does not exist');

        $path = $this->modulesPath[$uInfo->module];

        if (!file_exists($path.$file))
            throw new Exception ('urls.xml: include file '.$file.' of the module '.$uInfo->module.' does not exist');

        $this->createUrlContent .= " || filemtime('".$path.$file.'\') > '.filemtime($path.$file)."\n";

        $xml = simplexml_load_file ($path.$file);
        if (!$xml) {
           throw new Exception ('urls.xml: include file '.$file.' of the module '.$uInfo->module.' is not a valid xml file');
        }
        $optionalTrailingSlash = (isset($xml['optionalTrailingSlash']) && $xml['optionalTrailingSlash'] == 'true');

        foreach ($xml->url as $url) {
            $u = clone $uInfo;

            $u->action = (string)$url['action'];

            if (strpos($u->action, ':') === false) {
                $u->action = 'default:'.$u->action;
            }

            if (isset($url['actionoverride'])) {
                $u->actionOverride = preg_split("/[\s,]+/", (string)$url['actionoverride']);
                foreach ($u->actionOverride as &$each) {
                    if (strpos($each, ':') === false) {
                        $each = 'default:'.$each;
                    }
                }
            }

            // if there is an indicated handler, so, for the given module
            // (and optional action), we should call the given handler to
            // parse or create an url
            if (isset($url['handler'])) {
                $this->newHandler($u, $url, $pathinfo);
                continue;
            }

            // parse dynamic parameters
            if (isset($url['pathinfo'])) {
                $path = $pathinfo.($pathinfo !='/'?'/':'').trim((string)$url['pathinfo'],'/');
                $regexppath = $this->extractDynamicParams($url, $path, $u);
            }
            else {
                $regexppath = '.*';
                $path = '';
            }

            $tempOptionalTrailingSlash = $optionalTrailingSlash;
            if (isset($url['optionalTrailingSlash'])) {
                $tempOptionalTrailingSlash = ($url['optionalTrailingSlash'] == 'true');
            }
            if ($tempOptionalTrailingSlash) {
                if (substr($regexppath, -1) == '/') {
                    $regexppath .= '?';
                }
                else {
                    $regexppath .= '\/?';
                }
            }

            // parse static parameters
            foreach ($url->static as $var) {
                $t = "";
                if (isset($var['type'])) {
                    switch ((string) $var['type']) {
                        case 'lang': $t = '$l'; break;
                        case 'locale': $t = '$L'; break;
                        default:
                            throw new Exception('urls definition: invalid type on a <static> element');
                    }
                }
                $u->statics[(string)$var['name']] = $t . (string)$var['value'];
            }

            $this->parseInfos[] = array($u->module, $u->action, '!^'.$regexppath.'$!',
                                        $u->params, $u->escapes, $u->statics,
                                        $u->actionOverride, ($this->checkHttps && $u->isHttps));
            $this->appendUrlInfo($u, $path, false);
            if ($u->actionOverride) {
                foreach ($u->actionOverride as $ao) {
                    $u->action = $ao;
                    $this->appendUrlInfo($u, $path, true);
                }
            }
        }
    }

}
