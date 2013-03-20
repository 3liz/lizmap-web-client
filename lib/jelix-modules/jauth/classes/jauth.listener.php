<?php
/**
* @package     jelix-modules
* @subpackage  jauth
* @author      Laurent Jouanneau
* @contributor
* @copyright   2006-2013 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

class jauthListener extends jEventListener{

   /**
   *
   */
   function onAuthCanLogin ($event) {
        $user = $event->getParam('user');
        $ok = true;
        if(isset($user->actif)){
            $ok = filter_var($user->actif, FILTER_VALIDATE_BOOLEAN);
        }

        $ok = $ok && ($user->password != '');

        $event->Add(array('canlogin'=>$ok));
   }
}
