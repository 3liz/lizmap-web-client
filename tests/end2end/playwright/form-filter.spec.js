// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';
import { getEchoRequestParams } from './globals';

test.describe('Form filter', () => {
    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'form_filter');
        await project.open();
        await page.locator('#button-filter').click();
    });

    test('Form filter with combobox', async ({ page }) => {
        let getMapPromise = page.waitForRequest(/GetMap/);

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

        let getMapRequest = await getMapPromise;
        // Re-send the request with additional echo param to retrieve the WMS Request search params
        let urlObj = await getEchoRequestParams(page, getMapRequest.url())

        expect(urlObj.get('filter')).toBe('form_filter_layer:"id" IN ( 2 ) ');

        // Check the attribute table shows only one line
        await page.locator('#nav-tab-attribute-layer-form_filter__a_').click({ force: true });
        await expect(page.locator('#attribute-layer-table-form_filter__a_ tbody tr')).toHaveCount(1);

        // Check the child features are filtered too (3 children)
        await page.locator('#nav-tab-attribute-layer-form_filter_child_bus_stops').click({ force: true });
        await expect(page.locator('#attribute-layer-table-form_filter_child_bus_stops tbody tr')).toHaveCount(3);

        // Reset
        getMapPromise = page.waitForRequest(/GetMap/);
        page.locator('#liz-filter-unfilter').click();
        await expect(page.locator(countFeature)).toHaveText('4');

        getMapRequest = await getMapPromise;

        // Re-send the request with additional echo param to retrieve the WMS Request search params
        urlObj = await getEchoRequestParams(page, getMapRequest.url())

        expect(urlObj.get('filter')).toBeNull();

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

    test('Form filter with autocomplete', async ({ page }) => {
        await page.locator('#liz-filter-field-textautocomplete').fill('mon');

        // Assert autocomplete list has 3 values
        await expect(page.locator('#ui-id-2 .ui-menu-item')).toHaveCount(3);

        await page.locator('#liz-filter-field-textautocomplete').fill('');

        // Filter by ID then assert autocomplete list has now 2 values
        // when filling 'mon' in the autocomplete field
        await page.locator('#liz-filter-field-max-numericIDs').fill('3');
        await page.locator('#liz-filter-field-textautocomplete').fill('mon');
        await expect(page.locator('#ui-id-2 .ui-menu-item')).toHaveCount(2);

        // Reset
        await page.locator('#liz-filter-field-textautocomplete').fill('');
        await page.locator('#liz-filter-unfilter').click();

        // Filter by combobox then assert autocomplete list has now 1 value
        // when filling 'mon' in the autocomplete field
        await page.locator('#liz-filter-field-test_filter').selectOption('monuments');
        await page.locator('#liz-filter-field-textautocomplete').fill('mon');
        await expect(page.locator('#ui-id-2 .ui-menu-item')).toHaveCount(1);
        await expect(page.locator('#ui-id-2 .ui-menu-item div')).toHaveText('monuments');
    });

    test('Deactivate filter button shows up with the "simple" filter method', async ({ page }) => {
        // Force the 'simple' filtering method (bypasses the attribute table code path)
        // https://github.com/3liz/lizmap-web-client/issues/6775
        await page.evaluate(() => { globalThis['filterConfigData'].filterMethod = 'simple'; });

        const unfilterButton = page.locator('#layerActionUnfilter');

        // The "Deactivate current filter" button lives in the layer switcher dock,
        // opening it switches away from the filter dock (docks are mutually exclusive)
        await page.locator('#button-switcher').click();
        await expect(unfilterButton).toBeHidden();

        // Re-open the filter dock to apply the filter
        await page.locator('#button-filter').click();
        await page.locator('#liz-filter-field-test_filter').selectOption('_uvres_d_art_et_monuments_de_l_espace_urbain');
        await expect(page.locator('#liz-filter-item-layer-total-count')).toHaveText('1');

        // Bug #6775: this button stayed hidden before the fix
        await page.locator('#button-switcher').click();
        await expect(unfilterButton).toBeVisible();

        await unfilterButton.click();
        await expect(unfilterButton).toBeHidden();

        await page.locator('#button-filter').click();
        await expect(page.locator('#liz-filter-item-layer-total-count')).toHaveText('4');
    });
});
