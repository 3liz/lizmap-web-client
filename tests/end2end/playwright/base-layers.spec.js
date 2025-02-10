// @ts-check
import { dirname } from 'path';
import * as fs from 'fs/promises'
import { existsSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { gotoMap, playwrightTestFile } from './globals';

// To update OSM and GeoPF tiles in the mock directory
// IMPORTANT, this must not be set to `true` while committing, on GitHub. Set to `false`.
const UPDATE_MOCK_FILES = false;

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
        // Blank map
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('empty');
        // Wait for transition
        await page.waitForTimeout(1000);

        // Get blank buffer
        let buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        const blankByteLength = buffer.byteLength;
        await expect(blankByteLength).toBeGreaterThan(1000); // 1286
        await expect(blankByteLength).toBeLessThan(1500) // 1286

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (144448).toLocaleString(locale));

        let getMapRequestPromise = page.waitForRequest(/REQUEST=GetMap/);
        await page.locator('lizmap-treeview #node-quartiers').click();
        // Wait for request and response
        let getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();
        // Wai for OL transition
        await page.waitForTimeout(1000);

        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        const initialByteLength = buffer.byteLength;
        // Greater than blank
        await expect(initialByteLength).toBeGreaterThan(blankByteLength); // 19648

        getMapRequestPromise = page.waitForRequest(/REQUEST=GetMap/);
        await page.locator('#navbar button.btn.zoom-in').click();
        // Wait for request and response
        await getMapRequestPromise;
        getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();
        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (72224).toLocaleString(locale));
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        const zoomByteLength = buffer.byteLength;
        // Greater than blank
        await expect(zoomByteLength).toBeGreaterThan(blankByteLength); // 12983
        // Less than initial because of more red
        await expect(zoomByteLength).toBeLessThan(initialByteLength); // 12983

        await page.locator('#navbar button.btn.zoom-out').click();
        // Not waiting for request and response because it is in cache
        // Check scales
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (144448).toLocaleString(locale));
        // Wai for OL transition
        await page.waitForTimeout(1000);
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        // Greater than blank
        await expect(buffer.byteLength).toBeGreaterThan(blankByteLength); // 19648
        // Greater than zoomed
        await expect(buffer.byteLength).toBeGreaterThan(zoomByteLength); // 19648
        // Approximately the same as the initial
        await expect(buffer.byteLength).toBeGreaterThan(initialByteLength-250); // 19648
        await expect(buffer.byteLength).toBeLessThan(initialByteLength+250); // 19648

        // Blank map
        await page.locator('lizmap-treeview #node-quartiers').click();

        // Zoom and check scale
        await page.locator('#navbar button.btn.zoom-in').click();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (72224).toLocaleString(locale));

        // Zoom and check scale
        await page.locator('#navbar button.btn.zoom-in').click();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (36112).toLocaleString(locale));

        // Zoom and check scale
        await page.locator('#navbar button.btn.zoom-in').click();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (18056).toLocaleString(locale));

        // Zoom and check scale
        await page.locator('#navbar button.btn.zoom-in').click();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (9028).toLocaleString(locale));

        // Zoom and check scale
        await page.locator('#navbar button.btn.zoom-in').click();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (4514).toLocaleString(locale));

        // Zoom and check scale
        await page.locator('#navbar button.btn.zoom-in').click();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (2257).toLocaleString(locale));

        // Zoom and check scale
        await page.locator('#navbar button.btn.zoom-in').click();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (1128).toLocaleString(locale));

        // Zoom and check scale
        await page.locator('#navbar button.btn.zoom-in').click();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (564).toLocaleString(locale));
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
        // Wait for OL transition
        await page.waitForTimeout(500);

        // Catch osm tile
        let GetTiles = [];
        await page.route('https://tile.openstreetmap.org/*/*/*.png', async (route) => {
            const request = await route.request();
            GetTiles.push(request.url());

            // Build path file in mock directory
            const pathFile = playwrightTestFile('mock', 'base_layers', 'osm', 'tiles' + (new URL(request.url()).pathname));
            if (UPDATE_MOCK_FILES) {
                // Save file in mock directory
                const response = await route.fetch();
                await fs.mkdir(dirname(pathFile), { recursive: true })
                await fs.writeFile(pathFile, await response.body())
            } else if (existsSync(pathFile)) {
                // fulfill route's request with mock file
                await route.fulfill({
                    path: pathFile
                })
            } else {
                // fulfill route's request with default transparent tile
                await route.fulfill({
                    path: playwrightTestFile('mock', 'transparent_tile.png')
                })
            }
        })

        // Select OSM
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('osm-mapnik');

        // Wait for request and response
        while (GetTiles.length < 6) {
            await page.waitForTimeout(100);
        }

        // Check that we catch 6 tiles
        await expect(GetTiles).toHaveLength(6);
        // Check that every tiles are from level 19
        await expect(GetTiles[0]).toMatch(/\/19\/\d{6}\/\d{6}\.png/)
        await expect(GetTiles[1]).toMatch(/\/19\/\d{6}\/\d{6}\.png/)
        await expect(GetTiles[2]).toMatch(/\/19\/\d{6}\/\d{6}\.png/)
        await expect(GetTiles[3]).toMatch(/\/19\/\d{6}\/\d{6}\.png/)
        await expect(GetTiles[4]).toMatch(/\/19\/\d{6}\/\d{6}\.png/)
        await expect(GetTiles[5]).toMatch(/\/19\/\d{6}\/\d{6}\.png/)

        // Remove listen to osm tiles
        await page.unroute('https://tile.openstreetmap.org/*/*/*.png')

        // Wait for OL transition
        await page.waitForTimeout(500);

        // Build screenshot to check if tiles are well drawn
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        const osmByteLength = buffer.byteLength;
        await expect(osmByteLength).toBeGreaterThan(blankByteLength); // 1286
        await expect(osmByteLength).toBeGreaterThan(35000);
        await expect(osmByteLength).toBeLessThan(70000); // 67587

        // back to empty
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('empty');
        // Wait for OL transition
        await page.waitForTimeout(500);
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        await expect(buffer.byteLength).toBe(blankByteLength);

        // Catch ortho GetTile request
        //let getTileRequestPromise = page.waitForRequest(/Request=GetTile/);
        GetTiles = [];
        await page.route('https://data.geopf.fr/wmts*', async (route) => {
            const request = await route.request();
            GetTiles.push(request.url());

            // Build path file in mock directory
            const parameters = new URL(request.url()).searchParams;
            const pathFile = playwrightTestFile(
                'mock', 'base_layers', 'geopf',
                (parameters.get('layer') ?? 'ORTHOIMAGERY.ORTHOPHOTOS').replace('.', '_'),
                parameters.get('TileMatrix') ?? '19',
                parameters.get('TileRow') ?? '191427',
                (parameters.get('TileCol') ?? '267786') +'.jpg',
            )
            if (UPDATE_MOCK_FILES) {
                // Save file in mock directory
                const response = await route.fetch();
                await fs.mkdir(path.dirname(pathFile), { recursive: true })
                await fs.writeFile(pathFile, await response.body())
            } else if (existsSync(pathFile)) {
                // fulfill route's request with mock file
                await route.fulfill({
                    path: pathFile
                })
            } else {
                // fulfill route's request with default white tile
                await route.fulfill({
                    path: playwrightTestFile('mock', 'white_tile.jpg')
                })
            }
        });
        // Select ortho photos
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('ign-photo');
        // Wait for request and response
        while (GetTiles.length < 6) {
            await page.waitForTimeout(100);
        }

        // Check that we catch 6 tiles
        await expect(GetTiles).toHaveLength(6);
        // Check that every tiles are from level 19
        await expect(GetTiles[0]).toContain('TileMatrix=19')
        await expect(GetTiles[1]).toContain('TileMatrix=19')
        await expect(GetTiles[2]).toContain('TileMatrix=19')
        await expect(GetTiles[3]).toContain('TileMatrix=19')
        await expect(GetTiles[4]).toContain('TileMatrix=19')
        await expect(GetTiles[5]).toContain('TileMatrix=19')

        // Remove listen to geopf tiles
        await page.unroute('https://data.geopf.fr/wmts*')

        // Wait for OL transition
        await page.waitForTimeout(500);

        // Build screenshot to check if tiles are well drawn
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        await expect(buffer.byteLength).toBeGreaterThan(blankByteLength); // 1286
        await expect(buffer.byteLength).toBeGreaterThan(osmByteLength); // 67587
        await expect(buffer.byteLength).toBeLessThan(170000); // 157993 or 161437

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

test.describe('Base layers with dots', () => {

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
