<?php
/**
 * @package    jelix
 * @subpackage logger
 * @author     Laurent Jouanneau
 * @copyright  2017 Laurent Jouanneau
 * @link       http://www.jelix.org
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * logger storing soap message into several xml files
 */
class soapfileLogger implements jILogger {

    /**
     * @param jILogMessage $message the message to log
     */
    function logMessage($message) {

        if (!is_writable(jApp::logPath()))
            return;

        $type = $message->getCategory();
        if ($type != 'soap') {
            return;
        }
        $appConf = jApp::config();

        if ($appConf && isset($appConf->soapfileLoggerMethods)) {
            $conf = &$appConf->soapfileLoggerMethods;
            if (isset($conf[$message->getFunctionName()]) &&
                !$conf[$message->getFunctionName()]
            ){
                return;
            }
        }

        $date = new DateTime();
        $f = 'soap/'.$date->format('Ym').'/'.$date->format('dH').'/'.
            $date->format('His').'_'.$message->getFunctionName().'_';

        try {
            $sel = new jSelectorLog($f.'headers.log');
            $file = $sel->getPath();
            jFile::createDir(dirname($file), jApp::config()->chmodFile);

            file_put_contents($file, $message->getHeaders());
            @chmod($file, jApp::config()->chmodFile);

            $sel = new jSelectorLog($f.'request.xml');
            $file = $sel->getPath();
            file_put_contents($file, $message->getRequest());
            @chmod($file, jApp::config()->chmodFile);

            $sel = new jSelectorLog($f.'response.xml');
            $file = $sel->getPath();
            file_put_contents($file, $message->getResponse());
            @chmod($file, jApp::config()->chmodFile);
        }
        catch(Exception $e) {
            $file = jApp::logPath('errors.log');
            @error_log(date ("Y-m-d H:i:s")."\t\tsoap error\t".$e->getMessage()."\n", 3, $file);
            @chmod($file, jApp::config()->chmodFile);
        }
    }

    function output($response) {}

}
