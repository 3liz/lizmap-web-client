<?php
/**
* @author       Laurent Jouanneau <laurent@xulfr.org>
* @contributor
*
* @copyright    2008-2019 Laurent Jouanneau
*
* @link         http://jelix.org
* @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/

/**
 * controller allowing the user to change his profile properties
 */
class accountCtrl extends \Jelix\JCommunity\AbstractController
{
    public $pluginParams = array(
      '*' => array('auth.required' => true),
      'show' => array('auth.required' => false),
      'destroydone' => array('auth.required' => false),
    );

    protected function getDaoName()
    {
        $dao = jAuth::getDriverParam('dao');
        if ($dao == '') {
            throw new \Exception("dao parameter is missing from the configuration of authentication");
        }
        return $dao;
    }

    protected function getProfileName()
    {
        $profile = jAuth::getDriverParam('profile');
        if ($profile === null) {
            return '';
        }
        return $profile;
    }

    protected function getAccountForm()
    {
        $form = jAuth::getDriverParam('userform');
        if ($form == '') {
            return 'jcommunity~account';
        }
        return $form;
    }

    /**
     * show informations about a user.
     */
    public function show()
    {
        $login = $this->param('user');

        if (!$this->canViewProfiles($login)) {
            return $this->notavailable();
        }

        $rep = $this->getResponse('html');

        $tpl = new jTpl();
        $tpl->assign('username', $login);
        $rep->title = jLocale::get('account.profile.of', array($login));

        $dao = jDao::create($this->getDaoName(), $this->getProfileName());
        $daoUser = $dao->getByLogin($login);
        if (!$daoUser) {
            $rep->body->assign('MAIN', $tpl->fetch('account_unknown'));
            return $rep;
        }

        try {
            $form = jForms::create($this->getAccountForm(), $login);
            $user = $form->initFromDao($daoUser, null, $this->getProfileName());
        } catch (Exception $e) {
            $rep->body->assign('MAIN', $tpl->fetch('account_unknown'));
            return $rep;
        }

        if ($user->status < \Jelix\JCommunity\Account::STATUS_VALID) {
            $rep->body->assign('MAIN', $tpl->fetch('account_unknown'));
            return $rep;
        }
        $himself = (jAuth::isConnected() && jAuth::getUserSession()->login == $login);

        $tpl->assign('user', $user);
        $tpl->assign('form', $form);
        $tpl->assign('publicProperties',        $this->config->getPublicUserProperties());
        $tpl->assign('passwordChangeAllowed',   $this->config->isPasswordChangeEnabled()
                                                && jAuth::canChangePassword($login));
        $tpl->assign('changeAllowed',           $this->config->isAccountChangeEnabled());
        $tpl->assign('destroyAllowed',          $this->config->isAccountDestroyEnabled());
        $tpl->assign('himself', $himself);
        $tpl->assign('additionnalContent', '');
        $tpl->assign('otherInfos', array()); // 'label'=>'value'
        $tpl->assign('otherPrivateActions', array()); // 'link'=>'label'
        jEvent::notify('jcommunity_account_show', array(
            'login' => $login,
            'user' => $user,
            'tpl' => $tpl,
            'form' => $form,
            'himself'=> $himself
        ));

        $rep->body->assign('MAIN', $tpl->fetch('account_show'));
        jForms::destroy($this->getAccountForm(), $login);
        return $rep;
    }

    public function prepareEdit()
    {
        $login = $this->param('user');
        $rep = $this->getResponse('redirect');
        $rep->action = 'jcommunity~account:show';
        $rep->params = array('user' => $login);

        if (!jAuth::isConnected() ||
            jAuth::getUserSession()->login != $login ||
            !$this->config->isAccountChangeEnabled()
        ) {
            return $this->notavailable();
        }

        $dao = jDao::create($this->getDaoName(), $this->getProfileName());
        $daoUser = $dao->getByLogin($login);
        if (!$daoUser) {
            return $rep;
        }

        $form = jForms::create($this->getAccountForm(), $login);

        jEvent::notify('jcommunity_init_edit_form_account', array('login' => $login, 'form' => $form));

        try {
            $form->initFromDao($daoUser, null, $this->getProfileName());
        } catch (Exception $e) {
            return $rep;
        }

        jEvent::notify('jcommunity_prepare_edit_account', array('login' => $login, 'form' => $form));

        $rep->action = 'jcommunity~account:edit';

        return $rep;
    }

    public function edit()
    {
        $login = $this->param('user');
        if ($login == '' ||
            !jAuth::isConnected() ||
            jAuth::getUserSession()->login != $login ||
            !$this->config->isAccountChangeEnabled()
        ) {
            return $this->notavailable();
        }

        $dao = jDao::create($this->getDaoName(), $this->getProfileName());
        $daoUser = $dao->getByLogin($login);
        if (!$daoUser) {
            $rep = $this->getResponse('redirect');
            $rep->action = 'jcommunity~account:show';
            $rep->params = array('user' => $login);

            return $rep;
        }


        $form = jForms::get($this->getAccountForm(), $login);
        if (!$form) {
            $rep = $this->getResponse('redirect');
            $rep->action = 'jcommunity~account:show';
            $rep->params = array('user' => $login);

            return $rep;
        }

        jEvent::notify('jcommunity_init_edit_form_account', array('login' => $login, 'form' => $form));

        $rep = $this->getResponse('html');

        $tpl = new jTpl();
        $tpl->assign('username', $login);
        $tpl->assign('form', $form);

        jEvent::notify('jcommunity_edit_account', array('login' => $login, 'rep' => $rep, 'form' => $form, 'tpl' => $tpl));

        $rep->body->assign('MAIN', $tpl->fetch('account_edit'));

        return $rep;
    }

    public function save()
    {
        $login = $this->param('user');
        $config = new \Jelix\JCommunity\Config();

        $rep = $this->getResponse('redirect');
        $rep->action = 'jcommunity~account:show';
        $rep->params = array('user' => $login);

        if ($login == '' ||
            !jAuth::isConnected() ||
            jAuth::getUserSession()->login != $login||
            !$this->config->isAccountChangeEnabled()
        ) {
            return $this->notavailable();
        }

        $accountFact = jDao::create($this->getDaoName(), $this->getProfileName());
        $daoUser = $accountFact->getByLogin($login);
        if (!$daoUser) {
            return $rep;
        }

        $form = jForms::get($this->getAccountForm(), $login);
        if (!$form) {
            return $rep;
        }
        jEvent::notify('jcommunity_init_edit_form_account', array('login' => $login, 'form' => $form));

        $form->initFromRequest();
        $form->check();

        if ($config->verifyNickname() &&
            $form->getControl('nickname') !== null &&
            $accountFact->verifyNickname($login, $form->getData('nickname'))
        ) {
            $form->setErrorOn('nickname', jLocale::get('account.error.dup.nickname'));
        }

        jEvent::notify('jcommunity_check_before_save_account', array('login' => $login, 'form' => $form));
        if (count($form->getErrors())) {
            $rep->action = 'jcommunity~account:edit';
        } else {
            $form->prepareObjectFromControls($daoUser, $daoUser->getProperties());

            jEvent::notify('jcommunity_save_account', array(
                'login' => $login,
                'form' => $form,
                'factory' => $accountFact,
                'record' => $daoUser,
                'to_insert' => false)
            );
            $accountFact->update($daoUser);

            jForms::destroy($this->getAccountForm(), $login);
        }

        return $rep;
    }

    public function destroy()
    {
        $login = $this->param('user');
        if ($login == '' ||
            !jAuth::isConnected() ||
            jAuth::getUserSession()->login != $login ||
            !$this->config->isAccountDestroyEnabled()
        ) {
            return $this->notavailable();
        }
        $rep = $this->getResponse('html');
        $tpl = new jTpl();
        $tpl->assign('username', $login);
        $rep->body->assign('MAIN', $tpl->fetch('account_destroy'));

        return $rep;
    }

    public function dodestroy()
    {
        $login = $this->param('user');
        $password = $this->param('conf_password');

        if ($login == '' ||
            !jAuth::isConnected() ||
            jAuth::getUserSession()->login != $login ||
            !$this->config->isAccountDestroyEnabled()
        ) {
            return $this->notavailable();
        }

        $rep = $this->getResponse('redirect');
        $rep->params = array('user' => $login);
        $rep->action = 'jcommunity~account:destroydone';
        $tpl = new jTpl();
        $tpl->assign('username', $login);

        if (jAuth::verifyPassword($login, $password)) {
            if (jAuth::removeUser($login)) {
                jAuth::logout();
            } else {
                $rep->params['error'] = 'notremoved';
            }
        } else {
            $rep->params['error'] = 'badpassword';
        }

        return $rep;
    }

    public function destroydone()
    {
        $rep = $this->getResponse('html');
        $tpl = new jTpl();

        $login = $this->param('user');
        $error = $this->param('error');

        if (jAuth::isConnected()) {
            if (jAuth::getUserSession()->login == $login) {
                if (jAuth::getUser($login)) {
                    $error = 'notremoved';
                }
                else {
                    $error = 'nologout';
                }
            }
            else {
                $error = 'wronguser';
            }
        }

        $tpl->assign('error', $error);
        $rep->body->assign('MAIN', $tpl->fetch('account_destroy_done'));
        return $rep;
    }
}
