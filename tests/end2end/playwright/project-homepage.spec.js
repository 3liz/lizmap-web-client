// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Projects homepage @readonly', function () {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/';
        await page.goto(url, { waitUntil: 'networkidle' });
    });

    test('should display project metadata (cold cache)', async function ({ page }) {

        let project = page.locator(
            '.liz-repository-project-item'
        ).filter(
            { hasText: 'Test tags: nature, flower' }
        ).locator('.liz-project');

        await expect(project).toHaveAttribute(
            "data-lizmap-proj",'EPSG:4326');
        await expect(project).toHaveAttribute(
            "data-lizmap-bbox", '-1.2459627329192546, -1.0, 1.2459627329192546, 1.0');
        await expect(project).toHaveAttribute(
            "data-lizmap-keywords", 'nature, flower');
        await expect(project).toHaveAttribute(
            "data-lizmap-title", 'Test tags: nature, flower');

        const allMetadata = await project.locator('.liz-project-desc');
        await expect(allMetadata).not.toBeVisible();

        await project.hover();
        // await expect(allMetadata).toBeVisible();
        await expect(allMetadata.locator('.title')).toContainText('Test tags: nature, flower');
        await expect(allMetadata.locator('.abstract')).toContainText('This is an abstract');
        await expect(allMetadata.locator('.keywordList')).toContainText('nature, flower');

        // hover on header
        await page.locator('#headermenu').hover();
        await expect(allMetadata).not.toBeVisible();

        // another project
        project = page.locator(
            '.liz-repository-project-item'
        ).filter(
            { hasText: 'Tests tags: nature, tree' }
        ).locator('.liz-project');

        await expect(project).toHaveAttribute(
            "data-lizmap-proj",'EPSG:4326');
        await expect(project).toHaveAttribute(
            "data-lizmap-bbox", '-1.2459627329192546, -1.0, 1.2459627329192546, 1.0');
        await expect(project).toHaveAttribute(
            "data-lizmap-keywords", 'nature, tree');
        await expect(project).toHaveAttribute(
            "data-lizmap-title", 'Tests tags: nature, tree');

        const allMetadataTree = project.locator('.liz-project-desc');
        await expect(allMetadataTree).not.toBeVisible();

        await project.hover();
        // await expect(allMetadataTree).toBeVisible();
        await expect(allMetadataTree.locator('.title')).toContainText('Tests tags: nature, tree');
        await expect(allMetadataTree.locator('.abstract')).toContainText('Tags: nature, tree');
        await expect(allMetadataTree.locator('.keywordList')).toContainText('nature, tree');

        // hover on header
        await page.locator('#headermenu').hover();
        await expect(allMetadataTree).not.toBeVisible();

    });

    test('should display project metadata (hot cache)', async function ({ page }) {

        const project = page.locator(
            '.liz-repository-project-item'
        ).filter(
            { hasText: 'Test tags: nature, flower' }
        ).locator('.liz-project');

        await expect(project).toHaveAttribute(
            "data-lizmap-proj",'EPSG:4326');
        await expect(project).toHaveAttribute(
            "data-lizmap-bbox", '-1.2459627329192546, -1.0, 1.2459627329192546, 1.0');
        await expect(project).toHaveAttribute(
            "data-lizmap-keywords", 'nature, flower');
        await expect(project).toHaveAttribute(
            "data-lizmap-title", 'Test tags: nature, flower');
        const allMetadata = project.locator('.liz-project-desc');
        await expect(allMetadata).not.toBeVisible();

        await project.hover();
        // await expect(allMetadata).toBeVisible();
        await expect(allMetadata.locator('.title')).toContainText('Test tags: nature, flower');
        await expect(allMetadata.locator('.abstract')).toContainText('This is an abstract');
        await expect(allMetadata.locator('.keywordList')).toContainText('nature, flower');

        // hover on header
        await page.locator('#headermenu').hover();
        await expect(allMetadata).not.toBeVisible();

    });
});
