// @ts-check
const { test, expect } = require('@playwright/test');
const { gotoMap } = require('./globals');

test.describe('Print in project projection', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=print_in_project_projection';
        await gotoMap(url, page);

        await page.locator('#button-print').click();
    });

    test('Print empty', async ({ page }) => {
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('empty');
        await page.locator('#print-scale').selectOption('1000');
        page.once('request', request => {
            const postData = request.postData();
            expect(postData).toContain('SERVICE=WMS')
            expect(postData).toContain('REQUEST=GetPrint')
            expect(postData).toContain('VERSION=1.3.0')
            expect(postData).toContain('FORMAT=pdf')
            expect(postData).toContain('TRANSPARENT=true')
            expect(postData).toContain('CRS=EPSG%3A3943')
            expect(postData).toContain('DPI=100')
            expect(postData).toContain('TEMPLATE=Paysage%20A4')
            expect(postData).toMatch(/map1%3AEXTENT=1697873.\d+%2C2216859.\d+%2C1698164.\d+%2C2217051.\d+/)
            expect(postData).toContain('map1%3ASCALE=1000')
            expect(postData).toContain('map1%3ALAYERS=reseau')
            expect(postData).toContain('map1%3ASTYLES=default')
            expect(postData).toContain('map1%3AOPACITIES=255')
            // Disabled because of the migration when project is saved with QGIS >= 3.32
            // expect(postData).toContain('multiline_label=Multiline%20label');
        });
        await page.locator('#print-launch').click();
    })

    test('Print external baselayer', async ({ page }) => {
        await page.locator('#print-scale').selectOption('1000');
        page.once('request', request => {
            const postData = request.postData();
            expect(postData).toContain('SERVICE=WMS')
            expect(postData).toContain('REQUEST=GetPrint')
            expect(postData).toContain('VERSION=1.3.0')
            expect(postData).toContain('FORMAT=pdf')
            expect(postData).toContain('TRANSPARENT=true')
            expect(postData).toContain('CRS=EPSG%3A3943')
            expect(postData).toContain('DPI=100')
            expect(postData).toContain('TEMPLATE=Paysage%20A4')
            expect(postData).toMatch(/map1%3AEXTENT=1697873.\d+%2C2216859.\d+%2C1698164.\d+%2C2217051.\d+/)
            expect(postData).toContain('map1%3ASCALE=1000')
            expect(postData).toContain('map1%3ALAYERS=Photographies_aeriennes%2Creseau')
            expect(postData).toContain('map1%3ASTYLES=default%2Cdefault')
            expect(postData).toContain('map1%3AOPACITIES=255%2C255')
            // Disabled because of the migration when project is saved with QGIS >= 3.32
            // expect(postData).toContain('multiline_label=Multiline%20label');
        });
        await page.locator('#print-launch').click();
    })
})
