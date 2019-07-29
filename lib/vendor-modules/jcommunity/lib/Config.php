<?php
/**
* @author       Laurent Jouanneau <laurent@jelix.org>
* @copyright    2015 Laurent Jouanneau
*
* @link         http://jelix.org
* @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/

namespace Jelix\JCommunity;

class Config
{
    protected $responseType = 'html';

    protected $registrationEnabled = true;

    protected $resetPasswordEnabled = true;

    protected $resetAdminPasswordEnabled = true;

    protected $passwordChangeEnabled = true;

    protected $accountDestroyEnabled = true;

    protected $verifyNickname = true;

    protected $publicProperties = array('login', 'nickname', 'create_date');

    /**
     * Indicate if jcommunity should take care of this following rights:
     * - auth.user.modify
     * - auth.user.change.password
     * @var bool
     */
    protected $useJAuthDbAdminRights = false;

    /**
     */
    public function __construct()
    {
        $config = (isset(\jApp::config()->jcommunity) ? \jApp::config()->jcommunity : array());
        if (isset($config['loginResponse'])) {
            $this->responseType = $config['loginResponse'];
        }

        if (isset($config['verifyNickname'])) {
            $this->verifyNickname = $config['verifyNickname'];
        }

        if (isset($config['passwordChangeEnabled'])) {
            $this->passwordChangeEnabled = $config['passwordChangeEnabled'];
        }
        if (isset($config['accountDestroyEnabled'])) {
            $this->accountDestroyEnabled = $config['accountDestroyEnabled'];
        }

        if (isset($config['useJAuthDbAdminRights'])) {
            $this->useJAuthDbAdminRights = $config['useJAuthDbAdminRights'];
        }

        if (isset($config['publicProperties'])) {
            if (!is_array($config['publicProperties'])) {
                $this->publicProperties = preg_split('/\s*,\s*/', trim($config['publicProperties']));
            }
            else {
                $this->publicProperties = $config['publicProperties'];
            }
        }

        if ((!isset($config['disableJPref']) || $config['disableJPref'] == false) &&
            class_exists('jPref')
        ) {
            $pref = \jPref::get('jcommunity_registrationEnabled');
            if ($pref !== null) {
                $this->registrationEnabled = $pref;
            }
            $pref = \jPref::get('jcommunity_resetPasswordEnabled');
            if ($pref !== null) {
                $this->resetPasswordEnabled = $pref;
            }
            $pref = \jPref::get('jcommunity_resetAdminPasswordEnabled');
            if ($pref !== null) {
                $this->resetAdminPasswordEnabled = $pref;
            }
        } else {
            if (isset($config['registrationEnabled'])) {
                $this->registrationEnabled = (bool) $config['registrationEnabled'];
            }
            if (isset($config['resetPasswordEnabled'])) {
                $this->resetPasswordEnabled = (bool) $config['resetPasswordEnabled'];
            }
            if (isset($config['resetAdminPasswordEnabled'])) {
                $this->resetAdminPasswordEnabled = (bool) $config['resetAdminPasswordEnabled'];
            }
        }
        $sender = filter_var(\jApp::config()->mailer['webmasterEmail'], FILTER_VALIDATE_EMAIL);
        if (!$sender) {
            // if the sender email is not configured, deactivate features that
            // need to send an email
            $this->resetPasswordEnabled = false;
            $this->resetAdminPasswordEnabled = false;
            $this->registrationEnabled = false;
        }
    }

    public function getResponseType()
    {
        return $this->responseType;
    }

    public function isRegistrationEnabled()
    {
        return $this->registrationEnabled;
    }

    public function isResetPasswordEnabled()
    {
        return $this->resetPasswordEnabled;
    }

    public function isResetAdminPasswordEnabled()
    {
        return $this->resetAdminPasswordEnabled;
    }

    public function isResetAdminPasswordEnabledForAdmin()
    {
        if ($this->useJAuthDbAdminRights) {
            return $this->resetAdminPasswordEnabled &&
                \jAcl2::check('auth.users.change.password');
        }
        return $this->resetAdminPasswordEnabled;
    }

    public function isPasswordChangeEnabled()
    {
        if ($this->useJAuthDbAdminRights) {
            return $this->passwordChangeEnabled &&
                \jAcl2::check('auth.user.change.password');
        }
        return $this->passwordChangeEnabled;
    }

    public function isAccountChangeEnabled() {
        if ($this->useJAuthDbAdminRights) {
            return \jAcl2::check('auth.user.modify');
        }
        return true;
    }

    public function isAccountDestroyEnabled() {
        return $this->accountDestroyEnabled && $this->isAccountChangeEnabled();
    }

    public function verifyNickname()
    {
        return $this->verifyNickname;
    }

    public function getPublicUserProperties()
    {
        if ($this->useJAuthDbAdminRights && ! \jAcl2::check('auth.user.view')) {
            return array('login');
        }
        return $this->publicProperties;
    }
}
