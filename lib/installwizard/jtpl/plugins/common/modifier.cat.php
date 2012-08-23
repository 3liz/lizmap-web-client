<?php
/**
 * Plugin from smarty project and adapted for jtpl
 * @package    jelix
 * @subpackage jtpl_plugin
 * @author     Monte Ohrt <monte at ohrt dot com>
 * @copyright 2001-2003 ispi of Lincoln, Inc.
 * @link http://smarty.php.net/
 * @link http://jelix.org/
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * Modifier plugin : catenate a value to a variable
 *
 * <pre>
 *  {$var|cat:"foo"}  
 *  {$var|cat:$othervar}
 * </pre>
 * @param string $string the string to be modified
 * @param string $cat the string to concat to $string
 * @return string
 */
function jtpl_modifier_common_cat($string, $cat)
{
    return $string . $cat;
}
