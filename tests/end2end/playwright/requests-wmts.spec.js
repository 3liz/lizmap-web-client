// @ts-check
import { test, expect } from '@playwright/test';

test.describe('WMTS Requests @requests @readonly', () => {
    test('WMTS Getcapabilities', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'cache',
            SERVICE: 'WMTS',
            VERSION: '1.0.0',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('text/xml; charset=utf-8');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        // check body
        let body = await response.text();
        expect(body).toContain('Capabilities');
        expect(body).toContain('version="1.0.0"');
        expect(body).toContain('xmlns="http://www.opengis.net/wmts/1.0"');
        expect(body).toContain('<ows:Identifier>Quartiers</ows:Identifier>');
        expect(body).toContain('<TileMatrixSet>EPSG:3857</TileMatrixSet>');

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);
    })

    test('WMTS GetTile', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'cache',
            SERVICE: 'WMTS',
            VERSION: '1.0.0',
            REQUEST: 'GetTile',
            LAYER: 'Quartiers',
            STYLE: 'default',
            TILEMATRIXSET: 'EPSG:3857',
            TILEMATRIX: '13',
            TILEROW: '2989',
            TILECOL: '4185',
            FORMAT: 'image/png',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        await expect(response).toBeOK();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('image/png');
        // check headers
        expect(response.headers()).toHaveProperty('content-length');
        expect(response.headers()['content-length']).toBe('355'); // Transparent
        expect(response.headers()).toHaveProperty('date');
        expect(response.headers()).toHaveProperty('expires');
        let tileDate = new Date(response.headers()['date'])
        let tileExpires = new Date(response.headers()['expires'])
        expect(tileExpires > tileDate).toBeTruthy();

        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'cache',
            SERVICE: 'WMTS',
            VERSION: '1.0.0',
            REQUEST: 'GetTile',
            LAYER: 'Quartiers',
            STYLE: 'default',
            TILEMATRIXSET: 'EPSG:3857',
            TILEMATRIX: '13',
            TILEROW: '2991',
            TILECOL: '4184',
            FORMAT: 'image/png',
        });
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        await expect(response).toBeOK();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('image/png');
        // check headers
        expect(response.headers()).toHaveProperty('content-length');
        let contentLength = Number(response.headers()['content-length']);
        expect(contentLength).toBeGreaterThan(355); // Not transparent
        expect(contentLength).toBeGreaterThan(11000); // 11019
        expect(contentLength).toBeLessThan(11100); // 11019
        expect(response.headers()).toHaveProperty('date');
        expect(response.headers()).toHaveProperty('expires');
        tileDate = new Date(response.headers()['date'])
        tileExpires = new Date(response.headers()['expires'])
        expect(tileExpires > tileDate).toBeTruthy();

        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'cache',
            SERVICE: 'WMTS',
            VERSION: '1.0.0',
            REQUEST: 'GetTile',
            LAYER: 'Quartiers',
            STYLE: 'default',
            TILEMATRIXSET: 'EPSG:3857',
            TILEMATRIX: '15',
            TILEROW: '11964',
            TILECOL: '16736',
            FORMAT: 'image/png',
        });
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        await expect(response).toBeOK();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('image/png');
        // check headers
        expect(response.headers()).toHaveProperty('content-length');
        contentLength = Number(response.headers()['content-length']);
        expect(contentLength).toBeGreaterThan(355); // Not transparent
        expect(contentLength).toBeGreaterThan(650); // 687
        expect(contentLength).toBeLessThan(700); // 687
        expect(response.headers()).toHaveProperty('date');
        expect(response.headers()).toHaveProperty('expires');
        tileDate = new Date(response.headers()['date'])
        tileExpires = new Date(response.headers()['expires'])
        expect(tileExpires > tileDate).toBeTruthy();
    })
})
