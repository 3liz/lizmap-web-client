// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Location search', () => {

    test('Default', async ({ page }) => {
        const url = '/index.php/view/map?repository=testsrepository&project=location_search';
        await gotoMap(url, page, true, 0, false);

        await expect(page.getByPlaceholder('Search')).toHaveCount(1);

        await page.getByPlaceholder('Search').click();
        await page.getByPlaceholder('Search').fill('arceaux');

        let ignPromise = page.waitForRequest(/data.geopf.fr/);

        await page.getByPlaceholder('Search').press('Enter');
        await ignPromise;

        await expect(page.getByText('IGN', { exact: true })).toHaveCount(1);
        await expect(page.getByText('Map data', { exact: true })).toHaveCount(1);

        await page.getByPlaceholder('Search').click();
        await page.getByPlaceholder('Search').fill('mosson');

        let searchPromise = page.waitForRequest(/searchFts/);
        await page.getByPlaceholder('Search').press('Enter');
        await searchPromise;

        await expect(page.getByText('IGN', { exact: true })).toHaveCount(1);
        await expect(page.getByText('Map data', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Quartier', { exact: true })).toHaveCount(1);
    });

    test('Only IGN', async ({ page }) => {
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['searches'] = [
                {
                    "type": "externalSearch",
                    "service": "ign"
                }
            ];
            await route.fulfill({ response, json });
        });

        const url = '/index.php/view/map?repository=testsrepository&project=location_search';
        await gotoMap(url, page, true, 0, false);
        await expect(page.getByPlaceholder('Search')).toHaveCount(1);

        await page.getByPlaceholder('Search').click();
        await page.getByPlaceholder('Search').fill('arceaux');

        let ignPromise = page.waitForRequest(/data.geopf.fr/);

        await page.getByPlaceholder('Search').press('Enter');
        await ignPromise;

        await expect(page.getByText('IGN', { exact: true })).toHaveCount(1);
        await expect(page.getByText('Map data', { exact: true })).toHaveCount(0);
    });

    test('Only Fts', async ({ page }) => {
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['searches'] = [
                {
                    "type": "Fts",
                    "service": "lizmapFts",
                    "url": "/index.php/lizmap/searchFts/get"
                }
            ];
            await route.fulfill({ response, json });
        });

        const url = '/index.php/view/map?repository=testsrepository&project=location_search';
        await gotoMap(url, page, true, 0, false);

        await expect(page.getByPlaceholder('Search')).toHaveCount(1);

        await page.getByPlaceholder('Search').click();
        await page.getByPlaceholder('Search').fill('arceaux');

        let searchPromise = page.waitForRequest(/searchFts/);

        await page.getByPlaceholder('Search').press('Enter');
        await searchPromise;

        await expect(page.getByText('IGN', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Map data', { exact: true })).toHaveCount(1);

        await page.getByPlaceholder('Search').click();
        await page.getByPlaceholder('Search').fill('mosson');

        searchPromise = page.waitForRequest(/searchFts/);
        await page.getByPlaceholder('Search').press('Enter');
        await searchPromise;

        await expect(page.getByText('Map data', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Quartier', { exact: true })).toHaveCount(1);
    });

});
