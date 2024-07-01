// @ts-check
const { expect } = require('@playwright/test');
const { subtle } = globalThis.crypto;

export async function gotoMap(url, page, check = true) {
    // TODO keep this function synchronized with the Cypress equivalent

    // Wait for WMS GetCapabilities promise
    let getCapabilitiesWMSPromise = page.waitForRequest(/SERVICE=WMS&REQUEST=GetCapabilities/);
    // Wait for WMS GetLegendGraphic promise
    const getLegendGraphicPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('GetLegendGraphic') === true);
    await page.goto(url);

    if (!check) {
        expect(page.getByText('An error occurred while loading this map. Some necessary resources may temporari')).toHaveCount(1);
    }
    // Normal check about the map

    // Wait for WMS GetCapabilities
    await getCapabilitiesWMSPromise;
    // Wait for WMS GetLegendGraphic
    await getLegendGraphicPromise;
    // Check no error message displayed
    expect(page.getByText('An error occurred while loading this map. Some necessary resources may temporari')).toHaveCount(0);
    // Wait to be sure the map is ready
    await page.waitForTimeout(1000)
}

export async function digestBuffer(buff) {
    const hashBuffer = await subtle.digest('sha-1', buff);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""); // convert bytes to hex string
    return hashHex;
}
