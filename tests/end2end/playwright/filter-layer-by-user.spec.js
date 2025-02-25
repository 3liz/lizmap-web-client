// @ts-check
import { test, expect } from '@playwright/test';
import { getAuthStorageStatePath, gotoMap } from './globals';

test.describe('Filter layer data by user - not connected', () => {

    test.beforeEach(async ({ page }) => {
        const url =
            '/index.php/view/map/?' +
            'repository=testsrepository&' +
            'project=filter_layer_by_user&' +
            'skip_warnings_display=1';
        await gotoMap(url, page);

        // Close dock to access all features on map
        await page.locator('#dock-close').click();
    });

    // DISABLED BECAUSE IT IS NOT RELIABLE, MAINTAINABLE AND CAUSES HEADACHE ;-)
    // Instead, we use a WMS GetFeatureInfo in JSON format below
    // test('GetMap', async ({ page }) => {
    //     // Hide all elements but #newOlMap and its children
    //     await page.$eval("*", el => el.style.visibility = 'hidden');
    //     await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

    //     expect(await page.locator('#newOlMap').screenshot()).toMatchSnapshot('map_not_connected.png', {
    //         maxDiffPixels: 500
    //     });
    // });

    test('WMS GetFeatureInfo JSON', async ({ page }) => {

        const getFeatureInfo = await page.evaluate(async () => {
            const params = {
                repository: "testsrepository",
                project: "filter_layer_by_user",
                SERVICE: "WMS",
                REQUEST: "GetFeatureInfo",
                VERSION: "1.3.0",
                CRS: "EPSG:2154",
                INFO_FORMAT:  "application/json",
                QUERY_LAYERS: "green_filter_layer_by_user_edition_only,blue_filter_layer_by_user,red_layer_with_no_filter",
                LAYERS: "green_filter_layer_by_user_edition_only,blue_filter_layer_by_user,red_layer_with_no_filter",
                STYLE: "default,default,default",
                FEATURE_COUNT: "10",
                FILTER: 'green_filter_layer_by_user_edition_only:"gid" > 0'
            };
            const query = new URLSearchParams(params);
            return await fetch("/index.php/lizmap/service?" + query.toString())
                .then(r => r.ok ? r.json() : Promise.reject(r))
        })

        // check features
        expect(getFeatureInfo.features).toHaveLength(4)
        // check a specific feature
        const feature = getFeatureInfo.features[0]
        expect(feature.id).not.toBeUndefined()

    });

    test('WFS GetFeature', async ({ page }) => {

        let getFeature = await page.evaluate(async () => {
            const params = {
                repository: "testsrepository",
                project: "filter_layer_by_user",
                SERVICE: "WFS",
                REQUEST: "GetFeature",
                VERSION: "1.0.0",
                OUTPUTFORMAT: "GeoJSON",
                TYPENAME: "blue_filter_layer_by_user"
            };
            const query = new URLSearchParams(params);
            return await fetch("/index.php/lizmap/service?" + query.toString())
                .then(r => r.ok ? r.json() : Promise.reject(r))
        })

        // check features
        expect(getFeature.features).toHaveLength(0)
    });

    test('Popup with map click', async ({ page }) => {
        let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeatureInfo') === true);

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
    test.use({ storageState: getAuthStorageStatePath('user_in_group_a') });

    test.beforeEach(async ({ page }) => {
        const url = '' +
            '/index.php/view/map/?' +
            'repository=testsrepository&' +
            'project=filter_layer_by_user&' +
            'skip_warnings_display=1';
        await gotoMap(url, page);

        // Close dock to access all features on map
        await page.locator('#dock-close').click();
    });

    // DISABLED BECAUSE IT IS NOT RELIABLE, MAINTAINABLE AND CAUSES HEADACHE ;-)
    // Instead, we use a WMS GetFeatureInfo in JSON format below
    // test('GetMap', async ({ page }) => {
    //     // Hide all elements but #newOlMap and its children
    //     await page.$eval("*", el => el.style.visibility = 'hidden');
    //     await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

    //     expect(await page.locator('#newOlMap').screenshot()).toMatchSnapshot('map_connected_as_user_in_group_a.png', {
    //         maxDiffPixels: 500
    //     });
    // });

    test('WMS GetFeatureInfo JSON', async ({ page }) => {

        const getFeatureInfo = await page.evaluate(async () => {
            return await fetch(
                "/index.php/lizmap/service?repository=testsrepository&project=filter_layer_by_user&" +
                "SERVICE=WMS&" +
                "REQUEST=GetFeatureInfo&" +
                "VERSION=1.3.0&" +
                "CRS=EPSG%3A2154&" +
                "INFO_FORMAT=application%2Fjson&" +
                "QUERY_LAYERS=green_filter_layer_by_user_edition_only%2Cblue_filter_layer_by_user%2Cred_layer_with_no_filter&" +
                "LAYERS=green_filter_layer_by_user_edition_only%2Cblue_filter_layer_by_user%2Cred_layer_with_no_filter&" +
                "STYLE=default%2Cdefault%2Cdefault&" +
                "FEATURE_COUNT=10&" +
                "FILTER=green_filter_layer_by_user_edition_only:\"gid\" > 0"
            ).then(r => r.ok ? r.json() : Promise.reject(r))
        })

        // check features
        expect(getFeatureInfo.features).toHaveLength(5)
        // check a specific feature
        const feature = getFeatureInfo.features[0]
        expect(feature.id).not.toBeUndefined()

    });

    test('WFS GetFeature', async ({ page }) => {

        let getFeature = await page.evaluate(async () => {
            const params = {
                repository: "testsrepository",
                project: "filter_layer_by_user",
                SERVICE: "WFS",
                REQUEST: "GetFeature",
                VERSION: "1.0.0",
                OUTPUTFORMAT: "GeoJSON",
                TYPENAME: "blue_filter_layer_by_user"
            };
            const query = new URLSearchParams(params);
            return await fetch("/index.php/lizmap/service?" + query.toString())
                .then(r => r.ok ? r.json() : Promise.reject(r))
        })

        // check features
        expect(getFeature.features).toHaveLength(1)
        // check a specific feature
        let feature = getFeature.features[0]
        expect(feature.id).not.toBeUndefined()

        getFeature = await page.evaluate(async () => {
            const params = {
                repository: "testsrepository",
                project: "filter_layer_by_user",
                SERVICE: "WFS",
                REQUEST: "GetFeature",
                VERSION: "1.0.0",
                OUTPUTFORMAT: "GeoJSON",
                TYPENAME: "blue_filter_layer_by_user",
                EXP_Filter: '"gid" = 3'
            };
            const query = new URLSearchParams(params);
            return await fetch("/index.php/lizmap/service?" + query.toString())
                .then(r => r.ok ? r.json() : Promise.reject(r))
        })

        // check features
        expect(getFeature.features).toHaveLength(0)
    });

    test('Popup with map click', async ({ page }) => {
        let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeatureInfo') === true);

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
    test.use({ storageState: getAuthStorageStatePath('admin') });

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?' +
            'repository=testsrepository&' +
            'project=filter_layer_by_user&' +
            'skip_warnings_display=1';
        await gotoMap(url, page);

        // Close dock to access all features on map
        await page.locator('#dock-close').click();
    });

    // DISABLED BECAUSE IT IS NOT RELIABLE, MAINTAINABLE AND CAUSES HEADACHE ;-)
    // Instead, we use a WMS GetFeatureInfo in JSON format below
    // test('GetMap', async ({ page }) => {
    //     // Hide all elements but #newOlMap and its children
    //     await page.$eval("*", el => el.style.visibility = 'hidden');
    //     await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

    //     expect(await page.locator('#newOlMap').screenshot()).toMatchSnapshot('map_connected_as_admin.png', {
    //         maxDiffPixels: 500
    //     });
    // });

    test('WMS GetFeatureInfo JSON', async ({ page }) => {

        const getFeatureInfo = await page.evaluate(async () => {
            return await fetch(
                "/index.php/lizmap/service?repository=testsrepository&project=filter_layer_by_user&" +
                "SERVICE=WMS&" +
                "REQUEST=GetFeatureInfo&" +
                "VERSION=1.3.0&" +
                "CRS=EPSG%3A2154&" +
                "INFO_FORMAT=application%2Fjson&" +
                "QUERY_LAYERS=green_filter_layer_by_user_edition_only%2Cblue_filter_layer_by_user%2Cred_layer_with_no_filter&" +
                "LAYERS=green_filter_layer_by_user_edition_only%2Cblue_filter_layer_by_user%2Cred_layer_with_no_filter&" +
                "STYLE=default%2Cdefault%2Cdefault&" +
                "FEATURE_COUNT=10&" +
                "FILTER=green_filter_layer_by_user_edition_only:\"gid\" > 0"
            ).then(r => r.ok ? r.json() : Promise.reject(r))
        })

        // check features
        expect(getFeatureInfo.features).toHaveLength(7)
        // check a specific feature
        const feature = getFeatureInfo.features[0]
        expect(feature.id).not.toBeUndefined()

    });

    test('WFS GetFeature', async ({ page }) => {

        let getFeature = await page.evaluate(async () => {
            const params = {
                repository: "testsrepository",
                project: "filter_layer_by_user",
                SERVICE: "WFS",
                REQUEST: "GetFeature",
                VERSION: "1.0.0",
                OUTPUTFORMAT: "GeoJSON",
                TYPENAME: "blue_filter_layer_by_user"
            };
            const query = new URLSearchParams(params);
            return await fetch("/index.php/lizmap/service?" + query.toString())
                .then(r => r.ok ? r.json() : Promise.reject(r))
        })

        // check features
        expect(getFeature.features).toHaveLength(3)
        // check a specific feature
        let feature = getFeature.features[0]
        expect(feature.id).not.toBeUndefined()

        getFeature = await page.evaluate(async () => {
            const params = {
                repository: "testsrepository",
                project: "filter_layer_by_user",
                SERVICE: "WFS",
                REQUEST: "GetFeature",
                VERSION: "1.0.0",
                OUTPUTFORMAT: "GeoJSON",
                TYPENAME: "blue_filter_layer_by_user",
                EXP_Filter: '"gid" = 3'
            };
            const query = new URLSearchParams(params);
            return await fetch("/index.php/lizmap/service?" + query.toString())
                .then(r => r.ok ? r.json() : Promise.reject(r))
        })

        // check features
        expect(getFeature.features).toHaveLength(1)
        // check a specific feature
        feature = getFeature.features[0]
        expect(feature.id).not.toBeUndefined()

    });

    test('Popup with map click', async ({ page }) => {
        let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeatureInfo') === true);

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
