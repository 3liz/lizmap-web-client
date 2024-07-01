// @ts-check
const { test, expect } = require('@playwright/test');
const { gotoMap, digestBuffer } = require('./globals')

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

    test('Scales', async ({ page }) => {
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (144448).toLocaleString(locale));

        let getMapRequestPromise = page.waitForRequest(/REQUEST=GetMap/);
        await page.locator('lizmap-treeview #node-quartiers').click();
        let getMapRequest = await getMapRequestPromise;
        let getMapUrl = getMapRequest.url();
        expect(getMapUrl).toContain('SERVICE=WMS');
        expect(getMapUrl).toContain('VERSION=1.3.0');
        expect(getMapUrl).toContain('REQUEST=GetMap');
        expect(getMapUrl).toContain('FORMAT=image%2Fpng');
        expect(getMapUrl).toContain('TRANSPARENT=true');
        expect(getMapUrl).toContain('LAYERS=quartiers');
        expect(getMapUrl).toContain('CRS=EPSG%3A3857');
        expect(getMapUrl).toContain('STYLES=default');
        expect(getMapUrl).toContain('WIDTH=958');
        expect(getMapUrl).toContain('HEIGHT=633');
        expect(getMapUrl).toMatch(/BBOX=412967.36\d+%2C5393197.84\d+%2C449580.69\d+%2C5417390.16\d+/);

        let getMapResponse = await getMapRequest.response();
        expect(getMapResponse).not.toBeNull();
        expect(getMapResponse?.ok()).toBe(true);
        expect(await getMapResponse?.headerValue('Content-Type')).toBe('image/png');
        // image size greater than transparent
        let contentLength = await getMapResponse?.headerValue('Content-Length');
        expect(parseInt(contentLength ? contentLength : '0')).toBeGreaterThan(5552);

        let getMapBody = await getMapResponse?.body();
        if (getMapBody) {
            expect(getMapBody.length).toBeGreaterThan(5552);
            expect(getMapBody.length).toBeLessThan(12600); // Could be 12499 or 12516
            expect(await digestBuffer(getMapBody.buffer)).toBe('016afadc9e38a0f68eaca459962fe8e771ce4431');
        }

        getMapRequestPromise = page.waitForRequest(/REQUEST=GetMap/);
        await page.locator('#navbar button.btn.zoom-in').click();
        getMapRequest = await getMapRequestPromise;
        getMapUrl = getMapRequest.url();
        expect(getMapUrl).toContain('SERVICE=WMS');
        expect(getMapUrl).toContain('VERSION=1.3.0');
        expect(getMapUrl).toContain('REQUEST=GetMap');
        expect(getMapUrl).toContain('FORMAT=image%2Fpng');
        expect(getMapUrl).toContain('TRANSPARENT=true');
        expect(getMapUrl).toContain('LAYERS=quartiers');
        expect(getMapUrl).toContain('CRS=EPSG%3A3857');
        expect(getMapUrl).toContain('STYLES=default');
        expect(getMapUrl).toContain('WIDTH=958');
        expect(getMapUrl).toContain('HEIGHT=633');
        expect(getMapUrl).toMatch(/BBOX=422120.69\d+%2C5399245.92\d+%2C440427.36\d+%2C5411342.08\d+/);
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (72224).toLocaleString(locale));

        getMapResponse = await getMapRequest.response();
        expect(getMapResponse).not.toBeNull();
        expect(getMapResponse?.ok()).toBe(true);
        expect(await getMapResponse?.headerValue('Content-Type')).toBe('image/png');
        // image size greater than transparent
        contentLength = await getMapResponse?.headerValue('Content-Length');
        expect(parseInt(contentLength ? contentLength : '0')).toBeGreaterThan(5552);

        getMapBody = await getMapResponse?.body();
        if (getMapBody) {
            expect(getMapBody.length).toBeGreaterThan(5552);
            expect(getMapBody.length).toBeLessThan(20600); // Could be 20531
            expect(await digestBuffer(getMapBody.buffer)).toBe('f705af679d87084c698c610446981768dde70e2a');
        }

        // No request performs by OpenLayers
        await page.locator('#navbar button.btn.zoom-out').click();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (144448).toLocaleString(locale));
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
