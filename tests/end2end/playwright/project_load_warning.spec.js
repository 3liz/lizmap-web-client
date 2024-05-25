// @ts-check
import { test, expect } from '@playwright/test';
const { gotoMap } = require('./globals')

test.describe('Project warnings in CFG as admin', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Visit map with a warning', async ({ page }) => {
        const url = '/index.php/view/map?repository=testsrepository&project=project_cfg_warnings';
        await gotoMap(url, page)

        await expect(page.locator("#lizmap-warning-message")).toBeVisible();
    });

});

test.describe('Project warnings in CFG as anonymous', () => {

    test('Visit map without a warning', async ({ page }) => {
        const url = '/index.php/view/map?repository=testsrepository&project=project_cfg_warnings';
        await gotoMap(url, page)

        await expect(page.locator("#lizmap-warning-message")).toHaveCount(0);
    });

});
