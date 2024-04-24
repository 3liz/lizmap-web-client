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
})
