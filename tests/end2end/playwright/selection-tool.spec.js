// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';
import { SelectionPage } from "./pages/selectionpage";
import { expect as requestExpect } from './fixtures/expect-request.js';
import { expect as responseExpect } from './fixtures/expect-response.js';
import { getAuthStorageStatePath } from './globals';

test.describe('Selection tool', {tag: ['@readonly'],},() => {

    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'selection');
        await project.open();
        await project.closeLeftDock();
    });

    test('should toggle selection tool', async ({ page }) => {
        const project = new SelectionPage(page, 'selection');

        await expect(project.selectionPanel).not.toBeVisible();
        await expect(project.selectionMessage).toHaveCount(0);

        await project.openSelectionPanel();
        await expect(project.selectionPanel).toBeVisible();
        await expect(project.selectionMessage).toHaveCount(1);
        await expect(project.selectionMessage).toBeVisible();
        await expect(project.selectionMessage).toHaveText(
            '×Selection tool activated. Draw a shape on the map to select features.'
        );

        // Selection layer list
        const layerList = project.getLayerList();
        await expect(layerList).toBeVisible();
        await expect(layerList).toHaveValue('selectable-visible-layers');
        await expect(layerList.locator('optgroup')).toHaveCount(2);
        await expect(layerList.locator('option')).toHaveCount(4);
        await expect(layerList.locator('optgroup').first().locator('option')).toHaveCount(2);
        expect(
            await layerList.locator('optgroup').first().locator('option').evaluateAll(
                elements => elements.map(element => element.value)
            )
        ).toEqual([
            'selection', 'selection_polygon',
        ]);
        await expect(layerList.locator('optgroup').last().locator('option')).toHaveCount(2);

        // Digitizing toolbar
        const digitizingToolBar = project.getDigitizingToolBar();
        await expect(digitizingToolBar).toBeVisible();
        expect(await digitizingToolBar.evaluate(
            element => element.context)
        ).toBe('selectiontool');
        expect(await digitizingToolBar.evaluate(
            element => element.deactivate)
        ).toBe(false);
        expect(await digitizingToolBar.evaluate(
            element => element.disabled)
        ).toBe(false);
        expect(await digitizingToolBar.evaluate(
            element => element.measureAvailable)
        ).toBe(false);
        expect(await digitizingToolBar.evaluate(
            element => element.saveAvailable)
        ).toBe(false);
        expect(await digitizingToolBar.evaluate(
            element => element.importExportAvailable)
        ).toBe(true);
        expect(await digitizingToolBar.evaluate(
            element => element.textToolsAvailable)
        ).toBe(false);
        expect(await digitizingToolBar.evaluate(
            element => element.availableTools)
        ).toEqual([
            "point", "line", "polygon", "box", "freehand"
        ]);
        expect(await digitizingToolBar.evaluate(
            element => element.toolSelected)
        ).toBe('box');

        // Buffer input
        await expect(project.getBufferInput()).toBeVisible();
        await expect(project.getBufferInput()).toHaveValue('0');

        // Buffer geom operator select
        const bufferGeomOperatorSelect = project.getBufferGeomOperatorSelect();
        await expect(bufferGeomOperatorSelect).toBeVisible();
        await expect(bufferGeomOperatorSelect).toHaveValue('intersects');
        await expect(bufferGeomOperatorSelect.locator('option')).toHaveCount(7);
        expect(
            await bufferGeomOperatorSelect.locator('option').evaluateAll(
                elements => elements.map(element => element.value)
            )
        ).toEqual([
            'intersects', 'within', 'overlaps', 'contains', 'crosses', 'disjoint', 'touches',
        ]);

        // Results selection container
        await expect(project.getResultsContainer()).toBeVisible();
        await expect(project.getResultsContainer()).toHaveText(/^No object selected/);

        // Selection actions toolbar
        await expect(project.getRefreshButton()).toBeEnabled();
        await expect(project.getRefreshButton()).toContainClass('active');
        await expect(project.getPlusButton()).toBeEnabled();
        await expect(project.getPlusButton()).not.toContainClass('active');
        await expect(project.getMinusButton()).toBeEnabled();
        await expect(project.getMinusButton()).not.toContainClass('active');
        await expect(project.getUnselectButton()).toBeDisabled();
        await expect(project.getFilterButton()).toBeDisabled();
        await expect(project.getInvertButton()).toBeDisabled();
        await expect(project.getExportButton()).toBeDisabled();
        await expect(project.getExportFormatsList()).toBeHidden();
        await expect(project.getExportFormatsItems()).toHaveCount(12);

        await project.closeSelectionPanel();
        await expect(project.selectionPanel).not.toBeVisible();

        await expect(project.selectionMessage).toHaveCount(0);
    });

    test('should select features intersecting a polygon', async ({ page }) => {
        const project = new SelectionPage(page, 'selection');

        // Open selection tool
        await project.openSelectionPanel();

        // Activate polygon tool
        await project.selectGeometry('polygon');
        expect(await project.getDigitizingToolBar().evaluate(
            element => element.toolSelected)
        ).toBe('polygon');

        // Select single layer and intersects geom operator
        await project.selectLayer('selection_polygon');
        await expect(project.getLayerList()).toHaveValue('selection_polygon');
        await expect(project.getBufferGeomOperatorSelect()).toHaveValue('intersects');

        let getFeatureRequestPromise = project.waitForGetFeatureRequest();
        let getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();

        // Draw polygon
        // It should select two features
        await expect (project.getRefreshButton()).toHaveClass(/active/);
        await project.clickOnMap(200, 350);
        await project.clickOnMap(750, 350);
        await project.dblClickOnMap(425, 250);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        let [getFeatureRequest, getSelectionToken] = await Promise.all([
            getFeatureRequestPromise, getSelectionTokenRequestPromise
        ]);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        await responseExpect(getFeatureResponse).toHaveGeoJsonFeaturesLength(2);
        responseExpect(await getSelectionToken.response()).toBeJson();
        // Check that two features are selected
        await expect(project.getResultsContainer()).toHaveText(/^2/);

        // Check selection actions toolbar
        await expect(project.getRefreshButton()).toBeEnabled();
        await expect(project.getRefreshButton()).toContainClass('active');
        await expect(project.getPlusButton()).toBeEnabled();
        await expect(project.getPlusButton()).not.toContainClass('active');
        await expect(project.getMinusButton()).toBeEnabled();
        await expect(project.getMinusButton()).not.toContainClass('active');
        await expect(project.getUnselectButton()).toBeEnabled(); // has change
        await expect(project.getFilterButton()).toBeEnabled(); // has change
        await expect(project.getInvertButton()).toBeEnabled(); // has change: 1 layer + more than 1 select
        await expect(project.getExportButton()).toBeEnabled(); // has change: 1 layer + more than 1 select

        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();

        // Draw polygon
        // It should unselect one feature
        await (project.getMinusButton()).click();
        await expect (project.getRefreshButton()).not.toContainClass('active');
        await expect(project.getPlusButton()).not.toContainClass('active');
        await expect (project.getMinusButton()).toContainClass('active');

        await project.clickOnMap(150, 300);
        await project.clickOnMap(200, 300);
        await project.dblClickOnMap(175, 350);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        [getFeatureRequest, getSelectionToken] = await Promise.all([
            getFeatureRequestPromise, getSelectionTokenRequestPromise
        ]);
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        await responseExpect(getFeatureResponse).toHaveGeoJsonFeaturesLength(1);
        responseExpect(await getSelectionToken.response()).toBeJson();
        // Check that two features are selected
        await expect(project.getResultsContainer()).toHaveText(/^1/);

        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();

        // Draw polygon
        // It should select one more feature
        await (project.getPlusButton()).click();
        await expect (project.getRefreshButton()).not.toContainClass('active');
        await expect (project.getMinusButton()).not.toContainClass('active');
        await expect (project.getPlusButton()).toContainClass('active');

        await project.clickOnMap(150, 300);
        await project.clickOnMap(200, 300);
        await project.dblClickOnMap(175, 350);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        [getFeatureRequest, getSelectionToken] = await Promise.all([
            getFeatureRequestPromise, getSelectionTokenRequestPromise
        ]);
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        await responseExpect(getFeatureResponse).toHaveGeoJsonFeaturesLength(1);
        responseExpect(await getSelectionToken.response()).toBeJson();
        // Check that two features are selected
        await expect(project.getResultsContainer()).toHaveText(/^2/);

        getFeatureRequestPromise = project.waitForGetFeatureRequest();

        // Draw polygon
        // It should not select any features
        await (project.getRefreshButton()).click();
        await expect (project.getRefreshButton()).toContainClass('active');
        await expect (project.getMinusButton()).not.toContainClass('active');
        await expect (project.getPlusButton()).not.toContainClass('active');

        await project.clickOnMap(450, 350);
        await project.clickOnMap(400, 400);
        await project.dblClickOnMap(400, 350);

        // Wait for WFS GetFeature request
        getFeatureRequest = await getFeatureRequestPromise;
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        await responseExpect(getFeatureResponse).toHaveGeoJsonFeaturesLength(0);
        // Check that no feature is selected
        await expect(project.getResultsContainer()).toHaveText(/^No object selected/);

        // Check selection actions toolbar
        await expect(project.getUnselectButton()).toBeDisabled();
        await expect(project.getFilterButton()).toBeDisabled();
        await expect(project.getInvertButton()).toBeDisabled();
        await expect(project.getExportButton()).toBeDisabled();
    });

    test('should select features intersecting a line', async ({ page }) => {
        const project = new SelectionPage(page, 'selection');

        // Open selection tool
        await project.openSelectionPanel();

        // Activate polygon tool
        await project.selectGeometry('line');
        expect(await project.getDigitizingToolBar().evaluate(
            element => element.toolSelected)
        ).toBe('line');

        // Select single layer and intersects geom operator
        await project.selectLayer('selection_polygon');
        await expect(project.getLayerList()).toHaveValue('selection_polygon');
        await expect(project.getBufferGeomOperatorSelect()).toHaveValue('intersects');

        let getFeatureRequestPromise = project.waitForGetFeatureRequest();
        let getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();

        // Draw line
        // It should select two features
        await project.clickOnMap(200, 350);
        await project.dblClickOnMap(750, 350);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        let [getFeatureRequest, getSelectionToken] = await Promise.all([
            getFeatureRequestPromise, getSelectionTokenRequestPromise
        ]);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        await responseExpect(getFeatureResponse).toHaveGeoJsonFeaturesLength(2);
        responseExpect(await getSelectionToken.response()).toBeJson();
        // Check that two features are selected
        await expect(project.getResultsContainer()).toHaveText(/^2/);

        // Check selection actions toolbar
        await expect(project.getRefreshButton()).toBeEnabled();
        await expect(project.getRefreshButton()).toContainClass('active');
        await expect(project.getPlusButton()).toBeEnabled();
        await expect(project.getPlusButton()).not.toContainClass('active');
        await expect(project.getMinusButton()).toBeEnabled();
        await expect(project.getMinusButton()).not.toContainClass('active');
        await expect(project.getUnselectButton()).toBeEnabled(); // has change
        await expect(project.getFilterButton()).toBeEnabled(); // has change
        await expect(project.getInvertButton()).toBeEnabled(); // has change: 1 layer + more than 1 select
        await expect(project.getExportButton()).toBeEnabled(); // has change: 1 layer + more than 1 select

        getFeatureRequestPromise = project.waitForGetFeatureRequest();

        // Draw line
        // It should not select any features
        await project.clickOnMap(450, 350);
        await project.dblClickOnMap(400, 400);

        // Wait for WFS GetFeature request
        getFeatureRequest = await getFeatureRequestPromise;
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        await responseExpect(getFeatureResponse).toHaveGeoJsonFeaturesLength(0);
        // Check that no feature is selected
        await expect(project.getResultsContainer()).toHaveText(/^No object selected/);

        // Check selection actions toolbar
        await expect(project.getUnselectButton()).toBeDisabled();
        await expect(project.getFilterButton()).toBeDisabled();
        await expect(project.getInvertButton()).toBeDisabled();
        await expect(project.getExportButton()).toBeDisabled();
    });

    test('should select features intersecting a point', async ({ page }) => {
        const project = new SelectionPage(page, 'selection');

        // Open selection tool
        await project.openSelectionPanel();

        // Activate polygon tool
        await project.selectGeometry('point');
        expect(await project.getDigitizingToolBar().evaluate(
            element => element.toolSelected)
        ).toBe('point');

        // Select single layer and intersects geom operator
        await project.selectLayer('selection_polygon');
        await expect(project.getLayerList()).toHaveValue('selection_polygon');
        await expect(project.getBufferGeomOperatorSelect()).toHaveValue('intersects');

        let getFeatureRequestPromise = project.waitForGetFeatureRequest();
        let getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();

        // Draw point
        // It should select one feature
        await project.clickOnMap(750, 350);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        let [getFeatureRequest, getSelectionToken] = await Promise.all([
            getFeatureRequestPromise, getSelectionTokenRequestPromise
        ]);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        await responseExpect(getFeatureResponse).toHaveGeoJsonFeaturesLength(1);
        responseExpect(await getSelectionToken.response()).toBeJson();
        // Check that two features are selected
        await expect(project.getResultsContainer()).toHaveText(/^1/);

        // Check selection actions toolbar
        await expect(project.getRefreshButton()).toBeEnabled();
        await expect(project.getRefreshButton()).toContainClass('active');
        await expect(project.getPlusButton()).toBeEnabled();
        await expect(project.getPlusButton()).not.toContainClass('active');
        await expect(project.getMinusButton()).toBeEnabled();
        await expect(project.getMinusButton()).not.toContainClass('active');
        await expect(project.getUnselectButton()).toBeEnabled(); // has change
        await expect(project.getFilterButton()).toBeEnabled(); // has change
        await expect(project.getInvertButton()).toBeEnabled(); // has change: 1 layer + more than 1 select
        await expect(project.getExportButton()).toBeEnabled(); // has change: 1 layer + more than 1 select

        getFeatureRequestPromise = project.waitForGetFeatureRequest();

        // Draw point
        // It should not select any features
        await project.clickOnMap(450, 350);

        // Wait for WFS GetFeature request
        getFeatureRequest = await getFeatureRequestPromise;
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        await responseExpect(getFeatureResponse).toHaveGeoJsonFeaturesLength(0);
        // Check that no feature is selected
        await expect(project.getResultsContainer()).toHaveText(/^No object selected/);

        // Check selection actions toolbar
        await expect(project.getUnselectButton()).toBeDisabled();
        await expect(project.getFilterButton()).toBeDisabled();
        await expect(project.getInvertButton()).toBeDisabled();
        await expect(project.getExportButton()).toBeDisabled();
    });

    test('invert selection', async ({ page }) => {
        const project = new SelectionPage(page, 'selection');

        // Open selection tool
        await project.openSelectionPanel();

        // Activate polygon tool
        await project.selectGeometry('point');

        // Select single layer and intersects geom operator
        await project.selectLayer('selection_polygon');
        await project.selectGeomOperator('intersects');

        let getFeatureRequestPromise = project.waitForGetFeatureRequest();
        let getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        let getMapRequestPromise = project.waitForGetMapRequest();

        // Draw point
        // It should select one feature
        await project.clickOnMap(750, 350);

        let [getFeatureRequest, getSelectionTokenRequest, getMapRequest] = await Promise.all([
            getFeatureRequestPromise, getSelectionTokenRequestPromise, getMapRequestPromise
        ]);

        /** @type {{[key: string]: string|RegExp}} */
        let getFeatureExpectedParameters = {
            TYPENAME: 'selection_polygon',
            EXP_FILTER: /intersects\(\$geometry, geom_from_gml.*\)/,
        };
        requestExpect(getFeatureRequest).toContainParametersInPostData(getFeatureExpectedParameters);

        /** @type {{[key: string]: string|RegExp}} */
        let getSelectionTokenExpectedParameters = {
            typename: 'selection_polygon',
            ids: '2',
        };
        requestExpect(getSelectionTokenRequest).toContainParametersInPostData(getSelectionTokenExpectedParameters);

        // Check responses
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        await responseExpect(getFeatureResponse).toHaveGeoJsonFeaturesLength(1);

        let getSelectionTokenResponse = await getSelectionTokenRequest.response();
        responseExpect(getSelectionTokenResponse).toBeJson();

        // get the token
        let jsonGetSelectionToken = await getSelectionTokenResponse?.json();
        expect(jsonGetSelectionToken).toHaveProperty('token');
        const firstToken = jsonGetSelectionToken['token'];
        expect(firstToken).toBeTruthy();
        expect(firstToken).toHaveLength(32);

        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            LAYERS: 'selection_polygon',
            SELECTIONTOKEN: firstToken,
        };
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);

        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        getMapRequestPromise = project.waitForGetMapRequest();

        await (project.getInvertButton()).click();

        [getFeatureRequest, getSelectionTokenRequest, getMapRequest] = await Promise.all([
            getFeatureRequestPromise, getSelectionTokenRequestPromise, getMapRequestPromise
        ]);

        getFeatureExpectedParameters['EXP_FILTER'] = ' $id NOT IN ( 2 ) ';
        requestExpect(getFeatureRequest).toContainParametersInPostData(getFeatureExpectedParameters);

        getSelectionTokenExpectedParameters['ids'] = '1';
        requestExpect(getSelectionTokenRequest).toContainParametersInPostData(getSelectionTokenExpectedParameters);

        // Check responses
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        await responseExpect(getFeatureResponse).toHaveGeoJsonFeaturesLength(1);

        getSelectionTokenResponse = await getSelectionTokenRequest.response();
        responseExpect(getSelectionTokenResponse).toBeJson();

        // get the token
        jsonGetSelectionToken = await getSelectionTokenResponse?.json();
        expect(jsonGetSelectionToken).toHaveProperty('token');
        const secondToken = jsonGetSelectionToken['token'];
        expect(secondToken).toBeTruthy();
        expect(secondToken).not.toEqual(firstToken);

        getMapExpectedParameters['SELECTIONTOKEN'] = secondToken;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
    });
});

test.describe('Selection tool connected as user a', {tag: ['@readonly'],},() => {

    test.use({ storageState: getAuthStorageStatePath('user_in_group_a') });

    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'selection');
        await project.open();
        await project.closeLeftDock();
    });

    test('selects features intersecting a polygon', async ({ page }) => {
        const project = new SelectionPage(page, 'selection');

        // Open selection tool
        await project.openSelectionPanel();

        // Activate polygon tool
        await project.selectGeometry('polygon');

        // Select single layer and intersects geom operator
        await project.selectLayer('selection_polygon');
        await project.selectGeomOperator('intersects');

        let getFeatureRequestPromise = project.waitForGetFeatureRequest();
        let getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();

        // Draw polygon
        // It should select two features
        await project.clickOnMap(180, 280);
        await project.clickOnMap(200, 380);
        await project.dblClickOnMap(300, 380);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        let [getFeatureRequest, getSelectionToken] = await Promise.all([
            getFeatureRequestPromise, getSelectionTokenRequestPromise
        ]);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        await responseExpect(getFeatureResponse).toHaveGeoJsonFeaturesLength(1);
        responseExpect(await getSelectionToken.response()).toBeJson();
        // Check that two features are selected
        await expect(project.getResultsContainer()).toHaveText(/^1/);

        // Unselect
        await (project.getUnselectButton()).click();

        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();

        // Draw polygon
        // It should select two features
        await project.clickOnMap(200, 350);
        await project.clickOnMap(750, 350);
        await project.dblClickOnMap(425, 250);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        [getFeatureRequest, getSelectionToken] = await Promise.all([
            getFeatureRequestPromise, getSelectionTokenRequestPromise
        ]);
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        await responseExpect(getFeatureResponse).toHaveGeoJsonFeaturesLength(2);
        responseExpect(await getSelectionToken.response()).toBeJson();
        // Check that two features are selected
        await expect(project.getResultsContainer()).toHaveText(/^2/);
    });
});

test.describe('Selection tool connected as admin', {tag: ['@readonly'],},() => {

    test.use({ storageState: getAuthStorageStatePath('admin') });

    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'selection');
        await project.open();
        await project.closeLeftDock();
    });

    test('selects features intersecting a polygon', async ({ page }) => {
        const project = new SelectionPage(page, 'selection');

        // Open selection tool
        await project.openSelectionPanel();

        // Activate polygon tool
        await project.selectGeometry('polygon');

        // Select single layer and intersects geom operator
        await project.selectLayer('selection_polygon');
        await project.selectGeomOperator('intersects');

        let getFeatureRequestPromise = project.waitForGetFeatureRequest();
        let getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();

        // Draw polygon
        // It should select two features
        await project.clickOnMap(180, 280);
        await project.clickOnMap(200, 380);
        await project.dblClickOnMap(300, 380);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        let [getFeatureRequest, getSelectionToken] = await Promise.all([
            getFeatureRequestPromise, getSelectionTokenRequestPromise
        ]);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        await responseExpect(getFeatureResponse).toHaveGeoJsonFeaturesLength(1);
        responseExpect(await getSelectionToken.response()).toBeJson();
        // Check that two features are selected
        await expect(project.getResultsContainer()).toHaveText(/^1/);

        // Unselect
        await (project.getUnselectButton()).click();

        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();

        // Draw polygon
        // It should select two features
        await project.clickOnMap(200, 350);
        await project.clickOnMap(750, 350);
        await project.dblClickOnMap(425, 250);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        [getFeatureRequest, getSelectionToken] = await Promise.all([
            getFeatureRequestPromise, getSelectionTokenRequestPromise
        ]);
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        await responseExpect(getFeatureResponse).toHaveGeoJsonFeaturesLength(2);
        responseExpect(await getSelectionToken.response()).toBeJson();
        // Check that two features are selected
        await expect(project.getResultsContainer()).toHaveText(/^2/);
    });

});
