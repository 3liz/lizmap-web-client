import { test, expect } from '@playwright/test';

test.describe('Overview', () => {
    test('2154', async ({ page }) => {
        const requestPromise = page.waitForRequest(/GetMap/);

        const url = '/index.php/view/map/?repository=testsrepository&project=overview-2154';
        await page.goto(url, { waitUntil: 'networkidle' });

        const request = await requestPromise;
        expect(request.url()).toBe('http://localhost:8130/index.php/lizmap/service?repository=testsrepository&project=overview-2154&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=Overview&CRS=EPSG%3A2154&STYLES=&WIDTH=231&HEIGHT=110&BBOX=758483.63%2C6273694.3%2C782170.37%2C6284973.7');
    });

    test('4326', async ({ page }) => {
        const requestPromise = page.waitForRequest(/GetMap/);

        const url = '/index.php/view/map/?repository=testsrepository&project=overview-4326';
        await page.goto(url, { waitUntil: 'networkidle' });

        const request = await requestPromise;
        expect(request.url()).toBe('http://localhost:8130/index.php/lizmap/service?repository=testsrepository&project=overview-4326&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=overview&CRS=EPSG%3A4326&STYLES=&WIDTH=231&HEIGHT=110&BBOX=43.55949198040038%2C3.765714500936302%2C43.65959251444461%2C3.9759256224291977');
    });

    test('3857', async ({ page }) => {
        const requestPromise = page.waitForRequest(/GetMap/);

        const url = '/index.php/view/map/?repository=testsrepository&project=overview-3857';
        await page.goto(url, { waitUntil: 'networkidle' });

        const request = await requestPromise;
        expect(request.url()).toBe('http://localhost:8130/index.php/lizmap/service?repository=testsrepository&project=overview-3857&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=Overview_1&CRS=EPSG%3A3857&STYLES=&WIDTH=231&HEIGHT=110&BBOX=411783.7006749792%2C5396012.897530658%2C450764.3584020709%2C5414575.115495941');
    });
});