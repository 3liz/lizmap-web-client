// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'
import { ProjectPage } from './pages/project';
import { getAuthStorageStatePath } from './globals';

// Transparent: 2452
const transparentGetMapBodyMinLength = 2000;
const transparentGetMapBodyMaxLength = 3000;
// townhalls_pg: 9773
const townhallsPgGetMapBodyMinLength = 9500;
const townhallsPgGetMapBodyMaxLength = 10500;
// full shop_bakery_pg: 11023
const fullShopBakeryPgGetMapBodyMinLength = 10500;
const fullShopBakeryPgGetMapBodyMaxLength = 11500;
// full townhalls_EPSG2154: 10949
const fullTownhallsGetMapBodyMinLength = 10500;
const fullTownhallsGetMapBodyMaxLength = 11500;
// full shop_bakery; 14087
const fullShopBakeryGetMapBodyMinLength = 13500;
const fullShopBakeryGetMapBodyMaxLength = 14500;
// User in group a shop_bakery_pg: 4148
const groupAShopBakeryPgGetMapBodyMinLength = 3500;
const groupAShopBakeryPgGetMapBodyMaxLength = 4500;
// User in group a townhalls_EPSG2154: 4765
const groupATownhallsGetMapBodyMinLength = 4500;
const groupATownhallsGetMapBodyMaxLength = 5500;
// User in group a shop_bakery: 4864
const groupAShopBakeryGetMapBodyMinLength = 4500;
const groupAShopBakeryGetMapBodyMaxLength = 5500;

test.describe('Filter layer data polygon - admin - @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('admin') });

    test('Popup with map click & attribute table', async ({ page }) => {
        const project = new ProjectPage(page, 'filter_layer_data_by_polygon_for_groups');
        // Catch default GetMap
        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();
        let getMapRequest = await getMapRequestPromise;
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Display layer townhalls_pg
        getMapRequestPromise = project.waitForGetMapRequest();
        page.getByTestId('townhalls_pg').locator('.node').click();
        getMapRequest = await getMapRequestPromise;
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
        // Check response body
        let getMapBody = await getMapResponse?.body();
        expect(getMapBody).toBeInstanceOf(Buffer);
        let getMapBodyLength = getMapBody ? getMapBody.length : 0;
        expect(getMapBodyLength).toBeGreaterThan(transparentGetMapBodyMaxLength);
        expect(getMapBodyLength).toBeGreaterThan(townhallsPgGetMapBodyMinLength);
        expect(getMapBodyLength).toBeLessThan(townhallsPgGetMapBodyMaxLength);

        // Display layer shop_bakery_pg
        getMapRequestPromise = project.waitForGetMapRequest();
        page.getByTestId('shop_bakery_pg').locator('.node').click();
        getMapRequest = await getMapRequestPromise;
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
        // Check response body
        getMapBody = await getMapResponse?.body();
        expect(getMapBody).toBeInstanceOf(Buffer);
        getMapBodyLength = getMapBody ? getMapBody.length : 0;
        expect(getMapBodyLength).toBeGreaterThan(transparentGetMapBodyMaxLength);
        expect(getMapBodyLength).toBeGreaterThan(groupAShopBakeryPgGetMapBodyMaxLength);
        expect(getMapBodyLength).toBeGreaterThan(fullShopBakeryPgGetMapBodyMinLength);
        expect(getMapBodyLength).toBeLessThan(fullShopBakeryPgGetMapBodyMaxLength);

        // Display layer townhalls_EPSG2154
        getMapRequestPromise = project.waitForGetMapRequest();
        page.getByTestId('townhalls_EPSG2154').locator('.node').click();
        getMapRequest = await getMapRequestPromise;
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
        // Check response body
        getMapBody = await getMapResponse?.body();
        expect(getMapBody).toBeInstanceOf(Buffer);
        getMapBodyLength = getMapBody ? getMapBody.length : 0;
        expect(getMapBodyLength).toBeGreaterThan(transparentGetMapBodyMaxLength);
        expect(getMapBodyLength).toBeGreaterThan(groupATownhallsGetMapBodyMaxLength);
        expect(getMapBodyLength).toBeGreaterThan(fullTownhallsGetMapBodyMinLength);
        expect(getMapBodyLength).toBeLessThan(fullTownhallsGetMapBodyMaxLength);

        // Display layer shop_bakery
        getMapRequestPromise = project.waitForGetMapRequest();
        page.getByTestId('shop_bakery').locator('.node').click();
        getMapRequest = await getMapRequestPromise;
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
        // Check response body
        getMapBody = await getMapResponse?.body();
        expect(getMapBody).toBeInstanceOf(Buffer);
        getMapBodyLength = getMapBody ? getMapBody.length : 0;
        expect(getMapBodyLength).toBeGreaterThan(transparentGetMapBodyMaxLength);
        expect(getMapBodyLength).toBeGreaterThan(groupAShopBakeryGetMapBodyMaxLength);
        expect(getMapBodyLength).toBeGreaterThan(fullShopBakeryGetMapBodyMinLength);
        expect(getMapBodyLength).toBeLessThan(fullShopBakeryGetMapBodyMaxLength);

        // Click on map to get Popups
        let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(515-30, 455-75);
        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        await getFeatureInfoRequest.response();

        // Two objects
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(2);
        await expect(project.dock.locator('.lizmapPopupTitle').first()).toHaveText('townhalls_pg');
        await expect(project.dock.locator('.lizmapPopupTitle').last()).toHaveText('shop_bakery_pg');
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit').first()).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit').last()).not.toHaveClass(/hide/);
        await project.closeLeftDock();

        // Click on map to get Popups
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(490-30, 440-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        await getFeatureInfoRequest.response();

        // One object
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('shop_bakery_pg');
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).not.toHaveClass(/hide/);
        await project.closeLeftDock();

        // Click on map to get Popups
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(460-30, 275-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        await getFeatureInfoRequest.response();

        // No object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(0);
        await expect(project.dock.locator('.lizmapPopupContent h4')).toHaveText('No object has been found at this location.');
        await project.closeLeftDock();

        // Attribute table
        // shop_bakery
        let tableName = 'shop_bakery';
        let getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await project.openAttributeTable(tableName);
        let getFeatureRequest = await getFeatureRequestPromise;
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        let tableHtml = project.attributeTableHtml(tableName);
        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(25);
        await project.closeAttributeTable();

        // townhalls_EPSG2154
        tableName = 'townhalls_EPSG2154';
        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await project.openAttributeTable(tableName);
        getFeatureRequest = await getFeatureRequestPromise;
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        tableHtml = project.attributeTableHtml(tableName);
        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(17);
        await project.closeAttributeTable();

        // shop_bakery_pg
        tableName = 'shop_bakery_pg';
        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await project.openAttributeTable(tableName);
        getFeatureRequest = await getFeatureRequestPromise;
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        tableHtml = project.attributeTableHtml(tableName);
        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(17);
        await project.closeAttributeTable();

        // townhalls_pg
        tableName = 'townhalls_pg';
        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await project.openAttributeTable(tableName);
        getFeatureRequest = await getFeatureRequestPromise;
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson()
        tableHtml = project.attributeTableHtml(tableName);
        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(16);
        // The user can edit all features for the layer townhalls_pg
        await expect(tableHtml.locator('tbody tr lizmap-feature-toolbar .feature-edit.hide')).toHaveCount(0);
        await expect(tableHtml.locator('tbody tr lizmap-feature-toolbar .feature-edit:not(.hide)')).toHaveCount(16);
        await project.closeAttributeTable();
    })
});

test.describe('Filter layer data polygon - user in group a - @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('user_in_group_a') });

    test('Popup with map click & attribute table', async ({ page }) => {
        const project = new ProjectPage(page, 'filter_layer_data_by_polygon_for_groups');
        // Catch default GetMap
        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();
        let getMapRequest = await getMapRequestPromise;
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Display layer townhalls_pg
        getMapRequestPromise = project.waitForGetMapRequest();
        page.getByTestId('townhalls_pg').locator('.node').click();
        getMapRequest = await getMapRequestPromise;
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
        // Check response body
        let getMapBody = await getMapResponse?.body();
        expect(getMapBody).toBeInstanceOf(Buffer);
        let getMapBodyLength = getMapBody ? getMapBody.length : 0;
        expect(getMapBodyLength).toBeGreaterThan(transparentGetMapBodyMaxLength);
        expect(getMapBodyLength).toBeGreaterThan(townhallsPgGetMapBodyMinLength);
        expect(getMapBodyLength).toBeLessThan(townhallsPgGetMapBodyMaxLength);

        // Display layer shop_bakery_pg
        getMapRequestPromise = project.waitForGetMapRequest();
        page.getByTestId('shop_bakery_pg').locator('.node').click();
        getMapRequest = await getMapRequestPromise;
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
        // Check response body
        getMapBody = await getMapResponse?.body();
        expect(getMapBody).toBeInstanceOf(Buffer);
        getMapBodyLength = getMapBody ? getMapBody.length : 0;
        expect(getMapBodyLength).toBeGreaterThan(transparentGetMapBodyMaxLength);
        expect(getMapBodyLength).toBeLessThan(fullShopBakeryPgGetMapBodyMinLength);
        expect(getMapBodyLength).toBeGreaterThan(groupAShopBakeryPgGetMapBodyMinLength);
        expect(getMapBodyLength).toBeLessThan(groupAShopBakeryPgGetMapBodyMaxLength);

        // Display layer townhalls_EPSG2154
        getMapRequestPromise = project.waitForGetMapRequest();
        page.getByTestId('townhalls_EPSG2154').locator('.node').click();
        getMapRequest = await getMapRequestPromise;
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
        // Check response body
        getMapBody = await getMapResponse?.body();
        expect(getMapBody).toBeInstanceOf(Buffer);
        getMapBodyLength = getMapBody ? getMapBody.length : 0;
        expect(getMapBodyLength).toBeGreaterThan(transparentGetMapBodyMaxLength);
        expect(getMapBodyLength).toBeLessThan(fullTownhallsGetMapBodyMinLength);
        expect(getMapBodyLength).toBeGreaterThan(groupATownhallsGetMapBodyMinLength);
        expect(getMapBodyLength).toBeLessThan(groupATownhallsGetMapBodyMaxLength);

        // Display layer shop_bakery
        getMapRequestPromise = project.waitForGetMapRequest();
        page.getByTestId('shop_bakery').locator('.node').click();
        getMapRequest = await getMapRequestPromise;
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
        // Check response body
        getMapBody = await getMapResponse?.body();
        expect(getMapBody).toBeInstanceOf(Buffer);
        getMapBodyLength = getMapBody ? getMapBody.length : 0;
        expect(getMapBodyLength).toBeGreaterThan(transparentGetMapBodyMaxLength);
        expect(getMapBodyLength).toBeLessThan(fullShopBakeryGetMapBodyMinLength);
        expect(getMapBodyLength).toBeGreaterThan(groupAShopBakeryGetMapBodyMinLength);
        expect(getMapBodyLength).toBeLessThan(groupAShopBakeryGetMapBodyMaxLength);

        // Click on map to get Popups
        let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(515-30, 455-75);
        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        await getFeatureInfoRequest.response();

        // One object, it was two for admins
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('townhalls_pg');
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).toHaveClass(/hide/);
        await project.closeLeftDock();

        // Click on map to get Popups
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(490-30, 440-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        await getFeatureInfoRequest.response();

        // No object found, it was one for admins
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(0);
        await expect(project.dock.locator('.lizmapPopupContent h4')).toHaveText('No object has been found at this location.');
        await project.closeLeftDock();

        // Click on map to get Popups
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(460-30, 275-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        await getFeatureInfoRequest.response();

        // No object found like for admins
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(0);
        await expect(project.dock.locator('.lizmapPopupContent h4')).toHaveText('No object has been found at this location.');
        await project.closeLeftDock();

        // Attribute table
        // shop_bakery
        let tableName = 'shop_bakery';
        let getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await project.openAttributeTable(tableName);
        let getFeatureRequest = await getFeatureRequestPromise;
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        let tableHtml = project.attributeTableHtml(tableName);
        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(5); // 25 for admins
        await project.closeAttributeTable();

        // townhalls_EPSG2154
        tableName = 'townhalls_EPSG2154';
        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await project.openAttributeTable(tableName);
        getFeatureRequest = await getFeatureRequestPromise;
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        tableHtml = project.attributeTableHtml(tableName);
        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(4); // 17 for admins
        await project.closeAttributeTable();

        // shop_bakery_pg
        tableName = 'shop_bakery_pg';
        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await project.openAttributeTable(tableName);
        getFeatureRequest = await getFeatureRequestPromise;
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        tableHtml = project.attributeTableHtml(tableName);
        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(4); // 17 for admins
        await project.closeAttributeTable();

        // townhalls_pg
        tableName = 'townhalls_pg';
        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await project.openAttributeTable(tableName);
        getFeatureRequest = await getFeatureRequestPromise;
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        tableHtml = project.attributeTableHtml(tableName);
        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(16);
        // The user can edit all features for the layer townhalls_pg
        await expect(tableHtml.locator('tbody tr lizmap-feature-toolbar .feature-edit.hide')).toHaveCount(11); // 0 for admins
        await expect(tableHtml.locator('tbody tr lizmap-feature-toolbar .feature-edit:not(.hide)')).toHaveCount(5); // 16 for admins
        await project.closeAttributeTable();
    })
});


test.describe('Filter layer data polygon - not connected - @readonly', () => {

    test('Popup with map click & attribute table', async ({ page }) => {
        const project = new ProjectPage(page, 'filter_layer_data_by_polygon_for_groups');
        // Catch default GetMap
        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();
        let getMapRequest = await getMapRequestPromise;
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Display layer townhalls_pg
        getMapRequestPromise = project.waitForGetMapRequest();
        page.getByTestId('townhalls_pg').locator('.node').click();
        getMapRequest = await getMapRequestPromise;
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
        // Check response body
        let getMapBody = await getMapResponse?.body();
        expect(getMapBody).toBeInstanceOf(Buffer);
        let getMapBodyLength = getMapBody ? getMapBody.length : 0;
        expect(getMapBodyLength).toBeGreaterThan(transparentGetMapBodyMaxLength);
        expect(getMapBodyLength).toBeGreaterThan(townhallsPgGetMapBodyMinLength);
        expect(getMapBodyLength).toBeLessThan(townhallsPgGetMapBodyMaxLength);

        // Display layer shop_bakery_pg
        getMapRequestPromise = project.waitForGetMapRequest();
        page.getByTestId('shop_bakery_pg').locator('.node').click();
        getMapRequest = await getMapRequestPromise;
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
        // Check response body
        getMapBody = await getMapResponse?.body();
        expect(getMapBody).toBeInstanceOf(Buffer);
        getMapBodyLength = getMapBody ? getMapBody.length : 0;
        expect(getMapBodyLength).toBeLessThan(fullShopBakeryPgGetMapBodyMinLength);
        expect(getMapBodyLength).toBeLessThan(groupAShopBakeryPgGetMapBodyMinLength);
        expect(getMapBodyLength).toBeLessThan(transparentGetMapBodyMaxLength);
        expect(getMapBodyLength).toBeGreaterThan(transparentGetMapBodyMinLength);

        // Display layer townhalls_EPSG2154
        getMapRequestPromise = project.waitForGetMapRequest();
        page.getByTestId('townhalls_EPSG2154').locator('.node').click();
        getMapRequest = await getMapRequestPromise;
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
        // Check response body
        getMapBody = await getMapResponse?.body();
        expect(getMapBody).toBeInstanceOf(Buffer);
        getMapBodyLength = getMapBody ? getMapBody.length : 0;
        expect(getMapBodyLength).toBeLessThan(fullTownhallsGetMapBodyMinLength);
        expect(getMapBodyLength).toBeLessThan(groupATownhallsGetMapBodyMinLength);
        expect(getMapBodyLength).toBeLessThan(transparentGetMapBodyMaxLength);
        expect(getMapBodyLength).toBeGreaterThan(transparentGetMapBodyMinLength);

        // Display layer shop_bakery
        getMapRequestPromise = project.waitForGetMapRequest();
        page.getByTestId('shop_bakery').locator('.node').click();
        getMapRequest = await getMapRequestPromise;
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
        // Check response body
        getMapBody = await getMapResponse?.body();
        expect(getMapBody).toBeInstanceOf(Buffer);
        getMapBodyLength = getMapBody ? getMapBody.length : 0;
        expect(getMapBodyLength).toBeLessThan(fullShopBakeryGetMapBodyMinLength);
        expect(getMapBodyLength).toBeLessThan(groupAShopBakeryGetMapBodyMinLength);
        expect(getMapBodyLength).toBeLessThan(transparentGetMapBodyMaxLength);
        expect(getMapBodyLength).toBeGreaterThan(transparentGetMapBodyMinLength);

        // Click on map to get Popups
        let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(515-30, 455-75);
        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        await getFeatureInfoRequest.response();

        // One object, it was two for admins
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('townhalls_pg');
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).toHaveClass(/hide/);
        await project.closeLeftDock();

        // Click on map to get Popups
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(490-30, 440-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        await getFeatureInfoRequest.response();

        // No object found, it was one for admins
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(0);
        await expect(project.dock.locator('.lizmapPopupContent h4')).toHaveText('No object has been found at this location.');
        await project.closeLeftDock();

        // Click on map to get Popups
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(460-30, 275-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        await getFeatureInfoRequest.response();

        // No object found like for admins
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(0);
        await expect(project.dock.locator('.lizmapPopupContent h4')).toHaveText('No object has been found at this location.');
        await project.closeLeftDock();

        // Attribute table
        // shop_bakery
        let tableName = 'shop_bakery';
        let getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await project.openAttributeTable(tableName);
        let getFeatureRequest = await getFeatureRequestPromise;
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        let tableHtml = project.attributeTableHtml(tableName);
        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(0); // 25 for admins and 5 for user in froup a
        await project.closeAttributeTable();

        // townhalls_EPSG2154
        tableName = 'townhalls_EPSG2154';
        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await project.openAttributeTable(tableName);
        getFeatureRequest = await getFeatureRequestPromise;
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        tableHtml = project.attributeTableHtml(tableName);
        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(0); // 17 for admins and 4 for user in froup a
        await project.closeAttributeTable();

        // shop_bakery_pg
        tableName = 'shop_bakery_pg';
        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await project.openAttributeTable(tableName);
        getFeatureRequest = await getFeatureRequestPromise;
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        tableHtml = project.attributeTableHtml(tableName);
        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(0); // 17 for admins and 4 for user in froup a
        await project.closeAttributeTable();

        // townhalls_pg
        tableName = 'townhalls_pg';
        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await project.openAttributeTable(tableName);
        getFeatureRequest = await getFeatureRequestPromise;
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        tableHtml = project.attributeTableHtml(tableName);
        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(16);
        // The user can edit all features for the layer townhalls_pg
        await expect(tableHtml.locator('tbody tr lizmap-feature-toolbar .feature-edit.hide')).toHaveCount(16); // 0 for admins and 11 for user in froup a
        await expect(tableHtml.locator('tbody tr lizmap-feature-toolbar .feature-edit:not(.hide)')).toHaveCount(0); // 16 for admins and 5 for user in froup a
        await project.closeAttributeTable();
    })
});
