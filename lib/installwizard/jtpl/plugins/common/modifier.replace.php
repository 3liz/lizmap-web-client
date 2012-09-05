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
 * modifier plugin : simple search/replace
 * 
 * You should provide two arguments, like the first both of str_replace
 * <pre>{$mystring|replace:'foo':'bar'}</pre>
 * @param string $string the string to modify
 * @param string $search the string to search
 * @param string $replace
 * @return string
 */
function jtpl_modifier_common_replace($string, $search, $replace)
{
    return str_replace($search, $replace, $string);
}

/* vim: set expandtab: */

