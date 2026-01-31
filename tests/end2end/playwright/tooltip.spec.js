// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';

test.describe('Tooltip @readonly', () => {

    test('Test HTML template', async ({ page }) => {
        const project = new ProjectPage(page, 'tooltip');
        await project.open();

        await page.locator('#button-tooltip-layer').click();

        // Create the promise to wait for tooltips response
        const responsePromise = page.waitForResponse(/lizmap\/features\/tooltips/);
        // choose a layer to activate tooltip
        await page.locator('#tooltip-layer').getByRole('combobox').selectOption('quartiers');
        // wait for the response completed
        const response = await responsePromise;
        await response.finished();
        await expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toBe('application/json');
        // check body
        const body = await response.json();
        expect(body).toHaveProperty('type');
        expect(body['type']).toBe('FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body['features']).toHaveLength(7);
        // check features (use soft assertion to test all properties)
        for (const feature of body['features']) {
            expect.soft(feature).toHaveProperty('id');
            expect.soft(feature).toHaveProperty('geometry');
            expect.soft(feature).toHaveProperty('properties');
            expect.soft(feature['properties']).toHaveProperty('tooltip');
        }
        // NO error message displayed
        await expect(page.locator('#message')).not.toBeVisible();
    });

    test('Test fields', async ({ page }) => {
        const project = new ProjectPage(page, 'tooltip');
        await project.open();
        await page.locator('#button-tooltip-layer').click();

        // Create the promise to wait for tooltips response
        const responsePromise = page.waitForResponse(/lizmap\/features\/tooltips/);
        // choose a layer to activate tooltip
        await page.locator('#tooltip-layer').getByRole('combobox').selectOption('quartiers-fields');
        // wait for the response completed
        const response = await responsePromise;
        await response.finished();
        await expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toBe('application/json');
        // check body
        const body = await response.json();
        expect(body).toHaveProperty('type');
        expect(body['type']).toBe('FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body['features']).toHaveLength(7);
        // check features (use soft assertion to test all properties)
        for (const feature of body['features']) {
            expect.soft(feature).toHaveProperty('id');
            expect.soft(feature).toHaveProperty('geometry');
            expect.soft(feature).toHaveProperty('properties');
            expect.soft(feature['properties']).toHaveProperty('tooltip');
            // Test content is a table
            expect.soft(feature['properties']['tooltip']).toContain('<table');
            // Test alias is used
            expect.soft(feature['properties']['tooltip']).toContain(
                `<th>ID</th><td>${feature['id']}</td>`
            );
        }
        // NO error message displayed
        await expect(page.locator('#message')).not.toBeVisible();
    });

    test('Mocking error', async ({ page }) => {
        const project = new ProjectPage(page, 'tooltip');
        await project.open();
        await page.locator('#button-tooltip-layer').click();

        // Mocking tooltips
        await page.route('**/lizmap/features/tooltips*', async route => {
            await route.fulfill({
                status: 504,
                contentType: 'text/plain',
                body: 'Timeout',
            });
        });

        // Create the promise to wait for tooltips response
        const responsePromise = page.waitForResponse(/lizmap\/features\/tooltips/);
        // choose a layer to activate tooltip
        await page.locator('#tooltip-layer').getByRole('combobox').selectOption('quartiers');
        // wait for the response completed
        const response = await responsePromise;
        await response.finished();
        await expect(response.status()).toBe(504);
        // An error message is displayed
        await expect(page.locator('#message')).toBeVisible();

        // Remove listen to features tooltips
        await page.unroute('**/lizmap/features/tooltips*');
    });

});
