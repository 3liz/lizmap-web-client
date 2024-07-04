// @ts-check
const { expect } = require('@playwright/test');

export async function gotoMap(url, page, check = true) {
    // TODO keep this function synchronized with the Cypress equivalent

    // Wait for WMS GetCapabilities promise
    let getCapabilitiesWMSPromise = page.waitForRequest(/SERVICE=WMS&REQUEST=GetCapabilities/);
    await page.goto(url);

    // Wait for WMS GetCapabilities
    await getCapabilitiesWMSPromise;
    if (check) {
        // Wait for WMS GetLegendGraphic promise
        const getLegendGraphicPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('GetLegendGraphic') === true);
        // Normal check about the map
        // Wait for WMS GetLegendGraphic
        await getLegendGraphicPromise;
        // No error
        await expect(page.locator('p.error-msg')).toHaveCount(0);
        await expect(page.locator('#switcher lizmap-treeview ul li')).not.toHaveCount(0);
        // Check no error message displayed
        await expect(page.getByText('An error occurred while loading this map. Some necessary resources may temporari')).toHaveCount(0);
        // Wait to be sure the map is ready
        await page.waitForTimeout(1000)
    } else {
        // Error
        await expect(page.locator('p.error-msg')).toHaveCount(1);
        await expect(page.locator('#switcher lizmap-treeview ul li')).toHaveCount(0);
        // Error message displayed
        await expect(page.getByText('An error occurred while loading this map. Some necessary resources may temporari')).toBeVisible();
        // Go back home link
        await expect(page.getByRole('link', { name: 'Go back to the home page.' })).toHaveCount(1);
    }
}
