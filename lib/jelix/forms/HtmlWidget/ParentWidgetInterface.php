<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @copyright   2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

namespace jelix\forms\HtmlWidget;

/**
 * Interface for widgets that can have children widget: main builder, choice etc.
 */
interface ParentWidgetInterface {

    /**
     * Add javascript content into the generated form
     */
    function addJs($js);

    /**
     * Add javascript content into the generated form
     * to be insert at the end of the whole JS generated script.
     */
    function addFinalJs($js);

    /**
     * indicate if the parent widget generate itself some of js child
     * @return boolean
     */
    function controlJsChild();
}