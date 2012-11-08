<?php
/**
* @package    jelix
* @subpackage core
* @author     Laurent Jouanneau
* @copyright  2006-2012 Laurent Jouanneau
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

        if (!is_writable(jApp::logPath()))
            return;

        $type = $message->getCategory();
        $appConf = jApp::config();
        
        if ($appConf) {
            $conf = & jApp::config()->fileLogger;
            if (!isset($conf[$type]))
                return;
            $f = $conf[$type];
            $f = str_replace('%m%', date("m"), $f);
            $f = str_replace('%Y%', date("Y"), $f);
            $f = str_replace('%d%', date("d"), $f);
            $f = str_replace('%H%', date("H"), $f);
        }
        else {
            $f = 'errors.log';
        }

        $coord = jApp::coord();
        if ($coord && $coord->request ) {
            $ip = $coord->request->getIP();
        }
        else {
            $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1';
        }
        $f = str_replace('%ip%', $ip , $f);

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
