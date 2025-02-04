// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Helper to get back to the home page
 * @param {Page} page The page object
 */
export async function goBackHomeAfterError(page) {
    await page.getByRole('link', { name: 'Home' }).click();
    const checked_url = new URL(page.url());
    expect(checked_url.pathname).toBe('/');
}

test.describe('Error occurred', () => {

    test('Loading map with an error', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=invalid_layer';
        // Error catch
        await gotoMap(url, page, false);
        // Go back home
        await goBackHomeAfterError(page);
    })

    test('Project  error', async ({ page }) => {
        await page.route('**/service/getProjectConfig*', async route => {
            await route.abort()
        });
        // Error catch
        await gotoMap('/index.php/view/map/?repository=testsrepository&project=world-3857', page, false);
        // Go back home
        await goBackHomeAfterError(page);
    })

    test('GetCapabilities WMS error', async ({ page }) => {
        await page.route(/SERVICE=WMS&REQUEST=GetCapabilities/, async route => {
            await route.abort()
        });
        // Error catch
        await gotoMap('/index.php/view/map/?repository=testsrepository&project=world-3857', page, false);
        // Go back home
        await goBackHomeAfterError(page);
    })

    test('GetCapabilities WMTS error', async ({ page }) => {
        await page.route(/SERVICE=WMTS&REQUEST=GetCapabilities/, async route => {
            await route.abort()
        });
        // Error catch
        await gotoMap('/index.php/view/map/?repository=testsrepository&project=world-3857', page, false);
        // Go back home
        await goBackHomeAfterError(page);
    })

    test('GetCapabilities WFS error', async ({ page }) => {
        await page.route(/SERVICE=WFS&REQUEST=GetCapabilities/, async route => {
            await route.abort()
        });
        // Error catch
        await gotoMap('/index.php/view/map/?repository=testsrepository&project=world-3857', page, false);
        // Go back home
        await goBackHomeAfterError(page);
    })

    test('Loading map without an error', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=attribute_table';
        await gotoMap(url, page);
    })

    //    test('The map must fail because of the JavaScript file', async ({ page }) => {
    //        // Flag is inactive, JavaScript files are loaded, an error will be raised
    //        const url = '/index.php/view/map?repository=testsrepository&project=javascript_error&no_user_defined_js=0';
    //        await gotoMap(url, page, false, 1);
    //    });

    test('The map must load, despite the JavaScript file having an error', async ({ page }) => {
        // Flag is active, no JavaScript file loaded, no JavaScript error will be raised
        const url = '/index.php/view/map?repository=testsrepository&project=javascript_error&no_user_defined_js=1';
        await gotoMap(url, page, true);
    });
})
