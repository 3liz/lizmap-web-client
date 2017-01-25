<?php
/**
* @package     jelix
* @subpackage  jtpl
* @author      Laurent Jouanneau
* @contributor Dominique Papin
* @copyright   2005-2012 Laurent Jouanneau, 2007 Dominique Papin
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * template engine
 * @package     jelix
 * @subpackage  jtpl
 */
class jTpl {


    /**
     * all assigned template variables. 
     * It have a public access only for plugins. So you musn't use directly this property
     * except from tpl plugins.
     * See methods of jTpl to manage template variables
     * @var array
     */
    public $_vars = array ();

    /**
     * temporary template variables for plugins.
     * It have a public access only for plugins. So you musn't use directly this property
     * except from tpl plugins.
     * @var array
     */
    public $_privateVars = array ();

    /**
     * internal use
     * It have a public access only for plugins. So you must not use directly this property
     * except from tpl plugins.
     * @var array
     */
    public $_meta = array();

    public function __construct () {
        $config = jApp::config();
        $this->_vars['j_basepath'] = $config->urlengine['basePath'];
        $this->_vars['j_jelixwww'] = $config->urlengine['jelixWWWPath'];
        $this->_vars['j_jquerypath'] = $config->urlengine['jqueryPath'];
        $this->_vars['j_themepath'] = $config->urlengine['basePath'].'themes/'.$config->theme.'/';
        $this->_vars['j_locale'] = $config->locale;
        $this->_vars['j_datenow'] = date('Y-m-d');
        $this->_vars['j_timenow'] = date('H:i:s');
    }

    /**
     * assign a value in a template variable
     * @param string|array $name the variable name, or an associative array 'name'=>'value'
     * @param mixed  $value the value (or null if $name is an array)
     */
    public function assign ($name, $value = null) {
        if (is_array($name)) {
            $this->_vars = array_merge($this->_vars, $name);
        } else {
            $this->_vars[$name] = $value;
        }
    }

    /**
     * assign a value by reference in a template variable
     * @param string $name the variable name
     * @param mixed  $value the value
     * @since jelix 1.1
     */
    public function assignByRef ($name, & $value) {
        $this->_vars[$name] = &$value;
    }

    /**
     * concat a value in with a value of an existing template variable
     * @param string|array $name the variable name, or an associative array 'name'=>'value'
     * @param mixed  $value the value (or null if $name is an array)
     */
    public function append ($name, $value = null) {
        if (is_array($name)) {
            foreach ($name as $key => $val) {
                if (isset($this->_vars[$key]))
                    $this->_vars[$key] .= $val;
                else
                    $this->_vars[$key] = $val;
            }
        } else {
            if (isset($this->_vars[$name]))
                $this->_vars[$name] .= $value;
            else
                $this->_vars[$name] = $value;
        }
    }

    /**
     * assign a value in a template variable, only if the template variable doesn't exist
     * @param string|array $name the variable name, or an associative array 'name'=>'value'
     * @param mixed  $value the value (or null if $name is an array)
     */
    public function assignIfNone ($name, $value = null) {
        if (is_array($name)) {
            foreach ($name as $key => $val) {
                if (!isset($this->_vars[$key]))
                    $this->_vars[$key] = $val;
            }
        } else {
            if (!isset($this->_vars[$name]))
                $this->_vars[$name] = $value;
        }
    }

    /**
     * assign a zone content to a template variable
     * @param string $name the variable name
     * @param string $zoneName  a zone selector
     * @param array  $params  parameters for the zone
     * @see jZone
     */
    function assignZone ($name, $zoneName, $params = array()) {
        $this->_vars[$name] = jZone::get ($zoneName, $params);
    }

    /**
     * append a zone content to a template variable
     * @param string $name the variable name
     * @param string $zoneName  a zone selector
     * @param array  $params  parameters for the zone
     * @see jZone
     * @since 1.0
     */
    function appendZone ($name, $zoneName, $params = array()) {
        if (isset($this->_vars[$name]))
            $this->_vars[$name] .= jZone::get ($zoneName, $params);
        else
            $this->_vars[$name] = jZone::get ($zoneName, $params);
    }

    /**
     * assign a zone content to a template variable only if this variable doesn't exist
     * @param string $name the variable name
     * @param string $zoneName  a zone selector
     * @param array  $params  parameters for the zone
     * @see jZone
     */
    function assignZoneIfNone ($name, $zoneName, $params = array()) {
        if (!isset($this->_vars[$name]))
            $this->_vars[$name] = jZone::get ($zoneName, $params);
    }

    /**
     * says if a template variable exists
     * @param string $name the variable template name
     * @return boolean true if the variable exists
     */
    public function isAssigned ($name) {
        return isset($this->_vars[$name]);
    }

    /**
     * return the value of a template variable
     * @param string $name the variable template name
     * @return mixed the value (or null if it isn't exist)
     */
    public function get ($name) {
        if (isset ($this->_vars[$name])) {
            return $this->_vars[$name];
        } else {
            $return = null;
            return $return;
        }
    }

    /**
     * Return all template variables
     * @return array
     */
    public function getTemplateVars () {
        return $this->_vars;
    }

    /**
     * process all meta instruction of a template
     * @param string $tpl template selector
     * @param string $outputtype the type of output (html, text etc..)
     * @param boolean $trusted  says if the template file is trusted or not
     * @return array
     */
    public function meta ($tpl, $outputtype = '', $trusted = true) {
        $sel = new jSelectorTpl($tpl,$outputtype,$trusted);
        $tpl = $sel->toString();
        if (in_array($tpl, $this->processedMeta)) {
            // we want to process meta only one time, when a template is included
            // several time in an other template, or, more important, when a template
            // is included in a recursive manner (in this case, it did cause infinite loop, see #1396). 
            return $this->_meta;
        }
        $this->processedMeta[] = $tpl;
        $md = $this->getTemplate ($sel, $outputtype, $trusted);
        $fct = 'template_meta_'.$md;
        $fct($this);

        return $this->_meta;
    }

    /**
     * display the generated content from the given template
     * @param string $tpl template selector
     * @param string $outputtype the type of output (html, text etc..)
     * @param boolean $trusted  says if the template file is trusted or not
     */
    public function display ($tpl, $outputtype = '', $trusted = true) {
        $sel = new jSelectorTpl($tpl,$outputtype,$trusted);
        $tpl = $sel->toString();
        $previousTpl = $this->_templateName;
        $this->_templateName = $tpl;
        $this->recursiveTpl[] = $tpl;
        $md = $this->getTemplate ($sel, $outputtype, $trusted);
        $fct = 'template_'.$md;
        $fct($this);
        array_pop($this->recursiveTpl);
        $this->_templateName = $previousTpl;
    }

    /**
     * contains the name of the template file
     * It have a public access only for plugins. So you musn't use directly this property
     * except from tpl plugins.
     * @var string
     * @since 1.1
     */
    public $_templateName;

    protected $recursiveTpl = array();
    protected $processedMeta = array();

    /**
     * include the compiled template file and call one of the generated function
     * @param string|jSelectorTpl $tpl template selector
     * @param string $outputtype the type of output (html, text etc..)
     * @param boolean $trusted says if the template file is trusted or not
     * @return string the suffix name of the function to call
     * @throws Exception
     */
    protected function getTemplate ($tpl, $outputtype = '', $trusted = true) {
        $tpl->userModifiers = $this->userModifiers;
        $tpl->userFunctions = $this->userFunctions;
        jIncluder::inc($tpl);
        return md5($tpl->module.'_'.$tpl->resource.'_'.$tpl->outputType.($trusted?'_t':''));
    }

    /**
     * return the generated content from the given template
     * @param string $tpl template selector
     * @param string $outputtype the type of output (html, text etc..)
     * @param boolean $trusted says if the template file is trusted or not
     * @param boolean $callMeta false if meta should not be called
     * @return string the generated content
     * @throws Exception
     */
    public function fetch ($tpl, $outputtype='', $trusted = true, $callMeta=true) {
        $content = '';
        ob_start ();
        try{
            $sel = new jSelectorTpl($tpl, $outputtype, $trusted);
            $tpl = $sel->toString();
            $previousTpl = $this->_templateName;
            $this->_templateName = $tpl;
            if ($callMeta) {
                if (in_array($tpl, $this->processedMeta)) {
                    $callMeta = false;
                }
                else
                    $this->processedMeta[] = $tpl;
            }
            $this->recursiveTpl[] = $tpl;
            $md = $this->getTemplate ($sel, $outputtype, $trusted);
            if ($callMeta) {
                $fct = 'template_meta_'.$md;
                $fct($this);
            }
            $fct = 'template_'.$md;
            $fct($this);
            array_pop($this->recursiveTpl);
            $this->_templateName = $previousTpl;
            $content = ob_get_clean();

        } catch(Exception $e) {
            ob_end_clean();
            throw $e;
        }
        return $content;
    }

    /**
     * Return the generated content from the given string template (virtual)
     * @param string $tpl template content
     * @param string $outputtype the type of output (html, text etc..)
     * @param boolean $trusted says if the template file is trusted or not
     * @param boolean $callMeta false if meta should not be called
     * @return string the generated content
     * @throws Exception
     */
    public function fetchFromString ($tpl, $outputtype='', $trusted = true, $callMeta=true){
        $content = '';
        ob_start ();
        try{
            $cachePath = jApp::tempPath('compiled/templates/virtuals/');
            require_once(JELIX_LIB_PATH.'tpl/jTplCompiler.class.php');
            $previousTpl = $this->_templateName;
            $md = 'virtual_'.md5($tpl).($trusted?'_t':'');
            $this->_templateName = $md;

            if ($outputtype == '')
                $outputtype = 'html';

            $cachePath .= $outputtype.'_'.$this->_templateName.'.php';
            $mustCompile = jApp::config()->compilation['force'] || !file_exists($cachePath);

            if ($mustCompile && !function_exists('template_'.$md)) {
                $compiler = new jTplCompiler();
                $compiler->outputType = $outputtype;
                $compiler->trusted = $trusted;
                $compiler->compileString($tpl, $cachePath, $this->userModifiers, $this->userFunctions, $md);
            }
            require_once($cachePath);

            if ($callMeta) {
                $fct = 'template_meta_'.$md;
                $fct($this);
            }
            $fct = 'template_'.$md;
            $fct($this);
            $content = ob_get_clean();
            $this->_templateName = $previousTpl;
        }catch(exception $e){
            ob_end_clean();
            throw $e;
        }
        return $content;
    }

    protected $userModifiers = array();

    /**
     * register a user modifier. The function should accept at least a
     * string as first parameter, and should return this string
     * which can be modified.
     * @param string $name  the name of the modifier in a template
     * @param string $functionName the corresponding PHP function
     * @since jelix 1.1
     */
    public function registerModifier ($name, $functionName) {
        $this->userModifiers[$name] = $functionName;
    }

    protected $userFunctions = array();

    /**
     * register a user function. The function should accept a jTpl object
     * as first parameter.
     * @param string $name  the name of the modifier in a template
     * @param string $functionName the corresponding PHP function
     * @since jelix 1.1
     */
    public function registerFunction ($name, $functionName) {
        $this->userFunctions[$name] = $functionName;
    }

    /**
     * return the current encoding
     * @return string the charset string
     * @since 1.0b2
     */
    public static function getEncoding () {
        return jApp::config()->charset;
    }

}
