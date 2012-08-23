<?php
/**
 * Plugin to display count of an array
 * @package    jelix
 * @subpackage jtpl_plugin
 * @copyright  2007 laurent jouanneau
 * @link http://jelix.org/
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * modifier plugin :  display count of an array
 *
 * <pre>{$myarray|count_array}</pre>
 * @param array $aArray
 * @return integer
 */
function jtpl_modifier_common_count_array($aArray)
{
    return count($aArray);
}
