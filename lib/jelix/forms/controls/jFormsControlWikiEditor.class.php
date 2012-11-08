<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Olivier Demah
* @contributor Laurent Jouanneau
* @copyright   2009 Olivier Demah, 2010-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 * @package     jelix
 * @subpackage  forms
 * @since 1.2
 */
class jFormsControlWikiEditor extends jFormsControl {
    public $type='wikieditor';
    public $rows=5;
    public $cols=40;
    public $config='default';
    function __construct($ref){
        $this->ref = $ref;
        $this->datatype = new jDatatypeString();
    }

    public function isHtmlContent() {
        return true;
    }

    public function getDisplayValue($value) {
        $engine = jApp::config()->wikieditors[$this->config.'.wiki.rules'];
        $wiki = new jWiki($engine);
        return $wiki->render($value);
    }
}