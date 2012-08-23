<?php
/**
* @package     jelix
* @subpackage  plugin
* @author      Hugues Magnier
* @copyright   2007 Hugues Magnier
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * remove all extra whitespaces
 */
function jtpl_block_common_stripws($compiler, $begin, $param=array()) {
    if($begin){
        $content = 'ob_start();';
    }
    else{
        $content = '
        $buffer = preg_replace(\'![\\t ]*[\\r\\n]+[\\t ]*!\', \'\', ob_get_contents());
        ob_end_clean();
        print $buffer;';
    }
    return $content;
}
