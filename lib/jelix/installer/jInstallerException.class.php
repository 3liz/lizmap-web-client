<?php
/**
* @package     jelix
* @subpackage  installer
* @author      Laurent Jouanneau
* @copyright   2009 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


/**
 * Installer Exception
 *
 * It handles installer messages.
 * @package  jelix
 * @subpackage installer
 */
class jInstallerException extends Exception {

    /**
     * the locale key
     * @var string
     */
    protected $localeKey = '';

    /**
     * parameters for the locale key
     */
    protected $localeParams = null;

    /**
     * @param string $localekey a locale key
     * @param array $localeParams parameters for the message (for sprintf)
     */
    public function __construct($localekey, $localeParams = null) {

        $this->localeKey = $localekey;
        $this->localeParams = $localeParams;
        parent::__construct($localekey, 0);
    }

    /**
     * getter for the locale parameters
     * @return string
     */
    public function getLocaleParameters(){
        return $this->localeParams;
    }

    /**
     * getter for the locale key
     * @return string
     */
    public function getLocaleKey(){
        return $this->localeKey;
    }

}

/*
function jInstallerErrorHandler($errno, $errmsg, $filename, $linenum, $errcontext){

    if (error_reporting() == 0)
        return;

    $codeString = array(
        E_ERROR         => 'error',
        E_RECOVERABLE_ERROR => 'error',
        E_WARNING       => 'warning',
        E_NOTICE        => 'notice',
        E_DEPRECATED    => 'deprecated',
        E_USER_ERROR    => 'error',
        E_USER_WARNING  => 'warning',
        E_USER_NOTICE   => 'notice',
        E_USER_DEPRECATED => 'deprecated',
        E_STRICT        => 'strict'
    );

    if (isset ($codeString[$errno])){
        $codestr = $codeString[$errno];
    }else{
        $codestr = 'error';
    }

    $trace = debug_backtrace();
    array_shift($trace);

    echo '['.$codestr.'] '.$errmsg."\n";
    echo '  '.$filename. ' (line: '.$linenum.")\n";

    echo "\ttrace:";
    foreach($trace as $k=>$t){
        echo "\n\t$k\t".(isset($t['class'])?$t['class'].$t['type']:'').$t['function']."()\t";
        echo (isset($t['file'])?$t['file']:'[php]').' : '.(isset($t['line'])?$t['line']:'');
    }
    echo "\n";
}
*/