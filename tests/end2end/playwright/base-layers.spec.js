// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Base layers', () => {

    const locale = 'en-US';

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=base_layers';
        await gotoMap(url, page);
    });

    test('Base layers list', async ({ page }) => {
        await expect(page.locator('lizmap-base-layers select option')).toHaveCount(11);
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

test.describe('Base layers user defined', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=base_layers_user_defined';
        await gotoMap(url, page);
    });

    test('Base layers list', async ({ page }) => {
        await expect(page.locator('lizmap-base-layers select option')).toHaveCount(12);
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('OSM TMS internal');
        await page.locator('lizmap-base-layers select').selectOption('group with many layers and shortname');
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('group with many layers and shortname');
    });

})

test.describe('Base layers with space', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=base_layers+with+space';
        await gotoMap(url, page);
    });

    test('Base layers list', async ({ page }) => {
        await expect(page.locator('lizmap-base-layers select option')).toHaveCount(6);
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('empty');
        await page.locator('lizmap-base-layers select').selectOption('osm-mapnik');
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('osm-mapnik');
    });

})

test.describe('Base layers withdot', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=base_layers.withdot';
        await gotoMap(url, page);
    });

    test('Base layers list', async ({ page }) => {
        await expect(page.locator('lizmap-base-layers select option')).toHaveCount(6);
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('empty');
        await page.locator('lizmap-base-layers select').selectOption('osm-mapnik');
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('osm-mapnik');
    });

})
