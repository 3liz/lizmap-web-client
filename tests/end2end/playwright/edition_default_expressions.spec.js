// @ts-check
/**
 * E2E tests for dynamic QGIS default-value expressions in edit forms.
 *
 * Fixture requirement: a QGIS project named "edition_default_expressions" in
 * the testsrepository, containing a point layer "default_expr_points" with:
 *   - field "point_x"   : QGIS default expression "$x"  (applyOnUpdate=false)
 *   - field "firstname" : no default
 *   - field "lastname"  : no default
 *   - field "full_name" : QGIS default expression '"firstname" || \' \' || "lastname"'
 *                         (applyOnUpdate=true)
 *
 * Until that fixture exists, all three scenarios are wrapped in test.fixme().
 * See PR description for the QGIS project file to add under
 * tests/qgis-projects/tests/edition_default_expressions.qgs (+ .cfg).
 */
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';

const PROJECT = 'edition_default_expressions';
const LAYER_NAME = 'default_expr_points';

test.describe('Edition — dynamic QGIS default-value expressions',
    {
        tag: ['@write'],
    }, () => {

        /**
         * Scenario 1 — geometry-based default ($x)
         *
         * After drawing a point, the field whose QGIS default is "$x" must be
         * auto-filled with the X coordinate of the drawn point.
         */
        test('geometry-based default ($x) fills point_x after drawing', async ({ page }) => {
            test.fixme(true, 'Requires fixture project edition_default_expressions — see PR description for the .qgs/.cfg files to add');

            const project = new ProjectPage(page, PROJECT);
            await project.open();

            const formRequest = await project.openEditingFormWithLayer(LAYER_NAME);
            await formRequest.response();

            // Click on the map to draw a point; coordinates are in map pixels.
            // The exact coordinate value depends on the map projection / extent;
            // we only assert the field is non-empty and numeric after drawing.
            const mapX = 450;
            const mapY = 325;

            // Wait for the evaluateDefaults AJAX response after geometry is set
            const evalPromise = page.waitForResponse(/evaluateDefaults/);
            await project.clickOnMapLegacy(mapX, mapY);
            await evalPromise;

            const pointXInput = project.editionForm.locator('input[name="point_x"]');
            const value = await pointXInput.inputValue();
            expect(value, 'point_x must be auto-filled with a numeric X coordinate').not.toBe('');
            expect(Number.isFinite(Number(value)), `point_x value "${value}" must be a finite number`).toBe(true);
        });

        /**
         * Scenario 2 — field-referencing default (concat of firstname + lastname)
         *
         * Typing into "firstname" and "lastname" triggers a re-evaluation; the
         * "full_name" field (default '"firstname" || \' \' || "lastname"',
         * applyOnUpdate=true) must show "Jane Doe".
         */
        test('field-referencing default fills full_name from firstname + lastname', async ({ page }) => {
            test.fixme(true, 'Requires fixture project edition_default_expressions — see PR description for the .qgs/.cfg files to add');

            const project = new ProjectPage(page, PROJECT);
            await project.open();

            const formRequest = await project.openEditingFormWithLayer(LAYER_NAME);
            await formRequest.response();

            // Fill firstname — triggers dependency re-evaluation
            const evalAfterFirstname = page.waitForResponse(/evaluateDefaults/);
            await project.fillEditionFormTextInput('firstname', 'Jane');
            await project.editionForm.locator('input[name="firstname"]').blur();
            await evalAfterFirstname;

            // Fill lastname — triggers another re-evaluation
            const evalAfterLastname = page.waitForResponse(/evaluateDefaults/);
            await project.fillEditionFormTextInput('lastname', 'Doe');
            await project.editionForm.locator('input[name="lastname"]').blur();
            await evalAfterLastname;

            await expect(
                project.editionForm.locator('input[name="full_name"]'),
                'full_name must be auto-filled with "Jane Doe"'
            ).toHaveValue('Jane Doe');
        });

        /**
         * Scenario 3 — applyOnUpdate=false vs applyOnUpdate=true on modify
         *
         * When editing an existing feature:
         *  - "full_name" (applyOnUpdate=true) must recompute when "firstname" changes.
         *  - "point_x"   (applyOnUpdate=false) must NOT change when "firstname" changes.
         */
        test('applyOnUpdate=false preserves value while applyOnUpdate=true recomputes on modify', async ({ page }) => {
            test.fixme(true, 'Requires fixture project edition_default_expressions — see PR description for the .qgs/.cfg files to add');

            const project = new ProjectPage(page, PROJECT);
            await project.open();

            // First create a feature so we have something to edit.
            const createFormRequest = await project.openEditingFormWithLayer(LAYER_NAME);
            await createFormRequest.response();

            await project.fillEditionFormTextInput('firstname', 'Alice');
            await project.fillEditionFormTextInput('lastname', 'Smith');
            await project.clickOnMapLegacy(450, 325);
            await project.editingSubmitForm();

            // Re-open the feature for editing (via the popup edit button).
            // Capture the current point_x value before any change.
            await project.clickOnMap(450, 325);
            const editBtn = project.popupContent.locator('.feature-edit').first();
            const editFeaturePromise = page.waitForRequest(/lizmap\/edition\/editFeature/);
            await editBtn.click();
            await editFeaturePromise;

            const originalPointX = await project.editionForm
                .locator('input[name="point_x"]')
                .inputValue();

            // Change firstname — triggers re-evaluation
            const evalPromise = page.waitForResponse(/evaluateDefaults/);
            await project.fillEditionFormTextInput('firstname', 'Mary');
            await project.editionForm.locator('input[name="firstname"]').blur();
            await evalPromise;

            // full_name (applyOnUpdate=true) must recompute
            await expect(
                project.editionForm.locator('input[name="full_name"]'),
                'full_name must recompute to "Mary Smith"'
            ).toHaveValue('Mary Smith');

            // point_x (applyOnUpdate=false) must stay unchanged
            const newPointX = await project.editionForm
                .locator('input[name="point_x"]')
                .inputValue();
            expect(newPointX, 'point_x must not change on attribute edit (applyOnUpdate=false)').toBe(originalPointX);
        });
    }
);
