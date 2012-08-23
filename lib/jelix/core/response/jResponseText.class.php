<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Laurent Jouanneau
* @copyright   2005-2010 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* plain Text response
* @package  jelix
* @subpackage core_response
*/
class jResponseText extends jResponse {
    /**
    * @var string
    */
    protected $_type = 'text';

    /**
     * text content
     * @var string
     */
    public $content = '';

    /**
     * output the content with the text/plain mime type
     * @return boolean    true si it's ok
     */
    public function output(){
        global $gJConfig;
        $this->addHttpHeader('Content-Type','text/plain;charset='.$gJConfig->charset,false);
        $this->_httpHeaders['Content-length']=strlen($this->content);
        $this->sendHttpHeaders();
        echo $this->content;
        return true;
    }

    /**
     * output errors
     */
    public function outputErrors(){
        global $gJConfig;
        header("HTTP/1.0 500 Internal Jelix Error");
        header('Content-Type: text/plain;charset='.$gJConfig->charset);
        echo $GLOBALS['gJCoord']->getGenericErrorMessage();
    }
}
