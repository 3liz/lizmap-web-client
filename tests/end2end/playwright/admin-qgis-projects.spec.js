// @ts-check
import { test, expect } from '@playwright/test';
import { getAuthStorageStatePath } from './globals';
import {AdminPage} from "./pages/admin";

test.describe('QGIS Projects page', () => {

    test.use({ storageState: getAuthStorageStatePath('admin') });

    test('Project ACL', async ({ page }) => {
        const adminPage = new AdminPage(page);
        await adminPage.open();
        await adminPage.openPage('QGIS projects');

        const title = 'td:nth-child(3)';
        const project = '[data-repository-id="tests"]';
        const projects = await adminPage.page.locator('#lizmap_project_list');

        // Project is restricted to user_in_group_a
        const projectAclRow = await projects.locator(`tr${project}[data-project-id="project_acl"]`);
        await expect(projectAclRow.locator(title)).toContainText('project_acl');
        await expect(projectAclRow.locator(title)).toContainText('🔒');

        // Project does not have any restriction
        const dndFormRow = await projects.locator(`tr${project}[data-project-id="dnd_form"]`);
        await expect(dndFormRow.locator(title)).toContainText('dnd_form');
        await expect(dndFormRow.locator(title)).not.toContainText('🔒');
    });
});
