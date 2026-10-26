// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'
import { ProjectPage } from "./pages/project";

test.describe('Zoom to layer', () => {

    test('Projection EPSG:4326', async ({ page }) => {
        // Go to world 4326 project
        const project = new ProjectPage(page, 'world-4326');
        let worldGetMapRequestPromise = project.waitForGetMapRequest('world');
        let rectangleGetMapRequestPromise = project.waitForGetMapRequest('rectangle');
        await project.open();
        let [
            worldGetMapRequest, rectangleGetMapRequest
        ] = await Promise.all([
            worldGetMapRequestPromise, rectangleGetMapRequestPromise
        ]);
        responseExpect(await worldGetMapRequest.response()).toBeImagePng();
        responseExpect(await rectangleGetMapRequest.response()).toBeImagePng();

        // Open sub dock rectangle
        await page.getByTestId('rectangle').hover();
        await page.getByTestId('rectangle').locator('.icon-info-sign').click();

        // Zoom to 'rectangle' layer
        worldGetMapRequestPromise = project.waitForGetMapRequest('world');
        rectangleGetMapRequestPromise = project.waitForGetMapRequest('rectangle');
        await page.click('#sub-dock button.layerActionZoom');
        [
            worldGetMapRequest, rectangleGetMapRequest
        ] = await Promise.all([
            worldGetMapRequestPromise, rectangleGetMapRequestPromise
        ]);
        responseExpect(await worldGetMapRequest.response()).toBeImagePng();
        responseExpect(await rectangleGetMapRequest.response()).toBeImagePng();

        // Click on the map to get a popup
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(480, 340);
        let getFeatureInfoRequest = await getFeatureInfoPromise;
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Check popup displayed
        const popup = page.locator('#mapmenu li.nav-dock.popupcontent');
        await expect(popup).toHaveClass(/active/);
        const popupTitle = page.locator('#popupcontent div.lizmapPopupContent h4.lizmapPopupTitle');
        await expect(popupTitle).toHaveCount(1);

        // Open sub dock world
        await page.click('#button-switcher');
        await page.getByTestId('world').hover();
        await page.getByTestId('world').locator('.icon-info-sign').click();

        // Zoom to 'world' layer
        worldGetMapRequestPromise = project.waitForGetMapRequest('world');
        rectangleGetMapRequestPromise = project.waitForGetMapRequest('rectangle');
        await page.click('#sub-dock button.layerActionZoom');
        [
            worldGetMapRequest, rectangleGetMapRequest
        ] = await Promise.all([
            worldGetMapRequestPromise, rectangleGetMapRequestPromise
        ]);
        responseExpect(await worldGetMapRequest.response()).toBeImagePng();
        responseExpect(await rectangleGetMapRequest.response()).toBeImagePng();

        // Click on the map to get no popup
        getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(480, 340);
        getFeatureInfoRequest = await getFeatureInfoPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Check no popup displayed
        await expect(popup).toHaveClass(/active/);
        await expect(popupTitle).not.toBeVisible();
    });

    test('Projection EPSG:3857', async ({ page }) => {
        // Go to world 3857 project
        const project = new ProjectPage(page, 'world-3857');
        let worldGetMapRequestPromise = project.waitForGetMapRequest('world');
        let rectangleGetMapRequestPromise = project.waitForGetMapRequest('rectangle');
        await project.open();
        let [
            worldGetMapRequest, rectangleGetMapRequest
        ] = await Promise.all([
            worldGetMapRequestPromise, rectangleGetMapRequestPromise
        ]);
        responseExpect(await worldGetMapRequest.response()).toBeImagePng();
        responseExpect(await rectangleGetMapRequest.response()).toBeImagePng();

        // Open sub dock rectangle
        await page.getByTestId('rectangle').hover();
        await page.getByTestId('rectangle').locator('.icon-info-sign').click();

        // Zoom to 'rectangle' layer
        worldGetMapRequestPromise = project.waitForGetMapRequest('world');
        rectangleGetMapRequestPromise = project.waitForGetMapRequest('rectangle');
        await page.click('#sub-dock button.layerActionZoom');
        [
            worldGetMapRequest, rectangleGetMapRequest
        ] = await Promise.all([
            worldGetMapRequestPromise, rectangleGetMapRequestPromise
        ]);
        responseExpect(await worldGetMapRequest.response()).toBeImagePng();
        responseExpect(await rectangleGetMapRequest.response()).toBeImagePng();

        // Click on the map to get a popup
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(480, 340);
        let getFeatureInfoRequest = await getFeatureInfoPromise;
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Check popup displayed
        const popup = page.locator('#mapmenu li.nav-dock.popupcontent');
        await expect(popup).toHaveClass(/active/);
        const popupTitle = page.locator('#popupcontent div.lizmapPopupContent h4.lizmapPopupTitle');
        await expect(popupTitle).toHaveCount(1);

        // Open sub dock world
        await page.click('#button-switcher');
        await page.getByTestId('world').hover();
        await page.getByTestId('world').locator('.icon-info-sign').click();

        // Zoom to 'world' layer
        worldGetMapRequestPromise = project.waitForGetMapRequest('world');
        rectangleGetMapRequestPromise = project.waitForGetMapRequest('rectangle');
        await page.click('#sub-dock button.layerActionZoom');
        [
            worldGetMapRequest, rectangleGetMapRequest
        ] = await Promise.all([
            worldGetMapRequestPromise, rectangleGetMapRequestPromise
        ]);
        responseExpect(await worldGetMapRequest.response()).toBeImagePng();
        responseExpect(await rectangleGetMapRequest.response()).toBeImagePng();

        // Click on the map to get no popup
        getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(480, 340);
        getFeatureInfoRequest = await getFeatureInfoPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Check no popup displayed
        await expect(popup).toHaveClass(/active/);
        await expect(popupTitle).not.toBeVisible();
    });
});
