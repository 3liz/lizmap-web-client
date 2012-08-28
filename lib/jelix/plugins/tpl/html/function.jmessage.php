<?php
/**
* @package     jelix
* @subpackage  jtpl_plugin
* @author      Loic Mathaud
* @copyright   2008 Loic Mathaud
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* function plugin :  Display messages from jMessage
*/

function jtpl_function_html_jmessage($tpl, $type = '') {
    // Get messages
    if ($type == '') {
        $messages = jMessage::getAll();
    } else {
        $messages = jMessage::get($type);
    }
    // Not messages, quit
    if (!$messages) {
        return;
    }

    // Display messages
    if ($type == '') {
        echo '<ul class="jelix-msg">';
        foreach ($messages as $type_msg => $all_msg) {
            foreach ($all_msg as $msg) {
                echo '<li class="jelix-msg-item-'.$type_msg.'">'.htmlspecialchars($msg).'</li>';
            }
        }
    } else {
        echo '<ul class="jelix-msg-'. $type .'">';
        foreach ($messages as $msg) {
            echo '<li class="jelix-msg-item-'.$type.'">'.htmlspecialchars($msg).'</li>';
        }
    }
    echo '</ul>';

    if ($type == '') {
        jMessage::clearAll();
    } else {
        jMessage::clear($type);
    }
    
}
