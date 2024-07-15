// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Theme', () => {
    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=theme';
        await gotoMap(url, page)
    });

    test('must display theme1 at startup', async ({ page }) => {
        await expect(page.locator('#theme-selector .dropdown-item').first()).toHaveClass(/active/);

        // Expanded
        await expect(page.locator('lizmap-treeview > ul > li:nth-child(1) > div.expandable')).not.toHaveClass(/expanded/);
        await expect(page.locator('lizmap-treeview > ul > li:nth-child(2) > div.expandable')).not.toHaveClass(/expanded/);

        // Checked
        await expect(page.getByLabel('group1')).toBeChecked();
        await expect(page.getByLabel('Les quartiers')).toBeChecked();

        // Style
        await page.locator('lizmap-treeview > ul > li:nth-child(2) > div.checked.layer > div.node > div > i').click({ force: true });
        expect(await page.locator('#sub-dock select.styleLayer').inputValue()).toBe('style1');

        // The url has not been updated
        const url = new URL(page.url());
        await expect(url.hash).toHaveLength(0);
    });

    test('must display theme2 when active', async ({ page }) => {
        // Select theme2
        await page.locator('#theme-selector > button').click()
        await page.locator('#theme-selector .dropdown-item').nth(1).click();

        // Expanded
        await expect(page.locator('lizmap-treeview > ul > li:nth-child(1) > div.expandable')).toHaveClass(/expanded/);
        await expect(page.locator('lizmap-treeview > ul > li:nth-child(2) > div.expandable')).toHaveClass(/expanded/);

        // Checked
        await expect(page.getByLabel('group1')).not.toBeChecked();
        await expect(page.getByLabel('Les quartiers')).toBeChecked();

        // Style
        await page.locator('lizmap-treeview > ul > li:nth-child(2) > div.checked.layer > div.node > div > i').click({ force: true });
        expect(await page.locator('#sub-dock select.styleLayer').inputValue()).toBe('style2');

        // The url has not been updated
        const url = new URL(page.url());
        await expect(url.hash).toHaveLength(0);
    });

    test('must display theme3 when active', async ({ page }) => {
        // Select theme3
        await page.locator('#theme-selector > button').click()
        await page.locator('#theme-selector .dropdown-item').nth(2).click();

        // Expanded
        await expect(page.locator('lizmap-treeview > ul > li:nth-child(1) > div.expandable')).not.toHaveClass(/expanded/);
        await expect(page.locator('lizmap-treeview > ul > li:nth-child(2) > div.expandable')).not.toHaveClass(/expanded/);
        await expect(page.locator('lizmap-treeview > ul > li:nth-child(3) > div.expandable')).toHaveClass(/expanded/);
        await expect(page.locator('li:nth-child(3) > ul > li > div').first()).toHaveClass(/expanded/);
        await expect(page.locator('li:nth-child(3) > ul > li > ul > li > .expandable').first()).toHaveClass(/expanded/);
        await expect(page.locator('li > ul > li:nth-child(2) > .expandable')).not.toHaveClass(/expanded/);

        // Checked
        await expect(page.getByLabel('group1')).not.toBeChecked();
        await expect(page.getByLabel('Les quartiers')).not.toBeChecked();
        await expect(page.getByLabel('group with subgroups')).toBeChecked();
        await expect(page.getByLabel('sub-group-1')).toBeChecked();
        await expect(page.getByLabel('sub-sub-group--1')).toBeChecked();
        await expect(page.getByLabel('tramway_lines')).toBeChecked();
        await expect(page.getByLabel('sub-sub-group--2')).not.toBeChecked();

        // Baselayer
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('project-background-color');
    });

    test('must display theme4 when active', async ({ page }) => {
        // Select theme4
        await page.locator('#theme-selector > button').click()
        await page.locator('#theme-selector .dropdown-item').nth(3).click();

        // Baselayer
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('OpenStreetMap');
    });

    test('mapTheme parameter', async ({ page }) => {
        await expect(page.locator('#theme-selector .dropdown-item').first()).toHaveClass(/active/);

        let url = '/index.php/view/map/?repository=testsrepository&project=theme&mapTheme=theme2';
        await gotoMap(url, page)
        await expect(page.locator('#theme-selector .dropdown-item').nth(1)).toHaveClass(/active/);

        url = '/index.php/view/map/?repository=testsrepository&project=theme&mapTheme=theme3';
        await gotoMap(url, page)
        await expect(page.locator('#theme-selector .dropdown-item').nth(2)).toHaveClass(/active/);

        url = '/index.php/view/map/?repository=testsrepository&project=theme&mapTheme=theme4';
        await gotoMap(url, page)
        await expect(page.locator('#theme-selector .dropdown-item').nth(3)).toHaveClass(/active/);
    });

});

test.describe('Theme and automatic permalink', () => {

    test.beforeEach(async ({ page }) => {
        // force automatic permalink
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['automatic_permalink'] = true;
            await route.fulfill({ response, json });
        });

        const url = '/index.php/view/map/?repository=testsrepository&project=theme';
        await gotoMap(url, page)
    });

    test('must display theme1 at startup', async ({ page }) => {
        await expect(page.locator('#theme-selector .dropdown-item').first()).toHaveClass(/active/);

        // The url has been updated
        const url = new URL(page.url());
        expect(url.hash).not.toHaveLength(0);
        // The decoded hash is
        // #3.730872,43.540386,4.017985,43.679557
        // |group1,Les%20quartiers
        // |,style1
        // |1,1
        expect(url.hash).toMatch(/#3.7308\d+,43.5403\d+,4.0179\d+,43.6795\d+\|/)
        expect(url.hash).toContain('|group1,Les%20quartiers,sub-group-1,sub-sub-group--1,sub-sub-group--2|,style1,,,|1,1,1,1,1')
    });

    test('must display theme2 when selected', async ({ page }) => {
        // Select theme2
        await page.locator('#theme-selector > button').click()
        await page.locator('#theme-selector .dropdown-item').nth(1).click();

        // The url has been updated
        const url = new URL(page.url());
        expect(url.hash).not.toHaveLength(0);
        // The decoded hash is
        // #3.730872,43.540386,4.017985,43.679557
        // |Les%20quartiers|style2|1
        // |style2
        // |1
        expect(url.hash).toMatch(/#3.7308\d+,43.5403\d+,4.0179\d+,43.6795\d+\|/)
        expect(url.hash).toContain('|Les%20quartiers|style2|1')
    });
});
