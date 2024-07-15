// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Legend tests', () => {

    const locale = 'en-US';

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=layer_legends';
        await gotoMap(url, page)
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
        await expect(page.getByTestId('tramway_lines').locator('div.layer .legend')).toHaveAttribute('src', 'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE2IiB3aWR0aD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjODg4YTg1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgLTE2KSI+PHBhdGggZD0ibTEuNSA0LjUgNCA5IDUtMTFoNCIgZmlsbD0ibm9uZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxNikiLz48ZyBmaWxsPSIjZWVlZWVjIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Im00LjUgMTIuNWMwIC41NTIyODUtLjQ0NzcxNTMgMS0xIDFzLTEtLjQ0NzcxNS0xLTEgLjQ0NzcxNTMtMSAxLTEgMSAuNDQ3NzE1IDEgMXoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIgMTcpIi8+PHBhdGggZD0ibTQuNSAxMi41YzAgLjU1MjI4NS0uNDQ3NzE1MyAxLTEgMXMtMS0uNDQ3NzE1LTEtMSAuNDQ3NzE1My0xIDEtMSAxIC40NDc3MTUgMSAxeiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTEgNikiLz48cGF0aCBkPSJtNC41IDEyLjVjMCAuNTUyMjg1LS40NDc3MTUzIDEtMSAxcy0xLS40NDc3MTUtMS0xIC40NDc3MTUzLTEgMS0xIDEgLjQ0NzcxNSAxIDF6IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3IDYpIi8+PHBhdGggZD0ibTQuNSAxMi41YzAgLjU1MjI4NS0uNDQ3NzE1MyAxLTEgMXMtMS0uNDQ3NzE1LTEtMSAuNDQ3NzE1My0xIDEtMSAxIC40NDc3MTUgMSAxeiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIgOCkiLz48L2c+PC9nPjwvc3ZnPg==');
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
