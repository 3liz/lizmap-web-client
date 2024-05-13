// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Popup', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=popup';
        await page.goto(url, { waitUntil: 'networkidle' });
    });

    test('click on the shape to show the popup', async ({ page }) => {
        // When clicking on triangle feature a popup with two tabs must appear
        await page.locator('#map').click({
            position: {
                x: 510,
                y: 415
            }
        });
        await expect(page.locator('#liz_layer_popup')).toBeVisible();
        await expect(page.locator('#liz_layer_popup_contentDiv > div > div > div > ul > li.active > a')).toBeVisible();
        await expect(page.locator('#liz_layer_popup_contentDiv > div > div > div > ul > li:nth-child(2) > a')).toBeVisible();
    });

    test('changes popup tab', async ({ page }) => {
        // When clicking `tab2`, `tab2_value` must appear
        await page.locator('#map').click({
            position: {
                x: 510,
                y: 415
            }
        });
        await page.locator('.container > ul:nth-child(2) > li:nth-child(2)').click();
        await expect(page.locator('#popup_dd_1_tab2')).toHaveClass(/active/);
    });

    test('displays children popups', async ({ page }) => {
        await page.locator('#map').click({
            position: {
                x: 510,
                y: 415
            }
        });
        await expect(page.locator('#liz_layer_popup .lizmapPopupChildren .lizmapPopupSingleFeature')).toHaveCount(2);
    });

    test('getFeatureInfo request should contain a FILTERTOKEN parameter when the layer is filtered', async ({ page }) => {
        await page.locator('#button-filter').click();

        // Select a feature to filter and wait for GetMap request with FILTERTOKEN parameter
        let getMapRequestPromise = page.waitForRequest(/FILTERTOKEN/);
        await page.locator('#liz-filter-field-test').selectOption('1');
        await getMapRequestPromise;

        let getFeatureInfoRequestPromise = page.waitForRequest(/GetFeatureInfo/);
        await page.locator('#map').click({
          position: {
            x: 486,
            y: 136
          }
        });

        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        expect(getFeatureInfoRequest.url()).toMatch(/FILTERTOKEN/);
    });
});

test.describe('Children in popup', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=feature_toolbar';
        await page.goto(url, { waitUntil: 'networkidle' });
    });

    test('click on the feature to show the popup and his children', async ({ page }) => {
        // When clicking on triangle feature a popup with two tabs must appear
        await page.locator('#map').click({
                position: {
                    x: 436,
                    y: 290
                }
                });
        // Default children information visible
        await expect(page.locator('#popupcontent .lizmapPopupChildren .lizmapPopupSingleFeature')).toHaveCount(2);
        await expect(page.locator('div').getByRole('heading', { name: 'children_layer' })).toHaveCount(2);
        // Compact children table button visible
        await expect(page.locator('.compact-tables')).toBeVisible();

        // Click on children table button
        await page.locator('.compact-tables').click();
        // Children compact table is visible
        await expect(page.locator('div').getByRole('heading', { name: 'children_layer' })).toHaveCount(1);
    });

    test('click on multiple feature to show the popup and his children', async ({ page }) => {
        // Zoom out to click on multiple parent features
        await page.getByRole('button', { name: 'Zoom out' }).click();
        await page.waitForRequest(/GetMap/);
        await page.getByRole('button', { name: 'Zoom out' }).click();
        await page.waitForRequest(/GetMap/);
        await page.getByRole('button', { name: 'Zoom out' }).click();
        await page.waitForRequest(/GetMap/);
        await page.getByRole('button', { name: 'Zoom out' }).click();
        await page.locator('#map').click({
            position: {
                x: 448,
                y: 288
            }
        });
        // Default children information visible
        await expect(page.locator('#popupcontent .lizmapPopupChildren .lizmapPopupSingleFeature')).toHaveCount(3);
        await expect(page.locator('div').getByRole('heading', { name: 'children_layer' })).toHaveCount(3);
        await expect(page.locator('.compact-tables')).toHaveCount(2);

        // Click on children table button
        await page.locator('.compact-tables').nth(1).click();
        await expect(page.locator('div').getByRole('heading', { name: 'children_layer' })).toHaveCount(2);
    });
});
