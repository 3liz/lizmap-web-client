// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Layer order', () => {

    test('Layer order in map and popups', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=layer_order';
        await gotoMap(url, page);

        // Assert layers order is as defined in QGIS
        expect(await page.evaluate(() => lizMap.mainLizmap.map.getLayerByName('quartiers').getZIndex())).toEqual(0);
        expect(await page.evaluate(() => lizMap.mainLizmap.map.getLayerByName('sousquartiers').getZIndex())).toEqual(1);
        expect(await page.evaluate(() => lizMap.mainLizmap.map.getLayerByName('tramway_lines').getZIndex())).toEqual(2);
        expect(await page.evaluate(() => lizMap.mainLizmap.map.getLayerByName('tramway_stops').getZIndex())).toEqual(3);

        // Assert popups order is as defined in QGIS
        await page.locator('#newOlMap').click({
            position: {
                x: 428,
                y: 260
            }
        });

        let popups = page.locator(".lizmapPopupSingleFeature");
        await expect(popups).toHaveCount(4);

        await expect(popups.nth(0)).toHaveAttribute("data-layer-id", "tramway_stops_437c64d6_adbb_4018_95d6_1f8f8cd6a81c");
        await expect(popups.nth(1)).toHaveAttribute("data-layer-id", "tramway_lines_684f9541_dd3a_4f2d_9233_89f379413a18");
        await expect(popups.nth(2)).toHaveAttribute("data-layer-id", "sousquartiers_274734f2_9aee_4acd_abaf_ba5692d1fd20");
        await expect(popups.nth(3)).toHaveAttribute("data-layer-id", "quartiers_9226ee56_fa1c_44f8_8447_5be0815dd424");
    });
});
