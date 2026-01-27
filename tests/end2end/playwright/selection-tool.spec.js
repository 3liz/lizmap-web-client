// @ts-check
import { test, expect } from '@playwright/test';
import { SelectionPage } from "./pages/selectionpage";
import { expect as requestExpect } from './fixtures/expect-request.js';
import { getAuthStorageStatePath } from './globals';

test.describe('Selection tool', {tag: ['@readonly'],},() => {

    test('should toggle selection tool', async ({ page }) => {
        const project = new SelectionPage(page, 'selection');
        await project.open();

        await expect(project.selectionPanel).not.toBeVisible();

        await project.openSelectionPanel();
        await expect(project.selectionPanel).toBeVisible();

        await expect(await project.getUnselectButton()).toBeDisabled();
        await expect(await project.getFilterButton()).toBeDisabled();

        await project.closeSelectionPanel();
        await expect(project.selectionPanel).not.toBeVisible();
    });

    test('should select features intersecting a polygon', async ({ page }) => {
        const project = new SelectionPage(page, 'selection');
        await project.open();
        await project.closeLeftDock();

        // Open selection tool
        await project.openSelectionPanel();

        // Activate polygon tool
        await project.selectGeometry('polygon');

        // Select single layer and intersects geom operator
        await project.selectLayer('selection_polygon');
        await project.selectGeomOperator('intersects');

        let getFeatureRequestPromise = project.waitForGetFeatureRequest();
        const getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();

        // Draw polygon
        // It should select two features
        await expect (await project.getRefreshButton()).toHaveClass(/active/);
        await project.clickOnMap(200, 350);
        await project.clickOnMap(750, 350);
        await project.dblClickOnMap(425, 250);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        await Promise.all([getFeatureRequestPromise, getSelectionTokenRequestPromise]);
        // Check that two features are selected
        await expect(await project.getResultsContainer()).toHaveText(/^2/);

        getFeatureRequestPromise = project.waitForGetFeatureRequest();

        // Draw polygon
        // It should unselect one feature
        await (await project.getMinusButton()).click();
        await expect (await project.getRefreshButton()).not.toHaveClass(/active/);
        await expect (await project.getMinusButton()).toHaveClass(/active/);

        await project.clickOnMap(150, 300);
        await project.clickOnMap(200, 300);
        await project.dblClickOnMap(175, 350);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        await Promise.all([getFeatureRequestPromise, getSelectionTokenRequestPromise]);
        // Check that two features are selected
        await expect(await project.getResultsContainer()).toHaveText(/^1/);

        getFeatureRequestPromise = project.waitForGetFeatureRequest();

        // Draw polygon
        // It should select one more feature
        await (await project.getPlusButton()).click();
        await expect (await project.getRefreshButton()).not.toHaveClass(/active/);
        await expect (await project.getMinusButton()).not.toHaveClass(/active/);
        await expect (await project.getPlusButton()).toHaveClass(/active/);

        await project.clickOnMap(150, 300);
        await project.clickOnMap(200, 300);
        await project.dblClickOnMap(175, 350);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        await Promise.all([getFeatureRequestPromise, getSelectionTokenRequestPromise]);
        // Check that two features are selected
        await expect(await project.getResultsContainer()).toHaveText(/^2/);

        getFeatureRequestPromise = project.waitForGetFeatureRequest();

        // Draw polygon
        // It should not select any features
        await (await project.getRefreshButton()).click();
        await expect (await project.getRefreshButton()).toHaveClass(/active/);
        await expect (await project.getMinusButton()).not.toHaveClass(/active/);
        await expect (await project.getPlusButton()).not.toHaveClass(/active/);

        await project.clickOnMap(450, 350);
        await project.clickOnMap(400, 400);
        await project.dblClickOnMap(400, 350);

        // Wait for WFS GetFeature request
        await getFeatureRequestPromise;
        // Check that no feature is selected
        await expect(await project.getResultsContainer()).toHaveText(/^No object selected/);
    });

    test('should select features intersecting a line', async ({ page }) => {
        const project = new SelectionPage(page, 'selection');
        await project.open();
        await project.closeLeftDock();

        // Open selection tool
        await project.openSelectionPanel();

        // Activate polygon tool
        await project.selectGeometry('line');

        // Select single layer and intersects geom operator
        await project.selectLayer('selection_polygon');
        await project.selectGeomOperator('intersects');

        let getFeatureRequestPromise = project.waitForGetFeatureRequest();
        const getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();

        // Draw line
        // It should select two features
        await project.clickOnMap(200, 350);
        await project.dblClickOnMap(750, 350);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        await Promise.all([getFeatureRequestPromise, getSelectionTokenRequestPromise]);
        // Check that two features are selected
        await expect(await project.getResultsContainer()).toHaveText(/^2/);

        getFeatureRequestPromise = project.waitForGetFeatureRequest();

        // Draw line
        // It should not select any features
        await project.clickOnMap(450, 350);
        await project.dblClickOnMap(400, 400);

        // Wait for WFS GetFeature request
        await getFeatureRequestPromise;
        // Check that no feature is selected
        await expect(await project.getResultsContainer()).toHaveText(/^No object selected/);
    });

    test('should select features intersecting a point', async ({ page }) => {
        const project = new SelectionPage(page, 'selection');
        await project.open();
        await project.closeLeftDock();

        // Open selection tool
        await project.openSelectionPanel();

        // Activate polygon tool
        await project.selectGeometry('point');

        // Select single layer and intersects geom operator
        await project.selectLayer('selection_polygon');
        await project.selectGeomOperator('intersects');

        let getFeatureRequestPromise = project.waitForGetFeatureRequest();
        const getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();

        // Draw point
        // It should select one feature
        await project.clickOnMap(750, 350);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        await Promise.all([getFeatureRequestPromise, getSelectionTokenRequestPromise]);
        // Check that two features are selected
        await expect(await project.getResultsContainer()).toHaveText(/^1/);

        getFeatureRequestPromise = project.waitForGetFeatureRequest();

        // Draw point
        // It should not select any features
        await project.clickOnMap(450, 350);

        // Wait for WFS GetFeature request
        await getFeatureRequestPromise;
        // Check that no feature is selected
        await expect(await project.getResultsContainer()).toHaveText(/^No object selected/);
    });

    test('invert selection', async ({ page }) => {
        const project = new SelectionPage(page, 'selection');
        await project.open();
        await project.closeLeftDock();

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

        let getFeatureRequest = await getFeatureRequestPromise;
        let getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        let getMapRequest = await getMapRequestPromise;

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

        const firstToken = await getSelectionTokenRequest.response()
            .then(resp => resp?.json())
            .then(data => data.token);
        expect(firstToken).toBeTruthy();

        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            LAYERS: 'selection_polygon',
            SELECTIONTOKEN: firstToken,
        };
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);

        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        getMapRequestPromise = project.waitForGetMapRequest();

        await (await project.getInvertButton()).click();

        getFeatureRequest = await getFeatureRequestPromise;
        getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        getMapRequest = await getMapRequestPromise;

        getFeatureExpectedParameters['EXP_FILTER'] = ' $id NOT IN ( 2 ) ';
        requestExpect(getFeatureRequest).toContainParametersInPostData(getFeatureExpectedParameters);

        getSelectionTokenExpectedParameters['ids'] = '1';
        requestExpect(getSelectionTokenRequest).toContainParametersInPostData(getSelectionTokenExpectedParameters);

        const secondToken = await getSelectionTokenRequest.response()
            .then(resp => resp?.json())
            .then(data => data.token);
        expect(secondToken).toBeTruthy();
        expect(secondToken).not.toEqual(firstToken);

        getMapExpectedParameters['SELECTIONTOKEN'] = secondToken;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
    });
});

test.describe('Selection tool connected as user a', {tag: ['@readonly'],},() => {

    test.use({ storageState: getAuthStorageStatePath('user_in_group_a') });

    test('selects features intersecting a polygon', async ({ page }) => {
        const project = new SelectionPage(page, 'selection');
        await project.open();
        await project.closeLeftDock();

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
        await Promise.all([getFeatureRequestPromise, getSelectionTokenRequestPromise]);
        // Check that two features are selected
        await expect(await project.getResultsContainer()).toHaveText(/^1/);

        // Unselect
        await (await project.getUnselectButton()).click();

        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();

        // Draw polygon
        // It should select two features
        await project.clickOnMap(200, 350);
        await project.clickOnMap(750, 350);
        await project.dblClickOnMap(425, 250);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        await Promise.all([getFeatureRequestPromise, getSelectionTokenRequestPromise]);
        // Check that two features are selected
        await expect(await project.getResultsContainer()).toHaveText(/^2/);
    });
});

test.describe('Selection tool connected as admin', {tag: ['@readonly'],},() => {

    test.use({ storageState: getAuthStorageStatePath('admin') });

    test('selects features intersecting a polygon', async ({ page }) => {
        const project = new SelectionPage(page, 'selection');
        await project.open(true);
        await project.closeLeftDock();

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
        await Promise.all([getFeatureRequestPromise, getSelectionTokenRequestPromise]);
        // Check that two features are selected
        await expect(await project.getResultsContainer()).toHaveText(/^1/);

        // Unselect
        await (await project.getUnselectButton()).click();

        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();

        // Draw polygon
        // It should select two features
        await project.clickOnMap(200, 350);
        await project.clickOnMap(750, 350);
        await project.dblClickOnMap(425, 250);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        await Promise.all([getFeatureRequestPromise, getSelectionTokenRequestPromise]);
        // Check that two features are selected
        await expect(await project.getResultsContainer()).toHaveText(/^2/);
    });

});
