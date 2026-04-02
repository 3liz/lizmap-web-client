// @ts-check
import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js'
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
        const snapWfsRequestPromise = page.waitForRequest(
            request => request.method() === 'POST'
                && request.postData()?.includes('GetFeature') === true
                && request.postData()?.includes('form_edition_snap_point') === true
        );

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

        // Allow any in-flight requests to settle before checking the flag.
        await page.waitForTimeout(300);
        expect(describeFeatureTypeSent).toBeFalsy();
    });

    test('Snap panel functionalities', async ({ page }) => {
        const project = new ProjectPage(page, 'form_edition_multilayer_snap');

        const formRequest = await project.openEditingFormWithLayer('form_edition_snap_control');
        await formRequest.response();

        // briefly check the form
        await expect(page.getByRole('heading', { name: 'form_edition_snap_control' })).toHaveText("form_edition_snap_control")
        await expect(page.getByLabel('id')).toBeVisible()

        // move to digitization panel
        await page.getByRole('link', { name: 'Digitization' }).click()

        let getSnappingPointFeatureRequestPromise = page.waitForRequest(
            request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('GetFeature') === true && request.postData()?.includes('form_edition_snap_point') === true);
        let getSnappingPointDescribeFeatureRequestPromise = page.waitForRequest(
            request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('DescribeFeatureType') === true && request.postData()?.includes('form_edition_snap_point') === true);

        //activate snapping
        await page.getByRole('button', { name: 'Start' }).click();

        await Promise.all([getSnappingPointFeatureRequestPromise, getSnappingPointDescribeFeatureRequestPromise])

        await expect(page.locator("#edition-point-coord-form-group").getByRole("button").nth(2)).toBeDisabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("input")).toBeEnabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).toHaveText("Point snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).not.toHaveClass("snap-disabled");

        //Line snap and Polygon snap, disabled and place on bottom of the list (sorted)
        // line first
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).not.toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeDisabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).toHaveText("Line snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).toHaveClass("snap-disabled");

        // then polygon
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).not.toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).toBeDisabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toHaveText("Polygon snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toHaveClass("snap-disabled");

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
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).not.toHaveClass("snap-disabled");

        // then point
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeEnabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).toHaveText("Point snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).not.toHaveClass("snap-disabled");

        // then polygon
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).not.toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).toBeDisabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toHaveText("Polygon snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toHaveClass("snap-disabled");

        // activate snap on line and refresh snap
        await page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("input").check()

        let getSnappingLineFeatureRequestPromise = page.waitForRequest(
            request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('GetFeature') === true && request.postData()?.includes('form_edition_snap_line') === true);

        await page.locator("#edition-point-coord-form-group").getByRole("button").nth(2).click()

        await getSnappingLineFeatureRequestPromise;

        await page.waitForTimeout(300);

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
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).not.toHaveClass("snap-disabled");

        // then point
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeEnabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).toHaveText("Point snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).not.toHaveClass("snap-disabled");

        // then polygon
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).not.toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).toBeEnabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toHaveText("Polygon snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).not.toHaveClass("snap-disabled");

        // activate snap on polygon and refresh snap
        await page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input").check()

        let getSnappingPolygonFeatureRequestPromise = page.waitForRequest(
            request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('GetFeature') === true && request.postData()?.includes('form_edition_snap_polygon') === true);

        await page.locator("#edition-point-coord-form-group").getByRole("button").nth(2).click()

        await getSnappingPolygonFeatureRequestPromise;

        await page.waitForTimeout(300);

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
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).toHaveClass("snap-disabled");

        // then point
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeDisabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).toHaveText("Point snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).toHaveClass("snap-disabled");

        // then polygon
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).toBeDisabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toHaveText("Polygon snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toHaveClass("snap-disabled");


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
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(0).locator("label")).not.toHaveClass("snap-disabled");

        // then point
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("input")).toBeEnabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).toHaveText("Polygon snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(1).locator("label")).not.toHaveClass("snap-disabled");

        // then polygon
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).toBeChecked();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("input")).toBeDisabled();
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toHaveText("Point snap");
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer").nth(2).locator("label")).toHaveClass("snap-disabled");
    })
})
