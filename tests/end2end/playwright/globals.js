// @ts-check
const { expect } = require('@playwright/test');

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Integer
 * @typedef {number} int
 */

/**
 * Expect no errors in the map page
 * @param {Page} page The page object
 * @param {boolean} checkLayerTreeView Checking  that tree view contains layers
 */
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
 * Expect errors in the map page
 * @param {Page} page The page object
 * @param {int} layersInTreeView The number of layers to find in the tree view.
 */
async function CatchErrors(page, layersInTreeView = 0) {
    // Error
    await expect(page.locator('p.error-msg')).toHaveCount(1);
    await expect(page.locator('#switcher .lizmap-treeview ul li')).toHaveCount(layersInTreeView);
    // Error message displayed
    await expect(page.getByText('An error occurred while loading this map. Some necessary resources may temporari')).toBeVisible();
    // Go back home link
    await expect(page.getByRole('link', { name: 'Home' })).toHaveCount(1);
}

/**
 * Helper to load a map and do some basic checks
 * @param {string} url The URL of the map to load
 * @param {Page} page The page object
 * @param {boolean} mapMustLoad If the loading of the map must be successful or not. Some error might be triggered when loading the map, on purpose.
 * @param {int} layersInTreeView The number of layers to find in the treeview if the map is on error.
 * @param {boolean} waitForGetLegendGraphics
 * @deprecated Use Project page instead and migrate the test to use proper methods
 */
export async function gotoMap(url, page, mapMustLoad = true, layersInTreeView = 0, waitForGetLegendGraphics = true) {
    // TODO keep this function synchronized with the Cypress equivalent

    // Wait for WMS GetCapabilities promise
    let getCapabilitiesWMSPromise = page.waitForRequest(/SERVICE=WMS&REQUEST=GetCapabilities/);

    await expect(async () => {
        const response = await page.goto(url);
        expect(response.status()).toBe(200);
    }).toPass({
        intervals: [1_000, 2_000, 10_000],
        timeout: 60_000
    });

    // Wait for WMS GetCapabilities
    await getCapabilitiesWMSPromise;
    if (mapMustLoad) {
        if (waitForGetLegendGraphics) {
            // Wait for WMS GetLegendGraphic promise
            const getLegendGraphicPromise = page.waitForRequest(
                request => request.method() === 'POST' &&
                    request.postData() != null &&
                    request.postData()?.includes('GetLegendGraphic') === true
            );
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

/**
 * Helper to reload a map and do some basic checks
 * @param {Page} page The page object
 * @param {boolean} check If some basic checks must be done.
 */
export async function reloadMap(page, check = true) {
    // TODO keep this function synchronized with the Cypress equivalent

    // Wait for WMS GetCapabilities promise
    let getCapabilitiesWMSPromise = page.waitForRequest(/SERVICE=WMS&REQUEST=GetCapabilities/);

    await expect(async () => {
        const response = await page.reload();
        expect(response.status()).toBe(200);
    }).toPass({
        intervals: [1_000, 2_000, 10_000],
        timeout: 60_000
    });

    // Wait for WMS GetCapabilities
    await getCapabilitiesWMSPromise;
    if (check) {
        // Wait for WMS GetLegendGraphic promise
        const getLegendGraphicPromise = page.waitForRequest(
            request =>
                request.method() === 'POST' &&
                request.postData() != null &&
                request.postData()?.includes('GetLegendGraphic') === true
        );
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


/**
 * Get the last IDs when saving features as JSON
 * @param {Page} page The page object
 *
 * @return {Promise<any>} The JSON response, like {"id":"31"}
 */
export async function editedFeatureIds(page) {
    const values = await page.locator('#liz_close_feature_pk_vals').inputValue();
    return JSON.parse(values);
}

/**
 * Re-send the request with additional "__echo__" param to retrieve the OGC Request search params
 * @param {Page} page The page object
 * @param {string} url The URL to re-send
 *
 * @return {Promise<URLSearchParams>}
 */
export async function getEchoRequestParams(page, url) {
    // Re-send the request with additional echo param to retrieve the OGC Request
    let echoResponse = await page.request.get(url + '&__echo__');
    const originalUrl = decodeURIComponent(await echoResponse.text());
    // When the request has not been logged by echo proxy
    await expect(URL.canParse(originalUrl), originalUrl+' is not an URL!').toBeTruthy();
    await expect(originalUrl).not.toContain('unfound')

    return new URLSearchParams((new URL(originalUrl).search));
}

/**
 * Check parameters against an object containing expected parameters
 * @param {string}                        title Check title, for testing and debug
 * @param {string}                        parameters
 * @param {Object<string, string|RegExp>} expectedParameters
 * @returns {Promise<URLSearchParams>}
 */
export async function expectParametersToContain(title, parameters, expectedParameters) {
    const searchParams = new URLSearchParams(parameters)

    await expect(
        searchParams.size,
        `Check "${title}" : Not enough parameters compared to expected!`
    ).toBeGreaterThanOrEqual(Object.keys(expectedParameters).length)

    for (const param in expectedParameters) {
        await expect(
            searchParams.has(param),
            `Check "${title}" : ${param} not in ${Array.from(searchParams.keys()).join(', ')}`
        ).toBe(true)

        const expectedValue = expectedParameters[param]
        if (expectedValue instanceof RegExp) {
            await expect(
                searchParams.get(param),
                `Title "${title}" : ${param} does not match the expected value : expected "${expectedValue}" versus got "${searchParams.get(param)}"`
            ).toMatch(expectedValue)

        } else {
            await expect(
                searchParams.get(param),
                `Title "${title}" : ${param} has not the right value : expected "${expectedValue}" versus got "${searchParams.get(param)}"`
            ).toBe(expectedValue)
        }
    }

    return searchParams;
}
