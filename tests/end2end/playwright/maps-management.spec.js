// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Maps management', () => {

  test.use({ storageState: 'playwright/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    // Go to admin.php
    await page.goto('admin.php');
  });

  test('Create and remove a repository', async ({ page }) => {
    // Go to Maps management
    await page.getByRole('link', { name: 'Maps management' }).click();
    // Check selected admin menu item
    await expect(page.locator('#menu li.active')).toHaveText('Maps management');
    // Contains 2 buttons Create a repository
    await expect(page.locator('div').filter({ hasText: 'Create a repository' }).getByRole('link', { name: 'Create a repository' })).toHaveCount(2);

    // Go to Create a repository
    await page.locator('div').filter({ hasText: 'Create a repository' }).getByRole('link', { name: 'Create a repository' }).first().click();

    // Check URL
    await expect(page).toHaveURL(/.*admin.php\/admin\/maps\/editSection/);
    // Check selected admin menu item
    await expect(page.locator('#menu li.active')).toHaveText('Maps management');

    // Check form
    await expect(page.locator('[id=jforms_admin_config_section_path]')).toHaveValue('');
    await expect(page.locator('[id=jforms_admin_config_section_label]')).toBeEmpty();
    await expect(page.locator('[id=jforms_admin_config_section_repository]')).toBeEmpty();
    await expect(page.locator('[id=jforms_admin_config_section_repository]')).toBeEditable();
    await expect(page.locator('[id=jforms_admin_config_section_allowUserDefinedThemes]')).not.toBeChecked();
    await expect(page.locator('[id=jforms_admin_config_section_accessControlAllowOrigin]')).toBeEmpty();

    // Check default rights on repository
    // anonymous, admins and users can view
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.repositories\\.view_0"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.repositories\\.view_1"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.repositories\\.view_2"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.repositories\\.view_3"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.repositories\\.view_4"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.repositories\\.view_5"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.repositories\\.view_6"]')).toBeChecked();
    // admins and users can display get capabilities links
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.displayGetCapabilitiesLinks_0"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.displayGetCapabilitiesLinks_1"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.displayGetCapabilitiesLinks_2"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.displayGetCapabilitiesLinks_3"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.displayGetCapabilitiesLinks_4"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.displayGetCapabilitiesLinks_5"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.displayGetCapabilitiesLinks_6"]')).toBeChecked();
    // admins and users can use edition
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.edition\\.use_0"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.edition\\.use_1"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.edition\\.use_2"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.edition\\.use_3"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.edition\\.use_4"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.edition\\.use_5"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.edition\\.use_6"]')).not.toBeChecked();
    // admins and users can export layers
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.layer\\.export_0"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.layer\\.export_1"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.layer\\.export_2"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.layer\\.export_3"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.layer\\.export_4"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.layer\\.export_5"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.layer\\.export_6"]')).toBeChecked();
    // no users override login filtered layers
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.loginFilteredLayers\\.override_0"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.loginFilteredLayers\\.override_1"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.loginFilteredLayers\\.override_2"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.loginFilteredLayers\\.override_3"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.loginFilteredLayers\\.override_4"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.loginFilteredLayers\\.override_5"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.loginFilteredLayers\\.override_6"]')).not.toBeChecked();

    // Select a path to create a new repository
    await page.locator('[id=jforms_admin_config_section_path]').selectOption('/srv/lzm/tests/qgis-projects/ProJets 1982*!/');
    // Check proposed value
    await expect(page.locator('[id=jforms_admin_config_section_label]')).toHaveValue('Projets 1982*!');
    await expect(page.locator('[id=jforms_admin_config_section_repository]')).toHaveValue('projets1982');
    // Submit new repository
    await page.getByRole('button', { name: 'Save' }).click();

    // Check URL
    await expect(page).toHaveURL(/.*admin.php\/admin\/maps/);
    // Check message
    await expect(page.locator('div.alert.alert-block')).toHaveClass(/alert-info/);
    await expect(page.locator('div.alert.alert-block.alert-info')).toContainText('The repository data have been saved.');

    // Check selected admin menu item
    await expect(page.locator('#menu li.active')).toHaveText('Maps management');

    // Remove created repository
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept()
    });
    await page.locator('[href="/admin.php/admin/maps/removeSection?repository=projets1982"]').click();
    // Check message
    await expect(page.locator('div.alert.alert-block')).toHaveClass(/alert-info/);
    await expect(page.locator('div.alert.alert-block.alert-info')).toContainText('The repository has been removed (8 group(s) concerned)');
    // Check URL
    await expect(page).toHaveURL(/.*admin.php\/admin\/maps/);

    // Check selected admin menu item
    await expect(page.locator('#menu li.active')).toHaveText('Maps management');
  });

  test('Update a repository', async ({ page }) => {
    // Go to Maps management
    await page.getByRole('link', { name: 'Maps management' }).click();
    // Check selected admin menu item
    await expect(page.locator('#menu li.active')).toHaveText('Maps management');

    // Go to modify repository
    await page.locator('a[href="/admin.php/admin/maps/modifySection?repository=testsrepository"]').click()

    // Check URL
    await expect(page).toHaveURL(/.*admin.php\/admin\/maps\/editSection\?repository=testsrepository/);
    // Check selected admin menu item
    await expect(page.locator('#menu li.active')).toHaveText('Maps management');

    // Check form
    await expect(page.locator('[id=jforms_admin_config_section_path]')).toHaveValue('/srv/lzm/tests/qgis-projects/tests/');
    await expect(page.locator('[id=jforms_admin_config_section_label]')).toHaveValue('Tests repository');
    await expect(page.locator('[id=jforms_admin_config_section_repository]')).not.toBeEditable();
    await expect(page.locator('[id=jforms_admin_config_section_repository]')).toHaveAttribute('value', 'testsrepository');
    await expect(page.locator('[id=jforms_admin_config_section_allowUserDefinedThemes]')).not.toBeChecked();
    await expect(page.locator('[id=jforms_admin_config_section_accessControlAllowOrigin]')).toHaveValue('http://othersite.local:8130');

    // Check default rights on repository
    // anonymous, admins, group_a and publishers can view
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.repositories\\.view_0"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.repositories\\.view_1"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.repositories\\.view_2"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.repositories\\.view_3"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.repositories\\.view_4"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.repositories\\.view_5"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.repositories\\.view_6"]')).not.toBeChecked();
    // anonymous, admins, group_a and publishers can display get capabilities links
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.displayGetCapabilitiesLinks_0"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.displayGetCapabilitiesLinks_1"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.displayGetCapabilitiesLinks_2"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.displayGetCapabilitiesLinks_3"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.displayGetCapabilitiesLinks_4"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.displayGetCapabilitiesLinks_5"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.displayGetCapabilitiesLinks_6"]')).not.toBeChecked();
    // anonymous, admins, group_a and publishers can use edition
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.edition\\.use_0"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.edition\\.use_1"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.edition\\.use_2"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.edition\\.use_3"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.edition\\.use_4"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.edition\\.use_5"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.edition\\.use_6"]')).not.toBeChecked();
    // anonymous, admins, group_a and publishers can export layers
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.layer\\.export_0"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.layer\\.export_1"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.layer\\.export_2"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.layer\\.export_3"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.layer\\.export_4"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.layer\\.export_5"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.layer\\.export_6"]')).not.toBeChecked();
    // admins and publishers override login filtered layers
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.loginFilteredLayers\\.override_0"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.loginFilteredLayers\\.override_1"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.loginFilteredLayers\\.override_2"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.loginFilteredLayers\\.override_3"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.loginFilteredLayers\\.override_4"]')).not.toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.loginFilteredLayers\\.override_5"]')).toBeChecked();
    await expect(page.locator('[id="jforms_admin_config_section_lizmap\\.tools\\.loginFilteredLayers\\.override_6"]')).not.toBeChecked();

    await page.getByRole('link', { name: 'Back' }).click();
    // Check URL
    await expect(page).toHaveURL(/.*admin.php\/admin\/maps/);

    // Check selected admin menu item
    await expect(page.locator('#menu li.active')).toHaveText('Maps management');
  });

});
