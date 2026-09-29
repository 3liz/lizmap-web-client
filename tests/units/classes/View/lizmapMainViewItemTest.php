<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__.'/../../../../lizmap/modules/view/classes/lizmapMainViewItem.class.php';

/**
 * @internal
 *
 * @coversNothing
 */
class lizmapMainViewItemTest extends TestCase
{
    public function testConstructDefaults(): void
    {
        $item = new lizmapMainViewItem('montpellier', 'Montpellier');

        $this->assertEquals('montpellier', $item->id);
        $this->assertEquals('Montpellier', $item->title);
        $this->assertEquals('', $item->abstract);
        $this->assertEquals('', $item->keywordList);
        $this->assertEquals('', $item->proj);
        $this->assertEquals('', $item->bbox);
        $this->assertEquals('', $item->url);
        $this->assertEquals('', $item->img);
        $this->assertEquals(0, $item->order);
        $this->assertEquals('', $item->parentId);
        $this->assertEquals('rep', $item->type);
        $this->assertEquals('', $item->wmsGetCapabilitiesUrl);
        $this->assertEquals('', $item->wmtsGetCapabilitiesUrl);
        $this->assertEquals('', $item->wfsGetCapabilitiesUrl);
        $this->assertEquals(array(), $item->childItems);
    }

    public function testConstructAllParameters(): void
    {
        $item = new lizmapMainViewItem(
            'montpellier~events',
            'Events',
            'Abstract',
            'kw1, kw2',
            'EPSG:3857',
            '1, 2, 3, 4',
            'http://localhost/map',
            'http://localhost/img.png',
            3,
            'montpellier',
            'map',
            'http://localhost/wms',
            'http://localhost/wmts',
            'http://localhost/wfs'
        );

        $this->assertEquals('montpellier~events', $item->id);
        $this->assertEquals('Events', $item->title);
        $this->assertEquals('Abstract', $item->abstract);
        $this->assertEquals('kw1, kw2', $item->keywordList);
        $this->assertEquals('EPSG:3857', $item->proj);
        $this->assertEquals('1, 2, 3, 4', $item->bbox);
        $this->assertEquals('http://localhost/map', $item->url);
        $this->assertEquals('http://localhost/img.png', $item->img);
        $this->assertEquals(3, $item->order);
        $this->assertEquals('montpellier', $item->parentId);
        $this->assertEquals('map', $item->type);
        $this->assertEquals('http://localhost/wms', $item->wmsGetCapabilitiesUrl);
        $this->assertEquals('http://localhost/wmts', $item->wmtsGetCapabilitiesUrl);
        $this->assertEquals('http://localhost/wfs', $item->wfsGetCapabilitiesUrl);
    }

    public function testConstructAbstractIsCleaned(): void
    {
        $item = new lizmapMainViewItem(
            'id',
            'title',
            '<p>Hello <b>world</b></p><script>alert("xss")</script>'
        );

        $this->assertStringContainsString('Hello', $item->abstract);
        $this->assertStringContainsString('<b>world</b>', $item->abstract);
        $this->assertStringNotContainsString('<script', $item->abstract);
        $this->assertStringNotContainsString('alert', $item->abstract);
        // the abstract must not be duplicated
        $this->assertEquals(1, substr_count($item->abstract, 'Hello'));

        $item = new lizmapMainViewItem(
            'id',
            'title',
            '<a href="#" onclick="alert(1)">link</a>'
        );
        $this->assertStringContainsString('link', $item->abstract);
        $this->assertStringNotContainsString('onclick', $item->abstract);
        $item = new lizmapMainViewItem(
            'bad closed tag',
            'title',
            '<p onclick="alert(1)">link<strong onfocus="alert(2)">text</strong>'
        );
        $this->assertStringContainsString('link', $item->abstract);
        $this->assertStringContainsString('text', $item->abstract);

        $this->assertStringNotContainsString('onclick', $item->abstract);
        $this->assertStringNotContainsString('onfocus', $item->abstract);
    }

    public function testCopyFrom(): void
    {
        $item = new lizmapMainViewItem('rep1', 'Old title', 'old abstract', 'old', 'EPSG:4326', '0,0,1,1', 'old_url', 'old_img', 1);
        $childKept = new lizmapMainViewItem('rep1~kept', 'Kept', '', '', '', '', '', '', 0, 'rep1', 'map');
        $childReplaced = new lizmapMainViewItem('rep1~map', 'Before', '', '', '', '', '', '', 0, 'rep1', 'map');
        $item->childItems = array($childKept, $childReplaced);

        $source = new lizmapMainViewItem('other', 'New title', 'new abstract', 'new', 'EPSG:3857', '2,2,3,3', 'new_url', 'new_img', 5, 'parent', 'map');
        $newChild = new lizmapMainViewItem('rep1~map', 'After', '', '', '', '', '', '', 0, 'rep1', 'map');
        $addedChild = new lizmapMainViewItem('rep1~added', 'Added', '', '', '', '', '', '', 0, 'rep1', 'map');
        $source->childItems = array($newChild, $addedChild);

        $item->copyFrom($source);

        // copied properties
        $this->assertEquals('New title', $item->title);
        $this->assertEquals('new abstract', $item->abstract);
        $this->assertEquals('new', $item->keywordList);
        $this->assertEquals('EPSG:3857', $item->proj);
        $this->assertEquals('2,2,3,3', $item->bbox);
        $this->assertEquals('new_url', $item->url);
        $this->assertEquals('new_img', $item->img);
        $this->assertEquals(5, $item->order);

        // not copied properties
        $this->assertEquals('rep1', $item->id);
        $this->assertEquals('', $item->parentId);
        $this->assertEquals('rep', $item->type);

        // children: kept, replaced in place, added at the end
        $this->assertCount(3, $item->childItems);
        $this->assertSame($childKept, $item->childItems[0]);
        $this->assertSame($newChild, $item->childItems[1]);
        $this->assertEquals('After', $item->childItems[1]->title);
        $this->assertSame($addedChild, $item->childItems[2]);
    }

    public function testCopyFromWithoutChildren(): void
    {
        $item = new lizmapMainViewItem('rep1', 'Title');
        $child = new lizmapMainViewItem('rep1~map', 'Map', '', '', '', '', '', '', 0, 'rep1', 'map');
        $item->childItems = array($child);

        $item->copyFrom(new lizmapMainViewItem('rep2', 'Other'));

        $this->assertEquals('Other', $item->title);
        $this->assertCount(1, $item->childItems);
        $this->assertSame($child, $item->childItems[0]);
    }

    public function testMainViewItemSortByType(): void
    {
        $rep = new lizmapMainViewItem('b', 'Rep', '', '', '', '', '', '', 10, '', 'rep');
        $map = new lizmapMainViewItem('a', 'Map', '', '', '', '', '', '', 0, '', 'map');

        // repositories come before maps, whatever order and id
        $this->assertEquals(-1, lizmapMainViewItem::mainViewItemSort($rep, $map));
        $this->assertEquals(1, lizmapMainViewItem::mainViewItemSort($map, $rep));
    }

    public function testMainViewItemSortByOrder(): void
    {
        $first = new lizmapMainViewItem('z', 'First', '', '', '', '', '', '', 1, '', 'map');
        $second = new lizmapMainViewItem('a', 'Second', '', '', '', '', '', '', 4, '', 'map');

        $this->assertLessThan(0, lizmapMainViewItem::mainViewItemSort($first, $second));
        $this->assertGreaterThan(0, lizmapMainViewItem::mainViewItemSort($second, $first));
    }

    public function testMainViewItemSortByIdWhenSameOrder(): void
    {
        $a = new lizmapMainViewItem('a', 'A', '', '', '', '', '', '', 2, '', 'rep');
        $b = new lizmapMainViewItem('b', 'B', '', '', '', '', '', '', 2, '', 'rep');
        $a2 = new lizmapMainViewItem('a', 'A bis', '', '', '', '', '', '', 2, '', 'rep');

        $this->assertLessThan(0, lizmapMainViewItem::mainViewItemSort($a, $b));
        $this->assertGreaterThan(0, lizmapMainViewItem::mainViewItemSort($b, $a));
        $this->assertEquals(0, lizmapMainViewItem::mainViewItemSort($a, $a2));
    }

    public function testUsortMainViewItems(): void
    {
        $items = array(
            new lizmapMainViewItem('map2', 'Map 2', '', '', '', '', '', '', 2, '', 'map'),
            new lizmapMainViewItem('rep2', 'Rep 2', '', '', '', '', '', '', 1, '', 'rep'),
            new lizmapMainViewItem('map1', 'Map 1', '', '', '', '', '', '', 1, '', 'map'),
            new lizmapMainViewItem('rep1', 'Rep 1', '', '', '', '', '', '', 1, '', 'rep'),
            new lizmapMainViewItem('rep0', 'Rep 0', '', '', '', '', '', '', 0, '', 'rep'),
        );

        usort($items, 'lizmapMainViewItem::mainViewItemSort');

        $this->assertEquals(
            array('rep0', 'rep1', 'rep2', 'map1', 'map2'),
            array_map(function ($i) {
                return $i->id;
            }, $items)
        );
    }
}
