// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Maps management', () => {

    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('OpenLayers', async ({ page }) => {
        // Allow themes/javascript codes for tests repository
        await page.goto('admin.php');
        await page.getByRole('link', { name: 'Maps management' }).click();
        await page.getByRole('link', { name: 'Modify' }).first().click();
        await page.getByText('Allow themes/javascript codes for this repository', { exact: true }).click();
        await page.getByRole('button', { name: 'Save' }).click();

        await page.goto('index.php');

        const url = '/index.php/view/map/?repository=testsrepository&project=world-3857';
        await page.goto(url, { waitUntil: 'networkidle' });

        await page.evaluate(() => {addOlLayers()})
        await page.waitForTimeout(1000);
        await expect(page.getByText('wms4326')).toBeVisible();
        await expect(page.getByText('states')).toBeVisible();
        await expect(page.getByText('VectorTile')).toBeVisible();
        await page.waitForTimeout(1000);
        await page.evaluate(() => {removeOlLayers()})
        await page.waitForTimeout(1000);
        await expect(page.getByText('wms4326')).not.toBeVisible();
        await expect(page.getByText('states')).not.toBeVisible();
        await expect(page.getByText('VectorTile')).not.toBeVisible();

        // Disallow themes/javascript codes for tests repository
        await page.goto('admin.php');
        await page.getByRole('link', { name: 'Maps management' }).click();
        await page.getByRole('link', { name: 'Modify' }).first().click();
        await page.getByText('Allow themes/javascript codes for this repository', { exact: true }).click();
        await page.getByRole('button', { name: 'Save' }).click();

        await page.goto('index.php');
    })
})
