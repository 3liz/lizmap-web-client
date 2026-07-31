// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Regression suite: the per-layer "get images directly from the WMS server"
 * option (externalWmsToggle) must be honored by getProjectConfig.
 *
 * Background
 * ----------
 * LWC used to force `externalWmsToggle = 'True'` and inject `externalAccess`
 * for every unauthenticated raster WMS layer, overriding the plugin's choice.
 * That prevented a WMS layer from cascading through QGIS Server (needed e.g.
 * to reproject a WMS server that only serves its native CRS) and made the
 * browser send cross-origin GetMap requests that failed with ORB.
 *
 * Expected behavior after the fix:
 *   - direct client access (externalAccess) is exposed only when the layer
 *     opted in (externalWmsToggle truthy in the CFG) or for EPSG:3857 tiles;
 *   - a WMS layer with the toggle OFF has no externalAccess and cascades;
 *   - every WMS layer is still flagged `wmsLayer: true` so its legend renders
 *     as a PNG (a JSON GetLegendGraphic returns empty icons for WMS layers).
 *
 * Projects used
 * -------------
 *   - testsrepository / base_layers_user_defined
 *       "WMS grouped external": plain WMS, plugin toggle written as "False"
 *   - testsrepository / external_wms_layer
 *       "png": external WMS, plugin toggle written as "True"
 */

test.describe('External WMS toggle honored in getProjectConfig @requests @readonly', () => {

    // -----------------------------------------------------------------------
    // Toggle OFF — the layer must cascade through QGIS Server (no direct access)
    // -----------------------------------------------------------------------
    test.describe('Plugin toggle OFF — cascaded', () => {
        /** @type {object} */
        let config;

        test.beforeAll(async ({ request }) => {
            const params = new URLSearchParams({
                repository: 'testsrepository',
                project: 'base_layers_user_defined',
            });
            const response = await request.get(
                `/index.php/lizmap/service/getProjectConfig?${params}`
            );
            expect(response.ok()).toBeTruthy();
            config = await response.json();
        });

        test('externalWmsToggle "False" is not overridden to "True"', () => {
            const layer = config.layers['WMS grouped external'];
            expect(layer, 'Layer "WMS grouped external" must exist').toBeDefined();
            // The CFG declares the toggle off; the backend must not force it on.
            expect(layer.externalWmsToggle).not.toBe('True');
        });

        test('no externalAccess is injected, so the layer cascades', () => {
            const layer = config.layers['WMS grouped external'];
            expect(
                layer.externalAccess,
                'externalAccess must be absent when the toggle is off (layer cascades through QGIS Server)'
            ).toBeUndefined();
        });

        test('the cascaded WMS layer is still flagged wmsLayer for PNG legend rendering', () => {
            const layer = config.layers['WMS grouped external'];
            expect(
                layer.wmsLayer,
                'wmsLayer must be true so the legend renders as PNG even when tiles cascade'
            ).toBe(true);
        });
    });

    // -----------------------------------------------------------------------
    // Toggle ON — the layer keeps direct client access
    // -----------------------------------------------------------------------
    test.describe('Plugin toggle ON — direct access', () => {
        /** @type {object} */
        let config;

        test.beforeAll(async ({ request }) => {
            const params = new URLSearchParams({
                repository: 'testsrepository',
                project: 'external_wms_layer',
            });
            const response = await request.get(
                `/index.php/lizmap/service/getProjectConfig?${params}`
            );
            expect(response.ok()).toBeTruthy();
            config = await response.json();
        });

        test('externalWmsToggle "True" is kept and externalAccess is exposed', () => {
            const layer = config.layers['png'];
            expect(layer, 'Layer "png" must exist').toBeDefined();
            expect(layer.externalWmsToggle).toBe('True');
            expect(
                layer.externalAccess,
                'externalAccess must be present when the toggle is on'
            ).toBeDefined();
            expect(layer.externalAccess.url).toContain('liz.lizmap.com');
        });

        test('the direct-access WMS layer is also flagged wmsLayer', () => {
            const layer = config.layers['png'];
            expect(layer.wmsLayer).toBe(true);
        });
    });
});
