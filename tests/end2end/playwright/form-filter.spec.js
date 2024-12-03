// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Attribute table', () => {
    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=form_filter';
        await gotoMap(url, page);
        await page.locator('#button-filter').click();
    });

    test('Form filter with combobox', async ({ page }) => {
        const getMapPromise = page.waitForRequest(/GetMap/);

        const combo = '#liz-filter-field-test_filter';
        const countFeature = '#liz-filter-item-layer-total-count';

        // Default
        await expect(page.locator('#liz-filter-item-layer-total-count')).toHaveText('4');
        await expect(page.locator(combo + ' > option:nth-child(1)')).toHaveText(' --- ');

        // Open the attribute tables for the 2 layers
        await page.locator('#button-attributeLayers').click();
        await page.locator('button[value="form_filter__a_"].btn-open-attribute-layer').click({ force: true });
        await page.locator('#nav-tab-attribute-summary').click();
        await page.locator('button[value="form_filter_child_bus_stops"].btn-open-attribute-layer').click({ force: true });

        // Select the first one
        await page.locator(combo).selectOption('_uvres_d_art_et_monuments_de_l_espace_urbain');
        await expect(page.locator(countFeature)).toHaveText('1');

        await getMapPromise;

        // Check the attribute table shows only one line
        await page.locator('#nav-tab-attribute-layer-form_filter__a_').click({ force: true });
        await expect(page.locator('#attribute-layer-table-form_filter__a_ tbody tr')).toHaveCount(1);

        // Check the child features are filtered too (3 children)
        await page.locator('#nav-tab-attribute-layer-form_filter_child_bus_stops').click({ force: true });
        await expect(page.locator('#attribute-layer-table-form_filter_child_bus_stops tbody tr')).toHaveCount(3);

        // Reset
        page.locator('#liz-filter-unfilter').click();
        await expect(page.locator(countFeature)).toHaveText('4');

        await getMapPromise;

        // Select the second one
        await page.locator(combo).selectOption('simple_label');
        await expect(page.locator(countFeature)).toHaveText('1');

        // Check the attribute table shows only one line
        await getMapPromise;
        await page.locator('#nav-tab-attribute-layer-form_filter__a_').click({ force: true });
        await expect(page.locator('#attribute-layer-table-form_filter__a_ tbody tr')).toHaveCount(1);

        // Check the child features are filtered too (2 children)
        await page.locator('#nav-tab-attribute-layer-form_filter_child_bus_stops').click({ force: true });
        await expect(page.locator('#attribute-layer-table-form_filter_child_bus_stops tbody tr')).toHaveCount(2);

        // Disable combobox
        await page.locator('div#liz-filter-box-test_filter button.btn-primary:nth-child(2)').click();
        await expect(page.locator(countFeature)).toHaveText('4');
    });
});

