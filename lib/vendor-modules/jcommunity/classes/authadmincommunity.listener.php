<?php
/**
* @package      jcommunity
* @subpackage
* @author       Laurent Jouanneau <laurent@xulfr.org>
* @contributor
* @copyright    2009 Laurent Jouanneau
* @link         http://jelix.org
* @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/

class authadmincommunityListener extends jEventListener{
    protected function deactivate($form) {
        $form->deactivate('status');
        $form->deactivate('keyactivate');
        $form->deactivate('request_date');
    }


    function onjauthdbAdminPrepareUpdate ($event) {
        if($event->getParam('himself')) {
            $this->deactivate($event->getParam('form'));
        }
    }
}