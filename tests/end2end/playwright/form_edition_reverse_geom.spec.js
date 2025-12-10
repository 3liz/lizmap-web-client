import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';
import { expect as requestExpect } from './fixtures/expect-request.js'
import { expect as responseExpect } from './fixtures/expect-response.js'

test.describe('Form edition reverse geom', function () {

    test('must reverse geom @readonly', async function ({ page }) {
        const project = new ProjectPage(page, 'reverse_geom');
        let getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();
        let getMapRequest = await getMapRequestPromise;

        const getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'reverse_geom_layer',
            'CRS': 'EPSG:3857',
            'STYLES': 'default',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /429604.5\d+,5405017.0\d+,432139.2\d+,5406691.8\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);

        let getMapResponse = await getMapRequest.response();
        responseExpect(getMapResponse).toBeImagePng();
        // Check response body
        let getMapBody = await getMapResponse?.body();
        expect(getMapBody).toBeInstanceOf(Buffer);
        let getMapBodyLength = getMapBody ? getMapBody.length : 0;
        expect(getMapBodyLength).toBeGreaterThanOrEqual(13000); // 13481
        expect(getMapBodyLength).toBeLessThanOrEqual(14000); // 13481

        let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(436, 292);
        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        await expect(project.dock).toBeVisible()
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveCount(1);
        await expect(project.dock.locator('.lizmapPopupTitle')).toHaveText('reverse_geom');
        await expect(page.locator('#popupcontent lizmap-feature-toolbar .feature-edit')).not.toHaveClass(/hide/);

        let editFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/editFeature/);;
        await page.locator('#popupcontent lizmap-feature-toolbar .feature-edit').click();
        const editFeatureRequest = await editFeatureRequestPromise;
        responseExpect(await editFeatureRequest.response()).toBeTextPlain();

        await expect(page.locator("#lizmap-edition-message")).toBeVisible();
        await page.locator("#lizmap-edition-message .btn-close").click();
        await expect(page.locator("#lizmap-edition-message")).toHaveCount(0);

        expect(page.locator('.edition-tabs button[data-bs-target="#tabdigitization"]')).toBeVisible();
        await page.locator('.edition-tabs button[data-bs-target="#tabdigitization"]').click();

        expect(page.locator('#tabdigitization lizmap-reverse-geom')).toBeVisible();
        await page.locator('#tabdigitization lizmap-reverse-geom').click();

        await expect(page.locator("#lizmap-edition-message")).toBeVisible();
        await expect(page.locator("#lizmap-edition-message")).toContainClass('alert-success');
        await expect(page.locator("#lizmap-edition-message")).toContainText('Geometry has been reversed. You can now save the form.');
        await page.locator("#lizmap-edition-message .btn-close").click();
    });

});
