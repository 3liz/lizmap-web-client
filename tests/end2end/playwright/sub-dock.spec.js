// @ts-check
import { dirname } from 'path';
import * as fs from 'fs/promises'
import { existsSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import { test, expect } from '@playwright/test';
import { playwrightTestFile , expectParametersToContain } from './globals';
import { ProjectPage } from "./pages/project";

// To update OSM and GeoPF tiles in the mock directory
// IMPORTANT, this must not be set to `true` while committing, on GitHub. Set to `false`.
const UPDATE_MOCK_FILES = false;
// Source - https://stackoverflow.com/a
// Posted by Martin Thomson, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-13, License - CC BY-SA 4.0

/**
 * Convert a Buffer to an Uint8Array
 * @param {Buffer} buffer a buffer to convert to an Uint8Array
 * @returns {Uint8Array} the buffer converted to an Uint8Array
 */
function toUint8Array(buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return view;
}


test.describe('Sub dock @readonly', () => {

    test('Test base layers opacities', async ({ page }) => {

        await page.route('https://tile.openstreetmap.org/*/*/*.png', async (route) => {
            const request = await route.request();
            //GetTiles.push(request.url());

            // Build path file in mock directory
            const pathFile = playwrightTestFile('mock', 'base_layers', 'osm', 'tiles' + (new URL(request.url()).pathname));
            if (UPDATE_MOCK_FILES) {
                // Save file in mock directory
                const response = await route.fetch();
                await fs.mkdir(dirname(pathFile), { recursive: true })
                const respBuff = await response.body();
                await fs.writeFile(pathFile, toUint8Array(respBuff), 'binary')
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
        const clipScreenshot = {x:432, y:256, width:256, height:256};

        const project = new ProjectPage(page, 'base_layers');
        await project.open();

        // Check base layers
        await expect(page.locator('lizmap-base-layers select option')).toHaveCount(11);
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('osm-mapnik');

        // Display base layer metadata
        await expect(page.locator('#sub-dock')).toBeHidden();
        await page.locator('#get-baselayer-metadata').click();
        await expect(page.locator('#sub-dock')).toBeVisible();
        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Opacity');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(0)).toHaveText('osm-mapnik');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(1)).toHaveText('Layer');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('100');

        // Get osm-mapnik 100 rendering
        let buffer = await page.screenshot({clip:clipScreenshot});
        const osm100ByteLength = buffer.byteLength;
        await expect(osm100ByteLength).toBeGreaterThan(110000); // 115892
        await expect(osm100ByteLength).toBeLessThan(120000) // 115892

        // Change opacity for osm-mapnik to 60
        await page.locator('#sub-dock .btn-opacity-layer', { hasText: '60' }).click();
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');

        // Get osm-mapnik 60 rendering
        buffer = await page.screenshot({clip:clipScreenshot});
        const osm60ByteLength = buffer.byteLength;
        await expect(osm60ByteLength).toBeLessThan(osm100ByteLength);
        await expect(osm60ByteLength).toBeLessThan(110000); // 106330

        // Change base layer to quartiers_baselayer
        let getMapRequestPromise = page.waitForRequest(/REQUEST=GetMap/);
        await page.locator('lizmap-base-layers select').selectOption('quartiers_baselayer');
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('quartiers_baselayer');
        // Wait for request and response
        let getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();
        // Check GetMap request
        const getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'quartiers_baselayer',
            'CRS': 'EPSG:3857',
            'STYLES': '',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /412967.3\d+,5393197.8\d+,449580.6\d+,5417390.1\d+/,
        }
        await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);
        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Opacity');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(0)).toHaveText('quartiers_baselayer');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(1)).toHaveText('Layer');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('100');

        // Get quartiers_baselayer 20 rendering
        buffer = await page.screenshot({clip:clipScreenshot});
        const quartiers100ByteLength = buffer.byteLength;
        await expect(quartiers100ByteLength).toBeGreaterThan(15000); // 18024
        await expect(quartiers100ByteLength).toBeLessThan(20000) // 18024

        // Change opacity for quartiers_baselayer to 20
        await page.locator('#sub-dock .btn-opacity-layer', { hasText: '20' }).click();
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('20');

        // Get quartiers_baselayer 20 rendering
        buffer = await page.screenshot({clip:clipScreenshot});
        const quartiers20ByteLength = buffer.byteLength;
        await expect(quartiers20ByteLength).toBeLessThan(quartiers100ByteLength);
        await expect(quartiers20ByteLength).toBeLessThan(15000); // 106330

        // Back to osm-mapnik
        await page.locator('lizmap-base-layers select').selectOption('osm-mapnik');
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('osm-mapnik');
        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Opacity');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(0)).toHaveText('osm-mapnik');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(1)).toHaveText('Layer');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');

        // Check osm-mapnik 60 buffer
        buffer = await page.screenshot({clip:clipScreenshot});
        await expect(buffer.byteLength).toBeLessThan(osm100ByteLength);
        await expect(buffer.byteLength).toBe(osm60ByteLength);

        // Close sub-dock
        await expect(page.locator('#hide-sub-dock')).toBeVisible();
        await page.locator('#hide-sub-dock').click();
        await expect(page.locator('#sub-dock')).toBeHidden();

        // Back to quartiers_baselayer
        await page.locator('lizmap-base-layers select').selectOption('quartiers_baselayer');
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('quartiers_baselayer');

        // Display base layer metadata
        await expect(page.locator('#sub-dock')).toBeHidden();
        await page.locator('#get-baselayer-metadata').click();
        await expect(page.locator('#sub-dock')).toBeVisible();
        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Opacity');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(0)).toHaveText('quartiers_baselayer');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(1)).toHaveText('Layer');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('20');

        // Check quartiers_baselayer 20 buffer
        buffer = await page.screenshot({clip:clipScreenshot});
        await expect(buffer.byteLength).toBeLessThan(quartiers100ByteLength);
        await expect(buffer.byteLength).toBe(quartiers20ByteLength);

        // Remove listen to osm tiles
        await page.unroute('https://tile.openstreetmap.org/*/*/*.png');
    });

    test('Metadata layer in attribute table project', async ({ page }) => {
        const project = new ProjectPage(page, 'attribute_table');
        await project.open();

        // Display info button
        await expect(page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign')).toBeHidden();
        await page.getByTestId('Les quartiers à Montpellier').hover();
        await expect(page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign')).toBeVisible();

        // Display sub dock metadata
        await expect(page.locator('#sub-dock')).toBeHidden();
        await page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(5);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Opacity');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(4)).toHaveText('Export');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd')).toHaveCount(5);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(0)).toHaveText('Les quartiers à Montpellier');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(1)).toHaveText('Layer');

        //close sub dock
        await expect(page.locator('#hide-sub-dock')).toBeVisible();
        await page.locator('#hide-sub-dock').click();
        await expect(page.locator('#sub-dock')).toBeHidden();

        // Display sub dock metadata for group
        await page.getByTestId('relation').locator('> div.group > div.node').hover();
        await expect(page.getByTestId('relation').locator('> div.group > div.node .icon-info-sign')).toBeVisible();
        await page.getByTestId('relation').locator('> div.group > div.node .icon-info-sign').click();
        await expect(page.locator('#hide-sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Opacity');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(0)).toHaveText('relation');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(1)).toHaveText('Group');

        //close sub dock
        await expect(page.locator('#hide-sub-dock')).toBeVisible();
        await page.locator('#hide-sub-dock').click();
        await expect(page.locator('#sub-dock')).toBeHidden();
    });

    test('Metadata one on two layers in WFS with attribute table config', async ({ page }) => {
        const project = new ProjectPage(page, 'permalink');
        await project.open();

        // Display sub dock metadata for layer in WFS with multiple styles
        await page.getByTestId('sousquartiers').hover();
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(6);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Change layer style');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(4)).toHaveText('Opacity');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(5)).toHaveText('Export');

        // Display sub dock metadata for layer not in WFS and no multiple styles
        await page.getByTestId('Les quartiers à Montpellier').hover();
        await page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Opacity');
    });

    test('Export layer with attribute table config', async ({ page }) => {
        const project = new ProjectPage(page, 'permalink');
        await project.open();

        // Display sub dock metadata
        await page.getByTestId('sousquartiers').hover();
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Export
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(5)).toHaveText('Export');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd select.exportLayer')).toHaveCount(1);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd button.exportLayer')).toHaveCount(1);
        await page.locator('#sub-dock .sub-metadata .menu-content dd select.exportLayer').selectOption('GeoJSON');
        const getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await page.locator('#sub-dock .sub-metadata .menu-content dd button.exportLayer').click();
        const getFeatureRequest = await getFeatureRequestPromise;
        const expectedParameters = {
            'SERVICE': 'WFS',
            'REQUEST': 'GetFeature',
            'VERSION': '1.0.0',
            'OUTPUTFORMAT': 'GeoJSON',
            'TYPENAME': 'sousquartiers',
        };
        await expectParametersToContain('Export GeoJSON from sub-dock', getFeatureRequest.postData() ?? '', expectedParameters);
        const response = await getFeatureRequest.response();

        // check response
        expect(response?.ok()).toBeTruthy();
        expect(response?.status()).toBe(200);
        // check content-type header
        expect(response?.headers()['content-type']).toContain('application/vnd.geo+json');
    });

    test('Metadata one on two layers in WFS without attribute table config', async ({ page }) => {
        // Remove attribute table config
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.attributeLayers = {};
            await route.fulfill({ response, json });
        });

        const project = new ProjectPage(page, 'permalink');
        await project.open();

        // Display sub dock metadata for layer in WFS with multiple styles
        await page.getByTestId('sousquartiers').hover();
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(6);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Change layer style');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(4)).toHaveText('Opacity');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(5)).toHaveText('Export');

        // Display sub dock metadata for layer not in WFS and no multiple styles
        await page.getByTestId('Les quartiers à Montpellier').hover();
        await page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Opacity');
    });

    test('Export layer without attribute table config', async ({ page }) => {
        // Remove attribute table config
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.attributeLayers = {};
            await route.fulfill({ response, json });
        });

        const project = new ProjectPage(page, 'permalink');
        await project.open();

        // Display sub dock metadata
        await page.getByTestId('sousquartiers').hover();
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Export
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(5)).toHaveText('Export');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd select.exportLayer')).toHaveCount(1);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd button.exportLayer')).toHaveCount(1);
        await page.locator('#sub-dock .sub-metadata .menu-content dd select.exportLayer').selectOption('GeoJSON');
        const getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await page.locator('#sub-dock .sub-metadata .menu-content dd button.exportLayer').click();
        const getFeatureRequest = await getFeatureRequestPromise;
        const expectedParameters = {
            'SERVICE': 'WFS',
            'REQUEST': 'GetFeature',
            'VERSION': '1.0.0',
            'OUTPUTFORMAT': 'GeoJSON',
            'TYPENAME': 'sousquartiers',
        };
        await expectParametersToContain('Export GeoJSON from sub-dock', getFeatureRequest.postData() ?? '', expectedParameters);
        const response = await getFeatureRequest.response();

        // check response
        expect(response?.ok()).toBeTruthy();
        expect(response?.status()).toBe(200);
        // check content-type header
        expect(response?.headers()['content-type']).toContain('application/vnd.geo+json');
    });

    test('Metadata one on two layers in WFS with export disable in attribute table config', async ({ page }) => {
        // Remove attribute table config
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.attributeLayers.sousquartiers.export_enabled = 'False';
            await route.fulfill({ response, json });
        });

        const project = new ProjectPage(page, 'permalink');
        await project.open();

        // Display sub dock metadata for layer in WFS with multiple styles
        await page.getByTestId('sousquartiers').hover();
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(5);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Change layer style');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(4)).toHaveText('Opacity');

        // Display sub dock metadata for layer not in WFS and no multiple styles
        await page.getByTestId('Les quartiers à Montpellier').hover();
        await page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Opacity');
    });
});
