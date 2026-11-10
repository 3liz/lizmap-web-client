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

    test('Load external js', {
        tag: '@readonly',
    }, async ({ page }) => {
        const project = new ProjectPage(page, 'external_javascript_test');
        await project.open();

        // legacy_events.js and subscribe_uicreated.js
        await expect(page.locator('body')).toHaveAttribute("data-lizmap-user-defined-js-count", "2");

        // await some arbitrary time grater than the async delay in subscribe_uicreated.js external
        // js script
        await page.waitForTimeout(5000);

        await expect(page.locator("#external-js-test")).toBeVisible();
        await expect(page.locator("#external-js-test [error]")).toHaveCount(0);
    })

    test('Listen to legacy events from external js', {
        tag: '@readonly',
    }, async ({ page }) => {
        // Collect the uncaught errors of the page
        const pageErrors = [];
        page.on('pageerror', error => pageErrors.push(error.message));

        const project = new ProjectPage(page, 'external_javascript_test');
        await project.open();

        // The legacy events listened by legacy_events.js have been received, in the startup order
        const legacyEvents = page.locator('#external-js-legacy-events span');
        await expect(legacyEvents).toHaveCount(5);
        const receivedEvents = await legacyEvents.evaluateAll(
            spans => spans.map(span => span.dataset.event)
        );
        expect(receivedEvents).toEqual([
            'configsloaded',
            'mapcreated',
            'layersadded',
            'toolbarcreated',
            'uicreated',
        ]);

        // Listening to the legacy configsloaded event does not break the application initialization
        await expect(page.locator('#external-js-test')).toBeVisible();
        await expect(page.locator('#external-js-test [error]')).toHaveCount(0);
        expect(pageErrors).toEqual([]);
    })
})
