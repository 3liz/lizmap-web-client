import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';
import { expect as responseExpect } from './fixtures/expect-response.js'

test.describe('Form edition', function () {

    test.beforeEach(async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition');
        const getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();
        const getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();
    });

    test('must not show digitization tab for non geom layers @readonly', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition');

        const formRequest = await project.openEditingFormWithLayer('end2end_form_edition');
        await formRequest.response();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        expect(page.locator('.edition-tabs a[href="#tabdigitization"]')).not.toBeVisible();

        // Cancel form
        page.on('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();
    });

    test('must show digitization tab for geom layers @readonly', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition');

        const formRequest = await project.openEditingFormWithLayer('end2end_form_edition_geom');
        await formRequest.response();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        expect(page.locator('.edition-tabs a[href="#tabdigitization"]')).toBeVisible();

        // Cancel form
        page.on('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();
    });

    test('must show edition form when edition launched via attribute table @readonly', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition');
        const tableName = 'end2end_form_edition';

        let getFeatureRequest = await project.openAttributeTable(tableName);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        let tableHtml = project.attributeTableHtml(tableName);
        await expect(tableHtml.locator('tbody tr')).not.toHaveCount(0);
        await expect(tableHtml.locator('tbody tr .feature-edit')).not.toHaveCount(0);

        let editFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/editFeature/);;
        tableHtml.locator('tbody tr .feature-edit').first().click();
        const editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        // Cancel form
        page.on('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();
    });

    test('must show edition form, submit form and gets success message @write', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition');

        const formRequest = await project.openEditingFormWithLayer('end2end_form_edition');
        await formRequest.response();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        await project.editingField('value').fill('42');

        // submit the form
        let editFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/editFeature/);;
        await project.editingSubmitForm('edit');
        const editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        // Assert success message is displayed
        await expect(page.locator("div.alert.alert-success")).toBeVisible();
    });

    test('must save feature without geom and allow geom creation when not existing @write', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition');
        const tableName = 'end2end_form_edition_geom';

        const formRequest = await project.openEditingFormWithLayer(tableName);
        await formRequest.response();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        await project.editingField('value').fill('42');

        // Save feature without geom
        let saveFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/saveFeature/);
        await project.editingSubmitForm();
        let saveFeatureRequest = await saveFeatureRequestPromise;
        await saveFeatureRequest.response();

        // Assert success message is displayed
        await expect(page.locator('#edition-form-container')).toBeHidden();
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();

        let getFeatureRequest = await project.openAttributeTable(tableName);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        let tableHtml = project.attributeTableHtml(tableName);
        await expect(tableHtml.locator('tbody tr')).not.toHaveCount(0);
        await expect(tableHtml.locator('tbody tr .feature-edit')).not.toHaveCount(0);
        await expect(tableHtml.locator('tbody tr .feature-delete')).not.toHaveCount(0);

        let editFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/editFeature/);
        tableHtml.locator('tbody tr .feature-edit').first().click();
        let editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        await project.clickOnMapLegacy(630-30 , 325-75);

        // submit the form
        saveFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/saveFeature/);
        await project.editingSubmitForm();
        saveFeatureRequest = await saveFeatureRequestPromise;
        await saveFeatureRequest.response();

        // Assert success message is displayed
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();

        page.on('dialog', dialog => dialog.accept());
        let deleteFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/deleteFeature/);
        tableHtml.locator('tbody tr .feature-delete').first().click();
        let deleteFeatureRequest = await deleteFeatureRequestPromise;
        await deleteFeatureRequest.response();

        // Assert success message is displayed
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();
    });
});
