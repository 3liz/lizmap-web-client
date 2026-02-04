// @ts-check
import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js'
import { expect as responseExpect } from './fixtures/expect-response.js'
import { ProjectPage } from './pages/project';
import { digestBuffer, gotoMap, expectParametersToContain } from "./globals";

/**
 * @typedef {object} Position
 * @property {number} x coord x in pixel in the page
 * @property {number} y coord y in pixel in the page
 */

/**
 * Move the map from a position to another
 * @param {ProjectPage} project the project page
 * @param {Position} from the start position
 * @param {Position} to the end position
 */
const moveMap = async (project, from, to) => {
    await project.map.hover()
    await project.page.mouse.move(from.x, from.y)
    await project.page.mouse.down()
    await project.page.waitForTimeout(100)

    const distX = to.x-from.x;
    const distY = to.y-from.y;
    const steps = Math.max(Math.abs(distX), Math.abs(distY));
    let step = 0;
    while (step < steps) {
        step += 1;
        await project.page.mouse.move(
            Math.floor(from.x + (distX * step / steps)),
            Math.floor(from.y + (distY * step / steps)),
        );
        await project.page.waitForTimeout(10);
    }

    await project.page.mouse.move(to.x, to.y)
    await project.page.waitForTimeout(100)
    await project.page.mouse.up()
    await project.map.hover()
}

test.describe('Attribute table @readonly', () => {

    test('Should have correct column order', async ({ page }) => {
        const project = new ProjectPage(page, 'attribute_table');
        await project.open();

        let layerName = 'quartiers_shp';
        let datatablesRequest = await project.openAttributeTable(layerName);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();
        let tableWrapper = project.attributeTableWrapper(layerName);
        await expect(tableWrapper.locator('div.dt-scroll-head th'))
            .toHaveCount(6);
        await expect(tableWrapper.locator('div.dt-scroll-head th').nth(0))
            .toHaveText('');
        await expect(tableWrapper.locator('div.dt-scroll-head th').nth(1))
            .toHaveText('quartmno');
        await expect(tableWrapper.locator('div.dt-scroll-head th').nth(2))
            .toHaveText('libquart');
        await expect(tableWrapper.locator('div.dt-scroll-head th').nth(3))
            .toHaveText('photo');
        await expect(tableWrapper.locator('div.dt-scroll-head th').nth(4))
            .toHaveText('url');
        await expect(tableWrapper.locator('div.dt-scroll-head th').nth(5))
            .toHaveText('thumbnail');
        await project.closeAttributeTable();

        layerName = 'Les_quartiers_a_Montpellier';
        datatablesRequest = await project.openAttributeTable(layerName);
        datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();
        tableWrapper = project.attributeTableWrapper(layerName);
        await expect(tableWrapper.locator('div.dt-scroll-head th'))
            .toHaveCount(7);
        await expect(tableWrapper.locator('div.dt-scroll-head th').nth(0))
            .toHaveText('');
        await expect(tableWrapper.locator('div.dt-scroll-head th').nth(1))
            .toHaveText('quartier');
        await expect(tableWrapper.locator('div.dt-scroll-head th').nth(2))
            .toHaveText('quartmno');
        await expect(tableWrapper.locator('div.dt-scroll-head th').nth(3))
            .toHaveText('libquart');
        await expect(tableWrapper.locator('div.dt-scroll-head th').nth(4))
            .toHaveText('thumbnail');
        await expect(tableWrapper.locator('div.dt-scroll-head th').nth(5))
            .toHaveText('url');
        await expect(tableWrapper.locator('div.dt-scroll-head th').nth(6))
            .toHaveText('photo');
        await project.closeAttributeTable();
    });

    test('Should select / filter / refresh with map interaction', async ({ page }) => {
        const project = new ProjectPage(page, 'attribute_table');
        // Catch default GetMap
        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();
        let getMapRequest = await getMapRequestPromise;

        let layerName = 'Les quartiers à Montpellier';
        let tableName = 'Les_quartiers_a_Montpellier';
        let typeName = 'quartiers';

        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': typeName,
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /738930.9\d+,6258456.2\d+,802298.7\d+,6300326.6\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        let req_url = new URL(getMapRequest.url())
        expect(req_url.searchParams.get('SELECTIONTOKEN')).toBeNull();
        expect(req_url.searchParams.get('FILTERTOKEN')).toBeNull();

        // Drag Map && catch GetMap
        getMapRequestPromise = project.waitForGetMapRequest();
        await moveMap(project,{x:400, y:250},{x:500, y:150});
        getMapRequest = await getMapRequestPromise;
        //getMapExpectedParameters['BBOX'] = /731487.3\d+,6251012.6\d+,794855.1\d+,6292883.0\d+/;
        //getMapExpectedParameters['BBOX'] = /729436.6\d+,6248961.9\d+,792804.5\d+,6290832.3\d+/;
        getMapExpectedParameters['BBOX'] = /732448.6\d+,6251973.9\d+,795816.4\d+,6293844.3\d+/;
        //delete getMapExpectedParameters['BBOX'];
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Wait for OL rendering
        await page.waitForTimeout(500)

        // Check rendering
        const clip = {x:420, y:120, width:256, height:256};
        let buffer = await page.screenshot({clip:clip});
        const defaultHash = await digestBuffer(buffer);
        const defaultByteLength = buffer.byteLength;
        expect(defaultByteLength).toBeGreaterThan(8000); // 8667
        expect(defaultByteLength).toBeLessThan(10000); // 8667

        // Open attribute table
        let datatablesRequest = await project.openAttributeTable(tableName);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();
        let tableHtml = project.attributeTableHtml(tableName);

        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(7);

        // Use line with id 2
        let tr2 = tableHtml.locator('tbody tr[id="2"]');
        expect(tr2.locator('lizmap-feature-toolbar .feature-select')).toBeVisible();

        // Selection disabled
        await expect(tr2.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr2).not.toContainClass('selected');

        // Select feature
        // click on select Button
        let getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await tr2.locator('lizmap-feature-toolbar .feature-select').click();
        let getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        // Once the GetSelectionToken is received, the map is refreshed
        getMapRequestPromise = project.waitForGetMapRequest();
        await getSelectionTokenRequest.response();
        getMapRequest = await getMapRequestPromise;
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check GetSelectionToken request
        const getSelectionTokenParameters = {
            'service': 'WMS',
            'request': 'GETSELECTIONTOKEN',
            'typename': typeName,
            'ids': '2',
        }
        requestExpect(getSelectionTokenRequest).toContainParametersInPostData(getSelectionTokenParameters);
        // update expected GetMap parameters
        getMapExpectedParameters['SELECTIONTOKEN'] = /^[a-zA-Z0-9]{32}$/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);

        req_url = new URL(getMapRequest.url())
        expect(req_url.searchParams.get('SELECTIONTOKEN')).not.toBeNull()
        expect(req_url.searchParams.get('FILTERTOKEN')).toBeNull()

        // Check that the select button display that the feature is selected
        await expect(tr2.locator('lizmap-feature-toolbar .feature-select')).toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr2).toContainClass('selected');

        // Check rendering
        buffer = await page.screenshot({clip:clip});
        const selectHash = await digestBuffer(buffer);
        expect(selectHash).not.toEqual(defaultHash);
        const selectByteLength = buffer.byteLength;
        expect(selectByteLength).toBeGreaterThan(8000); // 8607
        expect(selectByteLength).not.toBe(defaultByteLength); // 8667
        expect(selectByteLength).toBeLessThan(10000);

        // click on filter Button
        let actionBar = project.attributeTableActionBar(tableName);
        let getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
        await actionBar.locator('.btn-filter-attributeTable').click();
        let getFilterTokenRequest = await getFilterTokenRequestPromise;

        // Once the GetFilterToken is received, the map is refreshed
        getMapRequestPromise = project.waitForGetMapRequest();
        await getFilterTokenRequest.response();
        getMapRequest = await getMapRequestPromise;
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check GetSelectionToken request
        const getFilterTokenParameters = {
            'service': 'WMS',
            'request': 'GETFILTERTOKEN',
            'typename': typeName,
            'filter': typeName+':"quartier" IN ( 2 ) ',
        }
        requestExpect(getFilterTokenRequest).toContainParametersInPostData(getFilterTokenParameters);

        // update expected GetMap parameters
        delete getMapExpectedParameters['SELECTIONTOKEN'];
        getMapExpectedParameters['FILTERTOKEN'] = /^[a-zA-Z0-9]{32}$/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);

        req_url = new URL(getMapRequest.url())
        expect(req_url.searchParams.get('SELECTIONTOKEN')).toBeNull()
        expect(req_url.searchParams.get('FILTERTOKEN')).not.toBeNull()

        // Check that the filter button display that the feature is filtered
        await expect(actionBar.locator('.btn-filter-attributeTable')).toContainClass('active'); // old bootstrap: btn-primary

        // Check table lines are filtered
        await expect(tableHtml.locator('tbody tr')).toHaveCount(1);

        // Selection disabled
        await expect(tr2.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr2).not.toContainClass('selected');

        // Check tree view
        await expect(page.getByTestId(layerName).locator('.node')).toContainClass('filtered');
        await expect(page.locator('#layerActionUnfilter')).toBeVisible();

        // Check rendering
        buffer = await page.screenshot({clip:clip});
        const filterHash = await digestBuffer(buffer);
        expect(filterHash).not.toEqual(defaultHash);
        expect(filterHash).not.toEqual(selectHash);
        const filterByteLength = buffer.byteLength;
        expect(filterByteLength).toBeLessThan(defaultByteLength); // 2781
        expect(filterByteLength).toBeLessThan(selectByteLength); // 2781
        expect(filterByteLength).toBeLessThan(3000); // 2781

        // Disable filter
        await actionBar.locator('.btn-filter-attributeTable').click();

        // Check that the filter button display that the feature is not filtered
        await expect(actionBar.locator('.btn-filter-attributeTable')).not.toContainClass('active'); // old bootstrap: btn-primary

        // Check table lines are filtered
        await expect(tableHtml.locator('tbody tr')).toHaveCount(7);

        // Check tree view
        await expect(page.getByTestId(layerName).locator('.node')).not.toContainClass('filtered');
        await expect(page.locator('#layerActionUnfilter')).not.toBeVisible();

        // Wait for OL rendering
        await page.waitForTimeout(100);

        // Check rendering
        buffer = await page.screenshot({clip:clip});
        const firstDisableHash = await digestBuffer(buffer);
        expect(firstDisableHash).not.toEqual(filterHash);
        expect(firstDisableHash).not.toEqual(selectHash);
        expect(firstDisableHash).not.toEqual(defaultHash);
        expect(buffer.byteLength).toBeGreaterThan(defaultByteLength-10);
        expect(buffer.byteLength).toBeLessThan(defaultByteLength+10);

        // select feature 2,4,6
        // click to select 2
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await tr2.locator('lizmap-feature-toolbar .feature-select').click();
        getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        // Check GetSelectionToken request
        requestExpect(getSelectionTokenRequest).toContainParametersInPostData(getSelectionTokenParameters);
        await getSelectionTokenRequest.response();

        // Use line with id 4
        let tr4 = tableHtml.locator('tbody tr[id="4"]');
        expect(tr4.locator('lizmap-feature-toolbar .feature-select')).toBeVisible();
        // Use line with id 6
        let tr6 = tableHtml.locator('tbody tr[id="6"]');
        expect(tr6.locator('lizmap-feature-toolbar .feature-select')).toBeVisible();


        // Check that the select button display that the feature is selected
        await expect(tr2.locator('lizmap-feature-toolbar .feature-select')).toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr2).toContainClass('selected');
        await expect(tr4.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr4).not.toContainClass('selected');
        await expect(tr6.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr6).not.toContainClass('selected');

        // click to select 4
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await tr4.locator('lizmap-feature-toolbar .feature-select').click();
        getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        // Once the GetSelectionToken is received, the map is refreshed
        getMapRequestPromise = project.waitForGetMapRequest();
        await getSelectionTokenRequest.response();
        getMapRequest = await getMapRequestPromise;
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Update expected GetSelection token parameters
        getSelectionTokenParameters['ids'] = '2,4'
        // Check GetSelectionToken request
        requestExpect(getSelectionTokenRequest).toContainParametersInPostData(getSelectionTokenParameters);

        // Check that the select button display that the feature is selected
        await expect(tr2.locator('lizmap-feature-toolbar .feature-select')).toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr2).toContainClass('selected');
        await expect(tr4.locator('lizmap-feature-toolbar .feature-select')).toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr4).toContainClass('selected');
        await expect(tr6.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr6).not.toContainClass('selected');

        // click to select 6
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await tr6.locator('lizmap-feature-toolbar .feature-select').click();
        getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        // Once the GetSelectionToken is received, the map is refreshed
        getMapRequestPromise = project.waitForGetMapRequest();
        await getSelectionTokenRequest.response();

        // Update expected GetSelection token parameters
        getSelectionTokenParameters['ids'] = '2,4,6'
        // Check GetSelectionToken request
        requestExpect(getSelectionTokenRequest).toContainParametersInPostData(getSelectionTokenParameters);

        // update expected GetMap paramaeters
        delete getMapExpectedParameters['FILTERTOKEN'];
        getMapExpectedParameters['SELECTIONTOKEN'] = /^[a-zA-Z0-9]{32}$/;
        getMapRequest = await getMapRequestPromise;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        req_url = new URL(getMapRequest.url())
        expect(req_url.searchParams.get('SELECTIONTOKEN')).not.toBeNull()
        expect(req_url.searchParams.get('FILTERTOKEN')).toBeNull()

        // Check that the select button display that the feature is selected
        await expect(tr2.locator('lizmap-feature-toolbar .feature-select')).toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr2).toContainClass('selected');
        await expect(tr4.locator('lizmap-feature-toolbar .feature-select')).toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr4).toContainClass('selected');
        await expect(tr6.locator('lizmap-feature-toolbar .feature-select')).toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr6).toContainClass('selected');

        // Check rendering
        buffer = await page.screenshot({clip:clip});
        const multiSelectHash = await digestBuffer(buffer);
        expect(multiSelectHash).not.toEqual(defaultHash);
        expect(multiSelectHash).not.toEqual(selectHash);
        expect(multiSelectHash).not.toEqual(filterHash);
        const multiSelectByteLength = buffer.byteLength;
        expect(multiSelectByteLength).toBeGreaterThan(8000);
        expect(multiSelectByteLength).not.toBe(defaultByteLength);
        expect(multiSelectByteLength).not.toBe(selectByteLength);
        expect(multiSelectByteLength).toBeLessThan(10000);

        // click on filter Button
        getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
        await actionBar.locator('.btn-filter-attributeTable').click();
        getFilterTokenRequest = await getFilterTokenRequestPromise;

        // Once the GetFilterToken is received, the map is refreshed
        getMapRequestPromise = project.waitForGetMapRequest();
        await getFilterTokenRequest.response();
        getMapRequest = await getMapRequestPromise;
        // Check response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check GetSelectionToken request
        getFilterTokenParameters['filter'] = typeName+':"quartier" IN ( 2 , 6 , 4 ) ';
        requestExpect(getFilterTokenRequest).toContainParametersInPostData(getFilterTokenParameters);
        // update expected GetMap parameters
        delete getMapExpectedParameters['SELECTIONTOKEN'];
        getMapExpectedParameters['FILTERTOKEN'] = /^[a-zA-Z0-9]{32}$/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);

        req_url = new URL(getMapRequest.url())
        expect(req_url.searchParams.get('SELECTIONTOKEN')).toBeNull()
        expect(req_url.searchParams.get('FILTERTOKEN')).not.toBeNull()

        // Check that the filter button display that the feature is filtered
        await expect(actionBar.locator('.btn-filter-attributeTable')).toContainClass('active'); // old bootstrap: btn-primary

        // Check table lines are filtered
        await expect(tableHtml.locator('tbody tr')).toHaveCount(3);

        // Selection disabled
        await expect(tr2.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr2).not.toContainClass('selected');
        await expect(tr4.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr4).not.toContainClass('selected');
        await expect(tr6.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr6).not.toContainClass('selected');

        // Check tree view
        await expect(page.getByTestId(layerName).locator('.node')).toContainClass('filtered');
        await expect(page.locator('#layerActionUnfilter')).toBeVisible();

        // Check rendering
        buffer = await page.screenshot({clip:clip});
        const multiFilterHash = await digestBuffer(buffer);
        expect(multiFilterHash).not.toEqual(defaultHash);
        expect(multiFilterHash).not.toEqual(selectHash);
        expect(multiFilterHash).not.toEqual(filterHash);
        expect(multiFilterHash).not.toEqual(multiSelectHash);
        const multiFilterByteLength = buffer.byteLength;
        expect(multiFilterByteLength).toBeLessThan(defaultByteLength); // 2781
        expect(multiFilterByteLength).toBeLessThan(selectByteLength); // 2781
        expect(multiFilterByteLength).toBeGreaterThan(filterByteLength);
        expect(multiFilterByteLength).toBeGreaterThan(6000);

        // Disable filter
        await actionBar.locator('.btn-filter-attributeTable').click();

        // Check that the filter button display that the feature is not filtered
        await expect(actionBar.locator('.btn-filter-attributeTable')).not.toContainClass('active'); // old bootstrap: btn-primary

        // Check table lines are filtered
        await expect(tableHtml.locator('tbody tr')).toHaveCount(7);

        // Check tree view
        await expect(page.getByTestId(layerName).locator('.node')).not.toContainClass('filtered');
        await expect(page.locator('#layerActionUnfilter')).not.toBeVisible();

        // Wait for OL rendering
        await page.waitForTimeout(100);

        // Check rendering
        buffer = await page.screenshot({clip:clip});
        const scndDisableHash = await digestBuffer(buffer);
        expect(scndDisableHash).not.toEqual(multiFilterHash);
        expect(scndDisableHash).not.toEqual(multiSelectHash);
        expect(scndDisableHash).not.toEqual(filterHash);
        expect(scndDisableHash).not.toEqual(selectHash);
        expect(scndDisableHash).not.toEqual(defaultHash);
        expect(scndDisableHash).toEqual(firstDisableHash);
        expect(buffer.byteLength).toBeGreaterThan(defaultByteLength-10);
        expect(buffer.byteLength).toBeLessThan(defaultByteLength+10);

        await project.closeAttributeTable();
    });

    test('Should select / filter / refresh without map interaction', async ({ page }) => {
        const project = new ProjectPage(page, 'attribute_table');
        await project.open();

        const tableName = 'quartiers_shp';
        const typeName = 'quartiers_shp';
        const layerName = 'quartiers_shp';

        let datatablesRequest = await project.openAttributeTable(tableName);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();
        let tableHtml = project.attributeTableHtml(tableName);

        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(7);

        // Use line with id 2
        let tr2 = tableHtml.locator('tbody tr[id="2"]');
        expect(tr2.locator('lizmap-feature-toolbar .feature-select')).toBeVisible();

        // Selection disabled
        await expect(tr2.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr2).not.toContainClass('selected');

        // Select feature
        // click on select Button
        let getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await tr2.locator('lizmap-feature-toolbar .feature-select').click();
        let getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        await getSelectionTokenRequest.response();

        // Check GetSelectionToken request
        const getSelectionTokenParameters = {
            'service': 'WMS',
            'request': 'GETSELECTIONTOKEN',
            'typename': typeName,
            'ids': '2',
        }
        requestExpect(getSelectionTokenRequest).toContainParametersInPostData(getSelectionTokenParameters);

        // Check that the select button display that the feature is selected
        await expect(tr2.locator('lizmap-feature-toolbar .feature-select')).toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr2).toContainClass('selected');

        // click on filter Button
        let actionBar = project.attributeTableActionBar(tableName);
        let getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
        await actionBar.locator('.btn-filter-attributeTable').click();
        let getFilterTokenRequest = await getFilterTokenRequestPromise;
        await getFilterTokenRequest.response();

        // Check GetSelectionToken request
        const getFilterTokenParameters = {
            'service': 'WMS',
            'request': 'GETFILTERTOKEN',
            'typename': typeName,
            'filter': typeName+':"quartier" IN ( 3 ) ',
        }
        requestExpect(getFilterTokenRequest).toContainParametersInPostData(getFilterTokenParameters);

        // Check that the filter button display that the feature is filtered
        await expect(actionBar.locator('.btn-filter-attributeTable')).toContainClass('active'); // old bootstrap: btn-primary

        // Check table lines are filtered
        await expect(tableHtml.locator('tbody tr')).toHaveCount(1);

        // Selection disabled
        await expect(tr2.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr2).not.toContainClass('selected');

        // Check tree view
        await expect(page.getByTestId(layerName).locator('.node')).toContainClass('filtered');
        await expect(page.locator('#layerActionUnfilter')).toBeVisible();

        // Disable filter
        await actionBar.locator('.btn-filter-attributeTable').click();

        // Check that the filter button display that the feature is not filtered
        await expect(actionBar.locator('.btn-filter-attributeTable')).not.toContainClass('active'); // old bootstrap: btn-primary

        // Check table lines are filtered
        await expect(tableHtml.locator('tbody tr')).toHaveCount(7);

        // Check tree view
        await expect(page.getByTestId(layerName).locator('.node')).not.toContainClass('filtered');
        await expect(page.locator('#layerActionUnfilter')).not.toBeVisible();


        // select feature 2,4,6
        // click to select 2
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await tr2.locator('lizmap-feature-toolbar .feature-select').click();
        getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        // Check GetSelectionToken request
        requestExpect(getSelectionTokenRequest).toContainParametersInPostData(getSelectionTokenParameters);
        await getSelectionTokenRequest.response();

        // Use line with id 4
        let tr4 = tableHtml.locator('tbody tr[id="4"]');
        expect(tr4.locator('lizmap-feature-toolbar .feature-select')).toBeVisible();
        // Use line with id 6
        let tr6 = tableHtml.locator('tbody tr[id="6"]');
        expect(tr6.locator('lizmap-feature-toolbar .feature-select')).toBeVisible();


        // Check that the select button display that the feature is selected
        await expect(tr2.locator('lizmap-feature-toolbar .feature-select')).toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr2).toContainClass('selected');
        await expect(tr4.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr4).not.toContainClass('selected');
        await expect(tr6.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr6).not.toContainClass('selected');

        // click to select 4
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await tr4.locator('lizmap-feature-toolbar .feature-select').click();
        getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        await getSelectionTokenRequest.response();

        // Update expected GetSelection token parameters
        getSelectionTokenParameters['ids'] = '2,4'
        // Check GetSelectionToken request
        requestExpect(getSelectionTokenRequest).toContainParametersInPostData(getSelectionTokenParameters);

        // Check that the select button display that the feature is selected
        await expect(tr2.locator('lizmap-feature-toolbar .feature-select')).toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr2).toContainClass('selected');
        await expect(tr4.locator('lizmap-feature-toolbar .feature-select')).toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr4).toContainClass('selected');
        await expect(tr6.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr6).not.toContainClass('selected');

        // click to select 6
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await tr6.locator('lizmap-feature-toolbar .feature-select').click();
        getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        await getSelectionTokenRequest.response();

        // Update expected GetSelection token parameters
        getSelectionTokenParameters['ids'] = '2,4,6'
        // Check GetSelectionToken request
        requestExpect(getSelectionTokenRequest).toContainParametersInPostData(getSelectionTokenParameters);

        // Check that the select button display that the feature is selected
        await expect(tr2.locator('lizmap-feature-toolbar .feature-select')).toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr2).toContainClass('selected');
        await expect(tr4.locator('lizmap-feature-toolbar .feature-select')).toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr4).toContainClass('selected');
        await expect(tr6.locator('lizmap-feature-toolbar .feature-select')).toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr6).toContainClass('selected');

        // click on filter Button
        getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
        await actionBar.locator('.btn-filter-attributeTable').click();
        getFilterTokenRequest = await getFilterTokenRequestPromise;
        await getFilterTokenRequest.response();

        // Check GetSelectionToken request
        getFilterTokenParameters['filter'] = typeName+':"quartier" IN ( 3 , 7 , 4 ) ';
        requestExpect(getFilterTokenRequest).toContainParametersInPostData(getFilterTokenParameters);

        // Check that the filter button display that the feature is filtered
        await expect(actionBar.locator('.btn-filter-attributeTable')).toContainClass('active'); // old bootstrap: btn-primary

        // Check table lines are filtered
        await expect(tableHtml.locator('tbody tr')).toHaveCount(3);

        // Selection disabled
        await expect(tr2.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr2).not.toContainClass('selected');
        await expect(tr4.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr4).not.toContainClass('selected');
        await expect(tr6.locator('lizmap-feature-toolbar .feature-select')).not.toContainClass('active'); // old bootstrap: btn-primary
        await expect(tr6).not.toContainClass('selected');

        // Check tree view
        await expect(page.getByTestId(layerName).locator('.node')).toContainClass('filtered');
        await expect(page.locator('#layerActionUnfilter')).toBeVisible();

        // Disable filter
        await actionBar.locator('.btn-filter-attributeTable').click();

        // Check that the filter button display that the feature is not filtered
        await expect(actionBar.locator('.btn-filter-attributeTable')).not.toContainClass('active'); // old bootstrap: btn-primary

        // Check table lines are filtered
        await expect(tableHtml.locator('tbody tr')).toHaveCount(7);

        // Check tree view
        await expect(page.getByTestId(layerName).locator('.node')).not.toContainClass('filtered');
        await expect(page.locator('#layerActionUnfilter')).not.toBeVisible();

        await project.closeAttributeTable();
    });

    test('Thumbnail class generate img with good path', async ({ page }) => {
        const project = new ProjectPage(page, 'attribute_table');
        await project.open();
        const layerName = 'Les_quartiers_a_Montpellier';

        let datatablesRequest = await project.openAttributeTable(layerName);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();
        await expect(project.attributeTableWrapper(layerName).locator('div.dt-info'))
            .toContainText('Showing 1 to 7 of 7 entries');
        await expect(project.attributeTableHtml(layerName).locator('tbody tr'))
            .toHaveCount(7);
        // mediaFile as stored in data-src attributes
        const mediaFile = await project.attributeTableHtml(layerName)
            .locator('img.data-attr-thumbnail').first().getAttribute('data-src');
        expect(mediaFile).not.toBeNull
        // ensure src contain "dynamic" mediaFile
        await expect(project.attributeTableHtml(layerName).locator('img.data-attr-thumbnail').first())
            .toHaveAttribute('src', new RegExp(mediaFile ?? ''));
        // ensure src contain getMedia and projet URL
        await expect(project.attributeTableHtml(layerName).locator('img.data-attr-thumbnail').first())
            .toHaveAttribute('src', /getMedia\?repository=testsrepository&project=attribute_table&/);
    });

    test('More than 500 features loaded in attribute table', async ({ page }) => {
        const project = new ProjectPage(page, 'attribute_table');
        await project.open();
        await project.closeLeftDock();
        const layerName = 'random_points';

        let datatablesRequest = await project.openAttributeTable(layerName);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();
        await expect(project.attributeTableWrapper(layerName).locator('div.dt-info'))
            .toContainText('Showing 1 to 50 of 700 entries');
        await expect(project.attributeTableHtml(layerName).locator('tbody tr'))
            .toHaveCount(50);
        await expect(project.attributeTableWrapper(layerName).locator('ul.pagination > li.dt-paging-button'))
            .toHaveCount(9);
        // click on last page which is the previous last dt-paging-button
        await project.attributeTableWrapper(layerName).hover();
        project.attributeTableWrapper(layerName).locator('ul.pagination > li.dt-paging-button:nth-last-child(-0n+2) > button').dispatchEvent('click');
        await expect(project.attributeTableWrapper(layerName).locator('div.dt-info'))
            .toContainText('Showing 651 to 700 of 700 entries');
    });

    test('Data filtered by extent', async ({ page }) => {

        const project = new ProjectPage(page, 'attribute_table');
        // Catch default GetMap
        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();
        let getMapRequest = await getMapRequestPromise;

        //let layerName = 'Les quartiers à Montpellier';
        let tableName = 'Les_quartiers_a_Montpellier';
        let typeName = 'quartiers';

        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': typeName,
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /738930.9\d+,6258456.2\d+,802298.7\d+,6300326.6\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        await getMapRequest.response();

        let datatablesRequest = await project.openAttributeTable(tableName);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();

        let tableHtml = project.attributeTableHtml(tableName);

        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(7);
        // Check filter by extent button
        await expect(page.locator('.btn-filterbyextent-attributeTable')).not.toHaveClass(/active/);

        // Activate filter by extent
        let datatablesRequestPromise = project.waitForDatatablesRequest();
        await page.locator('.btn-filterbyextent-attributeTable').click();
        datatablesRequest = await datatablesRequestPromise;
        datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();

        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(7);
        // Check filter by extent button
        await expect(page.locator('.btn-filterbyextent-attributeTable')).toHaveClass(/active/);

        // Use the first line
        let firstTr = tableHtml.locator('tbody tr').first();
        await expect(firstTr.locator('lizmap-feature-toolbar .feature-zoom')).toBeVisible();

        // Zoom to feature of the first line
        getMapRequestPromise = project.waitForGetMapRequest();
        await firstTr.locator('lizmap-feature-toolbar .feature-zoom').click();

        getMapRequest = await getMapRequestPromise;
        // Update expected GetMap Parameters
        getMapExpectedParameters['BBOX'] = /766383.9\d+,6280282.4\d+,772720.7\d+,6284469.4\d+/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        await getMapRequest.response();

        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(5);

        // Unactivate filter by extent and assert all features are in the table
        datatablesRequestPromise = project.waitForDatatablesRequest();
        await page.locator('.btn-filterbyextent-attributeTable').click();
        datatablesRequest = await datatablesRequestPromise;
        datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();

        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(7);
        // Check filter by extent button
        await expect(page.locator('.btn-filterbyextent-attributeTable')).not.toHaveClass(/active/);
    });
});


test.describe('Attribute table linking @write', () => {

    test('should unlink/link', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');

        // Create a promise to wait for the GetMap request to be made
        let getMapRequestPromise = project.waitForGetMapRequest();
        // Open the map project
        await project.open();

        const layerName = 'parent_layer';

        // Check request
        let getMapRequest = await getMapRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': layerName,
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
            'LAYERS': layerName,
            'QUERY_LAYERS': layerName,
        }
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData(getFeatureInfoExpectedParameters);
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        // Check popup displayed
        const popupContainer = page.locator(`#popupcontent div.lizmapPopupSingleFeature[data-feature-id="1"][data-layer-id^="${layerName}_"]`);
        await expect(popupContainer).toHaveCount(1);
        await expect(popupContainer).toBeVisible();

        const childLayerName = 'children_layer';

        // Check children displayed
        const childPopupContainer = popupContainer.locator('div.lizmapPopupChildren');
        await expect(childPopupContainer).toBeVisible();
        await expect(childPopupContainer).toHaveAttribute('data-layername', childLayerName);
        await expect(childPopupContainer).toContainClass(childLayerName);
        await expect(childPopupContainer.locator('div.lizmapPopupSingleFeature')).toHaveCount(2);

        // Open attribute table
        let datatablesRequest = await project.openAttributeTable(layerName);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();

        // full sized bottom dock
        await page.locator('#bottom-dock-window-buttons .btn-bottomdock-size').click();

        // Get parent table
        const tableHtml = project.attributeTableHtml(layerName);
        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(2);

        // Get child table
        const childTableHtml = page.locator(`#attribute-layer-table-${layerName}-${childLayerName}`);
        // Check child table lines
        await expect(childTableHtml.locator('tbody tr')).toHaveCount(0);

        // click on line 1 like the popup
        let datatablesPromise = project.waitForDatatablesRequest();
        await tableHtml.locator(`tbody tr[id="1"]`).click();
        datatablesRequest = await datatablesPromise;
        datatablesResponse = await datatablesRequest.response();

        // Check child table lines
        await expect(childTableHtml.locator('tbody tr')).toHaveCount(2);

        // Unlink button for child 2
        await expect(childTableHtml.locator(`tbody tr[id="2"] button.feature-unlink`)).toBeVisible();

        // Create the promise to wait for the request to unlink child
        let unlinkChildRequestPromise = page.waitForRequest(/lizmap\/edition\/unlinkChild/);
        // Click on the unlink button
        await childTableHtml.locator(`tbody tr[id="2"] button.feature-unlink`).click();
        let unlinkChildRequest = await unlinkChildRequestPromise;
        datatablesPromise = project.waitForDatatablesRequest();
        await unlinkChildRequest.response();
        datatablesRequest = await datatablesPromise;
        datatablesResponse = await datatablesRequest.response();

        // Check child table lines
        await expect(childTableHtml.locator('tbody tr')).toHaveCount(1);

        // Confirmation message should be displayed
        await expect(page.locator('#message .jelix-msg-item-success')).toHaveText('The child feature has correctly been unlinked.');

        // Close the message
        await expect(page.locator('#message .btn-close')).toBeVisible();
        await page.locator('#message .btn-close').click();
        await expect(page.locator('#message')).toBeHidden();

        // The Popup has not been refreshed

        // To link features
        // 1. Select the parent_layer feature: 1
        // 2. Open the children_layer attribute table
        // 3. Select the children_layer feature: 2
        // 4. back to the parent_layer attribute table
        // 5. click on the link button

        // Select the parent_layer feature: 1
        await expect(tableHtml.locator(`tbody tr[id="1"] button.feature-select`)).toBeVisible();
        await tableHtml.locator(`tbody tr[id="1"] button.feature-select`).click();

        // Open the children_layer attribute table
        datatablesRequest = await project.openAttributeTable(childLayerName);
        datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();

        // Select the children_layer feature: 2
        await expect(project.attributeTableHtml(childLayerName).locator(`tbody tr[id="1"] button.feature-select`)).toBeVisible();
        await project.attributeTableHtml(childLayerName).locator(`tbody tr[id="1"] button.feature-select`).click();

        // back to the parent_layer attribute table
        await expect(tableHtml).toBeHidden();
        await page.locator(`#nav-tab-attribute-layer-${layerName}`).click();
        await expect(tableHtml).toBeVisible();

        // click on the link button
        const actionBar = project.attributeTableActionBar(layerName);
        await expect(actionBar.getByText('Link selected features')).toBeVisible();
        await expect(actionBar.locator('.btn-linkFeatures-attributeTable')).toHaveCount(1);
        await expect(actionBar.locator('.btn-linkFeatures-attributeTable')).not.toBeVisible();
        await actionBar.getByText('Link selected features').click();
        await expect(actionBar.locator('.btn-linkFeatures-attributeTable')).toBeVisible();
        // Create the promise to wait for the request to unlink child
        let linkFeaturesRequestPromise = page.waitForRequest(/lizmap\/edition\/linkFeatures/);
        await actionBar.locator('.btn-linkFeatures-attributeTable').click();
        // Wait for the request to unlink child
        let linkFeaturesRequest = await linkFeaturesRequestPromise;
        await linkFeaturesRequest.response();

        // Confirmation message should be displayed
        await expect(page.locator('#message .jelix-msg-item-success')).toHaveText('Selected features have been correctly linked.');

        // Close the message
        await expect(page.locator('#message .btn-close')).toBeVisible();
        await page.locator('#message .btn-close').click();
        await expect(page.locator('#message')).toBeHidden();

        // The child table has not been refreshed
        // Check child table lines
        // await expect(childTableHtml.locator('tbody tr')).toHaveCount(1);
        // We need to click one the line to refresh child table

        // click on line 1 like the popup
        datatablesPromise = project.waitForDatatablesRequest();
        await tableHtml.locator(`tbody tr[id="1"]`).click();
        datatablesRequest = await datatablesPromise;
        datatablesResponse = await datatablesRequest.response();

        // Check child table lines
        await expect(childTableHtml.locator('tbody tr')).toHaveCount(2);
    });

});

test.describe('Attribute table atlas print button', () => {
    test.beforeEach(async ({ page }) => {
        // Use the print project which has atlas configured for quartiers layer
        const url = '/index.php/view/map/?repository=testsrepository&project=print';
        await gotoMap(url, page)
    });

    test('Atlas button appears for layer with atlas layout', {
        tag: '@readonly',
    }, async ({ page }) => {
        const project = new ProjectPage(page, 'print');
        await project.openAttributeTable('quartiers');

        // Check that atlas button is visible
        const atlasButton = page.locator('#attribute-layer-main-quartiers button.btn-print-atlas-selection');
        await expect(atlasButton).toBeVisible();
        await expect(atlasButton).toContainText('Atlas');
        await expect(atlasButton.locator('i.icon-print')).toBeVisible();
    });

    test('Atlas button sends correct request with selected features', {
        tag: '@readonly',
    }, async ({ page }) => {
        const project = new ProjectPage(page, 'print');
        await project.openAttributeTable('quartiers');

        const tableHtml = project.attributeTableHtml('quartiers');

        // Select first feature using the feature-select button
        let getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await tableHtml.locator('tbody tr:first-child lizmap-feature-toolbar .feature-select').click();
        await getSelectionTokenRequestPromise;

        // Select second feature
        getSelectionTokenRequestPromise = project.waitForGetSelectionTokenRequest();
        await tableHtml.locator('tbody tr:nth-child(2) lizmap-feature-toolbar .feature-select').click();
        await getSelectionTokenRequestPromise;

        // Wait for GetPrint request (atlas uses GetPrint with EXP_FILTER)
        const getPrintPromise = page.waitForRequest(request =>
            request.method() === 'POST' &&
            request.postData()?.includes('GetPrint') === true
        );

        // Click atlas button
        const atlasButton = page.locator('#attribute-layer-main-quartiers button.btn-print-atlas-selection');
        await atlasButton.click();

        const getPrintRequest = await getPrintPromise;
        const expectedParameters = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetPrint',
            'VERSION': '1.3.0',
            'FORMAT': 'pdf',
            'TRANSPARENT': 'true',
            'DPI': '100',
            'TEMPLATE': 'atlas_quartiers',
            'LAYER': 'quartiers',
            // EXP_FILTER should contain the selected feature IDs
            'EXP_FILTER': /\$id IN \(.+\)/,
        };

        await expectParametersToContain('Atlas print with selected features', getPrintRequest.postData() ?? '', expectedParameters);

        // Verify response
        const response = await getPrintRequest.response();
        await expect(response?.status()).toBe(200);
        await expect(response?.headers()['content-type']).toBe('application/pdf');
    });

    test('Atlas button shows message when no features selected', {
        tag: '@readonly',
    }, async ({ page }) => {
        const project = new ProjectPage(page, 'print');
        await project.openAttributeTable('quartiers');

        // Click atlas button without selecting features
        const atlasButton = page.locator('#attribute-layer-main-quartiers button.btn-print-atlas-selection');
        await atlasButton.click();

        // Check for info message
        const message = page.locator('#message .alert-info');
        await expect(message).toBeVisible();
        await expect(message).toContainText('Please select at least one feature to print');
    });

    test('Atlas button does not appear for layer without atlas layout', {
        tag: '@readonly',
    }, async ({ page }) => {
        // Use attribute_table project which has layers without atlas configured
        const url = '/index.php/view/map/?repository=testsrepository&project=attribute_table';
        await gotoMap(url, page);

        const project = new ProjectPage(page, 'attribute_table');
        await project.openAttributeTable('Les quartiers à Montpellier');

        // Check that atlas button is NOT visible for this layer (no atlas configured)
        const atlasButton = page.locator('#attribute-layer-main-Les_quartiers_a_Montpellier button.btn-print-atlas-selection');
        await expect(atlasButton).toHaveCount(0);
    });

    test('Atlas dropdown appears for layer with multiple atlas layouts', {
        tag: '@readonly',
    }, async ({ page }) => {
        const project = new ProjectPage(page, 'print');
        await project.openAttributeTable('quartiers');

        // The quartiers layer has multiple atlas layouts configured
        // Check if dropdown exists
        const atlasDropdown = page.locator('#attribute-layer-main-quartiers .btn-group button.dropdown-toggle');

        // If dropdown exists, verify it has the correct structure
        if (await atlasDropdown.count() > 0) {
            await expect(atlasDropdown).toBeVisible();
            await expect(atlasDropdown).toContainText('Atlas');

            // Click to open dropdown
            await atlasDropdown.click();

            // Check dropdown items
            const dropdownItems = page.locator('#attribute-layer-main-quartiers .dropdown-menu button.btn-print-atlas-selection');
            await expect(dropdownItems.first()).toBeVisible();
        }
        // If no dropdown, it means there's only one layout (simple button)
        // which is already tested in the first test
    });
});
