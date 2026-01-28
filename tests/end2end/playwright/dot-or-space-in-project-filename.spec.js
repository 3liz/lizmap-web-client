// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';

test.describe('Filename with dot or space @readonly', () => {

    test('projet with dot or space can be loaded', async ({ page }) => {
        // project file with dot
        let project = new ProjectPage(page, 'base_layers.withdot');
        await project.open();
        await expect(page.locator('#node-quartiers')).toBeVisible();
        // project file with space
        project = new ProjectPage(page, 'base_layers with space');
        await project.open();
        await expect(page.locator('#node-quartiers')).toBeVisible();
    });

});
