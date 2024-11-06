// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Tooltip', () => {

    test('Test HTML template', async ({ page }) => {
        const url = '/index.php/view/map?repository=testsrepository&project=tooltip';
        await gotoMap(url, page);
        await page.locator('#button-tooltip-layer').click();

        await page.locator('#tooltip-layer').getByRole('combobox').selectOption('quartiers');
        // To be continued
    });

    test('Test fields', async ({ page }) => {
        const url = '/index.php/view/map?repository=testsrepository&project=tooltip';
        await gotoMap(url, page);
        await page.locator('#button-tooltip-layer').click();

        await page.locator('#tooltip-layer').getByRole('combobox').selectOption('quartiers-fields');
        // TODO to be fixed
        await expect(page.locator('#message')).toBeVisible();
    });

});
