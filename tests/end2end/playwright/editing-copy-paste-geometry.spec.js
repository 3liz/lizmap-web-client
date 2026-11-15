// @ts-check
/**
 * E2E tests for the copy-paste geometry feature.
 * Introduced via PR #6405 (GeometryCopyHandler, FeaturePickerPopup) and
 * PR #6613 (unified lizmap-paste-geom button).
 *
 * The feature lets a user activate "copy mode", click any visible/queryable
 * map feature, pick it from a popup, and have its geometry applied directly
 * to the feature currently being edited.
 *
 * Architecture overview (source files):
 *   - PasteGeom.js             — <lizmap-paste-geom> web-component / toolbar button
 *   - GeometryCopyHandler.js   — orchestrates WMS GetFeatureInfo + geometry conversion
 *   - FeaturePickerPopup.js    — jQuery popup (#feature-picker-popup) with .feature-row items
 *   - FeatureStorage.js        — stores copied geometry metadata
 *
 * Key DOM selectors used in tests:
 *   lizmap-paste-geom            → copy-paste button web component
 *   lizmap-paste-geom button     → inner <button> rendered by lit-html
 *   #feature-picker-popup        → picker popup container
 *   #feature-picker-popup .feature-row  → one row per matching feature
 *   #feature-picker-popup .close-btn    → × button
 *   lizmap-paste-stored-geom     → "paste stored geom" component (hidden, future feature)
 */

import { expect, test } from '@playwright/test';
import { editedFeatureIds } from './globals';
import { ProjectPage } from './pages/project';
import { expect as requestExpect } from './fixtures/expect-request.js';
import { DrawPage } from './pages/drawpage.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROJECT = 'form_edition_simple_fields';

/** Layer metadata needed across tests. Layer IDs match the QGIS project config. */
const LAYERS = {
    point: {
        name: 'point_2154',
        id: 'form_edition_point_2154_bfabce3b_eb48_4631_b43f_d1db3772f0a5',
        geomType: 'point',
        olGeomType:'Point'
    },
    line: {
        name: 'line_2154',
        id: 'form_edition_line_2154_8797dd9f_d762_436f_91b6_1f06a37e9cf3',
        geomType: 'line',
        olGeomType:'LineString'
    },
    polygon: {
        name: 'polygon_2154',
        id: 'form_edition_polygon_2154_6b836ded_12c4_44ee_a6c4_44bf0a0d349e',
        geomType: 'polygon',
        olGeomType:'Polygon'
    },
};

const LAYERS_4326 = {
    point: {
        name: 'point_4326',
        id: 'form_edition_point_4326_f1955711_4ebd_4c78_a9fd_58083b600d6a',
        geomType: 'point',
        olGeomType:'Point'
    },
    line: {
        name: 'line_4326',
        id: 'form_edition_line_4326_2e2d506d_414a_4731_a1bb_17e33c490923',
        geomType: 'line',
        olGeomType:'LineString'
    },
    polygon: {
        name: 'polygon_4326',
        id: 'form_edition_polygon_4326_36f846ad_6690_4d2d_b48d_c342db7c07e9',
        geomType: 'polygon',
        olGeomType:'Polygon'
    },
}

/**
 * Pixel positions on the OL2 map used as source / target drawing locations.
 * Both OL2 (#map) and OL6 (#newOlMap) share the same pixel coordinate space
 * since they overlay each other — confirmed by existing editing-geometry.spec.js.
 *
 * SRC_*: position used to draw the source feature that will be copied FROM.
 * TGT_*: position used to draw the target feature that will be copied INTO.
 * EMPTY_*: a corner position where no test feature is expected to exist.
 */
const SRC_X = 600, SRC_Y = 250;
const TGT_X = 350, TGT_Y = 250;
const EMPTY_X = 550, EMPTY_Y = 200;

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/**
 * Draw a geometry on the OL2 map at the given coordinates.
 * Mimics the patterns from editing-geometry.spec.js.
 *
 * @param {ProjectPage} project
 * @param {'point'|'line'|'polygon'} geomType
 * @param {number} x
 * @param {number} y
 */
async function drawGeometry(project, geomType, x, y) {
    if (geomType === 'point') {
        await project.clickOnMapLegacy(x, y);
    } else if (geomType === 'line') {
        await project.clickOnMapLegacy(x, y);
        await project.dblClickOnMapLegacy(x + 60, y);
    } else if (geomType === 'polygon') {
        await project.clickOnMapLegacy(x, y);
        await project.clickOnMapLegacy(x + 60, y);
        await project.dblClickOnMapLegacy(x + 30, y + 50);
    }
}

/**
 * Draw a digitizing geometry on map at the given coordinates.
 * The digitized geometries are automatically translated by a constant 'shift' value relative to x|y input values.
 *
 * @param {ProjectPage} project
 * @param {'point'|'line'|'polygon'|'circle'} geomType
 * @param {number} x
 * @param {number} y
 */
const drawDigitizingGeometry = async (project, geomType, x, y) => {
    const shift = 5;
    const xs = x + shift;
    const ys = y + shift;
    if (geomType === 'point') {
        await project.clickOnMap(xs, ys);
    } else if (geomType === 'line') {
        await project.clickOnMap(xs, ys);
        await project.dblClickOnMap(xs + 60, ys);
    } else if (geomType === 'polygon') {
        await project.clickOnMap(xs, ys);
        await project.clickOnMap(xs + 60, ys);
        await project.dblClickOnMap(xs + 30, ys + 50);
    } else if (geomType == 'circle') {
        await project.clickOnMap(xs, ys);
        await project.clickOnMap(xs + 60, ys);
    }
}

/**
 * Create a feature in the given layer and return its saved IDs.
 *
 * @param {ProjectPage} project
 * @param {import('@playwright/test').Page} page
 * @param {string} layerName
 * @param {'point'|'line'|'polygon'} geomType
 * @param {number} x
 * @param {number} y
 * @param {string} label
 * @returns {Promise<{id: string}>}
 */
async function createFeature(project, page, layerName, geomType, x, y, label) {
    const formRequest = await project.openEditingFormWithLayer(layerName);
    await formRequest.response();
    await project.editingField('label').fill(label);
    await drawGeometry(project, geomType, x, y);
    await project.editingSubmitForm();
    return await editedFeatureIds(page);
}

/**
 * Open the edition form for an existing feature by clicking on the OL6 map,
 * finding its popup entry, and clicking the edit button.
 * Also switches to the Digitization tab so that lizmap-paste-geom is visible.
 *
 * @param {ProjectPage} project
 * @param {number} x
 * @param {number} y
 * @param {string} featureId
 * @param {string} layerId
 */
async function openEditFormForFeature(project, x, y, featureId, layerId) {
    // Wait for the GFI response before touching the dock.
    // map.js only auto-switches the dock to #popupcontent when the click lon/lat differs
    // from the previous identify — clicking the same position again won't trigger the switch.
    // Explicitly clicking #button-popupcontent after the response is the reliable approach.
    const gfiPromise = project.waitForGetFeatureInfoRequest();
    await project.clickOnMap(x, y);
    await (await gfiPromise).response();

    const feature = await project.identifyContentLocator(featureId, layerId);

    // Wait for the feature to appear — it may auto-show if the dock switches to popup.
    // If it doesn't appear within 2s, the dock may be showing another panel, so toggle it.
    try {
        await expect(feature).toBeVisible({ timeout: 2000 });
    } catch {
        await project.page.locator('#button-popupcontent').click();
        await expect(feature).toBeVisible();
    }

    const editRequestPromise = project.page.waitForRequest(/lizmap\/edition\/editFeature/);
    await feature.locator('.feature-edit').click();
    await (await editRequestPromise).response();
    // lizmap-paste-geom lives in #tabdigitization — switch to it so the button is visible
    await project.page.locator('.edition-tabs button[data-bs-target="#tabdigitization"]').click();
}

/**
 * Check if the FeaturePickerHighlight layers contains only one feature
 * of the "geometryType" type
 *
 * @param {ProjectPage} projectPage - the project page instance
 * @param {string} geometryType - type of geometry to test
 */
const checkHighLightLayerFeature = async (projectPage, geometryType)=>{
    const page = projectPage.page;

    const geometry = await page.evaluate(()=> {
        const highlightLayer = lizMap.map.getLayersByName('FeaturePickerHighlight');
        if (!highlightLayer && highlightLayer.length != 1) return '';
        const features = highlightLayer[0].features;
        if (!features || features.length !== 1) return '';
        const geometryComponents = features[0].geometry?.CLASS_NAME?.split('.')
        if(!geometryComponents || geometryComponents.length != 3) return ''

        return geometryComponents[2];
    });

    expect(geometry).toBe(geometryType);
}

/**
 * Cancel the edition form.  Registers a one-shot dialog handler first so that
 * an unsaved-changes confirmation (if any) is automatically accepted.
 * Switches to the form tab first because the Cancel button lives in #tabform,
 * which is the inactive tab after we've switched to the digitization tab.
 * Waits for the form container to be hidden before returning.
 *
 * @param {ProjectPage} project
 */
async function cancelEditForm(project) {
    const page = project.page;
    // The cancel button is in #tabform; switch back before clicking it.
    const formTabBtn = page.locator('.edition-tabs button[data-bs-target="#tabform"]');
    if (await formTabBtn.isVisible()) {
        await formTabBtn.click();
    }
    page.once('dialog', dialog => dialog.accept());
    await project.editingSubmit('cancel').click();
    await expect(page.locator('#edition-form-container')).toBeHidden();
}

/**
 * Delete a feature using its popup delete button (accepts the confirm dialog).
 *
 * @param {ProjectPage} project
 * @param {number} x
 * @param {number} y
 * @param {string} featureId
 * @param {string} layerId
 */
async function deleteFeature(project, x, y, featureId, layerId) {
    const page = project.page;
    // Same same-position dock issue as openEditFormForFeature — force dock to popup.
    const gfiPromise = project.waitForGetFeatureInfoRequest();
    await project.clickOnMap(x, y);
    await (await gfiPromise).response();

    const feature = await project.identifyContentLocator(featureId, layerId);

    // Same strategy as openEditFormForFeature: wait for feature first, toggle only if needed
    try {
        await expect(feature).toBeVisible({ timeout: 2000 });
    } catch {
        await page.locator('#button-popupcontent').click();
        await expect(feature).toBeVisible();
    }

    page.once('dialog', dialog => dialog.accept());
    await feature.locator('.feature-delete').click();
    await expect(page.locator('.jelix-msg-item-success')).toBeVisible();
}

/**
 * Set up a promise that resolves when the copy-mode WMS GetFeatureInfo request
 * fires.  Distinguished from regular identify requests by the presence of
 * FI_POINT_TOLERANCE in the POST body (only added by GeometryCopyHandler).
 *
 * Must be called BEFORE triggering the map click that starts the request.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<import('@playwright/test').Request>}
 */
function waitForCopyModeGFIRequest(page) {
    return page.waitForRequest(
        request =>
            request.method() === 'POST' &&
            (request.postData()?.includes('GetFeatureInfo') ?? false) &&
            (request.postData()?.includes('FI_POINT_TOLERANCE') ?? false),
        { timeout: 10_000 },
    );
}

// ---------------------------------------------------------------------------
// Test suite 1: Button presence and basic state
// ---------------------------------------------------------------------------

test.describe('Copy-paste geometry — button presence and state',
    { tag: ['@write'] }, () => {

        test('TC-01: lizmap-paste-geom button is present in the edition toolbar for a geometry layer',
            async ({ page }) => {
                const project = new ProjectPage(page, PROJECT);
                await project.open();

                // Open editing panel for any geometry layer
                const formRequest = await project.openEditingFormWithLayer(LAYERS.polygon.name);
                await formRequest.response();

                // Switch to the Digitization tab — lizmap-paste-geom lives in #tabdigitization,
                // which is hidden when the default Form tab is active.
                await page.locator('.edition-tabs button[data-bs-target="#tabdigitization"]').click();

                // The web component must be rendered inside the edition geometry toolbar
                const btn = page.locator('lizmap-paste-geom');
                await expect(btn).toBeVisible();
                // The inner <button> rendered by lit-html must also exist
                await expect(btn.locator('button')).toBeVisible();

                // Cancel the form without saving anything
                await cancelEditForm(project);
            });

        test('TC-35: lizmap-paste-stored-geom component is hidden (future feature, not yet active)',
            { tag: ['@readonly'] },
            async ({ page }) => {
                const project = new ProjectPage(page, PROJECT);
                await project.open();

                // The PasteStoredGeom component exists in the template but must be display:none
                // per the explicit style="display:none;" in map_edition.tpl
                const storedGeomBtn = page.locator('lizmap-paste-stored-geom');
                await expect(storedGeomBtn).toBeHidden();
            });
    });

// ---------------------------------------------------------------------------
// Test suite 2: Copy mode activation and deactivation
// ---------------------------------------------------------------------------

test.describe('Copy-paste geometry — copy mode activation / deactivation',
    { tag: ['@write'] }, () => {

        test('TC-04: Button is enabled when editing an existing feature (layerId is set)',
            async ({ page }) => {
                const project = new ProjectPage(page, PROJECT);
                await project.open();

                // Create a source feature so we have something to edit
                const ids = await createFeature(
                    project, page,
                    LAYERS.polygon.name, 'polygon',
                    SRC_X, SRC_Y,
                    'tc04-source',
                );

                // Open the edit form for that feature (modify mode → layerId is set)
                await openEditFormForFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);

                // Button must not be disabled because layerId is set
                const btn = page.locator('lizmap-paste-geom button');
                await expect(btn).not.toBeDisabled();

                // Cleanup
                await cancelEditForm(project);
                await deleteFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);
            });

        test('TC-07: Activating copy mode sets crosshair cursor and marks button as active',
            async ({ page }) => {
                const project = new ProjectPage(page, PROJECT);
                await project.open();

                const ids = await createFeature(
                    project, page,
                    LAYERS.polygon.name, 'polygon',
                    SRC_X, SRC_Y,
                    'tc07-source',
                );

                await openEditFormForFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);

                const btn = page.locator('lizmap-paste-geom button');

                // Click the copy button to activate copy mode
                await btn.click();

                // Button must gain the 'active' CSS class
                await expect(btn).toHaveClass(/active/);

                // OL2 map cursor must change to crosshair
                // GeometryCopyHandler.activate() does: $('#map').css('cursor', 'crosshair')
                const mapCursor = await page.evaluate(
                    () => /** @type {HTMLElement} */ (document.querySelector('#map')).style.cursor,
                );
                expect(mapCursor).toBe('crosshair');

                // Cleanup: deactivate copy mode first, then cancel form, then delete feature
                await btn.click(); // toggle off
                await cancelEditForm(project);
                await deleteFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);
            });

        test('TC-08: Clicking the active button again toggles copy mode off',
            async ({ page }) => {
                const project = new ProjectPage(page, PROJECT);
                await project.open();

                const ids = await createFeature(
                    project, page,
                    LAYERS.polygon.name, 'polygon',
                    SRC_X, SRC_Y,
                    'tc08-source',
                );

                await openEditFormForFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);

                const btn = page.locator('lizmap-paste-geom button');

                // Activate
                await btn.click();
                await expect(btn).toHaveClass(/active/);

                // Deactivate by clicking again
                await btn.click();
                await expect(btn).not.toHaveClass(/active/);

                // Cursor must revert
                // GeometryCopyHandler.deactivate() does: $('#map').css('cursor', 'default')
                const mapCursor = await page.evaluate(
                    () => /** @type {HTMLElement} */ (document.querySelector('#map')).style.cursor,
                );
                expect(mapCursor).toBe('default');

                // Cleanup
                await cancelEditForm(project);
                await deleteFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);
            });

        test('TC-09: Closing the edition form deactivates copy mode',
            async ({ page }) => {
                const project = new ProjectPage(page, PROJECT);
                await project.open();

                const ids = await createFeature(
                    project, page,
                    LAYERS.polygon.name, 'polygon',
                    SRC_X, SRC_Y,
                    'tc09-source',
                );

                await openEditFormForFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);

                const btn = page.locator('lizmap-paste-geom button');

                // Activate copy mode
                await btn.click();
                await expect(btn).toHaveClass(/active/);

                // Cancel the form — this fires edition.formClosed which must deactivate copy mode
                await cancelEditForm(project);

                // After the form closes, copy mode must be off.
                // We can verify via the cursor on #map.
                const mapCursor = await page.evaluate(
                    () => /** @type {HTMLElement} */ (document.querySelector('#map')).style.cursor,
                );
                expect(mapCursor).toBe('default');

                // Cleanup
                await deleteFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);
            });
    });

// ---------------------------------------------------------------------------
// Test suite 3: Feature picker popup behaviour
// ---------------------------------------------------------------------------

test.describe('Copy-paste geometry — feature picker popup',
    { tag: ['@write'] }, () => {

        // test feature picker popup with all geometry types, includes tests for digitizing features
        [
            { editLayer: LAYERS.polygon, tcId: 'TC-11-p', label: 'tc11-p-source', displayName:'tc11-p-source-displayName', drawTestRecords:2},
            { editLayer: LAYERS.line, tcId: 'TC-11-l', label: 'tc11-l-source', displayName:'tc11-l-source', drawTestRecords:2 },
            { editLayer: LAYERS.point, tcId: 'TC-11-d', label: 'tc11-d-source', displayName:'1', drawTestRecords:1},
        ].forEach(({editLayer, tcId, label, displayName, drawTestRecords}) => {
            test(`${tcId}: Clicking on an existing ${editLayer.geomType} feature in copy mode shows the picker popup`,
                async ({ page }) => {
                    const project = new DrawPage(page, PROJECT);
                    await project.open();

                    // Create a source feature that will appear in the WMS GetFeatureInfo result
                    const srcIds = await createFeature(
                        project, page,
                        editLayer.name, editLayer.geomType,
                        SRC_X, SRC_Y,
                        label,
                    );

                    // Open its edit form (modify mode) to get layerId set
                    await openEditFormForFeature(project, SRC_X, SRC_Y, srcIds['id'], editLayer.id);

                    const btn = page.locator('lizmap-paste-geom button');
                    await btn.click(); // activate copy mode
                    await expect(btn).toHaveClass(/active/);

                    // Set up the GFI request waiter BEFORE clicking
                    const gfiRequestPromise = waitForCopyModeGFIRequest(page);

                    // Click on the map where the source feature lives
                    // GeometryCopyHandler._onMapClick fires → WMS GetFeatureInfo POST
                    await project.clickOnMapLegacy(SRC_X, SRC_Y);
                    // Wait for the WMS request to complete so the response is processed
                    await (await gfiRequestPromise).response();

                    // The feature picker popup must appear
                    const popup = page.locator('#feature-picker-popup');
                    await expect(popup).toBeVisible({ timeout: 5_000 });

                    // At least one feature row representing the source feature
                    // (may include features from previous failed test runs if cleanup didn't run)
                    await expect(popup.locator('.feature-row')).not.toHaveCount(0);

                    // Row must show the feature display name and the layer name
                    // Display name
                    await expect(
                        popup.locator('.feature-row', { hasText: `${displayName}` })
                    ).toHaveCount(1);
                    // Layer name
                    await expect(popup.locator('.feature-row td').first())
                        .toContainText(editLayer.name);

                    // hover on the row and check highlighted feature
                    await popup.locator('.feature-row td').first().hover();
                    await checkHighLightLayerFeature(project,editLayer.olGeomType);

                    // prepare UI for digitizing features
                    await popup.locator('.close-btn').click();
                    await cancelEditForm(project);

                    // add drawings
                    await project.openDrawPanel();

                    // draw point
                    await project.selectGeometry('point');
                    await drawDigitizingGeometry(project, 'point', SRC_X, SRC_Y);

                    // draw line 1
                    await project.selectGeometry('line');
                    await drawDigitizingGeometry(project, 'line', SRC_X, SRC_Y);
                    // draw line 1
                    await drawDigitizingGeometry(project, 'line', SRC_X, SRC_Y+3);

                    // draw circle
                    await project.selectGeometry('circle');
                    await drawDigitizingGeometry(project, 'circle', SRC_X, SRC_Y);

                    // draw polygon
                    await project.selectGeometry('polygon');
                    await drawDigitizingGeometry(project, 'polygon', SRC_X, SRC_Y);

                    await page.waitForTimeout(500);
                    await project.toggleSelectedTool()
                    await project.closeDrawPanel();

                    // Open edition again
                    await openEditFormForFeature(project, SRC_X, SRC_Y, srcIds['id'], editLayer.id);

                    await btn.click(); // activate copy mode
                    await expect(btn).toHaveClass(/active/);

                    // Click again on the same point and wait for a new popup request
                    await project.clickOnMapLegacy(SRC_X, SRC_Y);
                    await (await gfiRequestPromise).response();

                    // Test the same popup locator
                    await expect(popup).toBeVisible({ timeout: 5_000 });

                    // drawTestRecords is the number of digitizing feature expected in the popup
                    // we expect a total of drawTestRecords + 1 records
                    // for points, expect two total records, one for the map feature and one digitized feature
                    // for lines, expect three total records, one for the map feature and two digitized feature
                    // for polygon, expect three total records, one for the map feature and two from digitizing (one poligon and one circle)
                    await expect(popup.locator('.feature-row')).toHaveCount(drawTestRecords + 1);

                    const digitizinLayerName = await lizDictKey(page, 'edition.geom.copyPaste.digitizinLayerName');
                    const totalRecords = popup.locator('.feature-row');
                    // the map features records are always shown first, so we start from the second item in the list (i = 1)
                    for (let i = 1; i < drawTestRecords; i++) {
                        const digtizingRow = totalRecords.nth(i);
                        // Capitalize geometry name
                        const name = editLayer.geomType.charAt(0).toUpperCase() + editLayer.geomType.slice(1);

                        await expect(digtizingRow).toHaveText(`${name} ${i} ${digitizinLayerName}`);
                        await digtizingRow.hover();
                        // check highlight layer
                        await checkHighLightLayerFeature(project,editLayer.olGeomType);
                    }

                    // toggle current layer visibility to left only digitizing features available for query
                    await project.switcher.click();
                    await page.getByLabel(editLayer.name).uncheck();

                    // query map
                    await project.clickOnMapLegacy(SRC_X, SRC_Y);
                    await (await gfiRequestPromise).response();

                    // wait for feature-picker-popup
                    await expect(popup).toBeVisible({ timeout: 5_000 });

                    // in this case we expect exactly a number of records equal to drawTestRecords (no map features to query)
                    await expect(popup.locator('.feature-row')).toHaveCount(drawTestRecords);
                    const digitizingTotalRecords = popup.locator('.feature-row');

                    for (let i = 0; i < drawTestRecords; i++) {
                        const digtizingRow = digitizingTotalRecords.nth(i);
                        const name = editLayer.geomType.charAt(0).toUpperCase() + editLayer.geomType.slice(1);

                        await expect(digtizingRow).toHaveText(`${name} ${i+1} ${digitizinLayerName}`);
                        await digtizingRow.hover();
                        await checkHighLightLayerFeature(project,editLayer.olGeomType);
                    }

                    // Cleanup: cancel form, delete source
                    await page.getByLabel(editLayer.name).check();
                    await project.buttonEditing.click();
                    await cancelEditForm(project);
                    await deleteFeature(project, SRC_X, SRC_Y, srcIds['id'], editLayer.id);
                });
        })

        test('TC-12: Clicking on an empty area in copy mode does not show the picker popup',
            async ({ page }) => {
                const project = new ProjectPage(page, PROJECT);
                await project.open();

                const ids = await createFeature(
                    project, page,
                    LAYERS.polygon.name, 'polygon',
                    SRC_X, SRC_Y,
                    'tc12-source',
                );

                await openEditFormForFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);

                const btn = page.locator('lizmap-paste-geom button');
                await btn.click();
                await expect(btn).toHaveClass(/active/);

                // Wait for the GFI request triggered by the empty-area click so we can
                // assert after the full async pipeline has run.
                const gfiRequestPromise = waitForCopyModeGFIRequest(page);

                // Click a corner far from any drawn feature
                await project.clickOnMapLegacy(EMPTY_X, EMPTY_Y);

                const gfiRequest = await gfiRequestPromise;
                await gfiRequest.response();

                // No picker popup must appear
                await expect(page.locator('#feature-picker-popup')).toHaveCount(0);

                // Copy mode must remain active if no features was found
                await expect(btn).toHaveClass(/active/);

                // Cleanup
                await cancelEditForm(project);
                await deleteFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);
            });

        test('TC-15: The close button (×) on the picker popup dismisses it without applying geometry',
            async ({ page }) => {
                const project = new ProjectPage(page, PROJECT);
                await project.open();

                const srcIds = await createFeature(
                    project, page,
                    LAYERS.polygon.name, 'polygon',
                    SRC_X, SRC_Y,
                    'tc15-source',
                );

                await openEditFormForFeature(project, SRC_X, SRC_Y, srcIds['id'], LAYERS.polygon.id);

                const btn = page.locator('lizmap-paste-geom button');
                await btn.click();
                await expect(btn).toHaveClass(/active/);

                const gfiRequestPromise = waitForCopyModeGFIRequest(page);
                await project.clickOnMapLegacy(SRC_X, SRC_Y);
                const gfiReq = await gfiRequestPromise;
                await gfiReq.response();

                const popup = page.locator('#feature-picker-popup');
                await expect(popup).toBeVisible({ timeout: 5_000 });

                // Click the × close button
                await popup.locator('.close-btn').click();

                // Popup must be removed from DOM
                await expect(popup).toHaveCount(0);

                // Copy mode must remain active (user dismissed popup without selecting)
                await expect(btn).toHaveClass(/active/);

                // Cleanup
                await btn.click(); // deactivate copy mode
                await cancelEditForm(project);
                await deleteFeature(project, SRC_X, SRC_Y, srcIds['id'], LAYERS.polygon.id);
            });

        test('TC-16: Clicking outside the picker popup dismisses it',
            async ({ page }) => {
                const project = new ProjectPage(page, PROJECT);
                await project.open();

                const srcIds = await createFeature(
                    project, page,
                    LAYERS.polygon.name, 'polygon',
                    SRC_X, SRC_Y,
                    'tc16-source',
                );

                await openEditFormForFeature(project, SRC_X, SRC_Y, srcIds['id'], LAYERS.polygon.id);

                const btn = page.locator('lizmap-paste-geom button');
                await btn.click();
                await expect(btn).toHaveClass(/active/);

                const gfiRequestPromise = waitForCopyModeGFIRequest(page);
                await project.clickOnMapLegacy(SRC_X, SRC_Y);
                const gfiReq = await gfiRequestPromise;
                await gfiReq.response();

                await expect(page.locator('#feature-picker-popup')).toBeVisible({ timeout: 5_000 });

                // Click on the header menu — it is always visible, outside both the map
                // and the popup, and does not trigger another copy query.
                // The document click handler in FeaturePickerPopup closes the popup for
                // any click whose target is not inside #feature-picker-popup.
                await page.locator('#headermenu').click({ position: { x: 5, y: 5 } });

                await expect(page.locator('#feature-picker-popup')).toHaveCount(0);

                // Cleanup
                await btn.click(); // copy mode may still be active — toggle off
                await cancelEditForm(project);
                await deleteFeature(project, SRC_X, SRC_Y, srcIds['id'], LAYERS.polygon.id);
            });
    });

// ---------------------------------------------------------------------------
// Test suite 4: Geometry type filtering
// ---------------------------------------------------------------------------

test.describe('Copy-paste geometry — geometry type filtering',
    { tag: ['@write'] }, () => {

        /**
         * Incompatible geometry combinations where the editing layer is either polygon, line or point.
         * Each combination must produce: no picker popup + auto-deactivation of copy mode.
         */
        [
            { editLayer: LAYERS.polygon, srcLayer: LAYERS.point,  tcId: 'TC-17a' },
            { editLayer: LAYERS.polygon, srcLayer: LAYERS.line,   tcId: 'TC-17b' },
            { editLayer: LAYERS.line, srcLayer: LAYERS.polygon,   tcId: 'TC-17c' },
            { editLayer: LAYERS.line, srcLayer: LAYERS.point,   tcId: 'TC-17d' },
            { editLayer: LAYERS.point, srcLayer: LAYERS.line,   tcId: 'TC-17e' },
            { editLayer: LAYERS.point, srcLayer: LAYERS.polygon,   tcId: 'TC-17f' },
        ].forEach(({ editLayer, srcLayer, tcId }) => {

            test(`${tcId}: editing ${editLayer.geomType} layer — ${srcLayer.geomType} source is filtered out`,
                async ({ page }) => {
                    const project = new DrawPage(page, PROJECT);
                    await project.open();

                    // Create the incompatible source feature at SRC position
                    const srcIds = await createFeature(
                        project, page,
                        srcLayer.name, srcLayer.geomType,
                        SRC_X, SRC_Y,
                        `${tcId}-src`,
                    );

                    // Create the feature we will edit at TGT position
                    const editIds = await createFeature(
                        project, page,
                        editLayer.name, editLayer.geomType,
                        TGT_X, TGT_Y,
                        `${tcId}-edit`,
                    );

                    // Open the edit feature's form (modify mode → layerId set)
                    await openEditFormForFeature(
                        project, TGT_X, TGT_Y, editIds['id'], editLayer.id,
                    );

                    const btn = page.locator('lizmap-paste-geom button');
                    await btn.click();
                    await expect(btn).toHaveClass(/active/);

                    // Click at the source feature position.
                    // WMS returns the source feature but _geometryTypesMatch() filters it out
                    // because source.geomType ≠ editLayer.geomType.
                    const gfiRequestPromise = waitForCopyModeGFIRequest(page);
                    await project.clickOnMapLegacy(SRC_X, SRC_Y);
                    await (await gfiRequestPromise).response();

                    // No picker popup — all features were filtered out
                    await expect(page.locator('#feature-picker-popup')).toHaveCount(0);

                    // Copy mode must remain active if no features was found
                    await expect(btn).toHaveClass(/active/);
                    const message = page.locator('#lizmap-copy-geometry-message');
                    await expect(message).toHaveClass(/alert-info/);

                    // dismiss alert to speed up tests
                    await message.locator('.btn-close').click();

                    await cancelEditForm(project);

                    // test drawings
                    await project.openDrawPanel();

                    // create a digitizing feature with incompatible geometry
                    await project.selectGeometry(srcLayer.geomType);
                    await drawDigitizingGeometry(project, srcLayer.geomType, SRC_X, SRC_Y);
                    await page.waitForTimeout(500);
                    await project.toggleSelectedTool()
                    await project.closeDrawPanel();

                    // Open the edit feature's form (modify mode → layerId set)
                    await openEditFormForFeature(
                        project, TGT_X, TGT_Y, editIds['id'], editLayer.id,
                    );

                    await btn.click();
                    await expect(btn).toHaveClass(/active/);

                    await project.clickOnMapLegacy(SRC_X, SRC_Y);
                    await (await gfiRequestPromise).response();

                    // No picker popup — all features were filtered out
                    await expect(page.locator('#feature-picker-popup')).toHaveCount(0);

                    // Copy mode must remain active if no features was found
                    await expect(btn).toHaveClass(/active/);

                    // Cleanup
                    await cancelEditForm(project);
                    await deleteFeature(project, TGT_X, TGT_Y, editIds['id'], editLayer.id);
                    await deleteFeature(project, SRC_X, SRC_Y, srcIds['id'], srcLayer.id);
                });
        });
    });

// ---------------------------------------------------------------------------
// Test suite 5: Full copy-paste workflow (happy path)
// ---------------------------------------------------------------------------

test.describe('Copy-paste geometry — full copy workflow',
    { tag: ['@write'] }, () => {

        /**
         * Creates a source feature for full workflow test.
         * Creates a digitizing feature or a map feature, depending on 'digitizing' boolean parameter
         *
         * @param {DrawPage} project
         * @param {import('@playwright/test').Page} page
         * @param {string} layerName
         * @param {string} geomType
         * @param {number} x
         * @param {number} y
         * @param {string} label
         * @param {boolean} digitizing
         * @returns {Promise<{id: string}>}
         */
        async function createSourceFeature(project, page, layerName, geomType, x, y, label, digitizing){
            if (digitizing) {
                // open digitizing panel
                await project.openDrawPanel();

                // digitize source geometry
                await project.selectGeometry(geomType);
                await drawDigitizingGeometry(project, geomType, SRC_X, SRC_Y);
                await page.waitForTimeout(500);
                await project.toggleSelectedTool()
                await project.closeDrawPanel();
                // mock id, it's not really needed for testing digitizing features
                return {id:'1'}
            } else {
                return await createFeature(
                    project, page,
                    layerName, geomType,
                    x, y,
                    label,
                );
            }
        }

        /**
         * Core workflow test used for point / line / polygon.
         *
         * Strategy:
         *   1. Create source feature (map or digitizing) S at (SRC_X, SRC_Y) — geometry to copy FROM.
         *   2. Create target feature T at (TGT_X, TGT_Y) — will receive S's geometry.
         *   3. Open T's edit form (modify mode → layerId set → button enabled).
         *   4. Activate copy mode → click at S's position → picker popup.
         *   5. Select S from picker → geometry applied → copy mode deactivates.
         *   6. Submit T's form.
         *   7. Verify T was saved (editedFeatureIds reports a valid ID).
         *   8. Clean up S and T.
         *
         * @param {import('@playwright/test').Page} page
         * @param {string} layerName
         * @param {string} layerId
         * @param {'point'|'line'|'polygon'} geomType
         * @param {boolean} digitizing
         */
        async function runFullWorkflowTest(page, layerName, layerId, geomType, digitizing) {
            const project = new DrawPage(page, PROJECT);
            await project.open();

            const srcIds = await createSourceFeature(
                project, page,
                layerName, geomType,
                SRC_X, SRC_Y,
                'workflow-source',
                digitizing
            );

            // Step 2: create target feature T
            const tgtIds = await createFeature(
                project, page,
                layerName, geomType,
                TGT_X, TGT_Y,
                'workflow-target',
            );

            // Step 3: open T's edit form in modify mode
            await openEditFormForFeature(project, TGT_X, TGT_Y, tgtIds['id'], layerId);

            // Step 4: activate copy mode
            const btn = page.locator('lizmap-paste-geom button');
            await expect(btn).not.toBeDisabled();
            await btn.click();
            await expect(btn).toHaveClass(/active/);

            // Step 5a: click at S's position to trigger WMS GetFeatureInfo
            const gfiRequestPromise = waitForCopyModeGFIRequest(page);
            await project.clickOnMapLegacy(SRC_X, SRC_Y);
            const gfiReq = await gfiRequestPromise;
            await gfiReq.response();

            // Step 5b: picker popup must appear with at least one feature row
            const popup = page.locator('#feature-picker-popup');
            await expect(popup).toBeVisible({ timeout: 5_000 });
            await expect(popup.locator('.feature-row')).not.toHaveCount(0);

            // Step 5c: click the first feature row to select S's geometry
            await popup.locator('.feature-row').first().click();

            // After selection: popup is gone and copy mode deactivates automatically
            await expect(popup).toHaveCount(0);
            await expect(btn).not.toHaveClass(/active/);

            // Step 6: switch back to form tab and submit
            // (editingSubmitForm targets #tabform, which is inactive after digitization tab use)
            await page.locator('.edition-tabs button[data-bs-target="#tabform"]').click();
            await project.editingSubmitForm();

            // Step 7: verify the save was acknowledged (IDs are returned)
            const savedIds = await editedFeatureIds(page);
            expect(savedIds['id']).toBeTruthy();
            // The feature ID must be T's ID (same feature was updated, not a new one created)
            expect(String(savedIds['id'])).toBe(String(tgtIds['id']));

            // Step 8: cleanup — delete T (now at SRC position) and S
            // Both may now share the same geometry location; use IDs to target each.
            await deleteFeature(project, SRC_X, SRC_Y, tgtIds['id'], layerId);
            // remove only source map feature
            if (!digitizing)
                await deleteFeature(project, SRC_X, SRC_Y, srcIds['id'], layerId);
        }

        // Test full workflow with all geometry types
        [
            {editLayer:LAYERS.polygon, tcId: 'TC-21-p'},
            {editLayer:LAYERS.line, tcId: 'TC-21-l'},
            {editLayer:LAYERS.point, tcId: 'TC-21-d'},
            {editLayer:LAYERS.polygon, tcId: 'TC-22-p', digitizing:true},
            {editLayer:LAYERS.line, tcId: 'TC-22-l', digitizing:true},
            {editLayer:LAYERS.point, tcId: 'TC-22-d', digitizing:true},
        ].forEach(({editLayer, tcId, digitizing})=>{
            const geomType = editLayer.geomType.toUpperCase();
            test(`${tcId}: Full workflow — copy ${digitizing ? 'digitized':''} ${geomType} geometry and save`, async ({ page }) => {
                await runFullWorkflowTest(
                    page,
                    editLayer.name,
                    editLayer.id,
                    editLayer.geomType,
                    digitizing
                );
            });
        })
    });

// ---------------------------------------------------------------------------
// Test suite 6: Edge cases
// ---------------------------------------------------------------------------

test.describe('Copy-paste geometry — edge cases',
    { tag: ['@write'] }, () => {

        test('TC-31: Re-activating copy mode after a cancelled pick (close popup) still works',
            async ({ page }) => {
                const project = new ProjectPage(page, PROJECT);
                await project.open();

                const srcIds = await createFeature(
                    project, page,
                    LAYERS.polygon.name, 'polygon',
                    SRC_X, SRC_Y,
                    'tc31-source',
                );

                await openEditFormForFeature(project, SRC_X, SRC_Y, srcIds['id'], LAYERS.polygon.id);

                const btn = page.locator('lizmap-paste-geom button');

                // ---- First activation: open popup and cancel it ----
                await btn.click();
                await expect(btn).toHaveClass(/active/);

                const gfi1Promise = waitForCopyModeGFIRequest(page);
                await project.clickOnMapLegacy(SRC_X, SRC_Y);
                await (await gfi1Promise).response();

                const popup = page.locator('#feature-picker-popup');
                await expect(popup).toBeVisible({ timeout: 5_000 });

                // Close without selecting
                await popup.locator('.close-btn').click();
                await expect(popup).toHaveCount(0);
                // Copy mode remains active after close-without-select
                await expect(btn).toHaveClass(/active/);

                // ---- Second activation: same click position, should work again ----
                const gfi2Promise = waitForCopyModeGFIRequest(page);
                await project.clickOnMapLegacy(SRC_X, SRC_Y);
                await (await gfi2Promise).response();

                await expect(popup).toBeVisible({ timeout: 5_000 });
                // Successfully select the feature this time
                await popup.locator('.feature-row').first().click();

                await expect(popup).toHaveCount(0);
                await expect(btn).not.toHaveClass(/active/);

                // Switch back to form tab before submitting
                await page.locator('.edition-tabs button[data-bs-target="#tabform"]').click();
                await project.editingSubmitForm();
                const savedIds = await editedFeatureIds(page);
                expect(savedIds['id']).toBeTruthy();
                await deleteFeature(project, SRC_X, SRC_Y, srcIds['id'], LAYERS.polygon.id);
            });

        test('TC-32: Rapid double-click on copy button ends in a consistent (inactive) state',
            async ({ page }) => {
                const project = new ProjectPage(page, PROJECT);
                await project.open();

                const ids = await createFeature(
                    project, page,
                    LAYERS.polygon.name, 'polygon',
                    SRC_X, SRC_Y,
                    'tc32-source',
                );

                await openEditFormForFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);

                const btn = page.locator('lizmap-paste-geom button');

                // Two rapid sequential clicks should toggle on then off
                await btn.click();
                await btn.click();

                // After an even number of clicks, copy mode must be inactive
                await expect(btn).not.toHaveClass(/active/);

                const mapCursor = await page.evaluate(
                    () => /** @type {HTMLElement} */ (document.querySelector('#map')).style.cursor,
                );
                expect(mapCursor).toBe('default');

                // Cleanup
                await cancelEditForm(project);
                await deleteFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);
            });
    });

// ---------------------------------------------------------------------------
// Test suite 7: User-facing messages routed through GeometryCopyHandler._notify
// ---------------------------------------------------------------------------
//
// _notify (assets/src/modules/GeometryCopyHandler.js) is the single entry
// point for every status message the copy workflow shows the user
// ("No compatible features found", "Geometry copied successfully", etc.).
// It guarantees two invariants:
//
//   1. Each call inserts an alert with id="lizmap-copy-geometry-message" so
//      the element is uniquely addressable.
//   2. Any previous element with that id is removed BEFORE the new one is
//      added, so multiple successive calls never stack visible alerts.
//
// Without that dedup, repeated map clicks in copy mode would pile up alerts
// in the #message container (lizMap.addMessage just appends), which was the
// original bug reported on PR #6405.
//
// Both tests below exercise the same trigger path — clicking on an empty area
// while copy mode is active fires the "no compatible features found" branch —
// because it is the easiest deterministic way to invoke _notify from the UI.

test.describe('Copy-paste geometry — user-facing messages (_notify)',
    { tag: ['@write'] }, () => {

        test('TC-40: clicking on an empty area in copy mode displays #lizmap-copy-geometry-message',
            async ({ page }) => {
                const project = new ProjectPage(page, PROJECT);
                await project.open();

                // Need an existing feature so we can enter modify mode (button enabled)
                const ids = await createFeature(
                    project, page,
                    LAYERS.polygon.name, 'polygon',
                    SRC_X, SRC_Y,
                    'tc40-source',
                );

                await openEditFormForFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);

                // Make sure no stale copy-workflow message is leftover from a previous test
                await expect(page.locator('#lizmap-copy-geometry-message')).toHaveCount(0);

                const btn = page.locator('lizmap-paste-geom button');
                await btn.click();
                await expect(btn).toHaveClass(/active/);

                // Click on a corner where no test feature exists — the WMS response
                // will be empty so GeometryCopyHandler._handleWMSResponse goes through
                // the "no compatible features" branch and calls _notify(...).
                const gfiRequestPromise = waitForCopyModeGFIRequest(page);
                await project.clickOnMapLegacy(EMPTY_X, EMPTY_Y);
                await (await gfiRequestPromise).response();

                // The message element must exist, be visible, and carry the
                // dedicated id used by _notify so the dedup logic can target it.
                const message = page.locator('#lizmap-copy-geometry-message');
                await expect(message).toHaveCount(1);
                await expect(message).toBeVisible();

                // The displayed text must match either the translated lizDict entry
                // or the English fallback hard-coded in GeometryCopyHandler.
                const liz = await lizDictKey(page, 'edition.geom.copyPaste.noCompatibleFeatures');
                const expectedText = liz ?? 'No compatible features found at this location';
                await expect(message).toContainText(expectedText);

                // The alert uses the Bootstrap info style ("alert-info") as
                // requested by _notify(message, 'info').
                await expect(message).toHaveClass(/alert-info/);

                // Cleanup
                await cancelEditForm(project);
                await deleteFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);
            });

        test('TC-41: successive _notify calls do not stack — only one #lizmap-copy-geometry-message at any time',
            async ({ page }) => {
                const project = new ProjectPage(page, PROJECT);
                await project.open();

                const ids = await createFeature(
                    project, page,
                    LAYERS.polygon.name, 'polygon',
                    SRC_X, SRC_Y,
                    'tc41-source',
                );

                await openEditFormForFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);

                // dismiss edition message leaving only the "lizmap-copy-geometry-message" notification,
                // to ensure a clean interface for subsequent activations/deactivations of the copy feature.
                await page.locator('#lizmap-edition-message .btn-close').click();

                const btn = page.locator('lizmap-paste-geom button');
                const message = page.locator('#lizmap-copy-geometry-message');

                // ---- First _notify call ----
                // Activate copy mode → click empty area → _notify fires once.
                await btn.click();
                await expect(btn).toHaveClass(/active/);

                const gfi1Promise = waitForCopyModeGFIRequest(page);
                await project.clickOnMapLegacy(EMPTY_X, EMPTY_Y);
                await (await gfi1Promise).response();

                await expect(message).toHaveCount(1);

                // Capture a unique handle to the first message DOM node so we can
                // prove it was removed (and not merely the same element re-rendered)
                // when the second _notify call fires.
                const firstMessageHandle = await message.elementHandle();
                expect(firstMessageHandle).not.toBeNull();

                // GeometryCopyHandler remains active when no feature matches
                await expect(btn).toHaveClass(/active/);

                // ---- Second _notify call ----
                // disable copy handler and re-enable it
                await btn.click();
                await expect(btn).not.toHaveClass(/active/);
                await page.waitForTimeout(200);
                await btn.click();
                await expect(btn).toHaveClass(/active/);

                const gfi2Promise = waitForCopyModeGFIRequest(page);
                await project.clickOnMapLegacy(EMPTY_X, EMPTY_Y);
                await (await gfi2Promise).response();

                // After the second call the count must still be exactly 1:
                // _notify removes the previous element before appending a new one.
                await expect(message).toHaveCount(1);
                await expect(message).toBeVisible();

                // The first node must no longer be connected to the DOM, which
                // confirms it was explicitly removed (not just hidden behind a
                // sibling) by the _notify dedup logic.
                const firstStillConnected = await firstMessageHandle?.evaluate(
                    el => el.isConnected,
                );
                expect(firstStillConnected).toBe(false);

                // Cleanup
                await cancelEditForm(project);
                await deleteFeature(project, SRC_X, SRC_Y, ids['id'], LAYERS.polygon.id);
            });
    });

test.describe('Check copy handler on 4326 project for axis orientation adjustment',
    { tag: ['@write'] }, () => {

        [
            { editLayer: LAYERS_4326.point, label:'4326_point' },
            { editLayer: LAYERS_4326.line, label:'4326_line' },
            { editLayer: LAYERS_4326.polygon, label:'4326_polygon' },
        ].forEach(({editLayer, label})=>{
            test(`Check getFeatureInfo WMS request for 4326 ${editLayer.geomType.toUpperCase()} feature`,
                async ({ page }) => {

                    // change project projection, bbox and initial extent on the fly
                    await page.route('**/service/getProjectConfig*', async route => {
                        const response = await route.fetch();
                        const json = await response.json();

                        // change projection
                        json.options.projection = {
                            proj4: "+proj=longlat +datum=WGS84 +no_defs",
                            ref: "EPSG:4326"
                        }

                        // change bbox
                        json.options.bbox = [
                            "-6.76292745900000014",
                            "36.02200815300000158",
                            "20.54463446100000112",
                            "55.98576099299999953",
                        ]

                        // change initialExtent
                        json.options.initialExtent = [
                            -6.762927459,
                            36.022008153,
                            20.544634461,
                            55.985760993,
                        ]

                        await route.fulfill({ response, json });
                    });

                    const project = new ProjectPage(page, PROJECT);
                    await project.open();

                    // create a new 4326 feature
                    const srcIds = await createFeature(
                        project, page,
                        editLayer.name, editLayer.geomType,
                        SRC_X, SRC_Y,
                        label,
                    );

                    await openEditFormForFeature(project, SRC_X, SRC_Y, srcIds['id'], editLayer.id);

                    const btn = page.locator('lizmap-paste-geom button');
                    await btn.click(); // activate copy mode
                    await expect(btn).toHaveClass(/active/);

                    const gfiRequestPromise = waitForCopyModeGFIRequest(page);

                    // Click on the map
                    await project.clickOnMapLegacy(SRC_X, SRC_Y);

                    // Wait for the WMS GetFeatureInfo request
                    const gfiRequest = await gfiRequestPromise;

                    // check GetFeatureInfo parameters. BBOX should be issued with lat/long format
                    const expectedParameters = {
                        'SERVICE': 'WMS',
                        'VERSION': '1.3.0',
                        'REQUEST': 'GetFeatureInfo',
                        'QUERY_LAYERS': 'polygon_2154,line_2154,point_2154,polygon_4326,line_4326,point_4326,polygon_3857,line_3857,point_3857',
                        'STYLE':'default,default,default,default,default,default,default,default,default',
                        'INFO_FORMAT':'text/html',
                        'CRS': 'EPSG:4326',
                        'BBOX': /39.1582\d+,-3.4668\d+,52.8495\d+,17.2485\d+/,
                    }
                    requestExpect(gfiRequest).toContainParametersInPostData(expectedParameters);
                    await gfiRequest.response();

                    // delete feature
                    await cancelEditForm(project);
                    await deleteFeature(project, SRC_X, SRC_Y, srcIds['id'], editLayer.id);
                })
        })
    })

/**
 * Read a lizDict translation entry from the running page so the assertion
 * works regardless of the locale the browser was started with. Falls back to
 * undefined if the key is not present, letting the caller use a hard-coded
 * English string instead.
 *
 * @param {import('@playwright/test').Page} page - Playwright page handle
 * @param {string} key - lizDict key, e.g. 'edition.geom.copyPaste.noCompatibleFeatures'
 * @returns {Promise<string|undefined>} The translated value or undefined when the key is missing
 */
async function lizDictKey(page, key) {
    return await page.evaluate(
        k => /** @type {Record<string,string>} */
            (globalThis['lizDict'] ?? {})[k],
        key,
    );
}
