// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Bad repository in conf', () => {

    test.use({ storageState: 'playwright/.auth/admin.json' });

    test.beforeEach(async ({ page }) => {
        // Go to repos page
        await page.goto('/admin.php/admin/maps', { waitUntil: 'networkidle' });
    });

    test('Badge displayed for bad repository', async ({ page }) => {
        await expect(page.locator('legend').filter({ hasText: 'badrepository' })).toBeVisible();
        await expect(page.locator('legend').filter({ hasText: 'badrepository' }).getByText('Path not found')).toBeVisible();
    });
});
