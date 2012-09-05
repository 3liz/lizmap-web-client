<?php

/**
* @package    jelix
* @subpackage dao
* @author     Laurent Jouanneau
* @contributor Laurent Jouanneau
* @copyright   2005-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * Exception for Dao compiler
 * @package  jelix
 * @subpackage dao
 */
class jDaoXmlException extends jException {

    /**
     * @param jSelectorDao $selector
     * @param string $localekey a locale key
     * @param array $localeParams parameters for the message (for sprintf)
     */
    public function __construct($selector, $localekey, $localeParams=array()) {
        $localekey= 'jelix~daoxml.'.$localekey;
        $arg=array($selector->toString(), $selector->getPath());
        if(is_array($localeParams)){
            $arg=array_merge($arg, $localeParams);
        }else{
            $arg[]=$localeParams;
        }
        parent::__construct($localekey, $arg);
    }
}
