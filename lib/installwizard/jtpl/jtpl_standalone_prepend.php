<?php
/**
* @package     jTpl Standalone
* @author      Loic Mathaud
* @contributor Laurent Jouanneau
* @copyright   2006 Loic Mathaud
* @copyright   2006-2008 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

define('JTPL_PATH', __DIR__ . '/');

function getDummyLocales($locale) {
    return $locale;
}

class jTplConfig {

    /**
     * the path of the directory which contains the
     * templates. The path should have a / at the end.
     */
    static $templatePath = '';

    /**
     * boolean which indicates if the templates
     * should be compiled at each call or not
     */
    static $compilationForce = false;

    /**
     * the lang activated in the templates
     */
    static $lang = 'en';

    /**
     * the charset used in the templates
     */
    static $charset = 'UTF-8';

    /**
     * the function which allow to retrieve the locales used in your templates
     */
    static $localesGetter = 'getDummyLocales';

    /**
     * the path of the cache directory.  The path should have a / at the end.
     */
    static $cachePath = '';

    /**
     * the path of the directory which contains the
     * localization files of jtpl.  The path should have a / at the end.
     */
    static $localizedMessagesPath = '';

    /**
     * umask for directories created in the cache directory
     */
    static $umask = 0000;

    /**
     * permissions for directories created in the cache directory
     */
    static $chmodDir = 0755;

    /**
     * permissions for cache files
     */
    static $chmodFile = 0644;

    /**
     * @internal
     */
    static $localizedMessages = array();

    /**
     * @internal
     */
    static $pluginPathList = array();

    static function addPluginsRepository ($path) {
        if (trim($path) == '') return;

        if (!file_exists($path)) {
            throw new Exception('The given path, '.$path.' doesn\'t exists');
        }

        if (substr($path,-1) != '/')
            $path .= '/';

        if ($handle = opendir($path)) {
            while (false !== ($f = readdir($handle))) {
                if ($f[0] != '.' && is_dir($path.$f)) {
                    self::$pluginPathList[$f][] = $path.$f.'/';
                }
            }
            closedir($handle);
        }
    }
}

jTplConfig::$cachePath = realpath(JTPL_PATH.'temp/') . '/';
jTplConfig::$localizedMessagesPath = realpath(JTPL_PATH.'locales/') . '/';
jTplConfig::$templatePath = realpath(JTPL_PATH.'templates/') . '/';

jTplConfig::addPluginsRepository(realpath(JTPL_PATH.'plugins/'));

include(JTPL_PATH . 'jTpl.class.php');

