<?php
/**
* @package     jelix-modules
* @subpackage  jacl2db
* @author      Laurent Jouanneau
* @contributor Bastien Jaillot, Vincent Viaud
* @copyright   2008-2012 Laurent Jouanneau, 2008 Bastien Jaillot, 2010 BP2I
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
* @since 1.1
*/

/**
 * @package     jelix-modules
 * @subpackage  jacl2db
 * @since 1.1
 */
class jacl2dbListener extends jEventListener{

   /**
    * Called when a user is created : set up default rights on this user
    *
    * @param jEvent $event   the event
    */
   function onAuthNewUser($event){
        if (jApp::config()->acl2['driver'] == 'db' || jApp::config()->acl2['driver'] == 'dbcache') {
            $user = $event->getParam('user');
            jAcl2DbUserGroup::createUser($user->login);
        }
   }

   /**
    * Called when a user has been removed : delete rights about this user
    *
    * @param jEvent $event   the event
    */
   function onAuthRemoveUser($event){
        if(jApp::config()->acl2['driver'] == 'db' || jApp::config()->acl2['driver'] == 'dbcache') {
            $login = $event->getParam('login');
            jAcl2DbUserGroup::removeUser($login);
        }
   }

    function onAuthCanRemoveUser($event){
        if (jApp::config()->acl2['driver'] == 'db' || jApp::config()->acl2['driver'] == 'dbcache') {
            $manager = new jAcl2DbAdminUIManager();
            $login = $event->getParam('login');
            if (!$manager->canRemoveUser($login)) {
                $event->add(array('canremove'=>false));
            }
        }
    }

   function onAuthLogout($event){
        try { jAcl2::clearCache(); jAcl2DbUserGroup::clearCache(); } catch(Exception $e) {}
    }
}
