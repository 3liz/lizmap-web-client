// @ts-check
import { test, expect } from '@playwright/test';
import { getAuthStorageStatePath } from './globals';
import {AdminPage} from "./pages/admin";

test.describe('Server information', () => {

    test.use({ storageState: getAuthStorageStatePath('admin') });

    test.beforeEach(async ({ page }) => {
        // Go to admin.php
        await page.goto('admin.php');
    });

    test('Check page', async ({ page }) => {
        const adminPage = new AdminPage(page);

        // Go to server information
        await adminPage.openPage('Server information');

        // Check that Lizmap Web Client table contains 3 lines
        const lwcRows = page.locator('#lizmap_server_information table.table-lizmap-web-client tr')
        await expect(lwcRows).toHaveCount(3);
        for (const lwcRow of await lwcRows.all()) {
            await expect(lwcRow.locator('th')).toHaveCount(1);
            await expect(await lwcRow.locator('th').innerText()).not.toEqual('');
            await expect(lwcRow.locator('td')).toHaveCount(1);
            await expect(await lwcRow.locator('td').innerText()).not.toEqual('');
        }
        // Check that Lizmap modules contains 2 lines (header and 1 module lizmapdemo)
        const modulesHeadRows = page.locator('#lizmap_server_information table.table-lizmap-modules thead tr');
        await expect(modulesHeadRows).toHaveCount(1);
        const modulesRows = page.locator('#lizmap_server_information table.table-lizmap-modules tbody tr');
        await expect(modulesRows).toHaveCount(1);
        await modulesRows.scrollIntoViewIfNeeded();
        await expect(modulesRows.locator('th')).toHaveCount(1);
        await expect(await modulesRows.locator('th').innerText()).not.toEqual('');
        await expect(modulesRows.locator('td')).toHaveCount(1);
        await expect(await modulesRows.locator('td').innerText()).not.toEqual('');

        // Check that QGIS Server table contains 4 lines
        const qgisServerRows = page.locator('#lizmap_server_information table.table-qgis-server tr')
        await expect(qgisServerRows).toHaveCount(3);
        for (const row of await qgisServerRows.all()) {
            await expect(row.locator('th')).toHaveCount(1);
            await expect(await row.locator('th').innerText()).not.toEqual('');
            await expect(row.locator('td')).toHaveCount(1);
            await expect(await row.locator('td').innerText()).not.toEqual('');
        }
        // Check that QGIS Server plugins table contains a title row and at least 2 lines for plugins
        const qgisServerPluginRows = page.locator('#lizmap_server_information table.table-qgis-server-plugins tr:nth-child(1n+2)')
        await expect(await qgisServerPluginRows.count()).toBeGreaterThanOrEqual(2);
        for (const pluginRow of await qgisServerPluginRows.all()) {
            await pluginRow.scrollIntoViewIfNeeded();
            await expect(pluginRow.locator('th')).toHaveCount(1);
            await expect(await pluginRow.locator('th').innerText()).not.toEqual('');
            await expect(pluginRow.locator('td')).toHaveCount(1);
            await expect(await pluginRow.locator('td').innerText()).not.toEqual('');
        }
    });
});
