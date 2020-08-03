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
        /** @var jTpl $tpl */
        $tpl = $event->tpl;

        $canChangePassword = $tpl->get('canChangePass');

        $config = new \Jelix\JCommunity\Config();
        if ($config->isResetAdminPasswordEnabledForAdmin() && $canChangePassword) {
            $tpl->assign('canChangePass', false);
            $links = $tpl->get('otherLinks');
            $status = $form->getData('status');
            if ($status == \Jelix\JCommunity\Account::STATUS_NEW) {
                $links[] = array(
                    'url' => jUrl::get('jcommunity~registration_admin_resend:index', array('login'=>$tpl->get('id'))),
                    'label' => jLocale::get('jcommunity~account.admin.link.account.resent.validation.email'),
                );
            }
            else {
                $links[] = array(
                    'url' => jUrl::get('jcommunity~password_reset_admin:index', array('login'=>$tpl->get('id'))),
                    'label' => jLocale::get('jcommunity~account.admin.link.account.reset.password'),
                );
            }
            $tpl->assign('otherLinks', $links);
        }
    }

    function onjauthdbAdminPrepareUpdate(jEvent $event)
    {
        $form = $event->form;
        if ($event->himself || !jAcl2::check('auth.users.view')) {
            $form->deactivate('status');
            $form->deactivate('create_date');
        }
        $form->deactivate('keyactivate');
        $form->deactivate('request_date');
    }

    function onjauthdbAdminEditUpdate(jEvent $event)
    {
        $this->onjauthdbAdminPrepareUpdate($event);
    }

    function onjauthdbAdminPrepareCreate(jEvent $event)
    {
        $form = $event->form;
        $form->deactivate('status');
        $form->deactivate('create_date');
        $form->deactivate('keyactivate');
        $form->deactivate('request_date');

        $config = new \Jelix\JCommunity\Config();
        if ($config->isResetAdminPasswordEnabledForAdmin()) {
            $form->deactivate('password');
            $form->deactivate('password_confirm');
        }
    }

    function onjauthdbAdminEditCreate(jEvent $event)
    {
        $form = $event->form;
        $form->deactivate('status');
        $form->deactivate('create_date');
        $form->deactivate('keyactivate');
        $form->deactivate('request_date');

        $config = new \Jelix\JCommunity\Config();
        if ($config->isResetAdminPasswordEnabledForAdmin()) {
            $form->deactivate('password');
            $form->deactivate('password_confirm');
            $event->tpl->assign('randomPwd', '');
            $event->add('<p>'.jLocale::get('jcommunity~account.form.admin.registration.info')."</p>");
        }

    }

    function onjauthdbAdminCheckCreateForm(jEvent $event)
    {
        $config = new \Jelix\JCommunity\Config();
        if ($config->isResetAdminPasswordEnabledForAdmin()) {
            $event->form->setData('status', \Jelix\JCommunity\Account::STATUS_NEW);
            $pwd = \jAuth::getRandomPassword();
            $event->form->setData('password', $pwd);
            $event->form->setData('password_confirm', $pwd);
        }
        else {
            $event->form->setData('status', \Jelix\JCommunity\Account::STATUS_VALID);
        }
    }

    function onjauthdbAdminAfterCreate(jEvent $event)
    {
        $config = new \Jelix\JCommunity\Config();
        if ($config->isResetAdminPasswordEnabledForAdmin()) {
            $registration = new \Jelix\JCommunity\Registration();
            try {
                $registration->createUserByAdmin($event->user);
            } catch(\phpmailerException $e) {
                \jLog::logEx($e, 'error');
                jMessage::add(jLocale::get('jcommunity~password.form.change.error.smtperror'), 'error');
                return;
            }
            jMessage::add(jLocale::get('jcommunity~account.form.admin.create.emailsent'));
        }
    }
}
