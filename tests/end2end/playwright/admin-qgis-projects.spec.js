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

    test('Filter by repository', async ({ page }) => {
        const adminPage = new AdminPage(page);
        await adminPage.open();
        await adminPage.openPage('QGIS projects');
        const projects = adminPage.page.locator('#lizmap_project_list');
        const allProjectCount = await projects.locator('table tbody tr').count();
        expect(allProjectCount).toBeGreaterThan(1);
        // select bad respository (0 projects)
        await page.locator('#repository-selector').selectOption('badrepository');
        await page.waitForURL(/repository=badrepository/);
        // datatable show 1 line with class dataTables_empty
        expect(projects.locator('table tbody tr')).toHaveCount(1)
        expect(projects.locator('table tbody tr td')).toHaveClass('dataTables_empty');

    });

    test('Check project with inspection', async ({ page }) => {
        const adminPage = new AdminPage(page);
        await adminPage.open();
        await adminPage.openPage('QGIS projects');
        const projects = adminPage.page.locator('#lizmap_project_list');
        const columnLocator = 'table tbody tr:first-child td';
        const projectAdminColCount = 11;
        const inspectionDelta = 7;
        expect(await projects.locator(columnLocator).count()).toBe(projectAdminColCount+inspectionDelta);
        // select testsrepository (no inpection)
        await page.locator('#repository-selector').selectOption('testsrepository');
        await page.waitForURL(/repository=testsrepository/);
        expect(await projects.locator(columnLocator).count()).toBe(projectAdminColCount);

    });
});
