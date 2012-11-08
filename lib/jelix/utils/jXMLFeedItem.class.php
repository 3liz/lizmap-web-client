<?php
/**
* @package    jelix
* @subpackage utils
* @author     Yannick Le Guédart
* @contributor Laurent Jouanneau
* @copyright  2006 Yannick Le Guédart
* @copyright  2006-2009 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
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
    
    
    /**
     * fill item with the given xml node
     */
    public abstract function  setFromXML(SimpleXMLElement $xml_element);
}