// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Edition Form Validation', () => {

    test('Input type number with range and step', async ({ page }) => {
    // Go to http://localhost:8130/index.php/view/map?repository=testsrepository&project=form_edition_all_field_type

    const url_form_edition_all = '/index.php/view/map?repository=testsrepository&project=form_edition_all_field_type';
    await page.goto(url_form_edition_all, { waitUntil: 'networkidle' });

    const displayDataPromise =  page.waitForRequest(/editableFeatures/);
    // display attributes panel
    await page.locator('a#button-attributeLayers').click();
    await page.locator('#attribute-layer-list-table tr:nth-child(1) button').click();
    // wait until data fetched
    await displayDataPromise;

    // count data
    const datatable = page.locator('#attribute-layer-table-form_edition_all_fields_types tr');
    const initialLineCount = (await datatable.count());

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
    // will close & add line to data
    await expect(page.locator('#edition-form-container')).toBeHidden();
    await expect(datatable).toHaveCount(initialLineCount + 1);
    await expect(page.locator('#attribute-layer-table-form_edition_all_fields_types tr:last-child td:nth-child(3)')).toHaveText('50' );

    // out of range
    await page.locator('a#edition-draw').click();
    await page.locator('#jforms_view_edition input[name="integer_field"]').fill('400000');
    await page.locator('#jforms_view_edition__submit_submit').click();
    // form doesn't hide
    await expect(page.locator('#edition-form-container')).toBeVisible();
    // data count unchanged
    await expect(datatable).toHaveCount(initialLineCount + 1);

    // input between steps
    await page.locator('#jforms_view_edition input[name="integer_field"]').fill('42');
    await page.locator('#jforms_view_edition__submit_submit').click();
     // form doesn't hide
    await expect(page.locator('#edition-form-container')).toBeVisible();
    // data count unchanged
    await expect(datatable).toHaveCount(initialLineCount + 1);

  })
})