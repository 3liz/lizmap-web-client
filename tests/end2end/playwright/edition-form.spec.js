// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Edition Form Validation', () => {

    test('Input type number with range and step', async ({ page }) => {
    // Go to http://localhost:8130/index.php/view/map?repository=testsrepository&project=form_edition_all_field_type

    const url_form_edition_all = '/index.php/view/map?repository=testsrepository&project=form_edition_all_field_type';
    await page.goto(url_form_edition_all, { waitUntil: 'networkidle' });


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
})