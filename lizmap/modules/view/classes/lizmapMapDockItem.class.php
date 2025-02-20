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
    /** @var string Unique id of the dock item. */
    public $id = '';

    /** @var string Title visible on hover. */
    public $title = '';

    /** @var string HTML displayed in content part. */
    public $content = '';

    /** @var int display order in the dock. */
    public $order = 0;

    /** @var string URL to CSS */
    public $css = '';

    /** @var string URL to JS */
    public $js = '';

    /** @var array parameters added to script tag. ['type' => 'module'] will override type="text/javascript" */
    public $jsParams = array();

    public $icon = '';
    public $menuIconClasses = '';

    public function __construct($id, $title, $content, $order = 0, $css = '', $js = '', $jsParams = array())
    {
        $this->id = $id;
        $this->title = $title;
        $this->content = $content;
        $this->order = $order;
        $this->icon = '<span class="icon"></span>';
        $this->css = $css;
        $this->js = $js;
        $this->jsParams = $jsParams;
    }

    public function copyFrom($item)
    {
        $this->title = $item->title;
        $this->content = $item->content;
        $this->order = $item->order;
        $this->icon = $item->icon;
        $this->css = $item->css;
        $this->js = $item->js;
        $this->jsParams = $item->jsParams;
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
    foreach ($maps as $item) {
        $items[] = $item;
    }
    usort($items, 'mapDockItemSort');

    return $items;
}
