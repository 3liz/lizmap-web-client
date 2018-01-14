<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Laurent Jouanneau
* @contributor Julien Issler
* @copyright   2005-2010 Laurent Jouanneau
* @copyright   2017 Julien Issler
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

        if($this->_outputOnlyHeaders){
            $this->sendHttpHeaders();
            return true;
        }

        $this->addHttpHeader('Content-Type','text/plain;charset='.jApp::config()->charset,false);
        $this->sendHttpHeaders();
        echo $this->content;
        return true;
    }

    /**
     * output errors
     */
    public function outputErrors(){
        header("HTTP/1.0 500 Internal Jelix Error");
        header('Content-Type: text/plain;charset='.jApp::config()->charset);
        echo jApp::coord()->getGenericErrorMessage();
    }
}
