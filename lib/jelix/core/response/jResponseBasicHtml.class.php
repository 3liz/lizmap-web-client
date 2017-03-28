<?php
/**
 * @package     jelix
 * @subpackage  core_response
 * @author      Laurent Jouanneau
 * @contributor Julien Issler, Brice Tence
 * @copyright   2010-2012 Laurent Jouanneau
 * @copyright   2011 Julien Issler, 2011 Brice Tence
 * @link        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */


/**
 * interface for plugins for jResponseBasicHtml or jResponseHtml, which allows
 * to make changes in the response at several step
 */
interface jIHTMLResponsePlugin {

    public function __construct(jResponse $c);

    /**
     * called just before the jResponseBasicHtml::doAfterActions() call
     */
    public function afterAction();

    /**
     * called just before the final output. This is the opportunity
     * to make changes before the head and body output. At this step
     * the main content (if any) is already generated.
     */
    public function beforeOutput();

    /**
     * called when the content is generated, and potentially sent, except
     * the body end tag and the html end tags. This method can output
     * directly some contents.
     */
    public function atBottom();

    /**
     * called just before the output of an error page
     */
    public function beforeOutputError();
}

/**
 * Basic HTML response. the HTML content should be provided by a simple php file.
 * @package  jelix
 * @subpackage core_response
 */
class jResponseBasicHtml extends jResponse {
    /**
    * jresponse id
    * @var string
    */
    protected $_type = 'html';

    /**
     * the charset of the document
     * @var string
     */
    protected $_charset;

    /**
     * the lang of the document
     * @var string
     */
    protected $_lang;

    /**
     * says if the document is in xhtml or html
     */
    protected $_isXhtml = false;

    /**
     * says if xhtml content type should be send or not.
     * it true, a verification of HTTP_ACCEPT is done.
     * @var boolean
     */
    public $xhtmlContentType = false;

    /**
     * top content for head
     */
    protected $_headTop  = array ();

    /**
     * bottom content for head
     */
    protected $_headBottom  = array ();

    /**#@+
     * content for the body
     * @var array
     */
    protected $_bodyTop = array();
    protected $_bodyBottom = array();
    /**#@-*/

    /**
     * full path of php file to output. it should content php instruction
     * to display these variables:
     * - $HEADTOP: content added just after the opening <head> tag
     * - $HEADBOTTOM: content before the closing </head> tag
     * - $BODYTOP: content just after the <body> tag, at the top of the page
     * - $BODYBOTTOM: content just before the </body> tag, at the bottom of the page
     * - $BASEPATH: base path of the application, for links of your style sheets etc..
     * @var string
     */
    public $htmlFile = '';

    /**
     * list of plugins
     * @var jIHTMLResponsePlugin[]
     * @since 1.3a1
     */
    protected $plugins = array();

    /**
    * constructor;
    * setup the charset, the lang
    */
    function __construct (){

        $this->_charset = jApp::config()->charset;
        $this->_lang = jApp::config()->locale;

        // load plugins
        $plugins = jApp::config()->jResponseHtml['plugins'];
        if ($plugins) {
            $plugins = preg_split('/ *, */', $plugins);
            foreach ($plugins as $name) {
                if (!$name)
                    continue;
                $plugin = jApp::loadPlugin($name, 'htmlresponse', '.htmlresponse.php', $name.'HTMLResponsePlugin', $this);
                if ($plugin)
                    $this->plugins[$name] = $plugin;
                // do nothing if the plugin does not exist, we could be already into the error handle
            }
        }

        parent::__construct();
    }

    /**
     * return the corresponding plugin
     * @param string $name the name of the plugin
     * @return jIHTMLResponsePlugin|null the plugin or null if it isn't loaded
     * @since 1.3a1
     */
    function getPlugin($name) {
        if (isset($this->plugins[$name]))
            return $this->plugins[$name];
        return null;
    }

    /**
     * add additional content into the document head
     * @param string $content
     * @param boolean $toTop true if you want to add it at the top of the head content, else false for the bottom
     * @since 1.0b1
     */
    final public function addHeadContent ($content, $toTop = false) {
        if ($toTop) {
            $this->_headTop[] = $content;
        }
        else {
            $this->_headBottom[] = $content;
        }
    }

    /**
     * add content to the body
     * you can add additionnal content, before or after the content of body
     * @param string $content additionnal html content
     * @param boolean $before true if you want to add it before the content, else false for after
     */
    function addContent($content, $before = false){
        if ($before) {
            $this->_bodyTop[]=$content;
        }
        else {
            $this->_bodyBottom[]=$content;
        }
    }

    /**
     *  set the content-type in the http headers
     */
    protected function setContentType() {
        if($this->_isXhtml && $this->xhtmlContentType && strstr($_SERVER['HTTP_ACCEPT'],'application/xhtml+xml')){
            $this->_httpHeaders['Content-Type']='application/xhtml+xml;charset='.$this->_charset;
        }else{
            $this->_httpHeaders['Content-Type']='text/html;charset='.$this->_charset;
        }
    }

    /**
     * output the html content
     * @return bool true if the generated content is ok
     * @throws Exception
     */
    public function output(){

        if($this->_outputOnlyHeaders){
            $this->sendHttpHeaders();
            return true;
        }
    
        foreach($this->plugins as $name=>$plugin)
            $plugin->afterAction();

        $this->doAfterActions();

        if ($this->htmlFile == '')
            throw new Exception('static page is missing');

        $this->setContentType();

        jLog::outputLog($this);

        foreach($this->plugins as $name=>$plugin)
            $plugin->beforeOutput();

        $HEADTOP = implode("\n", $this->_headTop);
        $HEADBOTTOM = implode("\n", $this->_headBottom);
        $BODYTOP = implode("\n", $this->_bodyTop);
        $BODYBOTTOM = implode("\n", $this->_bodyBottom);
        $BASEPATH = jApp::urlBasePath();

        ob_start();
        foreach($this->plugins as $name=>$plugin)
            $plugin->atBottom();
        $BODYBOTTOM .= ob_get_clean();

        $this->sendHttpHeaders();
        include($this->htmlFile);

        return true;
    }

    /**
     * The method you can overload in your inherited html response
     * overload it if you want to add processes (stylesheet, head settings, additionnal content etc..)
     * after any actions
     * @since 1.1
     */
    protected function doAfterActions(){

    }

    /**
     * output errors
     */
    public function outputErrors(){

        if (file_exists(jApp::appPath('responses/error.en_US.php')))
            $file = jApp::appPath('responses/error.en_US.php');
        else
            $file = JELIX_LIB_CORE_PATH.'response/error.en_US.php';
        // we erase already generated content
        $this->_headTop = array();
        $this->_headBottom = array();
        $this->_bodyBottom = array();
        $this->_bodyTop = array();

        jLog::outputLog($this);

        foreach($this->plugins as $name=>$plugin)
            $plugin->beforeOutputError();

        $HEADTOP = implode("\n", $this->_headTop);
        $HEADBOTTOM = implode("\n", $this->_headBottom);
        $BODYTOP = implode("\n", $this->_bodyTop);
        $BODYBOTTOM = implode("\n", $this->_bodyBottom);
        $BASEPATH = jApp::urlBasePath();

        header("HTTP/{$this->httpVersion} 500 Internal jelix error");
        header('Content-Type: text/html;charset='.$this->_charset);
        include($file);
    }

    /**
     * change the type of html for the output
     * @param boolean $xhtml true if you want xhtml, false if you want html
     */
    public function setXhtmlOutput($xhtml = true){
        $this->_isXhtml = $xhtml;
    }

    /**
     * says if the response will be xhtml or html
     * @return boolean true if it is xhtml
     */
    final public function isXhtml(){ return $this->_isXhtml; }

}
