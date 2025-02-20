<?php

/**
 * @author      Loic Mathaud, Bruno Perles
 * @copyright   2008 Loic Mathaud
 * @copyright   2011 Bruno Perles
 *
 * @see        http://www.jelix.org
 *
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
            } elseif ($type_msg == 'error') {
                $type_msg = 'danger';
            }
            echo '<div class="alert alert-'.strtolower($type_msg).' alert-dismissible fade show" role="alert">';
            foreach ($all_msg as $msg) {
                echo '<p>'.htmlspecialchars($msg).'</p>';
            }
            echo '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
        }
    } else {
        echo '<div class="alert '.$type.' alert-dismissible fade show" role="alert">';
        foreach ($messages as $msg) {
            echo '<p>'.htmlspecialchars($msg).'</p>';
        }
        echo '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
    }

    if ($type == '') {
        jMessage::clearAll();
    } else {
        jMessage::clear($type);
    }
}
