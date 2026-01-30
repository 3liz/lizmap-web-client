// @ts-check
import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js';
import { expect as responseExpect } from './fixtures/expect-response.js'
import { ProjectPage } from "./pages/project";

/**
 * Playwright Locator
 * @typedef {import('@playwright/test').Dialog} Dialog
 */

test.describe('Feature toolbar in popup @readonly', () => {

    test('should zoom', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();
        // Click on the first point
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(436, 290);
        let getFeatureInfoRequest = await getFeatureInfoPromise;
        const getFeatureInfoExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetFeatureInfo',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': 'parent_layer',
            'QUERY_LAYERS': 'parent_layer',
        }
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData(getFeatureInfoExpectedParameters);
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Zoom button
        const featureToolbar = await project.popupContent.locator('lizmap-feature-toolbar[value^="parent_layer_"][value$=".1"]');
        await expect(await featureToolbar.locator('button.feature-zoom')).toBeVisible();

        // First click on zoom-in
        let getMapRequestPromise = project.waitForGetMapRequest();
        await page.locator('#navbar button.btn.zoom-in').click();
        let getMapRequest = await getMapRequestPromise;
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'STYLES': 'défaut',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /759253.2\d+,6270938.6\d+,784600.4\d+,6287686.8\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Click on zoom to in feature-toolbar
        getMapRequestPromise = project.waitForGetMapRequest();
        await featureToolbar.locator('button.feature-zoom').click();
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'STYLES': 'défaut',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /771293.1\d+,6278894.0\d+,772560.5\d+,6279731.4\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
    });

    test('should center', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();
        // Click on the second point
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(594, 290);

        let getFeatureInfoRequest = await getFeatureInfoPromise;
        const getFeatureInfoExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetFeatureInfo',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': 'parent_layer',
            'QUERY_LAYERS': 'parent_layer',
        }
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData(getFeatureInfoExpectedParameters);
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Center button
        const featureToolbar = await project.popupContent.locator('lizmap-feature-toolbar[value^="parent_layer_"][value$=".2"]');
        await expect(await featureToolbar.locator('button.feature-center')).toBeVisible();

        // First click on zoom-in
        let getMapRequestPromise = project.waitForGetMapRequest();
        await page.locator('#navbar button.btn.zoom-in').click();
        let getMapRequest = await getMapRequestPromise;
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'STYLES': 'défaut',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /759253.2\d+,6270938.6\d+,784600.4\d+,6287686.8\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // two more clicks on zoom-in
        getMapRequestPromise = project.waitForGetMapRequest();
        await page.locator('#navbar button.btn.zoom-in').click();
        getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();
        getMapRequestPromise = project.waitForGetMapRequest();
        await page.locator('#navbar button.btn.zoom-in').click();
        getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

        // last click on zoom-in
        getMapRequestPromise = project.waitForGetMapRequest();
        await page.locator('#navbar button.btn.zoom-in').click();
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'STYLES': 'défaut',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /770659.5\d+,6278475.3\d+,773194.2\d+,6280150.1\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Click on center to in feature-toolbar
        getMapRequestPromise = project.waitForGetMapRequest();
        await featureToolbar.locator('button.feature-center').click();
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'STYLES': 'défaut',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /781176.6\d+,6278640.6\d+,783711.4\d+,6280315.5\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
    });

    test('should select', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();
        // Click on the first point
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(436, 290);

        let getFeatureInfoRequest = await getFeatureInfoPromise;
        const getFeatureInfoExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetFeatureInfo',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': 'parent_layer',
            'QUERY_LAYERS': 'parent_layer',
        }
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData(getFeatureInfoExpectedParameters);
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Select button
        const featureToolbar = project.popupContent.locator('lizmap-feature-toolbar[value^="parent_layer_"][value$=".1"]');
        await expect(featureToolbar.locator('button.feature-select')).toBeVisible();
        await expect(featureToolbar.locator('button.feature-select')).not.toContainClass('btn-primary');

        // click on select Button
        let getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await featureToolbar.locator('button.feature-select').click();
        let getSelectionTokenRequest = await getSelectionTokenRequestPromise;

        // Check GetSelectionToken request
        const getSelectionTokenParameters = {
            'service': 'WMS',
            'request': 'GETSELECTIONTOKEN',
            'typename': 'parent_layer',
            'ids': '1',
        }
        requestExpect(getSelectionTokenRequest).toContainParametersInPostData(getSelectionTokenParameters);

        // Once the GetSelectionToken is received, the map is refreshed
        let getMapRequestPromise = project.waitForGetMapRequest();
        await getSelectionTokenRequest.response();
        let getMapRequest = await getMapRequestPromise;

        // Check GetMap request with selection token parameter
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'STYLES': 'défaut',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /740242.9\d+,6258377.5\d+,803610.7\d+,6300247.9\d+/,
            'SELECTIONTOKEN': /^[a-zA-Z0-9]{32}$/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check that the select button display that the feature is selected
        await expect(featureToolbar.locator('button.feature-select')).toContainClass('btn-primary');

        // Open Attribute table
        let datatablesRequest = await project.openAttributeTable('parent_layer');
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();
        // Check first line
        let firstTr = project.attributeTableHtml('parent_layer').locator('tbody tr').first();
        await expect(firstTr).toContainClass('selected');
        await expect(firstTr.locator('lizmap-feature-toolbar button.feature-select')).toContainClass('btn-primary');

        // An other click on select Button to unselect
        await featureToolbar.locator('button.feature-select').click();
        // No GetMap request because of some OpenLayers cache

        // Check that the feature is unselected
        await expect(featureToolbar.locator('button.feature-select')).not.toContainClass('btn-primary');
        await expect(firstTr).not.toContainClass('selected');
        await expect(firstTr.locator('lizmap-feature-toolbar button.feature-select')).not.toContainClass('btn-primary');
    });

    test('should filter', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();
        // Click on the first point
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(436, 290);

        let getFeatureInfoRequest = await getFeatureInfoPromise;
        const getFeatureInfoExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetFeatureInfo',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': 'parent_layer',
            'QUERY_LAYERS': 'parent_layer',
        }
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData(getFeatureInfoExpectedParameters);
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Filter button
        const featureToolbar = project.popupContent.locator('lizmap-feature-toolbar[value^="parent_layer_"][value$=".1"]');
        await expect(featureToolbar.locator('button.feature-filter')).toBeVisible();
        await expect(featureToolbar.locator('button.feature-filter')).not.toContainClass('btn-primary');

        // click on filter Button
        let getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
        await featureToolbar.locator('button.feature-filter').click();
        let getFilterTokenRequest = await getFilterTokenRequestPromise;

        // Check GetSelectionToken request
        const getFilterTokenParameters = {
            'service': 'WMS',
            'request': 'GETFILTERTOKEN',
            'typename': 'parent_layer',
            'filter': 'parent_layer:"id" IN ( 1 ) ',
        }
        requestExpect(getFilterTokenRequest).toContainParametersInPostData(getFilterTokenParameters);

        // Once the GetFilterToken is received, the map is refreshed
        let getMapRequestPromise = project.waitForGetMapRequest();
        await getFilterTokenRequest.response();
        let getMapRequest = await getMapRequestPromise;

        // Check GetMap request with selection token parameter
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'STYLES': 'défaut',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /740242.9\d+,6258377.5\d+,803610.7\d+,6300247.9\d+/,
            'FILTERTOKEN': /^[a-zA-Z0-9]{32}$/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check that the filter button display that the feature is filtered
        await expect(featureToolbar.locator('button.feature-filter')).toContainClass('btn-primary');

        // Open Attribute table
        let datatablesRequest = await project.openAttributeTable('parent_layer');
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();

        // Check Attribute table is also filtered
        await expect(project.attributeTableHtml('parent_layer').locator('tbody tr'))
            .toHaveCount(1);
        let actionBar = project.attributeTableActionBar('parent_layer');
        await expect(actionBar.locator('.btn-filter-attributeTable'))
            .toContainClass('active'); //.toContainClass('btn-primary');

        // An other click on select Button to remove filter
        getMapRequestPromise = project.waitForGetMapRequest();
        await featureToolbar.locator('button.feature-filter').click();
        getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

        await expect(featureToolbar.locator('button.feature-filter')).not.toContainClass('btn-primary');
        await expect(project.attributeTableHtml('parent_layer').locator('tbody tr'))
            .not.toHaveCount(1);
        await expect(actionBar.locator('.btn-filter-attributeTable'))
            .not.toContainClass('active'); //.not.toContainClass('btn-primary');
    });

    test('should display working custom action', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();
        // Click on the first point
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(436, 290);

        let getFeatureInfoRequest = await getFeatureInfoPromise;
        const getFeatureInfoExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetFeatureInfo',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': 'parent_layer',
            'QUERY_LAYERS': 'parent_layer',
        }
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData(getFeatureInfoExpectedParameters);
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Action button
        const featureToolbar = project.popupContent.locator('lizmap-feature-toolbar[value^="parent_layer_"][value$=".1"]');
        await expect(featureToolbar.locator('button.popup-action')).toBeVisible();
        await expect(featureToolbar.locator('button.popup-action')).not.toContainClass('btn-primary');
        await expect(page.locator('#lizmap-action-message')).toHaveCount(0);

        // Click on action button
        page.on('dialog', dialog => dialog.accept());
        let actionRequestPromise = page.waitForRequest(
            request => request.method() === 'POST' &&
            request.url().includes('/index.php/action/service') === true
        );
        await featureToolbar.locator('button.popup-action').click();
        let actionRequest = await actionRequestPromise;
        const actionExpectedParameters = {
            'name': 'buffer_500',
            'layerId': expect.stringMatching(/^parent_layer_[a-zA-Z0-9_]*/),
            'featureId': '1',
        }
        expect(actionRequest.postDataJSON()).toEqual(expect.objectContaining(actionExpectedParameters));

        // Once the action response is received, a selection is performed
        let getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await actionRequest.response();
        let getSelectionTokenRequest = await getSelectionTokenRequestPromise;

        // Check GetSelectionToken request
        const getSelectionTokenParameters = {
            'service': 'WMS',
            'request': 'GETSELECTIONTOKEN',
            'typename': 'parent_layer',
            'ids': '1',
        }
        requestExpect(getSelectionTokenRequest).toContainParametersInPostData(getSelectionTokenParameters);

        // Once the GetFilterToken is received, the map is refreshed
        let getMapRequestPromise = project.waitForGetMapRequest();
        await getSelectionTokenRequest.response();
        let getMapRequest = await getMapRequestPromise;

        // Check GetMap request with selection token parameter
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'STYLES': 'défaut',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /770659.5\d+,6278475.3\d+,773194.2\d+,6280150.1\d+/,
            'SELECTIONTOKEN': /^[a-zA-Z0-9]{32}$/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check that the action button display that the action has been launched on the feature
        await expect(featureToolbar.locator('button.popup-action')).toContainClass('btn-primary');

        // The action display a message
        await expect(page.locator('#lizmap-action-message p')).toHaveText('The buffer 500 m has been displayed in the map');
        // And select the feature
        await expect(featureToolbar.locator('button.feature-select')).toContainClass('btn-primary');

        // Close action by clicking on the action button
        await featureToolbar.locator('button.popup-action').click();
        await expect(page.locator('#lizmap-action-message')).toHaveCount(0);
    });

    test('should start edition', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();
        // Click on the second point
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(594, 290);

        let getFeatureInfoRequest = await getFeatureInfoPromise;
        const getFeatureInfoExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetFeatureInfo',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': 'parent_layer',
            'QUERY_LAYERS': 'parent_layer',
        }
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData(getFeatureInfoExpectedParameters);
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Create child button
        const featureToolbar = project.popupContent.locator('lizmap-feature-toolbar[value^="parent_layer_"][value$=".2"]');
        await expect(featureToolbar.locator('button.feature-edit')).toBeVisible();

        // Open edit feature
        let modifyFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('modifyFeature'));
        await featureToolbar.locator('button.feature-edit').click();
        let modifyFeatureRequest = await modifyFeatureRequestPromise;

        let editFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('editFeature'));
        await modifyFeatureRequest.response();
        let editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        // Check request
        let expectedParameters = {
            layerId: /^parent_layer_[a-zA-Z0-9_]*/,
            featureId: '2',
        };
        requestExpect(modifyFeatureRequest).toContainParametersInUrl(expectedParameters);
        requestExpect(editFeatureRequest).toContainParametersInUrl(expectedParameters);

        // id input is visible
        await expect(page.locator('#jforms_view_edition_id')).toBeVisible();
        // id input should have the value 2
        await expect(page.locator('#jforms_view_edition_id')).toHaveValue('2');

        // Cancel form edition...
        page.on('dialog', dialog => dialog.accept());
        await page.locator('#jforms_view_edition__submit_cancel').click();
    });

    test('should start child creation from the parent', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();
        // Click on the second point
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(594, 290);

        let getFeatureInfoRequest = await getFeatureInfoPromise;
        const getFeatureInfoExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetFeatureInfo',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': 'parent_layer',
            'QUERY_LAYERS': 'parent_layer',
        }
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData(getFeatureInfoExpectedParameters);
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Create child button
        const featureToolbar = project.popupContent.locator('lizmap-feature-toolbar[value^="parent_layer_"][value$=".2"]');
        await expect(featureToolbar.locator('.feature-create-child button')).toBeVisible();
        await expect(featureToolbar.locator('.feature-create-child ul')).not.toBeVisible();

        // Open children layer list with creation
        await featureToolbar.locator('.feature-create-child button').click();
        await expect(featureToolbar.locator('.feature-create-child ul')).toBeVisible();
        await expect(featureToolbar.locator('.feature-create-child ul li')).toHaveCount(1);

        // Open create feature
        let createFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('createFeature'));
        featureToolbar.locator('.feature-create-child ul li a').click();
        let createFeatureRequest = await createFeatureRequestPromise;

        let editFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('editFeature'));
        await createFeatureRequest.response();
        let editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        // Check request
        let expectedParameters = {layerId: /^children_layer_[a-zA-Z0-9_]*/};
        requestExpect(createFeatureRequest).toContainParametersInUrl(expectedParameters);
        requestExpect(editFeatureRequest).toContainParametersInUrl(expectedParameters);

        // Parent_id is hidden in form when edition is started from parent form
        await expect(page.locator('#jforms_view_edition_parent_id')).toBeHidden();
        // Parent_id input should have the value 2 selected
        await expect(page.locator('#jforms_view_edition_parent_id')).toHaveValue('2');

        // Cancel form edition...
        page.on('dialog', dialog => dialog.accept());
        await page.locator('#jforms_view_edition__submit_cancel').click();
    });

    test('should start child edition linked to a parent feature from the child feature toolbar', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();
        const layerName = 'parent_layer';

        // Click on the second point
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(594, 290);

        let getFeatureInfoRequest = await getFeatureInfoPromise;
        const getFeatureInfoExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetFeatureInfo',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': layerName,
            'QUERY_LAYERS': layerName,
        }
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData(getFeatureInfoExpectedParameters);
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Edit feature
        const featureToolbar = project.popupContent.locator(`lizmap-feature-toolbar[value^="${layerName}_"][value$=".2"]`);
        await expect(featureToolbar.locator('button.feature-edit')).toBeVisible();

        // Open edit feature
        // Create the promise to wait for the request to modify feature
        let modifyFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/modifyFeature/);
        // click on edit button from popup
        await featureToolbar.locator('button.feature-edit').click();
        let modifyFeatureRequest = await modifyFeatureRequestPromise;
        // Create the promise to wait for the request to open the form
        let editFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/editFeature/);
        // Wait for modify feature response
        await modifyFeatureRequest.response();
        let editFeatureRequest = await editFeatureRequestPromise;
        // Wait for the form and check it
        responseExpect(await editFeatureRequest.response()).toBeTextPlain();
        // Create the promise to wait for datatables request
        const datatablesPromise = project.waitForDatatablesRequest();
        let datatablesRequest = await datatablesPromise;
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();

        // Check request
        let expectedParameters = {
            layerId: /^parent_layer_[a-zA-Z0-9_]*/,
            featureId: '2',
        };
        requestExpect(modifyFeatureRequest).toContainParametersInUrl(expectedParameters);
        requestExpect(editFeatureRequest).toContainParametersInUrl(expectedParameters);

        // id input is visible
        await expect(page.locator('#jforms_view_edition_id')).toBeVisible();
        // id input should have the value 2
        await expect(page.locator('#jforms_view_edition_id')).toHaveValue('2');

        // Child layer
        const childLayerName = 'children_layer';
        const editionChildTable = page.locator(`#edition-child-tab-${layerName}-${childLayerName}`);
        const editionChildTableWrapper = page.locator(`#edition-table-${layerName}-${childLayerName}_wrapper`);

        // Child table is visible
        await expect(editionChildTable).toBeVisible();
        await expect(editionChildTableWrapper).toBeVisible();

        // Table lines
        await expect(editionChildTableWrapper.locator('tbody tr')).toHaveCount(1);

        const childFeatureToolbar = editionChildTableWrapper.locator('tbody tr lizmap-feature-toolbar');
        await expect(childFeatureToolbar.locator('button.feature-edit')).toBeVisible();

        // Open child edit feature
        // Create the promise to wait for the request to modify feature
        modifyFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/modifyFeature/);
        // click on edit button from popup
        await childFeatureToolbar.locator('button.feature-edit').click();
        modifyFeatureRequest = await modifyFeatureRequestPromise;
        // Create the promise to wait for the request to open the form
        editFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/editFeature/);
        // Wait for modify feature response
        await modifyFeatureRequest.response();
        editFeatureRequest = await editFeatureRequestPromise;
        // Wait for the form and check it
        responseExpect(await editFeatureRequest.response()).toBeTextPlain();

        // parent_id select is hidden
        await expect(page.locator('#jforms_view_edition_parent_id')).toBeHidden();
        // parent_id select should have the value 2
        await expect(page.locator('#jforms_view_edition_parent_id')).toHaveValue('2');
        // an input next to select is visible
        await expect(page.locator('#jforms_view_edition_parent_id + input')).toBeVisible();
        // the input should have the value 2 like select
        await expect(page.locator('#jforms_view_edition_parent_id + input')).toHaveValue('2');
        // and the input is disabled
        await expect(page.locator('#jforms_view_edition_parent_id + input')).toBeDisabled();
    });

    test('should delete', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();
        // Click on the second point
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(594, 290);

        let getFeatureInfoRequest = await getFeatureInfoPromise;
        const getFeatureInfoExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetFeatureInfo',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': 'parent_layer',
            'QUERY_LAYERS': 'parent_layer',
        }
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData(getFeatureInfoExpectedParameters);
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Create child button
        const featureToolbar = project.popupContent.locator('lizmap-feature-toolbar[value^="parent_layer_"][value$=".2"]');
        await expect(featureToolbar.locator('.feature-delete')).toBeVisible();

        /** @type {Dialog|null} */
        let deleteDialog = null;
        page.on("dialog", async (dialog) => {
            deleteDialog = dialog;
            //Verify dialog type.
            expect(dialog.type()).toContain("confirm");
            //Verify dialog message text.
            expect(dialog.message()).toContain("Are you sure you want to delete the selected feature?");
            //Dismiss dialog.
            await dialog.dismiss();
        });
        await featureToolbar.locator('.feature-delete').click();
        expect(deleteDialog).not.toBeNull();
    });

});

test.describe('Feature toolbar in attribute table @readonly', () => {

    test('should zoom and center', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();

        // First click on zoom-in
        let getMapRequestPromise = project.waitForGetMapRequest();
        await page.locator('#navbar button.btn.zoom-in').click();
        let getMapRequest = await getMapRequestPromise;
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'STYLES': 'défaut',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /759253.2\d+,6270938.6\d+,784600.4\d+,6287686.8\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Open Attribute table
        let datatablesRequest = await project.openAttributeTable('parent_layer', true);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();
        expect(project.attributeTableHtml('parent_layer').locator('tbody tr')).toHaveCount(2);

        // Use the first line
        let firstTr = project.attributeTableHtml('parent_layer').locator('tbody tr').first();
        expect(firstTr.locator('lizmap-feature-toolbar .feature-zoom')).toBeVisible();
        expect(firstTr.locator('lizmap-feature-toolbar .feature-center')).toBeVisible();

        // Zoom on the first feature
        getMapRequestPromise = project.waitForGetMapRequest();
        await firstTr.locator('lizmap-feature-toolbar .feature-zoom').click();
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'STYLES': 'défaut',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /771293.1\d+,6278894.0\d+,772560.5\d+,6279731.4\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Use the second line
        let secondTr = project.attributeTableHtml('parent_layer').locator('tbody tr').nth(1);
        expect(secondTr.locator('lizmap-feature-toolbar .feature-zoom')).toBeVisible();
        expect(secondTr.locator('lizmap-feature-toolbar .feature-center')).toBeVisible();

        // Center on the second feature
        getMapRequestPromise = project.waitForGetMapRequest();
        await secondTr.locator('lizmap-feature-toolbar .feature-center').click();
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'STYLES': 'défaut',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /781810.3\d+,6279059.3\d+,783077.7\d+,6279896.8\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
    });

    test('should select', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();

        // First click on zoom-in
        let getMapRequestPromise = project.waitForGetMapRequest();
        await page.locator('#navbar button.btn.zoom-in').click();
        let getMapRequest = await getMapRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'STYLES': 'défaut',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /759253.2\d+,6270938.6\d+,784600.4\d+,6287686.8\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Open Attribute table
        let datatablesRequest = await project.openAttributeTable('parent_layer', true);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();
        expect(project.attributeTableHtml('parent_layer').locator('tbody tr')).toHaveCount(2);

        // Use the first line
        let firstTr = project.attributeTableHtml('parent_layer').locator('tbody tr').first();
        expect(firstTr.locator('lizmap-feature-toolbar .feature-select')).toBeVisible();

        // Select first feature
        // click on select Button
        let getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await firstTr.locator('lizmap-feature-toolbar .feature-select').click();
        let getSelectionTokenRequest = await getSelectionTokenRequestPromise;

        // Check GetSelectionToken request
        const getSelectionTokenParameters = {
            'service': 'WMS',
            'request': 'GETSELECTIONTOKEN',
            'typename': 'parent_layer',
            'ids': '1',
        }
        requestExpect(getSelectionTokenRequest).toContainParametersInPostData(getSelectionTokenParameters);

        // Once the GetSelectionToken is received, the map is refreshed
        getMapRequestPromise = project.waitForGetMapRequest();
        await getSelectionTokenRequest.response();
        getMapRequest = await getMapRequestPromise;

        // Check GetMap request with selection token parameter
        getMapExpectedParameters['SELECTIONTOKEN'] = /^[a-zA-Z0-9]{32}$/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        await getMapRequest.response();

        // Check that the select button display that the feature is selected
        await expect(firstTr.locator('lizmap-feature-toolbar .feature-select')).toContainClass('btn-primary');
        await expect(firstTr).toContainClass('selected');
    });

    test('should start edition', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();

        // Open Attribute table
        let datatablesRequest = await project.openAttributeTable('parent_layer', true);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();
        expect(project.attributeTableHtml('parent_layer').locator('tbody tr')).toHaveCount(2);

        // Use the second line
        let secondTr = project.attributeTableHtml('parent_layer').locator('tbody tr').nth(1);
        expect(secondTr.locator('lizmap-feature-toolbar .feature-edit')).toBeVisible();

        // Open edit feature
        let modifyFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('modifyFeature'));
        await secondTr.locator('lizmap-feature-toolbar .feature-edit').click();
        let modifyFeatureRequest = await modifyFeatureRequestPromise;

        let editFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('editFeature'));
        await modifyFeatureRequest.response();
        let editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        // Check request
        let expectedParameters = {
            layerId: /^parent_layer_[a-zA-Z0-9_]*/,
            featureId: '2',
        };
        requestExpect(modifyFeatureRequest).toContainParametersInUrl(expectedParameters);
        requestExpect(editFeatureRequest).toContainParametersInUrl(expectedParameters);

        // id input is visible
        await expect(page.locator('#jforms_view_edition_id')).toBeVisible();
        // id input should have the value 2
        await expect(page.locator('#jforms_view_edition_id')).toHaveValue('2');

        // Cancel form edition...
        page.on('dialog', dialog => dialog.accept());
        await page.locator('#jforms_view_edition__submit_cancel').click();
    });

    test('should start child creation from the parent', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();

        // Open Attribute table
        let datatablesRequest = await project.openAttributeTable('parent_layer', true);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();
        expect(project.attributeTableHtml('parent_layer').locator('tbody tr')).toHaveCount(2);

        // Use the second line
        let secondTr = project.attributeTableHtml('parent_layer').locator('tbody tr').nth(1);
        await expect(secondTr.locator('lizmap-feature-toolbar .feature-create-child button')).toBeVisible();
        await expect(secondTr.locator('lizmap-feature-toolbar .feature-create-child ul')).not.toBeVisible();

        // Open children layer list with creation
        await secondTr.locator('lizmap-feature-toolbar .feature-create-child button').click();
        await expect(secondTr.locator('lizmap-feature-toolbar .feature-create-child ul')).toBeVisible();
        await expect(secondTr.locator('lizmap-feature-toolbar .feature-create-child ul li')).toHaveCount(1);

        // Open create feature
        let createFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('createFeature'));
        secondTr.locator('lizmap-feature-toolbar .feature-create-child ul li a').click();
        let createFeatureRequest = await createFeatureRequestPromise;

        let editFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('editFeature'));
        await createFeatureRequest.response();
        let editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        // Check request
        let expectedParameters = {layerId: /^children_layer_[a-zA-Z0-9_]*/};
        requestExpect(createFeatureRequest).toContainParametersInUrl(expectedParameters);
        requestExpect(editFeatureRequest).toContainParametersInUrl(expectedParameters);

        // Parent_id is hidden in form when edition is started from parent form
        await expect(page.locator('#jforms_view_edition_parent_id')).toBeHidden();
        // Parent_id input should have the value 2 selected
        await expect(page.locator('#jforms_view_edition_parent_id')).toHaveValue('2');

        // Cancel form edition...
        page.on('dialog', dialog => dialog.accept());
        await page.locator('#jforms_view_edition__submit_cancel').click();
    });

    test('should delete', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();

        // Open Attribute table
        let datatablesRequest = await project.openAttributeTable('parent_layer', true);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();
        expect(project.attributeTableHtml('parent_layer').locator('tbody tr')).toHaveCount(2);

        // Use the second line
        let secondTr = project.attributeTableHtml('parent_layer').locator('tbody tr').nth(1);
        expect(secondTr.locator('lizmap-feature-toolbar .feature-delete')).toBeVisible();

        /** @type {Dialog|null} */
        let deleteDialog = null;
        page.on("dialog", async (dialog) => {
            deleteDialog = dialog;
            //Verify dialog type.
            expect(dialog.type()).toContain("confirm");
            //Verify dialog message text.
            expect(dialog.message()).toContain("Are you sure you want to delete the selected feature?");
            //Dismiss dialog.
            await dialog.dismiss();
        });
        await secondTr.locator('lizmap-feature-toolbar .feature-delete').click();
        expect(deleteDialog).not.toBeNull();
    });

});

test.describe('Feature toolbar zoom to max @readonly', () => {

    const locale = 'en-US';

    test('Zoom to max scale for line from popup', async ({ page }) => {
        const max_scale_lines_polygons = 100000;
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['max_scale_lines_polygons'] = max_scale_lines_polygons;
            await route.fulfill({ response, json });
        });
        const project = new ProjectPage(page, 'feature_toolbar');

        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();

        // Check request
        let getMapRequest = await getMapRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /740242.9\d+,6258377.5\d+,803610.7\d+,6300247.9\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);

        // Check response
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Display layer tramway_lines
        getMapRequestPromise = project.waitForGetMapRequest();
        await page.getByTestId('tramway_lines').locator('.node').click();
        // Check Request
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters['LAYERS'] = 'tramway_lines';
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Hide parent_layer
        await page.getByTestId('parent_layer').locator('.node').click();
        expect(page.getByTestId('parent_layer')).toContainClass('not-visible');

        // Click on tramway_lines
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(410, 230);
        let getFeatureInfoRequest = await getFeatureInfoPromise;
        /** @type {{[key: string]: string|RegExp}} */
        const getFeatureInfoExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetFeatureInfo',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': 'tramway_lines',
            'QUERY_LAYERS': 'tramway_lines',
        }
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData(getFeatureInfoExpectedParameters);
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Zoom button
        const featureToolbar = await project.popupContent.locator('lizmap-feature-toolbar[value^="tramway_lines_"][value$=".2"]');
        await expect(await featureToolbar.locator('button.feature-zoom')).toBeVisible();

        // Click on zoom to in feature-toolbar
        getMapRequestPromise = project.waitForGetMapRequest();
        await featureToolbar.locator('button.feature-zoom').click();
        // Check request
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters['BBOX'] = /753267.0\d+,6274808.1\d+,778614.2\d+,6291556.3\d+/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (max_scale_lines_polygons).toLocaleString(locale));
    });

    test('Zoom to scale before max scale for line from popup', async ({ page }) => {
        const max_scale_lines_polygons = 10000;
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['max_scale_lines_polygons'] = max_scale_lines_polygons;
            await route.fulfill({ response, json });
        });
        const project = new ProjectPage(page, 'feature_toolbar');

        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();

        // Check request
        let getMapRequest = await getMapRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /740242.9\d+,6258377.5\d+,803610.7\d+,6300247.9\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);

        // Check response
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Display layer tramway_lines
        getMapRequestPromise = project.waitForGetMapRequest();
        await page.getByTestId('tramway_lines').locator('.node').click();
        // Check Request
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters['LAYERS'] = 'tramway_lines';
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Hide parent_layer
        await page.getByTestId('parent_layer').locator('.node').click();
        expect(page.getByTestId('parent_layer')).toContainClass('not-visible');

        // Click on tramway_lines
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(410, 230);
        let getFeatureInfoRequest = await getFeatureInfoPromise;
        /** @type {{[key: string]: string|RegExp}} */
        const getFeatureInfoExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetFeatureInfo',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': 'tramway_lines',
            'QUERY_LAYERS': 'tramway_lines',
        }
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData(getFeatureInfoExpectedParameters);
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Zoom button
        const featureToolbar = await project.popupContent.locator('lizmap-feature-toolbar[value^="tramway_lines_"][value$=".2"]');
        await expect(await featureToolbar.locator('button.feature-zoom')).toBeVisible();

        // Click on zoom to in feature-toolbar
        getMapRequestPromise = project.waitForGetMapRequest();
        await featureToolbar.locator('button.feature-zoom').click();
        // Check request
        getMapRequest = await getMapRequestPromise;
        // getMapExpectedParameters['BBOX'] = /753267.0\d+,6274808.1\d+,778614.2\d+,6291556.3\d+/; // Zoom to 100000
        getMapExpectedParameters['BBOX'] = /759603.8\d+,6278995.2\d+,772277.4\d+,6287369.3\d+/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).not.toHaveText('1 : ' + (max_scale_lines_polygons).toLocaleString(locale));
        // max_scale_lines_polygons is too low for the geometry
        await expect(page.locator('#overview-bar .ol-scale-text')).not.toHaveText('1 : ' + (100000).toLocaleString(locale));
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (50000).toLocaleString(locale));
    });

    test('Zoom to max scale for point from popup', async ({ page }) => {
        const max_scale_points = 100000;
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['max_scale_points'] = max_scale_points;
            await route.fulfill({ response, json });
        });
        const project = new ProjectPage(page, 'feature_toolbar');

        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();

        // Check request
        let getMapRequest = await getMapRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /740242.9\d+,6258377.5\d+,803610.7\d+,6300247.9\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);

        // Check response
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Click on parent_layer
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(436, 290);
        let getFeatureInfoRequest = await getFeatureInfoPromise;
        /** @type {{[key: string]: string|RegExp}} */
        const getFeatureInfoExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetFeatureInfo',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': 'parent_layer',
            'QUERY_LAYERS': 'parent_layer',
        }
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData(getFeatureInfoExpectedParameters);
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Zoom button
        const featureToolbar = await project.popupContent.locator('lizmap-feature-toolbar[value^="parent_layer_"][value$=".1"]');
        await expect(await featureToolbar.locator('button.feature-zoom')).toBeVisible();

        // Click on zoom to in feature-toolbar
        getMapRequestPromise = project.waitForGetMapRequest();
        await featureToolbar.locator('button.feature-zoom').click();
        // Check request
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters['BBOX'] = /759253.2\d+,6270938.6\d+,784600.4\d+,6287686.8\d+/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (max_scale_points).toLocaleString(locale));
    });

    test('Zoom to max scale for point from attribute table', async ({ page }) => {
        const max_scale_points = 100000;
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['max_scale_points'] = max_scale_points;
            await route.fulfill({ response, json });
        });
        const project = new ProjectPage(page, 'feature_toolbar');

        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();

        // Check request
        let getMapRequest = await getMapRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /740242.9\d+,6258377.5\d+,803610.7\d+,6300247.9\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);

        // Check response
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Open Attribute table
        let datatablesRequest = await project.openAttributeTable('parent_layer', true);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();
        expect(project.attributeTableHtml('parent_layer').locator('tbody tr')).toHaveCount(2);

        // Use the first line
        let firstTr = project.attributeTableHtml('parent_layer').locator('tbody tr').first();
        expect(firstTr.locator('lizmap-feature-toolbar .feature-zoom')).toBeVisible();

        // Zoom on the first feature
        getMapRequestPromise = project.waitForGetMapRequest();
        await firstTr.locator('lizmap-feature-toolbar .feature-zoom').click();
        // Check request
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters['BBOX'] = /759253.2\d+,6270938.6\d+,784600.4\d+,6287686.8\d+/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (max_scale_points).toLocaleString(locale));
    });

    test('Zoom to 1 for point from popup', async ({ page }) => {
        const initial_scale = 250000;
        const max_scale_points = 1;
        const max_scale_lines_polygons = 100000;
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['max_scale_points'] = max_scale_points;
            json.options['max_scale_lines_polygons'] = max_scale_lines_polygons;
            json.options['minScale'] = 1;
            json.options['maxScale'] = 250000;
            json.options['mapScales'] = [
                250000, 100000, 50000,
                25000, 10000, 5000,
                2500, 1000, 500,
                250, 100, 50,
                25, 10, 5, 1,
            ];
            await route.fulfill({ response, json });
        });
        const project = new ProjectPage(page, 'feature_toolbar');

        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();

        // Check request
        let getMapRequest = await getMapRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'parent_layer',
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /740242.9\d+,6258377.5\d+,803610.7\d+,6300247.9\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);

        // Check response
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).not.toHaveText('1 : ' + (max_scale_lines_polygons).toLocaleString(locale));
        await expect(page.locator('#overview-bar .ol-scale-text')).not.toHaveText('1 : ' + (max_scale_points).toLocaleString(locale));
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (initial_scale).toLocaleString(locale));

        // Click on parent_layer
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(436, 290);
        let getFeatureInfoRequest = await getFeatureInfoPromise;
        /** @type {{[key: string]: string|RegExp}} */
        const getFeatureInfoExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetFeatureInfo',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': 'parent_layer',
            'QUERY_LAYERS': 'parent_layer',
        }
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData(getFeatureInfoExpectedParameters);
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Zoom button
        const featureToolbar = await project.popupContent.locator('lizmap-feature-toolbar[value^="parent_layer_"][value$=".1"]');
        await expect(await featureToolbar.locator('button.feature-zoom')).toBeVisible();

        // Click on zoom to in feature-toolbar
        getMapRequestPromise = project.waitForGetMapRequest();
        await featureToolbar.locator('button.feature-zoom').click();
        // Check request
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters['BBOX'] = /771926.7\d+,6279312.6\d+,771926.9\d+,6279312.8\d+/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).not.toHaveText('1 : ' + (initial_scale).toLocaleString(locale));
        await expect(page.locator('#overview-bar .ol-scale-text')).not.toHaveText('1 : ' + (max_scale_lines_polygons).toLocaleString(locale));
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (max_scale_points).toLocaleString(locale));

        // Back to start
        await page.locator('#navbar button.btn.zoom-extent').click();
        // No GetMap request because of some OpenLayers cache

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).not.toHaveText('1 : ' + (max_scale_lines_polygons).toLocaleString(locale));
        await expect(page.locator('#overview-bar .ol-scale-text')).not.toHaveText('1 : ' + (max_scale_points).toLocaleString(locale));
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (initial_scale).toLocaleString(locale));

        // Click on the second point
        getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(594, 290);
        // Check request
        getFeatureInfoRequest = await getFeatureInfoPromise;
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData(getFeatureInfoExpectedParameters);
        // Check response
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Zoom button
        const secondFeatureToolbar = await project.popupContent.locator('lizmap-feature-toolbar[value^="parent_layer_"][value$=".2"]');
        await expect(secondFeatureToolbar.locator('button.feature-zoom')).toBeVisible();

        // Click on zoom to in feature-toolbar
        getMapRequestPromise = project.waitForGetMapRequest();
        await secondFeatureToolbar.locator('button.feature-zoom').click();
        // Check request
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters['BBOX'] = /782443.9\d+,6279478.0\d+,782444.1\d+,6279478.1\d+/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).not.toHaveText('1 : ' + (initial_scale).toLocaleString(locale));
        await expect(page.locator('#overview-bar .ol-scale-text')).not.toHaveText('1 : ' + (max_scale_lines_polygons).toLocaleString(locale));
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (max_scale_points).toLocaleString(locale));

        // Back to start
        await page.locator('#navbar button.btn.zoom-extent').click();
        // No GetMap request because of some OpenLayers cache

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).not.toHaveText('1 : ' + (max_scale_lines_polygons).toLocaleString(locale));
        await expect(page.locator('#overview-bar .ol-scale-text')).not.toHaveText('1 : ' + (max_scale_points).toLocaleString(locale));
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (initial_scale).toLocaleString(locale));
    });
});
