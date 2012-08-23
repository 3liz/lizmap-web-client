<?php
/**
* @package     jelix
* @subpackage  installer
* @author      Laurent Jouanneau
* @copyright   2009 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* @package     jelix
* @subpackage  installer
* @since 1.2
*/
interface jIInstallerComponent {

    /**
     * Called before the installation of all other components
     * (dependents modules or the whole application).
     * Here, you should check if the component can be installed or not
     * @throw jException if an error occurs during the check of the installation
     */
    function preInstall();

    /**
     * should configure the component, install table into the database etc..
     * If an error occurs during the installation, you are responsible
     * to cancel/revert all things the method did before the error
     * @throw jException  if an error occurs during the install.
     */
    function install();

    /**
     * Redefine this method if you do some additionnal process after the installation of
     * all other modules (dependents modules or the whole application)
     * @throw jException  if an error occurs during the post installation.
     */
    function postInstall();

    /**
     * Called before the uninstallation of all other modules
     * (dependents modules or the whole application).
     * Here, you should check if the component can be uninstalled or not
     * @throw jException if an error occurs during the check of the installation
     */
    function preUninstall();

    /**
     * should configure the component, install table into the database etc.. 
     * @throw jException  if an error occurs during the install.
     */
    function uninstall();

    /**
     * 
     * @throw jException  if an error occurs during the install.
     */
    function postUninstall();

}

