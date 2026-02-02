// @ts-check
import { dirname } from 'path';
import * as fs from 'fs/promises'
import { existsSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js';
import { expect as responseExpect } from './fixtures/expect-response.js';
import { ProjectPage } from "./pages/project";
import { playwrightTestFile } from './globals';

// To update OSM and GeoPF tiles in the mock directory
// IMPORTANT, this must not be set to `true` while committing, on GitHub. Set to `false`.
const UPDATE_MOCK_FILES = false;

// # Test the respect of WMS external layer image format

// The QGIS project contains 3 layers:

// World layer, included in the project
// 2 polygons layers hosted on
// https://liz.lizmap.com/tests/index.php/view/map?repository=testse2elwc&project=base_external_layers
// one in `image/jpeg`
// and one in `image/png`.
test.describe('External WMS layers', () => {

    test('should get correct mime type in response and not localhost', async ({ page }) => {
        // Catch openstreetmap requests to mock them
        await page.route('https://tile.openstreetmap.org/*/*/*.png', async (route) => {
            const request = route.request();

            // Build path file in mock directory
            const pathFile = playwrightTestFile('mock', 'external_wms_layer', 'osm' , 'tiles' + (new URL(request.url()).pathname));
            if (UPDATE_MOCK_FILES) {
                // Save file in mock directory for 6 tiles maximum
                const response = await route.fetch();
                await fs.mkdir(dirname(pathFile), { recursive: true })
                await fs.writeFile(pathFile, new Uint8Array(await response.body()))
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

        const project = new ProjectPage(page, 'external_wms_layer');
        await project.open();

        expect(page.getByTestId('polygons')).toContainClass('not-visible');
        expect(page.getByTestId('png')).toContainClass('not-visible');
        expect(page.getByTestId('jpeg')).toContainClass('not-visible');
        expect(page.getByTestId('world')).toContainClass('not-visible');


        // Display layer png
        let getMapRequestPromise = project.waitForGetMapRequest();
        await page.getByTestId('png').click();
        // Check Request
        let getMapRequest = await getMapRequestPromise;
        expect(getMapRequest.url()).toContain('liz.lizmap.com');

        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'repository': 'testse2elwc',
            'project': 'base_external_layers',
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'polygons',
            'CRS': 'EPSG:3857',
            'WIDTH': '958',
            'HEIGHT': '633',
            //'BBOX': /740242.9\d+,6258377.5\d+,803610.7\d+,6300247.9\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Display layer jpeg
        getMapRequestPromise = project.waitForGetMapRequest();
        await page.getByTestId('jpeg').click();
        // Check Request
        getMapRequest = await getMapRequestPromise;
        expect(getMapRequest.url()).toContain('liz.lizmap.com');
        getMapExpectedParameters['FORMAT'] = /^image\/jpeg/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImageJpeg();

        // Display layer world as a webp iamge
        getMapRequestPromise = project.waitForGetMapRequest();
        await page.getByTestId('world').click();
        // Check Request
        getMapRequest = await getMapRequestPromise;
        expect(getMapRequest.url()).toContain('localhost');
        getMapExpectedParameters['repository'] = 'testsrepository';
        getMapExpectedParameters['project'] = 'external_wms_layer';
        getMapExpectedParameters['LAYERS'] = 'world';
        getMapExpectedParameters['FORMAT'] = /^image\/webp/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImageWebp();

        // Remove listen to osm tiles
        await page.unroute('https://tile.openstreetmap.org/*/*/*.png');
    });
});
