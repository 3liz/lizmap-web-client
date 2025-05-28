// @ts-check
import { test, expect } from '@playwright/test';
import { getAuthStorageStatePath } from './globals';
import { ProjectPage } from './pages/project';

test.describe('Project warnings in CFG as admin',
    {
        tag: ['@readonly'],
    }, () => {

        test.use({ storageState: getAuthStorageStatePath('admin') });

        test('Visit map with a warning', async ({ page }) => {
            const project = new ProjectPage(page, 'project_cfg_warnings');
            await project.open(true);
            await expect(project.page.locator('#lizmap-project-warnings')).toBeVisible();
        });

    });

test.describe('Project warnings in CFG as anonymous',
    {
        tag: ['@readonly'],
    }, () => {

        test('Visit map without a warning', async ({ page }) => {
            const project = new ProjectPage(page, 'project_cfg_warnings');
            await project.open(true);
            await expect(project.page.locator('#lizmap-project-warnings')).not.toBeVisible();
        });

    });
