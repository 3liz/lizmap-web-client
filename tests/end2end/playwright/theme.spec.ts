import { test, expect } from '@playwright/test';

test.describe('Theme', () => {
    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=theme';
        await page.goto(url, { waitUntil: 'networkidle' });
    });

    test('must display theme1 at startup', async ({ page }) => {
        await expect(page.locator('#theme-selector > ul > li.theme').first()).toHaveClass(/selected/);

        // Expanded
        await expect(page.locator('lizmap-treeview > ul > li:nth-child(1) > div.expandable')).not.toHaveClass(/expanded/);
        await expect(page.locator('lizmap-treeview > ul > li:nth-child(2) > div.expandable')).not.toHaveClass(/expanded/);

        // Checked
        await expect(page.getByLabel('group1')).toBeChecked();
        await expect(page.getByLabel('Les quartiers')).toBeChecked();

        // Style
        await page.locator('lizmap-treeview > ul > li:nth-child(2) > div.checked.layer > div.node > div > i').click({force:true});
        expect(await page.locator('#sub-dock select.styleLayer').inputValue()).toBe('style1');
    });

    test('must display theme2 when selected', async ({ page }) => {
        // Select theme2
        await page.locator('#theme-selector > button').click()
        await page.locator('#theme-selector > ul > li.theme').nth(1).click();

        // Expanded
        await expect(page.locator('lizmap-treeview > ul > li:nth-child(1) > div.expandable')).toHaveClass(/expanded/);
        await expect(page.locator('lizmap-treeview > ul > li:nth-child(2) > div.expandable')).toHaveClass(/expanded/);

        // Checked
        await expect(page.getByLabel('group1')).not.toBeChecked();
        await expect(page.getByLabel('Les quartiers')).toBeChecked();

        // Style
        await page.locator('lizmap-treeview > ul > li:nth-child(2) > div.checked.layer > div.node > div > i').click({force:true});
        expect(await page.locator('#sub-dock select.styleLayer').inputValue()).toBe('style2');
    });
});