// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Display in layer tree', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map?repository=testsrepository&project=display_in_legend';
        await page.goto(url, { waitUntil: 'networkidle' });
    });

    test('display in layer tree unchecked => layer not visible in layer tree and layer in print request', async ({ page }) => {
        // layer not visible in layer tree
        await expect(page.getByTestId('polygons')).toHaveCount(0);

        const getPrintRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData() != null && request.postData().includes('GetPrint'));

        // layer in print request
        const getPrintRequestContains = request => {
            const postData = request.postData();
            expect(postData).toContain('SERVICE=WMS')
            expect(postData).toContain('REQUEST=GetPrint')
            expect(postData).toContain('map0%3ALAYERS=project-background-color%2Cpolygons')
        };

        await page.locator('#button-print').click();

        await page.locator('#print-launch').click();
        getPrintRequestContains(await getPrintRequestPromise);

        await page.getByTestId('Shapefiles').locator('input').first().uncheck();
        await page.locator('#print-launch').click();
        getPrintRequestContains(await getPrintRequestPromise);

        await page.getByTestId('townhalls_EPSG2154').locator('input').first().check();
        await page.locator('#print-launch').click();
        getPrintRequestContains(await getPrintRequestPromise);

        await page.getByTestId('Shapefiles').locator('input').first().uncheck();
        await page.locator('#print-launch').click();
        getPrintRequestContains(await getPrintRequestPromise);
    });
})
