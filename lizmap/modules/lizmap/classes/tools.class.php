<?php

/**
 * Some generic methods.
 *
 * @author    3liz
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class tools
{
    /**
     * Replace accentuated letters.
     *
     * @param string $string String passed
     *
     * @return string
     */
    public function unaccent($string)
    {
        $in = array('à', 'á', 'â', 'ã', 'ä', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', 'œ', 'ù', 'ú', 'û', 'ü', 'ý', 'ÿ', 'À', 'Á', 'Â', 'Ã', 'Ä', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', 'Ù', 'Ú', 'Û', 'Ü', 'Ý');
        $out = array('a', 'a', 'a', 'a', 'a', 'c', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'n', 'o', 'o', 'o', 'o', 'o', 'oe', 'u', 'u', 'u', 'u', 'y', 'y', 'A', 'A', 'A', 'A', 'A', 'C', 'E', 'E', 'E', 'E', 'I', 'I', 'I', 'I', 'N', 'O', 'O', 'O', 'O', 'O', 'U', 'U', 'U', 'U', 'Y');

        return str_replace($in, $out, $string);
    }

    /**
     * Replace accentuated letters and delete special characters.
     *
     * @param string $string     String passed
     * @param bool   $accent     Replace the accents ?
     * @param bool   $special    Replace special chars with underscores ?
     * @param bool   $underscore Delete underscores ?
     * @param bool   $capital    Replace capital letters ?
     *
     * @return string
     */
    public function stringSimplify($string, $accent, $special, $underscore, $capital)
    {
        // accents
        if ($accent) {
            $string = $this->unaccent($string);
        }
        // special chars
        if ($special) {
            $search = array('@[^a-zA-Z0-9_]@');
            $replace = array('_');
            $string = preg_replace($search, $replace, $string);
        }
        // underscores
        if ($underscore) {
            $search = array('_');
            $replace = array('');
            $string = str_replace($search, $replace, $string);
        }
        // capital
        if ($capital) {
            $string = strtolower($string);
        }

        return $string;
    }

    /**
     * Human readable file size.
     * Replace octets with appropriate value. Ex : 1024 -> 1 Mo.
     *
     * @param string $file File from which to display the size
     *
     * @return string $filesize Formated file size
     */
    public function displayFileSize($file)
    {
        $filesize = filesize($file);
        if ($filesize >= 1073741824) {
            $filesize = round($filesize / 1073741824 * 100) / 100 .' Go';
        } elseif ($filesize >= 1048576) {
            $filesize = round($filesize / 1048576 * 100) / 100 .' Mo';
        } elseif ($filesize >= 1024) {
            $filesize = round($filesize / 1024 * 100) / 100 .' Ko';
        } else {
            $filesize .= ' o';
        }

        return $filesize;
    }
}
