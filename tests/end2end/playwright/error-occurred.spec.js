// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Error occured', () => {
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
