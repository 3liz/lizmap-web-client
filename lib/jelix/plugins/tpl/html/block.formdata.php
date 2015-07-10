<?php
/**
* @package     jelix
* @subpackage  jtpl_plugin
* @author      Laurent Jouanneau
* @copyright   2006-2008 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * a block to display only data of a form
 *
 * usage : {formdata $theformobject} here the form content {/formdata}
 *
 * @param jTplCompiler $compiler the template compiler
 * @param boolean $begin true if it is the begin of block, else false
 * @param array $param 0=>form object
 * @param array $param 0=>form object
 *                     2=>name of the builder : default is html
 *                     3=>array of options for the builder
 * @return string the php code corresponding to the begin or end of the block
 * @see jForms
 * @since 1.0.1
 */
function jtpl_block_html_formdata($compiler, $begin, $param=array())
{

    if(!$begin){
        return '
unset($t->_privateVars[\'__form\']);
unset($t->_privateVars[\'__formbuilder\']);
unset($t->_privateVars[\'__formViewMode\']);
unset($t->_privateVars[\'__displayed_ctrl\']);';
    }

    if (count($param) < 1 || count($param) > 3) {
        $compiler->doError2('errors.tplplugin.block.bad.argument.number','formdata', '1-3');
        return '';
    }

    if(isset($param[1]) && trim($param[1]) != '""'  && trim($param[1]) != "''")
        $builder = $param[1];
    else
        $builder = "'".jApp::config()->tplplugins['defaultJformsBuilder']."'";

    if(isset($param[2]))
        $options = $param[2];
    else
        $options = "array()";

    $content = ' $t->_privateVars[\'__form\'] = '.$param[0].';
    $t->_privateVars[\'__formViewMode\'] = 1;
    $t->_privateVars[\'__formbuilder\'] = $t->_privateVars[\'__form\']->getBuilder('.$builder.');
    $t->_privateVars[\'__formbuilder\']->setOptions('.$options.');
$t->_privateVars[\'__displayed_ctrl\'] = array();
';
    return $content;
}

