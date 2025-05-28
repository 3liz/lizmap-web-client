// @ts-check
import { test, expect } from '@playwright/test';
import { getAuthStorageStatePath } from './globals';
import {AdminPage} from "./pages/admin";

test.describe('Maps management', () => {

    test.use({ storageState: getAuthStorageStatePath('admin') });

    test.beforeEach(async ({ page }) => {
        // Go to admin.php
        await page.goto('admin.php');
    });

    test('Create and remove a repository', async ({ page }) => {
        // Go to Maps management
        const adminPage = new AdminPage(page);
        await adminPage.openPage('Maps management');
        // Contains 2 buttons Create a repository
        await expect(page.locator('div').filter({ hasText: 'Create a repository' }).getByRole('link', { name: 'Create a repository' })).toHaveCount(2);

        // Go to Create a repository
        await page.locator('div').filter({ hasText: 'Create a repository' }).getByRole('link', { name: 'Create a repository' }).first().click();

        // Check URL
        await expect(page).toHaveURL(/.*admin.php\/admin\/maps\/editSection/);
        // Check selected admin menu item
        await adminPage.checkPage('Maps management');

        // Check form
        await expect(page.locator('[id=jforms_admin_config_section_path]')).toHaveValue('');
        await expect(page.locator('[id=jforms_admin_config_section_label]')).toBeEmpty();
        await expect(page.locator('[id=jforms_admin_config_section_repository]')).toBeEmpty();
        await expect(page.locator('[id=jforms_admin_config_section_repository]')).toBeEditable();
        await expect(page.locator('[id=jforms_admin_config_section_allowUserDefinedThemes]')).not.toBeChecked();
        await expect(page.locator('[id=jforms_admin_config_section_accessControlAllowOrigin]')).toBeEmpty();

        // Check default rights on repository
        // anonymous, admins and users can view
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="__anonymous"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="admins"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="group_a"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="group_b"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="intranet"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="lizadmins"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="publishers"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="users"]')).toBeChecked();

        // admins and users can display get capabilities links
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="__anonymous"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="admins"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="group_a"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="group_b"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="intranet"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="lizadmins"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="publishers"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="users"]')).toBeChecked();

        // admins can use edition
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="__anonymous"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="admins"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="group_a"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="group_b"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="intranet"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="lizadmins"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="publishers"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="users"]')).not.toBeChecked();

        // admins and users can export layers
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="__anonymous"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="admins"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="group_a"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="group_b"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="intranet"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="lizadmins"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="publishers"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="users"]')).toBeChecked();

        // no users override login filtered layers
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="__anonymous"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="admins"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="group_a"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="group_b"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="intranet"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="lizadmins"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="publishers"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="users"]')).not.toBeChecked();

        // Select a path to create a new repository
        await page.locator('[id=jforms_admin_config_section_path]').selectOption('/srv/lzm/tests/qgis-projects/ProJets 1982*!/');
        // Check proposed value
        await expect(page.locator('[id=jforms_admin_config_section_label]')).toHaveValue('Projets 1982*!');
        await expect(page.locator('[id=jforms_admin_config_section_repository]')).toHaveValue('projets1982');
        // Submit new repository
        await page.getByRole('button', { name: 'Save' }).click();

        // Check URL
        await expect(page).toHaveURL(/.*admin.php\/admin\/maps/);
        let page_url = new URL(page.url());
        await expect(page_url?.hash).toBe('#projets1982');
        await expect(page.locator('#projets1982')).toBeVisible();
        // Check message
        await adminPage.checkAlert('alert-info', 'The repository data has been saved.');

        // Check selected admin menu item
        await adminPage.checkPage('Maps management');

        // Remove created repository
        page.once('dialog', dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            dialog.accept()
        });
        await page.locator('[href="/admin.php/admin/maps/removeSection?repository=projets1982"]').click();
        // Check message
        await adminPage.checkAlert('alert-info', 'The repository has been removed (8 group(s) concerned)');
        // Check URL
        await expect(page).toHaveURL(/.*admin.php\/admin\/maps/);
        page_url = new URL(page.url());
        await expect(page_url?.hash).toBe('');

        // Check selected admin menu item
        await adminPage.checkPage('Maps management');
    });

    test('Update a repository', async ({ page }) => {
        // Go to Maps management
        const adminPage = new AdminPage(page);
        await adminPage.openPage('Maps management');

        // Go to modify repository
        await page.locator('a[href="/admin.php/admin/maps/modifySection?repository=testsrepository"]').click()

        // Check URL
        await expect(page).toHaveURL(/.*admin.php\/admin\/maps\/editSection\?repository=testsrepository/);
        // Check selected admin menu item
        await adminPage.checkPage('Maps management');

        // Check form
        await expect(page.locator('[id=jforms_admin_config_section_path]')).toHaveValue('/srv/lzm/tests/qgis-projects/tests/');
        await expect(page.locator('[id=jforms_admin_config_section_label]')).toHaveValue('Tests repository');
        await expect(page.locator('[id=jforms_admin_config_section_repository]')).not.toBeEditable();
        await expect(page.locator('[id=jforms_admin_config_section_repository]')).toHaveAttribute('value', 'testsrepository');
        await expect(page.locator('[id=jforms_admin_config_section_allowUserDefinedThemes]')).toBeChecked();
        await expect(page.locator('[id=jforms_admin_config_section_accessControlAllowOrigin]')).toHaveValue('http://othersite.local:8130');

        // Check default rights on repository
        // anonymous, admins, group_a, group_b and publishers can view
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="__anonymous"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="admins"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="group_a"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="group_b"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="intranet"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="lizadmins"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="publishers"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.repositories.view[]"][value="users"]')).not.toBeChecked();

        // anonymous, admins, group_a, group_b and publishers can display get capabilities links
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="__anonymous"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="admins"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="group_a"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="group_b"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="intranet"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="lizadmins"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="publishers"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.displayGetCapabilitiesLinks[]"][value="users"]')).not.toBeChecked();

        // anonymous, admins, group_a, group_b and publishers can use edition
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="__anonymous"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="admins"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="group_a"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="group_b"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="intranet"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="lizadmins"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="publishers"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.edition.use[]"][value="users"]')).not.toBeChecked();

        // anonymous, admins, group_a, group_b and publishers can export layers
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="__anonymous"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="admins"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="group_a"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="group_b"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="intranet"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="lizadmins"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="publishers"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.layer.export[]"][value="users"]')).not.toBeChecked();

        // admins and publishers override login filtered layers
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="__anonymous"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="admins"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="group_a"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="group_b"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="intranet"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="lizadmins"]')).not.toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="publishers"]')).toBeChecked();
        await expect(page.locator('input[name="lizmap.tools.loginFilteredLayers.override[]"][value="users"]')).not.toBeChecked();

        await page.getByRole('link', { name: 'Back' }).click();
        // Check URL
        await expect(page).toHaveURL(/.*admin.php\/admin\/maps/);
        const page_url = new URL(page.url());
        await expect(page_url?.hash).toBe('#testsrepository');
        await expect(page.locator('#testsrepository')).toBeVisible();

        // Check selected admin menu item
        await adminPage.checkPage('Maps management');
    });

});
