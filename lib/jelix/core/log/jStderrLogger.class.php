<?php
/**
 * @package    jelix
 * @subpackage core_log
 * @author     Laurent Jouanneau
 * @copyright  2019 Laurent Jouanneau
 * @link       http://www.jelix.org
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * logger sending message to stderr
 */
class jStderrLogger implements jILogger {

    protected $config;

    protected $fileOutput = 'php://stderr';

    public function __construct() {
        $this->config = jApp::config()->stderrLogger;
    }


    /**
     * @param jILogMessage $message the message to log
     */
    function logMessage($message) {

        $type = $message->getCategory();

        if (isset($this->config[$type])) {
            $f = $this->config[$type];
            $f = str_replace('%D%', date("Y-m-d"), $f);
            $f = str_replace('%T%', date("H:i:s"), $f);
            $f = str_replace('%type%', $type, $f);

            if (strpos($f, '%ip%') !== false) {
                $coord = jApp::coord();
                if ($coord && $coord->request ) {
                    $ip = $coord->request->getIP();
                }
                else {
                    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1';
                }
                $f = str_replace('%ip%', $ip , $f);
            }

            if (strpos($f, '%msg%') !== false) {
                $f = str_replace('%msg%', $message->getFormatedMessage(), $f);
            }
            else {
                $f .= ' '.$message->getFormatedMessage();
            }
        }
        else {
            $f = $type.' - '.$message->getFormatedMessage();
        }

        @error_log( $f."\n", 3, $this->fileOutput);
    }

    function output($response) {}

}
