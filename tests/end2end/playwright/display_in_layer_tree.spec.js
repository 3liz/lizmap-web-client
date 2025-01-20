// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';
import {ProjectPage} from "./pages/project";

test.describe('Display in layer tree',
    {
        tag: ['@readonly', '@legend'],
    },  () => {

    test('display in layer tree unchecked => layer not visible in layer tree and layer in print request',
        async ({ page }) => {
        const project = new ProjectPage(page, 'display_in_legend');
        await project.open();

        // layer not visible in layer tree
        await expect(page.getByTestId('polygons')).toHaveCount(0);
        await expect(page.getByTestId('group-without-children')).toHaveCount(0);

        const getPrintRequestPromise = page.waitForRequest(
            request => request.method() === 'POST' &&
                request.postData() != null && request.postData()?.includes('GetPrint') === true);

        // layer in print request
        const getPrintRequestContains = request => {
            const postData = request.postData();
            expect(postData).toContain('SERVICE=WMS')
            expect(postData).toContain('REQUEST=GetPrint')
            expect(postData).toContain('map0%3ALAYERS=polygons')
        };

        await project.buttonPrintPanel.click();
        await project.buttonPrintLaunch.click();
        getPrintRequestContains(await getPrintRequestPromise);

        await page.getByTestId('Shapefiles').locator('input').first().uncheck();
        await project.buttonPrintLaunch.click();
        getPrintRequestContains(await getPrintRequestPromise);

        await page.getByTestId('townhalls_EPSG2154').locator('input').first().check();
        await project.buttonPrintLaunch.click();
        getPrintRequestContains(await getPrintRequestPromise);

        await page.getByTestId('Shapefiles').locator('input').first().uncheck();
        await project.buttonPrintLaunch.click();
        getPrintRequestContains(await getPrintRequestPromise);
    });
})
