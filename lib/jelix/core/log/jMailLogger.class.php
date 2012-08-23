<?php
/**
* @package    jelix
* @subpackage core
* @author     Laurent Jouanneau
* @copyright  2006-2010 Laurent Jouanneau
* @link       http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * logger sending message by email
 */
class jMailLogger implements jILogger {

    /**
     *  @var array messages to send
     */
    protected $messages = array();

    /**
     * @param jILogMessage $message the message to log
     */
    function logMessage($message) {
        $this->messages[] = $message;
    }

    /**
     * @param jResponse $response
     */
    function output($response) {
        global $gJCoord, $gJConfig;
        if (!$gJCoord->request)
            return;

        $email = $gJConfig->mailLogger['email'];
        $headers = str_replace(array('\\r','\\n'),array("\r","\n"),$gJConfig->mailLogger['emailHeaders']);
        $message = '';
        foreach($this->messages as $msg) {
            $message.= "\n\n".$msg->getFormatedMessage();
        }

        error_log(wordwrap($message,70),1, $email, $headers);
    }
}
