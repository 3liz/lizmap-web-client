<?php
/**
* @package   jelix_admin_modules
* @subpackage master_admin
* @author    Laurent Jouanneau
* @copyright 2008-2012 Laurent Jouanneau
* @link      http://jelix.org
* @licence  http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GNU General Public Licence, see LICENCE file
*/

class admin_menuZone extends jZone {
    protected $_tplname='zone_admin_menu';

    protected function _prepareTpl(){
        jClasses::inc('masterAdminMenuItem');

        $menu = array();
        $menu['toplinks'] = new masterAdminMenuItem('toplinks', '', '');

        if (!isset(jApp::config()->master_admin['disable_dashboard_menu']) ||
            !jApp::config()->master_admin['disable_dashboard_menu']) {
            $dashboard = new masterAdminMenuItem('dashboard', jLocale::get('gui.menu.item.dashboard'), jUrl::get('default:index'));
            $dashboard->icon = jApp::config()->urlengine['jelixWWWPath'] . 'design/images/dashboard.png';
            $menu['toplinks']->childItems[] = $dashboard;
        }

        $menu['refdata'] =  new masterAdminMenuItem('refdata', jLocale::get('gui.menu.item.refdata'), '', 80);

        $menu['system'] = new masterAdminMenuItem('system', jLocale::get('gui.menu.item.system'), '', 100);

        $items = jEvent::notify('masteradminGetMenuContent')->getResponse();

        foreach ($items as $item) {
            if($item->parentId) {
                if(!isset($menu[$item->parentId])) {
                    $menu[$item->parentId] = new masterAdminMenuItem($item->parentId, '', '');
                }
                $isRedefining = false;
                foreach($menu[$item->parentId]->childItems as $child) {
                    if ($child->id == $item->id) {
                        $child->copyFrom($item);
                        $isRedefining = true;
                        break;
                    }
                }
                if (!$isRedefining) {
                    $menu[$item->parentId]->childItems[] = $item;
                }
            }
            else {
                if(isset($menu[$item->id])) {
                    $menu[$item->id]->copyFrom($item);
                }
                else {
                    $menu[$item->id] = $item;
                }
            }
        }

        usort($menu, "masterAdminItemSort");
        foreach($menu as $topitem) {
            usort($topitem->childItems, "masterAdminItemSort");
        }
        $this->_tpl->assign('menuitems', $menu);
        $this->_tpl->assign('selectedMenuItem', $this->param('selectedMenuItem',''));
    }
}
