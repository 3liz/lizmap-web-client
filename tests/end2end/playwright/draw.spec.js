// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap, reloadMap } from './globals';

test.describe('Draw', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=draw';
        await gotoMap(url, page);

        await page.locator('#button-draw').click();
    });

    test('All draw tools', async ({ page }) => {
        await page.locator('#dock-close').click();
        // Point
        await page.locator('#draw button.dropdown-toggle:nth-child(2)').click();
        await page.locator('.digitizing-point > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 200,
                y: 50
            }
        });

        // Linestring
        await page.locator('#draw button.dropdown-toggle:nth-child(2)').click();
        await page.locator('.digitizing-line > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 230,
                y: 50
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 280,
                y: 50
            }
        });

        await page.locator('#newOlMap').dblclick({
            position: {
                x: 280,
                y: 115
            }
        });

        // Polygon
        await page.locator('#draw button.dropdown-toggle:nth-child(2)').click();
        await page.locator('.digitizing-polygon > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 290,
                y: 50
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 330,
                y: 50
            }
        });

        await page.locator('#newOlMap').dblclick({
            position: {
                x: 330,
                y: 115
            }
        });

        // Box
        await page.locator('#draw button.dropdown-toggle:nth-child(2)').click();
        await page.locator('.digitizing-box > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 340,
                y: 50
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 390,
                y: 115
            }
        });

        // Circle
        await page.locator('#draw button.dropdown-toggle:nth-child(2)').click();
        await page.locator('.digitizing-circle > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 450,
                y: 75
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 480,
                y: 115
            }
        });

        // Hide all elements but #map, #newOlMap and their children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        expect(await page.locator('#newOlMap').screenshot()).toMatchSnapshot('draw-all-tools.png');
    });

    test('Edition', async ({ page }) => {
        // Polygon
        await page.locator('#draw button.dropdown-toggle:nth-child(2)').click();
        await page.locator('.digitizing-polygon > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 290,
                y: 50
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 330,
                y: 50
            }
        });

        await page.locator('#newOlMap').dblclick({
            position: {
                x: 330,
                y: 115
            }
        });

        // Box
        await page.locator('#draw button.dropdown-toggle:nth-child(2)').click();
        await page.locator('.digitizing-box > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 340,
                y: 50
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 390,
                y: 115
            }
        });

        // Edition
        await page.locator('.digitizing-edit').click();

        await page.locator('#newOlMap').click({
            position: {
                x: 370,
                y: 100
            }
        });

        await page.waitForTimeout(300);

        // Change color
        await page.locator('input[type="color"]').evaluate(input => {
            input.value = '#000'; // Cast input to HTMLInputElement for TypeScript
            let event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });

            input.dispatchEvent(event);
        });

        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(2);

        // Delete polygon
        await page.locator('.digitizing-erase').click();

        page.on('dialog', dialog => dialog.accept());

        await page.locator('#newOlMap').click({
            position: {
                x: 315,
                y: 60
            }
        });

        await page.waitForTimeout(300);

        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(1);
        const drawn = await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn[0].getGeometry().getCoordinates())
        await expect(drawn).toHaveLength(1);
        await expect(drawn[0]).toHaveLength(6);
        await expect(drawn[0][0]).toHaveLength(2);
        await expect(drawn[0][0][0]).toBeGreaterThan(764321.0416);
        await expect(drawn[0][0][1]).toBeGreaterThan(6290805.9356);
        await expect(drawn[0][1]).toHaveLength(2);
        await expect(drawn[0][2]).toHaveLength(2);
        await expect(drawn[0][2][0]).toBeGreaterThan(767628.3399);
        await expect(drawn[0][2][1]).toBeGreaterThan(6295105.4234);
        await expect(drawn[0][3]).toHaveLength(2);
        await expect(drawn[0][4]).toHaveLength(2);
        await expect(drawn[0][5]).toHaveLength(2);

        await page.locator('.digitizing-save').click();

        // Get the JSON has been stored
        const json_stored = await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'));

        // Clear local storage
        await page.evaluate(() => localStorage.removeItem('testsrepository_draw_draw_drawLayer'));
        expect(await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'))).toBeNull;

        // Check the JSON
        // '[{"type":"Polygon","color":"#000000","coords":[[[764321.0416656,6290805.935670358],[767628.3399468632,6290805.935670358],[767628.3399468632,6295105.423436],[764321.0416656,6295105.423436],[764321.0416656,6290805.935670358],[764321.0416656,6290805.935670358]]]}]'
        await expect(json_stored).toContain('Polygon');
        await expect(json_stored).not.toContain('Point');
        await expect(json_stored).not.toContain('LineString');
        await expect(json_stored).toContain('#000000');
        await expect(json_stored).not.toContain('#ff0000');
        await expect(json_stored).not.toContain('#00ff00');
        await expect(json_stored).not.toContain('#0000ff');
        await expect(json_stored).not.toContain('#ffffff');
        await expect(json_stored).toMatch(/764321.0416\d+/);
        await expect(json_stored).toMatch(/6290805.9356\d+/);
        await expect(json_stored).toMatch(/767628.3399\d+/);
        await expect(json_stored).toMatch(/6295105.4234\d+/);

        // Hide all elements but #map, #newOlMap and their children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        expect(await page.locator('#newOlMap').screenshot()).toMatchSnapshot('draw-edition.png');
    });

    test('Erase all', async ({ page }) => {
        // Polygon
        await page.getByRole('button', { name: 'Toggle Dropdown' }).click();
        await page.locator('.digitizing-polygon > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 290,
                y: 50
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 330,
                y: 50
            }
        });

        await page.locator('#newOlMap').dblclick({
            position: {
                x: 330,
                y: 115
            }
        });

        // Box
        await page.getByRole('button', { name: 'Toggle Dropdown' }).click();
        await page.locator('.digitizing-box > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 340,
                y: 50
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 390,
                y: 115
            }
        });

        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(2);

        page.on('dialog', dialog => dialog.accept());
        await page.locator('.digitizing-all').click();

        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toBeNull();
    });

    test('Circular geometry measure', async ({ page }) => {
        await page.locator('#draw button.dropdown-toggle:nth-child(2)').click();
        await page.locator('.digitizing-circle > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 450,
                y: 75
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 480,
                y: 115
            }
        });
        await page.locator('#draw button.digitizing-toggle-measure').click();
        await expect(page.locator('.ol-tooltip.ol-tooltip-static')).toBeVisible();
        await expect(page.locator('.ol-tooltip.ol-tooltip-static')).toHaveText('3.3 km34.27 km2');
    })

    test('From local storage', async ({ page }) => {
        const the_json = '[{"type":"Polygon","color":"#000000","coords":[[[764321.0416656,6290805.935670358],[767628.3399468632,6290805.935670358],[767628.3399468632,6295105.423436],[764321.0416656,6295105.423436],[764321.0416656,6290805.935670358],[764321.0416656,6290805.935670358]]]}]';
        await page.evaluate(token => localStorage.setItem('testsrepository_draw_draw_drawLayer', token), the_json);
        const json_stored = await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'));
        await expect(json_stored).toEqual(the_json);

        // Reload
        await reloadMap(page);
        // Display
        await page.locator('#button-draw').click();
        await expect(page.locator('.digitizing-save')).toHaveClass(/active/);

        // Clear local storage
        await page.locator('.digitizing-save').click();
        expect(await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'))).toBeNull;

        // Check the geometry has been drawn
        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(1);
        const drawn = await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn[0].getGeometry().getCoordinates())
        await expect(drawn).toHaveLength(1);
        await expect(drawn[0]).toHaveLength(6);
        await expect(drawn[0][0]).toHaveLength(2);
        await expect(drawn[0][0][0]).toBeGreaterThan(764321.0416);
        await expect(drawn[0][0][1]).toBeGreaterThan(6290805.9356);
        await expect(drawn[0][1]).toHaveLength(2);
        await expect(drawn[0][2]).toHaveLength(2);
        await expect(drawn[0][2][0]).toBeGreaterThan(767628.3399);
        await expect(drawn[0][2][1]).toBeGreaterThan(6295105.4234);
        await expect(drawn[0][3]).toHaveLength(2);
        await expect(drawn[0][4]).toHaveLength(2);
        await expect(drawn[0][5]).toHaveLength(2);

        // check measure initialization
        await page.locator('#draw button.digitizing-toggle-measure').click();
        await expect(page.locator('.ol-tooltip.ol-tooltip-static')).toBeVisible();
        await expect(page.locator('.ol-tooltip.ol-tooltip-static')).toHaveText('15.2 km14.19 km2');
        // hide measure
        await page.locator('#draw button.digitizing-toggle-measure').click();

        // Hide all elements but #map, #newOlMap and their children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        // Check rendering
        expect(await page.locator('#newOlMap').screenshot()).toMatchSnapshot('draw-edition.png');
    });

    test('WKT found in local storage', async ({ page }) => {
        // Save WKT to the old local storage
        const wkt = 'POINT(770737.2003016905 6279832.319974077)';
        await page.evaluate(token => localStorage.setItem('testsrepository_draw_drawLayer', token), wkt);
        const old_stored = await page.evaluate(() => localStorage.getItem('testsrepository_draw_drawLayer'));
        await expect(old_stored).toEqual(wkt);

        // Reload
        await reloadMap(page);

        // The WKT has been drawn
        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(1);
        const drawn = await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn[0].getGeometry().getCoordinates())
        await expect(drawn).toHaveLength(2);
        await expect(drawn[0]).toBeGreaterThan(770737.2003);
        await expect(drawn[1]).toBeGreaterThan(6279832.3199);

        // The WKT has been moved to the new storage
        const new_stored = await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'));
        await expect(new_stored).not.toBeNull();
        await expect(new_stored).not.toEqual(wkt);
        expect(await page.evaluate(() => localStorage.getItem('testsrepository_draw_drawLayer'))).toBeNull;

        // Save to local storage
        await page.locator('#button-draw').click();
        await expect(page.locator('.digitizing-save')).toHaveClass(/active/);

        // The JSON has been stored
        const json_stored = await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'));
        await expect(new_stored).toEqual(json_stored);
        // '[{"type":"Point","color":"#ff0000","coords":[770737.2003016905,6279832.319974077]}]'
        await expect(json_stored).toContain('Point');
        await expect(json_stored).not.toContain('LineString');
        await expect(json_stored).not.toContain('Polygon');
        await expect(json_stored).toContain('#ff0000');
        await expect(json_stored).not.toContain('#000000');
        await expect(json_stored).not.toContain('#00ff00');
        await expect(json_stored).not.toContain('#0000ff');
        await expect(json_stored).not.toContain('#ffffff');
        await expect(json_stored).toMatch(/770737.2003\d+/);
        await expect(json_stored).toMatch(/6279832.3199\d+/);

        // Clear local storage
        await page.evaluate(() => localStorage.removeItem('testsrepository_draw_draw_drawLayer'));
        expect(await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'))).toBeNull;
    });

    test('Not well formed data in local storage', async ({ page }) => {
        // Save not well formed data in local storage
        const bad_wkt = 'foobar POINT(770737.2003016905 6279832.319974077)';
        await page.evaluate(token => localStorage.setItem('testsrepository_draw_drawLayer', token), bad_wkt);
        const old_stored = await page.evaluate(() => localStorage.getItem('testsrepository_draw_drawLayer'));
        await expect(old_stored).toEqual(bad_wkt);

        // Reload
        await reloadMap(page);

        // Not well formed data has been removed
        expect(await page.evaluate(() => localStorage.getItem('testsrepository_draw_drawLayer'))).toBeNull;
        expect(await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'))).toBeNull;
        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toBeNull;
    });
});
