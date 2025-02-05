// @ts-check
import { test, expect } from '@playwright/test';
import {ProjectPage} from "./pages/project";
import {editedFeatureIds} from "./globals";


test.describe(
    'Drag and drop from, editing test data',
    {
        tag: ['@write'],
    }, () =>
    {

        test('With new geom data creation, not remove data', async function ({ page }) {
            const project = new ProjectPage(page, 'dnd_form');
            await project.open();
            await project.openEditingFormWithLayer('dnd_form_geom');
            await project.dock.getByText('tab2').click();
            await project.editingField('field_in_dnd_form').fill('value in DND form');
            await project.clickOnMapLegacy(600, 200);

            await project.editingSubmitForm();
            const ids = await editedFeatureIds(page);

            await project.clickOnMap(600, 200);
            await expect(project.popupContent).toBeVisible();

            // Fixme if there is a better way to get the table from the ID in the cell
            // if the test is run multiple times, Postgres will increment the ID
            const table = await project.popupContent.getByRole("row", { name: ids['id'] }).locator("..");
            await expect(table).toBeVisible();

            // First row
            await expect(table.locator('tr:nth-child(1) th')).toHaveText('id');
            await expect(table.locator('tr:nth-child(1) td')).toHaveText(ids['id']);
            ///Second row
            await expect(table.locator('tr:nth-child(2) > th')).toHaveText('field_in_dnd_form');
            await expect(table.locator('tr:nth-child(2) > td')).toHaveText('value in DND form');
            // Third row should be hidden
            await expect(table.locator('tr:nth-child(3)')).toHaveClass('empty-data');
            await expect(table.locator('tr:nth-child(3) > th')).toHaveText('field_not_in_dnd_form');
            await expect(table.locator('tr:nth-child(3) > td')).toBeEmpty();
        });

        test('With non spatial data creation, not remove data', async function ({ page }) {
            const project = new ProjectPage(page, 'dnd_form');
            await project.open();
            await project.openAttributeTable('dnd_form');

            await project.bottomDock.locator(".btn-createFeature-attributeTable").click();
            await expect(project.dock).toBeVisible();

            await project.dock.getByText('tab2').click();
            await project.editingField('field_in_dnd_form').fill('value in DND form');
            await project.editingSubmitForm('close');
            const ids = await editedFeatureIds(page);

            const table = await project.attributeTableHtml('dnd_form');
            // Columns
            await expect(table.locator('thead tr th:nth-child(2)')).toHaveText('id');
            await expect(table.locator('thead tr th:nth-child(3)')).toHaveText('Field in');
            await expect(table.locator('thead tr th:nth-child(4)')).toHaveText('Field not in');

            // Last row in the table, if the test run multiple times
            await expect(table.locator('tbody tr:last-child td:nth-child(2)')).toHaveText(ids['id']);
            await expect(table.locator('tbody tr:last-child td:nth-child(3)')).toHaveText('value in DND form');
            await expect(table.locator('tbody tr:last-child td:nth-child(4)')).toBeEmpty();
        });

        test('With editing existing data, not remove data', async function ({ page }) {
            const project = new ProjectPage(page, 'dnd_form');
            await project.open();
            await project.openAttributeTable('dnd_form_geom');

            // Button detail to open the popup inside the attribute table panel
            await page.locator('.btn-detail-attributeTable').click();

            // Define some locator
            // The popup inside the attribute table panel
            const popup = project.bottomDock.locator('.lizmapPopupSingleFeature > div > table > tbody');
            // First should be the test data, without any new feature, in theory
            const firstLine = await project.attributeTableHtml('dnd_form_geom').locator("tbody tr").first();
            const featureEdit = await firstLine.locator('.feature-edit').first();

            await firstLine.click();

            // Check the auto popup
            await expect(popup.locator('tr:nth-child(1) > th')).toHaveText('id');
            await expect(popup.locator('tr:nth-child(1) > td')).toHaveText('1');

            await expect(popup.locator('tr:nth-child(2) > th')).toHaveText('field_in_dnd_form');
            await expect(popup.locator('tr:nth-child(2) > td')).toHaveText('test_geom');

            await expect(popup.locator('tr:nth-child(3) > th')).toHaveText('field_not_in_dnd_form');
            await expect(popup.locator('tr:nth-child(3) > td')).toHaveText('test_geom');

            // Assert data has not been removed after form submission without modification
            await featureEdit.click();
            await project.editingSubmitForm();

            // Check popup content again
            // Fixme, strange, the test doesn't re-click on the row, so the test is false, because the popup is not refreshed
            // Check the auto popup
            await expect(popup.locator('tr:nth-child(1) > th')).toHaveText('id');
            await expect(popup.locator('tr:nth-child(1) > td')).toHaveText('1');

            await expect(popup.locator('tr:nth-child(2) > th')).toHaveText('field_in_dnd_form');
            await expect(popup.locator('tr:nth-child(2) > td')).toHaveText('test_geom');

            await expect(popup.locator('tr:nth-child(3) > th')).toHaveText('field_not_in_dnd_form');
            await expect(popup.locator('tr:nth-child(3) > td')).toHaveText('test_geom');

            // Assert data has changed after form submission with modification
            await featureEdit.click();
            // Switch to the second tab
            await project.dock.getByText('tab2').click();
            await project.editingField('field_in_dnd_form').clear();
            await project.editingField('field_in_dnd_form').fill('modified');
            await project.editingSubmitForm();

            // Click on the line to refresh popup info
            await firstLine.first().click();

            // Check popup content again
            await expect(popup.locator('tr:nth-child(1) > th')).toHaveText('id');
            await expect(popup.locator('tr:nth-child(1) > td')).toHaveText('1');

            await expect(popup.locator('tr:nth-child(2) > th')).toHaveText('field_in_dnd_form');
            await expect(popup.locator('tr:nth-child(2) > td')).toHaveText('modified');

            await expect(popup.locator('tr:nth-child(3) > th')).toHaveText('field_not_in_dnd_form');
            await expect(popup.locator('tr:nth-child(3) > td')).toHaveText('test_geom');

            // Write back original data
            // Fixme refresh database data?
            await page.waitForTimeout(300);
            await featureEdit.click();
            await project.dock.getByText('tab2').click();
            await project.editingField('field_in_dnd_form').clear();
            await project.editingField('field_in_dnd_form').fill('test_geom');
            await project.editingSubmitForm();
        });
    });
