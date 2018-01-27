<?php
/**
* @package      jcommunity
* @subpackage
* @author       Laurent Jouanneau <laurent@xulfr.org>
* @contributor
* @copyright    2007 Laurent Jouanneau
* @link         http://jelix.org
* @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/


class passwordZone extends jZone {

   protected $_tplname='passwordform';


    protected function _prepareTpl(){
        $form = jForms::get('password');
        if($form == null){
            $form = jForms::create('password');
        }
        $this->_tpl->assign('form',$form);
    }

}

?>