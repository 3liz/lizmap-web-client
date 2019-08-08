<?php
/**
 * @author       Laurent Jouanneau <laurent@xulfr.org>
 * @contributor
 *
 * @copyright    2019 Laurent Jouanneau
 *
 * @link         http://jelix.org
 * @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
 */

/**
 * controller for the password reset process, initiated by an administrator
 */
class password_confirm_registrationCtrl extends \Jelix\JCommunity\AbstractPasswordController
{
    protected $configMethodCheck = 'isResetAdminPasswordEnabled';


    protected $formPasswordTitle = 'password.form.create.title';

    protected $formPasswordTpl = 'password_reset_create';

    protected $actionController = 'password_confirm_registration';

    protected $forRegistration = true;
}
