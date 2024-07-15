// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Attribute table', () => {
    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=attribute_table';
        await gotoMap(url, page)
    });

    test('Thumbnail class generate img with good path', async ({ page }) => {
        await page.locator('a#button-attributeLayers').click();
        // display form
        //await page.locator('#button-edition').click();
        await page.locator('#attribute-layer-list-table').locator('button[value=Les_quartiers_a_Montpellier]').click();
        await expect(page.locator('#attribute-layer-table-Les_quartiers_a_Montpellier tbody tr')).toHaveCount(7);

        // mediaFile as stored in data-src attributes
        const mediaFile = await page.locator('#attribute-layer-table-Les_quartiers_a_Montpellier img.data-attr-thumbnail').first().getAttribute('data-src');
        // ensure src contain "dynamic" mediaFile
        await expect(page.locator('#attribute-layer-table-Les_quartiers_a_Montpellier img.data-attr-thumbnail').first()).toHaveAttribute('src', new RegExp(mediaFile));
        // ensure src contain getMedia and projet URL
        await expect(page.locator('#attribute-layer-table-Les_quartiers_a_Montpellier img.data-attr-thumbnail').first()).toHaveAttribute('src', /getMedia\?repository=testsrepository&project=attribute_table&/);
    })
})
