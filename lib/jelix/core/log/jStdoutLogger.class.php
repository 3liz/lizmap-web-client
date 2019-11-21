<?php
/**
 * @package    jelix
 * @subpackage core_log
 * @author     Laurent Jouanneau
 * @copyright  2019 Laurent Jouanneau
 * @link       http://www.jelix.org
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

require_once(__DIR__.'/jStderrLogger.class.php');

/**
 * logger sending message to stdout
 */
class jStdoutLogger extends jStderrLogger
{
    protected $fileOutput = 'php://stdout';

    public function __construct() {
        $this->config = jApp::config()->stdoutLogger;
    }
}
