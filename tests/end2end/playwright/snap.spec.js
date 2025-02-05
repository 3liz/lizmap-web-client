// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';
import {ProjectPage} from "./pages/project";

test.describe('Snap on edition', () => {
    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=form_edition_multilayer_snap';
        await gotoMap(url, page);
    });

    test('Snap panel functionalities', async ({ page }) => {

        let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));

        const project = new ProjectPage(page, 'form_edition_multilayer_snap');
        await project.openEditingFormWithLayer('form_edition_snap_control');

        await editFeatureRequestPromise;

        await page.waitForTimeout(300);

        // briefly check the form
        await expect(page.getByRole('heading', { name: 'form_edition_snap_control' })).toHaveText("form_edition_snap_control")
        await expect(page.getByLabel('id')).toBeVisible()

        // move to digitization panel
        await page.getByRole('tab', { name: 'Digitization' }).click()

        let getSnappingPointFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('GetFeature') === true && request.postData()?.includes('form_edition_snap_point') === true);
        let getSnappingPointDescribeFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('DescribeFeatureType') === true && request.postData()?.includes('form_edition_snap_point') === true);

        // activate snapping
        await page.getByRole('button', { name: 'Start' }).click();

        await Promise.all([getSnappingPointFeatureRequestPromise, getSnappingPointDescribeFeatureRequestPromise])

        // check snap panel and controls
        await expect(page.locator("#edition-point-coord-form-group").getByRole("button").nth(2)).toBeDisabled();

        //check layer list in the panel
        await expect(page.locator("#edition-point-coord-form-group .snap-layers-list .snap-layer")).toHaveCount(3);
        //Point snap, enabled and place on top of the list
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

        let getSnappingLineFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('GetFeature') === true && request.postData()?.includes('form_edition_snap_line') === true);
        let getSnappingLineDescribeFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('DescribeFeatureType') === true && request.postData()?.includes('form_edition_snap_line') === true);

        await page.locator("#edition-point-coord-form-group").getByRole("button").nth(2).click()

        await Promise.all([getSnappingLineFeatureRequestPromise, getSnappingLineDescribeFeatureRequestPromise])

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

        let getSnappingPolygonFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('GetFeature') === true && request.postData()?.includes('form_edition_snap_polygon') === true);
        let getSnappingPolygonDescribeFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData() != null && request.postData()?.includes('DescribeFeatureType') === true && request.postData()?.includes('form_edition_snap_polygon') === true);

        await page.locator("#edition-point-coord-form-group").getByRole("button").nth(2).click()

        await Promise.all([getSnappingPolygonFeatureRequestPromise, getSnappingPolygonDescribeFeatureRequestPromise])

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
