<?php
/**
 * @package     jelix
 * @subpackage  jtpl_plugin
 * @author      Thibault Piront (nuKs)
 * @copyright   2007 Thibault Piront
 * @link        http://jelix.org/
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * function plugin : Increment and print a counter on all calls.
 *
 * <pre>{for $i=0;$i<10;$i++}{counter 'name', true}{/for}</pre>
 * @param jTpl $tpl The template
 * @param string $name The name of the counter
 * @param bool $print Print the counter or not
 */
function jtpl_function_common_counter($tpl, $name = '', $print = true) {    
    if(!isset($tpl->_privateVars['counterArray']))
        $tpl->_privateVars['counterArray'] = array( 'default' => array('type' => '0', 'start' => 1, 'incr' => 1) );
        
    if( empty($name) && $name !== '0' ){
        $name = 'default';
    }
    if( !isset($tpl->_privateVars['counterArray'][$name]))
        $tpl->_privateVars['counterArray'][$name] = array( 'type' => '0', 'start' => 1, 'incr' => 1 );
    /* Shorten the variable */
    $in_use = &$tpl->_privateVars['counterArray'][$name];
        
    /* Transforms the alphabetic start into numeric one */
    if(is_string($in_use['start']) && ($in_use['type'] === 'aa' || $in_use['type'] === 'AA')) {
        $in_use['start'] = ord($in_use['start']);
    }
    
    /* Adapts the code if counter is more that Z/z or becomes less than A/a */
    if( ($in_use['type'] === 'aa' && ($in_use['start'] < ord('a') || $in_use['start'] > ord('z')) ) ||
        ($in_use['type'] === 'AA' && ($in_use['start'] < ord('A') || $in_use['start'] > ord('Z')) ) ){
        $in_use['type'] = '0';
        $in_use['start'] = 1;
    }
    
    /* Display the counter */
    if($print) {
        if($in_use['type'] === 'aa' || $in_use['type'] === 'AA'){
            echo chr($in_use['start']);
        } else {
            if($in_use['type'] === '00' && $in_use['start'] < 10 && $in_use['start'] > -1) {
                echo '0'.$in_use['start'];
            } elseif($in_use['type'] === '00' && $in_use['start'] > -10 && $in_use['start'] < 0) {
                echo '-0'.abs($in_use['start']);
            } else {
                echo $in_use['start'];
            }
        }
    }
    
    /* Increment the counter */
    $in_use['start'] += $in_use['incr'];
}

