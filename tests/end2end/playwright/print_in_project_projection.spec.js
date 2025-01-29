// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';;

test.describe('Print in project projection', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=print_in_project_projection';
        await gotoMap(url, page);

        await page.locator('#button-print').click();
    });

    test('Print empty', async ({ page }) => {
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('empty');
        await page.locator('#print-scale').selectOption('1000');

        const getPrintPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetPrint') === true);
        await page.locator('#print-launch').click();

        const getPrintRequest = await getPrintPromise;
        const getPrintPostData = getPrintRequest.postData();
        expect(getPrintPostData).toContain('SERVICE=WMS')
        expect(getPrintPostData).toContain('REQUEST=GetPrint')
        expect(getPrintPostData).toContain('VERSION=1.3.0')
        expect(getPrintPostData).toContain('FORMAT=pdf')
        expect(getPrintPostData).toContain('TRANSPARENT=true')
        expect(getPrintPostData).toContain('CRS=EPSG%3A3943')
        expect(getPrintPostData).toContain('DPI=100')
        expect(getPrintPostData).toContain('TEMPLATE=Paysage%20A4')
        expect(getPrintPostData).toMatch(/map1%3AEXTENT=1697873.\d+%2C2216859.\d+%2C1698164.\d+%2C2217051.\d+/)
        expect(getPrintPostData).toContain('map1%3ASCALE=1000')
        expect(getPrintPostData).toContain('map1%3ALAYERS=reseau')
        expect(getPrintPostData).toContain('map1%3ASTYLES=default')
        expect(getPrintPostData).toContain('map1%3AOPACITIES=255')
        // Disabled because of the migration when project is saved with QGIS >= 3.32
        // expect(getPrintPostData).toContain('multiline_label=Multiline%20label');
    })

    test('Print external baselayer', async ({ page }) => {
        await page.locator('#print-scale').selectOption('1000');

        const getPrintPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetPrint') === true);
        await page.locator('#print-launch').click();

        const getPrintRequest = await getPrintPromise;
        const getPrintPostData = getPrintRequest.postData();
        expect(getPrintPostData).toContain('SERVICE=WMS')
        expect(getPrintPostData).toContain('REQUEST=GetPrint')
        expect(getPrintPostData).toContain('VERSION=1.3.0')
        expect(getPrintPostData).toContain('FORMAT=pdf')
        expect(getPrintPostData).toContain('TRANSPARENT=true')
        expect(getPrintPostData).toContain('CRS=EPSG%3A3943')
        expect(getPrintPostData).toContain('DPI=100')
        expect(getPrintPostData).toContain('TEMPLATE=Paysage%20A4')
        expect(getPrintPostData).toMatch(/map1%3AEXTENT=1697873.\d+%2C2216859.\d+%2C1698164.\d+%2C2217051.\d+/)
        expect(getPrintPostData).toContain('map1%3ASCALE=1000')
        expect(getPrintPostData).toContain('map1%3ALAYERS=Photographies_aeriennes%2Creseau')
        expect(getPrintPostData).toContain('map1%3ASTYLES=default%2Cdefault')
        expect(getPrintPostData).toContain('map1%3AOPACITIES=255%2C255')
        // Disabled because of the migration when project is saved with QGIS >= 3.32
        // expect(getPrintPostData).toContain('multiline_label=Multiline%20label');
    })
})
