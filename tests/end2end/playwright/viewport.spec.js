// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

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
        await gotoMap(url, page)
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
        await gotoMap(url, page)
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
        await gotoMap(url, page)

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

test.describe('Viewport standard', () => {
    test('Resize viewport', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=world-3857';
        await gotoMap(url, page)

        await expect(await page.evaluate(() => lizMap.map.getZoom())).toBe(0);
        await expect(await page.evaluate(() => lizMap.mainLizmap.map.getView().getZoom())).toBe(0);

        // disable rectangle layer
        await page.getByLabel('rectangle').uncheck();

        let getMapPromise = page.waitForRequest(/GetMap/);
        // zoom in
        await page.getByRole('button', { name: 'Zoom in' }).click();
        // Check GetMap request
        let getMapRequest = await getMapPromise;
        let getMapUrl = await getMapRequest.url();
        await expect(getMapUrl).toContain('SERVICE=WMS');
        await expect(getMapUrl).toContain('VERSION=1.3.0');
        await expect(getMapUrl).toContain('REQUEST=GetMap');
        await expect(getMapUrl).toContain('FORMAT=image%2Fpng');
        await expect(getMapUrl).toContain('TRANSPARENT=true');
        await expect(getMapUrl).toContain('LAYERS=world');
        await expect(getMapUrl).toContain('CRS=EPSG%3A3857');
        await expect(getMapUrl).toContain('STYLES=d%C3%A9faut');
        await expect(getMapUrl).toContain('DPI=96');
        await expect(getMapUrl).toContain('WIDTH=958');
        await expect(getMapUrl).toContain('HEIGHT=633');
        await expect(getMapUrl).toMatch(/BBOX=-9373014.15\d+%2C-6193233.77\d+%2C9373014.15\d+%2C6193233.77\d+/);
        // Check zoom
        await expect(await page.evaluate(() => lizMap.mainLizmap.map.getView().getZoom())).toBe(1);
        await expect(await page.evaluate(() => lizMap.map.getZoom())).toBe(1);

        // Get the current viewport size
        let viewport = await page.viewportSize();
        // check viewport size
        await expect(viewport?.width).toBe(900)
        await expect(viewport?.height).toBe(650)

        getMapPromise = page.waitForRequest(/GetMap/);
        // Invert viewport size
        await page.setViewportSize({ width: viewport?.height, height: viewport?.width });
        // Check GetMap request
        getMapRequest = await getMapPromise;
        getMapUrl = await getMapRequest.url();
        await expect(getMapUrl).toContain('SERVICE=WMS');
        await expect(getMapUrl).toContain('VERSION=1.3.0');
        await expect(getMapUrl).toContain('REQUEST=GetMap');
        await expect(getMapUrl).toContain('FORMAT=image%2Fpng');
        await expect(getMapUrl).toContain('TRANSPARENT=true');
        await expect(getMapUrl).toContain('LAYERS=world');
        await expect(getMapUrl).toContain('CRS=EPSG%3A3857');
        await expect(getMapUrl).toContain('STYLES=d%C3%A9faut');
        await expect(getMapUrl).toContain('DPI=96');
        await expect(getMapUrl).toContain('WIDTH=716');
        await expect(getMapUrl).toContain('HEIGHT=909');
        await expect(getMapUrl).toMatch(/BBOX=-7005300.76\d+%2C-8893601.11\d+%2C7005300.76\d+%2C8893601.11\d+/);
        // Check zoom
        await expect(await page.evaluate(() => lizMap.mainLizmap.map.getView().getZoom())).toBe(1);
        await expect(await page.evaluate(() => lizMap.map.getZoom())).toBe(1);

        // Get the current viewport size
        viewport = await page.viewportSize();
        // check viewport size
        await expect(viewport?.width).toBe(650)
        await expect(viewport?.height).toBe(900)

        // Reset the viewport size
        await page.setViewportSize({ width: viewport?.height, height: viewport?.width });
        // Check zoom
        await expect(await page.evaluate(() => lizMap.mainLizmap.map.getView().getZoom())).toBe(1);
        await expect(await page.evaluate(() => lizMap.map.getZoom())).toBe(1);
        // Do not check GetMap request because it is the same as the first one
    })
})
