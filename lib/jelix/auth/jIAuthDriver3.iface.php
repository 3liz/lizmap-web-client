<?php
/**
 * @package    jelix
 * @subpackage auth
 * @author     Laurent Jouanneau
 * @copyright   2022 Laurent Jouanneau
 */

/**
 * interface for auth drivers
 * @package    jelix
 * @subpackage auth
 * @since 1.6.37
 */
interface jIAuthDriver3 extends jIAuthDriver2
{
    /**
     * Get the reason to the forbidden password change
     *
     * It can return the reason only after the call of jIAuthDriver2::canChangePassword()
     *
     * @return string
     */
    public function getReasonToForbiddenPasswordChange();

}