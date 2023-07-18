import { test, expect } from '@playwright/test';

test.describe('Filter layer data by user - not connected', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=filter_layer_by_user';
        await page.goto(url, { waitUntil: 'networkidle' });

        // Close dock to access all features on map
        await page.locator('#dock-close').click();
    });

    test('GetMap', async ({ page }) => {
        // Hide all elements but #baseLayersOlMap and its children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#baseLayersOlMap, #baseLayersOlMap *", el => el.style.visibility = 'visible');

        expect(await page.locator('#baseLayersOlMap').screenshot()).toMatchSnapshot('map_not_connected.png', {
            maxDiffPixels: 500
          });
    });

    test('Popup', async ({ page }) => {
        let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeatureInfo'));

        // blue_filter_layer_by_user
        // admin point
        await page.locator('body').click({
            position: {
                x: 346,
                y: 422
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveCount(0);
        await expect(page.locator('.lizmapPopupContent h4')).toHaveText('No object has been found at this location.');

        // user_in_group_a point
        await page.locator('body').click({
            position: {
                x: 510,
                y: 341
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveCount(0);
        await expect(page.locator('.lizmapPopupContent h4')).toHaveText('No object has been found at this location.');

        await page.waitForTimeout(2000);

        // red_layer_with_no_filter
        await page.locator('body').click({
            position: {
                x: 438,
                y: 193
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveText('red_layer_with_no_filter');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-delete')).not.toHaveClass(/hide/);

        // green_filter_layer_by_user_edition_only
        // admin point
        await page.locator('body').click({
            position: {
                x: 383,
                y: 500
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');
        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-edit')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-delete')).toHaveClass(/hide/);

        // user_in_group_a point
        await page.locator('body').click({
            position: {
                x: 478,
                y: 498
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');
        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-edit')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-delete')).toHaveClass(/hide/);

        // no user point
        await page.locator('body').click({
            position: {
                x: 431,
                y: 563
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');
        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-edit')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-delete')).toHaveClass(/hide/);
    });
});

test.describe('Filter layer data by user - user in group a', () => {
    test.use({ storageState: 'playwright/.auth/user_in_group_a.json' });

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=filter_layer_by_user';
        await page.goto(url, { waitUntil: 'networkidle' });

        // Close dock to access all features on map
        await page.locator('#dock-close').click();
    });

    test('GetMap', async ({ page }) => {
        // Hide all elements but #baseLayersOlMap and its children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#baseLayersOlMap, #baseLayersOlMap *", el => el.style.visibility = 'visible');

        expect(await page.locator('#baseLayersOlMap').screenshot()).toMatchSnapshot('map_connected_as_user_in_group_a.png', {
            maxDiffPixels: 500
          });
    });

    test('Popup', async ({ page }) => {
        let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeatureInfo'));

        // blue_filter_layer_by_user
        // admin point
        await page.locator('body').click({
            position: {
                x: 346,
                y: 422
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveCount(0);
        await expect(page.locator('.lizmapPopupContent h4')).toHaveText('No object has been found at this location.');

        // user_in_group_a point
        await page.locator('body').click({
            position: {
                x: 510,
                y: 341
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveText('blue_filter_layer_by_user');
        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.2"] .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.2"] .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.2"] .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.2"] .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.2"] .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.2"] .feature-delete')).not.toHaveClass(/hide/);

        // red_layer_with_no_filter
        await page.locator('body').click({
            position: {
                x: 438,
                y: 193
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveText('red_layer_with_no_filter');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-delete')).not.toHaveClass(/hide/);

        // green_filter_layer_by_user_edition_only
        // admin point
        await page.locator('body').click({
            position: {
                x: 383,
                y: 500
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');
        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-edit')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-delete')).toHaveClass(/hide/);

        // user_in_group_a point
        await page.locator('body').click({
            position: {
                x: 478,
                y: 498
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');
        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-delete')).not.toHaveClass(/hide/);

        // no user point
        await page.locator('body').click({
            position: {
                x: 431,
                y: 563
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');
        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-edit')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-delete')).toHaveClass(/hide/);
    });
});

test.describe('Filter layer data by user - admin', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=filter_layer_by_user';
        await page.goto(url, { waitUntil: 'networkidle' });

        // Close dock to access all features on map
        await page.locator('#dock-close').click();
    });

    test('GetMap', async ({ page }) => {
        // Hide all elements but #baseLayersOlMap and its children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#baseLayersOlMap, #baseLayersOlMap *", el => el.style.visibility = 'visible');

        expect(await page.locator('#baseLayersOlMap').screenshot()).toMatchSnapshot('map_connected_as_admin.png', {
            maxDiffPixels: 500
          });
    });

    test('Popup', async ({ page }) => {
        let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeatureInfo'));

        // blue_filter_layer_by_user
        // admin point
        await page.locator('body').click({
            position: {
                x: 356,
                y: 346
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveText('blue_filter_layer_by_user');
        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.1"] .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.1"] .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.1"] .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.1"] .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.1"] .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.1"] .feature-delete')).not.toHaveClass(/hide/);

        // red_layer_with_no_filter
        await page.locator('body').click({
            position: {
                x: 438,
                y: 193
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveText('red_layer_with_no_filter');

        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"] .feature-delete')).not.toHaveClass(/hide/);

        // green_filter_layer_by_user_edition_only
        // admin point
        await page.locator('body').click({
            position: {
                x: 383,
                y: 500
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');
        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"] .feature-delete')).not.toHaveClass(/hide/);

        // user_in_group_a point
        await page.locator('body').click({
            position: {
                x: 478,
                y: 498
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');
        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"] .feature-delete')).not.toHaveClass(/hide/);

        // no user point
        await page.locator('body').click({
            position: {
                x: 431,
                y: 563
            }
        });
        await getFeatureInfoRequestPromise;
        await expect(page.locator('.lizmapPopupTitle')).toHaveText('green_filter_layer_by_user_edition_only');
        // Check feature toolbar button
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-select')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-filter')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-zoom')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-center')).toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-edit')).not.toHaveClass(/hide/);
        await expect(page.locator('#popupcontent lizmap-feature-toolbar[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"] .feature-delete')).not.toHaveClass(/hide/);
    });
});