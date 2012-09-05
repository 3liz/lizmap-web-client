<?php
/**
* @package     jelix
* @subpackage  jtpl_plugin
* @author      Dominique Papin
* @copyright   2008 Dominique Papin
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * a special if block to test easily the current control name
 * TO BE USED inside a {formcontrols} block
 *
 * {ifctrl 'name1','name2',...} some tpl {else} some other tpl {/ifctrl}
 * @param jTplCompiler $compiler the template compiler
 * @param boolean $begin true if it is the begin of block, else false
 * @param array $params 0=>'name',etc. to match against current control name
 * @return string the php code corresponding to the begin or end of the block
 */
function jtpl_block_html_ifctrl($compiler, $begin, $params=array())
{
    if($begin){
        if(count($params)==0) {
            $content='';
            $compiler->doError1('errors.tplplugin.block.bad.argument.number','ifctrl', '1+');
        } else {
            $content = ' if(isset($t->_privateVars[\'__ctrlref\'])&&(';
            foreach( $params as $ctrlname )
                $content .= '$t->_privateVars[\'__ctrlref\']=='.$ctrlname.' || ';
            $content = substr($content, 0, -4);
            $content .= ')):';
        }
    }else{
        $content = ' endif; ';
    }
    return $content;
}


