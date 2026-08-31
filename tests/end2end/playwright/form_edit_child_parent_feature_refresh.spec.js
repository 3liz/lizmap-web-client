// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';

test.describe('Creating a child feature after the parent has been edited',
    {
        tag: ['@write'],
    },
    () => {
        test('The foreign key uses the current value of the parent feature', async ({ page }) => {
            const project = new ProjectPage(page, 'form_edit_related_child_data');
            await project.open();

            const districtToolbar = () => project.popupContent.locator(
                'lizmap-feature-toolbar[value^="quartiers_"][value$=".6"]'
            );
            const foreignKey = project.editionForm.locator('select[name="quartmno"]');

            const openDistrictPopup = async () => {
                // map.js switches the dock to #popupcontent only when the clicked
                // position differs from the previous identify. The same feature is
                // clicked again here, so the popup can stay behind the edition dock
                // and has to be brought back explicitly.
                const getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
                await project.clickOnMap(630, 325);
                await (await getFeatureInfoPromise).response();

                try {
                    await expect(districtToolbar()).toBeVisible({ timeout: 2000 });
                } catch {
                    await page.locator('#button-popupcontent').click();
                    await expect(districtToolbar()).toBeVisible();
                }
            };

            const createSubdistrict = async () => {
                const createFeaturePromise = page.waitForResponse(/lizmap\/edition\/createFeature/);
                await districtToolbar().locator('.feature-create-child button.dropdown-toggle').click();
                await districtToolbar().locator('.feature-create-child ul li a').click();
                await createFeaturePromise;
            };

            const cancelForm = async () => {
                page.once('dialog', dialog => dialog.accept());
                await project.editingSubmit('cancel').click();
            };

            const setDistrictReference = async (value) => {
                await districtToolbar().locator('button.feature-edit').click();
                await expect(project.editionForm).toBeVisible();
                await project.editingField('quartmno').fill(value);
                await project.editingSubmitForm('close');
            };

            // Create a child feature once, so that the parent feature is put in the
            // client side cache read by lizMap.getLayerFeature
            await openDistrictPopup();
            await createSubdistrict();
            const formerValue = await foreignKey.inputValue();
            expect(formerValue).not.toBe('');
            await cancelForm();

            // Change the referenced field of the parent feature. It is a varchar(2),
            // and other tests filter on its values, so it is written back at the end.
            const newValue = formerValue === 'ZZ' ? 'ZY' : 'ZZ';
            await openDistrictPopup();
            await setDistrictReference(newValue);

            // The new child feature must be linked to the saved value, not to the one
            // cached before the parent was edited
            await openDistrictPopup();
            await createSubdistrict();
            await expect(foreignKey).toHaveValue(newValue);
            await cancelForm();

            // Write back the original data
            await openDistrictPopup();
            await setDistrictReference(formerValue);
        });
    });
