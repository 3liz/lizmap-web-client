<?php
/**
* @package    jelix
* @subpackage core_response
* @author     Yannick Le Guédart
* @contributor Laurent Jouanneau
* @copyright  2006 Yannick Le Guédart
* @copyright  2006-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * Responses for Syndication  should inherits from jResponseXMLFeed
 * @package    jelix
 * @subpackage core_response
 * @since 1.0b1
 */
abstract class jResponseXMLFeed extends jResponse {

    /**
    * charset used in the channel
    * @var string
    */
    public $charset;

    /**
    * Language used in the channel
    * @var string
    */
    public $lang;

    /**
    * informations about the channel
    * @var jXMLFeedInfo
    */
    public $infos = null;

    /**
    * array of channel item
    */
    public $itemList = array ();

    /**
    * Template engine used for output
    * @var jtpl
    */
    protected $_template = null;

    /**
     * template name
     * @var string
     */
    protected $_mainTpl = '';

    /**
    * Array containing the XSL stylesheets links
    */
    protected $_xsl = array ();

    /**
     * Class constructor
     */
    function __construct (){

        $this->charset  = jApp::config()->charset;
        $this->lang     = jLocale::getCurrentLang();

        parent::__construct ();
    }

    /**
     * create a new item
     * @param string $title the item title
     * @param string $link  the link
     * @param string $date  the date of the item
     * @return jXMLFeedItem
     */
    abstract public function createItem($title,$link, $date);

    /**
     * register an item in the channel
     * @param jXMLFeedItem $item
     */
    public function addItem ($item){
        $this->itemList[] = $item;
    }


    public function addOptionals($content) {
        if (is_array($content)) {
            $this->_optionals = $content;
        }
    }

    public function addXSLStyleSheet($src, $params=array ()) {
        if (!isset($this->_xsl[$src])){
            $this->_xsl[$src] = $params;
        }
    }

    protected function _outputXmlHeader() {
        // XSL stylesheet
        foreach ($this->_xsl as $src => $params) {
            //the extra params we may found in there.
            $more = '';
            foreach ($params as $param_name => $param_value) {
                $more .= $param_name.'="'. htmlspecialchars($param_value).'" ';
            }
            echo ' <?xml-stylesheet type="text/xsl" href="', $src,'" ', $more,' ?>';
        }
    }

    protected function _outputOptionals() {
        if (is_array($this->_optionals)) {
            foreach ($this->_optionals as $name => $value) {
                echo '<'. $name .'>'. $value .'</'. $name .'>', "\n";
            }
        }
    }


}
