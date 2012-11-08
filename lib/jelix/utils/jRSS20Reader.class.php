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

require_once(JELIX_LIB_PATH.'utils/jXMLFeedReader.class.php');
require_once(JELIX_LIB_PATH.'utils/jRSS20Info.class.php');
require_once(JELIX_LIB_PATH.'utils/jRSS20Item.class.php');

class jRSS20Reader extends jXMLFeedReader{
    

    protected function analyzeInfo() {
        $this->infos = new jRSS20Info();
        $this->infos->setFromXML($this->xml->channel);
    }
    

    protected function analyzeItems() {
        $this->items = array();
        
        foreach($this->xml->channel->item as $i) {
            $item = new jRSS20Item();
            $item->setFromXML($i);
            array_push($this->items, $item);
        }
    }
    
}