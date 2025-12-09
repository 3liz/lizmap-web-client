// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'
import { ProjectPage } from "./pages/project";

test.describe('XSS', () => {

    test('Flawed data are sanitized before being displayed, no dialog from inline JS alert() appears',
        {
            tag: ['@write'],
        },async ({ page }) => {
            const project = new ProjectPage(page, 'xss');
            await project.open();

            let dialogOpens = 0;
            page.on('dialog', dialog => {
                dialog.accept();
                dialogOpens++;
            });

            // Edition: add XSS data
            const formRequest = await project.openEditingFormWithLayer('xss_layer');
            await formRequest.response();

            await project.editingField('description').fill('<script>alert("XSS")</script>');

            await project.editingSubmitForm();

            // Open popup
            await project.clickOnMap(415, 290);

            // Open attribute table
            let getFeatureRequest = await project.openAttributeTable('xss_layer');
            let getFeatureResponse = await getFeatureRequest.response();
            responseExpect(getFeatureResponse).toBeGeoJson();

            expect(dialogOpens).toEqual(0);
        });

    test('Sanitized iframe in popup',
        {
            tag: ['@readonly'],
        },async ({ page }) => {
            const project = new ProjectPage(page, 'xss');
            await project.open();

            let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeatureInfo') === true);

            // Open popup with iframe src with different origin
            await project.clickOnMap(500, 285);

            await getFeatureInfoRequestPromise;

            await expect(project.popupContent.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts allow-forms');

            // Open popup with iframe src with same origin
            await project.clickOnMap(450, 245);

            await getFeatureInfoRequestPromise;

            await expect(project.popupContent.locator('iframe')).not.toHaveAttribute('sandbox', 'allow-scripts allow-forms');
        });
});
