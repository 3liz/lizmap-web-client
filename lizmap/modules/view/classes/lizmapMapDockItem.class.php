<?php
/**
 * Class for items in the main view list.
 *
 * @author    3liz
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class lizmapMapDockItem
{
    public $id = '';
    public $title = '';
    public $content = '';
    public $order = 0;
    public $css = '';
    public $js = '';
    public $icon = '';
    public $menuIconClasses = '';

    public function __construct($id, $title, $content, $order = 0, $css = '', $js = '')
    {
        $this->id = $id;
        $this->title = $title;
        $this->content = $content;
        $this->order = $order;
        $this->icon = '<span class="icon"></span>';
        $this->css = $css;
        $this->js = $js;
    }

    public function copyFrom($item)
    {
        $this->title = $item->title;
        $this->content = $item->content;
        $this->order = $item->order;
        $this->icon = $item->icon;
        $this->css = $item->css;
        $this->js = $item->js;
        $this->menuIconClasses = $item->menuIconClasses;
    }

    public function fetchContent()
    {
        $content = $this->content;
        if (is_string($content)) {
            return $content;
        }
        if (is_array($content)) {
            $tpl = new jTpl();
            $tplName = $content[0];
            if (count($content) > 1) {
                $tpl->assign($content[1]);
            }

            return $tpl->fetch($tplName);
        }

        return '';
    }
}

function mapDockItemSort($itemA, $itemB)
{
    if ($itemA->order == $itemB->order) {
        return strcmp($itemA->id, $itemB->id);
    }

    return $itemA->order - $itemB->order;
}

function mapDockItemsMerge($itemsA, $itemsB)
{
    $maps = array();
    foreach ($itemsA as $item) {
        $maps[$item->id] = $item;
    }
    foreach ($itemsB as $item) {
        $maps[$item->id] = $item;
    }
    $items = array();
    foreach ($maps as $id => $item) {
        $items[] = $item;
    }
    usort($items, 'mapDockItemSort');

    return $items;
}
