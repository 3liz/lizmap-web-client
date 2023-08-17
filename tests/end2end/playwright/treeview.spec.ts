import { test, expect } from '@playwright/test';

test.describe('Treeview', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=treeview';
        await page.goto(url, { waitUntil: 'networkidle' });
    });

    test('displays mutually exclusive group', async ({ page }) => {
        await expect(page.getByText('group with space in name and shortname defined')).toHaveCount(1);
        
        await expect(page.locator('#node-quartiers')).toHaveClass('rounded-checkbox');
        await expect(page.locator('#node-shop_bakery_pg')).toHaveClass('rounded-checkbox');

        await expect(page.locator('#node-quartiers')).toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).not.toBeChecked();

        // switch visibility
        await page.locator('#node-shop_bakery_pg').click();

        await expect(page.locator('#node-quartiers')).not.toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).toBeChecked();
    });

    test('displays "title" defined in Lizmap plugin', async ({ page }) => {
        await expect(page.getByTestId('tramway_lines').locator('label')).toHaveText('Tramway lines');
    });
});