// @ts-check
import { test, expect } from '@playwright/test';
import { SelectionPage } from "./pages/selectionpage";
import { expectParametersToContain , getAuthStorageStatePath } from './globals';

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
        await project.clickOnMap(200, 350);
        await project.clickOnMap(750, 350);
        await project.dblClickOnMap(425, 250);

        // Wait for WFS GetFeature request and WMS GetSelectionToken request
        await Promise.all([getFeatureRequestPromise, getSelectionTokenRequestPromise]);
        // Check that two features are selected
        await expect(await project.getResultsContainer()).toHaveText(/^2/);

        getFeatureRequestPromise = project.waitForGetFeatureRequest();

        // Draw polygon
        // It should not select any features
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

        await expectParametersToContain(
            'GetFeature with intersects',
            getFeatureRequest.postData() ?? '',
            {
                TYPENAME: 'selection_polygon',
                EXP_FILTER: /intersects\(\$geometry, geom_from_gml.*\)/,
            },
        );

        await expectParametersToContain(
            'GetSelectionToken after GetFeature with intersects',
            getSelectionTokenRequest.postData() ?? '',
            {
                typename: 'selection_polygon',
                ids: '2',
            },
        );

        const firstToken = await getSelectionTokenRequest.response()
            .then(resp => resp?.json())
            .then(data => data.token);
        await expect(firstToken).toBeTruthy();

        await expectParametersToContain(
            'GetMap with selection token',
            getMapRequest.url(),
            {
                LAYERS: 'selection_polygon',
                SELECTIONTOKEN: firstToken,
            },
        );

        getFeatureRequestPromise = project.waitForGetFeatureRequest();
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        getMapRequestPromise = project.waitForGetMapRequest();

        await (await project.getInvertButton()).click();

        getFeatureRequest = await getFeatureRequestPromise;
        getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        getMapRequest = await getMapRequestPromise;

        await expectParametersToContain(
            'GetFeature',
            getFeatureRequest.postData() ?? '',
            {
                TYPENAME: 'selection_polygon',
                EXP_FILTER: ' $id NOT IN ( 2 ) ',
            },
        );

        await expectParametersToContain(
            'GetSelectionToken after GetFeature with intersects',
            getSelectionTokenRequest.postData() ?? '',
            {
                typename: 'selection_polygon',
                ids: '1',
            },
        );

        const secondToken = await getSelectionTokenRequest.response()
            .then(resp => resp?.json())
            .then(data => data.token);
        await expect(secondToken).toBeTruthy();
        await expect(secondToken).not.toEqual(firstToken);

        await expectParametersToContain(
            'GetMap with selection token',
            getMapRequest.url(),
            {
                LAYERS: 'selection_polygon',
                SELECTIONTOKEN: secondToken,
            },
        );
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
