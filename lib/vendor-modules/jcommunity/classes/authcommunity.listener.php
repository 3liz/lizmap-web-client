<?php
/**
* @package      jcommunity
* @subpackage
* @author       Laurent Jouanneau <laurent@xulfr.org>
* @contributor
* @copyright    2007 Laurent Jouanneau
* @link         http://jelix.org
* @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/
use \Jelix\JCommunity\Account;

class authcommunityListener extends jEventListener{

   /**
   *
   */
   function onAuthCanLogin ($event) {
        $event->Add(array('canlogin'=>
            ($event->getParam('user')->status >= Account::STATUS_VALID)));
   }
}
