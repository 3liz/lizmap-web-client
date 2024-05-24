// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Edition Form Validation', () => {

  test.beforeEach(async ({ page }) => {
      const url = '/index.php/view/map/?repository=testsrepository&project=form_edition_all_field_type';
      await page.goto(url, { waitUntil: 'networkidle' });
  });

  test('Input type number with range and step', async ({ page }) => {
      // display form
      await page.locator('#button-edition').click();
      await page.locator('a#edition-draw').click();

      // ensure input attributes match with field config defined in project
      await expect(page.locator('#jforms_view_edition input[name="integer_field"]')).toHaveAttribute('type','number')
      await expect(page.locator('#jforms_view_edition input[name="integer_field"]')).toHaveAttribute('step','5');
      await expect(page.locator('#jforms_view_edition input[name="integer_field"]')).toHaveAttribute('min','-200');
      await expect(page.locator('#jforms_view_edition input[name="integer_field"]')).toHaveAttribute('max','200');

      // add data
      await page.locator('#jforms_view_edition input[name="integer_field"]').fill('50');

      // submit form
      await page.locator('#jforms_view_edition__submit_submit').click();
      // will close & show message
      await expect(page.locator('#edition-form-container')).toBeHidden();
      await expect(page.locator('#lizmap-edition-message')).toBeVisible();
  })

  test('Boolean nullable w/ value map', async ({ page }) => {

      let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));

      await page.locator('#button-edition').click();
      await page.locator('#edition-layer').selectOption({label: 'many_bool_formats'});
      await page.locator('#edition-draw').click();
      await page.locator('#jforms_view_edition_liz_future_action').selectOption('edit');
      await page.getByLabel('bool_simple_null_vm').selectOption('t');
      await page.locator('#jforms_view_edition__submit_submit').click();

      await editFeatureRequestPromise;

      // Wait a bit for the UI to refresh
      await page.waitForTimeout(300);

      await expect(page.getByLabel('bool_simple_null_vm')).toHaveValue('t');

      await page.getByLabel('bool_simple_null_vm').selectOption('');
      await page.locator('#jforms_view_edition__submit_submit').click();

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

      // display form
      await page.locator('#button-edition').click();
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
        await page.goto(url, { waitUntil: 'networkidle' });
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
        await page.locator('#edition-layer').selectOption({label:'double_geom_d'});

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
        // geom record does not have geom_d attribute filled beacuse its geometry is stored in the geom column, not showned in the attribute table
        await expect(double_geom_geom_attr_table.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("geom");
        await expect(double_geom_geom_attr_table.locator("tbody tr").nth(1).locator("td").nth(3)).toHaveText("");
        // in the double_geom_geom table, the geom_d record geometry shuold be correctly stroed in the geom_d column
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
        // in the double_geom_geom_d table, the geom record geometry shuold be correctly stroed in the geom column
        await expect(double_geom_geom_d_attr_table.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("geom");
        await expect(double_geom_geom_d_attr_table.locator("tbody tr").nth(1).locator("td").nth(3)).toHaveText("[object Object]");
        // geom_d record does not have geom attribute filled beacuse its geometry is stored in the geom_d column, not showned in the attribute table
        await expect(double_geom_geom_d_attr_table.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("geom_d");
        await expect(double_geom_geom_d_attr_table.locator("tbody tr").nth(2).locator("td").nth(3)).toHaveText("");

    })

    test('Triple geom layer', async ({ page }) => {

        await page.locator('#button-edition').click();

        // triple_geom_layer editing, layer with "geom" column
        await page.locator('#edition-layer').selectOption({label:'triple_geom_point'})

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
        await page.locator('#edition-layer').selectOption({label:'triple_geom_line'});

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
        await page.locator('#edition-layer').selectOption({label:'triple_geom_polygon'})

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
        // triple_geom_point record does not have geom_l or geom_p attribute filled beacuse its geometry is stored in the geom column, not showned in the attribute table
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("triple_geom_point");
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(1).locator("td").nth(3)).toHaveText("");
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(1).locator("td").nth(4)).toHaveText("");
        // in the triple_geom_point table, the triple_geom_line record geometry shuold be correctly stroed in the geom_l column
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("triple_geom_line");
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(2).locator("td").nth(3)).toHaveText("[object Object]");
        await expect(triple_geom_geom_attr_table.locator("tbody tr").nth(2).locator("td").nth(4)).toHaveText("");
        // in the triple_geom_point table, the triple_geom_polygon record geometry shuold be correctly stroed in the geom_p column
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
        // in the triple_geom_line table, the triple_geom_point record geometry shuold be correctly stroed in the geom column
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("triple_geom_point");
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(1).locator("td").nth(3)).toHaveText("[object Object]");
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(1).locator("td").nth(4)).toHaveText("");
        // triple_geom_line record does not have geom or geom_p attribute filled beacuse its geometry is stored in the geom_l column, not showned in the attribute table
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("triple_geom_line");
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(2).locator("td").nth(3)).toHaveText("");
        await expect(triple_geom_geom_l_attr_table.locator("tbody tr").nth(2).locator("td").nth(4)).toHaveText("");
        // in the triple_geom_line table, the triple_geom_polygon record geometry shuold be correctly stroed in the geom_p column
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
        // in the triple_geom_polygon table, the triple_geom_point record geometry shuold be correctly stroed in the geom column
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("triple_geom_point");
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(1).locator("td").nth(3)).toHaveText("[object Object]");
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(1).locator("td").nth(4)).toHaveText("");
        // in the triple_geom_polygon table, the triple_geom_line record geometry shuold be correctly stroed in the geom_l column
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("triple_geom_line");
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(2).locator("td").nth(3)).toHaveText("");
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(2).locator("td").nth(4)).toHaveText("[object Object]");
        // triple_geom_polygon record does not have geom or geom_l attribute filled beacuse its geometry is stored in the geom_p column, not showned in the attribute table
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(3).locator("td").nth(2)).toHaveText("triple_geom_polygon");
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(3).locator("td").nth(3)).toHaveText("");
        await expect(triple_geom_geom_p_attr_table.locator("tbody tr").nth(3).locator("td").nth(4)).toHaveText("");

    })
  })
