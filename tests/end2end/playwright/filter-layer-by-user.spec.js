// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'
import { ProjectPage } from './pages/project';
import { getAuthStorageStatePath } from './globals';


test.describe('Filter layer data by user - admin - @readonly @requests', () => {
    test.use({ storageState: getAuthStorageStatePath('admin') });

    test('WMS GetFeatureInfo JSON', async ({ request }) => {
        let params = new URLSearchParams({
            repository: "testsrepository",
            project: "filter_layer_by_user",
            SERVICE: "WMS",
            REQUEST: "GetFeatureInfo",
            VERSION: "1.3.0",
            CRS: "EPSG:2154",
            INFO_FORMAT:  "application/json",
            QUERY_LAYERS: "green_filter_layer_by_user_edition_only,blue_filter_layer_by_user,red_layer_with_no_filter",
            LAYERS: "green_filter_layer_by_user_edition_only,blue_filter_layer_by_user,red_layer_with_no_filter",
            STYLE: "default,default,default",
            FEATURE_COUNT: "10",
            FILTER: 'green_filter_layer_by_user_edition_only:"gid" > 0'
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();
        // check body
        const body = await response.json();
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(7);
        // check a specific feature
        expect(body.features[0].id).not.toBeUndefined()
    });

    test('WFS GetFeature', async ({ request }) => {
        /** @type {{[key: string]: string}} */
        let wfsParams = {
            repository: "testsrepository",
            project: "filter_layer_by_user",
            SERVICE: "WFS",
            REQUEST: "GetFeature",
            VERSION: "1.0.0",
            OUTPUTFORMAT: "GeoJSON",
            TYPENAME: "blue_filter_layer_by_user"
        };
        let params = new URLSearchParams(wfsParams);
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeGeoJson();
        // check body
        let body = await response.json();
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(3);
        // check a specific feature
        expect(body.features[0].id).not.toBeUndefined()

        // Filter
        wfsParams['EXP_Filter'] = '"gid" = 3';
        params = new URLSearchParams(wfsParams);
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeGeoJson();
        // check body
        body = await response.json();
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        // check a specific feature
        expect(body.features[0].id).not.toBeUndefined()
    });
});

test.describe('Filter layer data by user - user in group a - @readonly @requests', () => {
    test.use({ storageState: getAuthStorageStatePath('user_in_group_a') });

    test('WMS GetFeatureInfo JSON', async ({ request }) => {
        let params = new URLSearchParams({
            repository: "testsrepository",
            project: "filter_layer_by_user",
            SERVICE: "WMS",
            REQUEST: "GetFeatureInfo",
            VERSION: "1.3.0",
            CRS: "EPSG:2154",
            INFO_FORMAT:  "application/json",
            QUERY_LAYERS: "green_filter_layer_by_user_edition_only,blue_filter_layer_by_user,red_layer_with_no_filter",
            LAYERS: "green_filter_layer_by_user_edition_only,blue_filter_layer_by_user,red_layer_with_no_filter",
            STYLE: "default,default,default",
            FEATURE_COUNT: "10",
            FILTER: 'green_filter_layer_by_user_edition_only:"gid" > 0'
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();
        // check body
        const body = await response.json();
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(5);
        // check a specific feature
        expect(body.features[0].id).not.toBeUndefined()
    });

    test('WFS GetFeature', async ({ request }) => {
        /** @type {{[key: string]: string}} */
        let wfsParams = {
            repository: "testsrepository",
            project: "filter_layer_by_user",
            SERVICE: "WFS",
            REQUEST: "GetFeature",
            VERSION: "1.0.0",
            OUTPUTFORMAT: "GeoJSON",
            TYPENAME: "blue_filter_layer_by_user"
        };
        let params = new URLSearchParams(wfsParams);
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeGeoJson();
        // check body
        let body = await response.json();
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);

        // Filter
        wfsParams['EXP_Filter'] = '"gid" = 3';
        params = new URLSearchParams(wfsParams);
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeGeoJson();
        // check body
        body = await response.json();
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);
    });
});

test.describe('Filter layer data by user - not connected - @readonly @requests', () => {

    test('WMS GetFeatureInfo JSON', async ({ request }) => {
        let params = new URLSearchParams({
            repository: "testsrepository",
            project: "filter_layer_by_user",
            SERVICE: "WMS",
            REQUEST: "GetFeatureInfo",
            VERSION: "1.3.0",
            CRS: "EPSG:2154",
            INFO_FORMAT:  "application/json",
            QUERY_LAYERS: "green_filter_layer_by_user_edition_only,blue_filter_layer_by_user,red_layer_with_no_filter",
            LAYERS: "green_filter_layer_by_user_edition_only,blue_filter_layer_by_user,red_layer_with_no_filter",
            STYLE: "default,default,default",
            FEATURE_COUNT: "10",
            FILTER: 'green_filter_layer_by_user_edition_only:"gid" > 0'
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();
        // check body
        const body = await response.json();
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(4);
        // check a specific feature
        expect(body.features[0].id).not.toBeUndefined()
    });

    test('WFS GetFeature', async ({ request }) => {
        let params = new URLSearchParams({
            repository: "testsrepository",
            project: "filter_layer_by_user",
            SERVICE: "WFS",
            REQUEST: "GetFeature",
            VERSION: "1.0.0",
            OUTPUTFORMAT: "GeoJSON",
            TYPENAME: "blue_filter_layer_by_user"
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeGeoJson();
        // check body
        const body = await response.json();
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);
    });
});

test.describe('Filter layer data by user - admin - @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('admin') });

    test('Popup with map click', async ({ page }) => {
        const project = new ProjectPage(page, 'filter_layer_by_user');
        await project.open();
        await project.closeLeftDock();

        // blue_filter_layer_by_user
        // admin point
        let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(356-30, 346-75);
        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Blue object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('blue_filter_layer_by_user');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveCount(1);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveAttribute('value', /filter_layer_by_user_[a-z0-9_]{36}.1/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-delete')).not.toHaveClass(/hide/);

        await project.closeLeftDock();

        // blue_filter_layer_by_user
        // user_in_group_a point
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(510-30, 341-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Blue object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('blue_filter_layer_by_user');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveCount(1);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveAttribute('value', /filter_layer_by_user_[a-z0-9_]{36}.2/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-delete')).not.toHaveClass(/hide/);

        await project.closeLeftDock();

        // red_layer_with_no_filter
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(438-30, 193-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Red object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('red_layer_with_no_filter');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveCount(1);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveAttribute('value', /layer_with_no_filter_[a-z0-9_]{36}.1/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-delete')).not.toHaveClass(/hide/);

        await project.closeLeftDock();

        // green_filter_layer_by_user_edition_only
        // admin point
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(383-30, 500-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Green object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveCount(1);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveAttribute('value', /filter_layer_by_user_edition_only_[a-z0-9_]{36}.1/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-delete')).not.toHaveClass(/hide/);

        await project.closeLeftDock();

        // green_filter_layer_by_user_edition_only
        // user_in_group_a point
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(478-30, 498-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Green object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveCount(1);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveAttribute('value', /filter_layer_by_user_edition_only_[a-z0-9_]{36}.2/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-delete')).not.toHaveClass(/hide/);

        await project.closeLeftDock();

        // green_filter_layer_by_user_edition_only
        // no user point
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(431-30, 563-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Green object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveCount(1);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveAttribute('value', /filter_layer_by_user_edition_only_[a-z0-9_]{36}.3/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-delete')).not.toHaveClass(/hide/);

        await project.closeLeftDock();
    });
});

test.describe('Filter layer data by user - user in group a - @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('user_in_group_a') });

    test('Popup with map click', async ({ page }) => {
        const project = new ProjectPage(page, 'filter_layer_by_user');
        await project.open();
        await project.closeLeftDock();

        // blue_filter_layer_by_user
        // admin point
        let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(356-30, 346-75);
        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Blue object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(0);

        await project.closeLeftDock();

        // blue_filter_layer_by_user
        // user_in_group_a point
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(510-30, 341-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Blue object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('blue_filter_layer_by_user');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveCount(1);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveAttribute('value', /filter_layer_by_user_[a-z0-9_]{36}.2/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-delete')).not.toHaveClass(/hide/);

        await project.closeLeftDock();

        // red_layer_with_no_filter
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(438-30, 193-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Red object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('red_layer_with_no_filter');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveCount(1);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveAttribute('value', /layer_with_no_filter_[a-z0-9_]{36}.1/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-delete')).not.toHaveClass(/hide/);

        await project.closeLeftDock();

        // green_filter_layer_by_user_edition_only
        // admin point
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(383-30, 500-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Green object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveCount(1);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveAttribute('value', /filter_layer_by_user_edition_only_[a-z0-9_]{36}.1/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-delete')).toHaveClass(/hide/);

        await project.closeLeftDock();

        // green_filter_layer_by_user_edition_only
        // user_in_group_a point
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(478-30, 498-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Green object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveCount(1);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveAttribute('value', /filter_layer_by_user_edition_only_[a-z0-9_]{36}.2/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-delete')).not.toHaveClass(/hide/);

        await project.closeLeftDock();

        // green_filter_layer_by_user_edition_only
        // no user point
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(431-30, 563-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Green object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveCount(1);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveAttribute('value', /filter_layer_by_user_edition_only_[a-z0-9_]{36}.3/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-delete')).toHaveClass(/hide/);

        await project.closeLeftDock();
    });
});

test.describe('Filter layer data by user - not connected - @readonly', () => {

    test('Popup with map click', async ({ page }) => {
        const project = new ProjectPage(page, 'filter_layer_by_user');
        await project.open();
        await project.closeLeftDock();

        // blue_filter_layer_by_user
        // admin point
        let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(356-30, 346-75);
        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // No object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(0);
        await expect(project.dock.locator('.lizmapPopupContent h4')).toHaveText('No object has been found at this location.');

        await project.closeLeftDock();

        // blue_filter_layer_by_user
        // user_in_group_a point
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(510-30, 341-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // No object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(0);
        await expect(project.dock.locator('.lizmapPopupContent h4')).toHaveText('No object has been found at this location.');

        await project.closeLeftDock();

        // red_layer_with_no_filter
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(438-30, 193-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Red object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('red_layer_with_no_filter');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveCount(1);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveAttribute('value', /layer_with_no_filter_[a-z0-9_]{36}.1/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-delete')).not.toHaveClass(/hide/);

        await project.closeLeftDock();

        // green_filter_layer_by_user_edition_only
        // admin point
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(383-30, 500-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Green object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveCount(1);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveAttribute('value', /filter_layer_by_user_edition_only_[a-z0-9_]{36}.1/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-delete')).toHaveClass(/hide/);

        await project.closeLeftDock();

        // green_filter_layer_by_user_edition_only
        // user_in_group_a point
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(478-30, 498-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Green object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveCount(1);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveAttribute('value', /filter_layer_by_user_edition_only_[a-z0-9_]{36}.2/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-delete')).toHaveClass(/hide/);

        await project.closeLeftDock();

        // green_filter_layer_by_user_edition_only
        // no user point
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest()
        await project.clickOnMap(431-30, 563-75);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Green object found
        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveCount(1);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar')).toHaveAttribute('value', /filter_layer_by_user_edition_only_[a-z0-9_]{36}.3/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-delete')).toHaveClass(/hide/);

        await project.closeLeftDock();
    });
});
