// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Projects homepage @readonly', function () {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/';
        await page.goto(url, { waitUntil: 'networkidle' });
    });

    test('should have project metadata', async function ({ page }) {

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
        await expect(project).toHaveAttribute(
            "data-lizmap-abstract", 'This is an abstract');

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
        await expect(project).toHaveAttribute(
            "data-lizmap-abstract", 'Tags: nature, tree');
    });
});
