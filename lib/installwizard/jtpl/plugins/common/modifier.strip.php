<?php
/**
 * Plugin from smarty project and adapted for jtpl
 * @package    jelix
 * @subpackage jtpl_plugin
 * @author      Monte Ohrt <monte at ohrt dot com>
 * @copyright  2001-2003 ispi of Lincoln, Inc.
 * @link http://smarty.php.net/
 * @link http://jelix.org/
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * modifier plugin :  Replace all repeated spaces, newlines, tabs with a single space or supplied replacement string
 *
 * <pre>{$var|strip} 
 * {$var|strip:"&nbsp;"}</pre>
 *
 * @param string $text the text to strip
 * @param string $replace the string replacing the repeated spaces
 * @return string
 */
function jtpl_modifier_common_strip($text, $replace = ' ')
{
    return preg_replace('!\s+!', $replace, $text);
}

