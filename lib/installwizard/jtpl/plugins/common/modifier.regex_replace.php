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
 * modifier plugin : regular epxression search/replace
 *
 * You should provide two arguments, like the first both of preg_replace
 * {$mystring|regex_replace:'/(\w+) (\d+), (\d+)/i':'${1}1,$3'}
 *
 * @param string $string
 * @param string|array $search
 * @param string|array $replace
 * @return string
 */
function jtpl_modifier_common_regex_replace($string, $search, $replace)
{
    if (preg_match('!\W(\w+)$!s', $search, $match) &&
            (strpos($match[1], 'e') !== false)) {
        /* remove eval-modifier from $search */
        $search = substr($search, 0, -iconv_strlen($match[1], jTpl::getEncoding())) .
            str_replace('e', '', $match[1]);
    }
    return preg_replace($search, $replace, $string);
}

