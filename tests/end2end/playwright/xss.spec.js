// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('XSS', () => {
    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=xss';
        await gotoMap(url, page);
    });

    // Test that flawed data are sanitized before being displayed
    test('No dialog from inline JS alert() appears', async ({ page }) => {

        let dialogOpens = 0;
        page.on('dialog', dialog => {
            dialog.accept();
            dialogOpens++;
        });

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

    test('Sanitized iframe in popup', async ({ page }) => {
        let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeatureInfo') === true);

        // Open popup
        await page.locator('#newOlMap').click({
            position: {
                x: 500,
                y: 285
            }
        });

        await getFeatureInfoRequestPromise;

        await expect(page.locator('#popupcontent iframe')).toHaveAttribute('sandbox', 'allow-scripts allow-forms');
    });
});
