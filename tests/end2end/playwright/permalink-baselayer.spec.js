// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap, reloadMap, playwrightTestFile } from './globals';
import { ProjectPage } from './pages/project';

/**
 * Dedicated coverage for storing/restoring the selected base layer in a
 * permalink (the share link / geobookmark hash). The `base_layers` project
 * defines several base layers (`osm-mapnik` is the startup one), so we can
 * switch to another one and check it survives a permalink round-trip.
 */
test.describe('Permalink base layer @readonly', () => {

    test.beforeEach(async ({ page }) => {
        // Force automatic permalink so the URL hash reflects the map state
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['automatic_permalink'] = true;
            await route.fulfill({ response, json });
        });

        // Mock OpenStreetMap tiles (default base layer) with a transparent tile
        // so the test does not depend on the external OSM tile server.
        await page.route('https://tile.openstreetmap.org/*/*/*.png', async route => {
            await route.fulfill({
                path: playwrightTestFile('mock', 'transparent_tile.png')
            });
        });
    });

    test.afterEach(async ({ page }) => {
        await page.unroute('**/service/getProjectConfig*');
        await page.unroute('https://tile.openstreetmap.org/*/*/*.png');
    });

    test('Selected base layer is stored in the hash and restored on reload', async ({ page }) => {
        const project = new ProjectPage(page, 'base_layers');
        await project.open();

        // Startup base layer
        await expect(project.baseLayerSelect).toHaveValue('osm-mapnik');

        // Switch to the empty base layer
        await project.baseLayerSelect.selectOption('empty');
        await expect(project.baseLayerSelect).toHaveValue('empty');

        // The base layer is written as the last segment of the permalink hash
        let hash = decodeURIComponent(new URL(page.url()).hash);
        await expect(hash.length).toBeGreaterThan(0);
        await expect(hash.split('|').pop()).toBe('empty');

        // Reload: the empty base layer must be restored from the hash
        await reloadMap(page);
        await expect(project.baseLayerSelect).toHaveValue('empty');

        // Switch to a project base layer and check the round-trip again
        await project.baseLayerSelect.selectOption('quartiers_baselayer');
        await expect(project.baseLayerSelect).toHaveValue('quartiers_baselayer');

        hash = decodeURIComponent(new URL(page.url()).hash);
        await expect(hash.split('|').pop()).toBe('quartiers_baselayer');

        await reloadMap(page);
        await expect(project.baseLayerSelect).toHaveValue('quartiers_baselayer');
    });

    test('Base layer from a shared permalink URL is applied on load', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=base_layers';
        const bbox = '3.7980645260916805,43.59756940064654,3.904383263124536,43.672963842067254';
        // Classic hash format: bbox|layers|styles|opacities|baselayer
        // (empty layers/styles/opacities: only the base layer is shared)
        const url = baseUrl + '#' + bbox + '||||quartiers_baselayer';

        // No overlay layer is visible, so no GetLegendGraphic is expected
        await gotoMap(url, page, true, 0, false);

        const project = new ProjectPage(page, 'base_layers');
        // The shared base layer must be selected, not the project startup one
        await expect(project.baseLayerSelect).toHaveValue('quartiers_baselayer');
    });

    test('Unknown base layer in the hash is ignored (falls back to startup)', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=base_layers';
        const bbox = '3.7980645260916805,43.59756940064654,3.904383263124536,43.672963842067254';
        const url = baseUrl + '#' + bbox + '||||does_not_exist';

        await gotoMap(url, page, true, 0, false);

        // No error and the startup base layer stays selected
        await expect(page.locator('p.error-msg')).toHaveCount(0);
        const project = new ProjectPage(page, 'base_layers');
        await expect(project.baseLayerSelect).toHaveValue('osm-mapnik');
    });

});
