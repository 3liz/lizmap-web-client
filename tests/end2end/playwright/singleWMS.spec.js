// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Single WMS layer', () => {

    test('Startup single image loading', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=single_wms_image';

        // 'single_wms_polygons', 'single_wms_tiled_baselayer' and OpenStreetmaps layers should be exluded from single wms layer
        const getMapPromise = page.waitForRequest(request =>
            request.url().includes('GetMap') &&
            request.method() === 'GET' &&
            // check format
            request.url().includes('FORMAT=image%2Fpng') &&
            // check service
            request.url().includes('SERVICE=WMS') &&
            // check styles
            request.url().includes('STYLES=default%2Cdefault%2Cdefault%2Cdefault%2Cdefault%2C') &&
            // check layers
            request.url().includes('LAYERS=single_wms_baselayer%2Csingle_wms_lines%2Csingle_wms_points%2Csingle_wms_points_group%2Csingle_wms_lines_group%2CGroupAsLayer')
        );

        const getTiledSingleWMSPolygon = page.waitForRequest(request =>
            request.url().includes('GetTile') &&
            request.method() === 'GET' &&
            // check layer name
            request.url().includes('layer=single_wms_polygons') &&
            // check styles
            request.url().includes('style=default') &&
            // check service
            request.url().includes('Service=WMTS')

        )

        await page.goto(url);
        // just check if the application fires these requests and their response code
        const allResponses = await Promise.all([getMapPromise, getTiledSingleWMSPolygon])

        let getMapRespInit = allResponses[0]
        let getMapResp = await getMapRespInit.response()
        let getTileRespInit = allResponses[1]
        let getTileResp = await getTileRespInit.response()

        expect((getMapResp?.status())).toBe(200);
        expect((getTileResp?.status())).toBe(200);

    })

    test('Check opacity', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=single_wms_image';

        await gotoMap(url, page);

        // click on layer tree elements to check opacity
        const lizmapTreeView = page.locator('lizmap-treeview > ul  li');

        const ids = ['GroupAsLayer', 'single_wms_lines_group', 'single_wms_points_group', 'single_wms_points', 'single_wms_lines', 'single_wms_polygons'];

        for (const info of await lizmapTreeView.all()) {
            let className = await info.getAttribute("data-testid");
            if (ids.indexOf(className || '') > -1) {
                await info.locator(".node").nth(0).hover();
                let icon = await info.locator(".icon-info-sign");
                await icon.hover();
                await icon.click();
                let subDock = page.locator("#sub-dock");
                if (className == 'single_wms_polygons') {
                    // opacity is enabled only in the tiled layer
                    await expect(subDock.locator(".opacityLayer")).toHaveCount(1);
                } else {
                    await expect(subDock.locator(".opacityLayer")).toHaveCount(0);
                }

            }
        }

    })

    test('Switch layers', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=single_wms_image';

        // turn off single_wms_lines layer
        const getMapNoPointsPromise = page.waitForRequest(request =>
            request.url().includes('GetMap') &&
            request.method() === 'GET' &&
            // check format
            request.url().includes('FORMAT=image%2Fpng') &&
            // check service
            request.url().includes('SERVICE=WMS') &&
            // check styles
            request.url().includes('STYLES=default%2Cdefault%2Cdefault%2Cdefault%2C') &&
            // check layers
            request.url().includes('LAYERS=single_wms_baselayer%2Csingle_wms_points%2Csingle_wms_points_group%2Csingle_wms_lines_group%2CGroupAsLayer')
        );

        await gotoMap(url, page);

        await page.getByTestId('single_wms_lines').locator('> div input').click();
        const noPointsReq = await getMapNoPointsPromise;

        const getMapNoPointsPromiseResp = await noPointsReq.response();
        expect(getMapNoPointsPromiseResp?.status()).toBe(200)

        await page.waitForTimeout(400);

        // switch layer in a group
        const getMapNoGroupLinesPromise = page.waitForRequest(request =>
            request.url().includes('GetMap') &&
            request.method() === 'GET' &&
            // check format
            request.url().includes('FORMAT=image%2Fpng') &&
            // check service
            request.url().includes('SERVICE=WMS') &&
            // check styles
            request.url().includes('STYLES=default%2Cdefault%2Cdefault%2C') &&
            // check layers
            request.url().includes('LAYERS=single_wms_baselayer%2Csingle_wms_points%2Csingle_wms_points_group%2CGroupAsLayer')
        );

        await page.getByTestId('single_wms_lines_group').locator('> div input').click();

        const noGroupLinesReq = await getMapNoGroupLinesPromise;

        const getMapNoGroupLinesPromiseResp = await noGroupLinesReq.response();
        expect(getMapNoGroupLinesPromiseResp?.status()).toBe(200)

        await page.waitForTimeout(400);

        // switch Group as layer
        const getMapNoGroupAsLayerPromise = page.waitForRequest(request =>
            request.url().includes('GetMap') &&
            request.method() === 'GET' &&
            // check format
            request.url().includes('FORMAT=image%2Fpng') &&
            // check service
            request.url().includes('SERVICE=WMS') &&
            // check styles
            request.url().includes('STYLES=default%2Cdefault%2Cdefault') &&
            // check layers
            request.url().includes('LAYERS=single_wms_baselayer%2Csingle_wms_points%2Csingle_wms_points_group')
        );

        await page.getByTestId('GroupAsLayer').locator('> div input').click();

        const noGroupasLayersReq = await getMapNoGroupAsLayerPromise;

        const getMapNoGroupAsLayerPromiseResp = await noGroupasLayersReq.response();
        expect(getMapNoGroupAsLayerPromiseResp?.status()).toBe(200)

        //enable all switched off layer
        // it sholud do only one request, due to the setTimeout on the singleWMSLayer logic
        let reqCount = 0;
        page.on('request', request => {
            const url = request.url();
            if (url.includes('GetMap')) {

                expect(reqCount).toBe(0)
                reqCount++;

                const searchParam = new URLSearchParams(url);
                expect(searchParam.get('FORMAT') == 'image%2Fpng').toBeTruthy();
                expect(searchParam.get('SERVICE') == 'WMS').toBeTruthy();
                expect(searchParam.get('STYLES') == 'default%2Cdefault%2Cdefault%2Cdefault%2Cdefault%2C').toBeTruthy();
                expect(searchParam.get('LAYERS') == 'single_wms_baselayer%2Csingle_wms_lines%2Csingle_wms_points%2Csingle_wms_points_group%2Csingle_wms_lines_group%2CGroupAsLayer').toBeTruthy();

            }
        })

        await page.getByTestId('single_wms_lines').locator('> div input').click();
        await page.waitForTimeout(50);
        await page.getByTestId('single_wms_lines_group').locator('> div input').click();
        await page.waitForTimeout(50);
        await page.getByTestId('GroupAsLayer').locator('> div input').click();

    })

    test('Change layer style', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=single_wms_image';

        const getMapChangeStylePromise = page.waitForRequest(request =>
            request.url().includes('GetMap') &&
            request.method() === 'GET' &&
            // check format
            request.url().includes('FORMAT=image%2Fpng') &&
            // check service
            request.url().includes('SERVICE=WMS') &&
            // check styles
            request.url().includes('STYLES=default%2Cdefault%2Cwhite_dots%2Cdefault%2Cdefault%2C') &&
            // check layers
            request.url().includes('LAYERS=single_wms_baselayer%2Csingle_wms_lines%2Csingle_wms_points%2Csingle_wms_points_group%2Csingle_wms_lines_group%2CGroupAsLayer')
        );

        await gotoMap(url, page);

        // disable single_wms_lines
        const points = page.getByTestId('single_wms_points')

        await points.locator(".node").nth(0).hover();
        let icon = points.locator(".icon-info-sign");

        await icon.click();
        let styleLayer = page.locator("#sub-dock").locator("select.styleLayer");

        await styleLayer.selectOption("white_dots");

        const changeStyle = await getMapChangeStylePromise;

        const getMapChangeStylePromiseResp = await changeStyle.response();
        expect(getMapChangeStylePromiseResp?.status()).toBe(200)

    })

    test('Apply filters on layer, then change layer style', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=single_wms_image';
        await gotoMap(url, page);

        let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeatureInfo') === true);

        await page.locator('#newOlMap').click({
            position: {
                x: 379,
                y: 288
            }
        });
        await getFeatureInfoRequestPromise;

        // render popup
        await page.waitForTimeout(500);
        await expect(page.locator('.lizmapPopupContent > .lizmapPopupSingleFeature .lizmapPopupTitle').first()).toHaveText("Points");
        await expect(page.locator(".lizmapPopupContent .lizmapPopupDiv table tbody tr")).toHaveCount(2);
        await expect(page.locator(".lizmapPopupContent .lizmapPopupDiv table tbody tr").nth(0).locator("td")).toHaveText("1");
        await expect(page.locator(".lizmapPopupContent .lizmapPopupDiv table tbody tr").nth(1).locator("td")).toHaveText("Point_1");

        // click on filter button
        await expect(page.locator(".lizmapPopupContent .lizmapPopupDiv lizmap-feature-toolbar button.feature-filter")).toBeVisible();

        const getFilterTokenPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GETFILTERTOKEN') === true);

        await page.locator(".lizmapPopupContent .lizmapPopupDiv lizmap-feature-toolbar button.feature-filter").click();

        const reqToken = await getFilterTokenPromise;

        const reqTokenResp = await reqToken.response();
        const reqJson = await reqTokenResp?.text() || '{}';

        const token = JSON.parse(reqJson)?.token;
        expect(token).not.toBeNull();

        const getMFilteredMapPromise = page.waitForRequest(request =>
            request.url().includes('GetMap') &&
            request.method() === 'GET' &&
            // check format
            request.url().includes('FORMAT=image%2Fpng') &&
            // check service
            request.url().includes('SERVICE=WMS') &&
            // check for FILTERTOKEN PARAMETER
            request.url().includes('FILTERTOKEN=' + token) &&
            // check styles
            request.url().includes('STYLES=default%2Cdefault%2Cdefault%2Cdefault%2Cdefault%2C') &&
            // check layers
            request.url().includes('LAYERS=single_wms_baselayer%2Csingle_wms_lines%2Csingle_wms_points%2Csingle_wms_points_group%2Csingle_wms_lines_group%2CGroupAsLayer')
        );

        const filteredMap = await getMFilteredMapPromise;
        const getMFilteredMapPromiseResp = await filteredMap.response();
        expect(getMFilteredMapPromiseResp?.status()).toBe(200)

        // change layer style while filtering
        const getMapChangeStylePromise = page.waitForRequest(request =>
            request.url().includes('GetMap') &&
            request.method() === 'GET' &&
            // check format
            request.url().includes('FORMAT=image%2Fpng') &&
            // check service
            request.url().includes('SERVICE=WMS') &&
            // check for FILTERTOKEN PARAMETER
            request.url().includes('FILTERTOKEN=' + token) &&
            // check styles
            request.url().includes('STYLES=default%2Cdefault%2Cwhite_dots%2Cdefault%2Cdefault%2C') &&
            // check layers
            request.url().includes('LAYERS=single_wms_baselayer%2Csingle_wms_lines%2Csingle_wms_points%2Csingle_wms_points_group%2Csingle_wms_lines_group%2CGroupAsLayer')
        );

        // change the style
        const points = page.getByTestId('single_wms_points')
        await page.locator("#button-switcher").click();
        await points.locator(".node").nth(0).hover();
        let icon = await points.locator(".icon-info-sign");

        await icon.click();
        let styleLayer = page.locator("#sub-dock").locator("select.styleLayer");

        await styleLayer.selectOption("white_dots");

        const changeStyle = await getMapChangeStylePromise;

        const getMapChangeStylePromiseResp = await changeStyle.response();
        expect(getMapChangeStylePromiseResp?.status()).toBe(200)

    })

    test('Filter on legend, then apply filter', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=single_wms_image';
        await gotoMap(url, page);

        const getLegendFilterPromise = page.waitForRequest(request =>
            request.url().includes('GetMap') &&
            request.method() === 'GET' &&
            // check format
            request.url().includes('FORMAT=image%2Fpng') &&
            // check service
            request.url().includes('SERVICE=WMS') &&
            // check styles
            request.url().includes('STYLES=default%2Cdefault%2Cdefault%2Cdefault%2Cdefault%2C') &&
            //check LEGEND_ON parameter
            request.url().includes('LEGEND_ON=single_wms_lines%3A1%2C2%2C3%2C4') &&
            //check LEGEND_ON parameter
            request.url().includes('LEGEND_OFF=single_wms_lines%3A0') &&
            // check layers
            request.url().includes('LAYERS=single_wms_baselayer%2Csingle_wms_lines%2Csingle_wms_points%2Csingle_wms_points_group%2Csingle_wms_lines_group%2CGroupAsLayer')
        );

        const lines = page.getByTestId('single_wms_lines')
        await lines.locator(".expandable").click();

        await lines.locator("ul.symbols > li").nth(0).locator("input").click();

        const legendFilters = await getLegendFilterPromise;
        const getLegendFilterPromiseResp = await legendFilters.response();
        expect(getLegendFilterPromiseResp?.status()).toBe(200)

        // filter
        let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeatureInfo') === true);

        await page.locator('#newOlMap').click({
            position: {
                x: 460,
                y: 352
            }
        });

        await getFeatureInfoRequestPromise;
        await page.waitForTimeout(500);

        await expect(page.locator('.lizmapPopupContent > .lizmapPopupSingleFeature .lizmapPopupTitle').first()).toHaveText("Lines");
        await expect(page.locator(".lizmapPopupContent .lizmapPopupDiv table tbody tr")).toHaveCount(2);
        await expect(page.locator(".lizmapPopupContent .lizmapPopupDiv table tbody tr").nth(0).locator("td")).toHaveText("3");
        await expect(page.locator(".lizmapPopupContent .lizmapPopupDiv table tbody tr").nth(1).locator("td")).toHaveText("Line_3");

        const getFilterTokenPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GETFILTERTOKEN') === true);

        await expect(page.locator(".lizmapPopupContent .lizmapPopupDiv lizmap-feature-toolbar button.feature-filter")).toBeVisible();

        await page.locator(".lizmapPopupContent .lizmapPopupDiv lizmap-feature-toolbar button.feature-filter").click();

        const reqToken = await getFilterTokenPromise;

        const reqTokenResp = await reqToken.response();
        const reqJson = await reqTokenResp?.text() || '{}';

        const token = JSON.parse(reqJson)?.token;
        expect(token).not.toBeNull();


        const getLegendFilterAndFilterPromise = page.waitForRequest(request =>
            request.url().includes('GetMap') &&
            request.method() === 'GET' &&
            // check format
            request.url().includes('FORMAT=image%2Fpng') &&
            // check service
            request.url().includes('SERVICE=WMS') &&
            // check styles
            request.url().includes('STYLES=default%2Cdefault%2Cdefault%2Cdefault%2Cdefault%2C') &&
            // check for FILTERTOKEN PARAMETER
            request.url().includes('FILTERTOKEN=' + token) &&
            //check LEGEND_ON parameter
            request.url().includes('LEGEND_ON=single_wms_lines%3A1%2C2%2C3%2C4') &&
            //check LEGEND_ON parameter
            request.url().includes('LEGEND_OFF=single_wms_lines%3A0') &&
            // check layers
            request.url().includes('LAYERS=single_wms_baselayer%2Csingle_wms_lines%2Csingle_wms_points%2Csingle_wms_points_group%2Csingle_wms_lines_group%2CGroupAsLayer')
        );

        const filteredMap = await getLegendFilterAndFilterPromise;

        const getLegendFilterAndFilterPromiseResp = await filteredMap.response();
        expect(getLegendFilterAndFilterPromiseResp?.status()).toBe(200)
    })

    test('Switch baselayer', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=single_wms_image';
        await gotoMap(url, page);

        const switchBaseLayersReqPromise = page.waitForRequest(request =>
            request.url().includes('GetMap') &&
            request.method() === 'GET' &&
            // check format
            request.url().includes('FORMAT=image%2Fpng') &&
            // check service
            request.url().includes('SERVICE=WMS') &&
            // check styles
            request.url().includes('STYLES=default%2Cdefault%2Cdefault%2Cdefault%2C') &&
            // check layers
            request.url().includes('LAYERS=single_wms_lines%2Csingle_wms_points%2Csingle_wms_points_group%2Csingle_wms_lines_group%2CGroupAsLayer')
        );

        await page.locator("lizmap-base-layers select").selectOption("single_wms_tiled_baselayer")

        const switchBaseLayer = await switchBaseLayersReqPromise;

        const switchBaseLayersReqPromiseresp = await switchBaseLayer.response();
        expect(switchBaseLayersReqPromiseresp?.status()).toBe(200)

    })

    test('Edit a layer', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=single_wms_image';
        await gotoMap(url, page);

        await page.locator('#button-edition').click();
        await page.locator('a#edition-draw').click();

        await page.waitForTimeout(300);

        // edition id done on #map
        await page.locator('#map').click({
            position: {
                x: 532,
                y: 293
            }
        });

        page.locator("#jforms_view_edition input#jforms_view_edition_title").fill("Test insert");

        const reloadMapPromise = page.waitForRequest(request =>
            request.url().includes('GetMap') &&
            request.method() === 'GET' &&
            // check format
            request.url().includes('FORMAT=image%2Fpng') &&
            // check service
            request.url().includes('SERVICE=WMS') &&
            // check styles
            request.url().includes('STYLES=default%2Cdefault%2Cdefault%2Cdefault%2Cdefault%2C') &&
            // check layers
            request.url().includes('LAYERS=single_wms_baselayer%2Csingle_wms_lines%2Csingle_wms_points%2Csingle_wms_points_group%2Csingle_wms_lines_group%2CGroupAsLayer')
        );

        await page.locator("#jforms_view_edition #jforms_view_edition__submit_submit").click();
        const reloaded = await reloadMapPromise;

        const reloadReqPromise = await reloaded.response();
        expect(reloadReqPromise?.status()).toBe(200)

    })
})
