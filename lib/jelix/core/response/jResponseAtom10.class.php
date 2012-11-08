<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Yannick Le Guédart
* @contributor Laurent Jouanneau
* @copyright   2006 Yannick Le Guédart
* @copyright   2006-2010 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

require_once(JELIX_LIB_PATH.'tpl/jTpl.class.php');
require_once(JELIX_LIB_CORE_PATH.'response/jResponseXmlFeed.class.php');
require_once(JELIX_LIB_PATH.'utils/jAtom10Info.class.php');
require_once(JELIX_LIB_PATH.'utils/jAtom10Item.class.php');

/**
* Atom 1.0 response
*
* Known limitations : only text in the title, and only name in categories
* @package  jelix
* @subpackage core_response
* @link http://tools.ietf.org/html/rfc4287
* @since 1.0b1
*/
class jResponseAtom10 extends jResponseXMLFeed {

    protected $_type = 'atom1.0';

    /**
     * Class constructor
     *
     * @return void
     */
    function __construct (){
        $this->_template 	= new jTpl();
        $this->_mainTpl 	= 'jelix~atom10';

        $this->infos = new jAtom10Info ();

        parent::__construct ();
    }

    /**
     * Generate the content and send it
     * Errors are managed
     * @return boolean true if generation is ok, else false
     */
    final public function output (){

        if($this->_outputOnlyHeaders){
            $this->sendHttpHeaders();
            return true;
        }
    
        $this->_httpHeaders['Content-Type'] =
                'application/atom+xml;charset=' . $this->charset;

        if(!$this->infos->updated){
            $this->infos->updated = date("Y-m-d H:i:s");
        }

        // generate the main content, in a buffer
        // so we can handle errors
        $this->_template->assign ('atom', $this->infos);
        $this->_template->assign ('items', $this->itemList);
        $this->_template->assign ('lang',$this->lang);
        $content = $this->_template->fetch ($this->_mainTpl);

        $this->sendHttpHeaders();
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
        $item = new jAtom10Item();
        $item->title = $title;
        $item->id = $item->link = $link;
        $item->published = $date;
        return $item;
    }

}