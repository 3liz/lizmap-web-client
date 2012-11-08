<?php
/**
* @package    jelix
* @subpackage utils
* @author     Gérald Croes, Laurent Jouanneau
* @contributor Laurent Jouanneau, Laurent Raufaste, Pulsation
* @copyright  2001-2005 CopixTeam, 2005-2012 Laurent Jouanneau, 2008 Laurent Raufaste, 2008 Pulsation
*
* This class was get originally from the Copix project (CopixZone, Copix 2.3dev20050901, http://www.copix.org)
* Some lines of code are copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this Copix classes are Gerald Croes and Laurent Jouanneau,
* and this class was adapted/improved for Jelix by Laurent Jouanneau
*
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * jZone is a representation of a zone in an response content, in a html page.
 * A user zone should inherits from jZone. jZone provide a cache mecanism.
 * @package    jelix
 * @subpackage utils
 */
class jZone {
    /**
    * If we're using cache on this zone
    * You should override it in your class if you want activate the cache
    * @var boolean
    */
    protected $_useCache = false;

    /**
     * cache timeout (seconds).
     * set to 0 if you want to delete cache manually.
     * @var integer
     */
    protected $_cacheTimeout = 0;

    /**
    * list of zone parameters
    * @var array
    */
    protected $_params;

    /**
     * template selector
     * If you want to use a template for your zone, set its name in this property
     * in your zone, and override _prepareTpl. Else, keep it to empty string, and
     * override _createContent
     * @var string
     */
    protected $_tplname='';

    /**
     * says the type of the output of the template, in the case of the result
     * of the zone is not used in a response in the same output type.
     * For example, the output type of a ajax response is text, but the template
     * can contains html, so the template should be treated as html content,
     * so you should put 'html' here.
     * If empty, the output type will be the output type of the current response.
     * @var string
     * @see jTpl::fetch
     */
    protected $_tplOutputType='';

    /**
     * the jtpl object created automatically by jZone if you set up _tplname
     * you can use it in _prepareTpl
     * @var jTpl
     */
    protected $_tpl=null;

    /**
     * When the cache system is activated, says if the cache should be generated or not
     * you set it to false in _createContent or _prepareTpl, in specific case.
     * @var boolean
     */
    protected $_cancelCache=false;

    /**
     * constructor.
     */
    function __construct($params=array()){
        $this->_params = $params;
    }

    /**
    * get the content of a zone
    * @param string $name zone selector
    * @param array $params parameters for the zone
    * @return string the generated content of the zone
    * @since 1.0b1
    */
    public static function get ($name, $params=array ()){
        return self::_callZone($name, 'getContent', $params);
    }

    /**
    * clear a specific cache of a zone
    * @param string $name zone selector
    * @param array $params parameters for the zone
    * @since 1.0b1
    */
    public static function clear ($name, $params=array ()){
        return self::_callZone($name, 'clearCache', $params);
    }

    /**
    * clear all zone cache or all cache of a specific zone
    * @param string $name zone selector
    * @since 1.0b1
    */
    public static function clearAll($name=''){
        $dir = jApp::tempPath('zonecache/');
        if(!file_exists($dir)) return;

        if($name !=''){
            $sel = new jSelectorZone($name);
            $fic = '~'.$sel->module.'~'.strtolower($sel->resource).'zone~';
        }else{
            $fic = '~';
        }

        if ($dh = opendir($dir)) {
           while (($file = readdir($dh)) !== false) {
               if(strpos($file, $fic) === 0){
                   unlink($dir.$file);
               }
           }
           closedir($dh);
       }
    }

    /**
    * gets the value of a parameter, if defined. Returns the default value instead.
    * @param string $paramName the parameter name
    * @param mixed $defaultValue the parameter default value
    * @return mixed the param value
    */
    public function param ($paramName, $defaultValue=null){
        return array_key_exists ($paramName, $this->_params) ? $this->_params[$paramName] : $defaultValue;
    }

    /**
     * Same as param(), included for compatibility with older versions
     * @param string $paramName the parameter name
     * @param mixed $defaultValue the parameter default value
     * @return mixed the param value
     * @deprecated 1.1
     */
    public function getParam ($paramName, $defaultValue=null){
        return $this->param($paramName, $defaultValue);
    }

    /**
    * get the zone content
    * Return the cache content if it is activated and if it's exists, or call _createContent
    * @return string  zone content
    */
    public function getContent (){

        if ($this->_useCache && !jApp::config()->zones['disableCache']){
            $f = $this->_getCacheFile();
            if(file_exists($f)){
                if($this->_cacheTimeout > 0){
                    if (version_compare(PHP_VERSION, '5.3.0') >= 0)
                        clearstatcache(false, $f);
                    else
                        clearstatcache();
                    if(time() - filemtime($f) > $this->_cacheTimeout){
                        // timeout : regenerate the cache
                        unlink($f);
                        $this->_cancelCache=false;
                        $content=$this->_createContent();
                        if(!$this->_cancelCache){
                            jFile::write($f,$content);
                        }
                        return $content;
                    }
                }
                if($this->_tplname != ''){
                    $this->_tpl = new jTpl();
                    $this->_tpl->assign($this->_params);
                    $this->_tpl->meta($this->_tplname, $this->_tplOutputType);
                }
                $content = file_get_contents($f);
            }else{
                $this->_cancelCache=false;
                $content=$this->_createContent();
                if(!$this->_cancelCache){
                    jFile::write($f,$content);
                }
            }
        }else{
            $content=$this->_createContent();
        }
        return $content;
    }

    /**
    * Delete the cache of the current zone
    */
    public function clearCache (){
        if ($this->_useCache){
            $f = $this->_getCacheFile();
            if(file_exists($f)){
                unlink($f);
            }
        }
    }


    /**
    * create the content of the zone
    * by default, it uses a template, and so prepare a jtpl object to use in _prepareTpl.
    * zone parameters are automatically assigned in the template
    * If you don't want a template, override it in your class
    * @return string generated content
    */
    protected function _createContent (){
        $this->_tpl = new jTpl();
        $this->_tpl->assign($this->_params);
        $this->_prepareTpl();
        if($this->_tplname == '') return '';
        return $this->_tpl->fetch($this->_tplname, $this->_tplOutputType);
    }

    /**
     * override this method if you want do additionnal thing on the template object
     * Example : do access to a dao object.. Note : the template object
     * is in the _tpl property
     */
    protected function _prepareTpl(){

    }

    /**
    * create the cache filename
    * @return string the filename
    */
    private function _getCacheFile (){
        $module = jContext::get ();
        $ar = $this->_params;
        ksort($ar);
        $id=md5(serialize($ar));
        return jApp::tempPath('zonecache/~'.$module.'~'.strtolower(get_class($this)).'~'.$id.'.php');
    }

   /**
    * instancy a zone object, and call one of its methods
    * @param string $name zone selector
    * @param string $method method name
    * @param array  $params arguments for the method
    * @return mixed the result returned by the method
    */
    private static function  _callZone($name,$method, &$params){

        $sel = new jSelectorZone($name);
        jContext::push ($sel->module);

        $fileName = $sel->getPath();
        require_once($fileName);
        $className = $sel->resource.'Zone';
        $zone = new $className ($params);
        $toReturn = $zone->$method ();

        jContext::pop ();
        return $toReturn;
    }

    /**
     * @deprecated
     */
    function __set ($name, $value) {
        if ($name == '_tplOuputType') {
            trigger_error('jZone::_tplOuputType is deprecated (mispelled), use jZone::_tplOutputType instead',E_USER_NOTICE);
            $this->_tplOutputType = $value;
        }
    }

    /**
     * @deprecated
     */
    function __get ($name) {
        if ($name == '_tplOuputType') {
            trigger_error('jZone::_tplOuputType is deprecated (mispelled), use jZone::_tplOutputType instead',E_USER_NOTICE);
            return $this->_tplOutputType;
        }
    }
}
