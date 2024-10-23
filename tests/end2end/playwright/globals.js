// @ts-check
const { expect } = require('@playwright/test');

async function NoErrors(page, checkLayerTreeView = true) {
    // No error
    await expect(page.locator('p.error-msg')).toHaveCount(0);
    if (checkLayerTreeView) {
        await expect(page.locator('#switcher lizmap-treeview ul li')).not.toHaveCount(0);
    }
    // Check no error message displayed
    await expect(page.getByText('An error occurred while loading this map. Some necessary resources may temporari')).toHaveCount(0);
}

/**
 * CatchErrors function
 * Some checks when the map is on error
 * @param page The page object
 * @param int layersInTreeView The number of layers to find in the treeview.
 */
async function CatchErrors(page, layersInTreeView = 0) {
    // Error
    await expect(page.locator('p.error-msg')).toHaveCount(1);
    await expect(page.locator('#switcher lizmap-treeview ul li')).toHaveCount(layersInTreeView);
    // Error message displayed
    await expect(page.getByText('An error occurred while loading this map. Some necessary resources may temporari')).toBeVisible();
    // Go back home link
    await expect(page.getByRole('link', { name: 'Home' })).toHaveCount(1);
}

/**
 * gotoMap function
 * Helper to load a map and do some basic checks
 * @param string url The URL of the map to load
 * @param page The page object
 * @param boolean mapMustLoad If the loading of the map must be successful or not. Some error might be triggered when loading the map, on purpose.
 * @param int layersInTreeView The number of layers to find in the treeview if the map is on error.
 * @param boolean waitForGetLegendGraphics
 */
export async function gotoMap(url, page, mapMustLoad = true, layersInTreeView = 0, waitForGetLegendGraphics = true) {
    // TODO keep this function synchronized with the Cypress equivalent

    // Wait for WMS GetCapabilities promise
    let getCapabilitiesWMSPromise = page.waitForRequest(/SERVICE=WMS&REQUEST=GetCapabilities/);
    await page.goto(url);

    // Wait for WMS GetCapabilities
    await getCapabilitiesWMSPromise;
    if (mapMustLoad) {
        if (waitForGetLegendGraphics) {
            // Wait for WMS GetLegendGraphic promise
            const getLegendGraphicPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('GetLegendGraphic') === true);
            // Normal check about the map
            // Wait for WMS GetLegendGraphic
            await getLegendGraphicPromise;
        }
        // No error
        await NoErrors(page, waitForGetLegendGraphics);
        // Wait to be sure the map is ready
        await page.waitForTimeout(1000)
    } else {
        // Wait to be sure the map is ready
        await page.waitForTimeout(1000)
        // Error
        await CatchErrors(page, layersInTreeView);
    }
}

export async function reloadMap(page, check = true) {
    // TODO keep this function synchronized with the Cypress equivalent

    // Wait for WMS GetCapabilities promise
    let getCapabilitiesWMSPromise = page.waitForRequest(/SERVICE=WMS&REQUEST=GetCapabilities/);
    await page.reload();

    // Wait for WMS GetCapabilities
    await getCapabilitiesWMSPromise;
    if (check) {
        // Wait for WMS GetLegendGraphic promise
        const getLegendGraphicPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('GetLegendGraphic') === true);
        // Normal check about the map
        // Wait for WMS GetLegendGraphic
        await getLegendGraphicPromise;
        // No error
        await NoErrors(page);
        // Wait to be sure the map is ready
        await page.waitForTimeout(1000)
    } else {
        // Error
        await CatchErrors(page);
    }
}
