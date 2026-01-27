// @ts-check
import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js'
import { expect as responseExpect } from './fixtures/expect-response.js'
import { ProjectPage } from "./pages/project";

test.describe('NavBar @readonly', () => {

    const locale = 'en-US';

    test('Zoom in then zoom to initial extent', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');

        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();

        // Check request
        let getMapRequest = await getMapRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /740242.9\d+,6258377.5\d+,803610.7\d+,6300247.9\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);

        // Check response
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (250000).toLocaleString(locale));

        // Zoom in
        getMapRequestPromise = project.waitForGetMapRequest();
        await page.locator('#navbar button.btn.zoom-in').click();
        // Check request
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters['BBOX'] = /759253.2\d+,6270938.6\d+,784600.4\d+,6287686.8\d+/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (100000).toLocaleString(locale));

        // Zoom in
        getMapRequestPromise = project.waitForGetMapRequest();
        await page.locator('#navbar button.btn.zoom-in').click();
        // Check request
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters['BBOX'] = /765590.0\d+,6275125.6\d+,778263.6\d+,6283499.7\d+/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (50000).toLocaleString(locale));

        // Zoom to initial extent
        await page.locator('#navbar button.btn.zoom-extent').click();
        // No GetMap request because of some OpenLayers cache

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (250000).toLocaleString(locale));
    });

    test('Zoom out then zoom to initial extent', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');

        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();

        // Check request
        let getMapRequest = await getMapRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /740242.9\d+,6258377.5\d+,803610.7\d+,6300247.9\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);

        // Check response
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (250000).toLocaleString(locale));

        // Zoom in
        getMapRequestPromise = project.waitForGetMapRequest();
        await page.locator('#navbar button.btn.zoom-out').click();
        // Check request
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters['BBOX'] = /708559.0\d+,6237442.3\d+,835294.6\d+,6321183.1\d+/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (500000).toLocaleString(locale));

        // Zoom in
        getMapRequestPromise = project.waitForGetMapRequest();
        await page.locator('#navbar button.btn.zoom-out').click();
        // Check request
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters['BBOX'] = /645191.1\d+,6195571.9\d+,898662.5\d+,6363053.5\d+/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (1000000).toLocaleString(locale));

        // Zoom to initial extent
        await page.locator('#navbar button.btn.zoom-extent').click();
        // No GetMap request because of some OpenLayers cache

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (250000).toLocaleString(locale));
    });
});
