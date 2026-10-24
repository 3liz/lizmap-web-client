// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js';
import { ProjectPage } from './pages/project';
import { playwrightTestFile } from './globals';

/**
 * Launch the DXF export from the opened dock
 * @param {import('@playwright/test').Page} page The page
 * @returns {Promise<URLSearchParams>} The parameters of the DXF GetMap request
 */
async function launchDxfExport(page) {
    const requestPromise = page.waitForRequest(
        request => request.method() === 'POST' && (request.postData() ?? '').includes('FORMAT=application%2Fdxf')
    );
    await page.locator('#dxfexport-launch').click();
    const request = await requestPromise;
    return new URLSearchParams(request.postData() ?? '');
}

test.describe('DXF export @readonly', () => {

    test.beforeEach(async ({ page }) => {
        // Do not request OpenStreetMap tiles
        await page.route('https://tile.openstreetmap.org/*/*/*.png', async (route) => {
            await route.fulfill({
                path: playwrightTestFile('mock', 'transparent_tile.png')
            });
        });

        const project = new ProjectPage(page, 'dxf_export');
        await project.open();
    });

    test.afterEach(async ({ page }) => {
        await page.unroute('https://tile.openstreetmap.org/*/*/*.png');
    });

    test('Only layers enabled for DXF export are listed and exported', async ({ page }) => {
        const project = new ProjectPage(page, 'dxf_export');
        // The startup base layer is disabled for DXF export
        await expect(project.baseLayerSelect).toHaveValue('locations_base_disabled');
        // Both layers are visible, but only popup_bar is enabled for DXF export
        await expect(page.getByTestId('popup_bar').locator('input').first()).toBeChecked();
        await expect(page.getByTestId('locations_disabled').locator('input').first()).toBeChecked();

        await page.locator('#button-dxfexport').click();
        const layersList = page.locator('lizmap-dxfexport .dxfexport-layers li');
        await expect(layersList).toHaveCount(1);
        await expect(layersList.first()).toHaveAttribute('title', 'popup_bar');
        await expect(layersList.first()).toHaveText('Locations');

        const downloadPromise = page.waitForEvent('download');
        const params = await launchDxfExport(page);
        expect(params.get('LAYERS')).toBe('popup_bar');
        expect(params.get('STYLES')?.split(',')).toHaveLength(1);
        expect(params.get('OPACITIES')?.split(',')).toHaveLength(1);

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/^dxf_export_.*\.dxf$/);
        await expect(page.locator('.dxfexport-success')).toBeVisible();
    });

    test('Base layer enabled for DXF export is listed and exported', async ({ page }) => {
        const project = new ProjectPage(page, 'dxf_export');
        await project.baseLayerSelect.selectOption('locations_base');

        await page.locator('#button-dxfexport').click();
        const layersList = page.locator('lizmap-dxfexport .dxfexport-layers li');
        await expect(layersList).toHaveCount(2);
        await expect(layersList.nth(0)).toHaveAttribute('title', 'locations_base');
        await expect(layersList.nth(1)).toHaveAttribute('title', 'popup_bar');

        const downloadPromise = page.waitForEvent('download');
        const params = await launchDxfExport(page);
        expect(params.get('LAYERS')).toBe('locations_base,popup_bar');

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.dxf$/);
        await expect(page.locator('.dxfexport-success')).toBeVisible();
    });

    test('Base layer not published as WFS is not exported', async ({ page }) => {
        const project = new ProjectPage(page, 'dxf_export');
        await project.baseLayerSelect.selectOption('OpenStreetMap');

        await page.locator('#button-dxfexport').click();
        const layersList = page.locator('lizmap-dxfexport .dxfexport-layers li');
        await expect(layersList).toHaveCount(1);
        await expect(layersList.first()).toHaveAttribute('title', 'popup_bar');

        const params = await launchDxfExport(page);
        expect(params.get('LAYERS')).toBe('popup_bar');
    });
});

test.describe('DXF export requests @requests @readonly', () => {

    const params = new URLSearchParams({
        repository: 'testsrepository',
        project: 'dxf_export',
    });
    const url = `/index.php/lizmap/service?${params}`;

    /**
     * Build the DXF GetMap form data
     * @param {string} layers The requested layers
     * @returns {object} The form data
     */
    const dxfFormData = (layers) => ({
        'SERVICE': 'WMS',
        'REQUEST': 'GetMap',
        'VERSION': '1.3.0',
        'FORMAT': 'application/dxf',
        'CRS': 'EPSG:4326',
        'BBOX': '43.577,3.828,43.639,3.931',
        'WIDTH': '800',
        'HEIGHT': '600',
        'LAYERS': layers,
        'STYLES': '',
        'FORMAT_OPTIONS': 'MODE:NOSYMBOLOGY',
    });

    for (const layers of ['popup_bar', 'locations_base', 'locations_base,popup_bar']) {
        test(`Layers enabled for DXF export: ${layers}`, async ({ request }) => {
            const response = await request.post(url, { form: dxfFormData(layers) });
            expect(response.status()).toBe(200);
            expect(response.headers()['content-type']).toContain('application/dxf');
            expect((await response.text()).trimStart()).toMatch(/^999\s+DXF created from QGIS/);
        });
    }

    for (const [layers, disabled] of [
        ['locations_disabled', 'locations_disabled'],
        ['locations_base_disabled', 'locations_base_disabled'],
        ['popup_bar,locations_disabled', 'locations_disabled'],
    ]) {
        test(`Layer disabled for DXF export: ${layers}`, async ({ request }) => {
            const response = await request.post(url, { form: dxfFormData(layers) });
            responseExpect(response).toBeXml(403);
            const body = await response.text();
            expect(body).toContain('ServiceExceptionReport');
            expect(body).toContain(`DXF export is not enabled for the layer ${disabled}`);
        });
    }
});
