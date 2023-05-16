// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Popup', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=popup';
        await page.goto(url, { waitUntil: 'networkidle' });

        await page.locator('#map').click({
            position: {
                x: 510,
                y: 415
            }
        });
    });

    test('click on the shape to show the popup', async ({ page }) => {
        // When clicking on triangle feature a popup with two tabs must appear
        await expect(page.locator('#liz_layer_popup')).toBeVisible();
        await expect(page.locator('#liz_layer_popup_contentDiv > div > div > div > ul > li.active > a')).toBeVisible();
        await expect(page.locator('#liz_layer_popup_contentDiv > div > div > div > ul > li:nth-child(2) > a')).toBeVisible();
    });

    test('changes popup tab', async ({ page }) => {
        // When clicking `tab2`, `tab2_value` must appear
        await page.locator('.container > ul:nth-child(2) > li:nth-child(2)').click();
        await expect(page.locator('#popup_dd_1_tab2')).toHaveClass(/active/);
    });

    test('displays children popups', async ({ page }) => {
        await expect(page.locator('#liz_layer_popup .lizmapPopupChildren .lizmapPopupSingleFeature')).toHaveCount(2);
    });
});