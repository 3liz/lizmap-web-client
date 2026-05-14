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
    },
    line: {
        name: 'line_2154',
        id: 'form_edition_line_2154_8797dd9f_d762_436f_91b6_1f06a37e9cf3',
        geomType: 'line',
    },
    polygon: {
        name: 'polygon_2154',
        id: 'form_edition_polygon_2154_6b836ded_12c4_44ee_a6c4_44bf0a0d349e',
        geomType: 'polygon',
    },
};

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

        test('TC-11: Clicking on an existing feature in copy mode shows the picker popup',
            async ({ page }) => {
                const project = new ProjectPage(page, PROJECT);
                await project.open();

                // Create a source polygon that will appear in the WMS GetFeatureInfo result
                const srcIds = await createFeature(
                    project, page,
                    LAYERS.polygon.name, 'polygon',
                    SRC_X, SRC_Y,
                    'tc11-source',
                );

                // Open its edit form (modify mode) to get layerId set
                await openEditFormForFeature(project, SRC_X, SRC_Y, srcIds['id'], LAYERS.polygon.id);

                const btn = page.locator('lizmap-paste-geom button');
                await btn.click(); // activate copy mode
                await expect(btn).toHaveClass(/active/);

                // Set up the GFI request waiter BEFORE clicking
                const gfiRequestPromise = waitForCopyModeGFIRequest(page);

                // Click on the map where the source feature lives
                // GeometryCopyHandler._onMapClick fires → WMS GetFeatureInfo POST
                await project.clickOnMapLegacy(SRC_X, SRC_Y);

                // Wait for the WMS request to complete so the response is processed
                const gfiRequest = await gfiRequestPromise;
                await gfiRequest.response();

                // The feature picker popup must appear
                const popup = page.locator('#feature-picker-popup');
                await expect(popup).toBeVisible({ timeout: 5_000 });

                // At least one feature row representing the source polygon
                // (may include features from previous failed test runs if cleanup didn't run)
                await expect(popup.locator('.feature-row')).not.toHaveCount(0);

                // Row must show the layer name
                await expect(popup.locator('.feature-row td').first())
                    .toContainText(LAYERS.polygon.name);

                // Cleanup: close popup, cancel form, delete source
                await popup.locator('.close-btn').click();
                await cancelEditForm(project);
                await deleteFeature(project, SRC_X, SRC_Y, srcIds['id'], LAYERS.polygon.id);
            });

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

                // Copy mode must have been deactivated automatically
                // (GeometryCopyHandler calls deactivate() when no features found)
                await expect(btn).not.toHaveClass(/active/);

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
         * Incompatible geometry combinations where the editing layer is polygon.
         * Copy-paste geometry currently only supports polygons, so we only test
         * polygon editing layer vs point/line sources.
         *
         * Each combination must produce: no picker popup + auto-deactivation of copy mode.
         */
        [
            { editLayer: LAYERS.polygon, srcLayer: LAYERS.point,  tcId: 'TC-17a' },
            { editLayer: LAYERS.polygon, srcLayer: LAYERS.line,   tcId: 'TC-17b' },
        ].forEach(({ editLayer, srcLayer, tcId }) => {

            test(`${tcId}: editing ${editLayer.geomType} layer — ${srcLayer.geomType} source is filtered out`,
                async ({ page }) => {
                    const project = new ProjectPage(page, PROJECT);
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

                    // Copy mode must have deactivated automatically
                    await expect(btn).not.toHaveClass(/active/);

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
         * Core workflow test used for point / line / polygon.
         *
         * Strategy:
         *   1. Create source feature S at (SRC_X, SRC_Y) — geometry to copy FROM.
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
         */
        async function runFullWorkflowTest(page, layerName, layerId, geomType) {
            const project = new ProjectPage(page, PROJECT);
            await project.open();

            // Step 1: create source feature S
            const srcIds = await createFeature(
                project, page,
                layerName, geomType,
                SRC_X, SRC_Y,
                'workflow-source',
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
            await deleteFeature(project, SRC_X, SRC_Y, srcIds['id'], layerId);
        }

        test('TC-21: Full workflow — copy POLYGON geometry and save', async ({ page }) => {
            await runFullWorkflowTest(
                page,
                LAYERS.polygon.name,
                LAYERS.polygon.id,
                'polygon',
            );
        });
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
