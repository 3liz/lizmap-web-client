<?php
/**
 * @package     jelix
 * @subpackage  jtpl_plugin
 * @author      Julien Issler
 * @copyright   2009 Julien Issler
 * @link        http://jelix.org/
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * Repeat a string
 *
 * <pre>{repeat_string 'mystring'}
 * {repeat_string 'mystring',4}</pre>
 * @param jTpl $tpl The template
 * @param string $string The string to repeat
 * @param int $count How many times to repeat
 */
function jtpl_function_common_repeat_string($tpl, $string='', $count=1){
    echo str_repeat($string, $count);
}