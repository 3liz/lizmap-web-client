// @ts-check
import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js'
import { expect as responseExpect } from './fixtures/expect-response.js'
import { ProjectPage } from './pages/project';
import { AdminPage } from "./pages/admin";
import { getAuthStorageStatePath } from './globals';

test.describe('Export data @readonly', () => {

    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();
    });

    test('should export the features of a spatial layer depending on the selection or filter', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        const tableName = 'parent_layer';

        // Open attribute table
        let getFeatureRequest = await project.openAttributeTable(tableName);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        // full sized bottom dock
        await page.locator('#bottom-dock-window-buttons .btn-bottomdock-size').click();

        // Check table lines
        const tableHtml = project.attributeTableHtml(tableName);
        await expect(tableHtml.locator('tbody tr')).toHaveCount(2);

        // launch export
        getFeatureRequest = await project.launchExport(tableName,'GeoJSON');

        /** @type {{[key: string]: string|RegExp}} */
        let expectedParameters = {
            'SERVICE': 'WFS',
            'REQUEST': 'GetFeature',
            'VERSION': '1.0.0',
            'OUTPUTFORMAT': 'GeoJSON',
            'TYPENAME': tableName,
            'dl': '1',
        }
        requestExpect(getFeatureRequest).toContainParametersInPostData(expectedParameters);
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        // Check body
        let body = await getFeatureResponse?.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(2);

        // Use line with id 2
        let tr2 = tableHtml.locator('tbody tr[id="2"]');

        // Select feature
        // click on select Button
        let getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await tr2.locator('lizmap-feature-toolbar .feature-select').click();
        let getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        // Once the GetSelectionToken is received, the map is refreshed
        let getMapRequestPromise = project.waitForGetMapRequest();
        await getSelectionTokenRequest.response();
        let getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

        // Check table
        await expect(tableHtml.locator('tbody tr')).toHaveCount(2);
        await expect(tableHtml.locator('tbody tr.selected')).toHaveCount(1);

        // launch export
        getFeatureRequest = await project.launchExport(tableName,'GeoJSON');
        expectedParameters['SELECTIONTOKEN'] = /^[a-zA-Z0-9]{32}$/;
        requestExpect(getFeatureRequest).toContainParametersInPostData(expectedParameters);
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        // Check body
        body = await getFeatureResponse?.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', `${tableName}.2`);
        expect(feature).toHaveProperty('properties');
        expect(feature).toHaveProperty('geometry');
        expect(feature).not.toHaveProperty('geometry', null);

        // click on filter Button
        let actionBar = project.attributeTableActionBar(tableName);
        let getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
        await actionBar.locator('.btn-filter-attributeTable').click();
        let getFilterTokenRequest = await getFilterTokenRequestPromise;

        // Once the GetFilterToken is received, the map is refreshed
        getMapRequestPromise = project.waitForGetMapRequest();
        await getFilterTokenRequest.response();
        getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

        // Check table
        await expect(tableHtml.locator('tbody tr')).toHaveCount(1);

        // launch export
        getFeatureRequest = await project.launchExport(tableName,'GeoJSON');
        delete expectedParameters['SELECTIONTOKEN'];
        expectedParameters['EXP_FILTER'] = '"id" IN ( 2 ) ';
        requestExpect(getFeatureRequest).toContainParametersInPostData(expectedParameters);
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        // Check body
        body = await getFeatureResponse?.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', tableName+'.2');
        expect(feature).toHaveProperty('properties');
        expect(feature).toHaveProperty('geometry');
        expect(feature).not.toHaveProperty('geometry', null);

        // Disable filter
        await actionBar.locator('.btn-filter-attributeTable').click();

        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(2);

        // launch export
        getFeatureRequest = await project.launchExport(tableName,'GeoJSON');
        delete expectedParameters['EXP_FILTER'];
        requestExpect(getFeatureRequest).toContainParametersInPostData(expectedParameters);
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        // Check body
        body = await getFeatureResponse?.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(2);
    });

    test('should export the features of a non spatial layer depending on the selection or filter', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        const tableName = 'data_uids';

        // Open attribute table
        let getFeatureRequest = await project.openAttributeTable(tableName);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        // full sized bottom dock
        await page.locator('#bottom-dock-window-buttons .btn-bottomdock-size').click();

        // Check table lines
        const tableHtml = project.attributeTableHtml(tableName);
        await expect(tableHtml.locator('tbody tr')).toHaveCount(5);

        // launch export
        getFeatureRequest = await project.launchExport(tableName,'GeoJSON');

        /** @type {{[key: string]: string|RegExp}} */
        let expectedParameters = {
            'SERVICE': 'WFS',
            'REQUEST': 'GetFeature',
            'VERSION': '1.0.0',
            'OUTPUTFORMAT': 'GeoJSON',
            'TYPENAME': tableName,
            'dl': '1',
        }
        requestExpect(getFeatureRequest).toContainParametersInPostData(expectedParameters);
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        // Check body
        let body = await getFeatureResponse?.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(5);

        // Use line with id 2
        let tr2 = tableHtml.locator('tbody tr[id="2"]');

        // Select feature
        // click on select Button
        let getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await tr2.locator('lizmap-feature-toolbar .feature-select').click();
        let getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        await getSelectionTokenRequest.response();

        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(5);
        await expect(tableHtml.locator('tbody tr.selected')).toHaveCount(1);

        // launch export
        getFeatureRequest = await project.launchExport(tableName,'GeoJSON');
        expectedParameters['FEATUREID'] = `${tableName}.2`;
        requestExpect(getFeatureRequest).toContainParametersInPostData(expectedParameters);
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        // Check body
        body = await getFeatureResponse?.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', `${tableName}.2`);
        expect(feature).toHaveProperty('properties');
        expect(feature).toHaveProperty('geometry', null);

        // click on filter Button
        let actionBar = project.attributeTableActionBar(tableName);
        let getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
        await actionBar.locator('.btn-filter-attributeTable').click();
        let getFilterTokenRequest = await getFilterTokenRequestPromise;
        await getFilterTokenRequest.response();

        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(1);

        // launch export
        getFeatureRequest = await project.launchExport(tableName,'GeoJSON');
        delete expectedParameters['FEATUREID'];
        expectedParameters['EXP_FILTER'] = '"id" IN ( 2 ) ';
        requestExpect(getFeatureRequest).toContainParametersInPostData(expectedParameters);
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        // Check body
        body = await getFeatureResponse?.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', tableName+'.2');
        expect(feature).toHaveProperty('properties');
        expect(feature).toHaveProperty('geometry', null);

        // Disable filter
        await actionBar.locator('.btn-filter-attributeTable').click();

        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(5);

        // launch export
        getFeatureRequest = await project.launchExport(tableName,'GeoJSON');
        delete expectedParameters['EXP_FILTER'];
        requestExpect(getFeatureRequest).toContainParametersInPostData(expectedParameters);
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        // Check body
        body = await getFeatureResponse?.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(5);

        // select feature 2 and 4
        // click to select 2
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await tr2.locator('lizmap-feature-toolbar .feature-select').click();
        getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        await getSelectionTokenRequest.response();

        // Use line with id 4
        let tr4 = tableHtml.locator('tbody tr[id="4"]');
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await tr4.locator('lizmap-feature-toolbar .feature-select').click();
        getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        await getSelectionTokenRequest.response();

        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(5);
        await expect(tableHtml.locator('tbody tr.selected')).toHaveCount(2);

        // launch export
        getFeatureRequest = await project.launchExport(tableName,'GeoJSON');
        expectedParameters['FEATUREID'] = `${tableName}.2,${tableName}.4`;
        requestExpect(getFeatureRequest).toContainParametersInPostData(expectedParameters);
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        // Check body
        body = await getFeatureResponse?.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(2);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', tableName+'.2');
        expect(feature).toHaveProperty('properties');
        expect(feature).toHaveProperty('geometry', null);
        feature = body.features[1];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', tableName+'.4');
        expect(feature).toHaveProperty('properties');
        expect(feature).toHaveProperty('geometry', null);
    });
});

test.describe('Layer export permissions ACL', () => {
    // single_wms_points -> export enabled for group_a users
    // single_wms_points_group -> export enabled, no groups specified, inherith export permission from repository level
    // single_wms_lines_group_as_layer -> export disabled
    // single_wms_lines_group_as_layer -> export enabled for group_a, group_b users
    [
        {
            login:'__anonymous',
            enabled_groups: [],
            expected: [
                {layer:'single_wms_points', onPage:0},
                {layer:'single_wms_points_group', onPage:0},
                {layer:'single_wms_lines_group_as_layer', onPage:0},
                {layer:'single_wms_polygons', onPage:0},
            ]
        },
        {
            login:'admin',
            enabled_groups: ['admins'],
            expected: [
                {layer:'single_wms_points', onPage:1},
                {layer:'single_wms_points_group', onPage:1},
                {layer:'single_wms_lines_group_as_layer', onPage:0},
                {layer:'single_wms_polygons', onPage:1},
            ]
        },
        {
            login:'user_in_group_a',
            enabled_groups: ['admins'],
            expected: [
                {layer:'single_wms_points', onPage:1},
                {layer:'single_wms_points_group', onPage:0},
                {layer:'single_wms_lines_group_as_layer', onPage:0},
                {layer:'single_wms_polygons', onPage:1},
            ]
        },
        {
            login:'user_in_group_a',
            enabled_groups: ['group_a','group_b'],
            expected: [
                {layer:'single_wms_points', onPage:1},
                {layer:'single_wms_points_group', onPage:1},
                {layer:'single_wms_lines_group_as_layer', onPage:0},
                {layer:'single_wms_polygons', onPage:1},
            ]
        },
        {
            login:'user_in_group_b',
            enabled_groups: ['admins'],
            expected: [
                {layer:'single_wms_points', onPage:0},
                {layer:'single_wms_points_group', onPage:0},
                {layer:'single_wms_lines_group_as_layer', onPage:0},
                {layer:'single_wms_polygons', onPage:1},
            ]
        },
        {
            login:'publisher',
            enabled_groups: ['group_b','group_a','admins'],
            expected: [
                {layer:'single_wms_points', onPage:0},
                {layer:'single_wms_points_group', onPage:0},
                {layer:'single_wms_lines_group_as_layer', onPage:0},
                {layer:'single_wms_polygons', onPage:0},
            ]
        },
    ].forEach(({login, enabled_groups, expected}, c) => {
        test(`#${c} Layer export with ${login} user logged in`, {
            tag: '@write',
        }, async ({browser}) => {
            // open admin page to set export permissions
            const adminContext = await browser.newContext({ storageState: getAuthStorageStatePath('admin') });
            const page = await adminContext.newPage();
            const adminPage = new AdminPage(page);

            await page.goto('admin.php');
            // open maps management page
            await adminPage.openPage('Maps management');

            // set layer export permissions
            await adminPage.modifyRepository('testsrepository');
            await adminPage.uncheckAllExportPermission();
            await adminPage.setLayerExportPermission(enabled_groups);
            await adminPage.page.getByRole('button', { name: 'Save' }).click();

            // login with specific user
            let userContext;
            if (login !== '__anonymous') {
                userContext = await browser.newContext({storageState: getAuthStorageStatePath(login)});
            } else {
                userContext = await browser.newContext();
            }
            const userPage = await userContext.newPage();

            // go to project page
            const project = new ProjectPage(userPage, 'enable_export_acl');
            await project.open();

            // check layer export capabilities for logged in user
            for(const layerObj of expected){
                let getFeatureRequest = await project.openAttributeTable(layerObj.layer);
                let getFeatureResponse = await getFeatureRequest.response();
                responseExpect(getFeatureResponse).toBeGeoJson();
                await expect(userPage.locator('.attribute-layer-action-bar .export-formats')).toHaveCount(layerObj.onPage);
                await project.closeAttributeTable();
            }

            // reset layer export permissions
            await adminPage.modifyRepository('testsrepository');
            await adminPage.resetLayerExportPermission();

            await adminPage.page.getByRole('button', { name: 'Save' }).click();
        })
    })

    test('Layer export request ACL', {
        tag: '@readonly',
    }, async ({page}) => {
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['limitDataToBbox'] = 'True';
            await route.fulfill({ response, json });
        });

        const project = new ProjectPage(page, 'enable_export_acl');
        await project.open();

        let tableName = 'single_wms_points';
        let getFeatureRequest = await project.openAttributeTable(tableName);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        // launche export
        getFeatureRequest = await project.launchExport('single_wms_points','GeoJSON');

        const expectedParameters = {
            'SERVICE': 'WFS',
            'REQUEST': 'GetFeature',
            'VERSION': '1.0.0',
            'OUTPUTFORMAT': 'GeoJSON',
            'BBOX': /3.7759\d+,43.55267\d+,3.98277\d+,43.6516\d+/,
        }

        requestExpect(getFeatureRequest).toContainParametersInPostData(expectedParameters);
    })
});
