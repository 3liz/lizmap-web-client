// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'

test.describe('Request Service - anonymous - @requests @readonly', () => {
    test('Lizmap GetProjectConfig', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service/getProjectConfig?${params}`;
        let response = await request.get(url, {});
        // check response
        await responseExpect(response).toBeLizmapConfig();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);
    });

    test('Lizmap GetProj4', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetProj4',
            AUTHID: 'EPSG:2154',
        });
        let url = `/index.php/lizmap/service/?${params}`;
        let response = await request.get(url, {});
        // check response
        await responseExpect(response).toBeTextPlain();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        // check body
        const body = await response.body();
        const projParams = `${body}`.split(' ');
        expect(projParams).toHaveLength(11);
        expect(projParams).toEqual(expect.arrayContaining([
            '+proj=lcc',
            '+lat_1=49',
            '+lat_2=44',
            '+lat_0=46.5',
            '+lon_0=3',
            '+x_0=700000',
            '+y_0=6600000',
            '+ellps=GRS80',
            '+towgs84=0,0,0,0,0,0,0',
            '+units=m',
            '+no_defs',
        ]));

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);
    });

    test('Lizmap GetSelectionToken', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WMS',
            REQUEST: 'GetSelectionToken',
            TYPENAME: 'selection_polygon',
            IDS: '1,2',
        });
        let url = `/index.php/lizmap/service/?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(32);

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('token', etag);

        // re-run the request with the same parameters
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        // same etag
        expect(response.headers()).toHaveProperty('etag', etag);

        // check body
        body = await response.json();
        expect(body).toHaveProperty('token', etag);

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);
    });

    test('Lizmap GetFilterToken', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WMS',
            REQUEST: 'GetFilterToken',
            TYPENAME: 'selection_polygon',
            FILTER: '"id" IN (1, 2)',
        });
        let url = `/index.php/lizmap/service/?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(32);

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('token', etag);

        // re-run the request with the same parameters
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        // same etag
        expect(response.headers()).toHaveProperty('etag', etag);

        // check body
        body = await response.json();
        expect(body).toHaveProperty('token', etag);

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);
    });

    test('Failed - Project parameter is mandatory', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            // project: 'selection',
            SERVICE: 'WMS',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service/?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml(404);
        // check body
        let body = await response.text();
        expect(body).toContain('ServiceException');
    });

    test('Failed - Repository parameter is mandatory', async({ request }) => {
        let params = new URLSearchParams({
            // repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WMS',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service/?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml(404);
        // check body
        let body = await response.text();
        expect(body).toContain('ServiceException');
    });

    test('Failed - Service unknown or unsupported', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'OWS', // 'WMS',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service/?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml(501);
        // check body
        let body = await response.text();
        expect(body).toContain('ServiceException');
    });

    test('Failed - Request unsupported', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WMS',
            REQUEST: 'GetUnsupported', // 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service/?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml(501);
        // check body
        let body = await response.text();
        expect(body).toContain('ServiceException');
    });

    test('Failed - Request undefined', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WMS',
            // REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service/?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml(501);
        // check body
        let body = await response.text();
        expect(body).toContain('ServiceException');
    });
});
