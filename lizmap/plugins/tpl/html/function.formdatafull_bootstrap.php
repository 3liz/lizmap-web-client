<?php

/**
 * @author       Laurent Jouanneau
 *
 * @contributor  Dominique Papin, Julien Issler, Brunto, DSDenes
 *
 * @copyright    2007-2010 Laurent Jouanneau, 2007 Dominique Papin
 * @copyright    2008-2010 Julien Issler, 2010 Brunto, 2009 DSDenes
 *
 * @see         http://www.jelix.org
 *
 * @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 *
 * @param mixed $tpl
 * @param mixed $form
 * @param mixed $builder
 * @param mixed $options
 */

/**
 * Display all data of a form without the use of other plugins.
 *
 * @param jTpl       $tpl     template engine
 * @param jFormsBase $form    the form to display
 * @param string     $builder the builder type to use
 * @param array      $options options for the builder
 */
function jtpl_function_html_formdatafull_bootstrap($tpl, $form, $builder = 'htmlbootstrap', $options = array())
{
    echo '<div class="jforms-table form-horizontal">';

    $formfullBuilder = $form->getBuilder($builder);
    if (count($options)) {
        $formfullBuilder->setOptions($options);
    }

    foreach ($form->getRootControls() as $ctrlref => $ctrl) {
        if ($ctrl->type == 'submit' || $ctrl->type == 'reset' || $ctrl->type == 'hidden' || $ctrl->type == 'captcha' || $ctrl->type == 'secretconfirm') {
            continue;
        }
        if (!$form->isActivated($ctrlref)) {
            continue;
        }

        if ($ctrl->type == 'group') {
            echo '<div class="jforms-group">';
            $formfullBuilder->outputControlValue($ctrl);
            echo '</div>';
        } else {
            echo '<div class="control-group">';
            $formfullBuilder->outputControlLabel($ctrl, '', false);
            echo '<div class="controls">';
            $formfullBuilder->outputControlValue($ctrl);
            echo "</div>\n";
            echo "</div>\n";
        }
    }
    echo '</div>';
}
