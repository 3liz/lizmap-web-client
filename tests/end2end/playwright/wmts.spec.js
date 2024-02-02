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
        await page.getByRole('cell', { name: 'Expand Display/Hide quartiers fffffff' }).getByRole('button', { name: 'Display/Hide' }).click();
        expect(GetTiles).toHaveLength(6);
        expect(GetTiles[0]).toContain('TILEMATRIX=2')
        expect(GetTiles[0]).toContain('TILEROW=5')
        expect(GetTiles[0]).toContain('TILECOL=7')
        expect(GetTiles[1]).toContain('TILEMATRIX=2')
        expect(GetTiles[1]).toContain('TILEROW=4')
        expect(GetTiles[1]).toContain('TILECOL=7')
        expect(GetTiles[2]).toContain('TILEMATRIX=2')
        expect(GetTiles[2]).toContain('TILEROW=5')
        expect(GetTiles[2]).toContain('TILECOL=6')
        expect(GetTiles[3]).toContain('TILEMATRIX=2')
        expect(GetTiles[3]).toContain('TILEROW=5')
        expect(GetTiles[3]).toContain('TILECOL=8')
        expect(GetTiles[4]).toContain('TILEMATRIX=2')
        expect(GetTiles[4]).toContain('TILEROW=4')
        expect(GetTiles[4]).toContain('TILECOL=6')
        expect(GetTiles[5]).toContain('TILEMATRIX=2')
        expect(GetTiles[5]).toContain('TILEROW=4')
        expect(GetTiles[5]).toContain('TILECOL=8')
        await page.unroute('**/service*')
    })
})
