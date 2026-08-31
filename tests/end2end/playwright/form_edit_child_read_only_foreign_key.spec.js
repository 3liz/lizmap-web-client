// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';

test.describe('Creating a child feature with a read-only foreign key',
    {
        tag: ['@readonly'],
    },
    () => {
        test('The foreign key is carried by a dedicated hidden input', async ({ page }) => {
            const project = new ProjectPage(page, 'form_edit_related_child_data');
            await project.open();

            // Display the popup of a district
            const getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
            await project.clickOnMap(630, 325);
            await getFeatureInfoPromise;

            const featureToolbar = project.popupContent.locator('lizmap-feature-toolbar[value^="quartiers_"][value$=".6"]');
            await expect(featureToolbar).toHaveCount(1);

            // Create a subdistrict, the child layer of the district
            const createFeaturePromise = page.waitForResponse(/lizmap\/edition\/createFeature/);
            await featureToolbar.locator('.feature-create-child button.dropdown-toggle').click();
            await featureToolbar.locator('.feature-create-child ul li a').click();
            await createFeaturePromise;

            // The foreign key field is not editable in the QGIS project, so jForms
            // renders a disabled select. A disabled control is not submitted by the
            // browser, and jForms ignores request values of read-only controls, so
            // the value cannot be carried by the control itself.
            const foreignKey = project.editionForm.locator('select[name="quartmno"]');
            await expect(foreignKey).toHaveCount(1);
            await expect(foreignKey).toBeDisabled();

            // It is sent in a dedicated parameter instead, as "<field>:<value>"
            const parentForeignKey = project.editionForm.locator('input[name="liz_parent_fk"]');
            await expect(parentForeignKey).toHaveCount(1);
            await expect(parentForeignKey).toHaveValue(/^quartmno:.+$/);

            // and it holds the value of the parent feature
            const parentValue = (await parentForeignKey.inputValue()).split(':')[1];
            await expect(foreignKey).toHaveValue(parentValue);

            // Close the form without saving
            page.once('dialog', dialog => dialog.accept());
            await project.editingSubmit('cancel').click();
        });
    });
