<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Nicolas Jeudy
* @contributor Laurent Jouanneau
* @copyright   2006 Nicolas Jeudy
* @copyright   2007-2010 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * Send CSS content
 * @package  jelix
 * @subpackage core_response
 * @since 1.0b1
 */
class jResponseCss extends jResponse {

    /**
    * @var string
    */
    protected $_type = 'css';

    /**
     * CSS content
     * @var string
     */
    public $content = '';

    /**
     * send the css content
     * @return boolean    true if it's ok
     */
    public function output(){
        global $gJConfig;
        $this->_httpHeaders['Content-Type']='text/css;charset='.$gJConfig->charset;
        $this->_httpHeaders['Content-length']=strlen($this->content);
        $this->sendHttpHeaders();
        echo $this->content;
        return true;
    }
}
