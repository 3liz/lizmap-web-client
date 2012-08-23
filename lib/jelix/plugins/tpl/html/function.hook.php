<?php
/**
* @package     jelix
* @subpackage  jtpl_plugin
* @author      Olivier Demah
* @copyright   2009 Olivier Demah
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * hook plugin :  
 *
 * @param jTpl $tpl template engine
 * @param string $event the event name to call
 * @param array $params parameters to give to the listener
 */

function jtpl_function_html_hook($tpl, $event, $params=array())
{

    if ($event == '') return;
    
    $events = jEvent::notify($event,$params)->getResponse();
    
    foreach ($events as $event)
        echo $event;

}