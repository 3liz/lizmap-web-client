// @ts-check
const { test, expect } = require('@playwright/test');
const { gotoMap, digestBuffer } = require('./globals')

test.describe('Axis Orientation', () => {

    test('Axis Orientation NEU for EPSG:3044', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=axis_orientation_neu_3044';
        await gotoMap(url, page)

        const getMapPromise = page.waitForRequest(/GetMap/);
        await page.getByLabel('Bundesländer').check();
        const getMapRequest = await getMapPromise;
        const getMapUrl = getMapRequest.url();
        expect(getMapUrl).toContain('SERVICE=WMS');
        expect(getMapUrl).toContain('VERSION=1.3.0');
        expect(getMapUrl).toContain('REQUEST=GetMap');
        expect(getMapUrl).toContain('FORMAT=image%2Fpng');
        expect(getMapUrl).toContain('TRANSPARENT=true');
        expect(getMapUrl).toContain('LAYERS=Bundeslander');
        expect(getMapUrl).toContain('CRS=EPSG%3A3044');
        expect(getMapUrl).toContain('STYLES=default');
        expect(getMapUrl).toContain('WIDTH=958');
        expect(getMapUrl).toContain('HEIGHT=633');
        expect(getMapUrl).toMatch(/BBOX=5276843.28\d+%2C-14455.54\d+%2C6114251.21\d+%2C1252901.15\d+/);

        const getMapResponse = await getMapRequest.response();
        expect(getMapResponse).not.toBeNull();
        expect(getMapResponse?.ok()).toBe(true);
        expect(await getMapResponse?.headerValue('Content-Type')).toBe('image/png');
        // image size greater than transparent
        const contentLength = await getMapResponse?.headerValue('Content-Length');
        expect(parseInt(contentLength ? contentLength : '0')).toBeGreaterThan(5552);

        const getMapBody = await getMapResponse?.body();
        if (getMapBody) {
            expect(getMapBody.length).toBeGreaterThan(5552);
            expect(getMapBody.length).toBeLessThan(112500); // could be 112384 or 112499
            expect(await digestBuffer(getMapBody.buffer)).toBe('225268cf035599cd66fde2970a73d0d78db63b13');
        }

        // Catch GetTile request;
        let GetTiles = [];
        await page.route('https://tile.openstreetmap.org/*/*/*.png', (route) => {
            const request = route.request();
            GetTiles.push(request.url());
        }, { times: 6 });

        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('OpenStreetMap');
        await page.waitForTimeout(1000);
        expect(GetTiles).toHaveLength(6);
        expect(GetTiles[0]).toContain('6/33/20.png')
        expect(GetTiles[1]).toContain('6/33/21.png')
        expect(GetTiles[2]).toContain('6/34/20.png')
        expect(GetTiles[3]).toContain('6/34/21.png')
        expect(GetTiles[4]).toContain('6/33/22.png')
        expect(GetTiles[5]).toContain('6/34/22.png')
        await page.unroute('https://tile.openstreetmap.org/*/*/*.png')
    });

    test('Axis Orientation NEU for EPSG:3844', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=axis_orientation_neu_3844';
        await gotoMap(url, page)

        const getMapPromise = page.waitForRequest(/GetMap/);
        await page.getByLabel('județ').check();
        const getMapRequest = await getMapPromise;
        const getMapUrl = getMapRequest.url();
        expect(getMapUrl).toContain('SERVICE=WMS');
        expect(getMapUrl).toContain('VERSION=1.3.0');
        expect(getMapUrl).toContain('REQUEST=GetMap');
        expect(getMapUrl).toContain('FORMAT=image%2Fpng');
        expect(getMapUrl).toContain('TRANSPARENT=true');
        expect(getMapUrl).toContain('LAYERS=judet');
        expect(getMapUrl).toContain('CRS=EPSG%3A3844');
        expect(getMapUrl).toContain('STYLES=default');
        expect(getMapUrl).toContain('WIDTH=958');
        expect(getMapUrl).toContain('HEIGHT=633');
        expect(getMapUrl).toMatch(/BBOX=72126.00\d+%2C-122200.57\d+%2C909533.92\d+%2C1145156.12\d+/);

        const getMapResponse = await getMapRequest.response();
        expect(getMapResponse).not.toBeNull();
        expect(getMapResponse?.ok()).toBe(true);
        expect(await getMapResponse?.headerValue('Content-Type')).toBe('image/png');
        // image size greater than transparent
        const contentLength = await getMapResponse?.headerValue('Content-Length');
        expect(parseInt(contentLength ? contentLength : '0')).toBeGreaterThan(5552);
        // image size lesser than disorder axis
        expect(parseInt(contentLength ? contentLength : '0')).toBeLessThan(240115);

        const getMapBody = await getMapResponse?.body();
        if (getMapBody) {
            expect(getMapBody.length).toBeGreaterThan(5552);
            expect(getMapBody.length).toBeLessThan(240115);
            expect(getMapBody.length).toBeLessThan(168650); // could be 168630 or 168641
            expect(await digestBuffer(getMapBody.buffer)).toBe('71f81b4e902f03350116cf22783de34cf548199d');
        }

        // Catch GetTile request;
        let GetTiles = [];
        await page.route('https://tile.openstreetmap.org/*/*/*.png', (route) => {
            const request = route.request();
            GetTiles.push(request.url());
        }, { times: 6 });
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('OpenStreetMap');
        await page.waitForTimeout(1000);
        expect(GetTiles).toHaveLength(6);
        expect(GetTiles[0]).toContain('6/35/22.png')
        expect(GetTiles[1]).toContain('6/35/23.png')
        expect(GetTiles[2]).toContain('6/36/22.png')
        expect(GetTiles[3]).toContain('6/36/23.png')
        expect(GetTiles[4]).toContain('6/37/22.png')
        expect(GetTiles[5]).toContain('6/37/23.png')
        await page.unroute('https://tile.openstreetmap.org/*/*/*.png')
    });
});
