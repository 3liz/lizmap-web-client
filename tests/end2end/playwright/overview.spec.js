import { test, expect } from '@playwright/test';

test.describe('Overview', () => {
    test('2154', async ({ page }) => {
        const requestPromise = page.waitForRequest(/GetMap/);

        const url = '/index.php/view/map/?repository=testsrepository&project=overview-2154';
        await page.goto(url, { waitUntil: 'networkidle' });

        const request = await requestPromise;
        const requestUrl = request.url();
        expect(requestUrl).toContain('SERVICE=WMS');
        expect(requestUrl).toContain('VERSION=1.3.0');
        expect(requestUrl).toContain('REQUEST=GetMap');
        expect(requestUrl).toContain('FORMAT=image%2Fpng');
        expect(requestUrl).toContain('TRANSPARENT=true');
        expect(requestUrl).toContain('LAYERS=Overview');
        expect(requestUrl).toContain('CRS=EPSG%3A2154');
        expect(requestUrl).toContain('STYLES=');
        expect(requestUrl).toContain('WIDTH=210');
        expect(requestUrl).toContain('HEIGHT=100');
        expect(requestUrl).toContain('BBOX=759560.3%2C6274207%2C781093.7%2C6284461');
    });

    test('4326', async ({ page }) => {
        const requestPromise = page.waitForRequest(/GetMap/);

        const url = '/index.php/view/map/?repository=testsrepository&project=overview-4326';
        await page.goto(url, { waitUntil: 'networkidle' });

        const request = await requestPromise;
        const requestUrl = request.url();
        expect(requestUrl).toContain('SERVICE=WMS');
        expect(requestUrl).toContain('VERSION=1.3.0');
        expect(requestUrl).toContain('REQUEST=GetMap');
        expect(requestUrl).toContain('FORMAT=image%2Fpng');
        expect(requestUrl).toContain('TRANSPARENT=true');
        expect(requestUrl).toContain('LAYERS=Overview');
        expect(requestUrl).toContain('CRS=EPSG%3A4326');
        expect(requestUrl).toContain('STYLES=');
        expect(requestUrl).toContain('WIDTH=210');
        expect(requestUrl).toContain('HEIGHT=100');
        expect(requestUrl).toContain('BBOX=43.564042004675116%2C3.7752695519132518%2C43.655042490169876%2C3.9663705714522477');
    });

    test('3857', async ({ page }) => {
        const requestPromise = page.waitForRequest(/GetMap/);

        const url = '/index.php/view/map/?repository=testsrepository&project=overview-3857';
        await page.goto(url, { waitUntil: 'networkidle' });

        const request = await requestPromise;
        const requestUrl = request.url();
        expect(requestUrl).toContain('SERVICE=WMS');
        expect(requestUrl).toContain('VERSION=1.3.0');
        expect(requestUrl).toContain('REQUEST=GetMap');
        expect(requestUrl).toContain('FORMAT=image%2Fpng');
        expect(requestUrl).toContain('TRANSPARENT=true');
        expect(requestUrl).toContain('LAYERS=Overview');
        expect(requestUrl).toContain('CRS=EPSG%3A3857');
        expect(requestUrl).toContain('STYLES=');
        expect(requestUrl).toContain('WIDTH=210');
        expect(requestUrl).toContain('HEIGHT=100');
        expect(requestUrl).toContain('BBOX=413555.54875348334%2C5396856.634710899%2C448992.51032356673%2C5413731.3783157');
    });
});
