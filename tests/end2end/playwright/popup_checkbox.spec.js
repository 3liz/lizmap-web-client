// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Tests that fields configured with a QGIS CheckBox edit widget are rendered
 * as disabled <input type="checkbox"> elements in the popup, rather than as
 * their raw stored values.
 *
 * The tests call the Lizmap service endpoint directly with a tight BBOX so
 * each request selects exactly one feature, avoiding the ambiguity of
 * pixel-coordinate-based map clicks.
 *
 * Prerequisites:
 *   - table tests_projects.form_advanced_point must contain at least two rows:
 *       id=1  has_photo=true  (X=770598.69, Y=6279391.36  EPSG:2154)
 *       id=2  has_photo=false (X=770598.69, Y=6279678.56  EPSG:2154)
 *   - The form_advanced project config must have popup=True for form_advanced_point.
 *   Both are set up in tests_dataset_data.sql and form_advanced.qgs.cfg.
 */
test.describe('Popup CheckBox widget rendering',
    {
        tag: ['@requests', '@readonly'],
    },
    () => {

        /**
         * Build service URL parameters for a GetFeatureInfo request targeting
         * the form_advanced_point layer. The BBOX is centred on the given
         * Lambert-93 coordinates with a ±100 m buffer (200 m × 200 m box),
         * which is tight enough to isolate individual features (the two test
         * features are ~287 m apart in the Y direction).
         */
        function gfiParams(cx, cy) {
            return new URLSearchParams({
                repository: 'testsrepository',
                project: 'form_advanced',
                SERVICE: 'WMS',
                VERSION: '1.3.0',
                REQUEST: 'GetFeatureInfo',
                LAYERS: 'form_advanced_point',
                QUERY_LAYERS: 'form_advanced_point',
                STYLES: '',
                INFO_FORMAT: 'text/html',
                CRS: 'EPSG:2154',
                BBOX: `${cx - 100},${cy - 100},${cx + 100},${cy + 100}`,
                WIDTH: '200',
                HEIGHT: '200',
                I: '100',
                J: '100',
            });
        }

        // Feature 1: has_photo = true  (Lambert-93: X=770598.69, Y=6279391.36)
        test('has_photo=true renders a checked checkbox @requests @readonly', async ({ request }) => {
            const params = gfiParams(770598.69, 6279391.36);
            const response = await request.get(`/index.php/lizmap/service/?${params}`);
            expect(response.ok()).toBeTruthy();

            const html = await response.text();
            // The modifier must emit a checkbox element for this field
            expect(html).toContain('lizmap-popup-checkbox-widget');
            // has_photo is TRUE so the checkbox must carry the checked attribute
            expect(html).toContain('checked="checked"');
        });

        // Feature 2: has_photo = false (Lambert-93: X=770598.69, Y=6279678.56)
        test('has_photo=false renders an unchecked checkbox @requests @readonly', async ({ request }) => {
            const params = gfiParams(770598.69, 6279678.56);
            const response = await request.get(`/index.php/lizmap/service/?${params}`);
            expect(response.ok()).toBeTruthy();

            const html = await response.text();
            // The modifier must emit a checkbox element for this field
            expect(html).toContain('lizmap-popup-checkbox-widget');
            // has_photo is FALSE so the checkbox must NOT carry the checked attribute
            expect(html).not.toContain('checked="checked"');
        });
    }
);
