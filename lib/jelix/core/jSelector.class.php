<?php
/**
* Declare all differents classes corresponding to main jelix selectors
*
* a selector is a string refering to a file or a ressource, by indicating its module and its name.
* For example : "moduleName~resourceName". There are several type of selector, depending on the
* resource type. Selector objects get the real path of the corresponding file, the name of the
* compiler (if the file has to be compile) etc.
* So here, there is a selector class for each selector type.
* @package     jelix
* @subpackage  core_selector
* @author      Laurent Jouanneau
* @contributor Christophe Thiriot
* @copyright   2005-2007 Laurent Jouanneau
* @copyright   2008 Christophe Thiriot
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * Exception for selector errors
 * @package    jelix
 * @subpackage core_selector
 */
class jExceptionSelector extends jException { }

/**
* Create instance of selectors object
* @package    jelix
* @subpackage core_selector
*/
class jSelectorFactory {
    private function __construct(){}

    /**
     * Create an instance of a selector object corresponding to the given selector
     * @param string $selstr the selector. It should be a full selector : "type:module~resource" (not "module~resource")
     * @param bool $defaulttype
     * @return jISelector the corresponding selector
     * @throws jExceptionSelector
     */
    static public function create ($selstr, $defaulttype=false) {
        if (is_string($defaulttype) && strpos($selstr, ':') === false) {
            $selstr = "$defaulttype:$selstr";
        }

        if(preg_match("/^([a-z]{3,5})\:([\w~\/\.]+)$/", $selstr, $m)) {
            $cname='jSelector'.$m[1];
            if(class_exists($cname)) {
                $sel = new $cname($m[2]);
                return $sel;
            }
        }
        throw new jExceptionSelector('jelix~errors.selector.invalid.syntax', array($selstr,''));
    }
}


