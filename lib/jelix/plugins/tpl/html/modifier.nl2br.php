<?php
/**
 * Plugin from smarty project and adapted for jtpl
 * @package    jelix
 * @subpackage jtpl_plugin
 * @version    $Id$
 * @author      Monte Ohrt <monte at ohrt dot com>
 * @copyright  2001-2003 ispi of Lincoln, Inc.
 * @link http://smarty.php.net/
 * @link http://jelix.org/
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * modifier plugin : convert \r\n, \r or \n to <<br/>>
 * Example:  {$text|nl2br}
 * @param string $string the string to modify
 * @return string
 */
function jtpl_modifier_html_nl2br($string)
{
    return nl2br($string);
}
