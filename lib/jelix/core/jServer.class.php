<?php
/**
* @package    jelix
* @subpackage core
* @author     Laurent Jouanneau
* @copyright  2012 Laurent Jouanneau
* @link       http://jelix.org
* @licence    http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
* Static class providing some utilities to retrieve informations about the server
* @package    jelix
* @subpackage core
* @since Jelix 1.3.2
*/
class jServer {
    
    /**
     * tells if we are in a CLI (Command Line Interface) context or not.
     * If this is the case, fills some missing $_SERVER variables when cgi is used
     * @return boolean true if we are in a CLI context
     */
    static function isCLI() {
        if (PHP_SAPI != 'cli' && strpos(PHP_SAPI, 'cgi') === false) {
            return false;
        }

        if (PHP_SAPI != 'cli') {
            // only php-cgi used from the command line can be used, not the one called by apache
            if (isset($_SERVER['HTTP_HOST']) || isset($_SERVER['REDIRECT_URL'])  || isset($_SERVER['SERVER_PORT'])) {
                return false;
            }
            header('Content-type: text/plain');
            if (!isset($_SERVER['argv'])) {
                $_SERVER['argv'] = array_keys($_GET);
                $_SERVER['argc'] = count($_GET);
            }
            if (!isset($_SERVER['SCRIPT_NAME'])) {
                $_SERVER['SCRIPT_NAME'] = $_SERVER['argv'][0];
            }
            if (!isset($_SERVER['DOCUMENT_ROOT'])) {
                $_SERVER['DOCUMENT_ROOT'] = '';
            }
        }
        return true;
    }
}