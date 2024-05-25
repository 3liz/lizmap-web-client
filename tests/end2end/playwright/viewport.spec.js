// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Viewport devicePixelRatio 1', () => {
    test('Greater than WMS max size', async ({ page }) => {
        // world-3857 project with permalink to do not activate layers
        const url = '/index.php/view/map/?repository=testsrepository&project=world-3857#-522.0703124273273,-89.68790709387876,522.0703124273273,89.68790709387875||';

        // Overwrite WMS Max Size
        let requests = [];
        await page.route('**/service/getProjectConfig*', async route => {
            const request = route.request();
            requests.push(request.url());
            if (request.url().includes('getProjectConfig')) {
                const response = await route.fetch();
                const json = await response.json();
                expect(json.options.wmsMaxWidth).toBe('3000');
                expect(json.options.wmsMaxHeight).toBe('3000');
                json.options.wmsMaxWidth = 950; // just lower than 870*1.1 == 957
                json.options.wmsMaxHeight = 950; // same
                expect(json.options.wmsMaxWidth).toBe(950);
                expect(json.options.wmsMaxHeight).toBe(950);
                await route.fulfill({ response, json });
            }
        });

        // Go to the map
        await page.goto(url, { waitUntil: 'load' });
        // Wait to let the config loaded
        await page.waitForTimeout(1000);
        // Check that the get project config has been catched
        expect(requests).toHaveLength(1);

        // Wait to let the JS build classes
        await page.waitForTimeout(1000);

        // Check that the WMS Max Size has been well overwrite
        expect(await page.evaluate(() => globalThis.lizMap.mainLizmap.initialConfig.options.wmsMaxHeight)).toBe(950);
        expect(await page.evaluate(() => window.devicePixelRatio)).toBe(1);
        expect(await page.evaluate(() => globalThis.lizMap.mainLizmap.map.getSize())).toStrictEqual([870, 575]);
        await page.unroute('**/service/getProjectConfig*')

        // Catch GetMaps request;
        let GetMaps = [];
        await page.route('**/service*', async route => {
            const request = route.request();
            if (request.url().includes('GetMap')) {
                GetMaps.push(request.url());
            }
        }, { times: 4 });

        // Activate world layer
        await page.getByLabel('world').check();

        // Wait for requests fetched
        await page.waitForTimeout(1000);

        // Check GetMap requests
        expect(GetMaps).toHaveLength(4);
        for (const GetMap of GetMaps) {
            expect(GetMap).toContain('&WIDTH=790&')
            expect(GetMap).toContain('&HEIGHT=575&')
            expect(GetMap).toContain('&DPI=96&')
        }

        await page.unroute('**/service*')
    })
})

test.describe('Viewport devicePixelRatio 2', () => {
    // Force device pixel ratio to 2
    test.use({
        deviceScaleFactor: 2,
    });
    test('Greater than WMS max size', async ({ page }) => {
        // world-3857 project with permalink to do not activate layers
        const url = '/index.php/view/map/?repository=testsrepository&project=world-3857#-522.0703124273273,-89.68790709387876,522.0703124273273,89.68790709387875||';

        // Overwrite WMS Max Size
        let requests = [];
        await page.route('**/service/getProjectConfig*', async route => {
            const request = route.request();
            requests.push(request.url());
            if (request.url().includes('getProjectConfig')) {
                const response = await route.fetch();
                const json = await response.json();
                expect(json.options.wmsMaxWidth).toBe('3000');
                expect(json.options.wmsMaxHeight).toBe('3000');
                json.options.wmsMaxWidth = 1900; // just lower than 870*1.1*2 == 1914
                json.options.wmsMaxHeight = 1900; // same
                expect(json.options.wmsMaxWidth).toBe(1900);
                expect(json.options.wmsMaxHeight).toBe(1900);
                await route.fulfill({ response, json });
            }
        });

        // Go to the map
        await page.goto(url, { waitUntil: 'load' });
        // Wait to let the config loaded
        await page.waitForTimeout(1000);
        // Check that the get project config has been catched
        expect(requests).toHaveLength(1);

        // Wait to let the JS build classes
        await page.waitForTimeout(1000);

        // Check that the WMS Max Size has been well overwrite
        expect(await page.evaluate(() => globalThis.lizMap.mainLizmap.initialConfig.options.wmsMaxHeight)).toBe(1900);
        expect(await page.evaluate(() => window.devicePixelRatio)).toBe(2);
        expect(await page.evaluate(() => globalThis.lizMap.mainLizmap.map.getSize())).toStrictEqual([870, 620]);
        await page.unroute('**/service/getProjectConfig*')

        // Catch GetMaps request;
        // Because we disable High DPI, the OL pixel ratio is forced to 1 even if the device pixel ratio is 2
        let GetMaps = [];
        await page.route('**/service*', async route => {
            const request = route.request();
            if (request.url().includes('GetMap')) {
                GetMaps.push(request.url());
            }
        }, { times: 1 }); // No tiles, if High DPI is enabled we got 4 tiles

        // Activate world layer
        await page.getByLabel('world').check();

        // Wait for requests fetched
        await page.waitForTimeout(1000);

        // Check GetMap requests
        expect(GetMaps).toHaveLength(1); // No tiles, if High DPI is enabled we got 4 tiles
        for (const GetMap of GetMaps) {
            expect(GetMap).toContain('&WIDTH=957&')
            expect(GetMap).toContain('&HEIGHT=682&')
            expect(GetMap).toContain('&DPI=96&')
        }
        await page.unroute('**/service*')
    })
})

test.describe('Viewport mobile', () => {
    test.use({
        hasTouch: true,
        isMobile: true,
    });
    test('Display docks', async ({ page }) => {
        // atlas project
        const url = '/index.php/view/map/?repository=testsrepository&project=atlas'
        // Go to the map
        await page.goto(url, { waitUntil: 'networkidle' });

        // Check menu and menu toggle button
        await expect(await page.locator('#mapmenu')).not.toBeInViewport();
        await expect(await page.locator('#menuToggle')).toBeVisible();
        await expect(await page.locator('#menuToggle')).not.toHaveClass('opened');
        await page.locator('#menuToggle').click();

        // Open menu
        await expect(await page.locator('#menuToggle')).toHaveClass('opened');
        await expect(await page.locator('#mapmenu')).toBeInViewport();
        await expect(await page.getByRole('link', { name: 'atlas' })).toBeVisible();

        // Open atlas
        await page.getByRole('link', { name: 'atlas', exact: true }).click();
        await expect(await page.locator('#menuToggle')).not.toHaveClass('opened');
        await expect(await page.locator('#mapmenu')).not.toBeInViewport();
        await expect(await page.locator('#right-dock')).toBeVisible();
        await expect(await page.locator('#right-dock')).toBeInViewport();

        // Choose a feature and check getFeatureInfo
        let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeatureInfo') === true);
        await page.locator('#liz-atlas-select').selectOption('2');
        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        await expect(await getFeatureInfoResponse?.headerValue('content-type')).toContain('text/html');
        await expect(await page.locator('#liz-atlas-item-detail .lizmapPopupContent')).toBeInViewport();
        await expect(await page.locator('#liz-atlas-item-detail .lizmapPopupContent')).toContainText('MOSSON');
        // Close atlas
        await page.locator('#right-dock-close').click();
        await expect(await page.locator('#right-dock')).not.toBeInViewport();
        await expect(await page.locator('#right-dock')).not.toBeVisible();

        // Test permalink (mini-dock)
        await expect(await page.locator('#permalink')).not.toBeVisible();
        await page.locator('#menuToggle').click();
        await page.getByRole('link', { name: 'Permalink' }).click();
        await expect(await page.locator('#permalink')).toBeVisible();
        await expect(await page.locator('#permalink')).toBeInViewport();
        await expect(await page.locator('#tab-share-permalink')).toBeVisible();
    })
})
