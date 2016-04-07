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
 * logger storing message into syslog
 */
class jSyslogLogger implements jILogger {

    protected $catSyslog = array();

    public function __construct() {
        $this->catSyslog = array(
            'error'=> LOG_ERR,
            'warning'=> LOG_WARNING,
            'notice'=> LOG_NOTICE,
            'deprecated'=> LOG_NOTICE,
            'strict'=> LOG_NOTICE,
            'debug'=> LOG_DEBUG,
        );
        openlog('jelix - '.jApp::config()->domainName,
                LOG_ODELAY | LOG_PERROR,
                (jApp::config()->isWindows?LOG_USER:LOG_LOCAL0));
    }

    /**
     * @param jILogMessage $message the message to log
     */
    function logMessage($message) {
        $type = $message->getCategory();
        if (jApp::coord()->request) {
            $ip = jApp::coord()->request->getIP();
        }
        else {
            $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1';
        }

        if (isset($this->catSyslog[$type])) {
            $priority = $this->catSyslog[$type];
        }
        else {
            $priority = LOG_INFO;
        }
        syslog($priority, $ip."\t$type\t".$message->getFormatedMessage());
    }

    function output($response) {
    }

}


