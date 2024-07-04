// @ts-check
import { test, expect } from '@playwright/test';
const { gotoMap } = require('./globals')

export async function goBackHomeAfterError(page) {
    await page.getByRole('link', { name: 'Go back to the home page.' }).click();
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

})
