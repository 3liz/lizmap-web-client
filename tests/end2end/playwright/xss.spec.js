// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('XSS', () => {
    // Test that flawed data are sanitized before being displayed
    test('No dialog from inline JS alert() appears', async ({ page }) => {

        let dialogOpens = 0;
        page.on('dialog', dialog => {
            dialog.accept();
            dialogOpens++;
        });

        const url = '/index.php/view/map/?repository=testsrepository&project=xss';
        await gotoMap(url, page)

        // Edition: add XSS data
        await page.locator('#button-edition').click();
        await page.locator('#edition-draw').click();

        await page.locator('#jforms_view_edition input[name="description"]').fill('<script>alert("XSS")</script>');

        await page.locator('#jforms_view_edition__submit_submit').click();

        // Open popup
        await page.locator('#newOlMap').click({
            position: {
                x: 415,
                y: 290
            }
        });

        // Open attribute table
        await page.locator('#button-attributeLayers').click();
        await page
            .locator('button[value="xss_layer"].btn-open-attribute-layer')
            .click({ force: true });

        expect(dialogOpens).toEqual(0);
    });

    test('Iframe in a popup', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=xss&layer=xss_layer&filter=%22id%22%20%3D%20\'2\'&popup=true';
        await gotoMap(url, page)
        await expect(page.frameLocator('iframe').locator('#map')).toHaveCount(1);
    });
});
