// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Overview', () => {
    test('2154', async ({ page }) => {
        const requestPromise = page.waitForRequest(/GetMap/);

        const url = '/index.php/view/map/?repository=testsrepository&project=overview-2154';
        await gotoMap(url, page);

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
        expect(requestUrl).toContain('WIDTH=232');
        expect(requestUrl).toContain('HEIGHT=110');
        expect(requestUrl).toContain('BBOX=758432.36%2C6273694.3%2C782221.64%2C6284973.7');
    });

    test('4326', async ({ page }) => {
        const requestPromise = page.waitForRequest(/GetMap/);

        const url = '/index.php/view/map/?repository=testsrepository&project=overview-4326';
        await gotoMap(url, page);

        const request = await requestPromise;
        const requestUrl = request.url();
        expect(requestUrl).toContain('SERVICE=WMS');
        expect(requestUrl).toContain('VERSION=1.3.0');
        expect(requestUrl).toContain('REQUEST=GetMap');
        expect(requestUrl).toContain('FORMAT=image%2Fpng');
        expect(requestUrl).toContain('TRANSPARENT=true');
        expect(requestUrl).toContain('LAYERS=overview');
        expect(requestUrl).toContain('CRS=EPSG%3A4326');
        expect(requestUrl).toContain('STYLES=');
        expect(requestUrl).toContain('WIDTH=232');
        expect(requestUrl).toContain('HEIGHT=110');
        expect(requestUrl).toContain('BBOX=43.55949198040038%2C3.765259498508828%2C43.65959251444461%2C3.9763806248566715');
    });

    test('3857', async ({ page }) => {
        const requestPromise = page.waitForRequest(/GetMap/);

        const url = '/index.php/view/map/?repository=testsrepository&project=overview-3857';
        await gotoMap(url, page);

        const request = await requestPromise;
        const requestUrl = request.url();
        expect(requestUrl).toContain('SERVICE=WMS');
        expect(requestUrl).toContain('VERSION=1.3.0');
        expect(requestUrl).toContain('REQUEST=GetMap');
        expect(requestUrl).toContain('FORMAT=image%2Fpng');
        expect(requestUrl).toContain('TRANSPARENT=true');
        expect(requestUrl).toContain('LAYERS=Overview_1');
        expect(requestUrl).toContain('CRS=EPSG%3A3857');
        expect(requestUrl).toContain('STYLES=');
        expect(requestUrl).toContain('WIDTH=232');
        expect(requestUrl).toContain('HEIGHT=110');
        expect(requestUrl).toContain('BBOX=411699.3269569552%2C5396012.897530658%2C450848.7321200949%2C5414575.115495941');
    });
});
