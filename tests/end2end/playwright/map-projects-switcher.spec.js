// @ts-check
import { test, expect } from '@playwright/test';
import { getAuthStorageStatePath, gotoMap } from './globals';

test.describe('Map projects switcher', () => {

    const locale = 'en-US';

    test.use({ storageState: getAuthStorageStatePath('admin') });

    test.beforeEach(async ({ page }) => {
        // Go to Lizmap configuration
        await page.goto('/admin.php/admin/config', { waitUntil: 'domcontentloaded' });
        // Enabled map projects switcher
        await page.getByRole('link', { name: 'Modify' }).click();
        await page.waitForURL('admin.php/admin/config/editServices', { waitUntil: 'domcontentloaded' })
        await page.getByLabel('Show projects switcher*').selectOption('on');
        await expect(page.getByLabel('Show projects switcher*')).toHaveValue('on');
        await page.getByRole('button', { name: 'Save' }).click();
        await page.waitForURL('admin.php/admin/config', {waitUntil: 'domcontentloaded'})
        await expect(page.locator('#_projectSwitcher')).toHaveText('On');
    })

    test.afterEach(async ({ page }) => {
        // Go to Lizmap configuration
        await page.goto('/admin.php/admin/config', { waitUntil: 'domcontentloaded' });
        // Disabled map projects switcher
        await page.getByRole('link', { name: 'Modify' }).click();
        await page.waitForURL('admin.php/admin/config/editServices', { waitUntil: 'domcontentloaded' })
        await page.getByLabel('Show projects switcher*').selectOption('off');
        await expect(page.getByLabel('Show projects switcher*')).toHaveValue('off');
        await page.getByRole('button', { name: 'Save' }).click();
        await page.waitForURL('admin.php/admin/config', { waitUntil: 'domcontentloaded' })
        await expect(page.locator('#_projectSwitcher')).toHaveText('Off');
    })

    test('Switcher from map to map', async ({ page }) => {
        await gotoMap('index.php/view/map?repository=testsrepository&project=base_layers', page);

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (144448).toLocaleString(locale));

        // Go to another map
        await page.locator('#button-projects').click();
        await page.locator('li').filter({ hasText: 'base_layers_user_defined' }).getByRole('link').nth(1).click();

        let checked_url = new URL(page.url());
        await expect(checked_url.searchParams.get('repository')).toBe('testsrepository')
        await expect(checked_url.searchParams.get('project')).toBe('base_layers_user_defined')
        await expect(checked_url.hash).toHaveLength(0);

        // Zoom in
        await page.locator('#navbar button.btn.zoom-in').click();
        await page.locator('#navbar button.btn.zoom-in').click();

        // Wait for OL transition
        await page.waitForTimeout(1000);

        // Go to another map
        await page.locator('#button-projects').click();
        await page.locator('li').filter({ hasText: 'base_layers' }).getByRole('link').nth(1).click();

        // Wait for OL transition
        await page.waitForTimeout(1000);

        checked_url = new URL(page.url());
        await expect(checked_url.searchParams.get('repository')).toBe('testsrepository')
        await expect(checked_url.searchParams.get('project')).toBe('base_layers')
        await expect(checked_url.hash).not.toHaveLength(0);
        await expect(checked_url.hash).toMatch(/^#3\.838\d+,43\.5883\d+,3\.912\d+,43\.6241\d+/)

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (36112).toLocaleString(locale));

        // Zoom out
        await page.locator('#navbar button.btn.zoom-out').click();

        // Wait for OL transition
        await page.waitForTimeout(1000);

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (72224).toLocaleString(locale));

        // Go to another map
        await page.locator('#button-projects').click();
        await page.locator('li').filter({ hasText: 'attribute_table' }).getByRole('link').nth(1).click();

        // Wait for OL transition
        await page.waitForTimeout(1000);

        checked_url = new URL(page.url());
        await expect(checked_url.searchParams.get('repository')).toBe('testsrepository')
        await expect(checked_url.searchParams.get('project')).toBe('attribute_table')
        await expect(checked_url.hash).not.toHaveLength(0);
        await expect(checked_url.hash).toMatch(/^#3\.8007\d+,43\.570\d+,3\.950\d+,43\.6419\d+/)

        // Wait for OL transition
        await page.waitForTimeout(1000);

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (50000).toLocaleString(locale));

        // Zoom in
        await page.locator('#navbar button.btn.zoom-in').click();
        await page.locator('#navbar button.btn.zoom-in').click();

        // Wait for OL transition
        await page.waitForTimeout(1000);

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (10000).toLocaleString(locale));

        // Go to another map
        await page.locator('#button-projects').click();
        await page.locator('li').filter({ hasText: 'base_layers_user_defined' }).getByRole('link').nth(1).click();

        // Wait for OL transition
        await page.waitForTimeout(1000);

        checked_url = new URL(page.url());
        await expect(checked_url.searchParams.get('repository')).toBe('testsrepository')
        await expect(checked_url.searchParams.get('project')).toBe('base_layers_user_defined')
        await expect(checked_url.hash).toMatch(/^#3\.8611\d+,43\.599\d+,3\.8898\d+,43\.6132\d+/)

        // Wait for OL transition
        await page.waitForTimeout(1000);

        // Zoom out
        await page.locator('#navbar button.btn.zoom-out').click();
        await page.locator('#navbar button.btn.zoom-out').click();
        await page.locator('#navbar button.btn.zoom-out').click();

        // Wait for OL transition
        await page.waitForTimeout(1000);

        // Go to another map
        await page.locator('#button-projects').click();
        await page.locator('li').filter({ hasText: 'base_layers' }).getByRole('link').nth(1).click();

        // Wait for OL transition
        await page.waitForTimeout(1000);

        checked_url = new URL(page.url());
        await expect(checked_url.searchParams.get('repository')).toBe('testsrepository')
        await expect(checked_url.searchParams.get('project')).toBe('base_layers')
        await expect(checked_url.hash).toHaveLength(0);

        // Check scale
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (144448).toLocaleString(locale));
    });
});
