<?php
/**
* @package     jelix
* @subpackage  utils
* @author      Sebastien Romieu
* @author   Florian Lonqueu-Brochard
* @copyright   2010 Sébastien Romieu
* @copyright   2012 Florian Lonqueu-Brochard
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

abstract class jXMLFeedReader {

    /**
    * @var jRSS20Info|jAtom10Info
    */
    protected $infos;
    
    /**
    * @var jRSS20Item[]|jAtom10Item[]
    */
    protected $items;
    
    /**
    * content an url
    * @var SimpleXMLElement
    */
    protected $xml;


    private $_items_analyzed = false;
    private $_infos_analyzed = false;

    /**
     * read an flux with an url parameter
     * @param string $url
     * @throws jException
     */
    public function __construct($url){

        try{
            $stream = jHttp::quickGet($url);
        } catch(Exception $e){
            throw new jException('jelix~errors.xml.remote.feed.error');
        }
        
        if(!$stream){
            throw new jException('jelix~errors.xml.remote.feed.error');
        }

        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($stream);
                    
        if($xml === false){
            $errors = '';
            foreach(libxml_get_errors() as $error) {
                $errors .= $error->message."; ";
            }
            throw new jException('jelix~errors.xml.loading.document.error', array($errors));
        }
        libxml_use_internal_errors();
        libxml_clear_errors();
        
        $this->xml = $xml;
    }

    /**
    * @return jRSS20Info|jAtom10Info
    */
    public function getInfos() {
        if(!$this->_infos_analyzed){
            $this->analyzeInfo();
            $this->_infos_analyzed = true;
        }
        return $this->infos;
    }

    /**
    * @return jXMLFeedItem[]
    */
    public function getItems() {
        if(!$this->_items_analyzed){
            $this->analyzeItems();
            $this->_items_analyzed = true;
        }
        $this->analyzeItems();
        return $this->items;
    }
    
    /**
     * return the SimpleXML structure corresponding to the feed
     * @return SimpleXMLElement
     */
    public function getXML(){
        return $this->xml;
    }
    
    /**
     * Clear the the SimpleXML structure corresponding to the feed (usefull for big feed)
     */
    public function clearXML(){
        $this->xml = null;
    }
    
    /**
    * Analyze infos of the feed
    */
    protected abstract function analyzeInfo();
    
    /**
    * Analyze items of the feed
    */
    protected abstract function analyzeItems();
    
    
}