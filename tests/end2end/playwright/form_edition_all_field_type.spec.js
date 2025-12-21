import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';
import { expect as responseExpect } from './fixtures/expect-response.js'

const tableName = 'form_edition_all_fields_types';

test.describe('Form edition all field type', function () {

    test.beforeEach(async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_all_field_type');
        await project.open();

        const formRequest = await project.openEditingFormWithLayer(tableName);
        await formRequest.response();
    });

    test('form content @readonly', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_all_field_type');

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        // The id field must be an input number
        let fieldLocator = project.editingField('id');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('INPUT');
        await expect(fieldLocator).toHaveId('jforms_view_edition_id');
        await expect(fieldLocator).toHaveAttribute('name', 'id');
        await expect(fieldLocator).toHaveAttribute('type', 'number');
        await expect(fieldLocator).toHaveAttribute('step', 'any');
        await expect(fieldLocator).not.toHaveAttribute('min');
        await expect(fieldLocator).not.toHaveAttribute('max');
        await expect(fieldLocator).toContainClass('jforms-ctrl-input');
        await expect(fieldLocator).not.toBeDisabled();

        // The integer_field must be an input number
        fieldLocator = project.editingField('integer_field');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('INPUT');
        await expect(fieldLocator).toHaveId('jforms_view_edition_integer_field')
        await expect(fieldLocator).toHaveAttribute('name', 'integer_field');
        await expect(fieldLocator).toHaveAttribute('type', 'number');
        await expect(fieldLocator).toHaveAttribute('step', '5');
        await expect(fieldLocator).toHaveAttribute('min', '-200');
        await expect(fieldLocator).toHaveAttribute('max', '200');
        await expect(fieldLocator).toContainClass('jforms-ctrl-input');
        await expect(fieldLocator).not.toBeDisabled();

        // The boolean_nullable field must be a list
        fieldLocator = project.editingField('boolean_nullable');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('SELECT');
        await expect(fieldLocator).toHaveId('jforms_view_edition_boolean_nullable')
        await expect(fieldLocator).toHaveAttribute('name', 'boolean_nullable');
        await expect(fieldLocator).toHaveAttribute('size', '1');
        await expect(fieldLocator).toContainClass('jforms-ctrl-menulist');
        await expect(fieldLocator).not.toBeDisabled();
        let selectValues = [];
        for (const option of await fieldLocator.locator('option').all()) {
            selectValues.push(await option.getAttribute('value'));
        }
        expect(selectValues).toEqual(['', 't', 'f']);
        fieldLocator.selectOption('True');
        await expect(fieldLocator).toHaveValue('t');
        fieldLocator.selectOption('');
        await expect(fieldLocator).toHaveValue('');
        fieldLocator.selectOption('False');
        await expect(fieldLocator).toHaveValue('f');

        // The boolean_notnull_for_checkbox field must be a checkbox
        fieldLocator = project.editingField('boolean_notnull_for_checkbox');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('INPUT');
        await expect(fieldLocator).toHaveId('jforms_view_edition_boolean_notnull_for_checkbox')
        await expect(fieldLocator).toHaveAttribute('name', 'boolean_notnull_for_checkbox');
        await expect(fieldLocator).toHaveAttribute('type', 'checkbox');
        await expect(fieldLocator).toHaveAttribute('value', 't');
        await expect(fieldLocator).toContainClass('jforms-ctrl-checkbox');
        await expect(fieldLocator).not.toBeDisabled();
        await expect(fieldLocator).not.toBeChecked();

        // The boolean_readonly field must be a checkbox
        fieldLocator = project.editingField('boolean_readonly');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('INPUT');
        await expect(fieldLocator).toHaveId('jforms_view_edition_boolean_readonly')
        await expect(fieldLocator).toHaveAttribute('name', 'boolean_readonly');
        await expect(fieldLocator).toHaveAttribute('type', 'checkbox');
        await expect(fieldLocator).toHaveAttribute('value', 't');
        await expect(fieldLocator).toContainClass('jforms-ctrl-checkbox');
        await expect(fieldLocator).toBeDisabled();
        await expect(fieldLocator).not.toBeChecked();

        // integer_array field is a multi values
        fieldLocator = project.editingField('integer_array');
        await expect(fieldLocator).toHaveCount(0);
        fieldLocator = project.editingField('integer_array[]');
        await expect(fieldLocator).toHaveCount(10);
        for (const input of await fieldLocator.all()) {
            expect(await input.evaluate(elt => elt.tagName)).toBe('INPUT');
            await expect(input).toHaveId(/jforms_view_edition_integer_array_\d/)
            await expect(input).toHaveAttribute('name', 'integer_array[]');
            await expect(input).toHaveAttribute('type', 'checkbox');
            await expect(input).toHaveAttribute('value', /\d/);
            await expect(input).toContainClass('jforms-ctrl-checkboxes');
            await expect(input).not.toBeDisabled();
            await expect(input).not.toBeChecked();
            await expect(input).not.toBeHidden();
        }

        // text field is a multi values
        fieldLocator = project.editingField('text');
        await expect(fieldLocator).toHaveCount(0);
        fieldLocator = project.editingField('text[]');
        await expect(fieldLocator).toHaveCount(10);
        for (const input of await fieldLocator.all()) {
            expect(await input.evaluate(elt => elt.tagName)).toBe('INPUT');
            await expect(input).toHaveId(/jforms_view_edition_text_\d/)
            await expect(input).toHaveAttribute('name', 'text[]');
            await expect(input).toHaveAttribute('type', 'checkbox');
            await expect(input).toHaveAttribute('value', /\w/);
            await expect(input).toContainClass('jforms-ctrl-checkboxes');
            await expect(input).not.toBeDisabled();
            await expect(input).not.toBeChecked();
            await expect(input).not.toBeHidden();
        }

        // uids field is a multi values
        fieldLocator = project.editingField('uids');
        await expect(fieldLocator).toHaveCount(0);
        fieldLocator = project.editingField('uids[]');
        await expect(fieldLocator).toHaveCount(5);
        for (const input of await fieldLocator.all()) {
            expect(await input.evaluate(elt => elt.tagName)).toBe('INPUT');
            await expect(input).toHaveId(/jforms_view_edition_uids_\d/)
            await expect(input).toHaveAttribute('name', 'uids[]');
            await expect(input).toHaveAttribute('type', 'checkbox');
            await expect(input).toHaveAttribute('value', /[a-z0-9-]{36}/);
            await expect(input).toContainClass('jforms-ctrl-checkboxes');
            await expect(input).not.toBeDisabled();
            await expect(input).not.toBeChecked();
            await expect(input).not.toBeHidden();
        }

        // Value map integer
        fieldLocator = project.editingField('value_map_integer');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('SELECT');
        await expect(fieldLocator).toHaveId('jforms_view_edition_value_map_integer')
        await expect(fieldLocator).toHaveAttribute('name', 'value_map_integer');
        await expect(fieldLocator).toHaveAttribute('size', '1');
        await expect(fieldLocator).toContainClass('jforms-ctrl-menulist');
        await expect(fieldLocator).not.toBeDisabled();
        selectValues = [];
        for (const option of await fieldLocator.locator('option').all()) {
            selectValues.push(await option.getAttribute('value'));
        }
        expect(selectValues).toEqual(['', '1', '2', '3', '4']);
        fieldLocator.selectOption('one');
        await expect(fieldLocator).toHaveValue('1');
        fieldLocator.selectOption('');
        await expect(fieldLocator).toHaveValue('');
        fieldLocator.selectOption('three');
        await expect(fieldLocator).toHaveValue('3');

        // The multiline_text field must be a textarea (multiline is checked)
        fieldLocator = project.editingField('html_text');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('TEXTAREA');
        await expect(fieldLocator).toHaveId('jforms_view_edition_html_text');
        await expect(fieldLocator).toHaveAttribute('name', 'html_text');
        await expect(fieldLocator).toHaveAttribute('rows', '5');
        await expect(fieldLocator).toHaveAttribute('cols', '40');
        await expect(fieldLocator).toContainClass('jforms-ctrl-textarea');
        await expect(fieldLocator).not.toBeDisabled();

        // The html_text field must be a textarea (multiline is checked)
        fieldLocator = project.editingField('multiline_text');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).toBeHidden();
        // await fieldLocator.scrollIntoViewIfNeeded(); // it is hidden
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('TEXTAREA');
        await expect(fieldLocator).toHaveId('jforms_view_edition_multiline_text');
        await expect(fieldLocator).toHaveAttribute('name', 'multiline_text');
        await expect(fieldLocator).toHaveAttribute('rows', '5');
        await expect(fieldLocator).toHaveAttribute('cols', '40');
        await expect(fieldLocator).toContainClass('jforms-ctrl-htmleditor');
        // The WYSIWYG tools must be activated
        await expect(fieldLocator.locator('+ div.ck')).toHaveCount(1);

        // Close form
        await project.editingSubmit('cancel').scrollIntoViewIfNeeded();
        page.once('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();
    });

    test('should submit multiple selections with integer array field @write', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_all_field_type');

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        // Select two values
        await page.locator('#jforms_view_edition_integer_array_0').click();
        await page.locator('#jforms_view_edition_integer_array_1').click();

        // Save feature
        let saveFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/saveFeature/);
        await project.editingSubmitForm();
        let saveFeatureRequest = await saveFeatureRequestPromise;
        await saveFeatureRequest.response();

        // Assert success message is displayed
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();

        // Open Attribute table
        let datatablesRequest = await project.openAttributeTable(tableName);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();

        let tableHtml = project.attributeTableHtml(tableName);
        await expect(tableHtml.locator('tbody tr')).not.toHaveCount(0);
        await expect(tableHtml.locator('tbody tr .feature-edit')).not.toHaveCount(0);

        // Assert both values are selected when editing previously submitted feature
        let editFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/editFeature/);
        tableHtml.locator('tbody tr .feature-edit').last().click();
        let editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        await expect(page.locator('#jforms_view_edition_integer_array_0')).toBeChecked();
        await expect(page.locator('#jforms_view_edition_integer_array_1')).toBeChecked();

        // Close form
        page.once('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();
    });

    test('should submit multiple selections with text field @write', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_all_field_type');

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        // Select two values
        await page.locator('#jforms_view_edition_text_0').click();
        await page.locator('#jforms_view_edition_text_1').click();

        // Save feature
        let saveFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/saveFeature/);
        await project.editingSubmitForm();
        let saveFeatureRequest = await saveFeatureRequestPromise;
        await saveFeatureRequest.response();

        // Assert success message is displayed
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).not.toBeVisible();
        await expect(page.locator('#edition-form-container')).not.toBeVisible();

        // Open Attribute table
        let datatablesRequest = await project.openAttributeTable(tableName);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();

        let tableHtml = project.attributeTableHtml(tableName);
        await expect(tableHtml.locator('tbody tr')).not.toHaveCount(0);
        await expect(tableHtml.locator('tbody tr .feature-edit')).not.toHaveCount(0);

        // Assert both values are selected when editing previously submitted feature
        let editFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/editFeature/);
        tableHtml.locator('tbody tr .feature-edit').last().click();
        let editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        await expect(page.locator('#jforms_view_edition_text_0')).toBeChecked();
        await expect(page.locator('#jforms_view_edition_text_1')).toBeChecked();

        // Close form
        page.once('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();
    });

    test('should submit multiple selections with uids field @write', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_all_field_type');

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        // Select two values
        await page.locator('#jforms_view_edition_uids_0').click();
        await page.locator('#jforms_view_edition_uids_2').click();

        // Save feature
        let saveFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/saveFeature/);
        await project.editingSubmitForm();
        let saveFeatureRequest = await saveFeatureRequestPromise;
        await saveFeatureRequest.response();

        // Assert success message is displayed
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).not.toBeVisible();
        await expect(page.locator('#edition-form-container')).not.toBeVisible();

        // Open Attribute table
        let datatablesRequest = await project.openAttributeTable(tableName);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();

        let tableHtml = project.attributeTableHtml(tableName);
        await expect(tableHtml.locator('tbody tr')).not.toHaveCount(0);
        await expect(tableHtml.locator('tbody tr .feature-edit')).not.toHaveCount(0);

        // Assert both values are selected when editing previously submitted feature
        let editFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/editFeature/);
        tableHtml.locator('tbody tr .feature-edit').last().click();
        let editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        await expect(page.locator('#jforms_view_edition_uids_0')).toBeChecked();
        await expect(page.locator('#jforms_view_edition_uids_2')).toBeChecked();

        // Close form
        page.once('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();
    });

    test('expects error, string in integer field @write', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_all_field_type');

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();
        // No  errors
        await expect(page.locator('#jforms_view_edition_errors')).not.toBeVisible();

        // force as input type text to allow form validation
        await page.locator('#jforms_view_edition_integer_field').evaluate((elem) => {
            elem.setAttribute('type', 'text');
        });
        // Typing text `foo` in `integer_field`
        await page.locator('#jforms_view_edition_integer_field').fill('foo');

        // Submit feature
        const submit = project.editingSubmit('submit');
        await submit.scrollIntoViewIfNeeded();
        await submit.click();

        await page.locator('#edition').getByRole('tablist').scrollIntoViewIfNeeded();

        // An error message should warn about invalidity of the form
        await expect(page.locator('#jforms_view_edition_errors')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_errors')).toHaveText('"integer_field" field is invalid');
        await expect(page.locator('#jforms_view_edition_integer_field')).toContainClass('jforms-error');
    });

    test('expects error, value too big @write', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_all_field_type');

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();
        // No  errors
        await expect(page.locator('#jforms_view_edition_errors')).not.toBeVisible();

        // force as input type text to allow form validation
        await page.locator('#jforms_view_edition_integer_field').evaluate((elem) => {
            elem.setAttribute('type', 'text');
        });
        // Typing a value too big for `integer_field`
        await page.locator('#jforms_view_edition_integer_field').fill('2147483648');

        // Submit feature
        const submit = project.editingSubmit('submit');
        await submit.scrollIntoViewIfNeeded();
        await submit.click();

        await page.locator('#edition').getByRole('tablist').scrollIntoViewIfNeeded();

        // An error message should warn about invalidity of the form
        await expect(page.locator('#jforms_view_edition_errors')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_errors')).toHaveText('"integer_field" field is invalid');
        await expect(page.locator('#jforms_view_edition_integer_field')).toContainClass('jforms-error');
    });

    test('expects error, negative value too big @write', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_all_field_type');

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();
        // No  errors
        await expect(page.locator('#jforms_view_edition_errors')).not.toBeVisible();

        // force as input type text to allow form validation
        await page.locator('#jforms_view_edition_integer_field').evaluate((elem) => {
            elem.setAttribute('type', 'text');
        });
        // Typing a negative value too big for `integer_field`
        await page.locator('#jforms_view_edition_integer_field').fill('-2147483649');

        // Submit feature
        const submit = project.editingSubmit('submit');
        await submit.scrollIntoViewIfNeeded();
        await submit.click();

        await page.locator('#edition').getByRole('tablist').scrollIntoViewIfNeeded();

        // An error message should warn about invalidity of the form
        await expect(page.locator('#jforms_view_edition_errors')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_errors')).toHaveText('"integer_field" field is invalid');
        await expect(page.locator('#jforms_view_edition_integer_field')).toContainClass('jforms-error');
    });

    test('success, negative value for integer field @write', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_all_field_type');

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        // Set integer negative value
        await page.locator('#jforms_view_edition_integer_field').fill('-5');

        // Save feature
        let saveFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/saveFeature/);
        await project.editingSubmitForm();
        let saveFeatureRequest = await saveFeatureRequestPromise;
        await saveFeatureRequest.response();

        // Assert success message is displayed
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).not.toBeVisible();
        await expect(page.locator('#edition-form-container')).not.toBeVisible();
    });

    test('success, zero value for integer field @write', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_all_field_type');

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        // Set zero value
        await page.locator('#jforms_view_edition_integer_field').fill('0');

        // Save feature
        let saveFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/saveFeature/);
        await project.editingSubmitForm();
        let saveFeatureRequest = await saveFeatureRequestPromise;
        await saveFeatureRequest.response();

        // Assert success message is displayed
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).not.toBeVisible();
        await expect(page.locator('#edition-form-container')).not.toBeVisible();
    });

    test('success, positive value for integer field @write', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_all_field_type');

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        // Set integer positive value
        await page.locator('#jforms_view_edition_integer_field').fill('5');

        // Save feature
        let saveFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/saveFeature/);
        await project.editingSubmitForm();
        let saveFeatureRequest = await saveFeatureRequestPromise;
        await saveFeatureRequest.response();

        // Assert success message is displayed
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).not.toBeVisible();
        await expect(page.locator('#edition-form-container')).not.toBeVisible();
    });

    test('success, unchecked boolean not null field @write', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_all_field_type');

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        // Checkbox for boolean not null field
        const checkbox = page.locator('#jforms_view_edition_boolean_notnull_for_checkbox');
        await expect(checkbox).toContainClass('jforms-ctrl-checkbox');
        await expect(checkbox).not.toBeChecked();

        // Save feature
        let saveFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/saveFeature/);
        await project.editingSubmitForm();
        let saveFeatureRequest = await saveFeatureRequestPromise;
        await saveFeatureRequest.response();

        // Assert success message is displayed
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).not.toBeVisible();
        await expect(page.locator('#edition-form-container')).not.toBeVisible();

        // Open Attribute table
        let datatablesRequest = await project.openAttributeTable(tableName);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();

        let tableHtml = project.attributeTableHtml(tableName);
        await expect(tableHtml.locator('tbody tr')).not.toHaveCount(0);
        await expect(tableHtml.locator('tbody tr .feature-edit')).not.toHaveCount(0);

        // Assert both values are selected when editing previously submitted feature
        let editFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/editFeature/);
        tableHtml.locator('tbody tr .feature-edit').last().click();
        let editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        await expect(checkbox).toContainClass('jforms-ctrl-checkbox');
        await expect(checkbox).not.toBeChecked();

        // Close form
        page.once('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();
    });
});
