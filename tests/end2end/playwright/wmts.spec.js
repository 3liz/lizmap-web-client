import { test, expect } from '@playwright/test';

test.describe('WMTS', () => {
    test('Check GetCapabilities', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=wmts_test';
        let getCapabilitiesWMTSPromise = page.waitForRequest(/SERVICE=WMTS&REQUEST=GetCapabilities/);
        await page.goto(url);
        let getCapabilitiesWMTSRequest = await getCapabilitiesWMTSPromise;
        let getCapabilitiesWMTSResponse = await getCapabilitiesWMTSRequest.response();
        let getCapabilitiesWMTSResponseText = await getCapabilitiesWMTSResponse.text();
        expect(getCapabilitiesWMTSResponseText).toContain('<Layer>');
        expect(getCapabilitiesWMTSResponseText).toContain('<ows:Identifier>quartiers</ows:Identifier>');
        expect(getCapabilitiesWMTSResponseText).toContain('<ows:Title>quartiers fffffff</ows:Title>');
        expect(getCapabilitiesWMTSResponseText).toContain('<TileMatrixSet>EPSG:2154</TileMatrixSet>');
        expect(getCapabilitiesWMTSResponseText).toContain('<TileMatrixSet>EPSG:3857</TileMatrixSet>');
    })
    test('Check GetTile', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=wmts_test';
        await page.goto(url, { waitUntil: 'networkidle' });
        // Catch GetTile request;
        let GetTiles = [];
        await page.route('**/service*', (route) => {
            const request = route.request();
            if (request.url().includes('GetTile')) {
                GetTiles.push(request.url());
            }
        }, {times: 6});
        await page.getByLabel('quartiers fffffff').check();
        expect(GetTiles).toHaveLength(6);
        expect(GetTiles[0]).toContain('TileMatrix=2')
        expect(GetTiles[0]).toContain('TileRow=5')
        expect(GetTiles[0]).toContain('TileCol=7')
        expect(GetTiles[1]).toContain('TileMatrix=2')
        expect(GetTiles[1]).toContain('TileRow=4')
        expect(GetTiles[1]).toContain('TileCol=7')
        expect(GetTiles[2]).toContain('TileMatrix=2')
        expect(GetTiles[2]).toContain('TileRow=5')
        expect(GetTiles[2]).toContain('TileCol=6')
        expect(GetTiles[3]).toContain('TileMatrix=2')
        expect(GetTiles[3]).toContain('TileRow=5')
        expect(GetTiles[3]).toContain('TileCol=8')
        expect(GetTiles[4]).toContain('TileMatrix=2')
        expect(GetTiles[4]).toContain('TileRow=4')
        expect(GetTiles[4]).toContain('TileCol=6')
        expect(GetTiles[5]).toContain('TileMatrix=2')
        expect(GetTiles[5]).toContain('TileRow=4')
        expect(GetTiles[5]).toContain('TileCol=8')
        await page.unroute('**/service*')
    })
})
