// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';
import { playwrightTestFile } from './globals';

/**
 * Tests for external WMTS layer routing — regression suite for issue #6645.
 *
 * Background
 * ----------
 * LWC reads each raster/wms layer's datasource from the QGIS project and uses
 * `stripos($url, 'wmts')` to decide whether the layer is a WMTS source and
 * therefore set `externalAccess.type = 'wmts'` in the project config served to
 * the frontend.
 *
 * Prior to the fix (commit that introduced the bug), the check was
 * `stripos($url, 'service=wmts')`, which only matched URLs where the WMTS
 * service identifier appeared as a *query parameter* (e.g. "?Service=WMTS&…").
 * URLs where "wmts" appears only in the *path* (e.g.
 * "wmts.example.com/wmts/1.0.0/WMTSCapabilities.xml") were silently mistyped
 * as WMS, causing the frontend to send WMS GetMap requests directly to the
 * external WMTS endpoint — which rejected them.
 *
 * Scenarios covered
 * -----------------
 *  A. getProjectConfig returns `externalAccess.type = 'wmts'` for a WMTS layer
 *     whose capabilities URL contains "SERVICE=WMTS" as a query parameter
 *     (this was always working — regression guard).
 *
 *  B. getProjectConfig returns no `externalWmsToggle` for a plain WMS layer
 *     whose URL contains no "wmts" token at all (regression guard).
 *
 *  C. When a WMTS external layer is used as a base layer, the browser sends
 *     WMTS GetTile requests to the external server — NOT WMS GetMap requests.
 *     A WMS GetMap to the external WMTS URL is the observable symptom of the
 *     bug.
 *
 *  D. (TODO — requires a dedicated test project) Same as C but for a WMTS
 *     layer whose capabilities URL contains "wmts" only in the path, e.g.
 *       https://wmts.asit-asso.ch/wmts/1.0.0/WMTSCapabilities.xml
 *     The `base_layers_user_defined` project currently only contains WMTS
 *     layers with "SERVICE=WMTS" query params (case A); a second project with
 *     a path-only WMTS URL is needed to cover the exact regression path.
 *
 * Projects used
 * -------------
 *  - testsrepository / base_layers_user_defined
 *      "WMTS single external": WMTS from liz.lizmap.com (SERVICE=WMTS in URL)
 *      "WMS single internal":  plain WMS — no "wmts" in URL at all
 */

// ---------------------------------------------------------------------------
// Scenario A + B — getProjectConfig API checks
// ---------------------------------------------------------------------------

test.describe('External WMTS layer — getProjectConfig @requests @readonly', () => {

    /** @type {import('@playwright/test').APIResponse} */
    let configResponse;
    /** @type {object} */
    let config;

    test.beforeAll(async ({ request }) => {
        const params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'base_layers_user_defined',
        });
        configResponse = await request.get(
            `/index.php/lizmap/service/getProjectConfig?${params}`
        );
        config = await configResponse.json();
    });

    test('Response is valid JSON project config', async () => {
        expect(configResponse.ok()).toBeTruthy();
        expect(configResponse.status()).toBe(200);
        expect(config).toHaveProperty('layers');
    });

    // Scenario A — WMTS layer with "SERVICE=WMTS" query parameter
    test('WMTS layer with SERVICE=WMTS in URL gets externalAccess.type = wmts', async () => {
        // This layer's datasource URL contains "SERVICE=WMTS" as a query param.
        // PHP must detect it as WMTS and set type accordingly so the frontend
        // uses an OL WMTS source instead of a WMS source.
        const wmtsLayer = config.layers['WMTS single external'];
        expect(wmtsLayer, 'Layer "WMTS single external" must exist in config').toBeDefined();
        expect(wmtsLayer.externalAccess, 'externalAccess must be present for WMTS layer').toBeDefined();
        expect(wmtsLayer.externalAccess.type).toBe('wmts');
    });

    // Scenario B — Plain WMS layer (no "wmts" in URL)
    test('Plain WMS layer without wmts in URL does not get externalAccess.type = wmts', async () => {
        // This layer uses a plain WMS URL — "wmts" does not appear anywhere.
        // It must not be misidentified as a WMTS source.
        const wmsLayer = config.layers['WMS single internal'];
        expect(wmsLayer, 'Layer "WMS single internal" must exist in config').toBeDefined();
        // Either externalAccess is absent, or its type is not 'wmts'
        if (wmsLayer.externalAccess) {
            expect(wmsLayer.externalAccess.type).not.toBe('wmts');
        }
    });

    // Scenario B (variant) — WMS layer explicitly opted out of external access
    test('WMS layer with externalWmsToggle=False has no external routing', async () => {
        const wmsGroupedLayer = config.layers['WMS grouped external'];
        expect(wmsGroupedLayer, 'Layer "WMS grouped external" must exist in config').toBeDefined();
        // externalWmsToggle explicitly set to False by the plugin — must stay False
        expect(String(wmsGroupedLayer.externalWmsToggle).toLowerCase()).toBe('false');
    });
});

// ---------------------------------------------------------------------------
// Scenario C — Map display: WMTS base layer must use WMTS protocol
// ---------------------------------------------------------------------------

test.describe('External WMTS base layer — request routing @readonly', () => {

    /**
     * When the WMTS type is correctly detected, the frontend creates an
     * OpenLayers `WMTS` source. That source issues requests with
     * `SERVICE=WMTS&REQUEST=GetTile` to the external server.
     *
     * The bug caused `type` to be absent, forcing the config to WMS, and
     * making the frontend send `SERVICE=WMS&REQUEST=GetMap` to the external
     * WMTS capabilities URL — which the WMTS server rejects.
     */

    test('Selecting WMTS external base layer sends WMTS GetTile, not WMS GetMap, to external server', async ({ page }) => {
        // Collect every request that reaches liz.lizmap.com so we can
        // inspect its parameters without depending on a live internet
        // connection.
        /** @type {{ url: string }[]} */
        const externalRequests = [];

        await page.route(/liz\.lizmap\.com/, async (route) => {
            const req = route.request();
            externalRequests.push({ url: req.url() });

            const url = req.url();
            if (url.includes('REQUEST=GetCapabilities')) {
                // Return a minimal stub so OL doesn't stall waiting for caps
                await route.fulfill({
                    contentType: 'application/xml',
                    body: `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities xmlns="http://www.opengis.net/wmts/1.0" version="1.0.0">
  <Contents>
    <Layer>
      <ows:Identifier xmlns:ows="http://www.opengis.net/ows/1.1">Communes</ows:Identifier>
      <TileMatrixSetLink><TileMatrixSet>EPSG:3857</TileMatrixSet></TileMatrixSetLink>
    </Layer>
    <TileMatrixSet>
      <ows:Identifier xmlns:ows="http://www.opengis.net/ows/1.1">EPSG:3857</ows:Identifier>
    </TileMatrixSet>
  </Contents>
</Capabilities>`,
                });
            } else {
                // Fulfill tile/other requests with a transparent tile
                await route.fulfill({
                    path: playwrightTestFile('mock', 'transparent_tile.png'),
                });
            }
        });

        // Also mock OSM tiles used as the default base layer on page load
        await page.route('https://tile.openstreetmap.org/*/*/*.png', async (route) => {
            await route.fulfill({
                path: playwrightTestFile('mock', 'transparent_tile.png'),
            });
        });

        const project = new ProjectPage(page, 'base_layers_user_defined');
        await project.open();

        // Switch to the WMTS external base layer
        await project.baseLayerSelect.selectOption('WMTS single external');
        // Allow time for tile requests to be dispatched
        await page.waitForTimeout(2000);

        // The bug manifests as WMS GetMap requests going to the external
        // WMTS server. After the fix, only WMTS requests should appear there.
        const wrongRequests = externalRequests.filter(r =>
            r.url.includes('REQUEST=GetMap') && r.url.includes('SERVICE=WMS')
        );
        expect(
            wrongRequests,
            `Bug regression: WMS GetMap was sent to external WMTS server.\n` +
            `Offending URLs:\n${wrongRequests.map(r => '  ' + r.url).join('\n')}`
        ).toHaveLength(0);

        // After the fix the layer is backed by a WMTS OL source; it either:
        //  - issues WMTS GetCapabilities (if OL needs to parse caps), or
        //  - issues WMTS GetTile requests directly.
        // Either way the request must carry SERVICE=WMTS.
        const wmtsRequests = externalRequests.filter(r =>
            r.url.toLowerCase().includes('service=wmts')
        );
        expect(
            wmtsRequests,
            `Expected at least one WMTS request to the external server.\n` +
            `All captured external requests:\n${externalRequests.map(r => '  ' + r.url).join('\n')}`
        ).not.toHaveLength(0);

        await page.unroute(/liz\.lizmap\.com/);
        await page.unroute('https://tile.openstreetmap.org/*/*/*.png');
    });

    /**
     * TODO (issue #6645 — path-based WMTS URL scenario)
     *
     * Add a second QGIS project containing a raster/wms layer whose WMTS
     * capabilities URL has "wmts" only in the *path*, e.g.:
     *   https://wmts.asit-asso.ch/wmts/1.0.0/WMTSCapabilities.xml
     * (no "SERVICE=WMTS" query parameter).
     *
     * The test should be identical in structure to the one above and verify:
     *   1. getProjectConfig returns externalAccess.type = 'wmts'
     *   2. No WMS GetMap is sent to the WMTS server URL
     *   3. WMTS GetTile or GetCapabilities requests are made instead
     *
     * This would directly reproduce and guard against the exact regression
     * path that affected ASIT-VD and swisstopo layers in issue #6645.
     */
});

// ---------------------------------------------------------------------------
// Regression guard — external WMS overlay layer still routes to external host
// ---------------------------------------------------------------------------

test.describe('External WMS overlay layer — request routing regression @readonly', () => {

    /**
     * The fix in Project.php broadened the condition for setting
     * `externalWmsToggle`. This guard ensures that plain external WMS overlay
     * layers (no "wmts" in their URL) are unaffected and still have their tile
     * requests forwarded to the correct external WMS server.
     */
    test('External WMS overlay layer requests go to external WMS server, not localhost', async ({ page }) => {
        const project = new ProjectPage(page, 'external_wms_layer');

        // Mock OSM base layer tiles
        await page.route('https://tile.openstreetmap.org/*/*/*.png', async (route) => {
            await route.fulfill({
                path: playwrightTestFile('mock', 'transparent_tile.png'),
            });
        });

        // Mock the external WMS server so the test is network-independent
        await page.route(/liz\.lizmap\.com/, async (route) => {
            await route.fulfill({
                path: playwrightTestFile('mock', 'transparent_tile.png'),
            });
        });

        await project.open();

        // Enable the external WMS layer (image/png format)
        const getMapPromise = project.waitForGetMapRequest();
        await page.getByTestId('png').click();
        const getMapRequest = await getMapPromise;

        // The request must go to the external WMS server, not to localhost
        expect(
            getMapRequest.url(),
            'External WMS GetMap must target the external server, not localhost'
        ).toContain('liz.lizmap.com');

        expect(
            getMapRequest.url(),
            'External WMS GetMap must use WMS protocol'
        ).toContain('SERVICE=WMS');

        expect(
            getMapRequest.url(),
            'External WMS GetMap must be a GetMap request'
        ).toContain('REQUEST=GetMap');

        await page.unroute(/liz\.lizmap\.com/);
        await page.unroute('https://tile.openstreetmap.org/*/*/*.png');
    });

    test('Local layer requests go to localhost QGIS Server, not external', async ({ page }) => {
        const project = new ProjectPage(page, 'external_wms_layer');

        await page.route('https://tile.openstreetmap.org/*/*/*.png', async (route) => {
            await route.fulfill({
                path: playwrightTestFile('mock', 'transparent_tile.png'),
            });
        });

        await page.route(/liz\.lizmap\.com/, async (route) => {
            await route.fulfill({
                path: playwrightTestFile('mock', 'transparent_tile.png'),
            });
        });

        await project.open();

        // Enable the local "world" layer
        const getMapPromise = project.waitForGetMapRequest();
        await page.getByTestId('world').click();
        const getMapRequest = await getMapPromise;

        // Must go through the local QGIS Server proxy
        expect(
            getMapRequest.url(),
            'Local layer GetMap must target localhost, not an external server'
        ).toContain('localhost');

        expect(
            getMapRequest.url(),
            'Local layer GetMap must not reach external WMS server'
        ).not.toContain('liz.lizmap.com');

        await page.unroute(/liz\.lizmap\.com/);
        await page.unroute('https://tile.openstreetmap.org/*/*/*.png');
    });
});
