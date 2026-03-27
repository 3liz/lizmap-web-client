// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'
import { expect as requestExpect } from './fixtures/expect-request.js'
import { ProjectPage } from "./pages/project";
import { PrintPage } from './pages/printpage';
import { playwrightTestFile } from './globals';

test.describe('Portfolios @readonly', () => {
    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'portfolios');
        // Catch default GetMap
        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();
        let getMapRequest = await getMapRequestPromise;
        responseExpect(await getMapRequest.response()).toBeImagePng();

        await page.locator('#button-portfolios').click();
    });

    test('Portfolios UI', async ({ page }) => {
        const selectorContainer = page.locator('#project-portfolios-selector-container');
        await expect(selectorContainer).toBeVisible();

        // Selector
        const selector = selectorContainer.locator('select.portfolio-select');
        await expect(selector).toBeVisible();
        await expect(selector.locator('option')).toHaveCount(4);
        await expect(selector.locator('option')).toContainText(
            ['-- No portfolio -- ', 'Test point', 'Test line', 'Test polygon']
        );

        // Description
        const description = selectorContainer.locator('div.portfolio-description');
        await expect(description).toHaveText('Choose a portfolio');

        // Buttons
        const runButton = selectorContainer.locator('button.portfolio-run-button');
        const deactivateButton = selectorContainer.locator('button.portfolio-deactivate-button');

        await expect(runButton).toBeDisabled();
        await expect(deactivateButton).toBeDisabled();

        // Digitizing
        const digitizing = selectorContainer.locator('lizmap-digitizing');
        await expect(digitizing).toHaveCount(0);

        // Select Point
        await selector.selectOption('0');
        await expect(description).toHaveText('Test point');
        await expect(digitizing).toHaveCount(1);
        await expect(digitizing).toHaveAttribute('context', 'portfolio');
        await expect(digitizing).toHaveAttribute('available-tools', 'point');
        await expect(digitizing).toHaveAttribute('selected-tool', 'point');

        // Select Line
        await selector.selectOption('1');
        await expect(description).toHaveText('Test line');
        await expect(digitizing).toHaveCount(1);
        await expect(digitizing).toHaveAttribute('context', 'portfolio');
        await expect(digitizing).toHaveAttribute('available-tools', 'line');
        await expect(digitizing).toHaveAttribute('selected-tool', 'line');

        // Select Polygon
        await selector.selectOption('2');
        await expect(description).toHaveText('Test polygon');
        await expect(digitizing).toHaveCount(1);
        await expect(digitizing).toHaveAttribute('context', 'portfolio');
        await expect(digitizing).toHaveAttribute('available-tools', 'polygon');
        await expect(digitizing).toHaveAttribute('selected-tool', 'polygon');
    });

    test('Portfolio point', async ({ page }) => {
        const selectorContainer = page.locator('#project-portfolios-selector-container');
        // Selector
        const selector = selectorContainer.locator('select.portfolio-select');

        // Buttons
        const runButton = selectorContainer.locator('button.portfolio-run-button');
        const deactivateButton = selectorContainer.locator('button.portfolio-deactivate-button');

        // Select Point
        await selector.selectOption('0');

        // Draw point
        const project = new PrintPage(page, 'portfolios');
        await project.clickOnMap(300, 150);

        // check buttons
        await expect(runButton).not.toBeDisabled();
        await expect(deactivateButton).toBeDisabled();

        // Mock file
        await page.route('**/service*', async route => {
            const request = await route.request();
            if (request.postData()?.includes('GetPrint')) {
                await route.fulfill({
                    headers: {
                        "Content-Description": "File Transfert",
                        "Content-Disposition": "attachment; filename=\"portfolios_A4_Paysage.pdf\"",
                        "Content-Transfer-Encoding": "binary",
                        "Content-Type": "application/pdf",
                    },
                    path: playwrightTestFile('mock', 'print_in_project_projection', 'empty', 'Paysage_A4.pdf')
                })
            }
        });

        // Catch the first PDF
        let getPrintPromise = project.waitForGetPrintRequest();
        await runButton.click();

        let getPrintRequest = await getPrintPromise;
        let expectedParameters = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetPrint',
            'VERSION': '1.3.0',
            'FORMAT': 'application/pdf',
            'TRANSPARENT': 'true',
            'CRS': 'EPSG:2154',
            'DPI': '100',
            'TEMPLATE': 'A4 Paysage',
            'map0:SCALE': '50000',
            'map0:EXTENT': /759602\.\d+,6277779\.\d+,774452\.\d+,6288279\.\d+/,
            'map0:LAYERS': 'quartiers',
            'map0:STYLES': 'style1',
            'map0:HIGHLIGHT_GEOM': /POINT\(767027\.\d+ 6283029\.\d+\)/,
            //'map0:HIGHLIGHT_SYMBOL': '',
        }
        requestExpect(getPrintRequest).toContainParametersInPostData(expectedParameters);
        let searchParams = new URLSearchParams(getPrintRequest?.postData() ?? '');
        expect(searchParams.size).toBe(14);

        // Catch the second PDF
        getPrintPromise = project.waitForGetPrintRequest();
        responseExpect(await getPrintRequest.response()).toBePdf();

        getPrintRequest = await getPrintPromise;
        expectedParameters['map0:SCALE'] = '100000';
        expectedParameters['map0:EXTENT'] = /752177\.\d+,6272529\.\d+,781877\.\d+,6293529\.\d+/;
        expectedParameters['map0:LAYERS'] = 'quartiers';
        expectedParameters['map0:STYLES'] = 'style2';
        requestExpect(getPrintRequest).toContainParametersInPostData(expectedParameters);
        searchParams = new URLSearchParams(getPrintRequest?.postData() ?? '');
        expect(searchParams.size).toBe(14);

        responseExpect(await getPrintRequest.response()).toBePdf();

        // Stop listening to WMS requests
        await page.unroute('**/service*');
    });

    test('Portfolio line', async ({ page }) => {
        const selectorContainer = page.locator('#project-portfolios-selector-container');
        // Selector
        const selector = selectorContainer.locator('select.portfolio-select');

        // Buttons
        const runButton = selectorContainer.locator('button.portfolio-run-button');
        const deactivateButton = selectorContainer.locator('button.portfolio-deactivate-button');

        // Select Point
        await selector.selectOption('1');

        // Draw line
        const project = new PrintPage(page, 'portfolios');
        await project.clickOnMap(300, 150);
        await project.dblClickOnMap(400, 200);

        // check buttons
        await expect(runButton).not.toBeDisabled();
        await expect(deactivateButton).toBeDisabled();
        // Mock file
        await page.route('**/service*', async route => {
            const request = await route.request();
            if (request.postData()?.includes('GetPrint')) {
                await route.fulfill({
                    headers: {
                        "Content-Description": "File Transfert",
                        "Content-Disposition": "attachment; filename=\"portfolios_A4_Paysage.pdf\"",
                        "Content-Transfer-Encoding": "binary",
                        "Content-Type": "application/pdf",
                    },
                    path: playwrightTestFile('mock', 'print_in_project_projection', 'empty', 'Paysage_A4.pdf')
                })
            }
        });

        // Catch the first PDF
        let getPrintPromise = project.waitForGetPrintRequest();
        await runButton.click();

        let getPrintRequest = await getPrintPromise;
        let expectedParameters = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetPrint',
            'VERSION': '1.3.0',
            'FORMAT': 'application/pdf',
            'TRANSPARENT': 'true',
            'CRS': 'EPSG:2154',
            'DPI': '100',
            'TEMPLATE': 'A4 Paysage',
            'map0:SCALE': '25000',
            'map0:EXTENT': /764637\.\d+,6279743\.\d+,772062\.\d+,6284993\.\d+/,
            'map0:LAYERS': 'tramway_lines',
            'map0:STYLES': 'default',
            'map0:HIGHLIGHT_GEOM': /LINESTRING\(767027\.\d+ 6283029\.\d+,769673\.\d+ 6281707\.\d+\)/,
            //'map0:HIGHLIGHT_SYMBOL': '',
        }
        requestExpect(getPrintRequest).toContainParametersInPostData(expectedParameters);
        let searchParams = new URLSearchParams(getPrintRequest?.postData() ?? '');
        expect(searchParams.size).toBe(14);

        responseExpect(await getPrintRequest.response()).toBePdf();

        // Stop listening to WMS requests
        await page.unroute('**/service*');
    });

    test('Portfolio polygon', async ({ page }) => {
        const selectorContainer = page.locator('#project-portfolios-selector-container');
        // Selector
        const selector = selectorContainer.locator('select.portfolio-select');

        // Buttons
        const runButton = selectorContainer.locator('button.portfolio-run-button');
        const deactivateButton = selectorContainer.locator('button.portfolio-deactivate-button');

        // Select Point
        await selector.selectOption('2');

        // Draw polygon
        const project = new PrintPage(page, 'portfolios');
        await project.clickOnMap(300, 150);
        await project.clickOnMap(400, 200);
        await project.dblClickOnMap(400, 150);

        // check buttons
        await expect(runButton).not.toBeDisabled();
        await expect(deactivateButton).toBeDisabled();

        // Mock file
        await page.route('**/service*', async route => {
            const request = await route.request();
            if (request.postData()?.includes('GetPrint')) {
                await route.fulfill({
                    headers: {
                        "Content-Description": "File Transfert",
                        "Content-Disposition": "attachment; filename=\"portfolios_A4_Paysage.pdf\"",
                        "Content-Transfer-Encoding": "binary",
                        "Content-Type": "application/pdf",
                    },
                    path: playwrightTestFile('mock', 'print_in_project_projection', 'empty', 'Paysage_A4.pdf')
                })
            }
        });

        // Catch the first PDF
        let getPrintPromise = project.waitForGetPrintRequest();
        await runButton.click();

        let getPrintRequest = await getPrintPromise;
        let expectedParameters = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetPrint',
            'VERSION': '1.3.0',
            'FORMAT': 'application/pdf',
            'TRANSPARENT': 'true',
            'CRS': 'EPSG:2154',
            'DPI': '100',
            'TEMPLATE': 'A4 Paysage',
            'map0:SCALE': '12644',
            'map0:EXTENT': /766472\.\d+,6281040\.\d+,770228\.\d+,6283696\.\d+/,
            'map0:LAYERS': 'OpenStreetMap,sousquartiers',
            'map0:STYLES': 'défaut,rule-based',
            'map0:HIGHLIGHT_GEOM': /POLYGON\(\(767027\.\d+ 6283029\.\d+,769673\.\d+ 6281707\.\d+,769673\.\d+ 6283029\.\d+,767027\.\d+ 6283029\.\d+\)\)/,
            //'map0:HIGHLIGHT_SYMBOL': '',
        }
        requestExpect(getPrintRequest).toContainParametersInPostData(expectedParameters);
        let searchParams = new URLSearchParams(getPrintRequest?.postData() ?? '');
        expect(searchParams.size).toBe(14);

        // Catch the second PDF
        getPrintPromise = project.waitForGetPrintRequest();
        responseExpect(await getPrintRequest.response()).toBePdf();

        getPrintRequest = await getPrintPromise;
        expectedParameters['map0:SCALE'] = '18966';
        expectedParameters['map0:EXTENT'] = /765533\.\d+,6280377\.\d+,771166\.\d+,6284359\.\d+/;
        expectedParameters['map0:LAYERS'] = 'sousquartiers';
        expectedParameters['map0:STYLES'] = 'défaut';
        requestExpect(getPrintRequest).toContainParametersInPostData(expectedParameters);
        searchParams = new URLSearchParams(getPrintRequest?.postData() ?? '');
        expect(searchParams.size).toBe(14);

        responseExpect(await getPrintRequest.response()).toBePdf();

        // Stop listening to WMS requests
        await page.unroute('**/service*');
    });
});
