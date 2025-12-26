// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';

test.describe('Edition of an embedded layer', () => {
    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'embed_child');
        await project.open();
        await project.closeLeftDock();
    });

    test('Inspect keyValueConfig for embedded layers', async ({ page }) =>{
        const keyValueConfig = await (page.evaluate(() =>globalThis.lizMap.keyValueConfig ));

        const expectedKeyValueConfig = {
            edition_layer_embed_child: [],
            edition_layer_embed_line: [],
            edition_layer_embed_point:{
                id_ext_point: {
                    code_field: "id",
                    exp_filter: "",
                    label_field: "descr",
                    source_layer: "edition_layer_embed_child",
                    source_layer_id: "edition_layer_embed_child_d87f81cd_26d2_4c40_820d_676ba03ff6ab",
                    type: "ValueRelation"
                }
            }
        }

        await expect(keyValueConfig).toEqual(expectedKeyValueConfig);

        // open attribute table
        await page.locator('#button-attributeLayers').click();

        let getKeyValueRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('edition_layer_embed_child') === true && request.postData()?.includes('GetFeature') === true);
        await page.locator('#attribute-layer-list button.btn-open-attribute-layer[value="edition_layer_embed_point"]').click();
        await getKeyValueRequestPromise;

        // inspect attribute table
        let table = page.locator('#attribute-layer-table-edition_layer_embed_point');
        await expect(table).toHaveCount(1);

        await expect(table.locator('tbody tr').nth(0).locator('td').nth(2)).toHaveText('External1');
        await expect(table.locator('tbody tr').nth(1).locator('td').nth(2)).toHaveText('External2');
        await expect(table.locator('tbody tr').nth(2).locator('td').nth(2)).toHaveText('');

    })

    test('Open embedded layer edition form', async ({ page }) => {
        const project = new ProjectPage(page, 'embed_child');
        // Open the form for Embedded Point
        let formRequest = await project.openEditingFormWithLayer('Embedded Point');
        await formRequest.response();

        // inspect the form
        // id
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
        await expect(fieldLocator).toBeVisible();
        let labelLocator = page.locator(`#${await fieldLocator.getAttribute('id')}_label`);
        await expect(labelLocator).toBeVisible();
        await expect(labelLocator).toHaveText("Id");

        // external_ref
        fieldLocator = project.editingField('id_ext_point');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('SELECT');
        await expect(fieldLocator).toHaveId('jforms_view_edition_id_ext_point')
        await expect(fieldLocator).toHaveAttribute('name', 'id_ext_point');
        await expect(fieldLocator).toHaveAttribute('size', '1');
        await expect(fieldLocator).toContainClass('jforms-ctrl-menulist');
        await expect(fieldLocator).not.toBeDisabled();
        await expect(fieldLocator.locator('option')).toHaveCount(3);
        let selectValues = [];
        let selectTitles = [];
        for (const option of await fieldLocator.locator('option').all()) {
            selectValues.push(await option.getAttribute('value'));
            selectTitles.push(await option.textContent());
        }
        expect(selectValues).toEqual(['', '1', '2']);
        expect(selectTitles).toEqual(['', 'External1', 'External2']);
        labelLocator = page.locator(`#${await fieldLocator.getAttribute('id')}_label`);
        await expect(labelLocator).toBeVisible();
        await expect(labelLocator).toHaveText("external_ref");

        // description
        fieldLocator = project.editingField('descr');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('INPUT');
        await expect(fieldLocator).toHaveId('jforms_view_edition_descr');
        await expect(fieldLocator).toHaveAttribute('name', 'descr');
        await expect(fieldLocator).toHaveAttribute('type', 'text');
        await expect(fieldLocator).not.toHaveAttribute('step', 'any');
        await expect(fieldLocator).not.toHaveAttribute('min');
        await expect(fieldLocator).not.toHaveAttribute('max');
        await expect(fieldLocator).toContainClass('jforms-ctrl-input');
        await expect(fieldLocator).not.toBeDisabled();
        await expect(fieldLocator).toBeVisible();
        labelLocator = page.locator(`#${await fieldLocator.getAttribute('id')}_label`);
        await expect(labelLocator).toBeVisible();
        await expect(labelLocator).toHaveText("Point description");

        // Close form
        await project.editingSubmit('cancel').scrollIntoViewIfNeeded();
        page.once('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();

        // Open the form for Embedded Line
        formRequest = await project.openEditingFormWithLayer('Embedded Line');
        await formRequest.response();

        // inspect the form
        // id
        fieldLocator = project.editingField('id');
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
        await expect(fieldLocator).toBeVisible();
        labelLocator = page.locator(`#${await fieldLocator.getAttribute('id')}_label`);
        await expect(labelLocator).toBeVisible();
        await expect(labelLocator).toHaveText("id");

        // descr
        fieldLocator = project.editingField('descr');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('INPUT');
        await expect(fieldLocator).toHaveId('jforms_view_edition_descr');
        await expect(fieldLocator).toHaveAttribute('name', 'descr');
        await expect(fieldLocator).toHaveAttribute('type', 'text');
        await expect(fieldLocator).not.toHaveAttribute('step', 'any');
        await expect(fieldLocator).not.toHaveAttribute('min');
        await expect(fieldLocator).not.toHaveAttribute('max');
        await expect(fieldLocator).toContainClass('jforms-ctrl-input');
        await expect(fieldLocator).not.toBeDisabled();
        await expect(fieldLocator).toBeVisible();
        labelLocator = page.locator(`#${await fieldLocator.getAttribute('id')}_label`);
        await expect(labelLocator).toBeVisible();
        await expect(labelLocator).toHaveText("Description");

        // Close form
        await project.editingSubmit('cancel').scrollIntoViewIfNeeded();
        page.once('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();
    })
})
