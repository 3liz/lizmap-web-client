<?php
/**
* @package     jelix
* @subpackage  jtpl_plugin
* @author      Laurent Jouanneau
* @contributor Dominique Papin
* @copyright   2006-2008 Laurent Jouanneau
* @copyright   2007 Dominique Papin
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * a special if block to test easily a right value
 *
 * <pre>{ifnotacl2 'subject',54} ..here generated content if the user has NOT the right  {/ifnotacl2}</pre>
 * @param jTplCompiler $compiler the template compiler
 * @param boolean $begin true if it is the begin of block, else false
 * @param array $params 0=>subject 1=>optional resource
 * @return string the php code corresponding to the begin or end of the block
 */
function jtpl_block_common_ifnotacl2($compiler, $begin, $params=array())
{
    if($begin){
        if(count($params) == 1){
            $content = ' if(!jAcl2::check('.$params[0].')):';
        }elseif(count($params) == 2){
            $content = ' if(!jAcl2::check('.$params[0].','.$params[1].')):';
        }else{
            $content='';
            $compiler->doError2('errors.tplplugin.block.bad.argument.number','ifnotacl2',1);
        }
    }else{
        $content = ' endif; ';
    }
    return $content;
}

