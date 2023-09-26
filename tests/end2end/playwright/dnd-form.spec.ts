import { test, expect } from '@playwright/test';

test.describe('Drag and drop from', function () {
  test.beforeEach(async function ({ page }) {
    // Runs before each tests in the block
    await page.goto(
      '/index.php/view/map/?repository=testsrepository&project=dnd_form'
    );
    await page.locator('#button-attributeLayers').click();
  });

  test('should not remove data', async function ({ page }) {
    await page
      .locator('button[value="dnd_form_geom"].btn-open-attribute-layer')
      .click({ force: true });
    await page.locator('.btn-detail-attributeTable').click({ force: true });
    await page
      .locator('#attribute-layer-table-dnd_form_geom tbody tr')
      .first()
      .click({ force: true });
    await expect(
      page.locator(
        '#attribute-table-panel-dnd_form_geom > div.lizmapPopupSingleFeature > div > table > tbody > tr:nth-child(2) > td'
      )
    ).not.toBeEmpty();
    await expect(
      page.locator(
        '#attribute-table-panel-dnd_form_geom > div.lizmapPopupSingleFeature > div > table > tbody > tr:nth-child(3) > td'
      )
    ).not.toBeEmpty();

    // Assert data has not been removed after form submission w/o modification
    await page
      .locator('#attribute-layer-table-dnd_form_geom .feature-edit')
      .click({ force: true });
    await page.locator('#jforms_view_edition__submit_submit').click();
    await page.waitForTimeout(300);
    await expect(
      page.locator(
        '#attribute-table-panel-dnd_form_geom > div.lizmapPopupSingleFeature > div > table > tbody > tr:nth-child(2) > td'
      )
    ).not.toBeEmpty();
    await expect(
      page.locator(
        '#attribute-table-panel-dnd_form_geom > div.lizmapPopupSingleFeature > div > table > tbody > tr:nth-child(3) > td'
      )
    ).not.toBeEmpty();

    // Assert data has changed after form submission w modification
    await page
      .locator('#attribute-layer-table-dnd_form_geom .feature-edit')
      .click({ force: true });
    await page.locator('#jforms_view_edition-tabs > li:nth-child(2)').click();
    await page.locator('#jforms_view_edition_field_in_dnd_form').clear();
    await page
      .locator('#jforms_view_edition_field_in_dnd_form')
      .fill('modified');
    await page.locator('#jforms_view_edition__submit_submit').click();

    // Click on line to refresh popup info
    await page
      .locator('#attribute-layer-table-dnd_form_geom tbody tr')
      .first()
      .click({ force: true });
    await expect(
      page.locator(
        '#attribute-table-panel-dnd_form_geom > div.lizmapPopupSingleFeature > div > table > tbody > tr:nth-child(2) > td'
      )
    ).toHaveText('modified');
    await expect(
      page.locator(
        '#attribute-table-panel-dnd_form_geom > div.lizmapPopupSingleFeature > div > table > tbody > tr:nth-child(3) > td'
      )
    ).toHaveText('test_geom');

    // Write back original data (TODO: refresh database data?)
    await page.waitForTimeout(300);
    await page
      .locator('#attribute-layer-table-dnd_form_geom .feature-edit')
      .click({ force: true });
    await page.locator('#jforms_view_edition-tabs > li:nth-child(2)').click();
    await page.locator('#jforms_view_edition_field_in_dnd_form').clear();
    await page
      .locator('#jforms_view_edition_field_in_dnd_form')
      .fill('test_geom');
    await page.locator('#jforms_view_edition__submit_submit').click();
  });
});
