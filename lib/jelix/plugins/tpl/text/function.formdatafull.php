<?php
/**
* @package      jelix
* @subpackage   jtpl_plugin
* @author       Julien Issler
* @contributor  Laurent Jouanneau
* @copyright    2008 Julien Issler, 2010 Laurent Jouanneau
* @link         http://www.jelix.org
* @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * Display all data of a form without the use of other plugins.
 *
 * @param jTpl $tpl template engine
 * @param jFormsBase $form the form to display
 */
function jtpl_function_text_formdatafull($tpl, $form){

    foreach($form->getControls() as $ctrlref=>$ctrl){
        if($ctrl->type == 'submit' || $ctrl->type == 'reset' || $ctrl->type == 'hidden' || $ctrl->type == 'captcha') continue;
        if(!$form->isActivated($ctrlref)) continue;

        echo $ctrl->label,' : ';

        $value = $ctrl->getDisplayValue($form->getData($ctrlref));
        if(is_array($value))
            echo join(',',$value);
        else if($ctrl->isHtmlContent())
            echo strip_tags($value);
        else
            echo $value;

        echo "\n\n";
    }

}
