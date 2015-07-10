<?php
/**
* @package     jelix
* @subpackage  jtpl_plugin
* @author      Laurent Jouanneau
* @contributor Dominique Papin
* @copyright   2006-2007 Laurent Jouanneau
* @copyright   2007 Dominique Papin
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * a special if block to test easily a right value
 *
 * <pre>{ifacl 'subject','value', 54} ..here generated content if the user has the right  {/ifacl}</pre>
 * @param jTplCompiler $compiler the template compiler
 * @param boolean $begin true if it is the begin of block, else false
 * @param array $param 0=>subject 1=>right value 2=>optional resource
 * @return string the php code corresponding to the begin or end of the block
 */
function jtpl_block_common_ifacl($compiler, $begin, $param=array())
{
    if($begin){
        if(count($param) == 2){
            $content = ' if(jAcl::check('.$param[0].','.$param[1].')):';
        }elseif(count($param) == 3){
            $content = ' if(jAcl::check('.$param[0].','.$param[1].','.$param[2].')):';
        }else{
            $content='';
            $compiler->doError2('errors.tplplugin.block.bad.argument.number','ifacl',2);
        }
    }else{
        $content = ' endif; ';
    }
    return $content;
}
