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
        // ensure src contain "dynamic" mediaFile
        await expect(project.attributeTableHtml(layerName).locator('img.data-attr-thumbnail').first()).toHaveAttribute('src', new RegExp(mediaFile));
        // ensure src contain getMedia and projet URL
        await expect(project.attributeTableHtml(layerName).locator('img.data-attr-thumbnail').first()).toHaveAttribute('src', /getMedia\?repository=testsrepository&project=attribute_table&/);
    })
})
