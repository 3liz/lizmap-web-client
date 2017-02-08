<?php
/**
* @package    jelix
* @subpackage jtpl_plugin
* @author     Laurent Jouanneau
* @contributor Loic Mathaud
* @copyright  2007-2015 Laurent Jouanneau, 2009 Loic Mathaud
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * function plugin :  print the html content of a form submit button. You can use this plugin inside a formsubmits block
 *
 * @param jTpl $tpl template engine
 * @param string $ctrlname the name of the submit to display (required if it is outside a formsubmits)
 * @param array $attributes attributes for the generated html element
 * @throws jException
 */
function jtpl_function_html_formsubmit($tpl, $ctrlname='', $attributes=array())
{
    if($ctrlname =='') {
        if(isset($tpl->_privateVars['__submitref']) && $tpl->_privateVars['__submitref'] != ''){
            $ctrlname = $tpl->_privateVars['__submitref'];
            $ctrl = $tpl->_privateVars['__submit'];
        }else{
            $ctrls = $tpl->_privateVars['__form']->getSubmits();
            if (count($ctrls) == 0) {
                throw new jException('jelix~formserr.unknown.control',
                array('submit', $tpl->_privateVars['__form']->getSelector(),$tpl->_templateName));
            }
            reset($ctrls);
            $ctrlname = key($ctrls);
            $ctrl = current($ctrls);
        }
    }else{
        $ctrls = $tpl->_privateVars['__form']->getSubmits();
        if (count($ctrls) == 0) {
            throw new jException('jelix~formserr.unknown.control',
            array($ctrlname, $tpl->_privateVars['__form']->getSelector(),$tpl->_templateName));
        }
        $ctrl = $ctrls[$ctrlname];
    }

    if($tpl->_privateVars['__form']->isActivated($ctrlname)) {
        $tpl->_privateVars['__displayed_submits'][$ctrlname] = true;
        $tpl->_privateVars['__formbuilder']->outputControl($ctrl, $attributes);
    }
}
