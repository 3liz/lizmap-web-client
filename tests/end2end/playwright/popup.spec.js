// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';
import { ProjectPage } from "./pages/project";

test.describe('Dataviz in popup @readonly', () => {
    test('Check lizmap feature toolbar', async ({ page }) => {
        const project = new ProjectPage(page, 'popup_bar');
        await project.open();

        // Prepare the page
        await project.closeLeftDock();
        await page.waitForTimeout(300);

        // Click on the map and wait for GetFeatureInfo
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(355, 280);
        let getFeatureInfo = await getFeatureInfoPromise;
        await getFeatureInfo.response();

        // Check the GetPlot request
        let getPlot = project.waitForGetPlotRequest();
        let getPlotRequest = await getPlot;
        await expect(getPlotRequest.headers()).toHaveProperty('content-type', 'application/json');
        let postData = getPlotRequest.postDataJSON();
        await expect(postData).toHaveProperty('request', 'getPlot');
        await expect(postData).toHaveProperty('plot_id', 0);
        await expect(postData).toHaveProperty('exp_filter', `"fid_point" IN ('1')`);
        await getPlotRequest.response();

        // inspect feature toolbar and dataviz, expect to find only one
        await expect(project.popupContent.locator("div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > lizmap-feature-toolbar .feature-toolbar")).toHaveCount(1)
        await expect(project.popupContent.locator("div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > div.lizdataviz")).toHaveCount(1)
        await expect(project.popupContent.locator("div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > div.lizdataviz")).toBeVisible()

        // click again on the same point and wait for GetFeatureInfo
        getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(355, 280);
        getFeatureInfo = await getFeatureInfoPromise;
        await getFeatureInfo.response();

        // Check that the GetPlot request is the same
        getPlot = project.waitForGetPlotRequest();
        getPlotRequest = await getPlot;
        await expect(getPlotRequest.headers()).toHaveProperty('content-type', 'application/json');
        postData = getPlotRequest.postDataJSON();
        await expect(postData).toHaveProperty('request', 'getPlot');
        await expect(postData).toHaveProperty('plot_id', 0);
        await expect(postData).toHaveProperty('exp_filter', `"fid_point" IN ('1')`);
        await getPlotRequest.response();

        // inspect feature toolbar and dataviz, expect to find only one
        await expect(project.popupContent.locator("div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > lizmap-feature-toolbar .feature-toolbar")).toHaveCount(1)
        await expect(project.popupContent.locator("div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > div.lizdataviz")).toHaveCount(1)
        await expect(project.popupContent.locator("div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > div.lizdataviz")).toBeVisible()

        // click on another point and wait for GetFeatureInfo
        getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(410, 216);
        getFeatureInfo = await getFeatureInfoPromise;
        await getFeatureInfo.response();

        // Check that the GetPlot request is an other one
        getPlot = project.waitForGetPlotRequest();
        getPlotRequest = await getPlot;
        await expect(getPlotRequest.headers()).toHaveProperty('content-type', 'application/json');
        postData = getPlotRequest.postDataJSON();
        await expect(postData).toHaveProperty('request', 'getPlot');
        await expect(postData).toHaveProperty('plot_id', 0);
        await expect(postData).toHaveProperty('exp_filter', `"fid_point" IN ('2')`);
        await getPlotRequest.response();

        // inspect feature toolbar and dataviz, expect to find only one
        await expect(project.popupContent.locator("div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > lizmap-feature-toolbar .feature-toolbar")).toHaveCount(1)
        await expect(project.popupContent.locator("div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > div.lizdataviz")).toHaveCount(1)
        await expect(project.popupContent.locator("div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > div.lizdataviz")).toBeVisible()

        // click where there is a point without plot and wait for GetFeatureInfo
        getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(410, 300);
        getFeatureInfo = await getFeatureInfoPromise;
        await getFeatureInfo.response();

        // Check that the GetPlot request is an other one
        getPlot = project.waitForGetPlotRequest();
        getPlotRequest = await getPlot;
        await expect(getPlotRequest.headers()).toHaveProperty('content-type', 'application/json');
        postData = getPlotRequest.postDataJSON();
        await expect(postData).toHaveProperty('request', 'getPlot');
        await expect(postData).toHaveProperty('plot_id', 0);
        await expect(postData).toHaveProperty('exp_filter', `"fid_point" IN ('3')`);
        await getPlotRequest.response();

        // inspect feature toolbar and dataviz, expect to find one feature toolbar and no dataviz
        await expect(project.popupContent.locator("div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > lizmap-feature-toolbar .feature-toolbar")).toHaveCount(1)
        await expect(project.popupContent.locator("div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > div.lizdataviz")).toHaveCount(1)
        await expect(project.popupContent.locator("div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > div.lizdataviz")).not.toBeVisible()

        // reopen previous popup and wait for GetFeatureInfo
        getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(410, 216);
        getFeatureInfo = await getFeatureInfoPromise;
        await getFeatureInfo.response();

        // Check that the GetPlot request is the same as the last one
        getPlot = project.waitForGetPlotRequest();
        getPlotRequest = await getPlot;
        await expect(getPlotRequest.headers()).toHaveProperty('content-type', 'application/json');
        postData = getPlotRequest.postDataJSON();
        await expect(postData).toHaveProperty('request', 'getPlot');
        await expect(postData).toHaveProperty('plot_id', 0);
        await expect(postData).toHaveProperty('exp_filter', `"fid_point" IN ('2')`);
        await getPlotRequest.response();

        // inspect feature toolbar and dataviz, expect to find only one
        await expect(project.popupContent.locator("div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > lizmap-feature-toolbar .feature-toolbar")).toHaveCount(1)
        await expect(project.popupContent.locator("div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > div.lizdataviz")).toHaveCount(1)
        await expect(project.popupContent.locator("div.lizmapPopupSingleFeature > div.lizmapPopupDiv > div.lizdataviz")).toBeVisible()

    })
})

test.describe('Style parameter in GetFeatureInfo request', () => {
    test.beforeEach(async ({ page }) => {
        // the get_feature_info_style project has one layer "natural_areas" configured with two styles: default and ids
        //
        // "default" style: shows all the 3 features of the natural_area layer, it has QGIS Html Maptip enabled
        // "ids" style: shows only 2 of the 3 features of the natural_area layer, drag & drop tooltip enabled. the layer with id = 3 is not show

        // QGIS project is saved with the "ids" style enabled on the layer natural_areas
        // Lizmap init the map with the first style found in the styles's list sorted alphabetically, in this case "default"


        const url = '/index.php/view/map/?repository=testsrepository&project=get_feature_info_style';
        await gotoMap(url, page);
    })
    test('Click on the map to show the popup', async ({ page }) => {
        await page.locator("#dock-close").click();

        await page.waitForTimeout(300);


        // get the popup of the feature with id = 3. The STYLE property (STYLE=default) should be passed in the GetFeatureInfo request.
        // Otherwise, the popup would not be shown because QGIS Server query the layer natural_areas with the "ids" style

        let getPopup = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('STYLE=default') === true);

        await page.locator('#newOlMap').click({
            position: {
                x: 501,
                y: 488
            }
        });

        await getPopup;

        const mainPopup = page.locator("#popupcontent div.lizmapPopupContent div.lizmapPopupSingleFeature")
        await expect(mainPopup).toHaveAttribute("data-layer-id", "natural_areas_d4a1a538_3bff_4998_a186_38237507ac1e")
        await expect(mainPopup).toHaveAttribute("data-feature-id")

        // inspect feature toolbar, expect to find only one
        const popup = page.locator("#popupcontent > div.menu-content > div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv div.container.popup_lizmap_dd")
        await expect(popup).toHaveCount(1)
        await expect(popup.locator(".before-tabs div.field")).toHaveCount(2);
        await expect(popup.locator("#test-custom-tooltip")).toHaveText("Custom tooltip");

        await expect(popup.locator(".before-tabs div.field").nth(0)).toHaveText("3");
        await expect(popup.locator(".before-tabs div.field").nth(1)).toHaveText("Étang Saint Anne");


        // change the style of the layer
        await page.locator("#button-switcher").click()
        await page.getByTestId('natural_areas').hover();
        await page.getByTestId('natural_areas').locator('i').nth(1).click();
        await page.locator('#sub-dock').getByRole('combobox').selectOption("ids")

        // wait for the map
        await page.waitForTimeout(1000)

        let getPopupIds = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('STYLE=ids') === true);
        // click again on the previous point
        await page.locator('#newOlMap').click({
            position: {
                x: 501,
                y: 488
            }
        });

        await getPopupIds;

        // the popup should be empty
        const popupIds = page.locator("#popupcontent > div.menu-content > div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv div.container.popup_lizmap_dd")

        await expect(popupIds).toHaveCount(0);

        // clean the map
        await page.locator("#hide-sub-dock").click();

        let getPopupIdsFeature = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('STYLE=ids') === true);
        // click on a feature to get the popup (it should fallback to the default lizmap popup)
        await page.locator('#newOlMap').click({
            position: {
                x: 404,
                y: 165
            }
        });

        await getPopupIdsFeature;

        await page.waitForTimeout(300)

        const popupIdsFeat = page.locator("#popupcontent div.lizmapPopupSingleFeature")
        await expect(popupIdsFeat).toHaveCount(1);

        // expect to have the lizmap default popup ("automatic")
        await expect(popupIdsFeat.locator("table tbody tr")).toHaveCount(2);
        await expect(popupIdsFeat.locator("table tbody tr").nth(0).locator("td")).toHaveText("1");
        await expect(popupIdsFeat.locator("table tbody tr").nth(1).locator("td")).toHaveText("Étang du Galabert");
    })

    test('Legend On/Off', async ({ page }) => {
        let getFeatureInfoPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeatureInfo') === true);
        // click on a feature to get the popup (it should fallback to the default lizmap popup)
        await page.locator('#newOlMap').click({
            position: {
                x: 404,
                y: 165
            }
        });
        let getFeatureInfoRequest = await getFeatureInfoPromise
        expect(getFeatureInfoRequest.postData()).not.toMatch(/LEGEND_ON/);
        expect(getFeatureInfoRequest.postData()).not.toMatch(/LEGEND_OFF/);
        let getFeatureInfoResponse = await getFeatureInfoRequest.response()
        expect(getFeatureInfoResponse?.headers()['content-type']).toContain('text/html');
        expect(getFeatureInfoResponse?.headers()['content-length']).toBe('1875');

        // inspect feature toolbar, expect to find only one
        const popup = page.locator("#popupcontent > div.menu-content > div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv div.container.popup_lizmap_dd")
        await expect(popup).toHaveCount(1)
        await expect(popup.locator(".before-tabs div.field")).toHaveCount(2);
        await expect(popup.locator("#test-custom-tooltip")).toHaveText("Custom tooltip");

        await expect(popup.locator(".before-tabs div.field").nth(0)).toHaveText("1");
        await expect(popup.locator(".before-tabs div.field").nth(1)).toHaveText("Étang du Galabert");

        // Uncheck
        await page.locator('#button-switcher').click();
        await page.getByTestId('natural_areas').locator('div').first().click();
        await page.getByLabel('id1').uncheck();

        getFeatureInfoPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeatureInfo') === true);
        // click on a feature to get the popup (it should fallback to the default lizmap popup)
        await page.locator('#newOlMap').click({
            position: {
                x: 404,
                y: 165
            }
        });
        getFeatureInfoRequest = await getFeatureInfoPromise
        expect(getFeatureInfoRequest.postData()).toMatch(/LEGEND_ON=natural_areas/);
        expect(getFeatureInfoRequest.postData()).toMatch(/LEGEND_OFF=natural_areas%3A%7B421de3e3-5286-42fa-b3ff-aff35c4078a0%7D/);
        // Github Action CI failed
        // Do not test QGIS Server or lizmap server plugin
        // getFeatureInfoResponse = await getFeatureInfoRequest.response()
        // expect(getFeatureInfoResponse?.headers()['content-type']).toContain('text/html');
        // expect(getFeatureInfoResponse?.headers()['content-length']).toBe('0');
        //
        // await expect(page.locator('.lizmapPopupTitle')).toHaveCount(0);
        // await expect(page.locator('.lizmapPopupContent h4')).toHaveText('No object has been found at this location.');
    })
})

test.describe('Raster identify',
    {
        tag: ['@readonly', '@lizmap.com'],
    },() => {

        test('Raster identify check with data-attributes', async ({ page }) => {
            const project = new ProjectPage(page, 'rasters');
            await project.open();

            let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();

            await project.clickOnMap(510, 415);

            await getFeatureInfoPromise;
            const popup = project.popupContent.locator("div.lizmapPopupContent div.lizmapPopupSingleFeature");
            await expect(popup).toHaveAttribute("data-layer-id", "local_raster_layer_c4c2ec5e_7567_476b_bf78_2b7c64f32615");
            await expect(popup).not.toHaveAttribute("data-feature-id");
        });
    });

test.describe('Popup @readonly', () => {

    test('click on the shape to show the popup', async ({ page }) => {
        const project = new ProjectPage(page, 'popup');
        await project.open();

        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();

        // When clicking on triangle feature a popup with two tabs must appear
        await project.clickOnMap(510, 415);
        await getFeatureInfoPromise;
        await expect(project.map.locator('#liz_layer_popup')).toBeVisible();
        await expect(project.map.locator('#liz_layer_popup_contentDiv > div > div > div > ul > li.active > a')).toBeVisible();
        await expect(project.map.locator('#liz_layer_popup_contentDiv > div > div > div > ul > li:nth-child(2) > a')).toBeVisible();

        // Assert media links are replaced by the lizmap media service
        const mediaLink = 'http://localhost:8130/index.php/view/media/getMedia?repository=testsrepository&project=popup&path=media%2Fimages%2Fmontpellier.qgs.webp';
        await expect(page.locator('#popup_dd_1_tab1 a')).toHaveAttribute('href', mediaLink);
        await expect(page.locator('#popup_dd_1_tab1 a img')).toHaveAttribute('src', mediaLink);
    });

    test('changes popup tab', async ({ page }) => {
        const project = new ProjectPage(page, 'popup');
        await project.open();

        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();

        // When clicking `tab2`, `tab2_value` must appear
        await project.clickOnMap(510, 490);
        await getFeatureInfoPromise;
        await page.getByRole('link', { name: 'tab2' }).click({ force: true });
        await expect(page.locator('#popup_dd_1_tab2')).toHaveClass(/active/);
    });

    test('displays children popups', async ({ page }) => {
        const project = new ProjectPage(page, 'popup');
        await project.open();

        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();

        await project.clickOnMap(510, 415);
        await getFeatureInfoPromise;
        await expect(project.map.locator('#liz_layer_popup .lizmapPopupChildren .lizmapPopupSingleFeature')).toHaveCount(2);
    });

    test('displays children in lizmap-features-table', async ({ page }) => {
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.layers.dnd_popup['children_lizmap_features_table'] = true;
            json.layers.dnd_popup['popupDisplayChildren'] = 'False';
            await route.fulfill({ response, json });
        });

        const project = new ProjectPage(page, 'popup');
        await project.open();

        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();

        await project.clickOnMap(510, 415);
        await getFeatureInfoPromise;
        await expect(await project.map.locator('#liz_layer_popup lizmap-features-table')).toHaveCount(1);
        const lizmapFeaturesTable = await project.map.locator('#liz_layer_popup lizmap-features-table');
        await expect(lizmapFeaturesTable).toHaveAttribute('layerId');
        await expect(lizmapFeaturesTable).toHaveAttribute('layerTitle', 'children_layer');
        await expect(lizmapFeaturesTable).toHaveAttribute('uniqueField', 'id');
        await expect(lizmapFeaturesTable).toHaveAttribute('expressionFilter', 'parent_id = \'1\'');
        await page.unroute('**/service/getProjectConfig*');
    });

    test('getFeatureInfo request should contain a FILTERTOKEN parameter when the layer is filtered', async ({ page }) => {
        const project = new ProjectPage(page, 'popup');
        await project.open();
        await page.locator('#button-filter').click();

        // Select a feature to filter and wait for GetMap request with FILTERTOKEN parameter
        let getMapRequestPromise = page.waitForRequest(/FILTERTOKEN/);
        await page.locator('#liz-filter-field-test').selectOption('1');
        await getMapRequestPromise;

        let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest();

        await project.clickOnMap(486, 136);
        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        expect(getFeatureInfoRequest.postData()).toMatch(/FILTERTOKEN/);
    });

    test('With selection tool', async ({ page }) => {
        const project = new ProjectPage(page, 'popup');
        await project.open();
        // Open Selection tool
        await page.locator('#button-selectiontool').click();

        // Popup still available
        let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(250, 415);
        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        await getFeatureInfoRequest.response();

        await expect(project.map.locator('#liz_layer_popup')).toBeVisible();
        await page.getByRole('link', { name: '✖' }).click();

        // Activate draw
        await page.locator('#selectiontool .digitizing-buttons > button.dropdown-toggle:nth-child(2)').click();
        await page.locator('#selectiontool .selectiontool .digitizing-point > svg > use').click();

        // Popup disable but selection done
        let getSelectionTokenRequestPromise = page.waitForRequest(
            request => request.method() === 'POST' &&
            request.postData()?.includes('GETSELECTIONTOKEN') === true
        );
        await project.clickOnMap(510, 415);
        let getSelectionTokenRequest = await getSelectionTokenRequestPromise;
        await getSelectionTokenRequest.response();
        await expect(project.map.locator('#liz_layer_popup')).not.toBeVisible();

        // Deactivate draw
        await page.locator('#selectiontool .digitizing-buttons > button').first().click();

        // Popup available again
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(250, 415);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        await getFeatureInfoRequest.response();
        await expect(project.map.locator('#liz_layer_popup')).toBeVisible();
        await page.getByRole('link', { name: '✖' }).click();
    });

    test('With draw', async ({ page }) => {
        const project = new ProjectPage(page, 'popup');
        await project.open();

        // Open draw
        await page.locator('#button-draw').click();

        // Popup still available
        let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(250, 415);
        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        await getFeatureInfoRequest.response();

        await expect(project.map.locator('#liz_layer_popup')).toBeVisible();
        await page.getByRole('link', { name: '✖' }).click();

        // Activate draw
        await page.locator('#draw .digitizing-buttons > button.dropdown-toggle:nth-child(2)').click();
        await page.locator('#draw .draw .digitizing-point > svg').click();

        // Popup disable
        await project.clickOnMap(510, 415);
        await page.waitForTimeout(500);
        await expect(project.map.locator('#liz_layer_popup')).not.toBeVisible();

        // Deactivate draw
        await page.locator('#draw .draw > .menu-content > lizmap-digitizing > .digitizing > .digitizing-buttons > button').first().click();

        // Popup available again
        getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(250, 415);
        getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        await getFeatureInfoRequest.response();

        await expect(project.map.locator('#liz_layer_popup')).toBeVisible();
        await page.getByRole('link', { name: '✖' }).click();

        // Edition
        await page.locator('.draw > .menu-content > lizmap-digitizing > .digitizing > .digitizing-edit').click();
        await page.waitForTimeout(500);

        // Popup disable
        await project.clickOnMap(510, 415);
        await page.waitForTimeout(500); // wait to be sure, no request sent
        await expect(project.map.locator('#liz_layer_popup')).not.toBeVisible();

        // Erasing
        await page.locator('.draw > .menu-content > lizmap-digitizing > .digitizing > .digitizing-erase').click();
        await page.waitForTimeout(500);
        page.on('dialog', dialog => dialog.accept());

        // Popup disable
        await project.clickOnMap(510, 415);
        await page.waitForTimeout(500); // wait to be sure, no request sent
        await expect(project.map.locator('#liz_layer_popup')).not.toBeVisible();
    });
});

test.describe('Popup Geometry @readonly', () => {

    test('should display zoom and center buttons if "Add geometry to feature response" is checked', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();
        // Click on a point
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(436, 290);
        let getFeatureInfoRequest = await getFeatureInfoPromise;
        await getFeatureInfoRequest.response();

        const featureToolbar = await project.popupContent.locator('lizmap-feature-toolbar[value^="parent_layer_"][value$=".1"]');
        await expect(await featureToolbar.locator('button.feature-zoom')).toBeVisible();
        await expect(await featureToolbar.locator('button.feature-center')).toBeVisible();
    });

    test('Show/hide the geometry on open/close dock', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();

        // Get default buffer with one point
        let buffer = await page.screenshot({clip:{x:425, y:325, width:100, height:100}});
        const defaultByteLength = buffer.byteLength;
        await expect(defaultByteLength).toBeGreaterThan(800); // 851 or 906
        await expect(defaultByteLength).toBeLessThan(1000) // 851 or 906

        // Click on a point
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(436, 290);
        let getFeatureInfoRequest = await getFeatureInfoPromise;
        await getFeatureInfoRequest.response();

        // The geometry is displayed
        buffer = await page.screenshot({clip:{x:425, y:325, width:100, height:100}});
        await expect(buffer.byteLength).not.toBe(defaultByteLength);
        await expect(buffer.byteLength).toBeGreaterThan(defaultByteLength);

        // Close popup
        page.locator('#button-popupcontent').click();
        await page.waitForTimeout(50);

        buffer = await page.screenshot({clip:{x:425, y:325, width:100, height:100}});
        await expect(buffer.byteLength).toBe(defaultByteLength);

        // Open popup
        page.locator('#button-popupcontent').click();
        await page.waitForTimeout(50);

        buffer = await page.screenshot({clip:{x:425, y:325, width:100, height:100}});
        await expect(buffer.byteLength).not.toBe(defaultByteLength);
        await expect(buffer.byteLength).toBeGreaterThan(defaultByteLength);
    });

    test('Show/hide the geometry on click on the map', async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();

        // Get default buffer with one point
        let buffer = await page.screenshot({clip:{x:425, y:325, width:100, height:100}});
        const defaultByteLength = buffer.byteLength;
        await expect(defaultByteLength).toBeGreaterThan(800); // 851 or 906
        await expect(defaultByteLength).toBeLessThan(1000) // 851 or 906

        // Click on a point
        let getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(436, 290);
        let getFeatureInfoRequest = await getFeatureInfoPromise;
        await getFeatureInfoRequest.response();

        // The geometry is displayed
        buffer = await page.screenshot({clip:{x:425, y:325, width:100, height:100}});
        await expect(buffer.byteLength).not.toBe(defaultByteLength);
        await expect(buffer.byteLength).toBeGreaterThan(defaultByteLength);

        // Not click on a point
        getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await project.clickOnMap(536, 290);
        getFeatureInfoRequest = await getFeatureInfoPromise;
        await getFeatureInfoRequest.response();
        await page.waitForTimeout(500); // wait to be sure

        // Nothing
        buffer = await page.screenshot({clip:{x:425, y:325, width:100, height:100}});
        await expect(buffer.byteLength).toBe(defaultByteLength);
    });
});

test.describe('Children in popup', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=feature_toolbar';
        await gotoMap(url, page);
    });

    test('click on the feature to show the popup and his children', async ({ page }) => {
        // When clicking on triangle feature a popup with two tabs must appear
        await page.locator('#newOlMap').click({
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
        await page.waitForRequest(/GetMap/);
        await page.locator('#newOlMap').click({
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

test.describe('Popup config mocked with "minidock" option', () => {
    test('Minidock is displayed with popup content', async ({ page }) => {
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['popupLocation'] = 'minidock';
            await route.fulfill({ response, json });
        });

        const url = '/index.php/view/map/?repository=testsrepository&project=popup';
        await gotoMap(url, page)

        // When clicking on a triangle feature a popup must appear
        await page.locator('#newOlMap').click({
            position: {
                x: 436,
                y: 290
            }
        });

        await expect(page.locator('#mini-dock-content .lizmapPopupDiv')).toBeVisible();
    });
});

test.describe('Popup max features', () => {
    test('popupMaxFeatures param is respected', async ({ page }) => {
        const url = '/index.php/view/map?repository=testsrepository&project=popup#-5.390390,35.762412,13.763671,50.710265|townhalls_pg|d%C3%A9faut|1';
        await gotoMap(url, page);

        await page.locator('#newOlMap').click({
            position: {
                x: 435,
                y: 292
            }
        });

        await expect(page.locator('.lizmapPopupSingleFeature')).toHaveCount(15);
    });
});

test.describe('Drag and drop design with relations', () => {
    test('Children are placed in the correct div container', async ({ page }) => {
        const url = '/index.php/view/map?repository=testsrepository&project=children_in_relation_div';
        await gotoMap(url, page);

        let getFeatureInfoRequestBirdsPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeatureInfo') === true && request.postData()?.includes('birds') === true);
        let getFeatureInfoRequestSpotsPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeatureInfo') === true && request.postData()?.includes('birds_spot') === true);
        await page.locator('#newOlMap').click({
            position: {
                x: 358,
                y: 248
            }
        });

        await getFeatureInfoRequestBirdsPromise;
        await getFeatureInfoRequestSpotsPromise;

        await expect(page.locator('div.popup_lizmap_dd_relation[id="popup_relation_birds_area_natural_area_id_natural_ar_id"] > div.lizmapPopupChildren.birds')).toHaveCount(1);
        await expect(page.locator('div.popup_lizmap_dd_relation[id="popup_relation_birds_spot_area_id_natural_ar_id"] > div.lizmapPopupChildren.birds_spots')).toHaveCount(1);

    });
});
