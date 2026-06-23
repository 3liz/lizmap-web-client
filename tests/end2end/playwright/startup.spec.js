// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from "./pages/project";
import { expect as requestExpect } from './fixtures/expect-request.js';
import { expect as responseExpect } from './fixtures/expect-response.js';

test.describe('Startup', () => {

    test('Zoom to features extent', async ({ page }) => {
        const project = new ProjectPage(page, 'startup');
        const getMapPromise = project.waitForGetMapRequest();
        await project.openWithExtraParams({
            'layer': 'sousquartiers',
            'filter': '"quartmno" = \'PA\' OR "quartmno" = \'HO\'',
        });

        // Wait for image stability
        await getMapPromise;

        await expect(page.locator('#message')).toBeHidden();

        // Hide all elements but #map and its children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        expect(await page.locator('#newOlMap').screenshot()).toMatchSnapshot('zoom-features-extent.png', {
            maxDiffPixels: 700
        });
    });

    test('Zoom to features extent - error', async ({ page }) => {
        const project = new ProjectPage(page, 'startup');
        const getMapPromise = project.waitForGetMapRequest();
        await project.openWithExtraParams({
            'layer': 'sousquartiers',
            'filter': 'unknown_column("quartmno")',
        });

        // Wait for image stability
        await getMapPromise;

        await expect(page.locator('#message')).not.toBeHidden();
        await expect(page.locator('#lizmap-startup-features-error-message')).toHaveCount(1);
    });

    test('Zoom to features extent and show popup with popup=true', async ({ page }) => {
        const project = new ProjectPage(page, 'startup');
        const getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.openWithExtraParams({
            'layer': 'sousquartiers',
            'filter': '"quartmno" = \'PA\' OR "quartmno" = \'HO\'',
            'popup': 'true',
        });

        // Wait for the GetFeatureInfo request triggered by popup=true
        const getFeatureInfoRequest = await getFeatureInfoPromise;
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData({
            'REQUEST': 'GetFeatureInfo',
            'LAYERS': 'sousquartiers',
        });

        // Wait for the GetFeatureInfo response and check it is HTML
        const getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // The popup dock must be visible with feature content
        await expect(project.map.locator('#liz_layer_popup')).toBeVisible();
        const singleFeatures = await project.getPopupSingleFeatures();
        await expect(singleFeatures).not.toHaveCount(0);
    });

    test('Projects with dot or space can load', async ({ page }) => {
        let project = new ProjectPage(page, 'base_layers with space');
        await project.open();
        await page.$eval("#map, #map *", el => el.style.visibility = 'visible');
        await expect(page.locator('#node-quartiers')).toHaveCount(1);

        project = new ProjectPage(page, 'base_layers.withdot');
        await project.open();
        await page.$eval("#map, #map *", el => el.style.visibility = 'visible');

        await expect(page.locator('#node-quartiers')).toHaveCount(1);
    });
});
