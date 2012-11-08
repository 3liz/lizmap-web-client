<?php
/**
 * @package     jelix-modules
 * @subpackage  jacldb
 * @author      Laurent Jouanneau
 * @contributor Vincent Viaud
 * @copyright   2008-2012 Laurent Jouanneau, 2010 BP2I
 * @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 * @since 1.0.1
 */

/**
 * @package     jelix-modules
 * @subpackage  jacldb
 * @since 1.0.1
 */
class jacldbListener extends jEventListener{

    /**
     * Called when a user is created : set up default rights on this user
     *
     * @param jEvent $event   the event
     */
    function onAuthNewUser($event){
        if(jApp::config()->acl['driver'] == 'db') {
            $user = $event->getParam('user');
            jAclDbUserGroup::createUser($user->login);
        }
    }

    /**
     * Called when a user has been removed : delete rights about this user
     *
     * @param jEvent $event   the event
     */
    function onAuthRemoveUser($event){
        if(jApp::config()->acl['driver'] == 'db') {
            $login = $event->getParam('login');
            jAclDbUserGroup::removeUser($login);
        }
    }

    function onAuthLogout($event){
        try { jAcl2::clearCache(); } catch(Exception $e) {}
    }
}
?>
