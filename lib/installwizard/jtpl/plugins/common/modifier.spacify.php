<?php
/**
 * Plugin from smarty project and adapted for jtpl
 * @package    jelix
 * @subpackage jtpl_plugin
 * @copyright  2001-2003 ispi of Lincoln, Inc.
 * @link http://smarty.php.net/
 * @link http://jelix.org/
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * modifier plugin : add spaces between characters in a string
 *
 * <pre>{$mytext|spacify}
 * {$mytext|spacify:$characters_to_insert}</pre>
 * @param string $string the string to spacify
 * @param string $spacify_char spaces to add
 * @return string
 */
function jtpl_modifier_common_spacify($string, $spacify_char = ' ')
{
    return implode($spacify_char,
                   preg_split('//', $string, -1, PREG_SPLIT_NO_EMPTY));
}
