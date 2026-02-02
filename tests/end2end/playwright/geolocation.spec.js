// @ts-check
import { dirname } from 'path';
import * as fs from 'fs/promises'
import { existsSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';
import { playwrightTestFile, digestBuffer } from "./globals";

// To update OSM and GeoPF tiles in the mock directory
// IMPORTANT, this must not be set to `true` while committing, on GitHub. Set to `false`.
const UPDATE_MOCK_FILES = false;

test.describe('Geolocation @readonly', () => {

    const locale = 'en-US';

    /** @type {string[]} */
    let osmTiles = [];

    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'geolocation');
        project.waitForGetLegendGraphicDuringLoad = false;
        project.layersInTreeView = 0;

        // Catch all tiles requests from openstreetmap to mock them
        await page.route('https://tile.openstreetmap.org/*/*/*.png', async (route) => {
            const request = route.request();
            osmTiles.push(request.url());

            // Build path file in mock directory
            const pathFile = playwrightTestFile('mock', 'geolocation', 'osm', 'tiles' + (new URL(request.url()).pathname));
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

    test('Geolocation Default UI', async ({ page }) => {
        //const project = new ProjectPage(page, 'geolocation');

        // Grant geolocation permission and set geolocation
        page.context().grantPermissions(['geolocation']);
        page.context().setGeolocation({
            latitude: 43.6214338643574,
            longitude: 3.84280215159599,
            accuracy: 100,
        });

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (50000000).toLocaleString(locale));

        // Check button to open geolocation
        const geolocationButton = page.locator('#button-geolocation');
        await expect(geolocationButton).toBeVisible();
        await geolocationButton.click();

        // Check dock
        const geolocationDock = page.locator('#geolocation');
        await expect(geolocationDock).toBeVisible();
        await expect(geolocationDock.locator('.title .text')).toHaveText('Geolocation');
        const geolocationDockButtonBar = geolocationDock.locator('.button-bar');
        await expect(geolocationDockButtonBar).toBeVisible();
        await expect(geolocationDockButtonBar.getByRole('button', { name: 'Start', exact: true })).toHaveCount(1);
        await expect(geolocationDockButtonBar.getByRole('button', { name: 'Start', exact: true })).toBeVisible();
        await expect(geolocationDockButtonBar.getByRole('button', { name: 'Center', exact: true })).toHaveCount(1);
        await expect(geolocationDockButtonBar.getByRole('button', { name: 'Center', exact: true })).toBeVisible();
        await expect(geolocationDockButtonBar.getByRole('button', { name: 'Stay centered', exact: true })).toHaveCount(1);
        await expect(geolocationDockButtonBar.getByRole('button', { name: 'Stay centered', exact: true })).toBeVisible();
        await expect(geolocationDockButtonBar.locator('input')).toHaveCount(1);
        await expect(geolocationDockButtonBar.locator('input')).toBeVisible();
        await expect(geolocationDockButtonBar.locator('input')).toHaveValue('10');
        const geolocationDockInfos = geolocationDock.locator('.geolocation-infos');
        await expect(geolocationDockInfos).toBeVisible();
        const geolocationDockCoords = geolocationDock.locator('.geolocation-coords');
        await expect(geolocationDockCoords).toBeVisible();
        await expect(geolocationDockCoords.locator('div')).toHaveCount(2);
        await expect(geolocationDockCoords.locator('div').nth(0)).toHaveText('X :');
        await expect(geolocationDockCoords.locator('div').nth(1)).toHaveText('Y :');
        const geolocationDockAccuracy = geolocationDock.locator('.geolocation-accuracy');
        await expect(geolocationDockAccuracy).toBeVisible();
        await expect(geolocationDockAccuracy).toHaveText('Accuracy (m) :');
    });

    test('Geolocation start and stop', async ({ page }) => {
        const project = new ProjectPage(page, 'geolocation');
        const screenshotClip = {x:850/2-380/2, y:700/2-380/2, width:380, height:380};

        // Wait for request and response
        while (osmTiles.length < 12) {
            await page.waitForResponse('https://tile.openstreetmap.org/*/*/*.png', { timeout: 10000 });
        }

        // Grant geolocation permission and set geolocation
        page.context().grantPermissions(['geolocation']);
        page.context().setGeolocation({
            latitude: 43.6214338643574,
            longitude: 3.84280215159599,
            accuracy: 1000,
        });

        const geolocationButton = page.locator('#button-geolocation');
        await geolocationButton.click();

        // Catch osm tile
        /** @type {string[]} */
        osmTiles = [];

        // Start geolocation
        const geolocationDock = page.locator('#geolocation');
        const geolocationDockButtonBar = geolocationDock.locator('.button-bar');
        await geolocationDockButtonBar.getByRole('button', { name: 'Start', exact: true }).click();

        // check dock
        await expect(geolocationDockButtonBar.getByRole('button', { name: 'Start', exact: true })).toHaveCount(0);
        await expect(geolocationDockButtonBar.getByRole('button', { name: 'Stop', exact: true })).toHaveCount(1);
        const geolocationDockCoords = geolocationDock.locator('.geolocation-coords');
        await expect(geolocationDockCoords.locator('div').nth(0)).toHaveText('X : 3.842802');
        await expect(geolocationDockCoords.locator('div').nth(1)).toHaveText('Y : 43.621434');
        const geolocationDockAccuracy = geolocationDock.locator('.geolocation-accuracy');
        await expect(geolocationDockAccuracy).toHaveText('Accuracy (m) : 1000');

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (25000).toLocaleString(locale));

        // Wait for request and response
        while (osmTiles.length < 6) {
            await page.waitForResponse('https://tile.openstreetmap.org/*/*/*.png', { timeout: 10000 });
        }

        // Check that we catch 6 tiles
        expect(osmTiles.length).toBeGreaterThanOrEqual(6);
        // Check that every tiles are from level 19
        expect(osmTiles[0]).toMatch(/\/15\/\d{5}\/\d{5}\.png/)
        expect(osmTiles[1]).toMatch(/\/15\/\d{5}\/\d{5}\.png/)
        expect(osmTiles[2]).toMatch(/\/15\/\d{5}\/\d{5}\.png/)
        expect(osmTiles[3]).toMatch(/\/15\/\d{5}\/\d{5}\.png/)
        expect(osmTiles[4]).toMatch(/\/15\/\d{5}\/\d{5}\.png/)
        expect(osmTiles[5]).toMatch(/\/15\/\d{5}\/\d{5}\.png/)

        // Blank map
        await project.baseLayerSelect.selectOption('project-background-color');
        await expect(project.baseLayerSelect).toHaveValue('project-background-color');

        // Wait for OL transition
        await page.waitForTimeout(500);

        // Get acc 1000 buffer
        let buffer = await page.screenshot({
            clip: screenshotClip,
            // path: playwrightTestFile('__screenshots__','geolocation.spec.js','pos.png'),
        });
        const acc1000Hash = await digestBuffer(buffer);
        const acc1000ByteLength = buffer.byteLength;
        expect(acc1000ByteLength).toBeGreaterThan(4000); // 4161 - 5471 - 7898
        expect(acc1000ByteLength).toBeLessThan(8000); // 4161 - 5471 - 7898

        // Stop geolocation
        await geolocationDockButtonBar.getByRole('button', { name: 'Stop', exact: true }).click();

        // Get blank buffer
        buffer = await page.screenshot({
            clip: screenshotClip,
            // path: playwrightTestFile('__screenshots__','geolocation.spec.js','blank.png'),
        });
        const blankHash = await digestBuffer(buffer);
        expect(blankHash).not.toBe(acc1000Hash);
        const blankByteLength = buffer.byteLength;
        expect(blankByteLength).toBeLessThan(acc1000ByteLength);
        expect(blankByteLength).toBeGreaterThan(1000); // 1286 - 3562
        expect(blankByteLength).toBeLessThan(4000); // 1286 - 3562

        // check dock
        await expect(geolocationDockButtonBar.getByRole('button', { name: 'Stop', exact: true })).toHaveCount(0);
        await expect(geolocationDockButtonBar.getByRole('button', { name: 'Start', exact: true })).toHaveCount(1);
        await expect(geolocationDockCoords.locator('div').nth(0)).toHaveText('X :');
        await expect(geolocationDockCoords.locator('div').nth(1)).toHaveText('Y :');
        await expect(geolocationDockAccuracy).toHaveText('Accuracy (m) :');

        // Change accuracy
        page.context().setGeolocation({
            latitude: 43.6214338643574,
            longitude: 3.84280215159599,
            accuracy: 100,
        });

        // Catch osm tile
        osmTiles = [];

        // Restart on new accuracy
        await geolocationDockButtonBar.getByRole('button', { name: 'Start', exact: true }).click();

        // check dock
        await expect(geolocationDockButtonBar.getByRole('button', { name: 'Start', exact: true })).toHaveCount(0);
        await expect(geolocationDockButtonBar.getByRole('button', { name: 'Stop', exact: true })).toHaveCount(1);
        await expect(geolocationDockCoords.locator('div').nth(0)).toHaveText('X : 3.842802');
        await expect(geolocationDockCoords.locator('div').nth(1)).toHaveText('Y : 43.621434');
        await expect(geolocationDockAccuracy).toHaveText('Accuracy (m) : 100');

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (25000).toLocaleString(locale));

        // Get acc 100 buffer
        buffer = await page.screenshot({
            clip: screenshotClip,
            // path: playwrightTestFile('__screenshots__','geolocation.spec.js','blank.png'),
        });
        const acc100Hash = await digestBuffer(buffer);
        expect(acc100Hash).not.toBe(acc1000Hash);
        expect(acc100Hash).not.toBe(blankHash);
        const acc100ByteLength = buffer.byteLength;
        expect(acc100ByteLength).toBeGreaterThan(blankByteLength);
        expect(acc100ByteLength).toBeLessThan(acc1000ByteLength);
        expect(acc100ByteLength).toBeGreaterThan(1750); // 1911
        expect(acc100ByteLength).toBeLessThan(5750); // 1911

        // Wait for request and response
        // while (osmTiles.length < 6) {
        //     await page.waitForResponse('https://tile.openstreetmap.org/*/*/*.png', { timeout: 10000 });
        // }

        /*
        // Check that we catch 6 tiles
        expect(osmTiles.length).toBeGreaterThanOrEqual(6);
        // Check that every tiles are from level 19
        expect(osmTiles[0]).toMatch(/\/19\/\d{6}\/\d{6}\.png/);
        expect(osmTiles[1]).toMatch(/\/19\/\d{6}\/\d{6}\.png/);
        expect(osmTiles[2]).toMatch(/\/19\/\d{6}\/\d{6}\.png/);
        expect(osmTiles[3]).toMatch(/\/19\/\d{6}\/\d{6}\.png/);
        expect(osmTiles[4]).toMatch(/\/19\/\d{6}\/\d{6}\.png/);
        expect(osmTiles[5]).toMatch(/\/19\/\d{6}\/\d{6}\.png/);
        */
    });
});
