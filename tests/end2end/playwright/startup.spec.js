// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Startup', () => {

    test('Zoom to features extent', async ({ page }) => {
        const getMapPromise = page.waitForRequest(/GetMap/);
        const url = '/index.php/view/map/?repository=testsrepository&project=startup&layer=sousquartiers&filter="quartmno"%20=%20%27PA%27%20OR%20"quartmno"%20=%20%27HO%27';
        await gotoMap(url, page)

        // Wait for image stability
        await getMapPromise;

        // Hide all elements but #map and its children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        expect(await page.locator('#newOlMap').screenshot()).toMatchSnapshot('zoom-features-extent.png', {
            maxDiffPixels: 700
        });
    });

    test('Projects with dot or space can load', async ({ page }) => {
        const url_dots = '/index.php/view/map/?repository=testsrepository&project=base_layers+with+space';
        await gotoMap(url_dots, page)
        await page.$eval("#map, #map *", el => el.style.visibility = 'visible');
        await expect(page.locator('#node-quartiers')).toHaveCount(1);

        const url_space = '/index.php/view/map/?repository=testsrepository&project=base_layers.withdot';
        await gotoMap(url_space, page)
        await page.$eval("#map, #map *", el => el.style.visibility = 'visible');

        await expect(page.locator('#node-quartiers')).toHaveCount(1);
    });
});
