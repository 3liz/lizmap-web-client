// @ts-check
import { test, expect } from '@playwright/test';
import { reloadMap } from './globals';
import { DrawPage } from "./pages/drawpage";
import { playwrightTestFile, digestBuffer } from "./globals";

// To update screenshots stored in __screenshots__ for toMatchSnapshot test
// IMPORTANT, this must not be set to `true` while committing, on GitHub. Set to `false`.
const UPDATE_SCREENSHOT_FILES = false;

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

        // Wait for feature to be selected by the OL6 Select interaction
        // (singleClick fires after ~250ms double-click guard)
        await page.waitForFunction(() =>
            lizMap.mainLizmap.digitizing.editedFeatures.length === 1
        );

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
        await page.waitForFunction(() =>
            lizMap.mainLizmap.digitizing.featureDrawn === null ||
            lizMap.mainLizmap.digitizing.featureDrawn.length < 2
        );

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
        await drawProject.clickOnMap(350, 150);
        // Wait for Select interaction to pick up the feature
        await page.waitForFunction(() =>
            lizMap.mainLizmap.digitizing.editedFeatures.length === 1
        );
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
        await drawProject.clickOnMap(300, 150);
        // Wait for Select interaction to pick up the feature
        await page.waitForFunction(() =>
            lizMap.mainLizmap.digitizing.editedFeatures.length === 1
        );
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


test.describe('Import file to draw', () => {

    test('KML - multilinestring', async ({ page }) => {
        const drawProject = await initDrawProject(page);
        const geometryType = 'multilinestring';
        const screenshotClip = {x:950/2-380/2, y:900/2-380/2, width:380, height:380};

        // Get blank buffer
        let buffer = await page.screenshot({
            clip: screenshotClip,
            //path: playwrightTestFile('__screenshots__','draw.spec.js','blank.png'),
        });
        const blankHash = await digestBuffer(buffer);
        const blankByteLength = buffer.byteLength;
        expect(blankByteLength).toBeGreaterThan(1000); // 1286
        expect(blankByteLength).toBeLessThan(2500);

        // Start waiting for file chooser before clicking. Note no await.
        const fileChooserPromise = page.waitForEvent('filechooser');
        // Click import file
        drawProject.clickImportFile();

        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(playwrightTestFile('data', `kml_${geometryType}.kml`));

        // Wait for OL rendering
        await page.waitForTimeout(500);

        buffer = await page.screenshot({
            clip: screenshotClip,
            // path: playwrightTestFile('__screenshots__','draw.spec.js','drawn.png'),
        });
        expect(await digestBuffer(buffer)).not.toEqual(blankHash);
        expect(buffer.byteLength).toBeGreaterThan(blankByteLength);

        // The KML has been drawn
        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(4);

        // Hide all elements but #map, #newOlMap and their children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        if (UPDATE_SCREENSHOT_FILES) {
            await drawProject.map.screenshot({path: playwrightTestFile('__screenshots__','draw.spec.js',`draw-kml-${geometryType}.png`)});
        } else {
            expect(await drawProject.map.screenshot()).toMatchSnapshot(
                `draw-kml-${geometryType}.png`,
                {maxDiffPixelRatio: 0.05},
            );
        }
    });

    test('KML - multipoint', async ({ page }) => {
        const drawProject = await initDrawProject(page);
        const geometryType = 'multipoint';
        const screenshotClip = {x:950/2-380/2, y:900/2-380/2, width:380, height:380};

        // Get blank buffer
        let buffer = await page.screenshot({
            clip: screenshotClip,
            //path: playwrightTestFile('__screenshots__','draw.spec.js','blank.png'),
        });
        const blankHash = await digestBuffer(buffer);
        const blankByteLength = buffer.byteLength;
        expect(blankByteLength).toBeGreaterThan(1000); // 1286
        expect(blankByteLength).toBeLessThan(2500);

        // Start waiting for file chooser before clicking. Note no await.
        const fileChooserPromise = page.waitForEvent('filechooser');
        // Click import file
        drawProject.clickImportFile();

        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(playwrightTestFile('data', `kml_${geometryType}.kml`));

        // Wait for OL rendering
        await page.waitForTimeout(500);

        buffer = await page.screenshot({
            clip: screenshotClip,
            // path: playwrightTestFile('__screenshots__','draw.spec.js','drawn.png'),
        });
        expect(await digestBuffer(buffer)).not.toEqual(blankHash);
        expect(buffer.byteLength).toBeGreaterThan(blankByteLength);

        // The KML has been drawn
        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(2);

        // Hide all elements but #map, #newOlMap and their children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        if (UPDATE_SCREENSHOT_FILES) {
            await drawProject.map.screenshot({path: playwrightTestFile('__screenshots__','draw.spec.js',`draw-kml-${geometryType}.png`)});
        } else {
            expect(await drawProject.map.screenshot()).toMatchSnapshot(
                `draw-kml-${geometryType}.png`,
                {maxDiffPixelRatio: 0.05},
            );
        }
    });

    test('KML - multipolygon', async ({ page }) => {
        const drawProject = await initDrawProject(page);
        const geometryType = 'multipolygon';
        const screenshotClip = {x:950/2-380/2, y:900/2-380/2, width:380, height:380};

        // Get blank buffer
        let buffer = await page.screenshot({
            clip: screenshotClip,
            //path: playwrightTestFile('__screenshots__','draw.spec.js','blank.png'),
        });
        const blankHash = await digestBuffer(buffer);
        const blankByteLength = buffer.byteLength;
        expect(blankByteLength).toBeGreaterThan(1000); // 1286
        expect(blankByteLength).toBeLessThan(2500);

        // Start waiting for file chooser before clicking. Note no await.
        const fileChooserPromise = page.waitForEvent('filechooser');
        // Click import file
        drawProject.clickImportFile();

        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(playwrightTestFile('data', `kml_${geometryType}.kml`));

        // Wait for OL rendering
        await page.waitForTimeout(500);

        buffer = await page.screenshot({
            clip: screenshotClip,
            // path: playwrightTestFile('__screenshots__','draw.spec.js','drawn.png'),
        });
        expect(await digestBuffer(buffer)).not.toEqual(blankHash);
        expect(buffer.byteLength).toBeGreaterThan(blankByteLength);

        // The KML has been drawn
        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(2);

        // Hide all elements but #map, #newOlMap and their children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        if (UPDATE_SCREENSHOT_FILES) {
            await drawProject.map.screenshot({path: playwrightTestFile('__screenshots__','draw.spec.js',`draw-kml-${geometryType}.png`)});
        } else {
            expect(await drawProject.map.screenshot()).toMatchSnapshot(
                `draw-kml-${geometryType}.png`,
                {maxDiffPixelRatio: 0.05},
            );
        }
    });

    test('KML - polygon', async ({ page }) => {
        const drawProject = await initDrawProject(page);
        const geometryType = 'polygon';
        const screenshotClip = {x:950/2-380/2, y:900/2-380/2, width:380, height:380};

        // Get blank buffer
        let buffer = await page.screenshot({
            clip: screenshotClip,
            //path: playwrightTestFile('__screenshots__','draw.spec.js','blank.png'),
        });
        const blankHash = await digestBuffer(buffer);
        const blankByteLength = buffer.byteLength;
        expect(blankByteLength).toBeGreaterThan(1000); // 1286
        expect(blankByteLength).toBeLessThan(2500);

        // Start waiting for file chooser before clicking. Note no await.
        const fileChooserPromise = page.waitForEvent('filechooser');
        // Click import file
        drawProject.clickImportFile();

        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(playwrightTestFile('data', `kml_${geometryType}.kml`));

        // Wait for OL rendering
        await page.waitForTimeout(500);

        buffer = await page.screenshot({
            clip: screenshotClip,
            // path: playwrightTestFile('__screenshots__','draw.spec.js','drawn.png'),
        });
        expect(await digestBuffer(buffer)).not.toEqual(blankHash);
        expect(buffer.byteLength).toBeGreaterThan(blankByteLength);

        // The KML has been drawn
        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(1);

        // Hide all elements but #map, #newOlMap and their children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        if (UPDATE_SCREENSHOT_FILES) {
            await drawProject.map.screenshot({path: playwrightTestFile('__screenshots__','draw.spec.js',`draw-kml-${geometryType}.png`)});
        } else {
            expect(await drawProject.map.screenshot()).toMatchSnapshot(
                `draw-kml-${geometryType}.png`,
                {maxDiffPixelRatio: 0.05},
            );
        }
    });

    test('KML - point - with xml header', async ({ page }) => {
        const drawProject = await initDrawProject(page);
        const fileName = 'with_xml_header';
        const screenshotClip = {x:950/2-380/2, y:900/2-380/2, width:380, height:380};

        // Get blank buffer
        let buffer = await page.screenshot({
            clip: screenshotClip,
            //path: playwrightTestFile('__screenshots__','draw.spec.js','blank.png'),
        });
        const blankHash = await digestBuffer(buffer);
        const blankByteLength = buffer.byteLength;
        expect(blankByteLength).toBeGreaterThan(1000); // 1286
        expect(blankByteLength).toBeLessThan(2500);

        // Start waiting for file chooser before clicking. Note no await.
        const fileChooserPromise = page.waitForEvent('filechooser');
        // Click import file
        drawProject.clickImportFile();

        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(playwrightTestFile('data', `kml_${fileName}.kml`));

        // Wait for OL rendering
        await page.waitForTimeout(500);

        buffer = await page.screenshot({
            clip: screenshotClip,
            // path: playwrightTestFile('__screenshots__','draw.spec.js','drawn.png'),
        });
        expect(await digestBuffer(buffer)).not.toEqual(blankHash);
        expect(buffer.byteLength).toBeGreaterThan(blankByteLength);

        // The KML has been drawn
        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(1);

        // Hide all elements but #map, #newOlMap and their children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        if (UPDATE_SCREENSHOT_FILES) {
            await drawProject.map.screenshot({
                path: playwrightTestFile('__screenshots__','draw.spec.js',`draw-kml-${fileName.replaceAll('_','-')}.png`)
            });
        } else {
            expect(await drawProject.map.screenshot()).toMatchSnapshot(
                `draw-kml-${fileName.replaceAll('_','-')}.png`,
                {maxDiffPixelRatio: 0.05},
            );
        }
    });

    test('KML - point - without xml header', async ({ page }) => {
        const drawProject = await initDrawProject(page);
        const fileName = 'without_xml_header';
        const screenshotClip = {x:950/2-380/2, y:900/2-380/2, width:380, height:380};

        // Get blank buffer
        let buffer = await page.screenshot({
            clip: screenshotClip,
            //path: playwrightTestFile('__screenshots__','draw.spec.js','blank.png'),
        });
        const blankHash = await digestBuffer(buffer);
        const blankByteLength = buffer.byteLength;
        expect(blankByteLength).toBeGreaterThan(1000); // 1286
        expect(blankByteLength).toBeLessThan(2500);

        // Start waiting for file chooser before clicking. Note no await.
        const fileChooserPromise = page.waitForEvent('filechooser');
        // Click import file
        drawProject.clickImportFile();

        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(playwrightTestFile('data', `kml_${fileName}.kml`));

        // Wait for OL rendering
        await page.waitForTimeout(500);

        buffer = await page.screenshot({
            clip: screenshotClip,
            // path: playwrightTestFile('__screenshots__','draw.spec.js','drawn.png'),
        });
        expect(await digestBuffer(buffer)).not.toEqual(blankHash);
        expect(buffer.byteLength).toBeGreaterThan(blankByteLength);

        // The KML has been drawn
        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(1);

        // Hide all elements but #map, #newOlMap and their children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        if (UPDATE_SCREENSHOT_FILES) {
            await drawProject.map.screenshot({
                path: playwrightTestFile('__screenshots__','draw.spec.js',`draw-kml-${fileName.replaceAll('_','-')}.png`)
            });
        } else {
            expect(await drawProject.map.screenshot()).toMatchSnapshot(
                `draw-kml-${fileName.replaceAll('_','-')}.png`,
                {maxDiffPixelRatio: 0.05},
            );
        }
    });

    test('Import KML multilinestring - Erase all - Import same KML multilinestring', async ({ page }) => {
        const drawProject = await initDrawProject(page);
        const screenshotClip = {x:950/2-380/2, y:900/2-380/2, width:380, height:380};

        // Get blank buffer
        let buffer = await page.screenshot({
            clip: screenshotClip,
            //path: playwrightTestFile('__screenshots__','draw.spec.js','blank.png'),
        });
        const blankHash = await digestBuffer(buffer);
        const blankByteLength = buffer.byteLength;
        expect(blankByteLength).toBeGreaterThan(1000); // 1286
        expect(blankByteLength).toBeLessThan(2500);

        // Start waiting for file chooser before clicking. Note no await.
        let fileChooserPromise = page.waitForEvent('filechooser');
        // Click import file
        drawProject.clickImportFile();

        let fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(playwrightTestFile('data', 'kml_multilinestring.kml'));

        // Wait for OL rendering
        await page.waitForTimeout(500);

        // The KML has been drawn
        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(4);

        // Get multilinestring buffer
        buffer = await page.screenshot({
            clip: screenshotClip,
            //path: playwrightTestFile('__screenshots__','draw.spec.js','drawn.png'),
        });
        const firstHash = await digestBuffer(buffer);
        const firstByteLength = buffer.byteLength;
        expect(firstHash).not.toEqual(blankHash);
        expect(firstByteLength).toBeGreaterThan(blankByteLength);

        // Erase all
        await drawProject.deleteAllDrawings();

        // Wait for OL rendering
        await page.waitForTimeout(500);

        // The all features has been removed from the map
        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toBeNull();

        // Get erase buffer
        buffer = await page.screenshot({
            clip: screenshotClip,
            //path: playwrightTestFile('__screenshots__','draw.spec.js','blank-erase-drawn.png'),
        });
        const eraseByteLength = buffer.byteLength;
        expect(eraseByteLength).toBeGreaterThan(1000); // 1286
        expect(eraseByteLength).toBeLessThan(2500);

        //  Fixed by https://github.com/3liz/lizmap-web-client/pull/6446
        // Click import file
        drawProject.clickImportFile();

        fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(playwrightTestFile('data', 'kml_multilinestring.kml'));

        // Wait for OL rendering
        await page.waitForTimeout(500);

        // The KML has been drawn
        expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(4);

        // Get multipolygon buffer
        buffer = await page.screenshot({
            clip: screenshotClip,
            //path: playwrightTestFile('__screenshots__','draw.spec.js','drawn.png'),
        });
        const secondHash = await digestBuffer(buffer);
        const secondByteLength = buffer.byteLength;
        expect(secondHash).not.toEqual(blankHash);
        expect(secondHash).toEqual(firstHash);
        expect(secondByteLength).toBeGreaterThan(blankByteLength);
        expect(secondByteLength).toEqual(firstByteLength);

    });
});

test.describe('Split tool',
    {
        tag: ['@readonly'],
    },
    () => {

        test('Split polygon with intersecting line produces 2 parts', async ({ page }) => {
            const drawProject = await initDrawProject(page);
            // Close the left dock so it does not overlap #newOlMap at small x offsets
            await drawProject.closeLeftDock();

            // Draw a rectangle polygon
            await drawProject.selectGeometry('polygon');
            await drawProject.clickOnMap(250, 100);
            await drawProject.clickOnMap(450, 100);
            await drawProject.clickOnMap(450, 300);
            await drawProject.dblClickOnMap(250, 300);

            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(1);

            // Activate split tool
            await drawProject.toggleSplit();
            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.isSplitting)).toBe(true);
            await expect(await drawProject.splitLocator()).toHaveClass(/active/);

            // Draw a horizontal split line through the polygon
            await drawProject.clickOnMap(210, 200);
            await drawProject.dblClickOnMap(490, 200);

            // Wait for the async split operation (JSTS lazy import)
            await page.waitForFunction(() => lizMap.mainLizmap.digitizing.featureDrawn?.length === 2, null, { timeout: 10000 });

            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(2);

            await drawProject.deleteAllDrawings();
        });

        test('Split line with intersecting line produces 2 parts', async ({ page }) => {
            const drawProject = await initDrawProject(page);
            await drawProject.closeLeftDock();

            // Draw a horizontal line
            await drawProject.selectGeometry('line');
            await drawProject.clickOnMap(250, 200);
            await drawProject.dblClickOnMap(450, 200);

            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(1);

            // Activate split tool and draw a vertical crossing line
            await drawProject.toggleSplit();
            await drawProject.clickOnMap(300, 100);
            await drawProject.dblClickOnMap(300, 300);

            // Wait for the async split operation
            await page.waitForFunction(() => lizMap.mainLizmap.digitizing.featureDrawn?.length === 2, null, { timeout: 10000 });

            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(2);

            await drawProject.deleteAllDrawings();
        });

        test('Split with no intersection leaves features unchanged', async ({ page }) => {
            const drawProject = await initDrawProject(page);
            await drawProject.closeLeftDock();

            // Draw a small polygon
            await drawProject.selectGeometry('polygon');
            await drawProject.clickOnMap(250, 100);
            await drawProject.clickOnMap(350, 100);
            await drawProject.dblClickOnMap(300, 175);

            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(1);

            // Activate split tool and draw a line entirely outside the polygon
            await drawProject.toggleSplit();
            await drawProject.clickOnMap(400, 400);
            await drawProject.dblClickOnMap(450, 450);

            // Give the operation time to complete (if it fires)
            await page.waitForTimeout(1500);

            // Feature count must remain 1
            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(1);

            await drawProject.deleteAllDrawings();
        });
    }
);

test.describe('Reshape tool',
    {
        tag: ['@readonly'],
    },
    () => {

        test('Reshape line (trim mode): intersecting reshape line trims original', async ({ page }) => {
            const drawProject = await initDrawProject(page);
            await drawProject.closeLeftDock();

            // Draw a long horizontal line
            await drawProject.selectGeometry('line');
            await drawProject.clickOnMap(250, 200);
            await drawProject.dblClickOnMap(550, 200);

            const origCoords = await page.evaluate(
                () => lizMap.mainLizmap.digitizing.featureDrawn[0].getGeometry().getCoordinates()
            );
            expect(origCoords).toHaveLength(2);

            // Activate reshape and draw a crossing vertical line
            await drawProject.toggleReshape();
            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.isReshaping)).toBe(true);
            await expect(await drawProject.reshapeLocator()).toHaveClass(/active/);

            await drawProject.clickOnMap(300, 100);
            await drawProject.dblClickOnMap(300, 300);

            // Wait for the async reshape operation to complete.
            // origCoords must be passed as an argument — waitForFunction runs in
            // the browser context and cannot close over Node.js variables.
            await page.waitForFunction((orig) => {
                const coords = lizMap.mainLizmap.digitizing.featureDrawn?.[0]?.getGeometry()?.getCoordinates();
                return coords && (coords[0][0] !== orig[0][0] || coords[coords.length - 1][0] !== orig[1][0]);
            }, origCoords, { timeout: 10000 });

            // The line should be shorter (trimmed to the longer half)
            const newCoords = await page.evaluate(
                () => lizMap.mainLizmap.digitizing.featureDrawn[0].getGeometry().getCoordinates()
            );
            // At least one endpoint must have changed
            expect(
                newCoords[0][0] !== origCoords[0][0] || newCoords[newCoords.length - 1][0] !== origCoords[1][0]
            ).toBe(true);

            await drawProject.deleteAllDrawings();
        });

        test('Reshape line (extend mode): non-intersecting reshape extends original', async ({ page }) => {
            const drawProject = await initDrawProject(page);
            await drawProject.closeLeftDock();

            // Draw a short horizontal line
            await drawProject.selectGeometry('line');
            await drawProject.clickOnMap(250, 200);
            await drawProject.dblClickOnMap(380, 200);

            const origCoords = await page.evaluate(
                () => lizMap.mainLizmap.digitizing.featureDrawn[0].getGeometry().getCoordinates()
            );

            // Activate reshape and draw a target line to the right of the line's endpoint
            // (non-intersecting, so extend mode kicks in)
            await drawProject.toggleReshape();
            await drawProject.clickOnMap(480, 100);
            await drawProject.dblClickOnMap(480, 300);

            // Wait for geometry to change
            await page.waitForFunction(() => {
                const coords = lizMap.mainLizmap.digitizing.featureDrawn?.[0]?.getGeometry()?.getCoordinates();
                return coords && coords.length > 2;
            }, null, { timeout: 10000 });

            // Line should now have more than 2 coordinates (extended)
            const newCoords = await page.evaluate(
                () => lizMap.mainLizmap.digitizing.featureDrawn[0].getGeometry().getCoordinates()
            );
            expect(newCoords.length).toBeGreaterThan(origCoords.length);

            await drawProject.deleteAllDrawings();
        });
    }
);

test.describe('Rotate and Scale tools',
    {
        tag: ['@readonly'],
    },
    () => {

        test('Rotate tool toggles active state', async ({ page }) => {
            const drawProject = await initDrawProject(page);

            await drawProject.selectGeometry('polygon');
            await drawProject.clickOnMap(250, 150);
            await drawProject.clickOnMap(350, 150);
            await drawProject.dblClickOnMap(300, 250);

            // Activate rotate
            await expect(await drawProject.rotateLocator()).not.toHaveClass(/active/);
            await drawProject.toggleRotate();
            await expect(await drawProject.rotateLocator()).toHaveClass(/active/);
            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.isRotate)).toBe(true);

            // Deactivate rotate
            await drawProject.toggleRotate();
            await expect(await drawProject.rotateLocator()).not.toHaveClass(/active/);
            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.isRotate)).toBe(false);

            await drawProject.deleteAllDrawings();
        });

        test('Scale tool toggles active state', async ({ page }) => {
            const drawProject = await initDrawProject(page);

            await drawProject.selectGeometry('polygon');
            await drawProject.clickOnMap(250, 150);
            await drawProject.clickOnMap(350, 150);
            await drawProject.dblClickOnMap(300, 250);

            // Activate scaling
            await expect(await drawProject.scalingLocator()).not.toHaveClass(/active/);
            await drawProject.toggleScaling();
            await expect(await drawProject.scalingLocator()).toHaveClass(/active/);
            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.isScaling)).toBe(true);

            // Deactivate scaling
            await drawProject.toggleScaling();
            await expect(await drawProject.scalingLocator()).not.toHaveClass(/active/);
            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.isScaling)).toBe(false);

            await drawProject.deleteAllDrawings();
        });

        test('Rotate and scale are mutually exclusive', async ({ page }) => {
            const drawProject = await initDrawProject(page);

            await drawProject.selectGeometry('polygon');
            await drawProject.clickOnMap(250, 150);
            await drawProject.clickOnMap(350, 150);
            await drawProject.dblClickOnMap(300, 250);

            // Activate rotate
            await drawProject.toggleRotate();
            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.isRotate)).toBe(true);

            // Activating scale must deactivate rotate
            await drawProject.toggleScaling();
            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.isScaling)).toBe(true);
            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.isRotate)).toBe(false);

            await drawProject.deleteAllDrawings();
        });
    }
);

test.describe('Translate tool',
    {
        tag: ['@readonly'],
    },
    () => {

        test('Translate moves feature coordinates', async ({ page }) => {
            const drawProject = await initDrawProject(page);

            // Draw a polygon in the center
            await drawProject.selectGeometry('polygon');
            await drawProject.clickOnMap(250, 150);
            await drawProject.clickOnMap(350, 150);
            await drawProject.dblClickOnMap(300, 250);

            const origCoords = await page.evaluate(
                () => lizMap.mainLizmap.digitizing.featureDrawn[0].getGeometry().getCoordinates()
            );

            // Activate translate
            await expect(await drawProject.translateLocator()).not.toHaveClass(/active/);
            await drawProject.toggleTranslate();
            await expect(await drawProject.translateLocator()).toHaveClass(/active/);
            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.isTranslating)).toBe(true);

            // Drag the feature 100px right, 100px down
            await drawProject.map.dragTo(drawProject.map, {
                sourcePosition: { x: 300, y: 200 },
                targetPosition: { x: 400, y: 300 },
            });

            await page.waitForTimeout(300);

            const newCoords = await page.evaluate(
                () => lizMap.mainLizmap.digitizing.featureDrawn[0].getGeometry().getCoordinates()
            );

            // At least one coordinate must differ
            expect(newCoords[0][0][0]).not.toBeCloseTo(origCoords[0][0][0], 0);

            await drawProject.deleteAllDrawings();
        });
    }
);

test.describe('Parallel offset',
    {
        tag: ['@readonly'],
    },
    () => {

        test('Applying parallel offset changes line geometry', async ({ page }) => {
            const drawProject = await initDrawProject(page);
            await drawProject.closeLeftDock();

            // Draw a horizontal line
            await drawProject.selectGeometry('line');
            await drawProject.clickOnMap(250, 200);
            await drawProject.dblClickOnMap(450, 200);

            const origCoords = await page.evaluate(
                () => lizMap.mainLizmap.digitizing.featureDrawn[0].getGeometry().getCoordinates()
            );

            // Open parallel panel, set offset, apply
            await drawProject.toggleParallel();
            await expect(await drawProject.parallelToggleLocator()).toHaveClass(/active/);
            await drawProject.setParallelOffset('200');
            await drawProject.applyParallel();

            await page.waitForTimeout(300);

            // createParallel replaces the existing geometry in-place
            const newCoords = await page.evaluate(
                () => lizMap.mainLizmap.digitizing.featureDrawn[0].getGeometry().getCoordinates()
            );

            // Y coordinates must have shifted (offset perpendicular to a horizontal line changes Y)
            expect(newCoords[0][1]).not.toBeCloseTo(origCoords[0][1], 0);

            await drawProject.deleteAllDrawings();
        });
    }
);

test.describe('Import GeoJSON file',
    {
        tag: ['@readonly'],
    },
    () => {

        test('Import GeoJSON polygon file draws one polygon feature', async ({ page }) => {
            const drawProject = await initDrawProject(page);

            // Start listening for the file chooser before triggering it
            const fileChooserPromise = page.waitForEvent('filechooser');
            drawProject.clickImportFile();

            const fileChooser = await fileChooserPromise;
            await fileChooser.setFiles(playwrightTestFile('data', 'geojson_polygon.geojson'));

            // Wait for OL rendering
            await page.waitForTimeout(500);

            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(1);
            expect(
                await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn[0].getGeometry().getType())
            ).toBe('Polygon');

            await drawProject.deleteAllDrawings();
        });
    }
);

test.describe('Context switching',
    {
        tag: ['@readonly'],
    },
    () => {

        test('Features persist after closing and reopening the draw panel', async ({ page }) => {
            const drawProject = await initDrawProject(page);

            // Draw a polygon
            await drawProject.selectGeometry('polygon');
            await drawProject.clickOnMap(250, 150);
            await drawProject.clickOnMap(350, 150);
            await drawProject.dblClickOnMap(300, 250);

            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(1);

            // Close and reopen the draw panel
            await drawProject.closeDrawPanel();
            await drawProject.openDrawPanel();

            // Features must still be there
            expect(await page.evaluate(() => lizMap.mainLizmap.digitizing.featureDrawn)).toHaveLength(1);

            await drawProject.deleteAllDrawings();
        });
    }
);
