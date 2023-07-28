// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Base layers', () => {

    const locale = 'en-US';

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=base_layers';
        await page.goto(url, { waitUntil: 'networkidle' });
    });

    test('Base layers list', async ({ page }) => {
        await expect(page.locator('lizmap-base-layers select option')).toHaveCount(12);
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('osm-mapnik');
        await page.locator('lizmap-base-layers select').selectOption('empty');
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('empty');
    });

    test('Scales', async ({ page }) => {
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (144448).toLocaleString(locale));

        let getMapRequestPromise = page.waitForRequest(/REQUEST=GetMap/);
        await page.locator('lizmap-treeview #node-quartiers').click();
        await getMapRequestPromise;

        await page.locator('#navbar button.btn.zoom-in').click();
        await getMapRequestPromise;
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (72224).toLocaleString(locale));

        await page.locator('#navbar button.btn.zoom-out').click();
        await getMapRequestPromise;
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (144448).toLocaleString(locale));
    });
})