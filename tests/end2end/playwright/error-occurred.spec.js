// @ts-check
import { test, expect } from '@playwright/test';
const { gotoMap } = require('./globals')

test.describe('Error occurred', () => {

//    test('Loading map with an error', async ({ page }) => {
//        const url = '/index.php/view/map/?repository=testsrepository&project=invalid_layer';
//        await gotoMap(url, page, false);
//    })

    test('Loading map without an error', async ({ page }) => {
      const url = '/index.php/view/map/?repository=testsrepository&project=attribute_table';
      await gotoMap(url, page);
    })

    test('Project config', async ({ page }) => {
        await page.route('**/service/getProjectConfig*', async route => {
            await route.abort()
        });
        await page.goto('/index.php/view/map/?repository=testsrepository&project=world-3857', { waitUntil: 'networkidle' });
        expect(page.getByText('An error occurred while loading this map. Some necessary resources may temporari')).toBeVisible();
        await page.getByRole('link', { name: 'Go back to the home page.' }).click();
        const checked_url = new URL(page.url());
        expect(checked_url.pathname).toBe('/');
    })
    test('GetCapabilities WMS', async ({ page }) => {
        await page.route(/SERVICE=WMS&REQUEST=GetCapabilities/, async route => {
            await route.abort()
        });
        await page.goto('/index.php/view/map/?repository=testsrepository&project=world-3857', { waitUntil: 'networkidle' });
        expect(page.getByText('An error occurred while loading this map. Some necessary resources may temporari')).toBeVisible();
        await page.getByRole('link', { name: 'Go back to the home page.' }).click();
        const checked_url = new URL(page.url());
        expect(checked_url.pathname).toBe('/');
    })
    test('GetCapabilities WMTS', async ({ page }) => {
        await page.route(/SERVICE=WMTS&REQUEST=GetCapabilities/, async route => {
            await route.abort()
        });
        await page.goto('/index.php/view/map/?repository=testsrepository&project=world-3857', { waitUntil: 'networkidle' });
        expect(page.getByText('An error occurred while loading this map. Some necessary resources may temporari')).toBeVisible();
        await page.getByRole('link', { name: 'Go back to the home page.' }).click();
        const checked_url = new URL(page.url());
        expect(checked_url.pathname).toBe('/');
    })
    test('GetCapabilities WFS', async ({ page }) => {
        await page.route(/SERVICE=WFS&REQUEST=GetCapabilities/, async route => {
            await route.abort()
        });
        await page.goto('/index.php/view/map/?repository=testsrepository&project=world-3857', { waitUntil: 'networkidle' });
        expect(page.getByText('An error occurred while loading this map. Some necessary resources may temporari')).toBeVisible();
        await page.getByRole('link', { name: 'Go back to the home page.' }).click();
        const checked_url = new URL(page.url());
        expect(checked_url.pathname).toBe('/');
    })
})
