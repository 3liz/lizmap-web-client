// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Filename with dot or space', () => {

    test('projet with dot or space can be loaded', async ({ page }) => {
        // project file with dot
        await page.goto('/index.php/view/map/?repository=testsrepository&project=base_layers.withdot');
        await expect(page.locator('#node-quartiers')).toBeVisible();
        // project file with space
        await page.goto('/index.php/view/map/?repository=testsrepository&project=base_layers+with+space');
        await expect(page.locator('#node-quartiers')).toBeVisible();
    });

});
