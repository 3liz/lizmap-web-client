// @ts-check
import { test, expect } from '@playwright/test';
import { PrintPage } from './pages/printpage';
import { expect as requestExpect } from './fixtures/expect-request.js'
import { playwrightTestFile } from './globals';

test.describe('Print in project projection @readonly', () => {

    test('Print empty', async ({ page }) => {
        const project = new PrintPage(page, 'print_in_project_projection');
        await project.open();
        await project.openPrintPanel();

        await project.baseLayerSelect.selectOption('project-background-color');
        await project.setPrintScale('1000');

        // Mock file
        await page.route('**/service*', async route => {
            const request = await route.request();
            if (request.postData()?.includes('GetPrint')) {
                await route.fulfill({
                    headers: {
                        "Content-Description": "File Transfert",
                        "Content-Disposition": "attachment; filename=\"print_in_project_projection_Paysage_A4.pdf\"",
                        "Content-Transfer-Encoding": "binary",
                        "Content-Type": "application/pdf",
                    },
                    path: playwrightTestFile('mock', 'print_in_project_projection', 'empty', 'Paysage_A4.pdf')
                })
            }
        });

        const getPrintPromise = project.waitForGetPrintRequest();
        await project.launchPrint();

        const getPrintRequest = await getPrintPromise;
        const expectedParameters = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetPrint',
            'VERSION': '1.3.0',
            'FORMAT': 'pdf',
            'TRANSPARENT': 'true',
            'CRS': 'EPSG:3943',
            'DPI': '100',
            'TEMPLATE': 'Paysage A4',
            'map1:EXTENT': /1697873.\d+,2216859.\d+,1698164.\d+,2217051.\d+/,
            'map1:SCALE': '1000',
            'map1:LAYERS': 'reseau',
            'map1:STYLES': 'default',
            'map1:OPACITIES': '255',
        }
        requestExpect(getPrintRequest).toContainParametersInPostData(expectedParameters);
        const searchParams = new URLSearchParams(getPrintRequest?.postData() ?? '');
        expect(searchParams.size).toBe(14)
        await getPrintRequest.response()
        await page.unroute('**/service*')
    })

    test('Print external baselayer', async ({ page }) => {
        const project = new PrintPage(page, 'print_in_project_projection');
        await project.open();
        await project.openPrintPanel();

        await project.setPrintScale('1000');

        // Mock file
        await page.route('**/service*', async route => {
            const request = await route.request();
            if (request.postData()?.includes('GetPrint')) {
                await route.fulfill({
                    headers: {
                        "Content-Description": "File Transfert",
                        "Content-Disposition": "attachment; filename=\"print_in_project_projection_Paysage_A4.pdf\"",
                        "Content-Transfer-Encoding": "binary",
                        "Content-Type": "application/pdf",
                    },
                    path:playwrightTestFile('mock', 'print_in_project_projection', 'baselayer', 'Paysage_A4.pdf')
                })
            }
        });

        const getPrintPromise = project.waitForGetPrintRequest();
        await project.launchPrint();

        const getPrintRequest = await getPrintPromise;
        const expectedParameters = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetPrint',
            'VERSION': '1.3.0',
            'FORMAT': 'pdf',
            'TRANSPARENT': 'true',
            'CRS': 'EPSG:3943',
            'DPI': '100',
            'TEMPLATE': 'Paysage A4',
            'map1:EXTENT': /1697873.\d+,2216859.\d+,1698164.\d+,2217051.\d+/,
            'map1:SCALE': '1000',
            'map1:LAYERS': 'Photographies_aeriennes,reseau',
            'map1:STYLES': 'default,default',
            'map1:OPACITIES': '255,255',
        }
        requestExpect(getPrintRequest).toContainParametersInPostData(expectedParameters);
        const searchParams = new URLSearchParams(getPrintRequest?.postData() ?? '');
        expect(searchParams.size).toBe(14)
        await getPrintRequest.response()
        await page.unroute('**/service*')
    })
})
