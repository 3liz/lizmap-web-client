// @ts-check
import { test, expect } from '@playwright/test';
import { checkJson } from './globals';
import { ProjectPage } from "./pages/project.js";

test.describe('Location search @readonly', () => {

    test('Default', async ({ page }) => {
        const project = new ProjectPage(page, 'location_search');
        project.waitForGetLegendGraphicDuringLoad = false;
        await project.open();

        const searchLocator = page.getByPlaceholder('Search');

        await expect(searchLocator).toHaveCount(1);

        await searchLocator.click();
        await searchLocator.fill('arceaux');

        let ignPromise = page.waitForRequest(/data.geopf.fr/);
        await searchLocator.press('Enter');
        let ignRequest = await ignPromise;
        await ignRequest.response();

        await expect(page.getByText('IGN', { exact: true })).toHaveCount(1);
        await expect(page.getByText('Map data', { exact: true })).toHaveCount(1);

        await searchLocator.click();
        await searchLocator.fill('mosson');

        let searchPromise = page.waitForRequest(/searchFts/);
        await searchLocator.press('Enter');
        let searchRequest = await searchPromise;
        await searchRequest.response();

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

        const project = new ProjectPage(page, 'location_search');
        project.waitForGetLegendGraphicDuringLoad = false;
        await project.open();
        const searchLocator = page.getByPlaceholder('Search');

        await expect(searchLocator).toHaveCount(1);

        await searchLocator.click();
        await searchLocator.fill('arceaux');

        let ignPromise = page.waitForRequest(/data.geopf.fr/);
        await searchLocator.press('Enter');
        let ignRequest = await ignPromise;
        await ignRequest.response();

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

        const project = new ProjectPage(page, 'location_search');
        project.waitForGetLegendGraphicDuringLoad = false;
        await project.open();
        const searchLocator = page.getByPlaceholder('Search');

        await expect(searchLocator).toHaveCount(1);

        await searchLocator.click();
        await searchLocator.fill('arceaux');

        let searchPromise = page.waitForRequest(/searchFts/);
        await searchLocator.press('Enter');
        let searchRequest = await searchPromise;
        await searchRequest.response();

        await expect(page.getByText('IGN', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Map data', { exact: true })).toHaveCount(1);

        await searchLocator.click();
        await searchLocator.fill('mosson');

        searchPromise = page.waitForRequest(/searchFts/);
        await searchLocator.press('Enter');
        searchRequest = await searchPromise;
        await searchRequest.response();

        await expect(page.getByText('Map data', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Quartier', { exact: true })).toHaveCount(1);
    });

});


test.describe('Lizmap Search HTTP code',
    {
        tag: ['@requests', '@readonly'],
    }, () => {

        test('Check wrong requests', async ({request}) => {
            const params = new URLSearchParams({
                'repository': 'testsrepository',
                'project': 'location_search',
                'query': 'Montpellier',
            });
            let response = await request.get(`/index.php/lizmap/searchFts/get?${params}`);
            await checkJson(response);

            params.set('query', 'Tokyo');
            response = await request.get('/index.php/lizmap/searchFts/get?',{params});
            await checkJson(response, 200);

            params.set('query', '');
            response = await request.get('/index.php/lizmap/searchFts/get?',{params});
            await checkJson(response, 400);

            params.set('query', 'Montpellier');
            params.set('project', 'does_not_exist');
            response = await request.get('/index.php/lizmap/searchFts/get?',{params});
            await checkJson(response, 400);

            params.set('project', 'location_search');
            params.set('repository', 'does_not_exist');
            response = await request.get('/index.php/lizmap/searchFts/get?',{params});
            await checkJson(response, 400);
        });
    }
);
