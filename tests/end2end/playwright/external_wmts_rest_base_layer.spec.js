// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';
import { playwrightTestFile } from './globals';

/**
 * External WMTS base layer published in RESTful style, see issue #7402.
 *
 * The layer url is a static capabilities document (no OperationsMetadata) and
 * its tile matrix set is in the project CRS (EPSG:25832). The tiles must be
 * requested with the ResourceURL template of the capabilities, not with KVP
 * GetTile parameters appended to the capabilities url.
 *
 * Project used
 * ------------
 *  - testsrepository / external_wmts_rest_basemap
 *      "basemapde": basemap.de Web Raster, "Get images directly" enabled
 *
 * The browser requests to basemap.de and sgx.geodatenzentrum.de are mocked.
 */

const capabilitiesUrl = 'https://basemap.de/dienste/wmts_capabilities_web_raster.xml';
const tileUrlRegExp = new RegExp(
    '^https://sgx\\.geodatenzentrum\\.de/wmts_basemapde/tile/1\\.0\\.0/de_basemapde_web_raster_farbe/' +
    'default/DE_EPSG_25832_ADV/\\d{2}/\\d+/\\d+\\.png$'
);

test.describe('External WMTS RESTful base layer — getProjectConfig @requests @readonly', () => {

    test('The layer is exposed as an external WMTS layer in its CRS', async ({ request }) => {
        const params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'external_wmts_rest_basemap',
        });
        const response = await request.get(`/index.php/lizmap/service/getProjectConfig?${params}`);
        expect(response.ok()).toBeTruthy();
        const config = await response.json();

        const layer = config.layers['basemapde'];
        expect(layer, 'Layer "basemapde" must exist in config').toBeDefined();
        expect(layer.externalWmsToggle).toBe('True');
        expect(layer.externalAccess).toBeDefined();
        expect(layer.externalAccess.type).toBe('wmts');
        expect(layer.externalAccess.crs).toBe('EPSG:25832');
        expect(layer.externalAccess.tileMatrixSet).toBe('DE_EPSG_25832_ADV');
        expect(layer.externalAccess.url).toBe(capabilitiesUrl);
    });
});

test.describe('External WMTS RESTful base layer — map @readonly', () => {

    test('Tiles are requested with the ResourceURL template of the capabilities', async ({ page }) => {
        /** @type {string[]} */
        const capabilitiesRequests = [];
        await page.route(/basemap\.de/, async (route) => {
            capabilitiesRequests.push(route.request().url());
            // Same headers as basemap.de: the capabilities are read with fetch
            await route.fulfill({
                contentType: 'application/octet-stream',
                headers: { 'Access-Control-Allow-Origin': '*' },
                path: playwrightTestFile('mock', 'external_wmts_rest_basemap', 'wmts_capabilities_web_raster.xml'),
            });
        });
        /** @type {string[]} */
        const tileRequests = [];
        await page.route(/sgx\.geodatenzentrum\.de/, async (route) => {
            tileRequests.push(route.request().url());
            await route.fulfill({
                path: playwrightTestFile('mock', 'transparent_tile.png'),
            });
        });

        const project = new ProjectPage(page, 'external_wmts_rest_basemap');
        // The project has no overlay layer, so no legend is requested
        project.waitForGetLegendGraphicDuringLoad = false;
        const tileRequestPromise = page.waitForRequest(/sgx\.geodatenzentrum\.de/);
        await project.open();

        await expect(page.locator('#switcher-baselayer')).toContainText('basemapde');

        const tileRequest = await tileRequestPromise;
        expect(tileRequest.url()).toMatch(tileUrlRegExp);

        // The capabilities document is only read, no tile is requested from it
        expect(capabilitiesRequests).toEqual([capabilitiesUrl]);
        for (const url of tileRequests) {
            expect(url).toMatch(tileUrlRegExp);
        }

        await page.unroute(/basemap\.de/);
        await page.unroute(/sgx\.geodatenzentrum\.de/);
    });

    test('The layer is fetched through QGIS Server when the capabilities cannot be read', async ({ page }) => {
        await page.route(/basemap\.de/, route => route.abort());
        /** @type {string[]} */
        const tileRequests = [];
        await page.route(/sgx\.geodatenzentrum\.de/, async (route) => {
            tileRequests.push(route.request().url());
            await route.abort();
        });
        // Do not let QGIS Server fetch the external tiles
        await page.route(
            url => url.searchParams.get('REQUEST') === 'GetMap' && url.searchParams.get('LAYERS') === 'basemapde',
            route => route.fulfill({ path: playwrightTestFile('mock', 'transparent_tile.png') })
        );

        const project = new ProjectPage(page, 'external_wmts_rest_basemap');
        // The project has no overlay layer, so no legend is requested
        project.waitForGetLegendGraphicDuringLoad = false;
        const getMapPromise = project.waitForGetMapRequest('basemapde');
        await project.open();

        const getMapRequest = await getMapPromise;
        const url = new URL(getMapRequest.url());
        expect(url.pathname).toContain('/index.php/lizmap/service');
        expect(url.searchParams.get('repository')).toBe('testsrepository');
        expect(url.searchParams.get('project')).toBe('external_wmts_rest_basemap');
        expect(tileRequests).toHaveLength(0);

        await page.unroute(/basemap\.de/);
        await page.unroute(/sgx\.geodatenzentrum\.de/);
    });
});
