// @ts-check
import { test, expect } from '@playwright/test';
import { reloadMap } from './globals';
import { DrawPage } from "./pages/drawpage";

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Init draw project page as draw page
 * @param {Page} page The playwright page
 * @returns {Promise<DrawPage>} The draw page
 */
const initDrawProject = async (page) => {
    const drawProject = new DrawPage(page, 'draw');
    // open page
    await drawProject.open();
    // open draw panel
    await drawProject.openDrawPanel();

    return drawProject;
}

test.describe('Draw', () => {

    test('All draw tools', async ({ page }) => {
        const drawProject = await initDrawProject(page);

        // Close left dock
        await drawProject.closeLeftDock();
        // Deactivate
        await expect(await drawProject.selectedToolLocator()).toHaveAttribute('value', 'deactivate');
        // select point to draw
        await drawProject.selectGeometry('point');
        // Point
        await expect(await drawProject.selectedToolLocator()).toHaveAttribute('value', 'point');
        await expect(await drawProject.selectedToolLocator()).toHaveClass(/active/);

        // Draw point
        await drawProject.clickOnMap(200, 50);

        // select line to draw
        await drawProject.selectGeometry('line');
        // LineString
        await expect(await drawProject.selectedToolLocator()).toHaveAttribute('value', 'line');
        await expect(await drawProject.selectedToolLocator()).toHaveClass(/active/);

        // Draw line
        await drawProject.clickOnMap(230, 50);
        await drawProject.clickOnMap(280, 50);
        await drawProject.dblClickOnMap(280, 115);

        // select polygon to draw
        await drawProject.selectGeometry('polygon');
        // Polygon
        await expect(await drawProject.selectedToolLocator()).toHaveAttribute('value', 'polygon');
        await expect(await drawProject.selectedToolLocator()).toHaveClass(/active/);

        // Draw polygon
        await drawProject.clickOnMap(290, 50);
        await drawProject.clickOnMap(330, 50);
        await drawProject.dblClickOnMap(330, 115);

        // select box to draw
        await drawProject.selectGeometry('box');
        // Box
        await expect(await drawProject.selectedToolLocator()).toHaveAttribute('value', 'box');
        await expect(await drawProject.selectedToolLocator()).toHaveClass(/active/);

        // Draw box
        await drawProject.clickOnMap(340, 50);
        await drawProject.clickOnMap(390, 115);

        // select circle to draw
        await drawProject.selectGeometry('circle');
        // Circle
        await expect(await drawProject.selectedToolLocator()).toHaveAttribute('value', 'circle');
        await expect(await drawProject.selectedToolLocator()).toHaveClass(/active/);

        // Draw circle
        await drawProject.clickOnMap(450, 75);
        await drawProject.clickOnMap(480, 115);

        // Hide all elements but #map, #newOlMap and their children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        expect(await drawProject.map.screenshot()).toMatchSnapshot('draw-all-tools.png');
    });

    test('Edition', async ({ page }) => {
        const drawProject = await initDrawProject(page);

        // Deactivate
        await expect(await drawProject.selectedToolLocator()).toHaveAttribute('value', 'deactivate');
        await expect(await drawProject.selectedToolLocator()).not.toHaveClass(/active/);
        // select polygon to draw
        await drawProject.selectGeometry('polygon');
        // Polygon
        await expect(await drawProject.selectedToolLocator()).toHaveAttribute('value', 'polygon');
        await expect(await drawProject.selectedToolLocator()).toHaveClass(/active/);

        // Draw polygon
        await drawProject.clickOnMap(290, 50);
        await drawProject.clickOnMap(330, 50);
        await drawProject.dblClickOnMap(330, 115);

        // select box to draw
        await drawProject.selectGeometry('box');
        // Box
        await expect(await drawProject.selectedToolLocator()).toHaveAttribute('value', 'box');
        await expect(await drawProject.selectedToolLocator()).toHaveClass(/active/);

        // Draw box
        await drawProject.clickOnMap(340, 50);
        await drawProject.clickOnMap(390, 115);

        // Edition
        await expect(await drawProject.editLocator()).not.toHaveClass(/active/);
        await drawProject.toggleEdit();
        await expect(await drawProject.editLocator()).toHaveClass(/active/);
        await expect(await drawProject.selectedToolLocator()).not.toHaveClass(/active/);
        await drawProject.clickOnMap(370, 100);

        await page.waitForTimeout(300);

        // Change color
        await expect(await drawProject.inputColorLocator()).toHaveValue('#ff0000');
        await drawProject.setInputColorValue('#000000');
        await expect(await drawProject.inputColorLocator()).toHaveValue('#000000');

        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(2);

        // Activate erase tool
        await expect(await drawProject.eraseLocator()).not.toHaveClass(/active/);
        await drawProject.toggleErase();
        await expect(await drawProject.eraseLocator()).toHaveClass(/active/);
        await expect(await drawProject.editLocator()).not.toHaveClass(/active/);

        // Delete polygon
        page.on('dialog', dialog => dialog.accept());
        await drawProject.clickOnMap(315, 60);
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

        // Save drawn features
        await expect(await drawProject.saveLocator()).not.toHaveClass(/active/);
        await drawProject.toggleSave();
        await expect(await drawProject.saveLocator()).toHaveClass(/active/);
        // Erase tool is still active
        await expect(await drawProject.eraseLocator()).toHaveClass(/active/);

        // Get the JSON has been stored
        const json_stored = await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'));

        // Clear local storage
        await page.evaluate(() => localStorage.removeItem('testsrepository_draw_draw_drawLayer'));
        expect(await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'))).toBeNull;

        // Check the JSON
        // [
        //     {
        //         "type": "Polygon",
        //         "color": "#000000",
        //         "coords": [
        //             [
        //                 [
        //                     764321.0416656,
        //                     6290805.935670358
        //                 ],
        //                 [
        //                     767628.3399468632,
        //                     6290805.935670358
        //                 ],
        //                 [
        //                     767628.3399468632,
        //                     6295105.423436
        //                 ],
        //                 [
        //                     764321.0416656,
        //                     6295105.423436
        //                 ],
        //                 [
        //                     764321.0416656,
        //                     6290805.935670358
        //                 ],
        //                 [
        //                     764321.0416656,
        //                     6290805.935670358
        //                 ]
        //             ]
        //         ]
        //     }
        // ]
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

        expect(await drawProject.map.screenshot()).toMatchSnapshot('draw-edition.png');
    });

    test('Erase all', async ({ page }) => {
        const drawProject = await initDrawProject(page);

        // select polygon to draw
        await drawProject.selectGeometry('polygon');
        // Polygon
        await expect(await drawProject.selectedToolLocator()).toHaveAttribute('value', 'polygon');
        await expect(await drawProject.selectedToolLocator()).toHaveClass(/active/);

        // Draw polygon
        await drawProject.clickOnMap(290, 50);
        await drawProject.clickOnMap(330, 50);
        await drawProject.dblClickOnMap(330, 115);

        // select box to draw
        await drawProject.selectGeometry('box');
        // Box
        await expect(await drawProject.selectedToolLocator()).toHaveAttribute('value', 'box');
        await expect(await drawProject.selectedToolLocator()).toHaveClass(/active/);

        // Draw box
        await drawProject.clickOnMap(340, 50);
        await drawProject.clickOnMap(390, 115);

        expect(
            await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)
        ).toHaveLength(2);

        await drawProject.deleteAllDrawings();

        expect(
            await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)
        ).toBeNull();
    });

    test('Circular geometry measure', async ({ page }) => {
        const drawProject = await initDrawProject(page);

        // select circle to draw
        await drawProject.selectGeometry('circle');
        // Circle
        await expect(await drawProject.selectedToolLocator()).toHaveAttribute('value', 'circle');
        await expect(await drawProject.selectedToolLocator()).toHaveClass(/active/);

        // Draw circle
        await drawProject.clickOnMap(450, 75);
        await drawProject.clickOnMap(480, 115);

        // Toggle measure
        await expect(await drawProject.measureLocator()).not.toHaveClass(/active/);
        await drawProject.toggleMeasure();
        await expect(await drawProject.measureLocator()).toHaveClass(/active/);
        // Draw is still active
        await expect(await drawProject.selectedToolLocator()).toHaveClass(/active/);

        // Check measure display
        await expect(page.locator('.ol-tooltip.ol-tooltip-static')).toBeVisible();
        await expect(page.locator('.ol-tooltip.ol-tooltip-static')).toHaveText('3.3 km34.27 km2');
    });

    test('From local storage', async ({ page }) => {
        const drawProject = await initDrawProject(page);

        // eslint-disable-next-line @stylistic/js/max-len
        const the_json = '[{"type":"Polygon","color":"#000000","coords":[[[764321.0416656,6290805.935670358],[767628.3399468632,6290805.935670358],[767628.3399468632,6295105.423436],[764321.0416656,6295105.423436],[764321.0416656,6290805.935670358],[764321.0416656,6290805.935670358]]]}]';
        await page.evaluate(token => localStorage.setItem('testsrepository_draw_draw_drawLayer', token), the_json);
        const json_stored = await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'));
        await expect(json_stored).toEqual(the_json);

        // Reload
        await reloadMap(page);
        // Display
        await drawProject.openDrawPanel();
        await expect(await drawProject.saveLocator()).toHaveClass(/active/);

        // Clear local storage
        await drawProject.toggleSave();
        await expect(await drawProject.saveLocator()).not.toHaveClass(/active/);
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
        await expect(await drawProject.measureLocator()).not.toHaveClass(/active/);
        await drawProject.toggleMeasure();
        await expect(await drawProject.measureLocator()).toHaveClass(/active/);

        // Check measure display
        await expect(page.locator('.ol-tooltip.ol-tooltip-static')).toBeVisible();
        await expect(page.locator('.ol-tooltip.ol-tooltip-static')).toHaveText('15.2 km14.19 km2');

        // hide measure
        await drawProject.toggleMeasure();
        await expect(await drawProject.measureLocator()).not.toHaveClass(/active/);

        // Hide all elements but #map, #newOlMap and their children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        // Check rendering
        expect(await drawProject.map.screenshot()).toMatchSnapshot('draw-edition.png');
    });

    test('WKT found in local storage', async ({ page }) => {
        const drawProject = await initDrawProject(page);

        // Clear local storage
        await page.evaluate(() => localStorage.removeItem('testsrepository_draw_drawLayer'));
        expect(await page.evaluate(() => localStorage.getItem('testsrepository_draw_drawLayer'))).toBeNull;
        await page.evaluate(() => localStorage.removeItem('testsrepository_draw_draw_drawLayer'));
        expect(await page.evaluate(() => localStorage.getItem('testsrepository_draw_draw_drawLayer'))).toBeNull;

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
        await drawProject.openDrawPanel();
        await expect(await drawProject.saveLocator()).toHaveClass(/active/);

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
        await initDrawProject(page);

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

test.describe('Measure',
    {
        tag: ['@readonly'],
    },
    () => {

        test('Length and angle constraints', async ({ page }) => {
            const drawProject = await initDrawProject(page);

            // select geometry to draw
            await drawProject.selectGeometry('line');
            // toggleMeasure
            await drawProject.toggleMeasure();
            // set constraint
            await drawProject.setMeasureConstraint('distance','1500');

            // draw a single fixed length line
            await drawProject.clickOnMap(450,75);
            await drawProject.dblClickOnMap(480,115);

            // check final length measure
            await(expect(drawProject.mapAnnotationToolTipStatic)).toBeVisible();
            await(expect(drawProject.mapAnnotationToolTipStatic)).toHaveText('1.5 km');

            // delete drawings
            await drawProject.deleteAllDrawings();

            // draw a linestring composed by two segment of length 1500 m each
            await drawProject.clickOnMap(395,246);
            await drawProject.clickOnMap(423,263);
            await drawProject.dblClickOnMap(418,305);

            // check final length measure
            await(expect(drawProject.mapAnnotationToolTipStatic)).toBeVisible();
            await(expect(drawProject.mapAnnotationToolTipStatic)).toHaveText('3 km');

            // delete drawings
            await drawProject.deleteAllDrawings();

            // add angle constraint
            await drawProject.setMeasureConstraint('angle','37');
            // draw a feature without finalize it
            await drawProject.clickOnMap(395,246);
            await drawProject.clickOnMap(423,263);

            // check measure tooltips before finalize. The first should contains degrees info
            await expect(drawProject.mapAnnotationToolTipMeasure.nth(0)).toHaveText('1.5 km37°');
            await expect(drawProject.mapAnnotationToolTipMeasure.nth(1)).toHaveText('3 km');

            // finalize draw
            await drawProject.dblClickOnMap(418,305);

            // check final length measure
            await(expect(drawProject.mapAnnotationToolTipStatic)).toBeVisible();
            await(expect(drawProject.mapAnnotationToolTipStatic)).toHaveText('3 km');
        });
    });


test.describe('Draw text tools', () => {

    test('Point', async ({ page }) => {
        const drawProject = await initDrawProject(page);

        // Deactivate
        await expect(await drawProject.selectedToolLocator()).toHaveAttribute('value', 'deactivate');
        // select geometry to draw
        await drawProject.selectGeometry('point');
        // Point
        await expect(await drawProject.selectedToolLocator()).toHaveAttribute('value', 'point');
        await expect(await drawProject.selectedToolLocator()).toHaveClass(/active/);

        // Draw point
        await drawProject.clickOnMap(300, 150);

        // Toggle edit, one geometry is available, the text tools are visible
        await drawProject.toggleEdit();
        await expect(await drawProject.textContentLocator()).toBeVisible();
        await expect(await drawProject.textRotationLocator()).toBeVisible();
        await expect(await drawProject.textScaleLocator()).toBeVisible();

        // Check text content
        await expect(await drawProject.textContentLocator()).toHaveValue('');
        await drawProject.setTextContentValue('test');
        await expect(await drawProject.textContentLocator()).toHaveValue('test');

        // Check text rotation
        await expect(await drawProject.textRotationLocator()).toHaveValue('');
        await drawProject.setTextRotationValue('45');
        await expect(await drawProject.textRotationLocator()).toHaveValue('45');

        // Check text scale
        await expect(await drawProject.textScaleLocator()).toHaveValue('1');
        await drawProject.setTextScaleValue('2');
        await expect(await drawProject.textScaleLocator()).toHaveValue('2');

        // Toggle point
        await expect(await drawProject.selectedToolLocator()).toHaveAttribute('value', 'point');
        await expect(await drawProject.selectedToolLocator()).not.toHaveClass(/active/);
        await drawProject.toggleSelectedTool();
        await expect(await drawProject.selectedToolLocator()).toHaveClass(/active/);

        // Draw second point
        await drawProject.clickOnMap(350, 150);

        // Toggle edit, two geometries are available, the text tools are not visible
        await drawProject.toggleEdit();
        await expect(await drawProject.textContentLocator()).not.toBeVisible();
        await expect(await drawProject.textRotationLocator()).not.toBeVisible();
        await expect(await drawProject.textScaleLocator()).not.toBeVisible();

        // Edit second point By clicking on the map
        await page.waitForTimeout(1000);
        await drawProject.clickOnMap(350, 150);
        await expect(await drawProject.textContentLocator()).toBeVisible();
        await expect(await drawProject.textRotationLocator()).toBeVisible();
        await expect(await drawProject.textScaleLocator()).toBeVisible();
        // Check text content
        await expect(await drawProject.textContentLocator()).toHaveValue('');
        // Check text rotation
        await expect(await drawProject.textRotationLocator()).toHaveValue('');
        // Check text scale
        await expect(await drawProject.textScaleLocator()).toHaveValue('1');

        // Edit first point
        await page.waitForTimeout(1000);
        await drawProject.clickOnMap(300, 150);
        await expect(await drawProject.textContentLocator()).toBeVisible();
        await expect(await drawProject.textRotationLocator()).toBeVisible();
        await expect(await drawProject.textScaleLocator()).toBeVisible();
        // Check text content
        await expect(await drawProject.textContentLocator()).toHaveValue('test');
        // Check text rotation
        await expect(await drawProject.textRotationLocator()).toHaveValue('45');
        // Check text scale
        await expect(await drawProject.textScaleLocator()).toHaveValue('2');

        // Erase all
        await drawProject.deleteAllDrawings();
        // close draw panel
        await drawProject.closeDrawPanel();
    });
});
