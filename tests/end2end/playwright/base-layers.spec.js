// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Base layers', () => {

    const locale = 'en-US';

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=base_layers';
        await gotoMap(url, page);
    });

    test('Base layers list', async ({ page }) => {
        await expect(page.locator('lizmap-base-layers select option')).toHaveCount(11);
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('osm-mapnik');
        await page.locator('lizmap-base-layers select').selectOption('empty');
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('empty');
    });

    test('Native EPSG:3857 Scales', async ({ page }) => {
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (144448).toLocaleString(locale));

        let getMapRequestPromise = page.waitForRequest(/REQUEST=GetMap/);
        await page.locator('lizmap-treeview #node-quartiers').click();
        // Wait for request and response
        let getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

        let buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        const initialByteLength = buffer.byteLength;
        // Greater than blank
        await expect(initialByteLength).toBeGreaterThan(1286); // 135746

        getMapRequestPromise = page.waitForRequest(/REQUEST=GetMap/);
        await page.locator('#navbar button.btn.zoom-in').click();
        // Wait for request and response
        await getMapRequestPromise;
        getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();
        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (72224).toLocaleString(locale));
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        // Greater than blank
        await expect(buffer.byteLength).toBeGreaterThan(1286); // 36159
        // Less than initial because of more red
        await expect(buffer.byteLength).toBeLessThan(initialByteLength); // 36159

        await page.locator('#navbar button.btn.zoom-out').click();
        // Not waiting for request and response because it is in cache
        // Check scales
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (144448).toLocaleString(locale));
        // Wai for OL transition
        await page.waitForTimeout(500);
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        // Greater than blank
        await expect(buffer.byteLength).toBeGreaterThan(1286); // 135746
        // Same as the initial
        await expect(buffer.byteLength).toBe(initialByteLength); // 135746

    });

    test('Tiles resolutions', async ({ page }) => {
        // Blank map
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('empty');
        // Wai for OL transition
        await page.waitForTimeout(500);
        // Get blank buffer
        let buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        const blankByteLength = buffer.byteLength;
        await expect(blankByteLength).toBeGreaterThan(1000); // 1286
        await expect(blankByteLength).toBeLessThan(1500) // 1286

        // Zoom to
        await page.locator('#navbar button.btn.zoom-in').click();
        await page.locator('#navbar button.btn.zoom-in').click();
        await page.locator('#navbar button.btn.zoom-in').click();
        await page.locator('#navbar button.btn.zoom-in').click();
        await page.locator('#navbar button.btn.zoom-in').click();
        await page.locator('#navbar button.btn.zoom-in').click();
        await page.locator('#navbar button.btn.zoom-in').click();
        await page.locator('#navbar button.btn.zoom-in').click();

        // Catch osm tile
        let osmRequestPromise = page.waitForRequest(/tile\.openstreetmap\.org/);
        // Select OSM
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('osm-mapnik');
        // Wait for request and response
        await osmRequestPromise;
        let osmRequest = await osmRequestPromise;
        await osmRequest.response();
        await page.waitForTimeout(1000);
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        const osmByteLength = buffer.byteLength;
        await expect(osmByteLength).toBeGreaterThan(blankByteLength); // 1286
        await expect(osmByteLength).toBeLessThan(70000) // 67587

        // back to empty
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('empty');
        // Wai for OL transition
        await page.waitForTimeout(500);
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        await expect(buffer.byteLength).toBe(blankByteLength);

        // Catch ortho GetTile request
        let getTileRequestPromise = page.waitForRequest(/Request=GetTile/);
        // Select ortho photos
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('ign-photo');
        // Wait for request and response
        await getTileRequestPromise;
        let getTileRequest = await getTileRequestPromise;
        await getTileRequest.response();
        await page.waitForTimeout(1000);
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        await expect(buffer.byteLength).toBeGreaterThan(blankByteLength); // 1286
        await expect(buffer.byteLength).toBeGreaterThan(osmByteLength); // 67587
        await expect(buffer.byteLength).toBeLessThan(160000) // 157993

    });
})

test.describe('Base layers user defined', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=base_layers_user_defined';
        await gotoMap(url, page);
    });

    test('Base layers list', async ({ page }) => {
        await expect(page.locator('lizmap-base-layers select option')).toHaveCount(12);
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('OSM TMS internal');
        await page.locator('lizmap-base-layers select').selectOption('group with many layers and shortname');
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('group with many layers and shortname');
    });

})

test.describe('Base layers with space', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=base_layers+with+space';
        await gotoMap(url, page);
    });

    test('Base layers list', async ({ page }) => {
        await expect(page.locator('lizmap-base-layers select option')).toHaveCount(6);
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('empty');
        await page.locator('lizmap-base-layers select').selectOption('osm-mapnik');
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('osm-mapnik');
    });

})

test.describe('Base layers withdot', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=base_layers.withdot';
        await gotoMap(url, page);
    });

    test('Base layers list', async ({ page }) => {
        await expect(page.locator('lizmap-base-layers select option')).toHaveCount(6);
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('empty');
        await page.locator('lizmap-base-layers select').selectOption('osm-mapnik');
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('osm-mapnik');
    });

})
