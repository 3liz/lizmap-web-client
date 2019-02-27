<?php
/**
 * @package    jelix
 * @subpackage auth
 * @author     Laurent Jouanneau
 * @copyright   2019 Laurent Jouanneau
 */

/**
 * interface for auth drivers
 * @package    jelix
 * @subpackage auth
 * @static
 * @since 1.6.21
 */
interface jIAuthDriver2 extends jIAuthDriver
{
    /**
     * Indicate if the password can be changed technically.
     *
     * Not related to rights with jAcl2
     * @param string $login the login of the user
     * @return boolean
     */
    public function canChangePassword($login);

}