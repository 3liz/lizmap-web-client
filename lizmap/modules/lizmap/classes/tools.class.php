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
     * @param bool   $speciaux   Replace special chars with underscores ?
     * @param bool   $accent     Delete underscores ?
     * @param bool   $accent     Replace capital letters ?
     * @param mixed  $underscore
     * @param mixed  $majuscule
     *
     * @return string
     */
    public function stringSimplify($string, $accent, $speciaux, $underscore, $majuscule)
    {
        // accents
        if ($accent) {
            $string = $this->unaccent($string);
        }
        // special chars
        if ($speciaux) {
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
        if ($majuscule) {
            $string = strtolower($string);
        }

        return $string;
    }

    /**
     * Human readable file size.
     * Replace octets with appropriate value. Ex : 1024 -> 1 Mo.
     *
     * @param string $fichier File from which to display the size
     *
     * @return string $taille Formated file size
     */
    public function displayFileSize($fichier)
    {
        $taille_fichier = filesize($fichier);
        if ($taille_fichier >= 1073741824) {
            $taille_fichier = round($taille_fichier / 1073741824 * 100) / 100 .' Go';
        } elseif ($taille_fichier >= 1048576) {
            $taille_fichier = round($taille_fichier / 1048576 * 100) / 100 .' Mo';
        } elseif ($taille_fichier >= 1024) {
            $taille_fichier = round($taille_fichier / 1024 * 100) / 100 .' Ko';
        } else {
            $taille_fichier = $taille_fichier.' o';
        }

        return $taille_fichier;
    }
}
