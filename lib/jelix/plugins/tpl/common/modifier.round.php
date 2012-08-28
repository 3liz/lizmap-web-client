<?php
/**
 * @package    jelix
 * @subpackage jtpl_plugin
 * @author     Vincent Viaud
 * @copyright 2010 Vincent Viaud
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * Modifier plugin : Rounds a float
 *
 * <pre>
 *  {$var|round:2}
 * </pre>
 * @param float $val the value to round
 * @param int $precision The number of decimal digits to round to.
 * @return float
 */
function jtpl_modifier_common_round($val, $precision = 0) {
    return round($val, $precision);
}


