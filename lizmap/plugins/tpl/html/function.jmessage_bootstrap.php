<?php
/**
 * @author      Loic Mathaud, Bruno Perles
 * @copyright   2008 Loic Mathaud
 * @copyright   2011 Bruno Perles
 *
 * @see        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 *
 * @param mixed $tpl
 * @param mixed $type
 */

/**
 * function plugin :  Display messages from jMessage.
 */
function jtpl_function_html_jmessage_bootstrap($tpl, $type = '')
{
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
        foreach ($messages as $type_msg => $all_msg) {
            if ($type_msg == 'default') {
                $type_msg = 'info';
            } elseif ($type_msg == 'ok') {
                $type_msg = 'success';
            }
            echo '<div class="alert alert-block alert-'.strtolower($type_msg).' fade in" data-alert="alert"><a class="close" data-dismiss="alert" href="#">×</a>';
            foreach ($all_msg as $msg) {
                echo '<p>'.htmlspecialchars($msg).'</p>';
            }
            echo '</div>';
        }
    } else {
        echo '<div class="alert alert-block '.$type.' fade in" data-alert="alert"><a class="close" data-dismiss="alert" href="#">×</a>';
        foreach ($messages as $msg) {
            echo '<p>'.htmlspecialchars($msg).'</p>';
        }
        echo '</div>';
    }

    if ($type == '') {
        jMessage::clearAll();
    } else {
        jMessage::clear($type);
    }
}
