<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @copyright   2006-2010 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 * @package     jelix
 * @subpackage  forms
 * @since 1.1
 */
class jFormsControlHtmlEditor extends jFormsControl {
    public $type='htmleditor';
    public $rows=5;
    public $cols=40;
    public $config='default';
    public $skin='default';
    function __construct($ref){
        $this->ref = $ref;
        $this->datatype = new jDatatypeHtml(true,true);
    }

    /**
     * @since 1.2
     */
    public function isHtmlContent() {
        return true;
    }

}
