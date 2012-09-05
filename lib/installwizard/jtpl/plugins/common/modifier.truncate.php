<?php
/**
 * Plugin from smarty project and adapted for jtpl
 * @package    jelix
 * @subpackage jtpl_plugin
 * @contributor Laurent Jouanneau (utf8 compliance)
 * @contributor Yannick Le Guédart
 * @copyright  2001-2003 ispi of Lincoln, Inc., 2007 Laurent Jouanneau
 * @copyright 2008 Yannick Le Guédart
 * @link http://smarty.php.net/
 * @link http://jelix.org/
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * modifier plugin :  Truncate a string
 *
 * Truncate a string to a certain length if necessary, optionally splitting in
 * the middle of a word, and appending the $etc string.
 * <pre>{$mytext|truncate}
 * {$mytext|truncate:40}
 * {$mytext|truncate:45:'...'}
 * {$mytext|truncate:60:'...':true}
 * </pre>
 * @param string $string the string to truncate
 * @param integer $length the number of char to keep
 * @param string $etc the string to append to the truncated string
 * @param boolean $break_words false if the last word shouldn't be cut
 * @return string
 */
function jtpl_modifier_common_truncate($string, $length = 80, $etc = '...',
                                                                  $break_words = false)
{
    if (function_exists ('mb_strlen')) {
        $f_strlen = 'mb_strlen';
    }
    else {
        $f_strlen = 'iconv_strlen';
    }

    if (function_exists ('mb_substr')) {
        $f_substr = 'mb_substr';
    }
    else {
        $f_substr = 'iconv_substr';
    }

    if($length == 0)
        return '';
    $charset = jTpl::getEncoding();

    if($f_strlen ($string,$charset) > $length) {
        $length -= $f_strlen($etc,$charset);
        if(!$break_words)
            $string = preg_replace('/\s+?(\S+)?$/', '', $f_substr($string, 0, $length+1,$charset));
        return $f_substr($string, 0, $length,$charset).$etc;
    } else
        return $string;
}
