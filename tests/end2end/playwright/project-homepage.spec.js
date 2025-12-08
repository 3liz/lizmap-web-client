// @ts-check
import { test, expect } from '@playwright/test';
import { getAuthStorageStatePath } from './globals';
import { HomePage } from "./pages/homepage";

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
        await expect(project).toHaveAttribute(
            "data-lizmap-abstract", 'This is an abstract');

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
        await expect(project).toHaveAttribute(
            "data-lizmap-abstract", 'Tags: nature, tree');

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
        await expect(project).toHaveAttribute(
            "data-lizmap-abstract", 'This is an abstract');
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

test.describe('Projects homepage - search - @readonly', function () {
    test('should search in title', async function ({ page }) {
        const homePage = new HomePage(page);
        await homePage.open();

        // Check that toggle search button is in the title search state
        await expect(homePage.toggleSearch).toHaveText('T');
        // Clear the search input
        await homePage.search.clear();
        // The home page displays more than 2 projects
        const totalProjects = await homePage.page.locator('.liz-repository-project-item:visible').count();
        expect(totalProjects).toBeGreaterThan(2);

        // Insert valid value in search input with keyboard
        await homePage.search.focus();
        await page.keyboard.type('nature');
        // CHeck the number of title projects that contains the serach value
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(2);
        // Clear the search input
        await homePage.search.clear();
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(totalProjects);

        // Insert invalid value in search input with keyboard
        await homePage.search.focus();
        await page.keyboard.type('naturee');
        // CHeck the number of title projects that contains the serach value
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(0);
        // Clear the search input
        await homePage.search.clear();
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(totalProjects);
    });

    test('should search by tag', async function ({ page }) {
        const homePage = new HomePage(page);
        await homePage.open();

        // Check that toggle search button is in the title search state
        await expect(homePage.toggleSearch).toHaveText('T');
        // Search empty
        await expect(homePage.search).toHaveValue('');
        // The home page displays more than 2 projects
        const totalProjects = await homePage.page.locator('.liz-repository-project-item:visible').count();
        expect(totalProjects).toBeGreaterThan(2);
        // Keywords has not been displayed
        await expect(homePage.searchKeywords).toBeHidden();
        await expect(homePage.searchKeywordsResult).toBeHidden();
        await expect(homePage.searchKeywordsSelected).toBeHidden();
        // Total keywords
        await expect(homePage.searchKeywordsItems).toHaveCount(3);
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(0);
        await expect(homePage.searchKeywordsSelectedItems).toHaveCount(0);

        // Toggle the search
        await homePage.toggleSearch.click();
        // Check that toggle search button is in the tag search state
        await expect(homePage.toggleSearch).toHaveText('#');
        // Search empty
        await expect(homePage.search).toHaveValue('');
        // Keywords has not been displayed yet
        await expect(homePage.searchKeywords).toBeHidden();
        await expect(homePage.searchKeywordsResult).toBeHidden();
        await expect(homePage.searchKeywordsSelected).toBeHidden();
        // Clear the search input
        await homePage.search.clear();

        // Insert valid value in search input with keyboard
        await homePage.search.focus();
        await page.keyboard.type('nature');
        // Search by tag as not been performed yet
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(totalProjects);
        // Keywords has been displayed
        await expect(homePage.searchKeywords).toBeVisible();
        await expect(homePage.searchKeywordsResult).toBeVisible();
        await expect(homePage.searchKeywordsSelected).toBeHidden();
        // Only one keyword is diplayed
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(1);
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveText('nature');

        // Select a keyword
        await homePage.searchKeywordsItems.locator(':visible').click();
        // Search has been cleared
        await expect(homePage.search).toHaveValue('');
        // Selected keywords is displayed with one item visible
        await expect(homePage.searchKeywordsSelected).toBeVisible();
        await expect(homePage.searchKeywordsSelectedItems).toHaveCount(1);
        await expect(homePage.searchKeywordsSelectedItems.filter({visible: true})).toHaveCount(1);
        await expect(homePage.searchKeywordsSelectedItems.locator('.keyword-label')).toHaveText('nature');
        // All other tags are displayed
        await expect(homePage.searchKeywordsResult).toBeVisible();
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(2);
        // Projects filtered
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(2);
        await expect(homePage.page.locator('.liz-repository-project-item:visible .liz-project-title'))
            .toHaveText([/nature/, /nature/]);

        // Reset filter by tag
        await homePage.searchKeywordsSelectedItems.filter({visible: true}).locator('.remove-keyword').click();
        // Projects unfiltered
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(totalProjects);
        // Search empty
        await expect(homePage.search).toHaveValue('');
        // Keywords has not been displayed
        await expect(homePage.searchKeywords).toBeHidden();
        await expect(homePage.searchKeywordsResult).toBeHidden();
        await expect(homePage.searchKeywordsSelected).toBeHidden();
        // Total keywords
        await expect(homePage.searchKeywordsItems).toHaveCount(3);
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(0);
        await expect(homePage.searchKeywordsSelectedItems).toHaveCount(0);

        // Perform a new tag search
        await homePage.search.focus();
        await page.keyboard.type('tree');
        // Keywords has been displayed
        await expect(homePage.searchKeywords).toBeVisible();
        await expect(homePage.searchKeywordsResult).toBeVisible();
        await expect(homePage.searchKeywordsSelected).toBeHidden();
        // Only one keyword is diplayed
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(1);
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveText('tree');

        // Select a keyword
        await homePage.searchKeywordsItems.locator(':visible').click();
        // Search has been cleared
        await expect(homePage.search).toHaveValue('');
        // Selected keywords is displayed with one item visible
        await expect(homePage.searchKeywordsSelected).toBeVisible();
        await expect(homePage.searchKeywordsSelectedItems).toHaveCount(1);
        await expect(homePage.searchKeywordsSelectedItems.filter({visible: true})).toHaveCount(1);
        await expect(homePage.searchKeywordsSelectedItems.locator('.keyword-label')).toHaveText('tree');
        // Only one other tag is displayed
        await expect(homePage.searchKeywordsResult).toBeVisible();
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(1);
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveText('nature');
        // Projects filtered
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(1);
        await expect(homePage.page.locator('.liz-repository-project-item:visible .liz-project-title')).toHaveText(/tree/);
        await expect(homePage.page.locator('.liz-repository-project-item:visible .liz-project-title')).toHaveText(/nature/);

        // Reset filter by tag
        await homePage.searchKeywordsSelectedItems.filter({visible: true}).locator('.remove-keyword').click();
        // Projects unfiltered
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(totalProjects);
        // Search empty
        await expect(homePage.search).toHaveValue('');
        // Keywords has not been displayed
        await expect(homePage.searchKeywords).toBeHidden();
        await expect(homePage.searchKeywordsResult).toBeHidden();
        await expect(homePage.searchKeywordsSelected).toBeHidden();
        // Total keywords
        await expect(homePage.searchKeywordsItems).toHaveCount(3);
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(0);
        await expect(homePage.searchKeywordsSelectedItems).toHaveCount(0);

        // Perform a new tag search
        await homePage.search.focus();
        await page.keyboard.type('flower');
        // Keywords has been displayed
        await expect(homePage.searchKeywords).toBeVisible();
        await expect(homePage.searchKeywordsResult).toBeVisible();
        await expect(homePage.searchKeywordsSelected).toBeHidden();
        // Only one keyword is diplayed
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(1);
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveText('flower');

        // Select a keyword
        await homePage.searchKeywordsItems.locator(':visible').click();
        // Search has been cleared
        await expect(homePage.search).toHaveValue('');
        // Selected keywords is displayed with one item visible
        await expect(homePage.searchKeywordsSelected).toBeVisible();
        await expect(homePage.searchKeywordsSelectedItems).toHaveCount(1);
        await expect(homePage.searchKeywordsSelectedItems.filter({visible: true})).toHaveCount(1);
        await expect(homePage.searchKeywordsSelectedItems.locator('.keyword-label')).toHaveText('flower');
        // Only one other tag is displayed
        await expect(homePage.searchKeywordsResult).toBeVisible();
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(1);
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveText('nature');
        // Projects filtered
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(1);
        await expect(homePage.page.locator('.liz-repository-project-item:visible .liz-project-title')).toHaveText(/flower/);
        await expect(homePage.page.locator('.liz-repository-project-item:visible .liz-project-title')).toHaveText(/nature/);

        // Reset filter by tag
        await homePage.searchKeywordsSelectedItems.filter({visible: true}).locator('.remove-keyword').click();
        // Projects unfiltered
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(totalProjects);
        // Search empty
        await expect(homePage.search).toHaveValue('');
        // Keywords has not been displayed
        await expect(homePage.searchKeywords).toBeHidden();
        await expect(homePage.searchKeywordsResult).toBeHidden();
        await expect(homePage.searchKeywordsSelected).toBeHidden();
        // Total keywords
        await expect(homePage.searchKeywordsItems).toHaveCount(3);
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(0);
        await expect(homePage.searchKeywordsSelectedItems).toHaveCount(0);
    });

    test('should search by tags', async function ({ page }) {
        const homePage = new HomePage(page);
        await homePage.open();

        // Check that toggle search button is in the title search state
        await expect(homePage.toggleSearch).toHaveText('T');
        // Search empty
        await expect(homePage.search).toHaveValue('');
        // The home page displays more than 2 projects
        const totalProjects = await homePage.page.locator('.liz-repository-project-item:visible').count();
        expect(totalProjects).toBeGreaterThan(2);
        // Keywords has not been displayed
        await expect(homePage.searchKeywords).toBeHidden();
        await expect(homePage.searchKeywordsResult).toBeHidden();
        await expect(homePage.searchKeywordsSelected).toBeHidden();
        // Total keywords
        await expect(homePage.searchKeywordsItems).toHaveCount(3);
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(0);
        await expect(homePage.searchKeywordsSelectedItems).toHaveCount(0);

        // Toggle the search
        await homePage.toggleSearch.click();
        // Check that toggle search button is in the tag search state
        await expect(homePage.toggleSearch).toHaveText('#');
        // Search empty
        await expect(homePage.search).toHaveValue('');
        // Keywords has not been displayed yet
        await expect(homePage.searchKeywords).toBeHidden();
        await expect(homePage.searchKeywordsResult).toBeHidden();
        await expect(homePage.searchKeywordsSelected).toBeHidden();
        // Clear the search input
        await homePage.search.clear();

        // Insert valid value in search input with keyboard
        await homePage.search.focus();
        await page.keyboard.type('nature');
        // Search by tag as not been performed yet
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(totalProjects);
        // Keywords has been displayed
        await expect(homePage.searchKeywords).toBeVisible();
        await expect(homePage.searchKeywordsResult).toBeVisible();
        await expect(homePage.searchKeywordsSelected).toBeHidden();
        // Only one keyword is diplayed
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(1);
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveText('nature');

        // Select a keyword
        await homePage.searchKeywordsItems.locator(':visible').click();
        // Search has been cleared
        await expect(homePage.search).toHaveValue('');
        // Selected keywords is displayed with one item visible
        await expect(homePage.searchKeywordsSelected).toBeVisible();
        await expect(homePage.searchKeywordsSelectedItems).toHaveCount(1);
        await expect(homePage.searchKeywordsSelectedItems.filter({visible: true})).toHaveCount(1);
        await expect(homePage.searchKeywordsSelectedItems.locator('.keyword-label')).toHaveText('nature');
        // All other tags are displayed
        await expect(homePage.searchKeywordsResult).toBeVisible();
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(2);
        // Projects filtered
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(2);

        // Select another keyword, the first
        await homePage.searchKeywordsItems.filter({visible: true}).first().click();
        // Search is still cleared
        await expect(homePage.search).toHaveValue('');
        // Selected keywords is displayed with two item visible
        await expect(homePage.searchKeywordsSelected).toBeVisible();
        await expect(homePage.searchKeywordsSelectedItems).toHaveCount(2);
        await expect(homePage.searchKeywordsSelectedItems.filter({visible: true})).toHaveCount(2);
        await expect(homePage.searchKeywordsSelectedItems.first().locator('.keyword-label')).toHaveText('nature');
        await expect(homePage.searchKeywordsSelectedItems.last().locator('.keyword-label')).toHaveText('flower');
        // None other tags are displayed
        await expect(homePage.searchKeywordsResult).toBeHidden();
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(0);
        // Projects filtered
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(1);
        await expect(homePage.page.locator('.liz-repository-project-item:visible .liz-project-title')).toHaveText(/nature/);
        await expect(homePage.page.locator('.liz-repository-project-item:visible .liz-project-title')).toHaveText(/flower/);

        // Unselect the second tag
        await homePage.searchKeywordsSelectedItems.filter({visible: true}).last().locator('.remove-keyword').click();
        // Search is still cleared
        await expect(homePage.search).toHaveValue('');
        // Selected keywords is displayed with one item visible
        await expect(homePage.searchKeywordsSelected).toBeVisible();
        await expect(homePage.searchKeywordsSelectedItems).toHaveCount(1);
        await expect(homePage.searchKeywordsSelectedItems.filter({visible: true})).toHaveCount(1);
        await expect(homePage.searchKeywordsSelectedItems.locator('.keyword-label')).toHaveText('nature');
        // All other tags are displayed
        await expect(homePage.searchKeywordsResult).toBeVisible();
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(2);
        // Projects filtered
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(2);

        // Select another keyword, the last
        await homePage.searchKeywordsItems.filter({visible: true}).last().click();
        // Search is still cleared
        await expect(homePage.search).toHaveValue('');
        // Selected keywords is displayed with two item visible
        await expect(homePage.searchKeywordsSelected).toBeVisible();
        await expect(homePage.searchKeywordsSelectedItems).toHaveCount(2);
        await expect(homePage.searchKeywordsSelectedItems.filter({visible: true})).toHaveCount(2);
        await expect(homePage.searchKeywordsSelectedItems.first().locator('.keyword-label')).toHaveText('nature');
        await expect(homePage.searchKeywordsSelectedItems.last().locator('.keyword-label')).toHaveText('tree');
        // None other tags are displayed
        await expect(homePage.searchKeywordsResult).toBeHidden();
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(0);
        // Projects filtered
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(1);
        await expect(homePage.page.locator('.liz-repository-project-item:visible .liz-project-title')).toHaveText(/nature/);
        await expect(homePage.page.locator('.liz-repository-project-item:visible .liz-project-title')).toHaveText(/tree/);

        // Unselect the first tag
        await homePage.searchKeywordsSelectedItems.filter({visible: true}).first().locator('.remove-keyword').click();
        // Search is still cleared
        await expect(homePage.search).toHaveValue('');
        // Selected keywords is displayed with one item visible
        await expect(homePage.searchKeywordsSelected).toBeVisible();
        await expect(homePage.searchKeywordsSelectedItems).toHaveCount(1);
        await expect(homePage.searchKeywordsSelectedItems.filter({visible: true})).toHaveCount(1);
        await expect(homePage.searchKeywordsSelectedItems.locator('.keyword-label')).toHaveText('tree');
        // Projects filtered, but still the same one
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(1);
        await expect(homePage.page.locator('.liz-repository-project-item:visible .liz-project-title')).toHaveText(/tree/);
        await expect(homePage.page.locator('.liz-repository-project-item:visible .liz-project-title')).toHaveText(/nature/);

        // Unselect the last selected tag
        await homePage.searchKeywordsSelectedItems.filter({visible: true}).locator('.remove-keyword').click();
        // Projects unfiltered
        await expect(homePage.page.locator('.liz-repository-project-item:visible')).toHaveCount(totalProjects);
        // Search empty
        await expect(homePage.search).toHaveValue('');
        // Keywords has not been displayed
        await expect(homePage.searchKeywords).toBeHidden();
        await expect(homePage.searchKeywordsResult).toBeHidden();
        await expect(homePage.searchKeywordsSelected).toBeHidden();
        // Total keywords
        await expect(homePage.searchKeywordsItems).toHaveCount(3);
        await expect(homePage.searchKeywordsItems.filter({visible: true})).toHaveCount(0);
        await expect(homePage.searchKeywordsSelectedItems).toHaveCount(0);
    });
});

test.describe('Projects homepage - hide_project - @readonly', function () {
    [
        { login: 'anonymous' },
        { login: 'user_in_group_a' },
        { login: 'admin' },
    ].forEach(({ login }) => {
        test(`hide_project has to never been displayed - ${login}`, async function({ browser }) {
            let context;
            if (login !== 'anonymous') {
                context = await browser.newContext({storageState: getAuthStorageStatePath(login)});
            } else {
                context = await browser.newContext();
            }
            const homePage = new HomePage(await context.newPage());
            await homePage.open();

            for (const title of await homePage.page.locator('.liz-repository-project-item:visible .liz-project-title').all()) {
                await expect(title).not.toHaveText(/hide_project/);
            }

            await expect(
                homePage.page.locator(
                    '.liz-repository-project-item:visible .liz-project-title'
                ).filter(
                    { hasText: 'hide_project' }
                )).toHaveCount(0);

            await expect(
                homePage.page.locator(
                    '.liz-repository-project-item .liz-project-title'
                ).filter(
                    { hasText: 'hide_project' }
                )).toHaveCount(0);

            const page = await context.newPage();
            await page.goto('/index.php/view/map/?repository=testsrepository&project=hide_project');
            // Check Page back to home page
            await expect(page).toHaveURL(/.*index.php$/);
            await expect(page.locator('#content div.alert.alert-danger')).toHaveCount(1);
            await expect(page.locator('#content div.alert.alert-danger')).toHaveText('Access denied for this project.');
        });
    });
});
