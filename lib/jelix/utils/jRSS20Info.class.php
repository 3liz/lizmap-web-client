<?php
/**
* @package     jelix
* @subpackage  feeds
* @author      Loic Mathaud
* @author      Yannick Le Guédart
* @contributor Laurent Jouanneau
* @contributor  Sebastien Romieu
* @contributor  Florian Lonqueu-Brochard
* @copyright   2005-2006 Loic Mathaud
* @copyright   2006 Yannick Le Guédart
* @copyright   2006-2010 Laurent Jouanneau
* @copyright   2010 Sébastien Romieu
* @copyright   2012 Florian Lonqueu-Brochard
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

require_once(JELIX_LIB_PATH.'utils/jXMLFeedInfo.class.php');

class jRSS20Info extends jXMLFeedInfo {
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
    
    /**
     * fill item with the given xml node
     * @param SimpleXMLElement node representing the channel
     */
    public function setFromXML(SimpleXMLElement $channel){
        
        $dt = new jDateTime();
        
        $this->copyright =(string)$channel->copyright;
        $this->description = (string)$channel->description;
        $this->generator = (string)$channel->generator;
        $this->image = (string)$channel->image->url;
        $this->title = (string)$channel->title;
        
        if((string)$channel->lastBuildDate != ''){
            $dt->setFromString((string)$channel->lastBuildDate, jDateTime::RFC2822_FORMAT);
            $this->updated = $dt->toString(jDateTime::DB_DTFORMAT);
        }
                
        if((string)$channel->pubDate != ''){
            $dt->setFromString((string)$channel->pubDate, jDateTime::RFC2822_FORMAT);
            $this->published = $dt->toString(jDateTime::DB_DTFORMAT);
        }

        $this->webSiteUrl = (string)$channel->link;
        $this->docs = (string)$channel->docs;
        $this->imageHeight = (string)$channel->image->height;
        $this->imageLink = (string)$channel->image->link;
        $this->imageTitle = (string)$channel->image->title;
        $this->imageWidth = (string)$channel->image->width;
        $this->imageDescription = (string)$channel->image->description;
        $this->language = (string)$channel->language;
        $this->managingEditor = (string)$channel->managingEditor;
        $this->rating = (string)$channel->rating;
        
        $categories = $channel->category;
        foreach ($categories as $cat) {
            $this->categories[] = (string)$cat;
        }
        
        $skipDays = $channel->skipDays;	
        foreach ($skipDays->day as $day) {
            $this->skipDays[] = (string)$day;
        }
        
        $skipHours = $channel->skipHours;	
        foreach ($skipHours->hour as $hour) {
            $this->skipHours[] = (string)$hour;
        }

        $this->textInput['title'] = (string)$channel->textInput->title;
        $this->textInput['description'] = (string)$channel->textInput->description;
        $this->textInput['name'] = (string)$channel->textInput->name;
        $this->textInput['link'] = (string)$channel->textInput->link;

        $this->ttl = (string)$channel->ttl;
        $this->webMaster = (string)$channel->webMaster;
    }
}