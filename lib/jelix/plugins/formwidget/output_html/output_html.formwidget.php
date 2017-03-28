<?php
/**
* @package     jelix
* @subpackage  formwidgets
* @author      Claudio Bernardes
* @contributor Laurent Jouanneau, Julien Issler, Dominique Papin
* @copyright   2012 Claudio Bernardes
* @copyright   2006-2012 Laurent Jouanneau, 2008-2011 Julien Issler, 2008 Dominique Papin
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * HTML form builder
 * @package     jelix
 * @subpackage  jelix-plugins
 * @link http://developer.jelix.org/wiki/rfc/jforms-controls-plugins
 */

 class output_htmlFormWidget extends \jelix\forms\HtmlWidget\WidgetBase {
    function outputControl() {
        $attr = $this->getControlAttributes();
        
        unset($attr['readonly']);
        unset($attr['class']);
        if (isset($attr['title'])){
            $hint = ' title="'.htmlspecialchars($attr['title']).'"';
            unset($attr['title']);
        }
        else $hint = '';
        
        $attr['type'] = 'hidden';
        $attr['value'] = $this->getValue();
        echo '<input';
        $this->_outputAttr($attr);
        echo '/>';
        echo '<span class="jforms-value"',$hint,'>',htmlspecialchars($attr['value']),"</span>\n";
    }
}
