// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Projects homepage', function () {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/';
        await page.goto(url, { waitUntil: 'networkidle' });
    });

    test('should display project metadata (cold cache)', async function ({ page }) {

        const allmetadata = page.locator('.liz-project-desc').filter({ hasText: 'Test tags: nature, flower' });
        await expect(allmetadata).not.toBeVisible();

        await page.getByRole('link').filter({ has: allmetadata }).hover();
        await expect(allmetadata).toBeVisible();
        await expect(allmetadata.locator('.title')).toContainText('Test tags: nature, flower');
        await expect(allmetadata.locator('.abstract')).toContainText('This is an abstract');
        await expect(allmetadata.locator('.keywordList')).toContainText('nature, flower');
        await expect(allmetadata.locator('.proj')).toContainText('EPSG:4326');
        await expect(allmetadata.locator('.bbox')).toContainText('-1.2459627329192546, -1.0, 1.2459627329192546, 1.0');

        // hover on header
        await page.locator('#headermenu').hover();
        await expect(allmetadata).not.toBeVisible();

        // another project
        const allmetadataTree = page.locator('.liz-project-desc').filter({ hasText: 'Tests tags: nature, tree' });
        await expect(allmetadataTree).not.toBeVisible();

        await page.getByRole('link').filter({ has: allmetadataTree }).hover();
        await expect(allmetadataTree).toBeVisible();
        await expect(allmetadataTree.locator('.title')).toContainText('Tests tags: nature, tree');
        await expect(allmetadataTree.locator('.abstract')).toContainText('Tags: nature, tree');
        await expect(allmetadataTree.locator('.keywordList')).toContainText('nature, tree');
        await expect(allmetadataTree.locator('.proj')).toContainText('EPSG:4326');
        await expect(allmetadataTree.locator('.bbox')).toContainText('-1.2459627329192546, -1.0, 1.2459627329192546, 1.0');

        // hover on header
        await page.locator('#headermenu').hover();
        await expect(allmetadataTree).not.toBeVisible();

    });

    test('should display project metadata (hot cache)', async function ({ page }) {


        const allmetadata = page.locator('.liz-project-desc').filter({ hasText: 'Test tags: nature, flower' });
        await expect(allmetadata).not.toBeVisible();

        await page.getByRole('link').filter({ has: allmetadata }).hover();
        await expect(allmetadata).toBeVisible();
        await expect(allmetadata.locator('.title')).toContainText('Test tags: nature, flower');
        await expect(allmetadata.locator('.abstract')).toContainText('This is an abstract');
        await expect(allmetadata.locator('.keywordList')).toContainText('nature, flower');
        await expect(allmetadata.locator('.proj')).toContainText('EPSG:4326');
        await expect(allmetadata.locator('.bbox')).toContainText('-1.2459627329192546, -1.0, 1.2459627329192546, 1.0');

        // hover on header
        await page.locator('#headermenu').hover();
        await expect(allmetadata).not.toBeVisible();

    });
});
