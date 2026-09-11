// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from "./pages/project";

test.describe('Edition Form Validation',
    {
        tag: ['@write'],
    }, () => {
    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'bad_designed__project');
        await project.open();
    });

    test('Input type string on action field ', async ({ page }) => {
        const project = new ProjectPage(page, 'bad_designed__project');
        const formRequest = await project.openEditingFormWithLayer('BAD designed table');
        await formRequest.response();

        // add data
        await page.locator('#jforms_view_edition input[name="__escaped_action__"]').fill('whatevee');

        // submit form
        let saveFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/saveFeature/);
        await project.editingSubmitForm();
        let saveFeatureRequest = await saveFeatureRequestPromise;
        await saveFeatureRequest.response();
    })

 

});
