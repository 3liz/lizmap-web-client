<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Laurent Jouanneau
* @copyright   2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
*
*/
require_once(__DIR__.'/jResponseHtml.class.php');

/**
 * Response class for HTML 4 or XHTML 1.x
 */
class jResponseHtml4 extends jResponseHtml {

    protected $_isXhtml = true; // default behavior of the old jResponseHtml in jelix 1.4 and lower

    /**
     * says if the document uses a Strict or Transitional Doctype
     * @var boolean
     */
    protected $_strictDoctype = true;

    protected function outputDoctype (){
        $lang = str_replace('_', '-', $this->_lang);
        if($this->_isXhtml){
            echo '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 '.($this->_strictDoctype?'Strict':'Transitional').'//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-'.($this->_strictDoctype?'strict':'transitional').'.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="',$lang,'" lang="',$lang,'">
';
        }else{
            echo '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01'.($this->_strictDoctype?'':' Transitional').'//EN" "http://www.w3.org/TR/html4/'.($this->_strictDoctype?'strict':'loose').'.dtd">', "\n";
            echo '<html lang="',$lang,'">';
        }
    }
 
    /**
     * activate / deactivate the strict Doctype (activated by default)
     * @param boolean $val true for strict, false for transitional
     * @since 1.1.3
     */
    public function strictDoctype($val = true){
        $this->_strictDoctype = $val;
    }
}