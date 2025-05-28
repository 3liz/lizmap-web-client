// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap, getEchoRequestParams } from './globals';

test.describe('Time Manager', () => {

    test('Time Manager', async ({ page }) => {
        const url = '/index.php/view/map?repository=testsrepository&project=time_manager';
        await gotoMap(url, page)

        // When the Time manager is running, 2 requests are sent for each time range
        // - getFilterToken with method POST, returning a json with a token
        // - getMap that uses this token
        // There are 3 time ranges in the test data: we check each one
        const timeRequest = [
            { 'start': '2007-01-01', 'end': '2011-12-31' },
            { 'start': '2012-01-01', 'end': '2016-12-31' },
            { 'start': '2017-01-01', 'end': '2021-12-31' }
        ];

        const responseMatchGetFilterTokenFunc = function (response) {
            return (response.request().method() == 'POST' && response.request().postData().match(/GetFilterToken/i));
        };

        let firstRun = true;
        for (let timeObj of timeRequest) {
            // We will catch getFilterToken response
            let getFilterTokenPromise = page.waitForResponse(responseMatchGetFilterTokenFunc);

            // We will catch GetMapRequest
            let getMapRequestPromise = page.waitForRequest(/GetMap/);

            if (firstRun) {
                // promises are setup, launch the timemanager
                await page.locator('#button-timemanager').click();
                await page.locator('#tmTogglePlay').click();
                firstRun = false;
            }
            // Wait for the getFilterToken response
            let getFiltertokenResponse = await getFilterTokenPromise;

            // Check the json response contains token prop
            let jsonFiltertokenResponse = await getFiltertokenResponse.json();
            await expect(jsonFiltertokenResponse).toHaveProperty('token');
            let getMapRequest = await getMapRequestPromise;

            // Check request is build with token
            let urlMapRequest = await getMapRequest.url();
            await expect(urlMapRequest).toMatch(/FILTERTOKEN/);
            await expect(urlMapRequest).toContain('FILTERTOKEN='+jsonFiltertokenResponse.token);

            // Re-send the request with additional echo param to retrieve the WMS Request search params
            const urlObj = await getEchoRequestParams(page, urlMapRequest)

            // expected request params
            const expectedParamValue = [
                { 'param': 'version', 'expectedvalue': '1.3.0' },
                { 'param': 'service', 'expectedvalue': 'WMS' },
                { 'param': 'format', 'expectedvalue': 'image/png' },
                { 'param': 'request', 'expectedvalue': 'getmap' },
                { 'param': 'filter', 'expectedvalue': 'time_manager_layer: ( ( "test_date" >= \'' + timeObj.start + '\' ) AND ( "test_date" <= \'' + timeObj.end + '\' ) ) ' },
            ];
            // Check if WMS Request params are as expected
            for (let obj of expectedParamValue) {
                await expect(
                    urlObj.has(obj.param),
                    obj.param+' not in ['+Array.from(urlObj.keys()).join(', ')+']'
                ).toBeTruthy();
                await expect(
                    urlObj.get(obj.param),
                    obj.param+'='+obj.expectedvalue+' not in ['+urlObj.toString().split('&').join(', ')+']'
                ).toBe(obj.expectedvalue);
            }
        }

        // back to normal behaviour => no token in request
        // closing time manager
        await page.locator('.btn-timemanager-clear').click();

        // We will catch GetMapRequest
        let getMapNoFiltertPromise = page.waitForRequest(/GetMap/);

        // We move to force request
        await page.locator('button.zoom-in').click();
        let getMapNoFilter = await getMapNoFiltertPromise;

        // We assert no more filter token
        await expect(getMapNoFilter.url()).not.toMatch(/FILTERTOKEN/i);

    });


});
