<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Christophe Thiriot
* @contributor Laurent Jouanneau
* @copyright   2008 Christophe Thiriot, 2008-2010 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* Command line response
* @package  jelix
* @subpackage core_response
*/
class jResponseCmdline extends jResponse {
    /**
     * Code used by exit function in the end of the process if no error occured 
     */
    const EXIT_CODE_OK = 0;

    /**
     * Code used by exit function in the end of the process if an error occured 
     */
    const EXIT_CODE_ERROR = 1;

    /**
    * @var string
    */
    protected $_type = 'cmdline';

    /**
     * @var string
     */
    protected $_buffer = '';

    /**
     * @var int
     */
    protected $_exit_code = self::EXIT_CODE_OK;

    /**
     * output the content with the text/plain mime type
     * @return boolean   
     */
    public function output(){
        $this->flushContent();
        return true;
    }

    /**
     * Send the specified content to the standard output.
     * The content can be bufferized and displayed only when you call flushContent
     * or do a non-bufferized addContent
     * 
     * @param string $content 
     * @param bool   $bufferize 
     * @return void
     */
    public function addContent($content, $bufferize=false){
        if ($bufferize){
            $this->_buffer.= $content;
        } else {
            $this->flushContent();
            echo $content;
        }
    }

    /**
     * Send the bufferized content to the standard output  
     * 
     * @return void
     */
    public function flushContent(){
        echo $this->_buffer;
        $this->_buffer = '';
    }

    /**
     * Get the exit code of the command line response
     * 
     * @return int 
     */
    public function getExitCode(){
        return $this->_exit_code;
    }

    /**
     * Set the exit code of the command line 
     * 
     * @param mixed $code The code that will be passed to the exit() function
     * @return void
     */
    public function setExitCode($code){
        $this->_exit_code = $code;
    }

    /**
     * output errors
     */
    public function outputErrors(){
        $this->flushContent();
        foreach(jApp::coord()->allErrorMessages as $msg)
            fwrite(STDERR, $msg->getFormatedMessage()."\n");
        $this->setExitCode(self::EXIT_CODE_ERROR);
    }

    /**
     * No Http Header here 
     */
    protected function sendHttpHeaders(){}
}
