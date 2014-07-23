<?php
/**
* Class for items in the main view list
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

class lizmapMapDockItem {
    public $id = '';
    public $title = '';
    public $content = '';
    public $order = 0;

    public function __construct($id, $title, $content, $order=0) {
        $this->id = $id;
        $this->title = $title;
        $this->content = $content;
        $this->order = $order;
    }

    public function copyFrom($item) {
        $this->title = $item->title;
        $this->content = $item->content;
        $this->order = $item->order;
    }
}

function mapDockItemSort($itemA, $itemB)
{
    if ($itemA->order == $itemB->order);
      return strcmp($itemA->id, $itemB->id);
    return ($itemA->order - $itemB->order);
}
