// @ts-check
import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js'
import { expect as responseExpect } from './fixtures/expect-response.js'
import { ProjectPage } from "./pages/project";

test.describe('Snap on edition', () => {
    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'form_edition_multilayer_snap');
        await project.open();
    });

    test('Snap WFS GetFeature uses WFS 1.1.0 with SRSNAME in the map projection', async ({ page }) => {
        const project = new ProjectPage(page, 'form_edition_multilayer_snap');

        // Intercept the snap GetFeature request before opening the form —
        // snapping is auto-activated on form display for this project.
        const snapWfsRequestPromise = project.waitForGetFeatureRequest('form_edition_snap_point');

        // Track whether a DescribeFeatureType is sent alongside the snap request.
        // With the new WFS 1.1.0 path we no longer go through getFeatureData(), so
        // no DescribeFeatureType should be triggered.
        let describeFeatureTypeSent = false;
        page.on('request', request => {
            if (
                request.method() === 'POST'
                && request.postData()?.includes('DescribeFeatureType') === true
                && request.postData()?.includes('form_edition_snap_point') === true
            ) {
                describeFeatureTypeSent = true;
            }
        });

        const formRequest = await project.openEditingFormWithLayer('form_edition_snap_control');
        await formRequest.response();
        await page.getByRole('tab', { name: 'Digitization' }).click();

        const snapWfsRequest = await snapWfsRequestPromise;

        // The WFS request must use version 1.1.0 with an explicit SRSNAME so that
        // QGIS Server reprojects features server-side instead of the client using
        // proj4js (which lacks datum-grid shifts and introduces ~cm coordinate drift).
        requestExpect(snapWfsRequest).toContainParametersInPostData({
            SERVICE: 'WFS',
            VERSION: '1.1.0',
            REQUEST: 'GetFeature',
            TYPENAME: 'form_edition_snap_point',
            SRSNAME: 'EPSG:4326',  // the project's map projection
        });

        // Confirm the snap response is valid GeoJSON, then verify no DescribeFeatureType was sent.
        responseExpect(await snapWfsRequest.response()).toBeGeoJson();
        expect(describeFeatureTypeSent).toBeFalsy();
    });

    test('Snap WFS GetFeature uses map projection SRSNAME for cross-CRS layer', async ({ page }, testInfo) => {
        // Project is in EPSG:3857; snap target is stored in EPSG:2154 (Lambert-93).
        // The WFS request must ask for features in the MAP projection (SRSNAME=EPSG:3857)
        // and include a 5-element BBOX so the server can apply the spatial filter correctly.
        // Snapping is auto-activated on form display (snap_on_start: True).
        const project = new ProjectPage(page, 'form_edition_snap_datum_shift');
        project.waitForGetLegendGraphicDuringLoad = false;

        await project.open();

        const snapWfsRequestPromise = project.waitForGetFeatureRequest('snap_datum_shift_target');

        const formRequest = await project.openEditingFormWithLayer('snap_datum_shift_edit');
        responseExpect(await formRequest.response()).toBeTextPlain();

        await page.getByRole('tab', { name: 'Digitization' }).click();

        const snapWfsRequest = await snapWfsRequestPromise;
        const rawPostData = snapWfsRequest.postData() ?? '';
        const postData = new URLSearchParams(rawPostData);

        // Attach the full POST body to the test report for easy inspection on failure.
        await testInfo.attach('snap-wfs-request-post-data', {
            body: rawPostData,
            contentType: 'application/x-www-form-urlencoded',
        });

        requestExpect(snapWfsRequest).toContainParametersInPostData({
            SERVICE: 'WFS',
            VERSION: '1.1.0',
            REQUEST: 'GetFeature',
            TYPENAME: 'snap_datum_shift_target',
            SRSNAME: 'EPSG:3857',
        });

        // BBOX must be the 5-element WFS 1.1.0 format ending with the CRS code.
        const bbox = postData.get('BBOX') ?? '';
        expect(bbox, `BBOX must be 5-element WFS 1.1.0 format (x,y,x,y,EPSG:3857), got: "${bbox}"`
        ).toMatch(/^-?[\d.]+,-?[\d.]+,-?[\d.]+,-?[\d.]+,EPSG:3857$/);

        responseExpect(await snapWfsRequest.response()).toBeGeoJson();
    });

    test('Snap features from EPSG:2154 layer arrive in EPSG:3857 coordinates', async ({ page }, testInfo) => {
        // The PostGIS WFS path must transform geometries into the requested output CRS
        // (SRSNAME=EPSG:3857). Without the fix, coordinates would come back in EPSG:4326
        // (~3.86–3.92 / 43.61–43.64) or the layer native CRS EPSG:2154 (~769000–774000 /
        // 6280000–6283000), both obviously outside the valid EPSG:3857 range for this area
        // (~430000–435000 / 5406000–5408000).
        // Snapping is auto-activated on form display (snap_on_start: True).
        const project = new ProjectPage(page, 'form_edition_snap_datum_shift');
        project.waitForGetLegendGraphicDuringLoad = false;

        await project.open();

        const snapWfsRequestPromise = project.waitForGetFeatureRequest('snap_datum_shift_target');

        const formRequest = await project.openEditingFormWithLayer('snap_datum_shift_edit');
        await formRequest.response();

        await page.getByRole('tab', { name: 'Digitization' }).click();

        const snapWfsRequest = await snapWfsRequestPromise;
        const snapWfsResponse = await snapWfsRequest.response();

        // Confirm the server returned valid GeoJSON before inspecting coordinates.
        responseExpect(snapWfsResponse).toBeGeoJson();

        const geojson = await snapWfsResponse?.json();

        // Attach the full server response to the test report.
        await testInfo.attach('snap-wfs-response-body', {
            body: JSON.stringify(geojson),
            contentType: 'application/json',
        });

        console.log('[snap datum-shift] WFS response status:', snapWfsResponse?.status());
        console.log('[snap datum-shift] Feature count:', geojson.features?.length ?? 0);

        expect(geojson.features, 'Response must contain a features array').toBeDefined();
        expect(geojson.features.length, 'At least one snap target feature must be returned').toBeGreaterThan(0);

        for (const feature of geojson.features) {
            const [x, y] = feature.geometry.coordinates;

            console.log(`[snap datum-shift] Feature id=${feature.id} coords: x=${x.toFixed(2)}, y=${y.toFixed(2)}`);

            // Diagnose likely failure modes in the message for faster debugging:
            //   4326 → x ≈ 3.86,    y ≈ 43.6
            //   2154 → x ≈ 769 000, y ≈ 6 280 000
            //   3857 → x ≈ 431 000, y ≈ 5 407 000  ✓
            const hint = x < 10
                ? `looks like EPSG:4326 (lon/lat) — server did not transform to 3857`
                : x > 500000
                    ? `looks like EPSG:2154 (Lambert-93) — server returned native CRS instead of 3857`
                    : '';
            expect(x, `x=${x.toFixed(2)} out of EPSG:3857 range for this area [420000–445000]${hint ? ' — ' + hint : ''}`
            ).toBeGreaterThan(420000);
            expect(x, `x=${x.toFixed(2)} out of EPSG:3857 range for this area [420000–445000]${hint ? ' — ' + hint : ''}`
            ).toBeLessThan(445000);
            expect(y, `y=${y.toFixed(2)} out of EPSG:3857 range for this area [5390000–5420000]`
            ).toBeGreaterThan(5390000);
            expect(y, `y=${y.toFixed(2)} out of EPSG:3857 range for this area [5390000–5420000]`
            ).toBeLessThan(5420000);
        }
    });

    test('Snap panel functionalities', async ({ page }) => {
        const project = new ProjectPage(page, 'form_edition_multilayer_snap');

        // Set up request watcher before opening the form, as snapping is auto-activated on form display
        let getSnappingPointFeatureRequestPromise = project.waitForGetFeatureRequest('form_edition_snap_point');

        const formRequest = await project.openEditingFormWithLayer('form_edition_snap_control');
        await formRequest.response();

        // briefly check the form
        await expect(page.getByRole('heading', { name: 'form_edition_snap_control' })).toHaveText("form_edition_snap_control")
        await expect(page.getByLabel('id')).toBeVisible()

        // move to digitization panel
        await page.getByRole('tab', { name: 'Digitization' }).click()

        // snapping is auto-activated when snap layers are configured
        responseExpect(await (await getSnappingPointFeatureRequestPromise).response()).toBeGeoJson();

        // check snap panel and controls
        await expect(page.locator("#edition-point-coord-form-group").getByRole("button").nth(2)).toBeDisabled();

        //check layer list in the panel
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer")).toHaveCount(3);
        //Point snap, enabled and place on top of the list
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("input")).toBeEnabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).toHaveText("Point snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).not.toContainClass("snap-disabled");

        //Line snap and Polygon snap, disabled and place on bottom of the list (sorted)
        // line first
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).not.toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeDisabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).toHaveText("Line snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).toContainClass("snap-disabled");

        // then polygon
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).not.toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).toBeDisabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toHaveText("Polygon snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toContainClass("snap-disabled");

        // turn on the line layer
        await page.locator('#button-switcher').click();
        await page.getByTestId('form_edition_snap_line').getByLabel('Line snap').click();

        // back to digitization panel
        await page.locator('#button-edition').click();

        // refresh button now should be enabled
        await expect(page.locator("#edition-point-coord-form-group").getByRole("button").nth(2)).toBeEnabled();

        // check current snap panel
        // now the order of the elements on the list should be changed in Line snap, Point snap (both enabled with Line snap unchecked), Polygon snap
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer")).toHaveCount(3);

        // line first
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("input")).not.toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("input")).toBeEnabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).toHaveText("Line snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).not.toContainClass("snap-disabled");

        // then point
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeEnabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).toHaveText("Point snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).not.toContainClass("snap-disabled");

        // then polygon
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).not.toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).toBeDisabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toHaveText("Polygon snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toContainClass("snap-disabled");

        // activate snap on line and refresh snap
        await page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("input").check()

        let getSnappingLineFeatureRequestPromise = project.waitForGetFeatureRequest('form_edition_snap_line');

        await page.locator("#edition-point-coord-form-group").getByRole("button").nth(2).click()

        responseExpect(await (await getSnappingLineFeatureRequestPromise).response()).toBeGeoJson();

        await expect(page.locator("#edition-point-coord-form-group").getByRole("button").nth(2)).toBeDisabled();

        // do the same for the polygon layer


        // turn on the line layer
        await page.locator('#button-switcher').click();
        await page.getByTestId('form_edition_snap_polygon').getByLabel('Polygon snap').click();

        // back to digitization panel
        await page.locator('#button-edition').click();

        // refresh button now should be enabled
        await expect(page.locator("#edition-point-coord-form-group").getByRole("button").nth(2)).toBeEnabled();

        // check current snap panel
        // now the order of the elements on the list should be Line snap, Point snap, Polygon snap. All check boxes enabled, polygon unchecked
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer")).toHaveCount(3);

        // line first
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("input")).toBeEnabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).toHaveText("Line snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).not.toContainClass("snap-disabled");

        // then point
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeEnabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).toHaveText("Point snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).not.toContainClass("snap-disabled");

        // then polygon
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).not.toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).toBeEnabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toHaveText("Polygon snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).not.toContainClass("snap-disabled");

        // activate snap on polygon and refresh snap
        await page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input").check()

        let getSnappingPolygonFeatureRequestPromise = project.waitForGetFeatureRequest('form_edition_snap_polygon');

        await page.locator("#edition-point-coord-form-group").getByRole("button").nth(2).click()

        responseExpect(await (await getSnappingPolygonFeatureRequestPromise).response()).toBeGeoJson();

        await expect(page.locator("#edition-point-coord-form-group").getByRole("button").nth(2)).toBeDisabled();

        // disable all layer
        await project.switcher.click();
        await page.getByTestId('form_edition_snap_point').getByLabel('Point snap').click();
        await page.getByTestId('form_edition_snap_line').getByLabel('Line snap').click();
        await page.getByTestId('form_edition_snap_polygon').getByLabel('Polygon snap').click();

        // back to digitization panel
        await page.locator('#button-edition').click();

        // refresh button enabled
        await expect(page.locator("#edition-point-coord-form-group").getByRole("button").nth(2)).toBeEnabled();

        // all layers disabled and checked. Layer order Line, Point, Polygon
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer")).toHaveCount(3);

        // line first
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("input")).toBeDisabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).toHaveText("Line snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).toContainClass("snap-disabled");

        // then point
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeDisabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).toHaveText("Point snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).toContainClass("snap-disabled");

        // then polygon
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).toBeDisabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toHaveText("Polygon snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toContainClass("snap-disabled");


        // back to layers tree, enable line layer and polygon layer to reorder the snap layer list
        await project.switcher.click();
        await page.getByTestId('form_edition_snap_line').getByLabel('Line snap').click();
        await page.getByTestId('form_edition_snap_polygon').getByLabel('Polygon snap').click();

        // back to digitization panel
        await page.locator('#button-edition').click();

        // refresh button enabled
        await expect(page.locator("#edition-point-coord-form-group").getByRole("button").nth(2)).toBeEnabled();

        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer")).toHaveCount(3);

        // line first
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("input")).toBeEnabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).toHaveText("Line snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).not.toContainClass("snap-disabled");

        // then point
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeEnabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).toHaveText("Polygon snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).not.toContainClass("snap-disabled");

        // then polygon
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).toBeDisabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toHaveText("Point snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toContainClass("snap-disabled");
    })
})
