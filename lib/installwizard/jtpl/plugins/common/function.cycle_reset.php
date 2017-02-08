<?php
/**
 * @package     jelix
 * @subpackage  jtpl_plugin
 * @author      Philippe Schelté (dubphil)
 * @copyright   2008 Philippe Schelté
 * @link        http://jelix.org/
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * Type:     function<br>
 * Name:     cycle_reset<br>
 * Date:     Feb, 2008<br>
 * Purpose:  reset the cycle of a given cycle name or the default<br>
 * Input:
 *         - name = name of cycle (optional)
 *
 * Examples:<br>
 * <pre>
 * {cycle_reset 'name'}
 * {cycle_reset}
 * </pre>
 * @param jTpl $tpl
 * @param string $name the name of the cycle
 * @throws jException
 */
function jtpl_function_common_cycle_reset($tpl, $name='') {
    $cycle_name = $name ? $name : 'default';
    if(isset($tpl->_privateVars['cycle'][$cycle_name])){
        $tpl->_privateVars['cycle'][$cycle_name]['index'] = 0;
    } else {
        throw new jException("jelix~errors.tplplugin.function.argument.unknown", array($cycle_name,'cycle',''));
    }
}
