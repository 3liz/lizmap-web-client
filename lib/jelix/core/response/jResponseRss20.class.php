<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Loic Mathaud
* @author      Yannick Le Guédart
* @contributor Laurent Jouanneau
* @copyright   2005-2006 Loic Mathaud
* @copyright   2006 Yannick Le Guédart
* @copyright   2006-2010 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
*
*/
require_once(JELIX_LIB_PATH.'tpl/jTpl.class.php');
require_once(JELIX_LIB_CORE_PATH.'response/jResponseXmlFeed.class.php');

/**
* Rss2.0 response
* @package  jelix
* @subpackage core_response
* @link http://blogs.law.harvard.edu/tech/rss
* @link http://www.stervinou.com/projets/rss/
* @since 1.0b1
*/
class jResponseRss20 extends jResponseXMLFeed {
    protected $_type = 'rss2.0';

    /**
     * Class constructor
     */
    function __construct () {
        $this->_template 	= new jTpl();
        $this->_mainTpl 	= 'jelix~rss20';

        $this->infos = new jRSS20Info ();

        parent::__construct ();
        $this->infos->language = $this->lang;
    }

    /**
     * Generate the content and send it.
     * @return boolean true if generation is ok, else false
     */
    final public function output (){

        $this->_httpHeaders['Content-Type'] =
                'application/xml;charset=' . $this->charset;

        // let's generate the content
        $this->_template->assign ('rss', $this->infos);
        $this->_template->assign ('items', $this->itemList);
        $content = $this->_template->fetch ($this->_mainTpl);

        // no errors, we can send it
        $this->sendHttpHeaders ();
        echo '<?xml version="1.0" encoding="'. $this->charset .'"?>', "\n";
        $this->_outputXmlHeader ();
        echo $content;
        return true;
    }

    /**
     * create a new item
     * @param string $title the item title
     * @param string $link  the link
     * @param string $date  the date of the item
     * @return jXMLFeedItem
     */
    public function createItem($title,$link, $date){
        $item = new jRSSItem();
        $item->title = $title;
        $item->id = $item->link = $link;
        $item->published = $date;
        return $item;
    }
}

/**
 * meta data of the channel
 * @package    jelix
 * @subpackage core_response
 * @since 1.0b1
 */
class jRSS20Info extends jXMLFeedInfo{
    /**
     * lang of the channel
     * @var string
     */
    public $language;
    /**
     * email of the content manager
     * @var string
     */
    public $managingEditor;
    /**
     * email of technical responsible
     * @var string
     */
    public $webMaster;
    /**
     * publication date
     * format:  yyyy-mm-dd hh:mm:ss
     * @var string
     */
    public $published;
    /**
     * specification url
     * example : http://blogs.law.harvard.edu/tech/rss
     * @var string
     */
    public $docs='';
    /**
     * not implemented
     * @var string
     */
    public $cloud; // indicates a webservice from which the user can register to the server
                  // to be aware of modifications
                  //=array('domain'=>'','path'=>'','port'=>'','registerProcedure'=>'', 'protocol'=>'');
    /**
     * time to live of the cache, in minutes
     * @var string
     */
    public $ttl;
    /**
     * image title
     * @var string
     */
    public $imageTitle;
    /**
     * web site url corresponding to the image
     * @var string
     */
    public $imageLink;
    /**
     * width of the image
     * @var string
     */
    public $imageWidth;
    /**
     * height of the image
     * @var string
     */
    public $imageHeight;
    /**
     * Description of the image (= title attribute for the img tag)
     * @var string
     */
    public $imageDescription;

    /**
     * Pics rate for this channel
     * @var string
     */
    public $rating;
    /**
     * field form for the channel
     * it is an array('title'=>'','description'=>'','name'=>'','link'=>'')
     * @var array
     */
    public $textInput;
    /**
     * list of hours that agregator should ignore
     * ex (10, 21)
     * @var array
     */
    public $skipHours;
    /**
     * list of day that agregator should ignore
     * ex ('monday', 'tuesday')
     * @var array
     */
    public $skipDays;

    function __construct () {
            $this->_mandatory = array ( 'title', 'webSiteUrl', 'description');
    }
}

/**
 * content of an item in a syndication channel
 * @package    jelix
 * @subpackage core_response
 * @since 1.0b1
 */
class jRSSItem extends jXMLFeedItem {

    /**
     * comments url
     * @var string
     */
    public $comments;
    /**
     * media description, attached to the item
     * the array should contain this keys :  'url', 'size', 'mimetype'
     * @var array
     */
    public $enclosure;
    /**
     * says if the id is a permanent link
     * @var boolean
     */
    public $idIsPermalink;
    /**
     * url of  rss channel of the information source
     * @var string
     */
    public $sourceUrl;
    /**
     * Title of the information source
     * @var string
     */
    public $sourceTitle;
}
