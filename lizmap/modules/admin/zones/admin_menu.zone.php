<?php
/**
* @package   jelix_admin_modules
* @subpackage master_admin
* @author    Laurent Jouanneau
* @copyright 2008 Laurent Jouanneau
* @link      http://jelix.org
* @licence  http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GNU General Public Licence, see LICENCE file
*/

class admin_menuZone extends jZone {
    protected $_tplname='zone_admin_menu';

    protected function _prepareTpl(){
        jClasses::inc('adminMenuItem');

        $menu = array();

        $items = jEvent::notify('adminGetMenuContent')->getResponse();

        foreach ($items as $item) {
            if($item->parentId) {
                if(!isset($menu[$item->parentId])) {
                    $menu[$item->parentId] = new masterAdminMenuItem($item->parentId, '', '');
                }
                $menu[$item->parentId]->childItems[] = $item;
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

        usort($menu, "adminItemSort");
        foreach($menu as $topitem) {
            usort($topitem->childItems, "adminItemSort");
        }
        $this->_tpl->assign('menuitems', $menu);
        $this->_tpl->assign('selectedMenuItem', $this->param('selectedMenuItem',''));
    }
}
