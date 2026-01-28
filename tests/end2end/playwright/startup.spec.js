// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from "./pages/project";

test.describe('Startup', () => {

    test('Zoom to features extent', async ({ page }) => {
        const project = new ProjectPage(page, 'startup');
        const getMapPromise = project.waitForGetMapRequest();
        await project.openWithExtraParams({
            'layer': 'sousquartiers',
            'filter': '"quartmno" = \'PA\' OR "quartmno" = \'HO\'',
        });

        // Wait for image stability
        await getMapPromise;

        await expect(page.locator('#message')).toBeHidden();

        // Hide all elements but #map and its children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        expect(await page.locator('#newOlMap').screenshot()).toMatchSnapshot('zoom-features-extent.png', {
            maxDiffPixels: 700
        });
    });

    test('Zoom to features extent - error', async ({ page }) => {
        const project = new ProjectPage(page, 'startup');
        const getMapPromise = project.waitForGetMapRequest();
        await project.openWithExtraParams({
            'layer': 'sousquartiers',
            'filter': 'unknown_column("quartmno")',
        });

        // Wait for image stability
        await getMapPromise;

        await expect(page.locator('#message')).not.toBeHidden();
        await expect(page.locator('#lizmap-startup-features-error-message')).toHaveCount(1);
    });

    test('Projects with dot or space can load', async ({ page }) => {
        let project = new ProjectPage(page, 'base_layers with space');
        await project.open();
        await page.$eval("#map, #map *", el => el.style.visibility = 'visible');
        await expect(page.locator('#node-quartiers')).toHaveCount(1);

        project = new ProjectPage(page, 'base_layers.withdot');
        await project.open();
        await page.$eval("#map, #map *", el => el.style.visibility = 'visible');

        await expect(page.locator('#node-quartiers')).toHaveCount(1);
    });
});
