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
class lizmapMainViewItem
{
    public $id = '';
    public $parentId = '';
    public $title = '';
    public $abstract = '';
    public $keywordList = '';
    public $proj = '';
    public $bbox = '';
    public $url = '';
    public $img = '';
    public $order = 0;
    public $type = '';
    public $wmsGetCapabilitiesUrl = '';
    public $wmtsGetCapabilitiesUrl = '';

    public $childItems = array();

    public function __construct($id, $title, $abstract = '', $keywordList = '', $proj = '', $bbox = '', $url = '', $img = '', $order = 0, $parentId = '', $type = 'rep', $wmsGetCapabilitiesUrl = '', $wmtsGetCapabilitiesUrl = '')
    {
        $this->id = $id;
        $this->parentId = $parentId;
        $this->title = $title;
        $this->abstract = $abstract;
        $this->keywordList = $keywordList;
        $this->proj = $proj;
        $this->bbox = $bbox;
        $this->url = $url;
        $this->img = $img;
        $this->order = $order;
        $this->type = $type;
        $this->wmsGetCapabilitiesUrl = $wmsGetCapabilitiesUrl;
        $this->wmtsGetCapabilitiesUrl = $wmtsGetCapabilitiesUrl;
    }

    public function copyFrom($item)
    {
        $this->title = $item->title;
        $this->abstract = $item->abstract;
        $this->keywordList = $item->keywordList;
        $this->proj = $item->proj;
        $this->bbox = $item->bbox;
        $this->url = $item->url;
        $this->img = $item->img;
        $this->order = $item->order;
        foreach ($item->childItems as $item) {
            $replaced = false;
            foreach ($this->childItems as $k => $i) {
                if ($i->id == $item->id) {
                    $this->childItems[$k] = $item;
                    $replaced = true;
                }
            }
            if (!$replaced) {
                $this->childItems[] = $item;
            }
        }
    }

    public static function mainViewItemSort($itemA, $itemB)
    {
        if ($itemA->type == 'rep' && $itemA->type != $itemB->type) {
            return -1;
        }
        if ($itemA->type == 'map' && $itemA->type != $itemB->type) {
            return 1;
        }
        if ($itemA->order == $itemB->order) {
            return strcmp($itemA->id, $itemB->id);
        }

        return $itemA->order - $itemB->order;
    }
}
