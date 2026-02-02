// @ts-check
import { dirname } from 'path';
import * as fs from 'fs/promises'
import { existsSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js';
import { expect as responseExpect } from './fixtures/expect-response.js';
import { ProjectPage } from './pages/project';
import { playwrightTestFile } from './globals';

// To update OSM and GeoPF tiles in the mock directory
// IMPORTANT, this must not be set to `true` while committing, on GitHub. Set to `false`.
const UPDATE_MOCK_FILES = false;

test.describe('Base layers @readonly', () => {

    const locale = 'en-US';

    /** @type {string[]} */
    let osmTiles = [];

    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'base_layers');

        // Catch all tiles requests from openstreetmap to mock them
        await page.route('https://tile.openstreetmap.org/*/*/*.png', async (route) => {
            const request = route.request();
            osmTiles.push(request.url());

            // Build path file in mock directory
            const pathFile = playwrightTestFile('mock', 'base_layers', 'osm', 'tiles' + (new URL(request.url()).pathname));
            if (UPDATE_MOCK_FILES) {
                // Save file in mock directory
                const response = await route.fetch();
                await fs.mkdir(dirname(pathFile), { recursive: true });
                await fs.writeFile(pathFile, new Uint8Array(await response.body()));
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
        });

        await project.open();
    });

    test.afterEach(async ({ page }) => {
        osmTiles = [];
        await page.unroute('https://tile.openstreetmap.org/*/*/*.png');
    });

    test('Base layers list', async ({ page }) => {
        const project = new ProjectPage(page, 'base_layers');
        await expect(project.baseLayerSelect.locator('option')).toHaveCount(11);

        // baselayer values
        const baselayer_values = await project.baseLayerSelect.locator('option')
            // @ts-ignore HTMLOptionElement has value property but it is not known
            .evaluateAll(list => list.map(opt => opt.value));
        expect(baselayer_values).toHaveLength(11);
        expect(baselayer_values).toEqual(expect.arrayContaining([
            "empty",
            "osm-mapnik",
            "open-topo-map",
            "bing-road",
            "bing-aerial",
            "bing-hybrid",
            "ign-scan",
            "ign-plan",
            "ign-photo",
            "ign-cadastral",
            "quartiers_baselayer",
        ]));

        // baselayer options
        const baselayer_options = await project.baseLayerSelect.locator('option').allTextContents();
        expect(baselayer_options).toHaveLength(11);
        expect(baselayer_options).toEqual(expect.arrayContaining([
            "No base map",
            "OpenStreetMap",
            "OpenTopoMap",
            "Bing Streets",
            "Bing Satellite",
            "Bing Hybrid",
            "IGN Scans",
            "IGN Plan",
            "IGN Orthophoto",
            "IGN Cadastre",
            "quartiers_baselayer",
        ]));

        // Check default value
        await expect(project.baseLayerSelect).toHaveValue('osm-mapnik');

        // Set empty
        await project.baseLayerSelect.selectOption('empty');
        await expect(project.baseLayerSelect).toHaveValue('empty');
    });

    test('Native EPSG:3857 Scales', async ({ page }) => {
        const project = new ProjectPage(page, 'base_layers');
        // Blank map
        await project.baseLayerSelect.selectOption('empty');
        await expect(project.baseLayerSelect).toHaveValue('empty');

        // Get blank buffer
        let buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        const blankByteLength = buffer.byteLength;
        expect(blankByteLength).toBeGreaterThan(1000); // 1286
        expect(blankByteLength).toBeLessThan(1500) // 1286

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (144448).toLocaleString(locale));

        let getMapPromise = project.waitForGetMapRequest();
        await project.treeView.getByTestId('quartiers').click();
        // Wait for request
        let getMapRequest = await getMapPromise;
        // Check request
        const getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'quartiers',
            'CRS': 'EPSG:3857',
            'STYLES': 'default',
            'DPI': '96',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /412967.3\d+,5393197.8\d+,449580.6\d+,5417390.1\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Wait for response
        let getMapResponse = await getMapRequest.response();
        // Check response
        responseExpect(getMapResponse).toBeImagePng();
        // Wai for OL transition
        await page.waitForTimeout(500);

        // Check rendering
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        const initialByteLength = buffer.byteLength;
        // Greater than blank
        expect(initialByteLength).toBeGreaterThan(blankByteLength); // 19648

        getMapPromise = project.waitForGetMapRequest();
        await project.zoomIn();
        // Wait for request
        getMapRequest = await getMapPromise;
        // Check request
        getMapExpectedParameters['BBOX'] = /422120.6\d+,5399245.9\d+,440427.3\d+,5411342.0\d+/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Wait for response
        getMapResponse = await getMapRequest.response();
        // Check response
        responseExpect(getMapResponse).toBeImagePng();
        // Wai for OL transition
        await page.waitForTimeout(500);

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (72224).toLocaleString(locale));

        // Check rendering
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        const zoomByteLength = buffer.byteLength;
        // Greater than blank
        expect(zoomByteLength).toBeGreaterThan(blankByteLength); // 12983
        // Less than initial because of more red
        expect(zoomByteLength).toBeLessThan(initialByteLength); // 12983

        await project.zoomOut();
        // Not waiting for request and response because it is in cache
        // Check scales
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (144448).toLocaleString(locale));
        // Wai for OL transition
        await page.waitForTimeout(1000);
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        // Greater than blank
        expect(buffer.byteLength).toBeGreaterThan(blankByteLength); // 19648
        // Greater than zoomed
        expect(buffer.byteLength).toBeGreaterThan(zoomByteLength); // 19648
        // Approximately the same as the initial
        expect(buffer.byteLength).toBeGreaterThan(initialByteLength-250); // 19648
        expect(buffer.byteLength).toBeLessThan(initialByteLength+250); // 19648

        // Blank map
        await project.treeView.getByTestId('quartiers').click();

        // Zoom and check scale
        await project.zoomIn();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (72224).toLocaleString(locale));

        // Zoom and check scale
        await project.zoomIn();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (36112).toLocaleString(locale));

        // Zoom and check scale
        await project.zoomIn();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (18056).toLocaleString(locale));

        // Zoom and check scale
        await project.zoomIn();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (9028).toLocaleString(locale));

        // Zoom and check scale
        await project.zoomIn();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (4514).toLocaleString(locale));

        // Zoom and check scale
        await project.zoomIn();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (2257).toLocaleString(locale));

        // Zoom and check scale
        await project.zoomIn();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (1128).toLocaleString(locale));

        // Zoom and check scale
        await project.zoomIn();
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (564).toLocaleString(locale));
    });

    test('Tiles resolutions', async ({ page }) => {
        const project = new ProjectPage(page, 'base_layers');
        // Blank map
        await project.baseLayerSelect.selectOption('empty');
        await expect(project.baseLayerSelect).toHaveValue('empty');

        // Get blank buffer
        let buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        const blankByteLength = buffer.byteLength;
        expect(blankByteLength).toBeGreaterThan(1000); // 1286
        expect(blankByteLength).toBeLessThan(1500) // 1286

        // Zoom to
        await project.zoomIn();
        await project.zoomIn();
        await project.zoomIn();
        await project.zoomIn();
        await project.zoomIn();
        await project.zoomIn();
        await project.zoomIn();
        await project.zoomIn();
        // Wait for OL transition
        await page.waitForTimeout(500);

        // Catch osm tile
        /** @type {string[]} */
        osmTiles = [];

        // Select OSM
        await project.baseLayerSelect.selectOption('osm-mapnik');
        await expect(project.baseLayerSelect).toHaveValue('osm-mapnik');

        // Wait for request and response
        while (osmTiles.length < 6) {
            await page.waitForTimeout(100);
        }

        // Check that we catch 6 tiles
        expect(osmTiles).toHaveLength(6);
        // Check that every tiles are from level 19
        expect(osmTiles[0]).toMatch(/\/19\/\d{6}\/\d{6}\.png/)
        expect(osmTiles[1]).toMatch(/\/19\/\d{6}\/\d{6}\.png/)
        expect(osmTiles[2]).toMatch(/\/19\/\d{6}\/\d{6}\.png/)
        expect(osmTiles[3]).toMatch(/\/19\/\d{6}\/\d{6}\.png/)
        expect(osmTiles[4]).toMatch(/\/19\/\d{6}\/\d{6}\.png/)
        expect(osmTiles[5]).toMatch(/\/19\/\d{6}\/\d{6}\.png/)

        // Wait for OL transition
        await page.waitForTimeout(500);

        // Build screenshot to check if tiles are well drawn
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        const osmByteLength = buffer.byteLength;
        expect(osmByteLength).toBeGreaterThan(blankByteLength); // 1286
        expect(osmByteLength).toBeGreaterThan(35000);
        expect(osmByteLength).toBeLessThan(70000); // 67587

        // back to empty
        await project.baseLayerSelect.selectOption('empty');
        await expect(project.baseLayerSelect).toHaveValue('empty');
        // Wait for OL transition
        await page.waitForTimeout(500);
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        expect(buffer.byteLength).toBe(blankByteLength);

        // Catch ortho GetTile request
        /** @type {string[]} GetTiles - list of GetTile request url string */
        let GetTiles = [];
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
                await fs.mkdir(dirname(pathFile), { recursive: true });
                await fs.writeFile(pathFile, new Uint8Array(await response.body()));
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
        // Select ign photo
        await project.baseLayerSelect.selectOption('ign-photo');
        await expect(project.baseLayerSelect).toHaveValue('ign-photo');

        // Wait for request and response
        while (GetTiles.length < 6) {
            await page.waitForTimeout(100);
        }

        // Check that we catch 6 tiles
        expect(GetTiles).toHaveLength(6);
        // Check that every tiles are from level 19
        expect(GetTiles[0]).toContain('TileMatrix=19')
        expect(GetTiles[1]).toContain('TileMatrix=19')
        expect(GetTiles[2]).toContain('TileMatrix=19')
        expect(GetTiles[3]).toContain('TileMatrix=19')
        expect(GetTiles[4]).toContain('TileMatrix=19')
        expect(GetTiles[5]).toContain('TileMatrix=19')

        // Remove listen to geopf tiles
        await page.unroute('https://data.geopf.fr/wmts*')

        // Wait for OL transition
        await page.waitForTimeout(500);

        // Build screenshot to check if tiles are well drawn
        buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
        expect(buffer.byteLength).toBeGreaterThan(blankByteLength); // 1286
        expect(buffer.byteLength).toBeGreaterThan(osmByteLength); // 67587
        expect(buffer.byteLength).toBeLessThan(170000); // 157993 or 161437

    });
})

test.describe('Base layers user defined @readonly', () => {

    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'base_layers_user_defined');

        // Catch all tiles requests from openstreetmap to mock them
        await page.route('https://tile.openstreetmap.org/*/*/*.png', async (route) => {
            const request = route.request();
            //osmTiles.push(request.url());

            // Build path file in mock directory
            const pathFile = playwrightTestFile('mock', 'base_layers', 'osm', 'tiles' + (new URL(request.url()).pathname));
            if (UPDATE_MOCK_FILES) {
                // Save file in mock directory
                const response = await route.fetch();
                await fs.mkdir(dirname(pathFile), { recursive: true });
                await fs.writeFile(pathFile, new Uint8Array(await response.body()));
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
        });

        await project.open();
    });

    test.afterEach(async ({ page }) => {
        await page.unroute('https://tile.openstreetmap.org/*/*/*.png');
    });

    test('Base layers list', async ({ page }) => {
        const project = new ProjectPage(page, 'base_layers_user_defined');
        await expect(project.baseLayerSelect.locator('option')).toHaveCount(12);

        // baselayer values
        const baselayer_values = await project.baseLayerSelect.locator('option')
            // @ts-ignore HTMLOptionElement has value property but it is not known
            .evaluateAll(list => list.map(opt => opt.value));
        expect(baselayer_values).toHaveLength(12);
        expect(baselayer_values).toEqual(expect.arrayContaining([
            "OSM TMS internal",
            "OSM TMS external",
            "project-background-color",
            "group with many layers and shortname",
            "group with sub",
            "local vector layer",
            "local raster layer",
            "WMTS single external",
            "WMS single internal",
            "WMS grouped external",
            "IGN Géoplateforme (PLAN.IGN) (style 'standard')",
            "IGN Géoplateforme (PLAN.IGN) (style 'attenue')",
        ]));

        // baselayer options
        const baselayer_options = await project.baseLayerSelect.locator('option').allTextContents();
        expect(baselayer_options).toHaveLength(12);
        expect(baselayer_options).toEqual(expect.arrayContaining([
            "OSM TMS internal",
            "OSM TMS external",
            "No base map",
            "This is a nice group",
            "group with sub",
            "local vector layer",
            "local raster layer",
            "WMTS single external",
            "WMS single internal",
            "WMS grouped external",
            "IGN Géoplateforme (PLAN.IGN) (style 'standard')",
            "IGN Géoplateforme (PLAN.IGN) (style 'attenue')",
        ]));

        await expect(project.baseLayerSelect).toHaveValue('OSM TMS internal');

        let getMapPromise = project.waitForGetMapRequest();

        // Select a group with many layers
        await project.baseLayerSelect.selectOption('group with many layers and shortname');
        await expect(project.baseLayerSelect).toHaveValue('group with many layers and shortname');

        // Wait for request
        let getMapRequest = await getMapPromise;
        // Check request
        const getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'group_with_many_layers_shortname',
            'CRS': 'EPSG:3857',
            'STYLES': '',
            'DPI': '96',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /413103.3\d+,5392611.8\d+,449716.6\d+,5416804.1\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Wait for response
        let getMapResponse = await getMapRequest.response();
        // Check response
        responseExpect(getMapResponse).toBeImagePng();
    });

})

test.describe('Base layers with space @readonly', () => {

    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'base_layers with space');

        // Catch all tiles requests from openstreetmap to mock them
        await page.route('https://tile.openstreetmap.org/*/*/*.png', async (route) => {
            const request = route.request();
            //osmTiles.push(request.url());

            // Build path file in mock directory
            const pathFile = playwrightTestFile('mock', 'base_layers', 'osm', 'tiles' + (new URL(request.url()).pathname));
            if (UPDATE_MOCK_FILES) {
                // Save file in mock directory
                const response = await route.fetch();
                await fs.mkdir(dirname(pathFile), { recursive: true });
                await fs.writeFile(pathFile, new Uint8Array(await response.body()));
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
        });

        await project.open();
    });

    test.afterEach(async ({ page }) => {
        await page.unroute('https://tile.openstreetmap.org/*/*/*.png');
    });

    test('Base layers list', async ({ page }) => {
        const project = new ProjectPage(page, 'base_layers with space');
        await expect(project.baseLayerSelect.locator('option')).toHaveCount(6);

        // baselayer values
        const baselayer_values = await project.baseLayerSelect.locator('option')
            // @ts-ignore HTMLOptionElement has value property but it is not known
            .evaluateAll(list => list.map(opt => opt.value));
        expect(baselayer_values).toHaveLength(6);
        expect(baselayer_values).toEqual(expect.arrayContaining([
            "empty",
            "osm-mapnik",
            "ign-scan",
            "ign-plan",
            "ign-photo",
            "ign-cadastral",
        ]));

        // baselayer options
        const baselayer_options = await project.baseLayerSelect.locator('option').allTextContents();
        expect(baselayer_options).toHaveLength(6);
        expect(baselayer_options).toEqual(expect.arrayContaining([
            "No base map",
            "OpenStreetMap",
            "IGN Scans",
            "IGN Plan",
            "IGN Orthophoto",
            "IGN Cadastre",
        ]));

        await expect(project.baseLayerSelect).toHaveValue('empty');
        await project.baseLayerSelect.selectOption('osm-mapnik');
        await expect(project.baseLayerSelect).toHaveValue('osm-mapnik');
    });

})

test.describe('Base layers with dots @readonly', () => {

    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'base_layers.withdot');

        // Catch all tiles requests from openstreetmap to mock them
        await page.route('https://tile.openstreetmap.org/*/*/*.png', async (route) => {
            const request = route.request();
            //osmTiles.push(request.url());

            // Build path file in mock directory
            const pathFile = playwrightTestFile('mock', 'base_layers', 'osm', 'tiles' + (new URL(request.url()).pathname));
            if (UPDATE_MOCK_FILES) {
                // Save file in mock directory
                const response = await route.fetch();
                await fs.mkdir(dirname(pathFile), { recursive: true });
                await fs.writeFile(pathFile, new Uint8Array(await response.body()));
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
        });

        await project.open();
    });

    test.afterEach(async ({ page }) => {
        await page.unroute('https://tile.openstreetmap.org/*/*/*.png');
    });

    test('Base layers list', async ({ page }) => {
        const project = new ProjectPage(page, 'base_layers with space');
        await expect(project.baseLayerSelect.locator('option')).toHaveCount(6);

        // baselayer values
        const baselayer_values = await project.baseLayerSelect.locator('option')
            // @ts-ignore HTMLOptionElement has value property but it is not known
            .evaluateAll(list => list.map(opt => opt.value));
        expect(baselayer_values).toHaveLength(6);
        expect(baselayer_values).toEqual(expect.arrayContaining([
            "empty",
            "osm-mapnik",
            "ign-scan",
            "ign-plan",
            "ign-photo",
            "ign-cadastral",
        ]));

        // baselayer options
        const baselayer_options = await project.baseLayerSelect.locator('option').allTextContents();
        expect(baselayer_options).toHaveLength(6);
        expect(baselayer_options).toEqual(expect.arrayContaining([
            "No base map",
            "OpenStreetMap",
            "IGN Scans",
            "IGN Plan",
            "IGN Orthophoto",
            "IGN Cadastre",
        ]));

        await expect(project.baseLayerSelect).toHaveValue('empty');
        await project.baseLayerSelect.selectOption('osm-mapnik');
        await expect(project.baseLayerSelect).toHaveValue('osm-mapnik');
    });

})
