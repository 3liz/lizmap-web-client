<?php
/**
 * Modifier Plugin
 * @package    jelix
 * @subpackage jtpl_plugin
 * @author Laurent Jouanneau
 * @link http://jelix.org/
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * modifier plugin :  apply the implode function on the given value
 * @return string
 */
function jtpl_modifier_common_implode($arr, $glue = " ") {
    return implode($glue, $arr);
}
