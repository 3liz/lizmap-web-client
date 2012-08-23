<?php
/**
* @package    jelix
* @subpackage jtpl_plugin
* @author     Aubanel Monnier
* @copyright  2007 Aubanel Monnier
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * a special to insert latex content
 *
 * usage : {lcmd <command>} .. calls the \<command>{} latex command
 * @param jTplCompiler $compiler the template compiler
 * @param boolean $begin true if it is the begin of block, else false
 * @param array $param  1=>latex command
 * @return string the php code corresponding to the begin or end of the block
 */
function jtpl_block_ltx2pdf_lcmd($compiler, $begin, $param=array())
{
    if ($begin){
        $param[0];
        return 'echo \'\\'.$param[0].'{\';';
    }else 
        return 'echo \'}\';';
}

