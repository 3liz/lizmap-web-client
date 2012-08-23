<?php
/**
* @package   jelix_admin_modules
* @subpackage master_admin
* @author    Laurent Jouanneau
* @contributor Kévin Lepeltier
* @copyright 2008 Laurent Jouanneau, 2009 Kévin Lepeltier
* @link      http://jelix.org
* @licence  http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GNU General Public Licence, see LICENCE file
*/

class admin_infoboxZone extends jZone {
    
    protected $_tplname='zone_admin_infobox';
    
    protected function _prepareTpl(){
        jClasses::inc('masterAdminMenuItem');
        
        $items = jEvent::notify('masteradminGetInfoBoxContent')->getResponse();
        
        usort($items, "masterAdminItemSort");

        $this->_tpl->assign('infoboxitems', $items);
        $this->_tpl->assign('user', jAuth::getUserSession());
    }
}
