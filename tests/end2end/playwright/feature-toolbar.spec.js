// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'
import { ProjectPage } from "./pages/project";
import { expectParametersToContain } from './globals';

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
        await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);
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
        await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);
        await getMapRequest.response();

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
        await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);
        await getMapRequest.response();
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
        await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);
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
        await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);
        await getMapRequest.response();

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
        await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);
        await getMapRequest.response();

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
        await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);
        await getMapRequest.response();
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
        await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);
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
        await expectParametersToContain('GetSelectionToken', getSelectionTokenRequest.postData() ?? '', getSelectionTokenParameters);

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
        await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);
        await getMapRequest.response();

        // Check that the select button display that the feature is selected
        await expect(featureToolbar.locator('button.feature-select')).toContainClass('btn-primary');

        // Open Attribute table
        let getFeatureRequest = await project.openAttributeTable('parent_layer');
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        // Check first line
        let firstTr = project.attributeTableHtml('parent_layer').locator('tbody tr').first();
        await expect(firstTr).toContainClass('selected');
        await expect(firstTr.locator('lizmap-feature-toolbar button.feature-select')).toContainClass('btn-primary');

        // An other click on select Button to unselect
        getMapRequestPromise = project.waitForGetMapRequest();
        await featureToolbar.locator('button.feature-select').click();
        getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

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
        await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);
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
        await expectParametersToContain('GetFilterToken', getFilterTokenRequest.postData() ?? '', getFilterTokenParameters);

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
        await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);
        await getMapRequest.response();

        // Check that the filter button display that the feature is filtered
        await expect(featureToolbar.locator('button.feature-filter')).toContainClass('btn-primary');

        // Open Attribute table
        let getFeatureRequest = await project.openAttributeTable('parent_layer');
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

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
        await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);
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
        await expectParametersToContain('GetSelectionToken', getSelectionTokenRequest.postData() ?? '', getSelectionTokenParameters);

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
        await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);
        await getMapRequest.response();

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
        await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);
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
        await expectParametersToContain('modifyFeature', modifyFeatureRequest.url(), expectedParameters);
        await expectParametersToContain('editFeature', editFeatureRequest.url(), expectedParameters);

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
        await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);
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
        await expectParametersToContain('createFeature', createFeatureRequest.url(), expectedParameters);
        await expectParametersToContain('editFeature', editFeatureRequest.url(), expectedParameters);

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
        await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);
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
        await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);
        await getMapRequest.response();

        // Open Attribute table
        let getFeatureRequest = await project.openAttributeTable('parent_layer', true);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
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
        await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);
        await getMapRequest.response();

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
        await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);
        await getMapRequest.response();
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
        await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);
        await getMapRequest.response();

        // Open Attribute table
        let getFeatureRequest = await project.openAttributeTable('parent_layer', true);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
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
        await expectParametersToContain('GetSelectionToken', getSelectionTokenRequest.postData() ?? '', getSelectionTokenParameters);

        // Once the GetSelectionToken is received, the map is refreshed
        getMapRequestPromise = project.waitForGetMapRequest();
        await getSelectionTokenRequest.response();
        getMapRequest = await getMapRequestPromise;

        // Check GetMap request with selection token parameter
        getMapExpectedParameters['SELECTIONTOKEN'] = /^[a-zA-Z0-9]{32}$/;
        await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);
        await getMapRequest.response();

        // Check that the select button display that the feature is selected
        await expect(firstTr.locator('lizmap-feature-toolbar .feature-select')).toContainClass('btn-primary');
        await expect(firstTr).toContainClass('selected');
    });

    test('should start edition', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();

        // Open Attribute table
        let getFeatureRequest = await project.openAttributeTable('parent_layer', true);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
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
        await expectParametersToContain('modifyFeature', modifyFeatureRequest.url(), expectedParameters);
        await expectParametersToContain('editFeature', editFeatureRequest.url(), expectedParameters);

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
        let getFeatureRequest = await project.openAttributeTable('parent_layer', true);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
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
        await expectParametersToContain('createFeature', createFeatureRequest.url(), expectedParameters);
        await expectParametersToContain('editFeature', editFeatureRequest.url(), expectedParameters);

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
        let getFeatureRequest = await project.openAttributeTable('parent_layer', true);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
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
