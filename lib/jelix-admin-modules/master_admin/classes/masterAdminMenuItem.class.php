<?php
/**
* @package   jelix_admin_modules
* @subpackage master_admin
* @author    Laurent Jouanneau
* @contributor Kévin Lepeltier
* @copyright 2008-2009 Laurent Jouanneau, 2009 Kévin Lepeltier
* @link      http://jelix.org
* @licence  http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GNU General Public Licence, see LICENCE file
*/

class masterAdminMenuItem {
    public $id = '';
    public $parentId = '';
    public $label = '';
    public $content = '';
    public $type = 'url';
    public $order = 0;
    public $icon = '';
    public $newWindow = false;
    
    public $childItems = array();
    
    public function __construct($id, $label, $content, $order=0, $parentId='', $type = 'url') {
        $this->id = $id;
        $this->parentId = $parentId;
        $this->label = $label;
        $this->content = $content;
        $this->type = $type;
        $this->order = $order;
       
    }
    
    public function copyFrom($item) {
        $this->label = $item->label;
        $this->content = $item->content;
        $this->type = $item->type;
        $this->order = $item->order;
        $this->icon = $item->icon;
        $this->childItems = array_merge($item->childItems, $this->childItems);
    }
}

function masterAdminItemSort($itemA, $itemB)
{
    return ($itemA->order - $itemB->order);
}