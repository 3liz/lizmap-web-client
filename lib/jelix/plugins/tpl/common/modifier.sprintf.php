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
 * modifier plugin : format strings via sprintf
 * 
 * <pre>{$mytext|sprintf:'my format %s'}</pre>
 * @param string $string
 * @param string $format
 * @return string
 * @see sprintf
 */
function jtpl_modifier_common_sprintf($string, $format)
{
    return sprintf($format, $string);
}

