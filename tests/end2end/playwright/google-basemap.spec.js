
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';

test.describe('Google Maps Baselayers @readonly', () => {
    test('Load map with no API Key', async ({ page }) => {
        const project = new ProjectPage(page, 'google_basemap');
        await project.open();

        // baselayers group should be hidden since it is empty due to the default STRICT_GOOGLE_TOS_CHECK env variable value = TRUE
        await expect(page.locator('#switcher-baselayer.hide')).toHaveCount(1);

    });

    test('Load map with dummy API Key', async ({ page }) => {
        // listen to the requests to intercept failing ones
        let initGoogleRequestsCount = 0;
        page.on('response', response => {
            if(response.url().includes('createSession?key=dummy') && response.status() !== 200) {
                initGoogleRequestsCount++;
            }
        });

        const project = new ProjectPage(page, 'google_apikey_basemap');
        await project.open();

        // there are three Google base layers in the project, so the expected number of failing requests is three
        expect(initGoogleRequestsCount).toBe(4);
        // baselayers group should be visible...
        await expect(page.locator('#switcher-baselayer')).toBeVisible();

        //.. and should contain the three Google base layers (not loaded)
        let options = page.locator('#switcher-baselayer').getByRole('combobox').locator('option');
        await expect(options).toHaveCount(4);
        expect(await options.nth(0).getAttribute('value')).toBe('Google Streets');
        expect(await options.nth(1).getAttribute('value')).toBe('Google Satellite');
        expect(await options.nth(2).getAttribute('value')).toBe('Google Hybrid');
        expect(await options.nth(3).getAttribute('value')).toBe('Google Terrain');
    });
});
