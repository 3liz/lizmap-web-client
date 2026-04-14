// @ts-check
import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js'
import { expect as responseExpect } from './fixtures/expect-response.js'
import { ProjectPage } from './pages/project.js';

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Apply dock events to console log
 * @param {Page} page The playwright page
 * @returns {Promise<void>} Promise
 */
async function applyDockEventsToConsoleLog(page) {
    return await page.evaluate(`
        lizMap.events.on({
            minidockopened: (e) => console.log(e.type + ' ' + e.id),
            minidockclosed: (e) => console.log(e.type + ' ' + e.id),
            dockopened: (e) => console.log(e.type + ' ' + e.id),
            dockclosed: (e) => console.log(e.type + ' ' + e.id),
        });
    `);
}

test.describe('Minidock managing @readonly', () => {

    test('Print project: selection, print, permalink, draw', async ({ page }) => {
        // project print
        let project = new ProjectPage(page, 'print');
        // Catch default GetMap
        const getMapQuartiersPromise = project.waitForGetMapRequest('quartiers');
        const getMapSousQuartiersPromise = project.waitForGetMapRequest('sousquartiers');
        // Open project
        await project.open();

        const getMapQuartiers = await getMapQuartiersPromise;
        const getMapSousQuartiers = await getMapSousQuartiersPromise;
        /** @type {{[key: string]: string|RegExp}} */
        const getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
        }
        requestExpect(getMapQuartiers).toContainParametersInUrl({
            ...getMapExpectedParameters,
            ...{'LAYERS': 'quartiers'}
        });
        requestExpect(getMapSousQuartiers).toContainParametersInUrl({
            ...getMapExpectedParameters,
            ...{'LAYERS': 'sousquartiers'}
        });
        // Check response
        responseExpect(await getMapQuartiers.response()).toBeImagePng();
        responseExpect(await getMapSousQuartiers.response()).toBeImagePng();

        const miniDockIds = [
            'selectiontool',
            'print',
            'permaLink',
            'draw',
        ];
        const miniDockNavActive = page.locator('#mapmenu .nav-minidock.active');
        const miniDockContent = page.locator('#mini-dock-content');

        // Check the default state of these minidocks
        await expect(miniDockNavActive).toHaveCount(0);
        await expect(miniDockContent).not.toBeVisible();

        await applyDockEventsToConsoleLog(page);
        expect(project.logs).toHaveLength(0);
        let logsLength = project.logs.length+0;

        for (const dockId of miniDockIds) {
            // The minidock is hidden
            await expect(page.locator(`#${dockId}`)).not.toBeVisible();
            // The button to display the dock is visible
            await expect(page.locator(`#button-${dockId}`)).toBeVisible();
            // The parent of the button has not the active class
            await expect(page.locator(`#mapmenu .nav-minidock.${dockId}`)).not.toContainClass('active');
        }
        // Still no minidock displayed
        await expect(miniDockNavActive).toHaveCount(0);
        await expect(miniDockContent).not.toBeVisible();

        // Check that each minidock can be displayed and hide by clicking on the same button
        for (const dockId of miniDockIds) {
            // click to open the minidock
            await page.locator(`#button-${dockId}`).click();
            await expect(miniDockContent).toBeVisible();
            await expect(page.locator(`#${dockId}`)).toBeVisible();
            await expect(miniDockNavActive).toHaveCount(1);
            await expect(page.locator(`#mapmenu .nav-minidock.${dockId}`)).toContainClass('active');

            // Checking logs
            expect(project.logs).toHaveLength(logsLength + 1);
            let lastLog = project.logs.at(-1);
            expect(lastLog).not.toBeUndefined();
            expect(lastLog?.type).toBe('log');
            expect(lastLog?.message).toBe(`minidockopened ${dockId}`);

            // the others are not displayed
            for (const otherDockId of miniDockIds.filter(id => id !== dockId)) {
                await expect(page.locator(`#${otherDockId}`)).not.toBeVisible();
                await expect(page.locator(`#mapmenu .nav-minidock.${otherDockId}`)).not.toContainClass('active');
            }

            // click to close the minidock
            await page.locator(`#button-${dockId}`).click();
            await expect(miniDockNavActive).toHaveCount(0);
            await expect(page.locator(`#${dockId}`)).not.toBeVisible();
            await expect(miniDockContent).not.toBeVisible();
            await expect(page.locator(`#mapmenu .nav-minidock.${dockId}`)).not.toContainClass('active');

            // Checking logs
            expect(project.logs).toHaveLength(logsLength + 2);
            lastLog = project.logs.at(-1);
            expect(lastLog).not.toBeUndefined();
            expect(lastLog?.type).toBe('log');
            expect(lastLog?.message).toBe(`minidockclosed ${dockId}`);

            // the others are still not displayed
            for (const otherDockId of miniDockIds.filter(id => id !== dockId)) {
                await expect(page.locator(`#${otherDockId}`)).not.toBeVisible();
                await expect(page.locator(`#mapmenu .nav-minidock.${otherDockId}`)).not.toContainClass('active');
            }
            logsLength = project.logs.length+0;
        }
        // Back to no minidock displayed
        await expect(miniDockNavActive).toHaveCount(0);
        await expect(miniDockContent).not.toBeVisible();

        // Check that clicking on a different button display the target dock and hide the others
        for (const dockId of miniDockIds) {
            const  countActiveBefore = await miniDockNavActive.count();

            await page.locator(`#button-${dockId}`).click();
            await expect(page.locator(`#${dockId}`)).toBeVisible();
            await expect(miniDockNavActive).toHaveCount(1);
            await expect(page.locator(`#mapmenu .nav-minidock.${dockId}`)).toContainClass('active');

            // Checking logs
            expect(project.logs).toHaveLength(logsLength + countActiveBefore + 1);
            let lastLog = project.logs.at(-1);
            expect(lastLog).not.toBeUndefined();
            expect(lastLog?.type).toBe('log');
            expect(lastLog?.message).toBe(`minidockopened ${dockId}`);

            if (countActiveBefore > 0) {
                lastLog = project.logs.at(-2);
                expect(lastLog).not.toBeUndefined();
                expect(lastLog?.type).toBe('log');
                expect(lastLog?.message).toMatch(/^minidockclosed/);
            }

            // the others are not displayed
            for (const otherDockId of miniDockIds.filter(id => id !== dockId)) {
                await expect(page.locator(`#${otherDockId}`)).not.toBeVisible();
                await expect(page.locator(`#mapmenu .nav-minidock.${otherDockId}`)).not.toContainClass('active');
            }
            logsLength = project.logs.length+0;
        }
        // Still one minidock opened and active
        await expect(miniDockNavActive).toHaveCount(1);
        await expect(miniDockContent).toBeVisible();
    });

    test('Dataviz project: selection, locate, permalink', async ({ page }) => {
        // project print
        let project = new ProjectPage(page, 'dataviz');
        // Catch default GetMap
        const getMapBakeriesPromise = project.waitForGetMapRequest('bakes');
        const getMapPolygonsPromise = project.waitForGetMapRequest('polygons');
        // Open project
        await project.open();

        const getMapBakeries = await getMapBakeriesPromise;
        const getMapPolygons = await getMapPolygonsPromise;
        /** @type {{[key: string]: string|RegExp}} */
        const getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'CRS': 'EPSG:4326',
            'WIDTH': '958',
            'HEIGHT': '633',
        }
        requestExpect(getMapBakeries).toContainParametersInUrl({
            ...getMapExpectedParameters,
            ...{'LAYERS': 'bakes'}
        });
        requestExpect(getMapPolygons).toContainParametersInUrl({
            ...getMapExpectedParameters,
            ...{'LAYERS': 'polygons'}
        });
        // Check response
        responseExpect(await getMapBakeries.response()).toBeImagePng();
        responseExpect(await getMapPolygons.response()).toBeImagePng();

        const miniDockIds = [
            'selectiontool',
            'locate',
            'permaLink',
        ];
        const miniDockNavActive = page.locator('#mapmenu .nav-minidock.active');
        const miniDockContent = page.locator('#mini-dock-content');

        // Check the default state of these minidocks
        await expect(miniDockNavActive).toHaveCount(1);
        await expect(miniDockContent).toBeVisible();
        // Hide the default
        await miniDockNavActive.locator('a').click();
        // The minidock is hidden
        await expect(miniDockNavActive).toHaveCount(0);
        await expect(miniDockContent).not.toBeVisible();

        await applyDockEventsToConsoleLog(page);
        expect(project.logs).toHaveLength(0);
        let logsLength = project.logs.length+0;

        for (const dockId of miniDockIds) {
            // The minidock is hidden
            await expect(page.locator(`#${dockId}`)).not.toBeVisible();
            // The button to display the dock is visible
            await expect(page.locator(`#button-${dockId}`)).toBeVisible();
            // The parent of the button has not the active class
            await expect(page.locator(`#mapmenu .nav-minidock.${dockId}`)).not.toContainClass('active');
        }
        // Still no minidock displayed
        await expect(miniDockNavActive).toHaveCount(0);
        await expect(miniDockContent).not.toBeVisible();

        // Check that each minidock can be displayed and hide by clicking on the same button
        for (const dockId of miniDockIds) {
            // click to open the minidock
            await page.locator(`#button-${dockId}`).click();
            await expect(miniDockContent).toBeVisible();
            await expect(page.locator(`#${dockId}`)).toBeVisible();
            await expect(miniDockNavActive).toHaveCount(1);
            await expect(page.locator(`#mapmenu .nav-minidock.${dockId}`)).toContainClass('active');

            // Checking logs
            expect(project.logs).toHaveLength(logsLength + 1);
            let lastLog = project.logs.at(-1);
            expect(lastLog).not.toBeUndefined();
            expect(lastLog?.type).toBe('log');
            expect(lastLog?.message).toBe(`minidockopened ${dockId}`);

            // the others are not displayed
            for (const otherDockId of miniDockIds.filter(id => id !== dockId)) {
                await expect(page.locator(`#${otherDockId}`)).not.toBeVisible();
                await expect(page.locator(`#mapmenu .nav-minidock.${otherDockId}`)).not.toContainClass('active');
            }

            // click to close the minidock
            await page.locator(`#button-${dockId}`).click();
            await expect(miniDockNavActive).toHaveCount(0);
            await expect(page.locator(`#${dockId}`)).not.toBeVisible();
            await expect(miniDockContent).not.toBeVisible();
            await expect(page.locator(`#mapmenu .nav-minidock.${dockId}`)).not.toContainClass('active');

            // Checking logs
            expect(project.logs).toHaveLength(logsLength + 2);
            lastLog = project.logs.at(-1);
            expect(lastLog).not.toBeUndefined();
            expect(lastLog?.type).toBe('log');
            expect(lastLog?.message).toBe(`minidockclosed ${dockId}`);

            // the others are still not displayed
            for (const otherDockId of miniDockIds.filter(id => id !== dockId)) {
                await expect(page.locator(`#${otherDockId}`)).not.toBeVisible();
                await expect(page.locator(`#mapmenu .nav-minidock.${otherDockId}`)).not.toContainClass('active');
            }
            logsLength = project.logs.length+0;
        }
        // Back to no minidock displayed
        await expect(miniDockNavActive).toHaveCount(0);
        await expect(miniDockContent).not.toBeVisible();

        // Check that clicking on a different button display the target dock and hide the others
        for (const dockId of miniDockIds) {
            const  countActiveBefore = await miniDockNavActive.count();

            await page.locator(`#button-${dockId}`).click();
            await expect(page.locator(`#${dockId}`)).toBeVisible();
            await expect(miniDockNavActive).toHaveCount(1);
            await expect(page.locator(`#mapmenu .nav-minidock.${dockId}`)).toContainClass('active');

            // Checking logs
            expect(project.logs).toHaveLength(logsLength + countActiveBefore + 1);
            let lastLog = project.logs.at(-1);
            expect(lastLog).not.toBeUndefined();
            expect(lastLog?.type).toBe('log');
            expect(lastLog?.message).toBe(`minidockopened ${dockId}`);

            if (countActiveBefore > 0) {
                lastLog = project.logs.at(-2);
                expect(lastLog).not.toBeUndefined();
                expect(lastLog?.type).toBe('log');
                expect(lastLog?.message).toMatch(/^minidockclosed/);
            }

            // the others are not displayed
            for (const otherDockId of miniDockIds.filter(id => id !== dockId)) {
                await expect(page.locator(`#${otherDockId}`)).not.toBeVisible();
                await expect(page.locator(`#mapmenu .nav-minidock.${otherDockId}`)).not.toContainClass('active');
            }
            logsLength = project.logs.length+0;
        }
        // Still one minidock opened and active
        await expect(miniDockNavActive).toHaveCount(1);
        await expect(miniDockContent).toBeVisible();
    });

    test('Draw project: measure, permalink, draw', async ({ page }) => {
        // project draw
        const project = new ProjectPage(page, 'draw');
        // Open project
        await project.open();

        const miniDockIds = [
            'measure',
            'permaLink',
            'draw',
        ];
        const miniDockNavActive = page.locator('#mapmenu .nav-minidock.active');
        const miniDockContent = page.locator('#mini-dock-content');

        // Check the default state of these minidocks
        await expect(miniDockNavActive).toHaveCount(0);
        await expect(miniDockContent).not.toBeVisible();

        await applyDockEventsToConsoleLog(page);
        expect(project.logs).toHaveLength(0);
        let logsLength = project.logs.length+0;

        for (const dockId of miniDockIds) {
            // The minidock is hidden
            await expect(page.locator(`#${dockId}`)).not.toBeVisible();
            // The button to display the dock is visible
            await expect(page.locator(`#button-${dockId}`)).toBeVisible();
            // The parent of the button has not the active class
            await expect(page.locator(`#mapmenu .nav-minidock.${dockId}`)).not.toContainClass('active');
        }
        // Still no minidock displayed
        await expect(miniDockNavActive).toHaveCount(0);
        await expect(miniDockContent).not.toBeVisible();

        // Check that each minidock can be displayed and hide by clicking on the same button
        for (const dockId of miniDockIds) {
            // click to open the minidock
            await page.locator(`#button-${dockId}`).click();
            await expect(miniDockContent).toBeVisible();
            await expect(page.locator(`#${dockId}`)).toBeVisible();
            await expect(miniDockNavActive).toHaveCount(1);
            await expect(page.locator(`#mapmenu .nav-minidock.${dockId}`)).toContainClass('active');

            // Checking logs
            expect(project.logs).toHaveLength(logsLength + 1);
            let lastLog = project.logs.at(-1);
            expect(lastLog).not.toBeUndefined();
            expect(lastLog?.type).toBe('log');
            expect(lastLog?.message).toBe(`minidockopened ${dockId}`);

            // the others are not displayed
            for (const otherDockId of miniDockIds.filter(id => id !== dockId)) {
                await expect(page.locator(`#${otherDockId}`)).not.toBeVisible();
                await expect(page.locator(`#mapmenu .nav-minidock.${otherDockId}`)).not.toContainClass('active');
            }

            // click to close the minidock
            await page.locator(`#button-${dockId}`).click();
            await expect(miniDockNavActive).toHaveCount(0);
            await expect(page.locator(`#${dockId}`)).not.toBeVisible();
            await expect(miniDockContent).not.toBeVisible();
            await expect(page.locator(`#mapmenu .nav-minidock.${dockId}`)).not.toContainClass('active');

            // Checking logs
            expect(project.logs).toHaveLength(logsLength + 2);
            lastLog = project.logs.at(-1);
            expect(lastLog).not.toBeUndefined();
            expect(lastLog?.type).toBe('log');
            expect(lastLog?.message).toBe(`minidockclosed ${dockId}`);

            // the others are still not displayed
            for (const otherDockId of miniDockIds.filter(id => id !== dockId)) {
                await expect(page.locator(`#${otherDockId}`)).not.toBeVisible();
                await expect(page.locator(`#mapmenu .nav-minidock.${otherDockId}`)).not.toContainClass('active');
            }
            logsLength = project.logs.length+0;
        }
        // Back to no minidock displayed
        await expect(miniDockNavActive).toHaveCount(0);
        await expect(miniDockContent).not.toBeVisible();

        // Check that clicking on a different button display the target dock and hide the others
        for (const dockId of miniDockIds) {
            const  countActiveBefore = await miniDockNavActive.count();

            await page.locator(`#button-${dockId}`).click();
            await expect(page.locator(`#${dockId}`)).toBeVisible();
            await expect(miniDockNavActive).toHaveCount(1);
            await expect(page.locator(`#mapmenu .nav-minidock.${dockId}`)).toContainClass('active');

            // Checking logs
            expect(project.logs).toHaveLength(logsLength + countActiveBefore + 1);
            let lastLog = project.logs.at(-1);
            expect(lastLog).not.toBeUndefined();
            expect(lastLog?.type).toBe('log');
            expect(lastLog?.message).toBe(`minidockopened ${dockId}`);

            if (countActiveBefore > 0) {
                lastLog = project.logs.at(-2);
                expect(lastLog).not.toBeUndefined();
                expect(lastLog?.type).toBe('log');
                expect(lastLog?.message).toMatch(/^minidockclosed/);
            }

            // the others are not displayed
            for (const otherDockId of miniDockIds.filter(id => id !== dockId)) {
                await expect(page.locator(`#${otherDockId}`)).not.toBeVisible();
                await expect(page.locator(`#mapmenu .nav-minidock.${otherDockId}`)).not.toContainClass('active');
            }
            logsLength = project.logs.length+0;
        }
        // Still one minidock opened and active
        await expect(miniDockNavActive).toHaveCount(1);
        await expect(miniDockContent).toBeVisible();
    });

});

test.describe('Dock managing @readonly', () => {

    test('Dataviz project: switcher, metadata, dataviz', async ({ page }) => {
        // project print
        let project = new ProjectPage(page, 'dataviz');
        // Catch default GetMap
        const getMapBakeriesPromise = project.waitForGetMapRequest('bakes');
        const getMapPolygonsPromise = project.waitForGetMapRequest('polygons');
        // Open project
        await project.open();

        const getMapBakeries = await getMapBakeriesPromise;
        const getMapPolygons = await getMapPolygonsPromise;
        /** @type {{[key: string]: string|RegExp}} */
        const getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'CRS': 'EPSG:4326',
            'WIDTH': '958',
            'HEIGHT': '633',
        }
        requestExpect(getMapBakeries).toContainParametersInUrl({
            ...getMapExpectedParameters,
            ...{'LAYERS': 'bakes'}
        });
        requestExpect(getMapPolygons).toContainParametersInUrl({
            ...getMapExpectedParameters,
            ...{'LAYERS': 'polygons'}
        });
        // Check response
        responseExpect(await getMapBakeries.response()).toBeImagePng();
        responseExpect(await getMapPolygons.response()).toBeImagePng();

        const dockIds = [
            'switcher',
            'metadata',
            'dataviz',
        ];
        const dockNavActive = page.locator('#mapmenu .nav-dock.active');
        const dockContent = page.locator('#dock-content');

        // Check the default state of these minidocks
        await expect(dockNavActive).toHaveCount(1);
        await expect(dockContent).toBeVisible();
        // Hide the default
        await dockNavActive.locator('a').click();
        // The dock is hidden
        await expect(dockNavActive).toHaveCount(0);
        await expect(dockContent).not.toBeVisible();

        await applyDockEventsToConsoleLog(page);
        expect(project.logs).toHaveLength(0);
        let logsLength = project.logs.length+0;

        for (const dockId of dockIds) {
            // The dock is hidden
            await expect(page.locator(`#${dockId}`)).not.toBeVisible();
            // The button to display the dock is visible
            await expect(page.locator(`#button-${dockId}`)).toBeVisible();
            // The parent of the button has not the active class
            await expect(page.locator(`#mapmenu .nav-dock.${dockId}`)).not.toContainClass('active');
        }
        // Still no dock displayed
        await expect(dockNavActive).toHaveCount(0);
        await expect(dockContent).not.toBeVisible();

        // Check that each dock can be displayed and hide by clicking on the same button
        for (const dockId of dockIds) {
            // click to open the dock
            await page.locator(`#button-${dockId}`).click();
            await expect(dockContent).toBeVisible();
            await expect(page.locator(`#${dockId}`)).toBeVisible();
            await expect(dockNavActive).toHaveCount(1);
            await expect(page.locator(`#mapmenu .nav-dock.${dockId}`)).toContainClass('active');

            // Checking logs
            expect(project.logs).toHaveLength(logsLength + 1);
            let lastLog = project.logs.at(-1);
            expect(lastLog).not.toBeUndefined();
            expect(lastLog?.type).toBe('log');
            expect(lastLog?.message).toBe(`dockopened ${dockId}`);

            // the others are not displayed
            for (const otherDockId of dockIds.filter(id => id !== dockId)) {
                await expect(page.locator(`#${otherDockId}`)).not.toBeVisible();
                await expect(page.locator(`#mapmenu .nav-dock.${otherDockId}`)).not.toContainClass('active');
            }

            // Click to close the dock
            await page.locator(`#button-${dockId}`).click();
            await expect(dockNavActive).toHaveCount(0);
            await expect(page.locator(`#${dockId}`)).not.toBeVisible();
            await expect(dockContent).not.toBeVisible();
            await expect(page.locator(`#mapmenu .nav-dock.${dockId}`)).not.toContainClass('active');

            // Checking logs
            expect(project.logs).toHaveLength(logsLength + 2);
            lastLog = project.logs.at(-1);
            expect(lastLog).not.toBeUndefined();
            expect(lastLog?.type).toBe('log');
            expect(lastLog?.message).toBe(`dockclosed ${dockId}`);

            // the others are still not displayed
            for (const otherDockId of dockIds.filter(id => id !== dockId)) {
                await expect(page.locator(`#${otherDockId}`)).not.toBeVisible();
                await expect(page.locator(`#mapmenu .nav-dock.${otherDockId}`)).not.toContainClass('active');
            }
            logsLength = project.logs.length+0;
        }
        // Back to no dock displayed
        await expect(dockNavActive).toHaveCount(0);
        await expect(dockContent).not.toBeVisible();

        // Check that clicking on a different button display the target dock and hide the others
        for (const dockId of dockIds) {
            const  countActiveBefore = await dockNavActive.count();

            await page.locator(`#button-${dockId}`).click();
            await expect(page.locator(`#${dockId}`)).toBeVisible();
            await expect(dockNavActive).toHaveCount(1);
            await expect(page.locator(`#mapmenu .nav-dock.${dockId}`)).toContainClass('active');

            // Checking logs
            expect(project.logs).toHaveLength(logsLength + countActiveBefore + 1);
            let lastLog = project.logs.at(-1);
            expect(lastLog).not.toBeUndefined();
            expect(lastLog?.type).toBe('log');
            expect(lastLog?.message).toBe(`dockopened ${dockId}`);

            if (countActiveBefore > 0) {
                lastLog = project.logs.at(-2);
                expect(lastLog).not.toBeUndefined();
                expect(lastLog?.type).toBe('log');
                expect(lastLog?.message).toMatch(/^dockclosed/);
            }

            // the others are not displayed
            for (const otherDockId of dockIds.filter(id => id !== dockId)) {
                await expect(page.locator(`#${otherDockId}`)).not.toBeVisible();
                await expect(page.locator(`#mapmenu .nav-dock.${otherDockId}`)).not.toContainClass('active');
            }
            logsLength = project.logs.length+0;
        }
        // Still one dock opened and active
        await expect(dockNavActive).toHaveCount(1);
        await expect(dockContent).toBeVisible();
    });

    test('Form filter project: switcher, metadata, popupcontent, filter', async ({ page }) => {
        // project print
        let project = new ProjectPage(page, 'form_filter');
        // Catch default GetMap
        const getMapLayerPromise = project.waitForGetMapRequest('form_filter_layer');
        const getMapChildPromise = project.waitForGetMapRequest('form_filter_child_bus_stops');
        // Open project
        await project.open();

        const getMapLayer = await getMapLayerPromise;
        const getMapChild = await getMapChildPromise;
        /** @type {{[key: string]: string|RegExp}} */
        const getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'CRS': 'EPSG:2154',
            'WIDTH': '958',
            'HEIGHT': '633',
        }
        requestExpect(getMapLayer).toContainParametersInUrl({
            ...getMapExpectedParameters,
            ...{'LAYERS': 'form_filter_layer'}
        });
        requestExpect(getMapChild).toContainParametersInUrl({
            ...getMapExpectedParameters,
            ...{'LAYERS': 'form_filter_child_bus_stops'}
        });
        // Check response
        responseExpect(await getMapLayer.response()).toBeImagePng();
        responseExpect(await getMapChild.response()).toBeImagePng();

        const dockIds = [
            'switcher',
            'metadata',
            'popupcontent',
            'filter',
        ];
        const dockNavActive = page.locator('#mapmenu .nav-dock.active');
        const dockContent = page.locator('#dock-content');

        // Check the default state of these minidocks
        await expect(dockNavActive).toHaveCount(1);
        await expect(dockContent).toBeVisible();
        // Hide the default
        await dockNavActive.locator('a').click();
        // The dock is hidden
        await expect(dockNavActive).toHaveCount(0);
        await expect(dockContent).not.toBeVisible();

        await applyDockEventsToConsoleLog(page);
        expect(project.logs).toHaveLength(0);
        let logsLength = project.logs.length+0;

        for (const dockId of dockIds) {
            // The dock is hidden
            await expect(page.locator(`#${dockId}`)).not.toBeVisible();
            // The button to display the dock is visible
            await expect(page.locator(`#button-${dockId}`)).toBeVisible();
            // The parent of the button has not the active class
            await expect(page.locator(`#mapmenu .nav-dock.${dockId}`)).not.toContainClass('active');
        }
        // Still no dock displayed
        await expect(dockNavActive).toHaveCount(0);
        await expect(dockContent).not.toBeVisible();

        // Check that each dock can be displayed and hide by clicking on the same button
        for (const dockId of dockIds) {
            // click to open the dock
            await page.locator(`#button-${dockId}`).click();
            await expect(dockContent).toBeVisible();
            await expect(page.locator(`#${dockId}`)).toBeVisible();
            await expect(dockNavActive).toHaveCount(1);
            await expect(page.locator(`#mapmenu .nav-dock.${dockId}`)).toContainClass('active');

            // Checking logs
            expect(project.logs).toHaveLength(logsLength + 1);
            let lastLog = project.logs.at(-1);
            expect(lastLog).not.toBeUndefined();
            expect(lastLog?.type).toBe('log');
            expect(lastLog?.message).toBe(`dockopened ${dockId}`);

            // the others are not displayed
            for (const otherDockId of dockIds.filter(id => id !== dockId)) {
                await expect(page.locator(`#${otherDockId}`)).not.toBeVisible();
                await expect(page.locator(`#mapmenu .nav-dock.${otherDockId}`)).not.toContainClass('active');
            }

            // Click to close the dock
            await page.locator(`#button-${dockId}`).click();
            await expect(dockNavActive).toHaveCount(0);
            await expect(page.locator(`#${dockId}`)).not.toBeVisible();
            await expect(dockContent).not.toBeVisible();
            await expect(page.locator(`#mapmenu .nav-dock.${dockId}`)).not.toContainClass('active');

            // Checking logs
            expect(project.logs).toHaveLength(logsLength + 2);
            lastLog = project.logs.at(-1);
            expect(lastLog).not.toBeUndefined();
            expect(lastLog?.type).toBe('log');
            expect(lastLog?.message).toBe(`dockclosed ${dockId}`);

            // the others are still not displayed
            for (const otherDockId of dockIds.filter(id => id !== dockId)) {
                await expect(page.locator(`#${otherDockId}`)).not.toBeVisible();
                await expect(page.locator(`#mapmenu .nav-dock.${otherDockId}`)).not.toContainClass('active');
            }
            logsLength = project.logs.length+0;
        }
        // Back to no dock displayed
        await expect(dockNavActive).toHaveCount(0);
        await expect(dockContent).not.toBeVisible();

        // Check that clicking on a different button display the target dock and hide the others
        for (const dockId of dockIds) {
            const  countActiveBefore = await dockNavActive.count();

            await page.locator(`#button-${dockId}`).click();
            await expect(page.locator(`#${dockId}`)).toBeVisible();
            await expect(dockNavActive).toHaveCount(1);
            await expect(page.locator(`#mapmenu .nav-dock.${dockId}`)).toContainClass('active');

            // Checking logs
            expect(project.logs).toHaveLength(logsLength + countActiveBefore + 1);
            let lastLog = project.logs.at(-1);
            expect(lastLog).not.toBeUndefined();
            expect(lastLog?.type).toBe('log');
            expect(lastLog?.message).toBe(`dockopened ${dockId}`);

            if (countActiveBefore > 0) {
                lastLog = project.logs.at(-2);
                expect(lastLog).not.toBeUndefined();
                expect(lastLog?.type).toBe('log');
                expect(lastLog?.message).toMatch(/^dockclosed/);
            }

            // the others are not displayed
            for (const otherDockId of dockIds.filter(id => id !== dockId)) {
                await expect(page.locator(`#${otherDockId}`)).not.toBeVisible();
                await expect(page.locator(`#mapmenu .nav-dock.${otherDockId}`)).not.toContainClass('active');
            }
            logsLength = project.logs.length+0;
        }
        // Still one dock opened and active
        await expect(dockNavActive).toHaveCount(1);
        await expect(dockContent).toBeVisible();
    });
});
