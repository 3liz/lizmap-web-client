<?php
/**
* @package     jelix
* @subpackage  utils
* @author      Yannick Le Guédart
* @contributor Laurent Jouanneau
* @contributor  Sebastien Romieu
* @contributor  Florian Lonqueu-Brochard
* @copyright   2006 Yannick Le Guédart
* @copyright   2006-2010 Laurent Jouanneau
* @copyright   2010 Sébastien Romieu
* @copyright   2012 Florian Lonqueu-Brochard
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

require_once(JELIX_LIB_PATH.'utils/jXMLFeedInfo.class.php');

class jAtom10Info extends jXMLFeedInfo {
    /**
     * unique id of the channel
     * @var string
     */
    public $id;
    /**
     * channel url
     * @var string
     */
    public $selfLink;
    /**
     * author's list
     * each author is an array('name'=>'','email'=>'','uri'=>'')
     * @var array
     */
    public $authors = array();
    /**
     * related links to the channel
     * each link is an array with this keys : href rel type hreflang title length
     * @var array
     */
    public $otherLinks = array();
    /**
     * list of contributors
     * each contributor is an array('name'=>'','email'=>'','uri'=>'')
     * @var array
     */
    public $contributors= array();
    /**
     * icon url
     * @var string
     */
    public $icon;

    /**
     * version of the generator
     * @var string
     * @see $generator
     */
    public $generatorVersion;
    /**
     * url of the generator
     * @var string
     * @see $generator
     */
    public $generatorUrl;

    function __construct ()
    {
        $this->_mandatory = array ('title', 'id', 'updated');
    }
    
    /**
     * fill item with the given xml node
     */
    public function setFromXML(SimpleXMLElement $feed){
        
        $dt = new jDateTime();
        
        foreach ($feed->category as $cat) {
            if($cat['term'] != null)
                $this->categories[] = (string)$cat['term'];
        }
        
        $this->description = (string)$feed->subtitle;
        if($feed->subtitle['type'])
            $this->descriptionType = (string)$feed->subtitle['type'];
        $this->generator = (string)$feed->generator;
        $this->image = (string)$feed->logo; //or maybe $feed->icon
        $this->title = (string)$feed->title;
        $this->copyright = (string)$feed->rights;
        
        if((string)$feed->updated != ''){
            $dt->setFromString((string)$feed->updated, jDateTime::ISO8601_FORMAT);
            $this->updated = $dt->toString(jDateTime::DB_DTFORMAT);
        }
        
       $attrs_links = array('href', 'rel', 'type', 'hreflang', 'title', 'length');
        foreach($feed->link as $l){
                if(($l['rel'] == 'alternate' || $l['rel'] == null)&& $l['href'] != null)
                    $this->webSiteUrl = (string)$l['href'];
                else if($l['rel'] == 'self' && $l['href'] != null)
                    $this->selfLink = (string)$l['href'];
                else{
                    $link = array();
                    foreach($attrs_links as $a){
                        if($l[$a] != null)
                            $link[$a] = (string)$l[$a];
                    }
                    $this->otherLinks[] = $link;
                }
        }
        
        foreach ($feed->author as $author) {
            $this->authors[] = array('name' => (string)$author->name, 'email' =>(string)$author->email, 'uri' => (string)$author->uri) ;
        }

        foreach ($feed->contributor as $contrib) {
            $this->contributors[] = array('name' => (string)$contrib->name, 'email' =>(string)$contrib->email, 'uri' => (string)$contrib->uri) ;
        }

        $this->generatorUrl = (string)$feed->generator['url'];
        $this->generatorVersion = (string)$feed->generator['version'];
        $this->icon = (string)$feed->icon;
        $this->id = (string)$feed->id;
        
    }    
}