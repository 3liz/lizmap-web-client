<?php
/**
* @package    jelix
* @subpackage core
* @author     Laurent Jouanneau
* @contributor Sylvain de Vathaire
* @contributor Loic Mathaud <loic@mathaud.net>
* @copyright  2001-2005 CopixTeam, 2005-2010 Laurent Jouanneau, 2007 Sylvain de Vathaire, 2007 Loic Mathaud
* This function was get originally from the Copix project (CopixErrorHandler, Copix 2.3dev20050901, http://www.copix.org)
* Few lines of code are still copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this function are Gerald Croes and Laurent Jouanneau,
* and it was adapted/improved for Jelix by Laurent Jouanneau
*
* @link        http://www.jelix.org
* @licence    http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/


/**
* Error handler for the framework.
* Replace the default PHP error handler
* @param   integer     $errno      error code
* @param   string      $errmsg     error message
* @param   string      $filename   filename where the error appears
* @param   integer     $linenum    line number where the error appears
* @param   array       $errcontext
*/
function jErrorHandler($errno, $errmsg, $filename, $linenum, $errcontext){
    global $gJConfig, $gJCoord;

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

    if(preg_match('/^\s*\((\d+)\)(.+)$/',$errmsg,$m)){
        $code = $m[1];
        $errmsg = $m[2];
    }else{
        $code=1;
    }

    if (!isset ($codeString[$errno])){
        $errno = E_ERROR;
    }
    $codestr = $codeString[$errno];

    $trace = debug_backtrace();
    array_shift($trace);
    $gJCoord->handleError($codestr, $errno, $errmsg, $filename, $linenum, $trace);
}
