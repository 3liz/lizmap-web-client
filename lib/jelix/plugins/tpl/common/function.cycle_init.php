<?php
/**
 * @package     jelix
 * @subpackage  jtpl_plugin
 * @author      Philippe Schelté (dubphil)
 * @contributor Laurent Jouanneau
 * @copyright   2008 Philippe Schelté, 2009 Laurent Jouanneau
 * @link        http://jelix.org/
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * Type:     function<br>
 * Name:     cycle_init<br>
 * Date:     Feb, 2008<br>
 * Purpose:  initialize cycling through given values<br>
 * Input:
 *         - values = comma separated list of values to cycle
 *         - name = name of cycle (optional)
 *
 * Examples:<br>
 * <pre>
 * {cycle_init '#eeeeee,#d0d0d0d'}
 * {cycle_init 'name','#eeeeee,#d0d0d0d'}
 * </pre>
 * @param jTpl $tpl
 * @param string $name the name of the cycle or the list of values
 * @param string $values the list of values
 * @throws jException
 */
function jtpl_function_common_cycle_init($tpl, $name, $values='') {
    if($name == ''){
        throw new jException("jelix~errors.tplplugin.cfunction.bad.argument.number", array('cycle_init','1',''));
    }
    
    if(is_array($name)) {
        $values = $name;
        $name = 'default';
    }
    else if(strpos($name,',') === false){
        if($values == ''){
            throw new jException("jelix~errors.tplplugin.cfunction.bad.argument.number", array('cycle_init','2',''));
        }
        if (!is_array($values)) {
            if(strpos($values,',') === false){
                throw new jException("jelix~errors.tplplugin.function.invalid", array('cycle_init','',''));
            }
            $values = explode(',', $values);
        }
    } else {
        $values = explode(',',$name);
        $name = 'default';
    }

    $tpl->_privateVars['cycle'][$name]['values'] = $values;
    $tpl->_privateVars['cycle'][$name]['index'] = 0;
}
