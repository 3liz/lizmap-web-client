<?php
/**
* @package     jelix
* @subpackage  jtpl_plugin
* @author      Laurent Jouanneau
* @contributor Dominique Papin
* @contributor Bastien Jaillot
* @copyright   2006-2008 Laurent Jouanneau
* @copyright   2007 Dominique Papin, 2008 Bastien Jaillot
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * a special if block to test easily a right value
 *
 * <pre>{ifacl2 'subject',54} ..here generated content if the user has the right  {/ifacl2}</pre>
 * @param jTplCompiler $compiler the template compiler
 * @param boolean $begin true if it is the begin of block, else false
 * @param array $param 0=>subject 1=>optional resource
 * @return string the php code corresponding to the begin or end of the block
 */
function jtpl_block_common_ifacl2($compiler, $begin, $param=array())
{
    if($begin){
        if(count($param) == 1){
            $content = ' if(jAcl2::check('.$param[0].')):';
        }elseif(count($param) == 2){
            $content = ' if(jAcl2::check('.$param[0].','.$param[1].')):';
        }else{
            $content='';
            $compiler->doError2('errors.tplplugin.block.bad.argument.number','ifacl2',1);
        }
    }else{
        $content = ' endif; ';
    }
    return $content;
}
