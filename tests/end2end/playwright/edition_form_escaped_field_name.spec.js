// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from "./pages/project";

test.describe('Bad designed table escaped field name in Form',
    {
        tag: ['@write'],
    }, () => {
    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'bad_designed__project');
        await project.open();
    });

    test('Escaped field name on form', async ({ page }) => {
        const project = new ProjectPage(page, 'bad_designed__project');
        const formRequest = await project.openEditingFormWithLayer('BAD designed table');
        await formRequest.response();

        // add data
        await page.locator('#jforms_view_edition input[name="__escaped_action__"]').fill('whatever');
        await page.locator('#jforms_view_edition input[name="BAD__escaped_space__column__escaped_space__name__escaped_space__is__escaped_quote__nt__escaped_space__it__escaped_space____escaped_question__"]').fill('314');
        // submit form
        let saveFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/saveFeature/);
        await project.editingSubmitForm();
        let saveFeatureRequest = await saveFeatureRequestPromise;
        await saveFeatureRequest.response();
        await expect(page.locator("#lizmap-edition-message")).toBeVisible();
        await expect(page.locator("#lizmap-edition-message li.jelix-msg-item-success"))
            .toHaveText("Data has been saved.");
        await page.locator("#lizmap-edition-message .btn-close").click();
    })

 

});
