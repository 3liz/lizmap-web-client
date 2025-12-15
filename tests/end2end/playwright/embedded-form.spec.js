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
        await expect(page.locator('#jforms_view_edition_id')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_id_label')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_id_label')).toHaveText("Id");

        // external_ref
        await expect(page.locator('#jforms_view_edition_id_ext_point')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_id_ext_point_label')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_id_ext_point_label')).toHaveText("external_ref");
        await page.locator('#jforms_view_edition_id_ext_point').selectOption("1");
        await page.locator('#jforms_view_edition_id_ext_point').selectOption("2");

        // description
        await expect(page.locator('#jforms_view_edition_descr')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_descr_label')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_descr_label')).toHaveText("Point description");

        // Close form
        await project.editingSubmit('cancel').scrollIntoViewIfNeeded();
        page.once('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();

        // Open the form for Embedded Line
        formRequest = await project.openEditingFormWithLayer('Embedded Line');
        await formRequest.response();

        // inspect the form
        // id
        await expect(page.locator('#jforms_view_edition_id')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_id_label')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_id_label')).toHaveText("id");

        // descr
        await expect(page.locator('#jforms_view_edition_descr')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_descr_label')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_descr_label')).toHaveText("Description");

        // Close form
        await project.editingSubmit('cancel').scrollIntoViewIfNeeded();
        page.once('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();
    })
})
