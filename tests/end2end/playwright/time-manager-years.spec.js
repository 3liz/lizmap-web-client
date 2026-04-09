// @ts-check
import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js';
import { expect as responseExpect } from './fixtures/expect-response.js';
import { ProjectPage } from "./pages/project";
import { getEchoRequestParams } from './globals';

test.describe('Time Manager with years resolution @readonly', () => {

    // With attributeResolution='years', the filter must still use full ISO dates (YYYY-MM-DD)
    // not year-only strings ('2007') which QGIS Server cannot parse for DATE comparisons
    const timeRequest = [
        { 'start': '2007-01-01', 'end': '2011-12-31', 'currentText': '2007', 'nextText': '2011' },
        { 'start': '2012-01-01', 'end': '2016-12-31', 'currentText': '2012', 'nextText': '2016' },
        { 'start': '2017-01-01', 'end': '2021-12-31', 'currentText': '2017', 'nextText': '2021' },
    ];

    test('Filter uses full ISO dates despite years resolution', async ({ page }) => {
        const project = new ProjectPage(page, 'time_manager_years');

        // Catch initial GetMap (no filter)
        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();
        let getMapRequest = await getMapRequestPromise;

        // Verify initial request has no FILTERTOKEN
        requestExpect(getMapRequest).not.toContainParametersInUrl({
            'FILTERTOKEN': /^[a-zA-Z0-9]{32}$/,
        });

        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Open time manager - triggers GETFILTERTOKEN
        let getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
        await page.locator('#button-timemanager').click();

        let getFilterTokenRequest = await getFilterTokenRequestPromise;
        getMapRequestPromise = project.waitForGetMapRequest();

        let timeObj = timeRequest[0];

        // The critical assertion: filter must contain full YYYY-MM-DD dates,
        // NOT year-only strings like '2007' and '2011'
        let getFilterTokenParameters = {
            'service': 'WMS',
            'request': 'GETFILTERTOKEN',
            'typename': 'time_manager',
            'filter': 'time_manager_layer: ( ( "test_date" >= \'' + timeObj.start + '\' ) AND ( "test_date" <= \'' + timeObj.end + '\' ) ) ',
        }
        requestExpect(getFilterTokenRequest).toContainParametersInPostData(getFilterTokenParameters);

        // Verify the filter token response
        let getFilterTokenResponse = await getFilterTokenRequest.response();
        responseExpect(getFilterTokenResponse).toBeJson();
        let jsonFilterTokenResponse = await getFilterTokenResponse?.json();
        expect(jsonFilterTokenResponse).toHaveProperty('token');

        // Verify GetMap uses the filter token
        getMapRequest = await getMapRequestPromise;
        requestExpect(getMapRequest).toContainParametersInUrl({
            'SERVICE': 'WMS',
            'REQUEST': 'GetMap',
            'FILTERTOKEN': jsonFilterTokenResponse.token,
        });
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // UI should show year-only labels (display resolution is years)
        await expect(page.locator('#tmCurrentValue')).toHaveText(timeObj.currentText);
        await expect(page.locator('#tmNextValue')).toHaveText(timeObj.nextText);

        // Navigate to next step and verify filter still uses full ISO dates
        getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
        await page.locator('#tmNext').click();
        getFilterTokenRequest = await getFilterTokenRequestPromise;
        getMapRequestPromise = project.waitForGetMapRequest();
        timeObj = timeRequest[1];

        getFilterTokenParameters['filter'] =
            'time_manager_layer: ( ( "test_date" >= \'' + timeObj.start + '\' ) AND ( "test_date" <= \'' + timeObj.end + '\' ) ) ';
        requestExpect(getFilterTokenRequest).toContainParametersInPostData(getFilterTokenParameters);

        getFilterTokenResponse = await getFilterTokenRequest.response();
        responseExpect(getFilterTokenResponse).toBeJson();
        jsonFilterTokenResponse = await getFilterTokenResponse?.json();
        expect(jsonFilterTokenResponse).toHaveProperty('token');

        getMapRequest = await getMapRequestPromise;
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        await expect(page.locator('#tmCurrentValue')).toHaveText(timeObj.currentText);
        await expect(page.locator('#tmNextValue')).toHaveText(timeObj.nextText);
    }),

    test('Auto play uses full ISO dates in filter', async ({ page }) => {
        const project = new ProjectPage(page, 'time_manager_years');

        let getMapNoFilterPromise = project.waitForGetMapRequest();
        await project.open();
        let getMapNoFilter = await getMapNoFilterPromise;
        let getMapNoFilterResponse = await getMapNoFilter.response();
        responseExpect(getMapNoFilterResponse).toBeImagePng();

        let firstRun = true;
        for (let timeObj of timeRequest) {
            let getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
            let getMapRequestPromise = project.waitForGetMapRequest();

            if (firstRun) {
                await page.locator('#button-timemanager').click();
                await page.locator('#tmTogglePlay').click();
                firstRun = false;
            }

            let getFilterTokenRequest = await getFilterTokenRequestPromise;

            // Verify full ISO dates in filter expression
            const getFilterTokenParameters = {
                'service': 'WMS',
                'request': 'GETFILTERTOKEN',
                'typename': 'time_manager',
                'filter': 'time_manager_layer: ( ( "test_date" >= \'' + timeObj.start + '\' ) AND ( "test_date" <= \'' + timeObj.end + '\' ) ) ',
            }
            requestExpect(getFilterTokenRequest).toContainParametersInPostData(getFilterTokenParameters);

            let getFilterTokenResponse = await getFilterTokenRequest.response();
            responseExpect(getFilterTokenResponse).toBeJson();
            let jsonFilterTokenResponse = await getFilterTokenResponse?.json();
            expect(jsonFilterTokenResponse).toHaveProperty('token');

            let getMapRequest = await getMapRequestPromise;

            // Verify echo request shows full ISO dates forwarded to QGIS Server
            let urlMapRequest = getMapRequest.url();
            const urlObj = await getEchoRequestParams(page, urlMapRequest);

            // The filter parameter sent to QGIS Server must have YYYY-MM-DD dates
            const expectedFilter = 'time_manager_layer: ( ( "test_date" >= \'' + timeObj.start + '\' ) AND ( "test_date" <= \'' + timeObj.end + '\' ) ) ';
            expect(
                urlObj.has('filter'),
                'filter param missing from WMS request'
            ).toBeTruthy();
            expect(
                urlObj.get('filter'),
                'Filter should use full ISO dates (YYYY-MM-DD), not year-only strings'
            ).toBe(expectedFilter);

            let getMapResponse = await getMapRequest.response();
            responseExpect(getMapResponse).toBeImagePng();

            await expect(page.locator('#tmCurrentValue')).toHaveText(timeObj.currentText);
            await expect(page.locator('#tmNextValue')).toHaveText(timeObj.nextText);
        }

        // Close time manager and verify filter is removed
        await page.locator('.btn-timemanager-clear').click();
        let getMapCleanPromise = project.waitForGetMapRequest();
        await page.locator('button.zoom-in').click();
        let getMapClean = await getMapCleanPromise;
        requestExpect(getMapClean).not.toContainParametersInUrl({
            'FILTERTOKEN': /^[a-zA-Z0-9]{32}$/,
        });
        let getMapCleanResponse = await getMapClean.response();
        responseExpect(getMapCleanResponse).toBeImagePng();
    });
});
