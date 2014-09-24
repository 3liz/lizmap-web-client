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
    public $css = '';

    public function __construct($id, $title, $content, $order=0, $css='') {
        $this->id = $id;
        $this->title = $title;
        $this->content = $content;
        $this->order = $order;
        $this->css = $css;
    }

    public function copyFrom($item) {
        $this->title = $item->title;
        $this->content = $item->content;
        $this->order = $item->order;
        $this->css = $css;
    }
}

function mapDockItemSort($itemA, $itemB)
{
    if ($itemA->order == $itemB->order);
      return strcmp($itemA->id, $itemB->id);
    return ($itemA->order - $itemB->order);
}


function mapDockItemsMerge($itemsA, $itemsB)
{
    $maps = array();
    foreach( $itemsA as $item ) {
        $maps[$item->id] = $item;
    }
    foreach( $itemsB as $item ) {
        $maps[$item->id] = $item;
    }
    $items = array();
    foreach( $maps as $id=>$item ) {
        $items[] = $item;
    }
    usort($items, "mainDockItemSort");
    return $items;
}
