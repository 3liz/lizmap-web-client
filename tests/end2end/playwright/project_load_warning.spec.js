// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';

test.describe('Project warnings in CFG as admin',
    {
        tag: ['@readonly'],
    }, () => {

    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Visit map with a warning', async ({ page }) => {
        const project = new ProjectPage(page, 'project_cfg_warnings');
        await project.open();
        await expect(project.warningMessage).toBeVisible();
    });

});

test.describe('Project warnings in CFG as anonymous',
    {
        tag: ['@readonly'],
    }, () => {

    test('Visit map without a warning', async ({ page }) => {
        const project = new ProjectPage(page, 'project_cfg_warnings');
        await project.open();
        await expect(project.warningMessage).toHaveCount(0);
    });

});
