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
 * hook plugin
 *
 * It allows to retrieve HTML content, coming from responses
 * of an event, and inserting at the place of the hook tag.
 *
 * Example:
 *
 * <code>
 * <div id="hook-content">
 * {hook 'myevent'}
 * </div>
 * </code>
 *
 * In a Jelix Event listener:
 *
 * <code>
 * function onmyevent($event) {
 *    $event->add('<div>html content</div>');
 * }
 * </code>
 *
 * Result:
 *
 * <code>
 * <div id="hook-content">
 * <div>html content</div>
 * </div>
 * </code>
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