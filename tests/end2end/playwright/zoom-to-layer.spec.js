import { test, expect } from '@playwright/test';
import { ProjectPage } from "./pages/project";

test.describe('Zoom to layer', () => {

    test('Projection EPSG:4326', async ({ page }) => {
        // Go to world 4326 project
        const project = new ProjectPage(page, 'world-4326');
        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();
        let getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();
        getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

        // Zoom to 'rectangle' layer
        getMapRequestPromise = project.waitForGetMapRequest();
        await page.click('#node-rectangle ~ .node .layer-actions .icon-info-sign', { force: true });
        await page.click('#sub-dock button.layerActionZoom');
        getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

        // Click on the map to get a popup
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(480, 340);
        await getFeatureInfoPromise;

        // Check popup displayed
        const popup = page.locator('#mapmenu li.nav-dock.popupcontent');
        await expect(popup).toHaveClass(/active/);
        const popupTitle = page.locator('#popupcontent div.lizmapPopupContent h4.lizmapPopupTitle');
        await expect(popupTitle).toHaveCount(1);

        // Zoom to 'world' layer
        getMapRequestPromise = project.waitForGetMapRequest();
        await page.click('#button-switcher');
        await page.click('#node-world ~ .node .layer-actions .icon-info-sign', { force: true });
        await page.click('#sub-dock button.layerActionZoom');
        getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

        // Click on the map to get no popup
        getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(480, 340);
        let getFeatureInfoRequest = await getFeatureInfoPromise;
        await getFeatureInfoRequest.response();

        // Check no popup displayed
        await expect(popup).toHaveClass(/active/);
        await expect(popupTitle).not.toBeVisible();
    });

    test('Projection EPSG:3857', async ({ page }) => {
        // Go to world 3857 project
        const project = new ProjectPage(page, 'world-3857');
        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();
        let getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();
        getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

        // Zoom to 'rectangle' layer
        getMapRequestPromise = project.waitForGetMapRequest();
        await page.click('#node-rectangle ~ .node .layer-actions .icon-info-sign', { force: true });
        await page.click('#sub-dock button.layerActionZoom');
        getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

        // Click on the map to get a popup
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(480, 340);
        await getFeatureInfoPromise;

        // Check popup displayed
        const popup = page.locator('#mapmenu li.nav-dock.popupcontent');
        await expect(popup).toHaveClass(/active/);
        const popupTitle = page.locator('#popupcontent div.lizmapPopupContent h4.lizmapPopupTitle');
        await expect(popupTitle).toHaveCount(1);

        // Zoom to 'world' layer
        getMapRequestPromise = project.waitForGetMapRequest();
        await page.click('#button-switcher');
        await page.click('#node-world ~ .node .layer-actions .icon-info-sign', { force: true });
        await page.click('#sub-dock button.layerActionZoom');
        getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

        // Click on the map to get no popup
        getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(480, 340);
        let getFeatureInfoRequest = await getFeatureInfoPromise;
        await getFeatureInfoRequest.response();

        // Check no popup displayed
        await expect(popup).toHaveClass(/active/);
        await expect(popupTitle).not.toBeVisible();
    });
});
