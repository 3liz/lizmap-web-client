// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'
import { expectParametersToContain, gotoMap } from './globals';
import { ProjectPage } from "./pages/project";

test.describe('Edition Form Validation', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=form_edition_all_field_type';
        await gotoMap(url, page)
    });

    test('Input type number with range and step', async ({ page }) => {
        const project = new ProjectPage(page, 'form_edition_all_field_type');
        await project.openEditingFormWithLayer('form_edition_all_fields_types');

        // ensure input attributes match with field config defined in project
        await expect(page.locator('#jforms_view_edition input[name="integer_field"]')).toHaveAttribute('type', 'number')
        await expect(page.locator('#jforms_view_edition input[name="integer_field"]')).toHaveAttribute('step', '5');
        await expect(page.locator('#jforms_view_edition input[name="integer_field"]')).toHaveAttribute('min', '-200');
        await expect(page.locator('#jforms_view_edition input[name="integer_field"]')).toHaveAttribute('max', '200');

        // add data
        await page.locator('#jforms_view_edition input[name="integer_field"]').fill('50');

        // submit form
        await project.editingSubmitForm()
    })

    test('Boolean nullable w/ value map', async ({ page }) => {

        let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));

        const project = new ProjectPage(page, 'form_edition_all_field_type');
        await project.openEditingFormWithLayer('many_bool_formats');
        await page.getByLabel('bool_simple_null_vm').selectOption('t');
        await project.editingSubmitForm('edit');

        await editFeatureRequestPromise;

        // Wait a bit for the UI to refresh
        await page.waitForTimeout(300);

        await expect(page.getByLabel('bool_simple_null_vm')).toHaveValue('t');

        await page.getByLabel('bool_simple_null_vm').selectOption('');
        await project.editingSubmitForm('edit');

        await editFeatureRequestPromise;

        // Wait a bit for the UI to refresh
        await page.waitForTimeout(300);

        await expect(page.getByLabel('bool_simple_null_vm')).toHaveValue('');
    })

    test('Error fetch form', async ({ page }) => {
        await page.route('**/edition/createFeature*', async route => {
            await route.fulfill({
                status: 404,
                contentType: 'text/plain',
                body: 'Not Found!'
            });
        });

        const project = new ProjectPage(page, 'form_edition_all_field_type');
        await project.buttonEditing.click();
        await page.locator('a#edition-draw').click();

        // message
        await expect(page.locator("#lizmap-edition-message")).toBeVisible();
        await expect(page.locator("#message > div")).toHaveClass(/alert-error/);
    })

    test('Error send feature', async ({ page }) => {
        // display form
        await page.locator('#button-edition').click();
        await page.locator('a#edition-draw').click();

        // add data
        await page.locator('#jforms_view_edition input[name="integer_field"]').fill('50');

        await page.route('**/edition/saveFeature*', async route => {
            await route.fulfill({
                status: 404,
                contentType: 'text/plain',
                body: 'Not Found!'
            });
        });

        // submit form
        await page.locator('#jforms_view_edition__submit_submit').click();

        // message
        await expect(page.locator("#lizmap-edition-message")).toBeVisible();
        await expect(page.locator("#message > div")).toHaveClass(/alert-error/);

        // form still here
        await expect(page.locator('#edition-form-container')).toBeVisible();

        // cancel edition and inspect new child attribute table
        page.once('dialog', dialog => {
            return dialog.accept();
        });
        await page.locator('#jforms_view_edition__submit_cancel').click();

        // form closed
        await expect(page.locator('#edition-form-container')).toBeHidden();
    })
})


test.describe('Multiple geometry layers', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=multiple_geom';
        await gotoMap(url, page)
    });

    test('Double geom layer', async ({ page }) => {

        await page.locator('#button-edition').click();

        // double_geom layer editing, layer with "geom" column
        await page.locator('a#edition-draw').click();

        await page.waitForTimeout(300);

        // inspect form
        await expect(page.locator('#jforms_view_edition input[name="liz_geometryColumn"]')).toHaveValue('geom');
        await expect(page.getByRole('heading', { name: 'double_geom' })).toHaveText('double_geom');

        // insert a polygon feature
        await page.locator('#map').click({
            position: {
                x: 608,
                y: 260
            }
        });
        await page.waitForTimeout(300);

        await page.locator('#map').click({
            position: {
                x: 629,
                y: 200
            }
        });
        await page.waitForTimeout(300);

        await page.locator('#map').dblclick({
            position: {
                x: 560,
                y: 191
            }
        });
        await page.waitForTimeout(300);

        // fill the form
        await page.locator('#jforms_view_edition input[name="title"]').fill('geom');

        // submit the form
        await page.locator('#jforms_view_edition__submit_submit').click();

        await expect(page.locator('#edition-form-container')).toBeHidden();
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();

        // double_geom_layer editing, layer with "geom_d" column
        await page.locator('#edition-layer').selectOption({ label: 'double_geom_d' });

        await page.locator('a#edition-draw').click();

        await page.waitForTimeout(300);

        // inspect form
        await expect(page.locator('#jforms_view_edition input[name="liz_geometryColumn"]')).toHaveValue('geom_d');
        await expect(page.getByRole('heading', { name: 'double_geom_d' })).toHaveText('double_geom_d');

        // insert a polygon feature
        await page.locator('#map').click({
            position: {
                x: 651,
                y: 401
            }
        });
        await page.waitForTimeout(300);

        await page.locator('#map').click({
            position: {
                x: 695,
                y: 368
            }
        });
        await page.waitForTimeout(300);

        await page.locator('#map').dblclick({
            position: {
                x: 641,
                y: 373
            }
        });
        await page.waitForTimeout(300);

        // fill the form
        await page.locator('#jforms_view_edition input[name="title"]').fill('geom_d');

        // submit the form
        await page.locator('#jforms_view_edition__submit_submit').click();

        await expect(page.locator('#edition-form-container')).toBeHidden();
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();

        // inspect attribute table
        // open attribute table panel
        await page.locator('#button-attributeLayers').click();

        // maximize panel
        await page.getByRole('button', { name: 'Maximize' }).click();

        const num_rec = 3;

        let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeature') === true);

        // DOUBLE_GEOM_GEOM
        // open main layer attribute table panel
        await page.locator('#attribute-layer-list button[value="double_geom_geom"]').click();
        await getFeatureRequestPromise;

        let double_geom_geom_attr_table_head = page.locator("#attribute-layer-table-double_geom_geom_wrapper .dataTables_scrollHead table");
        let double_geom_geom_attr_table = page.locator("#attribute-layer-table-double_geom_geom");

        await expect(double_geom_geom_attr_table_head.locator("thead th").nth(1)).toHaveText("id");
        await expect(double_geom_geom_attr_table_head.locator("thead th").nth(2)).toHaveText("title");
        // since "geom" is the geometry column, the geom_d column should be listed in the attribute table
        await expect(double_geom_geom_attr_table_head.locator("thead th").nth(3)).toHaveText("geom_d");

        // expect the three layers to have the same number of records
        await expect(double_geom_geom_attr_table.locator("tbody tr")).toHaveCount(num_rec);
        // first record comes from db initialization and contains all geometry, so it is equal for all the layers
        await expect(double_geom_geom_attr_table.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("F2");
        await expect(double_geom_geom_attr_table.locator("tbody tr").nth(0).locator("td").nth(3)).toHaveText("[object Object]");
        // geom record does not have geom_d attribute filled because its geometry is stored in the geom column, not shown in the attribute table
        await expect(double_geom_geom_attr_table.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("geom");
        await expect(double_geom_geom_attr_table.locator("tbody tr").nth(1).locator("td").nth(3)).toHaveText("");
        // in the double_geom_geom table, the geom_d record geometry should be correctly stored in the geom_d column
        await expect(double_geom_geom_attr_table.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("geom_d");
        await expect(double_geom_geom_attr_table.locator("tbody tr").nth(2).locator("td").nth(3)).toHaveText("[object Object]");

        // DOUBLE_GEOM_GEOM_D
        // open main layer attribute table panel
        await page.locator('#nav-tab-attribute-summary').click();
        await page.locator('#attribute-layer-list button[value="double_geom_geom_d"]').click();
        await getFeatureRequestPromise;

        let double_geom_geom_d_attr_table_head = page.locator("#attribute-layer-table-double_geom_geom_d_wrapper .dataTables_scrollHead table");
        let double_geom_geom_d_attr_table = page.locator("#attribute-layer-table-double_geom_geom_d");

        await expect(double_geom_geom_d_attr_table_head.locator("thead th").nth(1)).toHaveText("id");
        await expect(double_geom_geom_d_attr_table_head.locator("thead th").nth(2)).toHaveText("title");
        // since "geom_d" is the geometry column, the geom column should be listed in the attribute table
        await expect(double_geom_geom_d_attr_table_head.locator("thead th").nth(3)).toHaveText("geom");

        // expect the three layers to have the same number of records
        await expect(double_geom_geom_d_attr_table.locator("tbody tr")).toHaveCount(num_rec);
        // first record comes from db initialization and contains all geometry, so it is equal for all the layers
        await expect(double_geom_geom_d_attr_table.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("F2");
        await expect(double_geom_geom_d_attr_table.locator("tbody tr").nth(0).locator("td").nth(3)).toHaveText("[object Object]");
        // in the double_geom_geom_d table, the geom record geometry should be correctly stored in the geom column
        await expect(double_geom_geom_d_attr_table.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("geom");
        await expect(double_geom_geom_d_attr_table.locator("tbody tr").nth(1).locator("td").nth(3)).toHaveText("[object Object]");
        // geom_d record does not have geom attribute filled because its geometry is stored in the geom_d column, not shown in the attribute table
        await expect(double_geom_geom_d_attr_table.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("geom_d");
        await expect(double_geom_geom_d_attr_table.locator("tbody tr").nth(2).locator("td").nth(3)).toHaveText("");

    })

    test('Triple geom layer', async ({ page }) => {

        await page.locator('#button-edition').click();

        // triple_geom_layer editing, layer with "geom" column
        await page.locator('#edition-layer').selectOption({ label: 'triple_geom_point' })

        await page.locator('a#edition-draw').click();

        await page.waitForTimeout(300);

        // inspect form
        await expect(page.locator('#jforms_view_edition input[name="liz_geometryColumn"]')).toHaveValue('geom');
        await expect(page.getByRole('heading', { name: 'triple_geom_point' })).toHaveText('triple_geom_point');

        // insert a point feature
        await page.locator('#map').click({
            position: {
                x: 523,
                y: 389
            }
        });
        await page.waitForTimeout(300);

        // fill the form
        await page.locator('#jforms_view_edition input[name="title"]').fill('triple_geom_point');

        // submit the form
        await page.locator('#jforms_view_edition__submit_submit').click();

        await expect(page.locator('#edition-form-container')).toBeHidden();
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();

        // triple_geom_layer editing, layer with "geom_l" column
        await page.locator('#edition-layer').selectOption({ label: 'triple_geom_line' });

        await page.locator('a#edition-draw').click();

        await page.waitForTimeout(300);

        // inspect form
        await expect(page.locator('#jforms_view_edition input[name="liz_geometryColumn"]')).toHaveValue('geom_l');
        await expect(page.getByRole('heading', { name: 'triple_geom_line' })).toHaveText('triple_geom_line');

        // insert a line feature
        await page.locator('#map').click({
            position: {
                x: 545,
                y: 438
            }
        });
        await page.waitForTimeout(300);

        await page.locator('#map').dblclick({
            position: {
                x: 589,
                y: 413
            }
        });
        await page.waitForTimeout(300)

        // fill the form
        await page.locator('#jforms_view_edition input[name="title"]').fill('triple_geom_line');

        // submit the form
        await page.locator('#jforms_view_edition__submit_submit').click();

        await expect(page.locator('#edition-form-container')).toBeHidden();
        await expect(page.locator('#lizmap-edition-message')).toBeVisible()

        // triple_geom_layer editing, layer with "geom_p" column
        await page.locator('#edition-layer').selectOption({ label: 'triple_geom_polygon' })

        await page.locator('a#edition-draw').click();

        await page.waitForTimeout(300);

        // inspect form
        await expect(page.locator('#jforms_view_edition input[name="liz_geometryColumn"]')).toHaveValue('geom_p');
        await expect(page.getByRole('heading', { name: 'triple_geom_polygon' })).toHaveText('triple_geom_polygon');

        // insert a polygon feature
        await page.locator('#map').click({
            position: {
                x: 633,
                y: 319
            }
        });
        await page.waitForTimeout(300);

        await page.locator('#map').click({
            position: {
                x: 645,
                y: 280
            }
        });
        await page.waitForTimeout(300);

        await page.locator('#map').dblclick({
            position: {
                x: 677,
                y: 315
            }
        });
        await page.waitForTimeout(300);

        // fill the form
        await page.locator('#jforms_view_edition input[name="title"]').fill('triple_geom_polygon');

        // submit the form
        await page.locator('#jforms_view_edition__submit_submit').click();

        await expect(page.locator('#edition-form-container')).toBeHidden();
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();

        // inspect attribute table
        // open attribute table panel
        await page.locator('#button-attributeLayers').click();

        // maximize panel
        await page.getByRole('button', { name: 'Maximize' }).click();

        const num_rec = 4;

        let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeature') === true);

        // TRIPLE_GEOM_POINT
        // open main layer attribute table panel
        await page.locator('#attribute-layer-list button[value="triple_geom_geom"]').click();
        await getFeatureRequestPromise;

        let triple_geom_geom_attr_table_head = page.locator("#attribute-layer-table-triple_geom_geom_wrapper .dataTables_scrollHead table");
        let triple_geom_geom_attr_table = page.locator("#attribute-layer-table-triple_geom_geom");

        await expect(triple_geom_geom_attr_table_head.locator("thead th").nth(1)).toHaveText("id");
        await expect(triple_geom_geom_attr_table_head.locator("thead th").nth(2)).toHaveText("title");
        // since "geom" is the geometry column, the geom_l and the geom _p columns should be listed in the attribute table
        await expect(triple_geom_geom_attr_table_head.locator("thead th").nth(3)).toHaveText("geom_l");
        await expect(triple_geom_geom_attr_table_head.locator("thead th").nth(4)).toHaveText("geom_p");

        // expect the three layers to have the same number of records
        await expect(triple_geom_geom_attr_table.locator("tbody tr")).toHaveCount(num_rec);
        // first record comes from db initialization and contains all geometry, so it is equal for all the layers
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("P2");
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(0).locator("td").nth(3)).toHaveText("[object Object]");
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(0).locator("td").nth(4)).toHaveText("[object Object]");
        // triple_geom_point record does not have geom_l or geom_p attribute filled because its geometry is stored in the geom column, not shown in the attribute table
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("triple_geom_point");
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(1).locator("td").nth(3)).toHaveText("");
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(1).locator("td").nth(4)).toHaveText("");
        // in the triple_geom_point table, the triple_geom_line record geometry should be correctly stored in the geom_l column
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("triple_geom_line");
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(2).locator("td").nth(3)).toHaveText("[object Object]");
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(2).locator("td").nth(4)).toHaveText("");
        // in the triple_geom_point table, the triple_geom_polygon record geometry should be correctly stored in the geom_p column
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(3).locator("td").nth(2)).toHaveText("triple_geom_polygon");
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(3).locator("td").nth(3)).toHaveText("");
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(3).locator("td").nth(4)).toHaveText("[object Object]");


        // TRIPLE_GEOM_LINE
        // open main layer attribute table panel
        await page.locator('#nav-tab-attribute-summary').click();
        await page.locator('#attribute-layer-list button[value="triple_geom_geom_l"]').click();

        await getFeatureRequestPromise;

        let triple_geom_geom_l_attr_table_head = page.locator("#attribute-layer-table-triple_geom_geom_l_wrapper .dataTables_scrollHead table");
        let triple_geom_geom_l_attr_table = page.locator("#attribute-layer-table-triple_geom_geom_l");

        await expect(triple_geom_geom_l_attr_table_head.locator("thead th").nth(1)).toHaveText("id");
        await expect(triple_geom_geom_l_attr_table_head.locator("thead th").nth(2)).toHaveText("title");
        // since "geom_l" is the geometry column, the geom and the geom_p columns should be listed in the attribute table
        await expect(triple_geom_geom_l_attr_table_head.locator("thead th").nth(3)).toHaveText("geom");
        await expect(triple_geom_geom_l_attr_table_head.locator("thead th").nth(4)).toHaveText("geom_p");

        // expect the three layers to have the same number of records
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr")).toHaveCount(num_rec);
        // first record comes from db initialization and contains all geometry, so it is equal for all the layers
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("P2");
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(0).locator("td").nth(3)).toHaveText("[object Object]");
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(0).locator("td").nth(4)).toHaveText("[object Object]");
        // in the triple_geom_line table, the triple_geom_point record geometry should be correctly stored in the geom column
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("triple_geom_point");
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(1).locator("td").nth(3)).toHaveText("[object Object]");
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(1).locator("td").nth(4)).toHaveText("");
        // triple_geom_line record does not have geom or geom_p attribute filled because its geometry is stored in the geom_l column, not shown in the attribute table
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("triple_geom_line");
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(2).locator("td").nth(3)).toHaveText("");
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(2).locator("td").nth(4)).toHaveText("");
        // in the triple_geom_line table, the triple_geom_polygon record geometry should be correctly stored in the geom_p column
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(3).locator("td").nth(2)).toHaveText("triple_geom_polygon");
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(3).locator("td").nth(3)).toHaveText("");
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(3).locator("td").nth(4)).toHaveText("[object Object]");

        // TRIPLE_GEOM_POLYGON
        // open main layer attribute table panel
        await page.locator('#nav-tab-attribute-summary').click();
        await page.locator('#attribute-layer-list button[value="triple_geom_geom_p"]').click();

        await getFeatureRequestPromise;

        let triple_geom_geom_p_attr_table_head = page.locator("#attribute-layer-table-triple_geom_geom_p_wrapper .dataTables_scrollHead table");
        let triple_geom_geom_p_attr_table = page.locator("#attribute-layer-table-triple_geom_geom_p");

        await expect(triple_geom_geom_p_attr_table_head.locator("thead th").nth(1)).toHaveText("id");
        await expect(triple_geom_geom_p_attr_table_head.locator("thead th").nth(2)).toHaveText("title");
        // since "geom_p" is the geometry column, the geom and the geom_l columns should be listed in the attribute table
        await expect(triple_geom_geom_p_attr_table_head.locator("thead th").nth(3)).toHaveText("geom");
        await expect(triple_geom_geom_p_attr_table_head.locator("thead th").nth(4)).toHaveText("geom_l");

        // expect the three layers to have the same number of records
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr")).toHaveCount(num_rec);
        // first record comes from db initialization and contains all geometry, so it is equal for all the layers
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("P2");
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(0).locator("td").nth(3)).toHaveText("[object Object]");
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(0).locator("td").nth(4)).toHaveText("[object Object]");
        // in the triple_geom_polygon table, the triple_geom_point record geometry should be correctly stored in the geom column
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("triple_geom_point");
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(1).locator("td").nth(3)).toHaveText("[object Object]");
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(1).locator("td").nth(4)).toHaveText("");
        // in the triple_geom_polygon table, the triple_geom_line record geometry should be correctly stored in the geom_l column
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("triple_geom_line");
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(2).locator("td").nth(3)).toHaveText("");
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(2).locator("td").nth(4)).toHaveText("[object Object]");
        // triple_geom_polygon record does not have geom or geom_l attribute filled because its geometry is stored in the geom_p column, not shown in the attribute table
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(3).locator("td").nth(2)).toHaveText("triple_geom_polygon");
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(3).locator("td").nth(3)).toHaveText("");
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(3).locator("td").nth(4)).toHaveText("");

    })
})

test.describe(
    'Text widget in a form',
    {
        tag: ['@write'],
    }, () =>
    {

        test('Edit form with text widget in it', async ({ page }) => {

            const project = new ProjectPage(page, 'text_widget');
            await project.open();

            let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest();

            await project.clickOnMap(354, 370);
            let getFeatureInfoRequest = await getFeatureInfoRequestPromise;

            const expectedParameters = {
                'SERVICE': 'WMS',
                'REQUEST': 'GetFeatureInfo',
                'VERSION': '1.3.0',
                'INFO_FORMAT': /^text\/html/,
                'LAYERS': 'text_widget_point_edit',
                'QUERY_LAYERS': 'text_widget_point_edit',
                'STYLE': 'default',
                'WIDTH': '870',
                'HEIGHT': '575',
                'I': '354',
                'J': '370',
                'FEATURE_COUNT': '10',
                'CRS': 'EPSG:4326',
                'BBOX': /43.5515\d+,3.7760\d+,43.6884\d+,3.9831\d+/,
            }
            await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', expectedParameters);

            // wait for response
            let getFeatureInfoResponse = await getFeatureInfoRequest.response();
            responseExpect(getFeatureInfoResponse).toBeHtml();

            // time for rendering the popup
            await page.waitForTimeout(100);

            const popup = await project.identifyContentLocator(
                '1',
                'text_widget_point_edit_87ab8b55_b3f5_4bf5_ad25_5c540dcd5a97'
            );
            await expect(popup.locator('.lizmapPopupTitle')).toHaveText('Point edit');
            await expect(popup.locator('.lizmapPopupDiv ul.nav-tabs li')).toHaveCount(3);

            const popupTabs = popup.locator('.lizmapPopupDiv div.tab-pane');
            await expect(popupTabs).toHaveCount(3);

            // first popup tab
            const firstTabFields = popupTabs.nth(0).locator('.field');
            const firstTabControls = popupTabs.nth(0).locator('.jforms-control-input');
            await expect(firstTabFields).toHaveCount(3);
            await expect(firstTabControls).toHaveCount(2);

            await expect(firstTabFields.nth(0)).toHaveText('text string');
            await expect(firstTabFields.nth(1)).toHaveText('3.8602126068661824');
            await expect(firstTabFields.nth(2)).toHaveText('1');

            await expect(firstTabControls.nth(0)).toHaveText('1');
            await expect(firstTabControls.nth(1)).toHaveText('Widget_test');

            // second popup tab
            const secondTabFields = popupTabs.nth(1).locator('.field');
            await expect(secondTabFields).toHaveCount(1);

            await expect(secondTabFields.nth(0)).toHaveText('[%kk[% "ids" %]%]');

            // third popup tab
            const thirdTabFields = popupTabs.nth(2).locator('.field');
            await expect(thirdTabFields).toHaveCount(1);

            await expect(thirdTabFields.nth(0)).toHaveText('Widget_test');

            // edit the feature
            await popup.locator('.feature-toolbar .feature-edit').click();

            // the text widgets in the form should be filled as in the popup
            //project.editionForm = page.locator('#jforms_view_edition');
            await expect(project.editionForm.locator('div.tab-pane')).toHaveCount(3);

            // first tab
            await expect(project.editionForm.locator('div.tab-pane').nth(0).locator('div.control-group')).toHaveCount(5);
            await project.checkEditionFormTextField('id', '1', 'id');
            await project.checkEditionFormTextField('Constant', 'text string', 'Constant', true);
            await project.checkEditionFormTextField('Geometry X', '3.860212606866182', 'Geometry X', true);
            await project.checkEditionFormTextField('id check', '1', 'id check', true);
            await project.checkEditionFormTextField('point_name', 'Widget_test', 'Name');

            // second tab
            await expect(project.editionForm.locator('div.tab-pane').nth(2).locator('div.control-group')).toHaveCount(1);
            await project.checkEditionFormTextField('Wrong expression', '[%kk[% "ids" %]%]', 'Wrong expression', true);

            // third tab
            await expect(project.editionForm.locator('div.tab-pane').nth(1).locator('div.control-group')).toHaveCount(1);
            await project.checkEditionFormTextField('Name check', 'Widget_test', 'Name check', true);

            // fill and save the form
            await project.fillEditionFormTextInput('point_name', 'text modified');
            let editFeatureRequestPromiseUpdate = page.waitForResponse(response => response.url().includes('editFeature'));
            await project.editingSubmitForm('edit');
            await editFeatureRequestPromiseUpdate;
            await page.waitForTimeout(300);

            // set new edition form instance
            //project.editionForm = page.locator('#jforms_view_edition');

            await project.checkEditionFormTextField('id', '1', 'id');
            await project.checkEditionFormTextField('Constant', 'text string', 'Constant', true);
            await project.checkEditionFormTextField('Geometry X', '3.860212606866182', 'Geometry X', true);
            await project.checkEditionFormTextField('id check', '1', 'id check', true);
            await project.checkEditionFormTextField('point_name', 'text modified', 'Name');

            await project.checkEditionFormTextField('Wrong expression', '[%kk[% "ids" %]%]', 'Wrong expression', true);

            await project.checkEditionFormTextField('Name check', 'text modified', 'Name check', true);
        })

        test('Insert new feature', async ({ page }) => {

            const project = new ProjectPage(page, 'text_widget');
            await project.open();

            await project.openEditingFormWithLayer('Point edit');

            // set edition form instance
            project.editionForm = page.locator('#jforms_view_edition');
            // the text widgets in the form should be filled as in the popup
            await expect(project.editionForm.locator('div.tab-pane')).toHaveCount(3);

            // first tab
            await expect(project.editionForm.locator('div.tab-pane').nth(0).locator('div.control-group')).toHaveCount(5);
            await project.checkEditionFormTextField('id', '', 'id');
            await project.checkEditionFormTextField('Constant', 'text string', 'Constant', true);
            await project.checkEditionFormTextField('Geometry X', '', 'Geometry X', true);
            await project.checkEditionFormTextField('id check', '', 'id check', true);
            await project.checkEditionFormTextField('point_name', '', 'Name');

            // second tab
            await expect(project.editionForm.locator('div.tab-pane').nth(2).locator('div.control-group')).toHaveCount(1);
            await project.checkEditionFormTextField('Wrong expression', '[%kk[% "ids" %]%]', 'Wrong expression', true);

            // third tab
            await expect(project.editionForm.locator('div.tab-pane').nth(1).locator('div.control-group')).toHaveCount(1);
            await project.checkEditionFormTextField('Name check', '', 'Name check', true);

            // insert a point feature
            await project.clickOnMapLegacy(488, 331);
            // fill the form
            await project.fillEditionFormTextInput('point_name', 'text insert');
            let editFeatureRequestPromiseUpdate = page.waitForResponse(response => response.url().includes('editFeature'));
            await project.editingSubmitForm('edit');
            await editFeatureRequestPromiseUpdate;
            await page.waitForTimeout(300);

            // set new edition form instance
            project.editionForm = page.locator('#jforms_view_edition');

            const geometry = await project.editionForm.locator('#jforms_view_edition_geom').inputValue();

            expect(geometry.indexOf('POINT(')).toBe(0);
            let coords = geometry.match(/\(([^)]+)\)/) || [];

            expect(coords.length).toBe(2);

            const xGeom = coords[1].split(" ")[0];

            expect(xGeom).toBeTruthy();

            // first tab
            await expect(project.editionForm.locator('div.tab-pane').nth(0).locator('div.control-group')).toHaveCount(5);
            await project.checkEditionFormTextField('id', '2', 'id');
            await project.checkEditionFormTextField('Constant', 'text string', 'Constant', true);
            await project.checkEditionFormTextField('Geometry X', xGeom, 'Geometry X', true);
            await project.checkEditionFormTextField('id check', '2', 'id check', true);
            await project.checkEditionFormTextField('point_name', 'text insert', 'Name');

            // second tab
            await expect(project.editionForm.locator('div.tab-pane').nth(2).locator('div.control-group')).toHaveCount(1);
            await project.checkEditionFormTextField('Wrong expression', '[%kk[% "ids" %]%]', 'Wrong expression', true);

            // third tab
            await expect(project.editionForm.locator('div.tab-pane').nth(1).locator('div.control-group')).toHaveCount(1);
            await project.checkEditionFormTextField('Name check', 'text insert', 'Name check', true);
        });
    });

test.describe('Form upload file widget @readonly',() => {

    test('File preview with path as config', async ({ page }) => {
        const project = new ProjectPage(page, 'form_edition_all_field_type');
        await project.open();

        const layerName = 'form_edition_upload';
        await project.openAttributeTable(layerName);
        await expect(project.attributeTableHtml(layerName).locator('tbody tr'))
            .toHaveCount(2);
        const theTableRow = project.attributeTableHtml(layerName).locator('tbody tr').first();
        await expect(theTableRow.locator('a'))
            .toHaveCount(3);

        // First text_file_mandatory: lorem-2.txt in default path
        await expect(theTableRow.locator('a').nth(0))
            .toHaveText('text_file_mandatory')
        await expect(theTableRow.locator('a').nth(0))
            .toHaveAttribute('href', /^\/index.php\/view\/media\/getMedia?.*/)
        await expect(theTableRow.locator('a').nth(0))
            .toHaveAttribute('href', /.*media\/upload\/form_edition_all_field_type\/form_edition_upload\/text_file_mandatory\/lorem-2.txt$/)

        // image_file_mandatory : random-2.jpg in default root
        await expect(theTableRow.locator('a').nth(1))
            .toHaveText('image_file_mandatory')
        await expect(theTableRow.locator('a').nth(1))
            .toHaveAttribute('href', /^\/index.php\/view\/media\/getMedia?.*/)
        await expect(theTableRow.locator('a').nth(1))
            .toHaveAttribute('href', /.*media\/upload\/form_edition_all_field_type\/form_edition_upload\/image_file_mandatory\/random-2.jpg$/)

        // image_file_specific_root_folder : random-4.jpg in expression path
        await expect(theTableRow.locator('a').nth(2))
            .toHaveText('image_file_specific_root_folder')
        await expect(theTableRow.locator('a').nth(2))
            .toHaveAttribute('href', /^\/index.php\/view\/media\/getMedia?.*/)
        await expect(theTableRow.locator('a').nth(2))
            .toHaveAttribute('href', /.*\.\.\/media\/specific_media_folder\/random-4.jpg$/)

        await expect(theTableRow.locator('lizmap-feature-toolbar'))
            .toHaveCount(1);
        const theFeatureToolbar = theTableRow.locator('lizmap-feature-toolbar');
        await expect(theFeatureToolbar.locator('button.feature-edit'))
            .toHaveCount(1);
        const theEditButton = theFeatureToolbar.locator('button.feature-edit');
        await expect(theEditButton)
            .toBeVisible();

        // Open edit feature
        let modifyFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('modifyFeature'));
        await theEditButton.click();
        let modifyFeatureRequest = await modifyFeatureRequestPromise;

        let editFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('editFeature'));
        await modifyFeatureRequest.response();
        let editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        // Check request
        expect(modifyFeatureRequest.url()).toMatch(/layerId=form_edition_upload_[a-z0-9_]{36}&featureId=2/);
        expect(editFeatureRequest.url()).toMatch(/layerId=form_edition_upload_[a-z0-9_]{36}&featureId=2/);

        // form visible
        await expect(page.locator('#jforms_view_edition')).toBeVisible();
        // id
        await expect(page.locator('#jforms_view_edition_id')).toHaveValue('2');
        // text_file_mandatory: lorem-2.txt
        await page.locator('#jforms_view_edition_text_file_mandatory_choice_list').scrollIntoViewIfNeeded();
        await expect(page.locator('#jforms_view_edition_text_file_mandatory_choice_list').getByLabel('Keep')).toBeChecked();
        await expect(page.locator('#jforms_view_edition_text_file_mandatoryoriginal')).toHaveText('lorem-2.txt');
        // image_file_mandatory: random-2.jpg
        await page.locator('#jforms_view_edition_image_file_mandatory_choice_list').scrollIntoViewIfNeeded();
        await expect(page.locator('#jforms_view_edition_image_file_mandatory_choice_list').getByLabel('Keep')).toBeChecked();
        await expect(page.locator('#jforms_view_edition_image_file_mandatoryoriginal img'))
            .toHaveAttribute('src', /^\/index.php\/view\/media\/getMedia?.*/)
        await expect(page.locator('#jforms_view_edition_image_file_mandatoryoriginal img'))
            .toHaveAttribute('src', /.*media%2Fupload%2Fform_edition_all_field_type%2Fform_edition_upload%2Fimage_file_mandatory%2Frandom-2.jpg$/)
        // image_file_specific_root_folder: random-4.jpg
        await page.locator('#jforms_view_edition_image_file_specific_root_folder_choice_list').scrollIntoViewIfNeeded();
        await expect(page.locator('#jforms_view_edition_image_file_specific_root_folder_choice_list').getByLabel('Keep')).toBeChecked();
        await expect(page.locator('#jforms_view_edition_image_file_specific_root_folderoriginal img'))
            .toHaveAttribute('src', /^\/index.php\/view\/media\/getMedia?.*/)
        await expect(page.locator('#jforms_view_edition_image_file_specific_root_folderoriginal img'))
            .toHaveAttribute('src', /.*\.\.%2Fmedia%2Fspecific_media_folder%2Frandom-4.jpg$/)
    });

    test('File preview with path not as config', async ({ page }) => {
        const project = new ProjectPage(page, 'form_edition_all_field_type');
        await project.open();

        const layerName = 'form_edition_upload';
        await project.openAttributeTable(layerName);
        await expect(project.attributeTableHtml(layerName).locator('tbody tr'))
            .toHaveCount(2);
        const theTableRow = project.attributeTableHtml(layerName).locator('tbody tr').nth(1);
        await expect(theTableRow.locator('a'))
            .toHaveCount(3);

        // First text_file_mandatory: random-2.jpg not in default path
        await expect(theTableRow.locator('a').nth(0))
            .toHaveText('text_file_mandatory')
        await expect(theTableRow.locator('a').nth(0))
            .toHaveAttribute('href', /^\/index.php\/view\/media\/getMedia?.*/)
        await expect(theTableRow.locator('a').nth(0))
            .toHaveAttribute('href', /.*media\/upload\/form_edition_all_field_type\/form_edition_upload\/image_file_mandatory\/random-2.jpg$/)

        // image_file_mandatory : random-4.jpg not in default root
        await expect(theTableRow.locator('a').nth(1))
            .toHaveText('image_file_mandatory')
        await expect(theTableRow.locator('a').nth(1))
            .toHaveAttribute('href', /^\/index.php\/view\/media\/getMedia?.*/)
        await expect(theTableRow.locator('a').nth(1))
            .toHaveAttribute('href', /.*\.\.\/media\/specific_media_folder\/random-4.jpg$/)

        // image_file_specific_root_folder : lorem-2.txt not in expression path
        await expect(theTableRow.locator('a').nth(2))
            .toHaveText('image_file_specific_root_folder')
        await expect(theTableRow.locator('a').nth(2))
            .toHaveAttribute('href', /^\/index.php\/view\/media\/getMedia?.*/)
        await expect(theTableRow.locator('a').nth(2))
            .toHaveAttribute('href', /.*media\/upload\/form_edition_all_field_type\/form_edition_upload\/text_file_mandatory\/lorem-2.txt$/)

        await expect(theTableRow.locator('lizmap-feature-toolbar'))
            .toHaveCount(1);
        const theFeatureToolbar = theTableRow.locator('lizmap-feature-toolbar');
        await expect(theFeatureToolbar.locator('button.feature-edit'))
            .toHaveCount(1);
        const theEditButton = theFeatureToolbar.locator('button.feature-edit');
        await expect(theEditButton)
            .toBeVisible();

        // Open edit feature
        let modifyFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('modifyFeature'));
        await theEditButton.click();
        let modifyFeatureRequest = await modifyFeatureRequestPromise;

        let editFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('editFeature'));
        await modifyFeatureRequest.response();
        let editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        // Check request
        expect(modifyFeatureRequest.url()).toMatch(/layerId=form_edition_upload_[a-z0-9_]{36}&featureId=3/);
        expect(editFeatureRequest.url()).toMatch(/layerId=form_edition_upload_[a-z0-9_]{36}&featureId=3/);

        // form visible
        await expect(page.locator('#jforms_view_edition')).toBeVisible();
        // id
        await expect(page.locator('#jforms_view_edition_id')).toHaveValue('3');
        // text_file_mandatory: random-2.jpg
        await page.locator('#jforms_view_edition_text_file_mandatory_choice_list').scrollIntoViewIfNeeded();
        await expect(page.locator('#jforms_view_edition_text_file_mandatory_choice_list').getByLabel('Keep')).toBeChecked();
        await expect(page.locator('#jforms_view_edition_text_file_mandatoryoriginal img'))
            .toHaveAttribute('src', /^\/index.php\/view\/media\/getMedia?.*/)
        await expect(page.locator('#jforms_view_edition_text_file_mandatoryoriginal img'))
            .toHaveAttribute('src', /.*media%2Fupload%2Fform_edition_all_field_type%2Fform_edition_upload%2Fimage_file_mandatory%2Frandom-2.jpg$/)
        // image_file_mandatory: random-4.jpg
        await page.locator('#jforms_view_edition_image_file_mandatory_choice_list').scrollIntoViewIfNeeded();
        await expect(page.locator('#jforms_view_edition_image_file_mandatory_choice_list').getByLabel('Keep')).toBeChecked();
        await expect(page.locator('#jforms_view_edition_image_file_mandatoryoriginal img'))
            .toHaveAttribute('src', /^\/index.php\/view\/media\/getMedia?.*/)
        await expect(page.locator('#jforms_view_edition_image_file_mandatoryoriginal img'))
            .toHaveAttribute('src', /.*\.\.%2Fmedia%2Fspecific_media_folder%2Frandom-4.jpg$/)
        // image_file_specific_root_folder: lorem-2.txt
        await page.locator('#jforms_view_edition_image_file_specific_root_folder_choice_list').scrollIntoViewIfNeeded();
        await expect(page.locator('#jforms_view_edition_image_file_specific_root_folder_choice_list').getByLabel('Keep')).toBeChecked();
        await expect(page.locator('#jforms_view_edition_image_file_specific_root_folderoriginal')).toHaveText('lorem-2.txt');
    });
});

test.describe('Form upload file widget @write',() => {

    test('Keep file with path as config', async ({ page }) => {
        const project = new ProjectPage(page, 'form_edition_all_field_type');
        await project.open();

        const layerName = 'form_edition_upload';

        // GetFeature
        const params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'form_edition_all_field_type',
        });
        const url = `/index.php/lizmap/service?${params}`;
        const form = {
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            FEATUREID: layerName+'.2',
            OUTPUTFORMAT: 'GeoJSON',
        };
        let response = await page.request.post(url, {
            form: form
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', layerName+'.2');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 2);
        expect(feature.properties).toHaveProperty(
            'text_file_mandatory',
            'media/upload/form_edition_all_field_type/form_edition_upload/text_file_mandatory/lorem-2.txt'
        );
        expect(feature.properties).toHaveProperty(
            'image_file_mandatory',
            'media/upload/form_edition_all_field_type/form_edition_upload/image_file_mandatory/random-2.jpg'
        );
        expect(feature.properties).toHaveProperty(
            'image_file_specific_root_folder',
            '../media/specific_media_folder/random-4.jpg'
        );

        await project.openAttributeTable(layerName);
        await expect(project.attributeTableHtml(layerName).locator('tbody tr'))
            .toHaveCount(2);

        const theTableRow = project.attributeTableHtml(layerName).locator('tbody tr').first();
        await expect(theTableRow.locator('lizmap-feature-toolbar'))
            .toHaveCount(1);
        const theFeatureToolbar = theTableRow.locator('lizmap-feature-toolbar');
        await expect(theFeatureToolbar.locator('button.feature-edit'))
            .toHaveCount(1);
        const theEditButton = theFeatureToolbar.locator('button.feature-edit');
        await expect(theEditButton)
            .toBeVisible();

        // Open edit feature
        let modifyFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('modifyFeature'));
        await theEditButton.click();
        let modifyFeatureRequest = await modifyFeatureRequestPromise;

        let editFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('editFeature'));
        await modifyFeatureRequest.response();
        let editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        // check request
        expect(modifyFeatureRequest.url()).toMatch(/layerId=form_edition_upload_[a-z0-9_]{36}&featureId=2/);
        expect(editFeatureRequest.url()).toMatch(/layerId=form_edition_upload_[a-z0-9_]{36}&featureId=2/);
        // form visible
        await expect(page.locator('#jforms_view_edition')).toBeVisible();
        // id
        await expect(page.locator('#jforms_view_edition_id')).toHaveValue('2');
        // text_file_mandatory
        await page.locator('#jforms_view_edition_text_file_mandatory_choice_list').scrollIntoViewIfNeeded();
        await expect(page.locator('#jforms_view_edition_text_file_mandatory_choice_list').getByLabel('Keep')).toBeChecked();
        // image_file_mandatory
        await page.locator('#jforms_view_edition_image_file_mandatory_choice_list').scrollIntoViewIfNeeded();
        await expect(page.locator('#jforms_view_edition_image_file_mandatory_choice_list').getByLabel('Keep')).toBeChecked();
        // image_file_specific_root_folder
        await page.locator('#jforms_view_edition_image_file_specific_root_folder_choice_list').scrollIntoViewIfNeeded();
        await expect(page.locator('#jforms_view_edition_image_file_specific_root_folder_choice_list').getByLabel('Keep')).toBeChecked();
        // submit without changes
        await page.locator('#jforms_view_edition__submit_submit').scrollIntoViewIfNeeded();

        let saveFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('saveFeature'));
        await page.locator('#jforms_view_edition__submit_submit').click();
        let saveFeatureRequest = await saveFeatureRequestPromise;
        let closeFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('closeFeature'));
        await saveFeatureRequest.response();
        let closeFeatureRequest = await closeFeatureRequestPromise;
        await closeFeatureRequest.response();

        // GetFeature to check no changes
        response = await page.request.post(url, {
            form: form
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', layerName+'.2');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 2);
        expect(feature.properties).toHaveProperty(
            'text_file_mandatory',
            'media/upload/form_edition_all_field_type/form_edition_upload/text_file_mandatory/lorem-2.txt'
        );
        expect(feature.properties).toHaveProperty(
            'image_file_mandatory',
            'media/upload/form_edition_all_field_type/form_edition_upload/image_file_mandatory/random-2.jpg'
        );
        expect(feature.properties).toHaveProperty(
            'image_file_specific_root_folder',
            '../media/specific_media_folder/random-4.jpg'
        );
    });

    test('Keep file with path not as config', async ({ page }) => {
        const project = new ProjectPage(page, 'form_edition_all_field_type');
        await project.open();

        const layerName = 'form_edition_upload';

        // GetFeature
        const params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'form_edition_all_field_type',
        });
        const url = `/index.php/lizmap/service?${params}`;
        const form = {
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            FEATUREID: layerName+'.3',
            OUTPUTFORMAT: 'GeoJSON',
        };
        let response = await page.request.post(url, {
            form: form
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', layerName+'.3');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 3);
        expect(feature.properties).toHaveProperty(
            'text_file_mandatory',
            'media/upload/form_edition_all_field_type/form_edition_upload/image_file_mandatory/random-2.jpg'
        );
        expect(feature.properties).toHaveProperty(
            'image_file_mandatory',
            '../media/specific_media_folder/random-4.jpg'
        );
        expect(feature.properties).toHaveProperty(
            'image_file_specific_root_folder',
            'media/upload/form_edition_all_field_type/form_edition_upload/text_file_mandatory/lorem-2.txt'
        );

        await project.openAttributeTable(layerName);
        await expect(project.attributeTableHtml(layerName).locator('tbody tr'))
            .toHaveCount(2);

        const theTableRow = project.attributeTableHtml(layerName).locator('tbody tr').nth(1);
        await expect(theTableRow.locator('lizmap-feature-toolbar'))
            .toHaveCount(1);
        const theFeatureToolbar = theTableRow.locator('lizmap-feature-toolbar');
        await expect(theFeatureToolbar.locator('button.feature-edit'))
            .toHaveCount(1);
        const theEditButton = theFeatureToolbar.locator('button.feature-edit');
        await expect(theEditButton)
            .toBeVisible();

        // Open edit feature
        let modifyFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('modifyFeature'));
        await theEditButton.click();
        let modifyFeatureRequest = await modifyFeatureRequestPromise;

        let editFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('editFeature'));
        await modifyFeatureRequest.response();
        let editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        // check request
        expect(modifyFeatureRequest.url()).toMatch(/layerId=form_edition_upload_[a-z0-9_]{36}&featureId=3/);
        expect(editFeatureRequest.url()).toMatch(/layerId=form_edition_upload_[a-z0-9_]{36}&featureId=3/);
        // form visible
        await expect(page.locator('#jforms_view_edition')).toBeVisible();
        // id
        await expect(page.locator('#jforms_view_edition_id')).toHaveValue('3');
        // text_file_mandatory
        await page.locator('#jforms_view_edition_text_file_mandatory_choice_list').scrollIntoViewIfNeeded();
        await expect(page.locator('#jforms_view_edition_text_file_mandatory_choice_list').getByLabel('Keep')).toBeChecked();
        // image_file_mandatory
        await page.locator('#jforms_view_edition_image_file_mandatory_choice_list').scrollIntoViewIfNeeded();
        await expect(page.locator('#jforms_view_edition_image_file_mandatory_choice_list').getByLabel('Keep')).toBeChecked();
        // image_file_specific_root_folder
        await page.locator('#jforms_view_edition_image_file_specific_root_folder_choice_list').scrollIntoViewIfNeeded();
        await expect(page.locator('#jforms_view_edition_image_file_specific_root_folder_choice_list').getByLabel('Keep')).toBeChecked();
        // submit without changes
        await page.locator('#jforms_view_edition__submit_submit').scrollIntoViewIfNeeded();

        let saveFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('saveFeature'));
        await page.locator('#jforms_view_edition__submit_submit').click();
        let saveFeatureRequest = await saveFeatureRequestPromise;
        let closeFeatureRequestPromise = page.waitForRequest(resquest => resquest.url().includes('closeFeature'));
        await saveFeatureRequest.response();
        let closeFeatureRequest = await closeFeatureRequestPromise;
        await closeFeatureRequest.response();

        // GetFeature to check no changes
        response = await page.request.post(url, {
            form: form
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', layerName+'.3');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 3);
        expect(feature.properties).toHaveProperty(
            'text_file_mandatory',
            'media/upload/form_edition_all_field_type/form_edition_upload/image_file_mandatory/random-2.jpg'
        );
        expect(feature.properties).toHaveProperty(
            'image_file_mandatory',
            '../media/specific_media_folder/random-4.jpg'
        );
        expect(feature.properties).toHaveProperty(
            'image_file_specific_root_folder',
            'media/upload/form_edition_all_field_type/form_edition_upload/text_file_mandatory/lorem-2.txt'
        );
    });
});

test.describe('Form edition without creation', {tag: ['@readonly'],},() => {

    test('must allow modification without creation', async ({ page }) => {
        const project = new ProjectPage(page, 'form_edition_without_creation');
        await project.open();

        await expect(page.locator('#button-edition')).toBeVisible();
        await page.locator('#button-edition').click();

        await expect(page.locator('#edition-modification-msg')).toBeVisible();
        await expect(page.locator('#edition-creation')).not.toBeVisible();

        // Click on a feature then launch its edition form
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(630, 325);
        let getFeatureInfoRequest = await getFeatureInfoPromise;
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        responseExpect(getFeatureInfoResponse).toBeHtml();

        const featureToolbar = await project.popupContent.locator('lizmap-feature-toolbar[value^="quartiers_"][value$=".6"]');
        await expect(featureToolbar).toBeDefined();
        await expect(featureToolbar).toBeVisible();
        await expect(await featureToolbar.locator('button.feature-edit')).toBeVisible();

        let editFeatureRequestPromise = page.waitForRequest(
            request => request.method() === 'GET' &&
            request.url().includes('editFeature') === true &&
            request.url().includes('layerId=quartiers_') === true &&
            request.url().includes('featureId=6') === true
        );
        await featureToolbar.locator('button.feature-edit').click();
        let editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        // Only edition form should be visible...
        await expect(page.locator('#edition-modification-msg')).not.toBeVisible();
        await expect(page.locator('#edition-creation')).not.toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        // .. with edition message ..
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();
        await page.locator('#lizmap-edition-message .btn-close').click();
        await expect(page.locator('#lizmap-edition-message')).not.toBeVisible();

        // ... even after toggling dock visibility
        await project.closeLeftDock();
        await expect(page.locator('#edition-form-container')).not.toBeVisible();
        await page.locator('#button-edition').click();

        await expect(page.locator('#edition-modification-msg')).not.toBeVisible();
        await expect(page.locator('#edition-creation')).not.toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        // Cancel form edition...
        page.on('dialog', dialog => dialog.accept());
        await page.locator('#jforms_view_edition__submit_cancel').click();

        // ...returns back to initial state
        await expect(page.locator('#edition-modification-msg')).toBeVisible();
        await expect(page.locator('#edition-creation')).not.toBeVisible();
        await expect(page.locator('#edition-form-container')).not.toBeVisible();
    });

});
