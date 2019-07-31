<?php
/**
 * @author       Laurent Jouanneau <laurent@jelix.org>
 * @copyright    2019 Laurent Jouanneau
 *
 * @link         http://jelix.org
 * @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
 */

namespace Jelix\JCommunity;

use jForms;
use jLocale;
use jTpl;

abstract class AbstractPasswordController extends AbstractController
{
    public $pluginParams = array(
        '*' => array('auth.required' => false),
    );

    protected $configMethodCheck = 'isResetPasswordEnabled';

    protected $formPasswordTitle = 'password.form.change.title';

    protected $formPasswordTpl = 'password_reset_change';

    protected $actionController = 'password_reset';

    protected $forRegistration = false;

    /**
     * form to confirm and change the password
     */
    public function resetform()
    {
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }

        $rep = $this->_getjCommunityResponse();
        $rep->title = jLocale::get($this->formPasswordTitle);

        $passReset = new \Jelix\JCommunity\PasswordReset($this->forRegistration);
        $tpl = new jTpl();

        $form = jForms::get('password_reset_change');
        if ($form == null) {
            $login = $this->param('login');
            $key = $this->param('key');

            $user = $passReset->checkKey($login, $key);
            if (is_string($user)) {
                $status = $user;
                $tpl->assign('error_status', $status);
                $rep->body->assign('MAIN', $tpl->fetch($this->formPasswordTpl));
                return $rep;
            }

            $form = jForms::create('password_reset_change');
            $form->setData('pchg_login', $login);
            $form->setData('pchg_key', $key);
        }
        $tpl->assign('error_status', '');
        $tpl->assign('form', $form);

        $rep->body->assign('MAIN', $tpl->fetch($this->formPasswordTpl));

        return $rep;
    }

    /**
     * Save a new password after a reset request
     */
    public function save()
    {
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }

        $rep = $this->getResponse('redirect');

        $rep->action = $this->actionController.':resetform';

        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return $rep;
        }

        $form = jForms::fill('password_reset_change');
        if ($form == null) {
            return $rep;
        }

        if (!$form->check()) {
            return $rep;
        }

        $passReset = new \Jelix\JCommunity\PasswordReset($this->forRegistration);
        $login = $form->getData('pchg_login');
        $key = $form->getData('pchg_key');
        $passwd = $form->getData('pchg_password');
        jForms::destroy('password_reset_change');

        $user = $passReset->checkKey($login, $key);
        if (is_string($user)) {
            $rep->params = array('login'=>$login, 'key'=>$key);
            return $rep;
        }
        $passReset->changePassword($user, $passwd);

        $rep->action = $this->actionController.':changed';
        return $rep;
    }

    /**
     * Page which confirm that the password has changed.
     */
    public function changed()
    {
        $rep = $this->_getjCommunityResponse();
        $rep->title = jLocale::get($this->formPasswordTitle);
        $tpl = new jTpl();
        $tpl->assign('title', $rep->title);
        $rep->body->assign('MAIN', $tpl->fetch('password_reset_ok'));

        return $rep;
    }
}
