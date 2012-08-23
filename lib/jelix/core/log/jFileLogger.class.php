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
 * logger storing message into a file
 */
class jFileLogger implements jILogger {
    /**
     * @param jILogMessage $message the message to log
     */
    function logMessage($message) {
        global $gJConfig, $gJCoord;
        if (!is_writable(jApp::logPath()))
            return;

        $type = $message->getCategory();
        if ($gJCoord && $gJCoord->request ) {
            $conf = & $gJConfig->fileLogger;
            if (!isset($conf[$type]))
                return;
            $f = $conf[$type];
            $ip = $gJCoord->request->getIP();

            $f = str_replace('%ip%', $ip , $f);
            $f = str_replace('%m%', date("m"), $f);
            $f = str_replace('%Y%', date("Y"), $f);
            $f = str_replace('%d%', date("d"), $f);
            $f = str_replace('%H%', date("H"), $f);
        }
        else {
            // if there isn't a request, so jLog is called for an error during the construction
            // of the coordinator
            $f = 'errors.log';
            $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1';
        }

        try {
            $sel = new jSelectorLog($f);
            $file = $sel->getPath();
            @error_log(date ("Y-m-d H:i:s")."\t".$ip."\t$type\t".$message->getFormatedMessage()."\n", 3, $file);
        }
        catch(Exception $e) {
            $file = jApp::logPath('errors.log');
            @error_log(date ("Y-m-d H:i:s")."\t".$ip."\terror\t".$e->getMessage()."\n", 3, $file);
        }
    }

    function output($response) {}

}
