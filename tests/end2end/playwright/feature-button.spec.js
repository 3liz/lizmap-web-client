// @ts-check
import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js';
import { expect as responseExpect } from './fixtures/expect-response.js';
import { ProjectPage } from './pages/project.js';

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Playwright Locator
 * @typedef {import('@playwright/test').Locator} Locator
 */

// Layer of the feature_toolbar project: PostgreSQL points, popup enabled, editable, primary key `id`
const PARENT_LAYER_ID = 'parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111';
// Layer of the feature_toolbar project with popup disabled, but editable
const NO_POPUP_LAYER_ID = 'tramway_lines_4215fd0b_5136_4c19_b3ee_d1617f8df8ea';
// Layer of the feature_toolbar project not editable
const NOT_EDITABLE_LAYER_ID = 'parent_layer_37995b81_7718_4aee_b942_a7f1f39b562e';
// Coordinates of the feature 2 of parent_layer in EPSG:2154 (the project projection).
// Do not use the feature 1 to test the zoom: the initial map is already centered on it.
const FEATURE_2_COORDINATES = [782444.05, 6279478.10];

/**
 * Add a lizmap-feature-button in the page
 * @param {Page} page - The Playwright page
 * @param {string} id - The HTML element ID
 * @param {object} dataset - The data attributes (camelCase keys, as in element.dataset)
 * @returns {Promise<Locator>} The lizmap-feature-button element
 */
async function addFeatureButton(page, id, dataset) {
    await page.evaluate(({ id, dataset }) => {
        let container = document.getElementById('feature-button-tests');
        if (!container) {
            container = document.createElement('div');
            container.id = 'feature-button-tests';
            container.style.cssText = 'position: fixed; top: 100px; left: 50%; z-index: 10000;';
            document.body.append(container);
        }
        const element = document.createElement('lizmap-feature-button');
        element.id = id;
        Object.assign(element.dataset, dataset);
        container.append(element);
    }, { id, dataset });
    return page.locator(`#${id}`);
}

/**
 * Record the events dispatched by lizmap-feature-button in window.featureButtonEvents
 * @param {Page} page - The Playwright page
 */
async function listenFeatureButtonEvents(page) {
    await page.evaluate(() => {
        globalThis.featureButtonEvents = [];
        globalThis.lizMap.mainEventDispatcher.addListener(
            (evt) => globalThis.featureButtonEvents.push({
                type: evt.type,
                layerId: evt.layerId,
                featureId: evt.featureId,
            }),
            ['featurebutton.popup.displayed', 'featurebutton.edition.launched']
        );
    });
}

test.describe('lizmap-feature-button', {
    tag: ['@readonly'],
}, () => {

    /** @type {ProjectPage} */
    let project;

    test.beforeEach(async ({ page }) => {
        project = new ProjectPage(page, 'feature_toolbar');
        await project.open();
    });

    test('should render the button', async ({ page }) => {
        // Default label in popup mode
        const popupButton = await addFeatureButton(page, 'fb-popup', {
            targetLayerId: PARENT_LAYER_ID,
            targetFeatureId: '1',
            targetLayerPkField: 'id',
        });
        await expect(popupButton.locator('button')).toHaveCount(1);
        await expect(popupButton.locator('button')).toHaveText('Details');
        await expect(popupButton.locator('button')).toHaveAttribute('type', 'button');
        await expect(popupButton.locator('button')).toHaveClass('btn lizmap-feature-button');
        await expect(popupButton.locator('button')).toBeEnabled();

        // Default label in edit mode
        const editButton = await addFeatureButton(page, 'fb-edit', {
            targetLayerId: PARENT_LAYER_ID,
            targetFeatureId: '1',
            targetLayerPkField: 'id',
            mode: 'edit',
        });
        await expect(editButton.locator('button')).toHaveText('Edit');

        // Custom label and description
        const customButton = await addFeatureButton(page, 'fb-custom', {
            targetLayerId: PARENT_LAYER_ID,
            targetFeatureId: '1',
            targetLayerPkField: 'id',
            label: 'My label',
            description: 'My description',
        });
        await expect(customButton.locator('button')).toHaveText('My label');
        await expect(customButton.locator('button')).toHaveAttribute('title', 'My description');
    });

    test('should disable the button when the parameters are not valid', async ({ page }) => {
        // Unknown layer
        const unknownLayer = await addFeatureButton(page, 'fb-unknown-layer', {
            targetLayerId: 'unknown_layer',
            targetFeatureId: '1',
            targetLayerPkField: 'id',
        });
        await expect(unknownLayer.locator('button')).toBeDisabled();

        // Missing primary key field
        const noPkField = await addFeatureButton(page, 'fb-no-pk', {
            targetLayerId: PARENT_LAYER_ID,
            targetFeatureId: '1',
        });
        await expect(noPkField.locator('button')).toBeDisabled();

        // Missing feature id
        const noFeatureId = await addFeatureButton(page, 'fb-no-feature', {
            targetLayerId: PARENT_LAYER_ID,
            targetLayerPkField: 'id',
        });
        await expect(noFeatureId.locator('button')).toBeDisabled();

        // Layer without popup
        const noPopup = await addFeatureButton(page, 'fb-no-popup', {
            targetLayerId: NO_POPUP_LAYER_ID,
            targetFeatureId: '1',
            targetLayerPkField: 'id',
        });
        await expect(noPopup.locator('button')).toBeDisabled();

        // Unknown mode
        const unknownMode = await addFeatureButton(page, 'fb-unknown-mode', {
            targetLayerId: PARENT_LAYER_ID,
            targetFeatureId: '1',
            targetLayerPkField: 'id',
            mode: 'unknown',
        });
        await expect(unknownMode.locator('button')).toBeDisabled();

        // Edit mode on a layer which is not editable
        const notEditable = await addFeatureButton(page, 'fb-not-editable', {
            targetLayerId: NOT_EDITABLE_LAYER_ID,
            targetFeatureId: '1',
            mode: 'edit',
        });
        await expect(notEditable.locator('button')).toBeDisabled();
    });

    test('should enable the edit button without popup nor primary key field', async ({ page }) => {
        // The popup and the primary key field are only needed in popup mode
        const editButton = await addFeatureButton(page, 'fb-edit-no-popup', {
            targetLayerId: NO_POPUP_LAYER_ID,
            targetFeatureId: '1',
            mode: 'edit',
        });
        await expect(editButton.locator('button')).toBeEnabled();
    });

    test('should display the feature popup', async ({ page }) => {
        await listenFeatureButtonEvents(page);
        const button = await addFeatureButton(page, 'fb-popup', {
            targetLayerId: PARENT_LAYER_ID,
            targetFeatureId: '1',
            targetLayerPkField: 'id',
        });

        const getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await button.locator('button').click();
        const getFeatureInfoRequest = await getFeatureInfoPromise;

        // Check the request: filtered on the primary key, one feature
        requestExpect(getFeatureInfoRequest).toContainParametersInPostData({
            'SERVICE': 'WMS',
            'REQUEST': 'GetFeatureInfo',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': 'parent_layer',
            'QUERY_LAYERS': 'parent_layer',
            'FEATURE_COUNT': '1',
            'FILTER': 'parent_layer:"id" = \'1\'',
        });
        responseExpect(await getFeatureInfoRequest.response()).toBeHtml();

        // Check the popup content
        await expect(await project.identifyContentLocator('1', PARENT_LAYER_ID)).toHaveCount(1);

        // Check the event
        await expect.poll(() => page.evaluate(() => globalThis.featureButtonEvents)).toEqual([{
            type: 'featurebutton.popup.displayed',
            layerId: PARENT_LAYER_ID,
            featureId: '1',
        }]);

        // The button is enabled again after the request
        await expect(button.locator('button')).toBeEnabled();
    });

    test('should zoom to the feature before displaying the popup', async ({ page }) => {
        const button = await addFeatureButton(page, 'fb-zoom', {
            targetLayerId: PARENT_LAYER_ID,
            targetFeatureId: '2',
            targetLayerPkField: 'id',
            targetZoomToFeature: 'true',
        });

        const getView = () => page.evaluate(() => {
            const view = globalThis.lizMap.mainLizmap.map.getView();
            return { center: view.getCenter(), resolution: view.getResolution() };
        });
        const initialView = await getView();
        // The initial map must not be already centered on the feature, or the test proves nothing
        expect(Math.abs(initialView.center[0] - FEATURE_2_COORDINATES[0])).toBeGreaterThan(1000);

        const getFeaturePromise = project.waitForGetFeatureRequest('parent_layer');
        const getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await button.locator('button').click();

        // The geometry is requested with WFS
        const getFeatureRequest = await getFeaturePromise;
        requestExpect(getFeatureRequest).toContainParametersInPostData({
            'SERVICE': 'WFS',
            'REQUEST': 'GetFeature',
            'FEATUREID': 'parent_layer.2',
        });

        // The popup is requested after the zoom: at this point, the map must be on the feature
        await getFeatureInfoPromise;
        const finalView = await getView();
        expect(finalView.center[0]).toBeCloseTo(FEATURE_2_COORDINATES[0], 0);
        expect(finalView.center[1]).toBeCloseTo(FEATURE_2_COORDINATES[1], 0);
        expect(finalView.resolution).toBeLessThan(initialView.resolution);

        await expect(await project.identifyContentLocator('2', PARENT_LAYER_ID)).toHaveCount(1);
    });

    test('should display an error when the feature does not exist', async ({ page }) => {
        const button = await addFeatureButton(page, 'fb-not-found', {
            targetLayerId: PARENT_LAYER_ID,
            targetFeatureId: '999',
            targetLayerPkField: 'id',
        });

        const getFeatureInfoPromise = project.waitForGetFeatureInfoRequest();
        await button.locator('button').click();
        await (await getFeatureInfoPromise).response();

        await expect(page.locator('#message > div')).toHaveClass(/alert-danger/);
        await expect(page.locator('#message > div')).toContainText(
            'An error occurred while fetching the feature data.'
        );
    });

    test('should launch the feature edition', async ({ page }) => {
        await listenFeatureButtonEvents(page);
        const button = await addFeatureButton(page, 'fb-edit', {
            targetLayerId: PARENT_LAYER_ID,
            targetFeatureId: '2',
            targetLayerPkField: 'id',
            mode: 'edit',
        });

        const modifyFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/modifyFeature/);
        await button.locator('button').click();
        const modifyFeatureRequest = await modifyFeatureRequestPromise;
        const editFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/editFeature/);
        await modifyFeatureRequest.response();
        const editFeatureRequest = await editFeatureRequestPromise;
        await editFeatureRequest.response();

        // Check the requests
        const expectedParameters = {
            layerId: PARENT_LAYER_ID,
            featureId: '2',
        };
        requestExpect(modifyFeatureRequest).toContainParametersInUrl(expectedParameters);
        requestExpect(editFeatureRequest).toContainParametersInUrl(expectedParameters);

        // The form is opened for the feature 2
        await expect(page.locator('#jforms_view_edition_id')).toHaveValue('2');

        // Check the event
        await expect.poll(() => page.evaluate(() => globalThis.featureButtonEvents)).toEqual([{
            type: 'featurebutton.edition.launched',
            layerId: PARENT_LAYER_ID,
            featureId: '2',
        }]);

        // Cancel the edition
        page.on('dialog', dialog => dialog.accept());
        await page.locator('#jforms_view_edition__submit_cancel').click();
    });
});
