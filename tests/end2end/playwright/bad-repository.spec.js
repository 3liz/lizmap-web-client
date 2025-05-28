// @ts-check
import { test, expect } from '@playwright/test';
import { getAuthStorageStatePath } from './globals';
import {AdminPage} from "./pages/admin";

test.describe('Bad repository in conf', () => {

    test.use({ storageState: getAuthStorageStatePath('admin') });

    test.beforeEach(async ({ page }) => {
        // Go to repos page
        await page.goto('/admin.php/admin/maps', { waitUntil: 'networkidle' });
        const adminPage = new AdminPage(page);
        await adminPage.checkPage('Maps management');
    });

    test('Badge displayed for bad repository', async ({ page }) => {
        await expect(page.locator('legend').filter({ hasText: 'badrepository' })).toBeVisible();
        await expect(page.locator('legend').filter({ hasText: 'badrepository' }).getByText('Path not found')).toBeVisible();
    });
});
