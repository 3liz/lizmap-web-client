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

/**
 * Listener for events emitted by the jauthdb_admin
 *
 * We should not display all field in the account form displayed
 * by jauthdb_admin
 */
class authadmincommunityListener extends jEventListener{

    function onjauthdbAdminGetViewInfo(jEvent $event) {
        $form = $event->form;
        if ($event->himself || !jAcl2::check('auth.users.view')) {
            $form->deactivate('status');
            $form->deactivate('create_date');
        }
        $form->deactivate('keyactivate');
        $form->deactivate('request_date');
    }

    function onjauthdbAdminPrepareUpdate(jEvent $event)
    {
        $this->onjauthdbAdminGetViewInfo($event);
    }

    function onjauthdbAdminEditUpdate(jEvent $event)
    {
        $this->onjauthdbAdminGetViewInfo($event);
    }

    function onjauthdbAdminPrepareCreate(jEvent $event)
    {
        $form = $event->form;
        $form->deactivate('status');
        $form->deactivate('create_date');
        $form->deactivate('keyactivate');
        $form->deactivate('request_date');
    }

    function onjauthdbAdminEditCreate(jEvent $event)
    {
        $this->onjauthdbAdminPrepareCreate($event);
    }

    function onjauthdbAdminCheckCreateForm(jEvent $event)
    {
        $event->form->setData('status', \Jelix\JCommunity\Account::STATUS_VALID);
    }
}