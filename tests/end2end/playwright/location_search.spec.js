// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'
import { getAuthStorageStatePath } from './globals.js';
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
        let response = await searchRequest.response();
        // check response
        responseExpect(response).toBeJson();

        // check body
        let body = await response?.json();
        expect(body).toHaveProperty('Quartier');

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
        let response = await searchRequest.response();
        // check response
        responseExpect(response).toBeJson();

        // check body
        let body = await response?.json();
        expect(body).not.toHaveProperty('Quartier');

        await expect(page.getByText('IGN', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Map data', { exact: true })).toHaveCount(1);
        await expect(page.getByText('No results', { exact: true })).toHaveCount(1);

        await searchLocator.click();
        await searchLocator.fill('mosson');

        searchPromise = page.waitForRequest(/searchFts/);
        await searchLocator.press('Enter');
        searchRequest = await searchPromise;
        response = await searchRequest.response();
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response?.json();
        expect(body).toHaveProperty('Quartier');

        await expect(page.getByText('Map data', { exact: true })).toHaveCount(0);
        await expect(page.getByText('No results', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Quartier', { exact: true })).toHaveCount(1);
        await expect(page.getByText('PA - MOSSON', { exact: true })).toHaveCount(1);

        await searchLocator.click();
        await searchLocator.fill('ceve');

        searchPromise = page.waitForRequest(/searchFts/);
        await searchLocator.press('Enter');
        searchRequest = await searchPromise;
        response = await searchRequest.response();
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response?.json();
        expect(body).toHaveProperty('Quartier');

        await expect(page.getByText('Map data', { exact: true })).toHaveCount(0);
        await expect(page.getByText('No results', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Quartier', { exact: true })).toHaveCount(1);
        await expect(page.getByText('PA - MOSSON', { exact: true })).toHaveCount(0);
        await expect(page.getByText('CV - LES CEVENNES', { exact: true })).toHaveCount(1);
    });

    test('Disabled', async ({ page }) => {
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['searches'] = [
            ];
            await route.fulfill({ response, json });
        });

        const project = new ProjectPage(page, 'location_search');
        project.waitForGetLegendGraphicDuringLoad = false;
        await project.open();
        const searchLocator = page.getByPlaceholder('Search');

        await expect(searchLocator).toHaveCount(0);
    });

});

test.describe('Location search - form_advanced - anonymous - @readonly', () => {

    test('Default', async ({ page }) => {
        const project = new ProjectPage(page, 'form_advanced');
        await project.open();

        const searchLocator = page.getByPlaceholder('Search');

        await expect(searchLocator).toHaveCount(1);

        await searchLocator.click();
        await searchLocator.fill('arceaux');

        let searchPromise = page.waitForRequest(/searchFts/);
        await searchLocator.press('Enter');
        let searchRequest = await searchPromise;
        let response = await searchRequest.response();
        // check response
        responseExpect(response).toBeJson();

        // check body
        let body = await response?.json();
        expect(body).not.toHaveProperty('Quartier');
        expect(body).not.toHaveProperty('Sous-Quartier');

        await expect(page.getByText('IGN', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Map data', { exact: true })).toHaveCount(1);
        await expect(page.getByText('No results', { exact: true })).toHaveCount(1);
        await expect(page.getByText('Quartier', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Sous-Quartier', { exact: true })).toHaveCount(0);

        await searchLocator.click();
        await searchLocator.fill('mosson');

        searchPromise = page.waitForRequest(/searchFts/);
        await searchLocator.press('Enter');
        searchRequest = await searchPromise;
        response = await searchRequest.response();
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response?.json();
        expect(body).toHaveProperty('Quartier');
        expect(body).not.toHaveProperty('Sous-Quartier');

        await expect(page.getByText('Map data', { exact: true })).toHaveCount(0);
        await expect(page.getByText('No results', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Quartier', { exact: true })).toHaveCount(1);
        await expect(page.getByText('PA - MOSSON', { exact: true })).toHaveCount(1);
        await expect(page.getByText('Sous-Quartier', { exact: true })).toHaveCount(0);

        await searchLocator.click();
        await searchLocator.fill('ceve');

        searchPromise = page.waitForRequest(/searchFts/);
        await searchLocator.press('Enter');
        searchRequest = await searchPromise;
        response = await searchRequest.response();
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response?.json();
        expect(body).toHaveProperty('Quartier');
        expect(body).not.toHaveProperty('Sous-Quartier');

        await expect(page.getByText('Map data', { exact: true })).toHaveCount(0);
        await expect(page.getByText('No results', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Quartier', { exact: true })).toHaveCount(1);
        await expect(page.getByText('PA - MOSSON', { exact: true })).toHaveCount(0);
        await expect(page.getByText('CV - LES CEVENNES', { exact: true })).toHaveCount(1);
        await expect(page.getByText('Sous-Quartier', { exact: true })).toHaveCount(0);
    });

});

test.describe('Location search - form_advanced - admin - @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('admin') });

    test('Default', async ({ page }) => {
        const project = new ProjectPage(page, 'form_advanced');
        await project.open();

        const searchLocator = page.getByPlaceholder('Search');

        await expect(searchLocator).toHaveCount(1);

        await searchLocator.click();
        await searchLocator.fill('arceaux');

        let searchPromise = page.waitForRequest(/searchFts/);
        await searchLocator.press('Enter');
        let searchRequest = await searchPromise;
        let response = await searchRequest.response();
        // check response
        responseExpect(response).toBeJson();

        // check body
        let body = await response?.json();
        expect(body).not.toHaveProperty('Quartier');
        expect(body).toHaveProperty('Sous-Quartier');

        await expect(page.getByText('IGN', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Map data', { exact: true })).toHaveCount(0);
        await expect(page.getByText('No results', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Quartier', { exact: true })).toHaveCount(0);
        await expect(page.getByText('PA - MOSSON', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Sous-Quartier', { exact: true })).toHaveCount(1);
        await expect(page.getByText('MCA - Les Arceaux', { exact: true })).toHaveCount(1);

        await searchLocator.click();
        await searchLocator.fill('mosson');

        searchPromise = page.waitForRequest(/searchFts/);
        await searchLocator.press('Enter');
        searchRequest = await searchPromise;
        response = await searchRequest.response();
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response?.json();
        expect(body).toHaveProperty('Quartier');
        expect(body).not.toHaveProperty('Sous-Quartier');

        await expect(page.getByText('Map data', { exact: true })).toHaveCount(0);
        await expect(page.getByText('No results', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Quartier', { exact: true })).toHaveCount(1);
        await expect(page.getByText('PA - MOSSON', { exact: true })).toHaveCount(1);
        await expect(page.getByText('Sous-Quartier', { exact: true })).toHaveCount(0);

        await searchLocator.click();
        await searchLocator.fill('ceve');

        searchPromise = page.waitForRequest(/searchFts/);
        await searchLocator.press('Enter');
        searchRequest = await searchPromise;
        response = await searchRequest.response();
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response?.json();
        expect(body).toHaveProperty('Quartier');
        expect(body).toHaveProperty('Sous-Quartier');

        await expect(page.getByText('Map data', { exact: true })).toHaveCount(0);
        await expect(page.getByText('No results', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Quartier', { exact: true })).toHaveCount(1);
        await expect(page.getByText('PA - MOSSON', { exact: true })).toHaveCount(0);
        await expect(page.getByText('CV - LES CEVENNES', { exact: true })).toHaveCount(1);
        await expect(page.getByText('Sous-Quartier', { exact: true })).toHaveCount(1);
        await expect(page.getByText('CVN - LES CEVENNES', { exact: true })).toHaveCount(1);
    });

});
