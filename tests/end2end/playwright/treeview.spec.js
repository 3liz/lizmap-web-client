// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Treeview', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=treeview';
        await page.goto(url, { waitUntil: 'networkidle' });
    });

    test('layer/group visibility UI', async ({ page }) => {
        await expect(page.getByTestId('subdistricts')).toHaveClass('not-visible');

        // zoom to display 'subdistricts' layer defined with scale dependent visibility (minimum 1:51000)
        await page.locator('.zoom-in').click();
        await expect(page.getByTestId('subdistricts')).not.toHaveClass('not-visible');

        // Disable root group visibility
        await page.getByTestId('group1').locator('> div input').click();
        await expect(page.getByTestId('sub-group1')).toHaveClass('not-visible');
        await expect(page.getByTestId('subdistricts')).toHaveClass('not-visible');

        // Disable parent group visibility
        await page.getByTestId('group1').locator('> div input').click();
        await page.getByTestId('sub-group1').locator('> div input').click();
        await expect(page.getByTestId('subdistricts')).toHaveClass('not-visible');

        // Disable layer visibility
        await page.getByTestId('sub-group1').locator('> div input').click();
        await page.getByTestId('subdistricts').locator('> div input').click();
        await expect(page.getByTestId('subdistricts')).toHaveClass('not-visible');
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

    test('double clicking', async ({ page }) => {
        // All group1 is checked
        await expect(page.locator('#node-group1')).toBeChecked();
        await expect(page.locator('#node-sub-group1')).toBeChecked();
        await expect(page.locator('#node-subdistricts')).toBeChecked();
        // Unchecked all group1 by double clicking the label
        await page.getByText('group1', { exact: true }).dblclick();
        // All group1 is not checked
        await expect(page.locator('#node-group1')).not.toBeChecked();
        await expect(page.locator('#node-sub-group1')).not.toBeChecked();
        await expect(page.locator('#node-subdistricts')).not.toBeChecked();
        // Checked all group1 by double clicking the input
        await page.getByLabel('group1', { exact: true }).dblclick();
        // All group1 is checked
        await expect(page.locator('#node-group1')).toBeChecked();
        await expect(page.locator('#node-sub-group1')).toBeChecked();
        await expect(page.locator('#node-subdistricts')).toBeChecked();

        // Click to uncheck group1
        await page.getByLabel('group1', { exact: true }).click();
        // Only group1 is not checked
        await expect(page.locator('#node-group1')).not.toBeChecked();
        await expect(page.locator('#node-sub-group1')).toBeChecked();
        await expect(page.locator('#node-subdistricts')).toBeChecked();
        // Double clicking sub-group1 does not change the group1 checked state
        await page.getByLabel('sub-group1', { exact: true }).dblclick();
        await expect(page.locator('#node-group1')).not.toBeChecked();
        await expect(page.locator('#node-sub-group1')).not.toBeChecked();
        await expect(page.locator('#node-subdistricts')).not.toBeChecked();
        await page.getByLabel('sub-group1', { exact: true }).dblclick();
        await expect(page.locator('#node-group1')).not.toBeChecked();
        await expect(page.locator('#node-sub-group1')).toBeChecked();
        await expect(page.locator('#node-subdistricts')).toBeChecked();


        // Verify the status of mutually exclusive group
        await expect(page.getByLabel('group with space in name and shortname defined')).toBeChecked();
        await expect(page.locator('#node-quartiers')).toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).not.toBeChecked();
        // Unchecked all mutually exclusive group by double clicking the label
        await page.getByText('group with space in name and shortname defined').dblclick();
        await expect(page.getByLabel('group with space in name and shortname defined')).not.toBeChecked();
        await expect(page.locator('#node-quartiers')).not.toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).not.toBeChecked();
        // Checked all mutually exclusive group by double clicking the label, only the first child is clicked
        await page.getByLabel('group with space in name and shortname defined').dblclick();
        await expect(page.getByLabel('group with space in name and shortname defined')).toBeChecked();
        await expect(page.locator('#node-quartiers')).toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).not.toBeChecked();
        // switch visibility in mutually exclusive group
        await page.locator('#node-shop_bakery_pg').click();
        await expect(page.getByLabel('group with space in name and shortname defined')).toBeChecked();
        await expect(page.locator('#node-quartiers')).not.toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).toBeChecked();
        // Unchecked all mutually exclusive group by double clicking the label
        await page.getByText('group with space in name and shortname defined').dblclick();
        await expect(page.getByLabel('group with space in name and shortname defined')).not.toBeChecked();
        await expect(page.locator('#node-quartiers')).not.toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).not.toBeChecked();
        // Checked all mutually exclusive group by double clicking the label, only the first child is clicked
        await page.getByLabel('group with space in name and shortname defined').dblclick();
        await expect(page.getByLabel('group with space in name and shortname defined')).toBeChecked();
        await expect(page.locator('#node-quartiers')).toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).not.toBeChecked();
    });
});

test.describe('Treeview mocked with "Hide checkboxes for groups" option', () => {
    test('"Hide checkboxes for groups" option', async ({ page }) => {
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['hideGroupCheckbox'] = 'True';
            await route.fulfill({ response, json });
        });

        const url = '/index.php/view/map/?repository=testsrepository&project=treeview';
        await page.goto(url, { waitUntil: 'networkidle' });

        await expect(page.locator('lizmap-treeview div.group > input')).toHaveCount(0);
    });
});
