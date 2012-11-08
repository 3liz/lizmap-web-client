<?php
/**
* @package     jelix_admin_modules
* @subpackage  jacl2db_admin
* @author    Laurent Jouanneau
* @copyright 2008-2012 Laurent Jouanneau
* @link        http://jelix.org
* @licence     http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GNU General Public Licence, see LICENCE file
*/

class jauthdb_adminListener extends jEventListener{

    /**
    *
    */
    function onmasteradminGetMenuContent ($event) {
        $plugin = jApp::coord()->getPlugin('auth', false);
        if ($plugin && $plugin->config['driver'] == 'Db' && jAcl2::check('auth.users.list')) {
            $item = new masterAdminMenuItem('users', jLocale::get('jauthdb_admin~auth.adminmenu.item.list'), jUrl::get('jauthdb_admin~default:index'), 10, 'system');
            $item->icon = jApp::config()->urlengine['jelixWWWPath'] . 'design/images/user.png';
            $event->add($item);
        }
    }
}
