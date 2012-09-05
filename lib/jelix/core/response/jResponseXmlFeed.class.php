<?php
/**
* @package    jelix
* @subpackage core_response
* @author     Yannick Le Guédart
* @contributor Laurent Jouanneau
* @copyright  2006 Yannick Le Guédart
* @copyright  2006-2009 Laurent Jouanneau
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
    private $_template = null;

    /**
     * template name
     * @var string
     */
    private $_mainTpl = '';

    /**
    * Array containing the XSL stylesheets links
    */
    private $_xsl = array ();

    /**
     * Class constructor
     */
    function __construct (){
        global $gJConfig;

        $this->charset  = $gJConfig->charset;
        list($lang,$country ) = explode('_', $gJConfig->locale);
        $this->lang       = $lang;

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

/**
 * meta data of the channel
 * @package    jelix
 * @subpackage core_response
 * @since 1.0b1
 */
abstract class jXMLFeedInfo {
    /**
     * title of the channel (only text, no html)
     * @var string
     */
    public $title;
    /**
     * url of the web site
     * @var string
     */
    public $webSiteUrl;
    /**
     * copyright
     * @var string
     */
    public $copyright;
    /**
     * list of category names
     * @var array
     */
    public $categories=array();
    /**
     * the name of the generator
     * @var string
     */
    public $generator='Jelix php framework http://jelix.org';
    /**
     * url of the image channel
     * @var string
     */
    public $image;
    /**
     * description of the channel. could be pure text or html
     * @var string
     */
    public $description;
    /**
     * says the type of description : text or html (or xhtml for atom)
     * Values : 'text','html','xhtml'
     * @var string
     */
    public $descriptionType='text';
    /**
     * date of the last update of the channel
     * format : yyyy-mm-dd hh:mm:ss
     * @var string
     */
    public $updated;


    protected $_mandatory = array ();
}

/**
 * content of an item in a syndication channel
 * @package    jelix
 * @subpackage core_response
 * @since 1.0b1
 */
abstract class jXMLFeedItem {
    /**
     * identifiant of the item (its url for example)
     * @var string
     */
    public $id;
    /**
     * title
     * @var string
     */
    public $title;
    /**
     * url of the item
     * @var string
     */
    public $link;
    /**
     * publication date of the item
     * format : yyyy-mm-dd hh:mm:ss
     * @var string
     */
    public $published;
    /**
     * author name
     * @var string
     */
    public $authorName;
    /**
     * author email
     * @var string
     */
    public $authorEmail;
    /**
     * list of category names
     * @var array
     */
    public $categories=array();
    /**
     * content of the item.  could be pure text or html
     * @var string
     */
    public $content;
    /**
     * says the type of content : text or html (or xhtml for atom)
     * Values : 'text','html','xhtml'
     * @var string
     */
    public $contentType='text';
    /**
     *
     * @var string
     */
    protected $_mandatory = array ();
}

