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
 * logger storing message into syslog
 */
class jSyslogLogger implements jILogger {
    /**
     * @param jILogMessage $message the message to log
     */
    function logMessage($message) {
        $type = $message->getCategory();

        global $gJCoord;
        if ($gJCoord->request)
            $ip = $gJCoord->request->getIP();
        else
            $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1';

        error_log(date ("Y-m-d H:i:s")."\t".$ip."\t$type\t".$message->getFormatedMessage(), 0);
    }

    function output($response) {}

}
