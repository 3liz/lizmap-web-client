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

        // The url has been updated
        const url = new URL(page.url());
        await expect(url.hash).not.toHaveLength(1);
        // The decoded hash is
        // #3.730872,43.540386,4.017985,43.679557
        // |group1,Les%20quartiers
        // |,style1
        // |1,1
        await expect(url.hash).toMatch(/#3.7308\d+,43.5403\d+,4.0179\d+,43.6795\d+\|/)
        await expect(url.hash).toContain('|group1,Les%20quartiers|,style1|1,1')
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

        // The url has been updated
        const url = new URL(page.url());
        await expect(url.hash).not.toHaveLength(0);
        // The decoded hash is
        // #3.730872,43.540386,4.017985,43.679557
        // |Les%20quartiers|style2|1
        // |style2
        // |1
        await expect(url.hash).toMatch(/#3.7308\d+,43.5403\d+,4.0179\d+,43.6795\d+\|/)
        await expect(url.hash).toContain('|Les%20quartiers|style2|1')
    });
});
