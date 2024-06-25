// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Print in project projection', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=print_in_project_projection';
        await page.goto(url, { waitUntil: 'networkidle' });

        await page.getByRole('cell', { name: 'Expand Display/Hide ign-photo' }).getByRole('button').click();
        await page.locator('#button-print').click();
    });

    test('Print empty', async ({ page }) => {
        await page.locator('#print-scale').selectOption('1000');
        page.once('request', request => {
            const postData = request.postData();
            expect(postData).toContain('SERVICE=WMS')
            expect(postData).toContain('REQUEST=GetPrint')
            expect(postData).toContain('VERSION=1.3.0')
            expect(postData).toContain('FORMAT=pdf')
            expect(postData).toContain('EXCEPTIONS=application%2Fvnd.ogc.se_inimage')
            expect(postData).toContain('TRANSPARENT=true')
            expect(postData).toContain('SRS=EPSG%3A3943')
            expect(postData).toContain('DPI=100')
            expect(postData).toContain('TEMPLATE=Paysage%20A4')
            expect(postData).toMatch(/map1%3Aextent=1697877.\d+%2C2216862.\d+%2C1698160.\d+%2C2217048.\d+/)
            expect(postData).toContain('map1%3Ascale=1000')
            expect(postData).toContain('map1%3ALAYERS=reseau')
            expect(postData).toContain('map1%3ASTYLES=d%C3%A9faut')
            // Disabled because of the migration when project is saved with QGIS >= 3.32
            // expect(postData).toContain('multiline_label=Multiline%20label');
        });
        await page.locator('#print-launch').click();
    })

    test('Print external baselayer', async ({ page }) => {
        await page.locator('#switcher-baselayer-select').selectOption('ignphoto');
        await page.locator('#print-scale').selectOption('1000');
        page.once('request', request => {
            const postData = request.postData();
            expect(postData).toContain('SERVICE=WMS')
            expect(postData).toContain('REQUEST=GetPrint')
            expect(postData).toContain('VERSION=1.3.0')
            expect(postData).toContain('FORMAT=pdf')
            expect(postData).toContain('EXCEPTIONS=application%2Fvnd.ogc.se_inimage')
            expect(postData).toContain('TRANSPARENT=true')
            expect(postData).toContain('SRS=EPSG%3A3943')
            expect(postData).toContain('DPI=100')
            expect(postData).toContain('TEMPLATE=Paysage%20A4')
            expect(postData).toMatch(/map1%3Aextent=1697877.\d+%2C2216862.\d+%2C1698160.\d+%2C2217048.\d+/)
            expect(postData).toContain('map1%3Ascale=1000')
            expect(postData).toContain('map1%3ALAYERS=ign-photo%2Creseau')
            expect(postData).toContain('map1%3ASTYLES=%2Cd%C3%A9faut')
            // Disabled because of the migration when project is saved with QGIS >= 3.32
            // expect(postData).toContain('multiline_label=Multiline%20label');
        });
        await page.locator('#print-launch').click();
    })
})
