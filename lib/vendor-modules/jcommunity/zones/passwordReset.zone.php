<?php
/**
* @package      jcommunity
* @subpackage
* @author       Laurent Jouanneau <laurent@xulfr.org>
* @contributor
* @copyright    2007-2018 Laurent Jouanneau
* @link         http://jelix.org
* @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/


class passwordResetZone extends jZone {

   protected $_tplname = 'password_reset_form';


    protected function _prepareTpl(){
        $form = jForms::get('password_reset');
        if($form == null){
            $form = jForms::create('password_reset');
        }
        $this->_tpl->assign('form',$form);
    }

}
