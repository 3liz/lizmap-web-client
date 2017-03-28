<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Loic Mathaud
* @contributor Laurent Jouanneau
* @contributor Sylvain de Vathaire
* @contributor Thomas Pellissier Tanon
* @copyright   2005-2006 loic Mathaud
* @copyright   2007-2010 Laurent Jouanneau
* @copyright   2008 Sylvain de Vathaire
* @copyright   2011 Thomas Pellissier Tanon
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
*
*/
require_once(JELIX_LIB_PATH.'tpl/jTpl.class.php');

/**
* XML response generator
* @package  jelix
* @subpackage core_response
*/
class jResponseXml extends jResponse {
    /**
    * Id of the response
    * @var string
    */
    protected $_type = 'xml';

    /**
     * the template container
     * @var jTpl
     */
    public $content = null;

    /**
     * selector of the template file
     * @var string
     */
    public $contentTpl = '';

    /**
     * if true, verify validity of the xml content, before to output it
     * @var boolean
     */
    public $checkValidity = false;

    /**
     * The charset
     * @var string
     */
    protected $_charset;

    private $_css = array();
    private $_xsl = array();

    /** 
     * say if the XML header have to be generated
     * Usefull if the XML string to output already contain the XML header
     * @var boolean
     * @since 1.0.3
     */
    public $sendXMLHeader = TRUE;

    /**
    * constructor..
    */
    function __construct (){
        $this->_charset = jApp::config()->charset;
        $this->content = new jTpl();
        parent::__construct();
    }

    /**
     * generate the xml content and send it to the browser
     * @return bool true if ok
     * @throws jException
     */
    final public function output(){
        
        if($this->_outputOnlyHeaders){
            $this->sendHttpHeaders();
            return true;
        }
        
        if(!array_key_exists('Content-Type', $this->_httpHeaders)) {
            $this->_httpHeaders['Content-Type']='text/xml;charset='.$this->_charset;
        }

        if(is_string($this->content)) {
            // utilisation chaine de caractères xml
            $xml_string = $this->content;
        }else if (!empty($this->contentTpl)) {
            // utilisation d'un template
            $xml_string = $this->content->fetch($this->contentTpl);
        }else{
            throw new jException('jelix~errors.repxml.no.content');
        }

        if ($this->checkValidity) {
            if (!simplexml_load_string($xml_string)) {
                // xml mal-formed
                throw new jException('jelix~errors.repxml.invalid.content');
            }
        }

        $this->sendHttpHeaders();
        if($this->sendXMLHeader){
            echo '<?xml version="1.0" encoding="'. $this->_charset .'"?>', "\n";
            $this->outputXmlHeader();
        }
        echo $xml_string;

        return true;
    }

    /**
     * output errors if any
     */
    final public function outputErrors() {
        header("HTTP/1.0 500 Internal Jelix Error");
        header('Content-Type: text/plain;charset='.jApp::config()->charset);
        echo jApp::coord()->getGenericErrorMessage();
    }

    /**
     * to add a link to css stylesheet
     * @since 1.0b1
     */
    public function addCSSStyleSheet($src, $params = array()) {
        if (!isset($this->_css[$src])) {
            $this->_css[$src] = $params;
        }
    }

    /**
     * to add a link to an xsl stylesheet
     * @since 1.0b1
     */
    public function addXSLStyleSheet($src, $params = array()) {
        if (!isset($this->_xsl[$src])) {
            $this->_xsl[$src] = $params;
        }
    }

    /**
     * output all processing instructions (stylesheet, xsl..) before the XML content
     */
    protected function outputXmlHeader() {
        // XSL stylesheet
        foreach ($this->_xsl as $src => $params) {
            //the extra params we may found in there.
            $more = '';
            foreach ($params as $param_name => $param_value) {
                $more .= $param_name.'="'. htmlspecialchars($param_value).'" ';
            }
            echo ' <?xml-stylesheet type="text/xsl" href="', $src,'" ', $more,' ?>';
        }

        // CSS stylesheet
        foreach ($this->_css as $src => $params) {
            //the extra params we may found in there.
            $more = '';
            foreach ($params as $param_name => $param_value) {
                $more .= $param_name.'="'. htmlspecialchars($param_value).'" ';
            }
            echo ' <?xml-stylesheet type="text/css" href="', $src,'" ', $more,' ?>';
        }
    }
}
