import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';
import { expect as responseExpect } from './fixtures/expect-response.js'
import { expect as requestExpect } from './fixtures/expect-request.js'

test.describe('Editing relational data', function () {

    test('Check the child table has been moved in the expected div @readonly', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edit_related_child_data');
        await project.open();

        // Click on a feature then launch its edition form
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(630, 325);
        let getFeatureInfoRequest = await getFeatureInfoPromise;
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        const featureToolbar = project.popupContent.locator('lizmap-feature-toolbar[value^="quartiers_"][value$=".6"]');
        await expect(featureToolbar).toHaveCount(1);
        await expect(featureToolbar).toBeVisible();
        await expect(featureToolbar.locator('button.feature-edit')).toBeVisible();

        let editFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/editFeature/);
        await featureToolbar.locator('button.feature-edit').click();
        let editFeatureRequest = await editFeatureRequestPromise;
        let expectedEditFeatureParameters = {
            'layerId': /^quartiers_/,
            'featureId': '6',
        };
        requestExpect(editFeatureRequest).toContainParametersInUrl(expectedEditFeatureParameters);
        await editFeatureRequest.response();

        await expect(page.locator('#jforms_view_edition-tab1-group2-relation1 div.attribute-layer-child-content')).toHaveCount(1);

        // Close form
        page.once('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();
    });
});
