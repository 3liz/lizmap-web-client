// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';
import { base64svg, base64svgLineLayer } from "./../../../assets/src/modules/state/SymbologyIcons";

test.describe('Legend tests', () => {

    const locale = 'en-US';

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=layer_legends';
        await gotoMap(url, page)
    });

    test('Tests the legend toggled layers', async ({ page }) => {
        await expect(page.getByLabel('layer_legend_single_symbol')).toBeChecked();
        await expect(page.getByLabel('layer_legend_categorized')).toBeChecked();
        await expect(page.getByLabel('layer_legend_ruled')).toBeChecked();
        await expect(page.getByLabel('tramway_lines')).toBeChecked();
        await expect(page.getByLabel('legend_option_test')).toBeChecked();
        await expect(page.getByLabel('expand_at_startup')).not.toBeChecked();
        await expect(page.getByLabel('disabled')).not.toBeChecked();
        await expect(page.getByLabel('hide_at_startup')).not.toBeChecked();
        await expect(page.getByLabel('Group as layer')).toBeChecked();
    });

    test('Tests the legend display option expand/hide/disabled', async ({ page }) => {
        // Show image legend at startup
        await expect(page.getByTestId('expand_at_startup').locator('.expandable')).toHaveClass(/expanded/);

        // Disable the legend image
        expect(await page.getByTestId('disabled').locator('.expandable').count()).toEqual(0);
        expect(await page.getByTestId('disabled').locator('ul.symbols').count()).toEqual(0);

        // Hide legend image at startup
        await expect(page.getByTestId('hide_at_startup').locator('.expandable')).not.toHaveClass(/expanded/);
        expect(await page.getByTestId('hide_at_startup').locator('.expandable').count()).toEqual(1);
        expect(await page.getByTestId('hide_at_startup').locator('ul.symbols').count()).toEqual(1);
    });

    test("Switching layer's style should switch layer's legend", async ({ page }) => {
        await expect(page.getByTestId('tramway_lines').locator('.legend')).toHaveAttribute('src', 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAIElEQVQ4jWNgGAXDADCeZ2D+T4kBTJS6YOANGAXDAgAAI0UB2Uim7V8AAAAASUVORK5CYII=');

        // Switch layer's style
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({ force: true });
        await page.locator('#sub-dock select.styleLayer').selectOption('categorized');

        // Assert legend has changed
        await expect(page.getByTestId('tramway_lines').locator('div.layer .legend')).toHaveAttribute('src', base64svg+base64svgLineLayer);
        expect(await page.getByTestId('tramway_lines').locator('.expandable').count()).toEqual(1);
        await page.getByTestId('tramway_lines').locator('.expandable').click();

        await expect(page.getByTestId('tramway_lines').locator('.symbols .legend').first()).toHaveAttribute('src', 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAIElEQVQ4jWNgGAXDADAan9//nxIDmCh1wcAbMAqGBQAAu7ICyNmWVC0AAAAASUVORK5CYII=');
        await expect(page.getByTestId('tramway_lines').locator('.symbols .legend').nth(1)).toHaveAttribute('src', 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAIElEQVQ4jWNgGAXDADC+uSbynxIDmCh1wcAbMAqGBQAA95MC3blCR58AAAAASUVORK5CYII=');
    });

    test("Layer's rule based symbologie with scales", async ({ page }) => {
        // Display layer's rule based legend
        await page.getByTestId('layer_legend_ruled').locator('.expandable').first().click()

        // Check scale and symbology rule in scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (250000).toLocaleString(locale));
        await expect(page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k +' })).not.toHaveClass(/not-in-scale/);
        await expect(page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k -' })).toHaveClass(/not-in-scale/);

        // Zoom in
        let getMapRequestPromise = page.waitForRequest(/REQUEST=GetMap/);
        await page.locator('#navbar button.btn.zoom-in').click();
        await getMapRequestPromise;

        // Check scale and symbology rule in scale (same)
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (100000).toLocaleString(locale));
        await expect(page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k +' })).not.toHaveClass(/not-in-scale/);
        await expect(page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k -' })).toHaveClass(/not-in-scale/);

        // Zoom in
        getMapRequestPromise = page.waitForRequest(/REQUEST=GetMap/);
        await page.locator('#navbar button.btn.zoom-in').click();
        await getMapRequestPromise;

        // Check scale and symbology rule in scale (inverted)
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (50000).toLocaleString(locale));
        await expect(page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k +' })).toHaveClass(/not-in-scale/);
        await expect(page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k -' })).not.toHaveClass(/not-in-scale/);
    });

    test("Layer's rule based symbologie unchecked", async ({ page }) => {
        // Display layer's rule based legend
        await page.getByTestId('layer_legend_ruled').locator('.expandable').first().click()
        await page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k +' }).locator('.expandable').first().click()
        await expect(page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k +' })).not.toHaveClass(/not-visible/);

        await page.getByTestId('layer_legend_ruled').getByLabel('100k +').uncheck();
        await expect(page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k +' })).toHaveClass(/not-visible/);
        await page.getByTestId('layer_legend_ruled').getByLabel('100k +').check();
        await expect(page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k +' })).not.toHaveClass(/not-visible/);

        // Check scale and symbology rule in scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (250000).toLocaleString(locale));

        // Zoom in
        let getMapRequestPromise = page.waitForRequest(/REQUEST=GetMap/);
        await page.locator('#navbar button.btn.zoom-in').click();
        await getMapRequestPromise;

        // Check scale and symbology rule in scale (same)
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (100000).toLocaleString(locale));

        // Zoom in
        getMapRequestPromise = page.waitForRequest(/REQUEST=GetMap/);
        await page.locator('#navbar button.btn.zoom-in').click();
        await getMapRequestPromise;

        // Check scale and symbology rule in scale (inverted)
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (50000).toLocaleString(locale));

        await page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k -' }).locator('.expandable').first().click()
        await expect(page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k -' })).not.toHaveClass(/not-visible/);
        await expect(page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k -' }).getByRole('listitem').filter({ hasText: 'category 1' })).not.toHaveClass(/not-visible/);

        await page.getByTestId('layer_legend_ruled').getByLabel('category 1').uncheck();
        await expect(page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k -' }).getByRole('listitem').filter({ hasText: 'category 1' })).toHaveClass(/not-visible/);
        await page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k -' }).getByLabel('category 1').check();
        await expect(page.getByTestId('layer_legend_ruled').getByRole('listitem').filter({ hasText: '100k -' }).getByRole('listitem').filter({ hasText: 'category 1' })).not.toHaveClass(/not-visible/);
    });
});

test.describe('Checkboxes on groups', () => {
    test('Tree initialization of checkboxes on groups', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=groups_checkboxes';
        await gotoMap(url, page)
        // single layer, outside group
        await expect(page.getByLabel('shop_bakery_pg')).toBeChecked();
        // groupAsLayer group: the group is checked, the two layers under this group are unchecked
        await expect(page.getByLabel('tramway')).toBeChecked();
        // group buildings is checked, the underlying layer townhalls_pg is unchecked
        await expect(page.getByLabel('buildings')).toBeChecked();
        await expect(page.getByLabel('townhalls_pg')).not.toBeChecked();
        // group-subgroup block: groups are unchecked, underlying layers are checked
        await expect(page.getByLabel('qt')).not.toBeChecked();
        await expect(page.getByLabel('sousquartiers')).toBeChecked();
        await expect(page.getByLabel('sub-group1')).not.toBeChecked();
        await expect(page.getByTestId('quartiers').getByLabel('quartiers')).toBeChecked();
    });
});
