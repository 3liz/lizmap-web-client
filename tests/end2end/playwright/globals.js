// @ts-check
const { expect } = require('@playwright/test');

export async function gotoMap(url, page) {
    // Wait for WMS GetCapabilities promise
    let getCapabilitiesWMSPromise = page.waitForRequest(/SERVICE=WMS&REQUEST=GetCapabilities/);
    // Wait for WMS GetLegendGraphic promise
    const getLegendGraphicPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('GetLegendGraphic') === true);
    await page.goto(url);
    // Wait for WMS GetCapabilities
    await getCapabilitiesWMSPromise;
    // Wait for WMS GetLegendGraphic
    await getLegendGraphicPromise;
    // Check no error message displayed
    expect(page.getByText('An error occurred while loading this map. Some necessary resources may temporari')).toHaveCount(0);
    // Wait to be sure the map is ready
    await page.waitForTimeout(1000)
}
