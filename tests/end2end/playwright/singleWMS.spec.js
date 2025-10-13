// @ts-check
import { test, expect } from '@playwright/test';
import { expectParametersToContain } from './globals';
import { ProjectPage } from "./pages/project";

test.describe('Single WMS layer', () => {

    test('Startup single image loading',
        {
            tag:['@readonly']
        }, async ({ page }) => {
            const project = new ProjectPage(page, 'single_wms_image');
            const requestMapPromise = project.waitForGetMapRequest();
            const requestTilePromise = project.waitForGetTileRequest();
            await project.open();

            const requestMap = await requestMapPromise;
            const expectedMapParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'STYLES':'default,default,default,default,default,',
                'LAYERS':'single_wms_baselayer,single_wms_lines,single_wms_points,single_wms_points_group,single_wms_lines_group,GroupAsLayer',
            }

            const requestTile = await requestTilePromise;
            const expectedTileParameters = {
                'Service': 'WMTS',
                'Version': '1.0.0',
                'Request': 'GetTile',
                'style':'default',
                'layer':'single_wms_polygons',
            }

            await expectParametersToContain('GetMap', requestMap.url(), expectedMapParameters);
            await expectParametersToContain('GetTile', requestTile.url(), expectedTileParameters);
            await requestMap.response();
            await requestTile.response();
        });

    test('Check opacity',
        {
            tag:['@readonly']
        }, async ({ page }) => {
            const project = new ProjectPage(page, 'single_wms_image');
            await project.open();

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
        });

    test('Switch layers',
        {
            tag:['@readonly']
        }, async ({ page }) => {
            const project = new ProjectPage(page, 'single_wms_image');
            await project.open();

            // turn off single_wms_lines layer
            await page.getByTestId('single_wms_lines').locator('> div input').click();
            const requestSwitchPromise = project.waitForGetMapRequest();
            const requestSwitch = await requestSwitchPromise;
            const expectedSwitchParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'STYLES':'default,default,default,default,',
                'LAYERS':'single_wms_baselayer,single_wms_points,single_wms_points_group,single_wms_lines_group,GroupAsLayer',
            }
            await expectParametersToContain('GetMap', requestSwitch.url(), expectedSwitchParameters);
            await requestSwitch.response();

            await page.waitForTimeout(400);

            // switch layer in a group
            await page.getByTestId('single_wms_lines_group').locator('> div input').click();
            const requestGroupPromise = project.waitForGetMapRequest();
            const requestGroup = await requestGroupPromise;
            const expectedGroupParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'STYLES':'default,default,default,',
                'LAYERS':'single_wms_baselayer,single_wms_points,single_wms_points_group,GroupAsLayer',
            }

            await expectParametersToContain('GetMap', requestGroup.url(), expectedGroupParameters);
            await requestGroup.response();

            await page.waitForTimeout(400);

            // switch Group as layer
            await page.getByTestId('GroupAsLayer').locator('> div input').click();
            const requestGroupAsLayerPromise = project.waitForGetMapRequest();
            const requestGroupAsLayer = await requestGroupAsLayerPromise;
            const expectedGroupAsLayerParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'STYLES':'default,default,default',
                'LAYERS':'single_wms_baselayer,single_wms_points,single_wms_points_group',
            }
            await expectParametersToContain('GetMap', requestGroupAsLayer.url(), expectedGroupAsLayerParameters);
            await requestGroupAsLayer.response();

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
        });

    test('Change layer style',
        {
            tag:['@readonly']
        }, async ({ page }) => {
            const project = new ProjectPage(page, 'single_wms_image');
            await project.open();

            // change single_wms_points style
            const points = page.getByTestId('single_wms_points')

            await points.locator(".node").nth(0).hover();
            let icon = points.locator(".icon-info-sign");

            await icon.click();
            let styleLayer = page.locator("#sub-dock").locator("select.styleLayer");

            await styleLayer.selectOption("white_dots");
            const requestStylePromise = project.waitForGetMapRequest();
            const requestStyle = await requestStylePromise;
            const expectedStyleParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'STYLES':'default,default,white_dots,default,default,',
                'LAYERS':'single_wms_baselayer,single_wms_lines,single_wms_points,single_wms_points_group,single_wms_lines_group,GroupAsLayer',
            }
            await expectParametersToContain('GetMap', requestStyle.url(), expectedStyleParameters);
            await requestStyle.response();
        });

    test('Apply filters on layer, then change layer style',
        {
            tag:['@readonly']
        }, async ({ page }) => {
            const project = new ProjectPage(page, 'single_wms_image');
            await project.open();

            let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest();
            await project.clickOnMap(379, 288);

            await getFeatureInfoRequestPromise;

            // render popup
            await page.waitForTimeout(500);
            let popup = await project.identifyContentLocator(
                '1',
                'single_wms_points_7462146f_833e_4d7f_be4f_bccfc4ca1662'
            );
            await expect(popup.locator('.lizmapPopupTitle').first()).toHaveText('Points');
            await expect(popup.locator("table tbody tr")).toHaveCount(2);
            await expect(popup.locator("table tbody tr").nth(0).locator("td")).toHaveText("1");
            await expect(popup.locator("table tbody tr").nth(1).locator("td")).toHaveText("Point_1");

            // click on filter button
            await expect(popup.locator("lizmap-feature-toolbar button.feature-filter")).toBeVisible();

            await popup.locator("lizmap-feature-toolbar button.feature-filter").click();
            const requestTokenPromise = project.waitForGetFilterTokenRequest();
            const requestToken = await requestTokenPromise;
            const expectedFilterTokenParameter = {
                'service': 'WMS',
                'request': 'GETFILTERTOKEN',
                'typename': 'single_wms_points',
                'filter': 'single_wms_points:"id" IN ( 1 ) ',
            }
            await expectParametersToContain('GetFilterToken', requestToken.postData() ?? '', expectedFilterTokenParameter);

            // map is refreshing
            const requestFilteredMapPromise = project.waitForGetMapRequest();
            await requestToken.response();

            const requestFilteredMap = await requestFilteredMapPromise;
            const expectedFilteredMapParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'STYLES':'default,default,default,default,default,',
                'FILTERTOKEN': /^[a-zA-Z0-9]{32}$/,
                'LAYERS':'single_wms_baselayer,single_wms_lines,single_wms_points,single_wms_points_group,single_wms_lines_group,GroupAsLayer',
            }
            await expectParametersToContain('GetMap', requestFilteredMap.url(), expectedFilteredMapParameters);
            await requestFilteredMap.response();

            // change the style while filtering
            const points = page.getByTestId('single_wms_points')
            await page.locator("#button-switcher").click();
            await points.locator(".node").nth(0).hover();
            let icon = await points.locator(".icon-info-sign");

            await icon.click();
            let styleLayer = page.locator("#sub-dock").locator("select.styleLayer");

            await styleLayer.selectOption("white_dots");
            const requestFilteredStylePromise = project.waitForGetMapRequest();

            const requestFilteredStyle = await requestFilteredStylePromise;
            const expectedFilteredStyleParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'STYLES':'default,default,white_dots,default,default,',
                'FILTERTOKEN': /^[a-zA-Z0-9]{32}$/,
                'LAYERS':'single_wms_baselayer,single_wms_lines,single_wms_points,single_wms_points_group,single_wms_lines_group,GroupAsLayer',
            }
            await expectParametersToContain('GetMap', requestFilteredStyle.url(), expectedFilteredStyleParameters);
            await requestFilteredStyle.response();
        });

    test('Filter on legend, then apply filter',
        {
            tag:['@readonly']
        }, async ({ page }) => {
            const project = new ProjectPage(page, 'single_wms_image');
            await project.open();

            const lines = page.getByTestId('single_wms_lines')
            await lines.locator(".expandable").click();

            await lines.locator("ul.symbols > li").nth(0).locator("input").click();
            const requestLegendPromise = project.waitForGetMapRequest();

            const requestLegend = await requestLegendPromise;
            const expectedLegendParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'STYLES':'default,default,default,default,default,',
                'LEGEND_ON':'single_wms_lines:1,2,3,4',
                'LEGEND_OFF':'single_wms_lines:0',
                'LAYERS':'single_wms_baselayer,single_wms_lines,single_wms_points,single_wms_points_group,single_wms_lines_group,GroupAsLayer',
            }
            await expectParametersToContain('GetMap', requestLegend.url(), expectedLegendParameters);
            await requestLegend.response();

            // filter
            let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest();
            await project.clickOnMap(460, 352);

            await getFeatureInfoRequestPromise;

            // render popup
            await page.waitForTimeout(500);
            let popup = await project.identifyContentLocator(
                '3',
                'single_wms_lines_1e302878_563d_4cc7_9bed_145269e95d68'
            );
            await expect(popup.locator('.lizmapPopupTitle').first()).toHaveText('Lines');
            await expect(popup.locator("table tbody tr")).toHaveCount(2);
            await expect(popup.locator("table tbody tr").nth(0).locator("td")).toHaveText("3");
            await expect(popup.locator("table tbody tr").nth(1).locator("td")).toHaveText("Line_3");

            await expect(popup.locator("lizmap-feature-toolbar button.feature-filter")).toBeVisible();

            await popup.locator("lizmap-feature-toolbar button.feature-filter").click();
            const requestTokenPromise = project.waitForGetFilterTokenRequest();
            const requestToken = await requestTokenPromise;
            const expectedFilterTokenParameter = {
                'service': 'WMS',
                'request': 'GETFILTERTOKEN',
                'typename': 'single_wms_lines',
                'filter': 'single_wms_lines:"id" IN ( 3 ) ',
            }
            await expectParametersToContain('GetFilterToken', requestToken.postData() ?? '', expectedFilterTokenParameter);

            // map is refreshing
            const requestFiltereLegendPromise = project.waitForGetMapRequest();
            await requestToken.response();

            const requestFiltereLegend = await requestFiltereLegendPromise;
            const expectedFiltereLegendParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'STYLES':'default,default,default,default,default,',
                'LEGEND_ON':'single_wms_lines:1,2,3,4',
                'LEGEND_OFF':'single_wms_lines:0',
                'FILTERTOKEN': /^[a-zA-Z0-9]{32}$/,
                'LAYERS':'single_wms_baselayer,single_wms_lines,single_wms_points,single_wms_points_group,single_wms_lines_group,GroupAsLayer',
            }
            await expectParametersToContain('GetMap', requestFiltereLegend.url(), expectedFiltereLegendParameters);
            await requestFiltereLegend.response();
        });

    test('Switch baselayer',
        {
            tag:['@readonly']
        }, async ({ page }) => {
            const project = new ProjectPage(page, 'single_wms_image');
            await project.open();

            // switch base layer
            const requestTileBaseLayerPromise = project.waitForGetMapRequest();
            await page.locator("lizmap-base-layers select").selectOption("single_wms_tiled_baselayer")

            const requestTileBaseLayer = await requestTileBaseLayerPromise;
            const expectedTileBaseLayerParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'STYLES':'default,default,default,default,',
                'LAYERS':'single_wms_lines,single_wms_points,single_wms_points_group,single_wms_lines_group,GroupAsLayer',
            }
            await expectParametersToContain('GetMap', requestTileBaseLayer.url(), expectedTileBaseLayerParameters);
            await requestTileBaseLayer.response();

            await page.waitForTimeout(500);

            // switch to second WMS baselayer
            const requestSecondBaseLayerPromise = project.waitForGetMapRequest();
            await page.locator("lizmap-base-layers select").selectOption("single_wms_baselayer_two");

            const requestSecondBaseLayer = await requestSecondBaseLayerPromise;
            const expectedSecondBaseLayerParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'STYLES':'default,default,default,default,default,',
                'LAYERS':'single_wms_baselayer_two,single_wms_lines,single_wms_points,single_wms_points_group,single_wms_lines_group,GroupAsLayer',
            }
            await expectParametersToContain('GetMap', requestSecondBaseLayer.url(), expectedSecondBaseLayerParameters);
            await requestSecondBaseLayer.response();
        });

    test('Edit a layer',
        {
            tag:['@write']
        }, async ({ page }) => {
            const project = new ProjectPage(page, 'single_wms_image');
            await project.open();

            project.openEditingFormWithLayer('Points');
            await page.waitForTimeout(300);

            // edition id done on #map
            await project.clickOnMapLegacy(532, 293);
            await project.fillEditionFormTextInput('title', 'Test insert');

            // submit the form
            const requestMapPromise = project.waitForGetMapRequest();
            project.editingSubmitForm();
            const requestMap = await requestMapPromise;
            const expectedrequestMapParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'STYLES':'default,default,default,default,default,',
                'LAYERS':'single_wms_baselayer,single_wms_lines,single_wms_points,single_wms_points_group,single_wms_lines_group,GroupAsLayer',
            }
            await expectParametersToContain('GetMap', requestMap.url(), expectedrequestMapParameters);
            await requestMap.response();
        });
});
