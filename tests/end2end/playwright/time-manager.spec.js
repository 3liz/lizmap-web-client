// @ts-check
import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js';
import { expect as responseExpect } from './fixtures/expect-response.js';
import { ProjectPage } from "./pages/project";
import { getEchoRequestParams } from './globals';

test.describe('Time Manager @readonly', () => {

    // There are 3 time ranges in the test data: we check each one
    const timeRequest = [
        { 'start': '2007-01-01', 'end': '2011-12-31', 'currentText': '2007', 'nextText': '2011', 'sliderPosition': '0px' },
        { 'start': '2012-01-01', 'end': '2016-12-31', 'currentText': '2012', 'nextText': '2016', 'sliderPosition': /8\d.\d+px/  },
        { 'start': '2017-01-01', 'end': '2021-12-31', 'currentText': '2017', 'nextText': '2021', 'sliderPosition': /1\d\d.\d+px/ },
    ];

    test('Manual play', async ({ page }) => {
        const project = new ProjectPage(page, 'time_manager');

        // We will catch the first GetMapRequest
        let getMapRequestPromise = project.waitForGetMapRequest();

        // Open the map page
        await project.open();

        // Wait for GetMap request send
        let getMapRequest = await getMapRequestPromise;
        // Check GetMap request
        /** @type {{[key: string]: string|RegExp}} */
        let getMapParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'LAYERS': 'time_manager_layer',
        };
        requestExpect(getMapRequest).toContainParametersInUrl(getMapParameters);
        // Check that there is no FILTERTOKEN in the request
        requestExpect(getMapRequest).not.toContainParametersInUrl({
            'FILTERTOKEN': /^[a-zA-Z0-9]{32}$/,
        });

        // Get the getmap response
        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Open time manager will send a GeFilterToken request
        let getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
        // Open the time manager
        await page.locator('#button-timemanager').click();

        // Wait for the getFilterToken response
        let getFilterTokenRequest = await getFilterTokenRequestPromise;

        // We will catch GetMapRequest
        getMapRequestPromise = project.waitForGetMapRequest();
        // First time object
        let timeObj = timeRequest[0];

        // Check GetSelectionToken request
        let getFilterTokenParameters = {
            'service': 'WMS',
            'request': 'GETFILTERTOKEN',
            'typename': 'time_manager',
            'filter': 'time_manager_layer: ( ( "test_date" >= \'' + timeObj.start + '\' ) AND ( "test_date" <= \'' + timeObj.end + '\' ) ) ',
        }
        requestExpect(getFilterTokenRequest).toContainParametersInPostData(getFilterTokenParameters);

        // Get the getFilterToken response
        let getFilterTokenResponse = await getFilterTokenRequest.response();
        responseExpect(getFilterTokenResponse).toBeJson();

        // Check the json response contains token prop
        let jsonFilterTokenResponse = await getFilterTokenResponse?.json();
        expect(jsonFilterTokenResponse).toHaveProperty('token');

        // Check GetMap request
        getMapRequest = await getMapRequestPromise;
        // has a filter token in the url
        getMapParameters['FILTERTOKEN'] = /^[a-zA-Z0-9]{32}$/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapParameters);
        // has the filter token provided by the getFilterToken request
        getMapParameters['FILTERTOKEN'] = jsonFilterTokenResponse.token;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapParameters);

        // Get the getmap response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check the time manager user interface
        await expect(page.locator('#tmCurrentValue')).toHaveText(timeObj.currentText);
        await expect(page.locator('#tmNextValue')).toHaveText(timeObj.nextText);
        await expect(page.locator('#tmSlider > span:nth-child(1)')).toHaveCSS('left', timeObj.sliderPosition);

        // Click on previous does not change nothing
        await page.locator('#tmPrev').click();
        await expect(page.locator('#tmCurrentValue')).toHaveText(timeObj.currentText);
        await expect(page.locator('#tmNextValue')).toHaveText(timeObj.nextText);
        await expect(page.locator('#tmSlider > span:nth-child(1)')).toHaveCSS('left', timeObj.sliderPosition);

        // Click on next will change the time range
        getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
        await page.locator('#tmNext').click();

        // Catch the GetFilterToken request
        getFilterTokenRequest = await getFilterTokenRequestPromise;
        // We will catch GetMapRequest
        getMapRequestPromise = project.waitForGetMapRequest();
        // Second time object
        timeObj = timeRequest[1];

        // Check GetSelectionToken request
        getFilterTokenParameters['filter'] =
            'time_manager_layer: ( ( "test_date" >= \'' + timeObj.start + '\' ) AND ( "test_date" <= \'' + timeObj.end + '\' ) ) ';
        requestExpect(getFilterTokenRequest).toContainParametersInPostData(getFilterTokenParameters);

        // Get the getFilterToken response
        getFilterTokenResponse = await getFilterTokenRequest.response();
        responseExpect(getFilterTokenResponse).toBeJson();

        // Check the json response contains token prop
        jsonFilterTokenResponse = await getFilterTokenResponse?.json();
        expect(jsonFilterTokenResponse).toHaveProperty('token');

        // Check GetMap request
        getMapRequest = await getMapRequestPromise;
        // has a filter token in the url
        getMapParameters['FILTERTOKEN'] = /^[a-zA-Z0-9]{32}$/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapParameters);
        // has the filter token provided by the getFilterToken request
        getMapParameters['FILTERTOKEN'] = jsonFilterTokenResponse.token;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapParameters);

        // Get the getmap response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check the time manager user interface
        await expect(page.locator('#tmCurrentValue')).toHaveText(timeObj.currentText);
        await expect(page.locator('#tmNextValue')).toHaveText(timeObj.nextText);
        await expect(page.locator('#tmSlider > span:nth-child(1)')).toHaveCSS('left', timeObj.sliderPosition);

        // Click on next to go to last value
        getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
        await page.locator('#tmNext').click();

        // Catch the GetFilterToken request
        getFilterTokenRequest = await getFilterTokenRequestPromise;
        // We will catch GetMapRequest
        getMapRequestPromise = project.waitForGetMapRequest();
        // Third time object
        timeObj = timeRequest[2];

        // Check GetSelectionToken request
        getFilterTokenParameters['filter'] =
            'time_manager_layer: ( ( "test_date" >= \'' + timeObj.start + '\' ) AND ( "test_date" <= \'' + timeObj.end + '\' ) ) ';
        requestExpect(getFilterTokenRequest).toContainParametersInPostData(getFilterTokenParameters);

        // Get the getFilterToken response
        getFilterTokenResponse = await getFilterTokenRequest.response();
        responseExpect(getFilterTokenResponse).toBeJson();

        // Check the json response contains token prop
        jsonFilterTokenResponse = await getFilterTokenResponse?.json();
        expect(jsonFilterTokenResponse).toHaveProperty('token');

        // Check GetMap request
        getMapRequest = await getMapRequestPromise;
        // has a filter token in the url
        getMapParameters['FILTERTOKEN'] = /^[a-zA-Z0-9]{32}$/;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapParameters);
        // has the filter token provided by the getFilterToken request
        getMapParameters['FILTERTOKEN'] = jsonFilterTokenResponse.token;
        requestExpect(getMapRequest).toContainParametersInUrl(getMapParameters);

        // Get the getmap response
        getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();

        // Check the time manager user interface
        await expect(page.locator('#tmCurrentValue')).toHaveText(timeObj.currentText);
        await expect(page.locator('#tmNextValue')).toHaveText(timeObj.nextText);
        await expect(page.locator('#tmSlider > span:nth-child(1)')).toHaveCSS('left', timeObj.sliderPosition);

        // No more GetMap request send
        // Click to next will go back to start value
        getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
        await page.locator('#tmNext').click();
        // Catch the GetFilterToken request
        getFilterTokenRequest = await getFilterTokenRequestPromise;
        // First time object
        timeObj = timeRequest[0];
        // Check GetSelectionToken request
        getFilterTokenParameters['filter'] =
            'time_manager_layer: ( ( "test_date" >= \'' + timeObj.start + '\' ) AND ( "test_date" <= \'' + timeObj.end + '\' ) ) ';
        requestExpect(getFilterTokenRequest).toContainParametersInPostData(getFilterTokenParameters);
        // Check the time manager user interface
        await expect(page.locator('#tmCurrentValue')).toHaveText(timeObj.currentText);
        await expect(page.locator('#tmNextValue')).toHaveText(timeObj.nextText);
        await expect(page.locator('#tmSlider > span:nth-child(1)')).toHaveCSS('left', timeObj.sliderPosition);

        // Click to next
        getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
        await page.locator('#tmNext').click();
        // Catch the GetFilterToken request
        getFilterTokenRequest = await getFilterTokenRequestPromise;
        // First time object
        timeObj = timeRequest[1];
        // Check GetSelectionToken request
        getFilterTokenParameters['filter'] =
            'time_manager_layer: ( ( "test_date" >= \'' + timeObj.start + '\' ) AND ( "test_date" <= \'' + timeObj.end + '\' ) ) ';
        requestExpect(getFilterTokenRequest).toContainParametersInPostData(getFilterTokenParameters);
        // Check the time manager user interface
        await expect(page.locator('#tmCurrentValue')).toHaveText(timeObj.currentText);
        await expect(page.locator('#tmNextValue')).toHaveText(timeObj.nextText);
        await expect(page.locator('#tmSlider > span:nth-child(1)')).toHaveCSS('left', timeObj.sliderPosition);

        // Click to previous to go back to start value
        getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();
        await page.locator('#tmPrev').click();
        // Catch the GetFilterToken request
        getFilterTokenRequest = await getFilterTokenRequestPromise;
        // First time object
        timeObj = timeRequest[0];
        // Check GetSelectionToken request
        getFilterTokenParameters['filter'] =
            'time_manager_layer: ( ( "test_date" >= \'' + timeObj.start + '\' ) AND ( "test_date" <= \'' + timeObj.end + '\' ) ) ';
        requestExpect(getFilterTokenRequest).toContainParametersInPostData(getFilterTokenParameters);
        // Check the time manager user interface
        await expect(page.locator('#tmCurrentValue')).toHaveText(timeObj.currentText);
        await expect(page.locator('#tmNextValue')).toHaveText(timeObj.nextText);
        await expect(page.locator('#tmSlider > span:nth-child(1)')).toHaveCSS('left', timeObj.sliderPosition);

    }),

    test('Let\'s play', async ({ page }) => {
        const project = new ProjectPage(page, 'time_manager');

        // We will catch the first GetMapRequest
        let getMapNoFiltertPromise = project.waitForGetMapRequest();

        // Open the map page
        await project.open();

        // Wait for GetMap request send
        let getMapNoFilter = await getMapNoFiltertPromise;
        // Check GetMap request
        /** @type {{[key: string]: string|RegExp}} */
        let getMapNoFilterParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'LAYERS': 'time_manager_layer',
        };
        requestExpect(getMapNoFilter).toContainParametersInUrl(getMapNoFilterParameters);
        // Check that there is no FILTERTOKEN in the request
        requestExpect(getMapNoFilter).not.toContainParametersInUrl({
            'FILTERTOKEN': /^[a-zA-Z0-9]{32}$/,
        });

        // Get the getmap response
        let getMapNoFilterResponse = await getMapNoFilter.response();
        responseExpect(getMapNoFilterResponse).toBeImagePng();

        // When the Time manager is running, 2 requests are sent for each time range
        // - getFilterToken with method POST, returning a json with a token
        // - getMap that uses this token

        let firstRun = true;
        for (let timeObj of timeRequest) {
            // We will catch getFilterToken response
            let getFilterTokenRequestPromise = project.waitForGetFilterTokenRequest();

            // We will catch GetMapRequest
            let getMapRequestPromise = project.waitForGetMapRequest();

            if (firstRun) {
                // promises are setup, launch the timemanager
                await page.locator('#button-timemanager').click();
                await page.locator('#tmTogglePlay').click();
                firstRun = false;
            }

            // Wait for the getFilterToken response
            let getFilterTokenRequest = await getFilterTokenRequestPromise;

            // Check GetSelectionToken request
            const getFilterTokenParameters = {
                'service': 'WMS',
                'request': 'GETFILTERTOKEN',
                'typename': 'time_manager',
                'filter': 'time_manager_layer: ( ( "test_date" >= \'' + timeObj.start + '\' ) AND ( "test_date" <= \'' + timeObj.end + '\' ) ) ',
            }
            requestExpect(getFilterTokenRequest).toContainParametersInPostData(getFilterTokenParameters);

            // Get the getFilterToken response
            let getFilterTokenResponse = await getFilterTokenRequest.response();
            responseExpect(getFilterTokenResponse).toBeJson();

            // Check the json response contains token prop
            let jsonFilterTokenResponse = await getFilterTokenResponse?.json();
            expect(jsonFilterTokenResponse).toHaveProperty('token');

            // Wait for GetMap request send
            let getMapRequest = await getMapRequestPromise;

            // Check GetMap request
            const getMapParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'LAYERS': 'time_manager_layer',
                'FILTERTOKEN': jsonFilterTokenResponse.token,
            };
            requestExpect(getMapRequest).toContainParametersInUrl(getMapParameters);

            // Get the getFilterToken response
            let getMapResponse = await getMapRequest.response();
            responseExpect(getMapResponse).toBeImagePng();

            // Re-send the request with additional echo param to retrieve the WMS Request search params
            let urlMapRequest = getMapRequest.url();
            const urlObj = await getEchoRequestParams(page, urlMapRequest)

            // expected request params
            const expectedParamValue = [
                { 'param': 'version', 'expectedvalue': '1.3.0' },
                { 'param': 'service', 'expectedvalue': 'WMS' },
                { 'param': 'format', 'expectedvalue': 'image/png' },
                { 'param': 'request', 'expectedvalue': 'getmap' },
                {
                    'param': 'filter',
                    'expectedvalue': 'time_manager_layer: ( ( "test_date" >= \'' + timeObj.start + '\' ) AND ( "test_date" <= \'' + timeObj.end + '\' ) ) '
                },
            ];
            // Check if WMS Request params are as expected
            for (let obj of expectedParamValue) {
                expect(
                    urlObj.has(obj.param),
                    obj.param+' not in ['+Array.from(urlObj.keys()).join(', ')+']'
                ).toBeTruthy();
                expect(
                    urlObj.get(obj.param),
                    obj.param+'='+obj.expectedvalue+' not in ['+urlObj.toString().split('&').join(', ')+']'
                ).toBe(obj.expectedvalue);
            }

            // Check the time manager user interface
            await expect(page.locator('#tmCurrentValue')).toHaveText(timeObj.currentText);
            await expect(page.locator('#tmNextValue')).toHaveText(timeObj.nextText);
        }

        // back to normal behaviour => no token in request
        // closing time manager
        await page.locator('.btn-timemanager-clear').click();

        // We will catch GetMapRequest
        getMapNoFiltertPromise = project.waitForGetMapRequest();

        // We move to force request
        await page.locator('button.zoom-in').click();
        getMapNoFilter = await getMapNoFiltertPromise;
        // Check that the request is as expected
        requestExpect(getMapNoFilter).toContainParametersInUrl(getMapNoFilterParameters);
        // Check that there is no FILTERTOKEN in the request
        requestExpect(getMapNoFilter).not.toContainParametersInUrl({
            'FILTERTOKEN': /^[a-zA-Z0-9]{32}$/,
        });

        // Get the getmap response
        getMapNoFilterResponse = await getMapNoFilter.response();
        responseExpect(getMapNoFilterResponse).toBeImagePng();
    });


});
