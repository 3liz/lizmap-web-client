// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Bing Maps baselayers', () => {
    test('Check Bing external services initialization', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=bing_basemap';
        let bingRoadsInitRequestPromise = page.waitForRequest(/RoadOnDemand/);
        let bingSatelliteInitRequestPromise = page.waitForRequest(/Aerial/);
        await page.goto(url);

        const allResponses = await Promise.all([bingRoadsInitRequestPromise, bingSatelliteInitRequestPromise])

        let getBingRoadsInitRequest = allResponses[0];
        let getBingSatelliteInitRequest = allResponses[1];

        let getBingRoadsInitResponse = await getBingRoadsInitRequest.response();
        let getBingRoadsInitResponseJson = await getBingRoadsInitResponse?.json();

        expect((getBingRoadsInitResponseJson.statusCode)).toBe(200);
        expect((getBingRoadsInitResponseJson.authenticationResultCode)).toBe("ValidCredentials");

        let getBingsatelliteInitResponse = await getBingSatelliteInitRequest.response();
        let getBingsatelliteInitResponseJson = await getBingsatelliteInitResponse?.json();

        expect((getBingsatelliteInitResponseJson.statusCode)).toBe(200);
        expect((getBingsatelliteInitResponseJson.authenticationResultCode)).toBe("ValidCredentials");
    })
})
