<?php
/**
* @package    jelix
* @subpackage core
* @author    Laurent Jouanneau
* @copyright  2001-2005 CopixTeam, 2005-2006 Laurent Jouanneau
* This class was get originally from the Copix project (CopixContext, Copix 2.3dev20050901, http://www.copix.org)
* Few lines of code are still copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this Copix class are Gerald Croes and Laurent Jouanneau,
* and this class was adapted/improved for Jelix by Laurent Jouanneau
*
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * Module context manager
 * Its goal is to manage a stack of module context
 * @package  jelix
 * @subpackage core
 */
class jContext {

    static protected $context = array();

    /**
    * set the context to the given module
    * @param string $module  the module name
    */
    static function push ($module){
        array_push (self::$context, $module);
    }

    /**
    * cancel the current context and set the context to the previous module
    * @return string the obsolet module name
    */
    static function pop (){
        return array_pop (self::$context);
    }

    /**
    * get the module name of the current context
    * @return string name of the current module
    */
    static function get (){
        return end(self::$context);
    }

    /**
    * clear the context
    */
    static function clear (){
        self::$context = array ();
    }
}
