// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';
import { gotoMap } from './globals';

test.describe('Attribute table', () => {
    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=attribute_table';
        await gotoMap(url, page)
    });

    test('Thumbnail class generate img with good path', async ({ page }) => {
        const project = new ProjectPage(page, 'attribute_table');
        const layerName = 'Les_quartiers_a_Montpellier';

        await project.openAttributeTable(layerName);
        await expect(project.attributeTableHtml(layerName).locator('tbody tr')).toHaveCount(7);
        // mediaFile as stored in data-src attributes
        const mediaFile = await project.attributeTableHtml(layerName).locator('img.data-attr-thumbnail').first().getAttribute('data-src');
        expect(mediaFile).not.toBeNull
        // ensure src contain "dynamic" mediaFile
        await expect(project.attributeTableHtml(layerName).locator('img.data-attr-thumbnail').first()).toHaveAttribute('src', new RegExp(mediaFile ?? ''));
        // ensure src contain getMedia and projet URL
        await expect(project.attributeTableHtml(layerName).locator('img.data-attr-thumbnail').first()).toHaveAttribute('src', /getMedia\?repository=testsrepository&project=attribute_table&/);
    });
});

test.describe('Attribute table data restricted to map extent', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['limitDataToBbox'] = 'True';
            await route.fulfill({ response, json });
        });
        const url = '/index.php/view/map/?repository=testsrepository&project=attribute_table';
        await gotoMap(url, page)
    });

    test('Data restriction, refresh button behaviour and export', async ({ page }) => {
        const project = new ProjectPage(page, 'attribute_table');
        const layerName = 'Les_quartiers_a_Montpellier';
        await project.openAttributeTable(layerName);

        await expect(page.locator('.btn-refresh-table')).not.toHaveClass(/btn-warning/);

        const getMapPromise = page.waitForRequest(/GetMap/);

        await page.locator('lizmap-feature-toolbar:nth-child(1) > div:nth-child(1) > button:nth-child(3)').first().click();

        await getMapPromise;

        await expect(page.locator('.btn-refresh-table')).toHaveClass(/btn-warning/);

        // Refresh
        await page.locator('.btn-refresh-table').click();

        await expect(project.attributeTableHtml(layerName).locator('tbody tr')).toHaveCount(5);

        const getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('GetFeature') === true);
        // bbox in getFeature request for export
        const getFeatureRequestContains = request => {
            const postData = request.postData();
            expect(postData).toContain('SERVICE=WFS');
            expect(postData).toContain('REQUEST=GetFeature');
            expect(postData).toMatch(/BBOX=3.8258070366989356%2C43.61961486194198%2C3.897611727269447%2C43.6544002918056/);
        };

        await page.getByRole('button', { name: 'Export' }).click();
        await page.getByRole('button', { name: 'GeoJSON' }).click();

        getFeatureRequestContains(await getFeatureRequestPromise);
    });
});
