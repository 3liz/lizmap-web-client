// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Attributions', () => {

    test('Layers attribution', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=axis_orientation_neu_3044';
        await gotoMap(url, page)

        // No attributions
        await expect(page.getByRole('link', { name: '© Contributeurs OpenStreetMap' })).toHaveCount(0)
        await expect(page.getByText('Attribution for this layer is')).toHaveCount(0)
        await expect(page.getByRole('link', { name: 'Made with Natural Earth' })).toHaveCount(0)

        // Each attribution
        await page.getByLabel('Bundesländer').check();
        await expect(page.getByRole('link', { name: '© Contributeurs OpenStreetMap' })).toHaveCount(1)
        await page.getByLabel('Bundesländer').uncheck();
        await expect(page.getByRole('link', { name: '© Contributeurs OpenStreetMap' })).toHaveCount(0)
        await page.getByLabel('rectangle').check();
        await expect(page.getByText('Attribution for this layer is')).toHaveCount(1)
        await page.getByLabel('rectangle').uncheck();
        await expect(page.getByText('Attribution for this layer is')).toHaveCount(0)
        await page.getByLabel('world').check();
        await expect(page.getByRole('link', { name: 'Made with Natural Earth' })).toHaveCount(1)
        await page.getByLabel('world').uncheck();
        await expect(page.getByRole('link', { name: 'Made with Natural Earth' })).toHaveCount(0)

        // Multiple attributions
        await page.getByLabel('Bundesländer').check();
        await page.getByLabel('rectangle').check();
        await page.getByLabel('world').check();
        await expect(page.getByRole('link', { name: '© Contributeurs OpenStreetMap' })).toHaveCount(1)
        await expect(page.getByText('Attribution for this layer is')).toHaveCount(1)
        await expect(page.getByRole('link', { name: 'Made with Natural Earth' })).toHaveCount(1)
    });

    test('Base layers attribution', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=axis_orientation_neu_3044';
        await gotoMap(url, page)

        // No attributions
        await expect(page.getByRole('link', { name: '© Contributeurs OpenStreetMap' })).toHaveCount(0)
        await expect(page.getByRole('link', { name: 'Made with Natural Earth' })).toHaveCount(0)

        // Each attribution
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('OpenStreetMap');
        await expect(page.getByRole('link', { name: '© Contributeurs OpenStreetMap' })).toHaveCount(1)
        await expect(page.getByRole('link', { name: 'Made with Natural Earth' })).toHaveCount(0)
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('world-background');
        await expect(page.getByRole('link', { name: 'Made with Natural Earth' })).toHaveCount(1)
        await expect(page.getByRole('link', { name: '© Contributeurs OpenStreetMap' })).toHaveCount(0)
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('project-background-color');
        await expect(page.getByRole('link', { name: '© Contributeurs OpenStreetMap' })).toHaveCount(0)
        await expect(page.getByRole('link', { name: 'Made with Natural Earth' })).toHaveCount(0)
    });

    test('Mixin attribution', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=axis_orientation_neu_3044';
        await gotoMap(url, page)

        // No attributions
        await expect(page.getByRole('link', { name: '© Contributeurs OpenStreetMap' })).toHaveCount(0)
        await expect(page.getByText('Attribution for this layer is')).toHaveCount(0)
        await expect(page.getByRole('link', { name: 'Made with Natural Earth' })).toHaveCount(0)

        // Same attribution display once (thanks to OpenLayers)
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('OpenStreetMap');
        await page.getByLabel('Bundesländer').check();
        await expect(page.getByRole('link', { name: '© Contributeurs OpenStreetMap' })).toHaveCount(1)
        await expect(page.getByText('Attribution for this layer is')).toHaveCount(0)
        await expect(page.getByRole('link', { name: 'Made with Natural Earth' })).toHaveCount(0)

        // Change base layer
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('world-background');
        await expect(page.getByRole('link', { name: 'Made with Natural Earth' })).toHaveCount(1)
        await expect(page.getByText('Attribution for this layer is')).toHaveCount(0)
        await expect(page.getByRole('link', { name: '© Contributeurs OpenStreetMap' })).toHaveCount(1)

        // Same attribution display once (thanks to OpenLayers)
        await page.getByLabel('Bundesländer').uncheck();
        await page.getByLabel('world').check();
        await expect(page.getByRole('link', { name: 'Made with Natural Earth' })).toHaveCount(1)
        await expect(page.getByText('Attribution for this layer is')).toHaveCount(0)
        await expect(page.getByRole('link', { name: '© Contributeurs OpenStreetMap' })).toHaveCount(0)
    });
})
