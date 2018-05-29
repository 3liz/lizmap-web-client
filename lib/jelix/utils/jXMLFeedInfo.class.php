<?php
/**
* @package    jelix
* @subpackage feeds
* @author     Yannick Le Guédart
* @contributor Laurent Jouanneau
* @copyright  2006 Yannick Le Guédart
* @copyright  2006-2009 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
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
    
    /**
     * fill info with the given xml node
     */
    public abstract function setFromXML(SimpleXMLElement $xml_element);
}