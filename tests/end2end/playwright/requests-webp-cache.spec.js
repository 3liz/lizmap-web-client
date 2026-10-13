// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Read the header of a WebP file
 * @param {Buffer} body the image content
 * @returns {{isWebp: boolean, hasAlpha: boolean}} is it a WebP file and does it carry an alpha channel
 */
const readWebpHeader = (body) => {
    const isWebp = body.length > 30
        && body.toString('latin1', 0, 4) === 'RIFF'
        && body.toString('latin1', 8, 12) === 'WEBP';
    let hasAlpha = false;
    if (isWebp) {
        const chunk = body.toString('latin1', 12, 16);
        if (chunk === 'VP8X') {
            // Extended format: alpha flag in the feature flags
            hasAlpha = (body[20] & 0x10) !== 0;
        } else if (chunk === 'VP8L') {
            // Lossless format: alpha_is_used bit after the 14 bits width and height
            hasAlpha = (body[24] & 0x10) !== 0;
        }
        // 'VP8 ': simple lossy format, no alpha
    }
    return { isWebp, hasAlpha };
};

test.describe('WebP tile cache @requests @readonly', () => {

    /**
     * Build the WMTS GetTile URL of the cached WebP layer
     * @param {string} tileRow the tile row
     * @param {string} tileCol the tile column
     * @returns {string} the URL
     */
    const getTileUrl = (tileRow, tileCol) => {
        const params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'webp_cache',
            SERVICE: 'WMTS',
            VERSION: '1.0.0',
            REQUEST: 'GetTile',
            LAYER: 'quartiers',
            STYLE: 'default',
            TILEMATRIXSET: 'EPSG:3857',
            TILEMATRIX: '13',
            TILEROW: tileRow,
            TILECOL: tileCol,
            FORMAT: 'image/webp',
        });
        return `/index.php/lizmap/service?${params}`;
    };

    test('Transparent tile is stored and served as WebP', async({ request }) => {
        // Tile outside the data: fully transparent
        const url = getTileUrl('2989', '4185');

        // First request: the tile is built and stored into the cache
        let response = await request.get(url, {});
        await expect(response).toBeOK();
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toBe('image/webp');
        const firstBody = await response.body();
        let header = readWebpHeader(firstBody);
        // The content has to be WebP, not JPEG with a WebP content type
        expect(header.isWebp).toBeTruthy();
        // The transparency has to be kept
        expect(header.hasAlpha).toBeTruthy();

        // Second request: the tile is read from the cache
        response = await request.get(url, {});
        await expect(response).toBeOK();
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toBe('image/webp');
        const secondBody = await response.body();
        header = readWebpHeader(secondBody);
        expect(header.isWebp).toBeTruthy();
        expect(header.hasAlpha).toBeTruthy();
        expect(secondBody.equals(firstBody)).toBeTruthy();
    })

    test('Tile with data is stored and served as WebP', async({ request }) => {
        // Tile over the data
        const url = getTileUrl('2991', '4184');

        // First request: the tile is built and stored into the cache
        let response = await request.get(url, {});
        await expect(response).toBeOK();
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toBe('image/webp');
        const firstBody = await response.body();
        expect(readWebpHeader(firstBody).isWebp).toBeTruthy();

        // Second request: the tile is read from the cache
        response = await request.get(url, {});
        await expect(response).toBeOK();
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toBe('image/webp');
        const secondBody = await response.body();
        expect(readWebpHeader(secondBody).isWebp).toBeTruthy();
        expect(secondBody.equals(firstBody)).toBeTruthy();
    })
})
