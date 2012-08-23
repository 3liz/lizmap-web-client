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
 * @return string the php code corresponding to the begin or end of the block
 * @see jForms
 * @since 1.0.1
 */
function jtpl_block_html_formdata($compiler, $begin, $param=array())
{

    if(!$begin){
        return '
unset($t->_privateVars[\'__form\']); 
unset($t->_privateVars[\'__displayed_ctrl\']);';
    }

    if(count($param) != 1) {
        $compiler->doError2('errors.tplplugin.block.bad.argument.number','formdata',1);
        return '';
    }

    $content = ' $t->_privateVars[\'__form\'] = '.$param[0].';
$t->_privateVars[\'__displayed_ctrl\'] = array();
';
    return $content;
}

