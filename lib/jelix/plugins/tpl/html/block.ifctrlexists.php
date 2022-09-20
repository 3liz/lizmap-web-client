<?php
/**
 * @package     jelix
 * @subpackage  jtpl_plugin
 * @author      Laurent Jouanneau
 * @copyright   2019 Laurent Jouanneau
 * @link        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * a special if block to check if a ctrl exist in the form
 * TO BE USED inside a `{form}` or `{formadata}` block
 *
 * {ifctrlexists 'name1'} some tpl {else} some other tpl {/ifctrlexists}
 * @param jTplCompiler $compiler the template compiler
 * @param boolean $begin true if it is the begin of block, else false
 * @param array $params 0=>'name', to match against current control name
 * @return string the php code corresponding to the begin or end of the block
 */
function jtpl_block_html_ifctrlexists($compiler, $begin, $params=array())
{
    if ($begin) {
        if (count($params) != 1) {
            $content='';
            $compiler->doError1('errors.tplplugin.block.bad.argument.number','ifctrlexists', '1');
        } else {
            $content = ' if ($t->_privateVars[\'__form\']->getControl('.$params[0].') !== null):';
        }
    } else {
        $content = ' endif; ';
    }
    return $content;
}


