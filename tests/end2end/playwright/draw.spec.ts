import { test, expect } from '@playwright/test';

test.describe('Draw', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=draw';
        await page.goto(url, { waitUntil: 'networkidle' });

        await page.locator('#button-draw').click();
    });

    test('All draw tools', async ({ page }) => {
        // Point
        await page.locator('#draw').getByRole('link').nth(1).click();
        await page.locator('.digitizing-point > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 200,
                y: 50
            }
        });

        // Linestring
        await page.locator('#draw').getByRole('link').nth(1).click();
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
        await page.locator('#draw').getByRole('link').nth(1).click();
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
        await page.locator('#draw').getByRole('link').nth(1).click();
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
        await page.locator('#draw').getByRole('link').nth(1).click();
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
        await page.$eval("#map, #map *", el => el.style.visibility = 'visible');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        expect(await page.locator('#map').screenshot()).toMatchSnapshot('draw-all-tools.png');
    });

    test('Edition', async ({ page }) => {
        // Polygon
        await page.locator('#draw').getByRole('link').nth(1).click();
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
        await page.locator('#draw').getByRole('link').nth(1).click();
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
            (<HTMLInputElement> input).value = '#000'; // Cast input to HTMLInputElement for TypeScript
            var event = new Event('input', {
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

        await page.locator('.digitizing-save').click();

        // Get the JSON has been stored
        const json_stored = await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'));

        // Clear local storage
        await page.evaluate(() => localStorage.removeItem('testsrepository_draw_draw_drawLayer'));
        expect(await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'))).toBeNull;

        // Check the JSON
        await expect(json_stored).toEqual('[{"type":"Polygon","color":"#000000","coords":[[[764321.0416656,6290805.935670358],[767628.3399468632,6290805.935670358],[767628.3399468632,6295105.423436],[764321.0416656,6295105.423436],[764321.0416656,6290805.935670358],[764321.0416656,6290805.935670358]]]}]');

        // Hide all elements but #map, #newOlMap and their children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#map, #map *", el => el.style.visibility = 'visible');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        expect(await page.locator('#map').screenshot()).toMatchSnapshot('draw-edition.png');
    });

    test('WKT found in local storage', async ({ page }) => {
        // Save WKT to the old local storage
        const wkt = 'POINT(770737.2003016905 6279832.319974077)';
        await page.evaluate(token => localStorage.setItem('testsrepository_draw_drawLayer', token), wkt);
        const old_stored = await page.evaluate(() => localStorage.getItem('testsrepository_draw_drawLayer'));
        await expect(old_stored).toEqual(wkt);

        // Reload
        await page.reload({ waitUntil: 'networkidle' });

        // No error
        await expect(page.locator('p.error-msg')).toHaveCount(0);
        await expect(page.locator('#switcher lizmap-treeview ul li')).not.toHaveCount(0);

        // The WKT has been drawn
        const drawn = await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn[0].getGeometry().getCoordinates())
        await expect(drawn).toEqual([770737.2003016905, 6279832.319974077]);

        // The WKT has been moved to the new storage
        const new_stored = await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'));
        await expect(new_stored).toEqual(wkt);
        expect(await page.evaluate(() => localStorage.getItem('testsrepository_draw_drawLayer'))).toBeNull;

        // Save to local storage
        await page.locator('#button-draw').click();
        await page.locator('.digitizing-save').click();

        // Ths JSON has been stored
        const json_stored = await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'));
        await expect(json_stored).toEqual('[{"type":"Point","color":"#ff0000","coords":[770737.2003016905,6279832.319974077]}]');

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
        await page.reload({ waitUntil: 'networkidle' });

        // No error
        await expect(page.locator('p.error-msg')).toHaveCount(0);
        await expect(page.locator('#switcher lizmap-treeview ul li')).not.toHaveCount(0);

        // Not well formed data has been removed
        expect(await page.evaluate(() => localStorage.getItem('testsrepository_draw_drawLayer'))).toBeNull;
        expect(await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'))).toBeNull;
        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toBeNull;
    });
});
