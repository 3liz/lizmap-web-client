import { test, expect } from '@playwright/test';

test.describe('Overview', () => {
    test('2154', async ({ page }) => {
        const requestPromise = page.waitForRequest(/GetMap/);

        const url = '/index.php/view/map/?repository=testsrepository&project=overview-2154';
        await page.goto(url, { waitUntil: 'networkidle' });

        const request = await requestPromise;
        expect(request.url()).toBe('http://localhost:8130/index.php/lizmap/service?repository=testsrepository&project=overview-2154&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=Overview&CRS=EPSG%3A2154&STYLES=&WIDTH=232&HEIGHT=110&BBOX=758432.36%2C6273694.3%2C782221.64%2C6284973.7');
    });

    test('4326', async ({ page }) => {
        const requestPromise = page.waitForRequest(/GetMap/);

        const url = '/index.php/view/map/?repository=testsrepository&project=overview-4326';
        await page.goto(url, { waitUntil: 'networkidle' });

        const request = await requestPromise;
        expect(request.url()).toBe('http://localhost:8130/index.php/lizmap/service?repository=testsrepository&project=overview-4326&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=overview&CRS=EPSG%3A4326&STYLES=&WIDTH=232&HEIGHT=110&BBOX=43.55949198040038%2C3.765259498508828%2C43.65959251444461%2C3.9763806248566715');
    });

    test('3857', async ({ page }) => {
        const requestPromise = page.waitForRequest(/GetMap/);

        const url = '/index.php/view/map/?repository=testsrepository&project=overview-3857';
        await page.goto(url, { waitUntil: 'networkidle' });

        const request = await requestPromise;
        expect(request.url()).toBe('http://localhost:8130/index.php/lizmap/service?repository=testsrepository&project=overview-3857&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=Overview_1&CRS=EPSG%3A3857&STYLES=&WIDTH=232&HEIGHT=110&BBOX=411699.3269569552%2C5396012.897530658%2C450848.7321200949%2C5414575.115495941');
    });
});