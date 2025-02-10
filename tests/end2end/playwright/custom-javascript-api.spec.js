// @ts-check
import { test, expect } from '@playwright/test';
import {ProjectPage} from "./pages/project.js";

test.describe('Maps management', () => {

    test('OpenLayers', {
        tag: '@readonly',
    }, async ({ page }) => {
        const project = new ProjectPage(page, 'world-3857');
        await project.open();

        await expect(page.locator('body')).toHaveAttribute("data-lizmap-user-defined-js-count", "1");
        await page.evaluate(() => { addOlLayers() })
        await page.waitForTimeout(1000);
        await expect(page.getByText('wms4326')).toBeVisible();
        await expect(page.getByText('states')).toBeVisible();
        await expect(page.getByText('VectorTile')).toBeVisible();
        await page.waitForTimeout(1000);
        await page.evaluate(() => { removeOlLayers() })
        await page.waitForTimeout(1000);
        await expect(page.getByText('wms4326')).not.toBeVisible();
        await expect(page.getByText('states')).not.toBeVisible();
        await expect(page.getByText('VectorTile')).not.toBeVisible();
    })
})
