// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'
import { expect as requestExpect } from './fixtures/expect-request.js'
import { ProjectPage } from "./pages/project";

test.describe('Theme @readonly', () => {
    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'theme');
        // Catch default GetMap
        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();
        let getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();
    });

    test('must display theme1 at startup', async ({ page }) => {
        const themeSelector = page.locator('#theme-selector');
        await expect(themeSelector.getByText('theme1')).toContainClass('active');
        await expect(themeSelector.getByText('theme2')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme3')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme4')).not.toContainClass('active');

        const treeview = page.locator('lizmap-treeview');
        // Expanded
        await expect(treeview.getByTestId('group1').locator('> div.expandable')).not.toContainClass('expanded');
        await expect(treeview.getByTestId('Les quartiers').locator('> div.expandable')).not.toContainClass('expanded');
        await expect(treeview.getByTestId('group with subgroups').locator('> div.expandable')).not.toContainClass('expanded');

        // Checked
        await expect(treeview.getByTestId('group1').getByLabel('group1')).toBeChecked();
        await expect(treeview.getByTestId('sousquartiers').getByLabel('sousquartiers')).not.toBeChecked();
        await expect(treeview.getByTestId('Les quartiers').getByLabel('Les quartiers')).toBeChecked();
        await expect(treeview.getByTestId('group with subgroups').getByLabel('group with subgroups')).not.toBeChecked();
        await expect(treeview.getByTestId('sub-group-1').getByLabel('sub-group-1')).not.toBeChecked();
        await expect(treeview.getByTestId('sub-sub-group--1').getByLabel('sub-sub-group--1')).not.toBeChecked();
        await expect(treeview.getByTestId('tramway_lines').getByLabel('tramway_lines')).not.toBeChecked();
        await expect(treeview.getByTestId('sub-sub-group--2').getByLabel('sub-sub-group--2')).not.toBeChecked();
        await expect(treeview.getByTestId('townhalls_pg').getByLabel('townhalls_pg')).not.toBeChecked();

        // Style
        await page.getByTestId('Les quartiers').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('style1');

        // Baselayer
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('project-background-color');

        // The url has not been updated
        const url = new URL(page.url());
        expect(url.hash).toHaveLength(0);
    });

    test('must display theme2 when active', async ({ page }) => {
        const project = new ProjectPage(page, 'theme');

        const themeSelector = page.locator('#theme-selector');
        await expect(themeSelector.getByText('theme1')).toContainClass('active');
        await expect(themeSelector.getByText('theme2')).not.toContainClass('active');

        // Select theme2 and catch GetMap for quartiers with style2
        await themeSelector.getByTitle('Select theme').click();
        let getMapRequestPromise = project.waitForGetMapRequest();
        themeSelector.getByText('theme2').click();
        let getMapRequest = await getMapRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'quartiers',
            'STYLES': 'style2',
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /757925.8\d+,6271017.8\d+,783272.9\d+,6287766.0\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        responseExpect(await getMapRequest.response()).toBeImagePng();

        // Check theme2 is activated and theme1 disabled
        await expect(themeSelector.getByText('theme1')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme2')).toContainClass('active');

        const treeview = page.locator('lizmap-treeview');
        // Expanded
        await expect(treeview.getByTestId('group1').locator('> div.expandable')).toContainClass('expanded');
        await expect(treeview.getByTestId('Les quartiers').locator('> div.expandable')).toContainClass('expanded');
        await expect(treeview.getByTestId('group with subgroups').locator('> div.expandable')).not.toContainClass('expanded');

        // Checked
        await expect(treeview.getByTestId('group1').getByLabel('group1')).not.toBeChecked();
        await expect(treeview.getByTestId('sousquartiers').getByLabel('sousquartiers')).not.toBeChecked();
        await expect(treeview.getByTestId('Les quartiers').getByLabel('Les quartiers')).toBeChecked();
        await expect(treeview.getByTestId('group with subgroups').getByLabel('group with subgroups')).not.toBeChecked();
        await expect(treeview.getByTestId('sub-group-1').getByLabel('sub-group-1')).not.toBeChecked();
        await expect(treeview.getByTestId('sub-sub-group--1').getByLabel('sub-sub-group--1')).not.toBeChecked();
        await expect(treeview.getByTestId('tramway_lines').getByLabel('tramway_lines')).not.toBeChecked();
        await expect(treeview.getByTestId('sub-sub-group--2').getByLabel('sub-sub-group--2')).not.toBeChecked();
        await expect(treeview.getByTestId('townhalls_pg').getByLabel('townhalls_pg')).not.toBeChecked();

        // Style
        await page.getByTestId('Les quartiers').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('style2');

        // Baselayer
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('project-background-color');

        // The url has not been updated
        const url = new URL(page.url());
        expect(url.hash).toHaveLength(0);
    });

    test('must display theme3 when active', async ({ page }) => {
        const project = new ProjectPage(page, 'theme');

        const themeSelector = page.locator('#theme-selector');
        await expect(themeSelector.getByText('theme1')).toContainClass('active');
        await expect(themeSelector.getByText('theme3')).not.toContainClass('active');

        // Select theme3 and catch GetMap for tramway_lines
        await themeSelector.getByTitle('Select theme').click();
        let getMapRequestPromise = project.waitForGetMapRequest();
        themeSelector.getByText('theme3').click();
        let getMapRequest = await getMapRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'tramway_lines',
            'STYLES': 'default',
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /757925.8\d+,6271017.8\d+,783272.9\d+,6287766.0\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        responseExpect(await getMapRequest.response()).toBeImagePng();

        // Check theme3 is activated and theme1 disabled
        await expect(themeSelector.getByText('theme1')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme3')).toContainClass('active');

        const treeview = page.locator('lizmap-treeview');
        // Expanded
        await expect(treeview.getByTestId('group1').locator('> div.expandable')).not.toContainClass('expanded');
        await expect(treeview.getByTestId('Les quartiers').locator('> div.expandable')).not.toContainClass('expanded');
        await expect(treeview.getByTestId('group with subgroups').locator('> div.expandable')).toContainClass('expanded');
        await expect(treeview.getByTestId('sub-group-1').locator('> div.expandable')).toContainClass('expanded');
        await expect(treeview.getByTestId('sub-sub-group--1').locator('> div.expandable')).toContainClass('expanded');
        await expect(treeview.getByTestId('sub-sub-group--2').locator('> div.expandable')).not.toContainClass('expanded');

        // Checked
        await expect(treeview.getByTestId('group1').getByLabel('group1')).not.toBeChecked();
        await expect(treeview.getByTestId('sousquartiers').getByLabel('sousquartiers')).not.toBeChecked();
        await expect(treeview.getByTestId('Les quartiers').getByLabel('Les quartiers')).not.toBeChecked();
        await expect(treeview.getByTestId('group with subgroups').getByLabel('group with subgroups')).toBeChecked();
        await expect(treeview.getByTestId('sub-group-1').getByLabel('sub-group-1')).toBeChecked();
        await expect(treeview.getByTestId('sub-sub-group--1').getByLabel('sub-sub-group--1')).toBeChecked();
        await expect(treeview.getByTestId('tramway_lines').getByLabel('tramway_lines')).toBeChecked();
        await expect(treeview.getByTestId('sub-sub-group--2').getByLabel('sub-sub-group--2')).not.toBeChecked();
        await expect(treeview.getByTestId('townhalls_pg').getByLabel('townhalls_pg')).toBeChecked();

        // Baselayer
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('project-background-color');

        // The url has not been updated
        const url = new URL(page.url());
        expect(url.hash).toHaveLength(0);
    });

    test('must display theme4 when active', async ({ page }) => {
        const project = new ProjectPage(page, 'theme');

        const themeSelector = page.locator('#theme-selector');
        await expect(themeSelector.getByText('theme1')).toContainClass('active');
        await expect(themeSelector.getByText('theme4')).not.toContainClass('active');

        // Select theme4 and catch GetMap for sousquartiers
        await themeSelector.getByTitle('Select theme').click();
        let getMapRequestPromise = project.waitForGetMapRequest();
        themeSelector.getByText('theme4').click();
        let getMapRequest = await getMapRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'sousquartiers',
            'STYLES': 'rule-based',
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /757925.8\d+,6271017.8\d+,783272.9\d+,6287766.0\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        responseExpect(await getMapRequest.response()).toBeImagePng();

        // Check theme4 is activated and theme1 disabled
        await expect(themeSelector.getByText('theme1')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme4')).toContainClass('active');

        const treeview = page.locator('lizmap-treeview');
        // Expanded
        await expect(treeview.getByTestId('group1').locator('> div.expandable')).toContainClass('expanded');
        await expect(treeview.getByTestId('sousquartiers').locator('> div.expandable')).toContainClass('expanded');
        await expect(treeview.getByTestId('Les quartiers').locator('> div.expandable')).not.toContainClass('expanded');
        await expect(treeview.getByTestId('group with subgroups').locator('> div.expandable')).not.toContainClass('expanded');

        // Checked
        await expect(treeview.getByTestId('group1').getByLabel('group1')).toBeChecked();
        await expect(treeview.getByTestId('sousquartiers').getByLabel('sousquartiers')).toBeChecked();
        await expect(treeview.getByTestId('Les quartiers').getByLabel('Les quartiers')).not.toBeChecked();
        await expect(treeview.getByTestId('group with subgroups').getByLabel('group with subgroups')).not.toBeChecked();
        await expect(treeview.getByTestId('sub-group-1').getByLabel('sub-group-1')).not.toBeChecked();
        await expect(treeview.getByTestId('sub-sub-group--1').getByLabel('sub-sub-group--1')).not.toBeChecked();
        await expect(treeview.getByTestId('tramway_lines').getByLabel('tramway_lines')).not.toBeChecked();
        await expect(treeview.getByTestId('sub-sub-group--2').getByLabel('sub-sub-group--2')).not.toBeChecked();
        await expect(treeview.getByTestId('townhalls_pg').getByLabel('townhalls_pg')).toBeChecked();

        // Baselayer
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('OpenStreetMap');

        // The url has not been updated
        const url = new URL(page.url());
        expect(url.hash).toHaveLength(0);
    });

    test('must display theme5 when active', async ({ page }) => {
        const project = new ProjectPage(page, 'theme');

        const themeSelector = page.locator('#theme-selector');
        await expect(themeSelector.getByText('theme1')).toContainClass('active');
        await expect(themeSelector.getByText('theme5')).not.toContainClass('active');

        // Select theme5 and catch GetMap for sousquartiers
        await themeSelector.getByTitle('Select theme').click();
        let getMapRequestPromise = project.waitForGetMapRequest();
        themeSelector.getByText('theme5').click();
        let getMapRequest = await getMapRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'sousquartiers',
            'STYLES': 'défaut',
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /757925.8\d+,6271017.8\d+,783272.9\d+,6287766.0\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        responseExpect(await getMapRequest.response()).toBeImagePng();

        // Check theme4 is activated and theme1 disabled
        await expect(themeSelector.getByText('theme1')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme5')).toContainClass('active');

        const treeview = page.locator('lizmap-treeview');
        // Expanded
        await expect(treeview.getByTestId('group1').locator('> div.expandable')).not.toContainClass('expanded');
        await expect(treeview.getByTestId('Les quartiers').locator('> div.expandable')).not.toContainClass('expanded');
        await expect(treeview.getByTestId('group with subgroups').locator('> div.expandable')).toContainClass('expanded');
        await expect(treeview.getByTestId('sub-group-1').locator('> div.expandable')).toContainClass('expanded');
        await expect(treeview.getByTestId('sub-sub-group--1').locator('> div.expandable')).toContainClass('expanded');
        await expect(treeview.getByTestId('sub-sub-group--2').locator('> div.expandable')).toContainClass('expanded');

        // Checked
        await expect(treeview.getByTestId('group1').getByLabel('group1')).toBeChecked();
        await expect(treeview.getByTestId('sousquartiers').getByLabel('sousquartiers')).toBeChecked();
        await expect(treeview.getByTestId('Les quartiers').getByLabel('Les quartiers')).not.toBeChecked();
        await expect(treeview.getByTestId('group with subgroups').getByLabel('group with subgroups')).not.toBeChecked();
        await expect(treeview.getByTestId('sub-group-1').getByLabel('sub-group-1')).toBeChecked();
        await expect(treeview.getByTestId('sub-sub-group--1').getByLabel('sub-sub-group--1')).not.toBeChecked();
        await expect(treeview.getByTestId('tramway_lines').getByLabel('tramway_lines')).toBeChecked();
        await expect(treeview.getByTestId('sub-sub-group--2').getByLabel('sub-sub-group--2')).not.toBeChecked();
        await expect(treeview.getByTestId('townhalls_pg').getByLabel('townhalls_pg')).toBeChecked();

        // Baselayer
        await expect(page.locator('lizmap-base-layers select')).toHaveValue('project-background-color');

        // The url has not been updated
        const url = new URL(page.url());
        expect(url.hash).toHaveLength(0);
    });

    test('mapTheme parameter', async ({ page }) => {
        const project = new ProjectPage(page, 'theme');

        let themeSelector = page.locator('#theme-selector');
        await expect(themeSelector.getByText('theme1')).toContainClass('active');
        await expect(themeSelector.getByText('theme2')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme3')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme4')).not.toContainClass('active');

        // Open with theme2
        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.openWithExtraParams({'mapTheme': 'theme2'});
        let getMapRequest = await getMapRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'quartiers',
            'STYLES': 'style2',
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /757925.8\d+,6271017.8\d+,783272.9\d+,6287766.0\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        responseExpect(await getMapRequest.response()).toBeImagePng();

        themeSelector = page.locator('#theme-selector');
        await expect(themeSelector.getByText('theme1')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme2')).toContainClass('active');
        await expect(themeSelector.getByText('theme3')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme4')).not.toContainClass('active');

        // Open with theme3
        getMapRequestPromise = project.waitForGetMapRequest();
        await project.openWithExtraParams({'mapTheme': 'theme3'});
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters['LAYERS'] = 'tramway_lines';
        getMapExpectedParameters['STYLES'] = 'default';
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        responseExpect(await getMapRequest.response()).toBeImagePng();

        themeSelector = page.locator('#theme-selector');
        await expect(themeSelector.getByText('theme1')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme2')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme3')).toContainClass('active');
        await expect(themeSelector.getByText('theme4')).not.toContainClass('active');

        // Open with theme4
        getMapRequestPromise = project.waitForGetMapRequest();
        await project.openWithExtraParams({'mapTheme': 'theme4'});
        getMapRequest = await getMapRequestPromise;
        getMapExpectedParameters['LAYERS'] = 'sousquartiers';
        getMapExpectedParameters['STYLES'] = 'rule-based';
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);
        responseExpect(await getMapRequest.response()).toBeImagePng();

        themeSelector = page.locator('#theme-selector');
        await expect(themeSelector.getByText('theme1')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme2')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme3')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme4')).toContainClass('active');
    });

});

test.describe('Theme and automatic permalink @readonly', () => {

    test.beforeEach(async ({ page }) => {
        // force automatic permalink
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['automatic_permalink'] = true;
            await route.fulfill({ response, json });
        });

        const project = new ProjectPage(page, 'theme');
        // Catch default GetMap
        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();
        let getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

        // Remove listen to GetProjectConfig
        await page.unroute('**/service/getProjectConfig*');
    });

    test('must display theme1 at startup', async ({ page }) => {
        const themeSelector = page.locator('#theme-selector');
        await expect(themeSelector.getByText('theme1')).toContainClass('active');
        await expect(themeSelector.getByText('theme2')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme3')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme4')).not.toContainClass('active');

        // The url has been updated
        const url = new URL(page.url());
        expect(url.hash).not.toHaveLength(0);
        // The decoded hash is
        // #3.730872,43.540386,4.017985,43.679557
        // |group1,Les%20quartiers
        // |,style1
        // |1,1
        // When theme is applied, only groups explicitly in checked-group-nodes are checked
        // Theme1 only has group1 in checked-group-nodes, so nested groups remain unchecked
        expect(url.hash).toMatch(/#3.7308\d+,43.5403\d+,4.0179\d+,43.6795\d+\|/)
        expect(url.hash).toContain('|group1,Les%20quartiers|,style1|1,1')
    });

    test('must display theme2 when selected', async ({ page }) => {
        const project = new ProjectPage(page, 'theme');

        const themeSelector = page.locator('#theme-selector');
        await expect(themeSelector.getByText('theme1')).toContainClass('active');
        await expect(themeSelector.getByText('theme2')).not.toContainClass('active');

        // Select theme2 and catch GetMap for quartiers with style2
        await themeSelector.getByTitle('Select theme').click();
        let getMapRequestPromise = project.waitForGetMapRequest();
        themeSelector.getByText('theme2').click();
        let getMapRequest = await getMapRequestPromise;
        responseExpect(await getMapRequest.response()).toBeImagePng();

        // Check theme2 is activated and theme1 disabled
        await expect(themeSelector.getByText('theme1')).not.toContainClass('active');
        await expect(themeSelector.getByText('theme2')).toContainClass('active');
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
