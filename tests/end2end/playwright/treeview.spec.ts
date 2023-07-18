import { test, expect } from '@playwright/test';

test.describe('Treeview', () => {
    test('displays mutually exclusive group', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=treeview';
        await page.goto(url, { waitUntil: 'networkidle' });

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
});