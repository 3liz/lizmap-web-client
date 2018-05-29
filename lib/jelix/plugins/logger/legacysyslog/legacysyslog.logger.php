<?php
/**
* @package    jelix
* @subpackage logger_plugin
* @author     Laurent Jouanneau
* @copyright  2006-2016 Laurent Jouanneau
* @link       http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * logger storing message into syslog using old api
 */
class legacysyslogLogger implements jILogger {
    /**
     * @param jILogMessage $message the message to log
     */
    function logMessage($message) {
        $type = $message->getCategory();
        if (jApp::coord()->request)
            $ip = jApp::coord()->request->getIP();
        else
            $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1';
        error_log(date ("Y-m-d H:i:s")."\t".$ip."\t$type\t".$message->getFormatedMessage(), 0);
    }
    function output($response) {}
}
