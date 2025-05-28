// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap, expectParametersToContain, playwrightTestFile } from './globals';

test.describe('Print in project projection', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=print_in_project_projection';
        await gotoMap(url, page);

        await page.locator('#button-print').click();
    });

    test('Print empty', async ({ page }) => {
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('empty');
        await page.locator('#print-scale').selectOption('1000');

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

        const getPrintPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetPrint') === true);
        await page.locator('#print-launch').click();

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
            // Disabled because of the migration when project is saved with QGIS >= 3.32
            // 'multiline_label': 'Multiline label',
        }
        const getPrintParams = await expectParametersToContain('Print empty', getPrintRequest.postData() ?? '', expectedParameters)
        await expect(getPrintParams.size).toBe(14)
        await getPrintRequest.response()
        await page.unroute('**/service*')
    })

    test('Print external baselayer', async ({ page }) => {
        await page.locator('#print-scale').selectOption('1000');

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

        const getPrintPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetPrint') === true);
        await page.locator('#print-launch').click();

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
            // Disabled because of the migration when project is saved with QGIS >= 3.32
            // 'multiline_label': 'Multiline label',
        }
        const getPrintParams = await expectParametersToContain('Print external baselayer', getPrintRequest.postData() ?? '', expectedParameters)
        await expect(Array.from(getPrintParams.keys())).toHaveLength(14)
        await getPrintRequest.response()
        await page.unroute('**/service*')
    })
})
