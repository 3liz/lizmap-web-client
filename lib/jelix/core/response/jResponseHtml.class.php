<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Laurent Jouanneau
* @contributor Yann, Dominique Papin
* @contributor Warren Seine, Alexis Métaireau, Julien Issler, Olivier Demah, Brice Tence
* @copyright   2005-2018 Laurent Jouanneau, 2006 Yann, 2007 Dominique Papin
* @copyright   2008 Warren Seine, Alexis Métaireau
* @copyright   2009 Julien Issler, Olivier Demah
* @copyright   2010 Brice Tence
*              few lines of code are copyrighted CopixTeam http://www.copix.org
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
*
*/
require_once(__DIR__.'/jResponseBasicHtml.class.php');
require_once(JELIX_LIB_PATH.'tpl/jTpl.class.php');

/**
* HTML5 response
* @package  jelix
* @subpackage core_response
*/
class jResponseHtml extends jResponseBasicHtml {
    /**
    * jresponse id
    * @var string
    */
    protected $_type = 'html';

    /**
     * Title of the document
     * @var string
     */
    public $title = '';

    /**
     * favicon url linked to the document
     * @var string
     * @since 1.0b2
     */
    public $favicon = '';

    /**
     * The template engine used to generate the body content
     * @var jTpl
     */
    public $body = null;

    /**
     * selector of the main template file
     * This template should contains the body content, and is used by the $body template engine
     * @var string
     */
    public $bodyTpl = '';

    /**
     * Selector of the template used when there are some errors, instead of $bodyTpl
     * @var string
     */
    public $bodyErrorTpl = '';

    /**
     * body attributes
     * This attributes are written on the body tags
     * @var array
     */
    public $bodyTagAttributes= array();

    /**
     *
     * @var string indicate the value for the X-UA-Compatible meta element, which
     *   indicate the compatiblity mode of IE. Exemple: "IE=edge"
     *   In future version, default will be "IE=edge".
     * @since 1.6.17
     */
    public $IECompatibilityMode = '';

    /**
     * @var string the content of the viewport meta element
     * @since 1.6.17
     */
    public $metaViewport = '';

    /**
     * list of css stylesheet
     * @var array  key = url, value=link attributes
     */
    protected $_CSSLink = array ();

    /**
     * list of css stylesheet for IE
     * @var array  key = url, value=link attributes + optional parameter _iecondition
     */
    protected $_CSSIELink = array ();

    /**
     * list of CSS code
     */
    protected $_Styles  = array ();

    /**
     * list of js script
     * @var array  key = url, value=link attributes
     */
    protected $_JSLink  = array ();

    /**
     * list of js script for IE
     * @var array  key = url, value=link attributes + optional parameter _iecondition
     */
    protected $_JSIELink  = array ();

    /**
     * inline js code to insert before js links
     * @var array list of js source code
     */
    protected $_JSCodeBefore  = array ();

    /**
     * inline js code to insert after js links
     * @var array list of js source code
     */
    protected $_JSCode  = array ();

    /**
     * list of keywords to add into a meta keyword tag
     * @var array  array of strings
     */
    protected $_MetaKeywords = array();

    /**
     * list of descriptions to add into a meta description tag
     * @var array  array of strings
     */
    protected $_MetaDescription = array();

    /**
     * content of the meta author tag
     * @var string
     */
    protected $_MetaAuthor = '';

    /**
     * content of the meta generator tag
     * @var string
     */
    protected $_MetaGenerator = '';

    /**
     * @var bool false if it should be output <meta charset=""/> or true
     *               for the default old behavior : <meta content="text/html; charset=""../>
     * @since 1.6.17
     */
    protected $_MetaOldContentType = true;

    /**
     *
     * @var array[] list of arrays containing attributes for each meta elements
     * @since 1.6.17
     */
    protected $_Meta = array();

    /**
     * list of information to generate link tags
     * @var array keys are the href value, valu is an array ('rel','type','title')
     */
    protected $_Link = array();

    /**
     * the end tag to finish tags. it is different if we are in XHTML mode or not
     * @var string
     */
    protected $_endTag="/>\n";

    /**
    * constructor;
    * setup the charset, the lang, the template engine
    */
    function __construct (){
        $this->body = new jTpl();
        parent::__construct();
    }

    /**
     * output the html content
     *
     * @return boolean    true if the generated content is ok
     */
    public function output(){
    
        if($this->_outputOnlyHeaders){
            $this->sendHttpHeaders();
            return true;
        }

        foreach($this->plugins as $name=>$plugin)
            $plugin->afterAction();

        $this->doAfterActions();

        $this->setContentType();
        // let's get the main content for the body
        // we don't output yet <head> and other things, to have the
        // opportunity for any components called during the output,
        // to add things in the <head>
        if ($this->bodyTpl != '') {
            $this->body->meta($this->bodyTpl);
            $content = $this->body->fetch($this->bodyTpl, 'html', true, false);
        }
        else $content = '';

        // retrieve errors messages and log messages
        jLog::outputLog($this);

        foreach($this->plugins as $name=>$plugin)
            $plugin->beforeOutput();

        // now let's output the html content
        $this->sendHttpHeaders();
        $this->outputDoctype();
        $this->outputHtmlHeader();
        echo '<body ';
        foreach($this->bodyTagAttributes as $attr=>$value){
            echo $attr,'="', htmlspecialchars($value),'" ';
        }
        echo ">\n";
        echo implode("\n",$this->_bodyTop);
        echo $content;
        echo implode("\n",$this->_bodyBottom);

        foreach($this->plugins as $name=>$plugin)
            $plugin->atBottom();

        echo '</body></html>';
        return true;
    }

    /**
     * set the title of the page
     * 
     * @param string $title
     */ 
    public function setTitle($title) {
        $this->title = $title;
    }

    /**
     * add a generic link to the head
     * 
     * @param string $href  url of the link
     * @param string $rel   relation name
     * @param string $type  mime type of the ressource
     * @param string $title
     */ 
    public function addLink($href, $rel, $type='', $title='') {
        $this->_Link[$href] = array($rel, $type, $title);
    }

    /**
     * add a link to a javascript script in the document head
     *
     * $forIe parameter exists since 1.0b2
     *
     * @param string $src the link
     * @param array $params additionnals attributes for the script tag
     * @param boolean $forIE if true, the script sheet will be only for IE browser. string values possible (ex:'lt IE 7')
     */
    public function addJSLink ($src, $params=array(), $forIE=false){
        if($forIE){
            if (!isset ($this->_JSIELink[$src])){
                if (!is_bool($forIE) && !empty($forIE))
                    $params['_ieCondition'] = $forIE;
                $this->_JSIELink[$src] = $params;
            }
        }else{
            if (!isset ($this->_JSLink[$src])){
                $this->_JSLink[$src] = $params;
            }
        }
    }
    
    /**
    *  add a link to a javascript script stored into modules
    *
    * @param string $module  the module where file is stored
    * @param mixed $src the relative path inside the {module}/www/ directory
    * @param array $params additionnal parameters for the generated tag (a media attribute for stylesheet for example)
    * @param boolean $forIE if true, the script sheet will be only for IE browser. string values possible (ex:'lt IE 7')
    */
    public function addJSLinkModule ($module, $src, $params=array(), $forIE=false){ 
        $src = jUrl::get('jelix~www:getfile', array('targetmodule'=>$module, 'file'=>$src));
        if($forIE){
            if (!isset ($this->_JSIELink[$src])){
                if (!is_bool($forIE) && !empty($forIE))
                    $params['_ieCondition'] = $forIE;
                $this->_JSIELink[$src] = $params;
            }
        }else{
            if (!isset ($this->_JSLink[$src])){
                $this->_JSLink[$src] = $params;
            }
        }
    }

    /**
     * returns all JS links
     * @return array  key = url, value=link attributes
     */
    public function getJSLinks() { return $this->_JSLink; }

    /**
     * set all JS links
     * @param array  $list key = url, value=link attributes
     */
    public function setJSLinks($list) { $this->_JSLink = $list; }

    /**
     * returns all JS links for IE
     * @return array  key = url, value=link attributes + optional parameter _iecondition
     */
    public function getJSIELinks() { return $this->_JSIELink; }

    /**
     * set all JS links for IE
     * @param array  $list key = url, value=link attributes
     */
    public function setJSIELinks($list) { $this->_JSIELink = $list; }

     /**
     * returns all CSS links
     * @return array  key = url, value=link attributes
     */
    public function getCSSLinks() { return $this->_CSSLink; }

    /**
     * set all CSS links
     * @param array  $list key = url, value=link attributes
     */
    public function setCSSLinks($list) { $this->_CSSLink = $list; }

    /**
     * returns all CSS links for IE
     * @return array  key = url, value=link attributes + optional parameter _iecondition
     */
     public function getCSSIELinks() { return $this->_CSSIELink; }

    /**
     * set all CSS links for IE
     * @param array  $list key = url, value=link attributes
     */
    public function setCSSIELinks($list) { $this->_CSSIELink = $list; }

    /**
     * add a link to a css stylesheet in the document head
     *
     * $forIe parameter exists since 1.0b2
     *
     * @param string $src the link
     * @param array $params additionnals attributes for the link tag
     * @param mixed $forIE if true, the style sheet will be only for IE browser. string values possible (ex:'lt IE 7')
     */
    public function addCSSLink ($src, $params=array (), $forIE=false){
        if($forIE){
            if (!isset ($this->_CSSIELink[$src])){
                if (!is_bool($forIE) && !empty($forIE))
                    $params['_ieCondition'] = $forIE;
                $this->_CSSIELink[$src] = $params;
            }
        }else{
            if (!isset ($this->_CSSLink[$src])){
                $this->_CSSLink[$src] = $params;
            }
        }
    }
    
    /**
    *  add a link to a css stylesheet  stored into modules
    *
    * @param string $module  the module where file is stored
    * @param mixed $src the relative path inside the {module}/www/ directory
    * @params array $params additionnal parameters for the generated tag (a media attribute for stylesheet for example)
    * @param boolean $forIE if true, the script sheet will be only for IE browser. string values possible (ex:'lt IE 7')
    */
    public function addCSSLinkModule ($module, $src, $params=array(), $forIE=false){ 
        $src = jUrl::get('jelix~www:getfile', array('targetmodule'=>$module, 'file'=>$src));
        if($forIE){
            if (!isset ($this->_CSSIELink[$src])){
                if (!is_bool($forIE) && !empty($forIE))
                    $params['_ieCondition'] = $forIE;
                $this->_CSSIELink[$src] = $params;
            }
        }else{
            if (!isset ($this->_CSSLink[$src])){
                $this->_CSSLink[$src] = $params;
            }
        }
    }

    /**
    *  add a link to a csstheme stylesheet  stored into modules
    *
    * @param string $module  the module where file is stored
    * @param mixed $src the relative path inside the {module}/www/themes/{currenttheme}/ directory
    * @params array $params additionnal parameters for the generated tag (a media attribute for stylesheet for example)
    * @param boolean $forIE if true, the script sheet will be only for IE browser. string values possible (ex:'lt IE 7')
    */
    public function addCSSThemeLinkModule ($module, $src, $params=array(), $forIE=false){ 
        $src =  $url = jUrl::get('jelix~www:getfile', array('targetmodule'=>$module, 'file'=>'themes/'.jApp::config()->theme.'/'.$src));
        if($forIE){
            if (!isset ($this->_CSSIELink[$src])){
                if (!is_bool($forIE) && !empty($forIE))
                    $params['_ieCondition'] = $forIE;
                $this->_CSSIELink[$src] = $params;
            }
        }else{
            if (!isset ($this->_CSSLink[$src])){
                $this->_CSSLink[$src] = $params;
            }
        }
    }  

    /**
     * add inline css style into the document (inside a <style> tag)
     * @param string $selector css selector
     * @param string $def      css properties for the given selector
     */
    public function addStyle ($selector, $def=null){
        if (!isset ($this->_Styles[$selector])){
            $this->_Styles[$selector] = $def;
        }
    }

    /**
     * set attributes on the body tag
     * @param array $attrArray  an associative array of attributes and their values
     */
    public function setBodyAttributes ( $attrArray ){
        if( is_array($attrArray) ) {
            foreach( $attrArray as $attr => $value ) {
                if(!is_numeric($attr)) {
                    $this->bodyTagAttributes[$attr]=$value;
                }
            }
        }
    }

    /**
     * add inline javascript code (inside a <script> tag)
     * @param string $code  javascript source code
     * @param boolean $before will insert the code before js links if true
     */
    public function addJSCode ($code, $before = false){
        if ($before)
            $this->_JSCodeBefore[] = $code;
        else
            $this->_JSCode[] = $code;
    }

    /**
     * add some keywords in a keywords meta tag
     * @author Yann
     * @param string $content keywords
     * @since 1.0b1
     */
    public function addMetaKeywords ($content){
        $this->_MetaKeywords[] = $content;
    }
    /**
     * add a description in a description meta tag
     * @author Yann
     * @param string $content a description
     * @since 1.0b1
     */
    public function addMetaDescription ($content){
        $this->_MetaDescription[] = $content;
    }

    /**
     * add author(s) in a author meta tag
     * @author Olivier Demah
     * @param string $content author(s)
     * @since 1.2
     */
    public function addMetaAuthor($content){
        $this->_MetaAuthor = $content;
    }

    /**
     * add generator a generator meta tag
     * @author Olivier Demah
     * @param string $content generator
     * @since 1.2
     */
    public function addMetaGenerator($content){
        $this->_MetaGenerator = $content;
    }

    /**
     * add a meta element
     * @param array  list of attribute and their values to set on a new meta element
     */
    public function addMeta($params) {
        $this->_Meta[] = $params;
    }

    /**
     * generate the doctype. You can override it if you want to have your own doctype, like XHTML+MATHML.
     * @since 1.1
     */
    protected function outputDoctype (){
        echo '<!DOCTYPE HTML>', "\n";
        $lang = str_replace('_', '-', $this->_lang);
        if($this->_isXhtml){
            echo '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="',$lang,'" lang="',$lang,'">'."\n";
        }else{
            echo '<html lang="',$lang,'">'."\n";
        }
    }

    protected function outputJsScriptTag( $fileUrl, $scriptParams ) {
        $params = '';
        foreach ($scriptParams as $param_name=>$param_value){
            if ($param_name=='_ieCondition')
                continue ;
            $params .= $param_name.'="'. htmlspecialchars($param_value).'" ';
        }

        echo '<script type="text/javascript" src="',htmlspecialchars($fileUrl),'" ',$params,'></script>',"\n";
    }


    protected function outputCssLinkTag( $fileUrl, $cssParams ) {
        $params = '';   
        foreach ($cssParams as $param_name=>$param_value){
            if ($param_name=='_ieCondition')
                continue ;
            $params .= $param_name.'="'. htmlspecialchars($param_value).'" ';
        }

        if(!isset($cssParams['rel']))
            $params .='rel="stylesheet" ';
        echo '<link type="text/css" href="',htmlspecialchars($fileUrl),'" ',$params,$this->_endTag,"\n";
    }

    /**
     * @param string[] $params  list of attributes to add to a meta element
     * @since 1.6.17
     */
    protected function outputMetaTag($params ) {
        $html = '';
        foreach ($params as $param_name=>$param_value){
            $html .= $param_name.'="'. htmlspecialchars($param_value).'" ';
        }

        echo '<meta ', $html, $this->_endTag;
    }

    /**
     * generate the content of the <head> content
     */
    protected function outputHtmlHeader (){

        echo "<head>\n";
        echo implode ("\n", $this->_headTop);
        if($this->_isXhtml && $this->xhtmlContentType && strstr($_SERVER['HTTP_ACCEPT'],'application/xhtml+xml')){      
            echo '<meta content="application/xhtml+xml; charset='.$this->_charset.'" http-equiv="content-type"'.$this->_endTag;
        } else if (!$this->_MetaOldContentType) {
            echo '<meta charset="'.$this->_charset.'" '.$this->_endTag;
        } else {
            echo '<meta content="text/html; charset='.$this->_charset.'" http-equiv="content-type"'.$this->_endTag;
        }

        if ($this->IECompatibilityMode) {
            echo '<meta http-equiv="X-UA-Compatible" content="'.$this->IECompatibilityMode.'"'.$this->_endTag;
        }

        if ($this->metaViewport) {
            echo '<meta name="viewport" content="'.$this->metaViewport.'"'.$this->_endTag;
        }

        // Meta link
        foreach ($this->_Meta as $params){
            $this->outputMetaTag($params);
        }

        echo '<title>'.htmlspecialchars($this->title)."</title>\n";

        if(!empty($this->_MetaDescription)){
            // meta description
            $description = implode(' ',$this->_MetaDescription);
            echo '<meta name="description" content="'.htmlspecialchars($description).'" '.$this->_endTag;
        }

        if(!empty($this->_MetaKeywords)){
            // meta description
            $keywords = implode(',',$this->_MetaKeywords);
            $this->outputMetaTag(array('name'=>'keywords', 'content'=>$keywords));
        }
        if (!empty($this->_MetaGenerator)) {
            $this->outputMetaTag(array('name'=>'generator', 'content'=>$this->_MetaGenerator));
        }
        if (!empty($this->_MetaAuthor)) {
            $this->outputMetaTag(array('name'=>'author', 'content'=>$this->_MetaAuthor));
        }

        // css link
        foreach ($this->_CSSLink as $src=>$params){
            $this->outputCssLinkTag($src, $params);
        }

        foreach ($this->_CSSIELink as $src=>$params){
            // special params for conditions on IE versions
            if (!isset($params['_ieCondition']))
              $params['_ieCondition'] = 'IE' ;
            echo '<!--[if '.$params['_ieCondition'].' ]>';
            $this->outputCssLinkTag($src, $params);
            echo '<![endif]-->';
        }

        if($this->favicon != ''){
            $fav = htmlspecialchars($this->favicon);
            echo '<link rel="icon" type="image/x-icon" href="',$fav,'" ',$this->_endTag;
            echo '<link rel="shortcut icon" type="image/x-icon" href="',$fav,'" ',$this->_endTag;
        }
        
        // others links
        foreach($this->_Link as $href=>$params){
            $more = array();
            if( !empty($params[1]))
                $more[] = 'type="'.$params[1].'"';
            if (!empty($params[2]))
                $more[] = 'title = "'.htmlspecialchars($params[2]).'"';
            echo '<link rel="',$params[0],'" href="',htmlspecialchars($href),'" ',implode($more, ' '),$this->_endTag;
        }

        // js code
        if(count($this->_JSCodeBefore)){
            echo '<script type="text/javascript">
// <![CDATA[
 '.implode ("\n", $this->_JSCodeBefore).'
// ]]>
</script>';
        }

        // js link
        foreach ($this->_JSLink as $src=>$params){
            $this->outputJsScriptTag($src, $params);
        }

        foreach ($this->_JSIELink as $src=>$params){
            if (!isset($params['_ieCondition']))
                $params['_ieCondition'] = 'IE' ;
            echo '<!--[if '.$params['_ieCondition'].' ]>';
            $this->outputJsScriptTag($src, $params);
            echo '<![endif]-->';
        }

        // styles
        if(count($this->_Styles)){
            echo "<style type=\"text/css\">\n";
            foreach ($this->_Styles as $selector=>$value){
                if (strlen ($value)){
                    // there is a key/value
                    echo $selector.' {'.$value."}\n";
                }else{
                    // no value, it could be simply a command
                    //for example @import something, ...
                    echo $selector, "\n";
                }
            }
            echo "\n </style>\n";
        }
        // js code
        if(count($this->_JSCode)){
            echo '<script type="text/javascript">
// <![CDATA[
 '.implode ("\n", $this->_JSCode).'
// ]]>
</script>';
        }
        echo implode ("\n", $this->_headBottom), '</head>';
    }

    /**
     * used to erase some head properties
     * @param array $what list of one or many of this strings : 'CSSLink', 'CSSIELink', 'Styles', 'JSLink', 'JSIELink', 'JSCode', 'Others','MetaKeywords','MetaDescription'. If null, it cleans all values.
     */
    public function clearHtmlHeader ($what=null){
        $cleanable = array ('CSSLink', 'CSSIELink', 'Styles', 'JSLink','JSIELink', 'JSCode',
            'Others','MetaKeywords','MetaDescription', 'Meta', 'MetaAuthor', 'MetaGenerator');
        if($what==null)
            $what= $cleanable;
        foreach ($what as $elem){
            if (in_array ($elem, $cleanable)){
                $name = '_'.$elem;
                $this->$name = array ();
            }
        }
    }

    /**
     * change the type of html for the output
     * @param boolean $xhtml true if you want xhtml, false if you want html
     */
    public function setXhtmlOutput($xhtml = true){
        $this->_isXhtml = $xhtml;
        if($xhtml)
            $this->_endTag = "/>\n";
        else
            $this->_endTag = ">\n";
    }

    /**
     * return the end of a html tag : "/>" or ">", depending if it will generate xhtml or html
     * @return string
     */
    public function endTag(){ return $this->_endTag;}

}
