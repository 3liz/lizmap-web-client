<?php
/**
* @package     jelix_admin_modules
* @subpackage  jpref_admin
* @author    Florian Lonqueu-Brochard
* @copyright 2012 Florian Lonqueu-Brochard
* @link        http://jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

class jpref_adminListener extends jEventListener{

    /**
    *
    */
    function onmasteradminGetMenuContent ($event) {
        if (jAcl2::check('auth.users.list')) {
            $item = new masterAdminMenuItem('pref', jLocale::get('jpref_admin~admin.item.title'), jUrl::get('jpref_admin~prefs:index'), 50, 'system');
            $item->icon = jApp::config()->urlengine['jelixWWWPath'] . 'design/images/cog.png';
            $event->add($item);
        }
    }
}
