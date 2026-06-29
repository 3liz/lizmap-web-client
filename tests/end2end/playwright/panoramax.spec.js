// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';

/**
 * Load the panoramax project and mock all Panoramax API calls.
 * Used by beforeEach (fixture page) and beforeAll (manually-created page).
 * @param {import('@playwright/test').Page} page
 */
async function initPanoramaxPage(page) {
    // Single handler for all Panoramax API calls to avoid route-ordering issues.
    // Playwright checks routes LIFO so a single handler is safer than multiple.
    await page.route('**/panoramax.openstreetmap.fr/**', (route) => {
        const url = route.request().url();
        if (url.endsWith('.mvt')) {
            // Empty protobuf tile — no features, but the request is satisfied
            route.fulfill({ status: 200, contentType: 'application/x-protobuf', body: Buffer.alloc(0) });
        } else if (url.includes('/users/search')) {
            // Account search — empty result by default (tests override with a specific route)
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ features: [] }) });
        } else {
            // Any other Panoramax API call (viewer init, STAC, etc.)
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
        }
    });

    const project = new ProjectPage(page, 'panoramax');
    project.waitForGetLegendGraphicDuringLoad = false;
    project.layersInTreeView = 0;
    await project.open();
}

test.describe('Panoramax @readonly', () => {

    // =========================================================================
    // 1. Dock lifecycle — one page load per test (tests are fast and independent)
    // =========================================================================
    test.describe('Dock lifecycle', () => {

        test.beforeEach(async ({ page }) => {
            await initPanoramaxPage(page);
        });

        test('Button #button-panoramax is visible', async ({ page }) => {
            await expect(page.locator('#button-panoramax')).toBeVisible();
        });

        test('Dock opens on button click', async ({ page }) => {
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax')).toBeVisible();
        });

        test('Dock title is "Panoramax"', async ({ page }) => {
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax .dock-title')).toHaveText('Panoramax');
        });

        test('Dock closes on second button click', async ({ page }) => {
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax')).toBeVisible();
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax')).not.toBeVisible();
        });

        test('Module is active when dock is open', async ({ page }) => {
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax')).toBeVisible();
            expect(await page.evaluate(() => lizMap.mainLizmap.panoramax.active)).toBe(true);
        });

        test('Module is inactive when dock is closed', async ({ page }) => {
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax')).toBeVisible();
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax')).not.toBeVisible();
            expect(await page.evaluate(() => lizMap.mainLizmap.panoramax.active)).toBe(false);
        });
    });

    // =========================================================================
    // 2. Coverage layer — one page load per test
    // =========================================================================
    test.describe('Coverage layer', () => {

        test.beforeEach(async ({ page }) => {
            await initPanoramaxPage(page);
        });

        test('Coverage layer is hidden before dock opens', async ({ page }) => {
            expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._olLayerState.checked)).toBe(false);
        });

        test('Coverage layer is visible when dock is open', async ({ page }) => {
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax')).toBeVisible();
            expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._olLayerState.checked)).toBe(true);
        });

        test('Coverage layer is hidden when dock closes', async ({ page }) => {
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax')).toBeVisible();
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax')).not.toBeVisible();
            expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._olLayerState.checked)).toBe(false);
        });

        test('Coverage layer requests MVT tiles when active', async ({ page }) => {
            const mvtRequest = page.waitForRequest(req => req.url().includes('.mvt'));
            await page.locator('#button-panoramax').click();
            await mvtRequest;
        });
    });

    // =========================================================================
    // 3. Orientation arrow — one page load per test
    // =========================================================================
    test.describe('Orientation arrow', () => {

        test.beforeEach(async ({ page }) => {
            await initPanoramaxPage(page);
        });

        test('Arrow layer is hidden initially', async ({ page }) => {
            expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._arrowLayer.getVisible())).toBe(false);
        });

        test('Arrow becomes visible after updateArrow()', async ({ page }) => {
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax')).toBeVisible();
            await page.evaluate(() => lizMap.mainLizmap.panoramax.updateArrow(3.84, 43.62, 45));
            expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._arrowLayer.getVisible())).toBe(true);
        });

        test('Arrow rotation matches heading', async ({ page }) => {
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax')).toBeVisible();
            await page.evaluate(() => lizMap.mainLizmap.panoramax.updateArrow(3.84, 43.62, 90));
            const rotation = await page.evaluate(() => lizMap.mainLizmap.panoramax._arrowIcon.getRotation());
            expect(rotation).toBeCloseTo(Math.PI / 2, 5);
        });

        test('Arrow is hidden when dock closes', async ({ page }) => {
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax')).toBeVisible();
            await page.evaluate(() => lizMap.mainLizmap.panoramax.updateArrow(3.84, 43.62, 0));
            expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._arrowLayer.getVisible())).toBe(true);
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax')).not.toBeVisible();
            expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._arrowLayer.getVisible())).toBe(false);
        });

        test('updateHeading() updates arrow rotation', async ({ page }) => {
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax')).toBeVisible();
            await page.evaluate(() => lizMap.mainLizmap.panoramax.updateArrow(3.84, 43.62, 0));
            await page.evaluate(() => lizMap.mainLizmap.panoramax.updateHeading(180));
            // Wait for requestAnimationFrame to flush
            await page.waitForFunction(() =>
                lizMap.mainLizmap.panoramax._rafId === 0
                && lizMap.mainLizmap.panoramax._pendingHeading === null
            );
            const rotation = await page.evaluate(() => lizMap.mainLizmap.panoramax._arrowIcon.getRotation());
            expect(rotation).toBeCloseTo(Math.PI, 5);
        });

        test('Arrow coordinates are updated to the picture position', async ({ page }) => {
            await page.locator('#button-panoramax').click();
            await expect(page.locator('#panoramax')).toBeVisible();
            await page.evaluate(() => lizMap.mainLizmap.panoramax.updateArrow(3.84280215, 43.6214338, 0));
            const coords = await page.evaluate(() => lizMap.mainLizmap.panoramax._arrowPoint.getCoordinates());
            expect(coords).toHaveLength(2);
            expect(typeof coords[0]).toBe('number');
            expect(typeof coords[1]).toBe('number');
            expect(coords[0]).not.toBe(0);
            expect(coords[1]).not.toBe(0);
        });
    });

    // =========================================================================
    // 4–8. Viewer, filters and interactions
    //
    // All these groups require the dock to be open and the photo viewer to be
    // loaded. The viewer is lazy-loaded on the first dock open and takes up to
    // ~15 s. Sharing a single page and viewer load across all groups avoids
    // repeating that cost for every test.
    // =========================================================================
    test.describe('Viewer, filters and interactions', () => {

        /** @type {import('@playwright/test').Page} */
        let page;

        test.beforeAll(async ({ browser }) => {
            // Create a page with the same settings as the playwright config
            const context = await browser.newContext({
                viewport: { width: 900, height: 650 },
                locale: 'en-US',
                baseURL: 'http://localhost:8130',
            });
            page = await context.newPage();
            await initPanoramaxPage(page);
            // Open the dock and wait for the lazy-loaded photo viewer (up to 15 s)
            await page.locator('#button-panoramax').click();
            await expect(page.locator('pnx-photo-viewer')).toBeVisible({ timeout: 15000 });
        });

        test.afterAll(async () => {
            await page.context().close();
        });

        // ── 4. Viewer and filter controls UI ─────────────────────────────────

        test.describe('Viewer and filter controls', () => {

            test('Photo viewer element is rendered', async () => {
                await expect(page.locator('pnx-photo-viewer')).toBeVisible();
            });

            test('Start date input is present', async () => {
                const startInput = page.locator('input[data-filter="start"]');
                await expect(startInput).toBeVisible();
                await expect(startInput).toHaveAttribute('type', 'date');
            });

            test('End date input is present', async () => {
                const endInput = page.locator('input[data-filter="end"]');
                await expect(endInput).toBeVisible();
                await expect(endInput).toHaveAttribute('type', 'date');
            });

            test('Type select has correct options', async () => {
                const typeSelect = page.locator('select[data-filter="type"]');
                await expect(typeSelect).toBeVisible();
                await expect(typeSelect).toHaveValue('');
                const options = typeSelect.locator('option');
                await expect(options).toHaveCount(3);
                await expect(options.nth(0)).toHaveAttribute('value', '');
                await expect(options.nth(0)).toHaveText('—');
                await expect(options.nth(1)).toHaveAttribute('value', 'flat');
                await expect(options.nth(1)).toHaveText('Classic');
                await expect(options.nth(2)).toHaveAttribute('value', 'equirectangular');
                await expect(options.nth(2)).toHaveText('360°');
            });

            test('Account autocomplete input is enabled initially', async () => {
                await expect(page.locator('input[data-filter="account"]')).toBeEnabled();
            });

            test('Account autocomplete input starts empty', async () => {
                await expect(page.locator('input[data-filter="account"]')).toHaveValue('');
            });
        });

        // ── 5. Date filter ────────────────────────────────────────────────────

        test.describe('Date filter', () => {

            test.afterEach(async () => {
                // Reset module state and clear the UI inputs between tests
                await page.evaluate(() => lizMap.mainLizmap.panoramax.setDateFilter(null, null));
                await page.locator('input[data-filter="start"]').fill('');
                await page.locator('input[data-filter="end"]').fill('');
            });

            test('Setting start date applies filter to module', async () => {
                const startInput = page.locator('input[data-filter="start"]');
                await startInput.fill('2024-01-01');
                await startInput.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));
                expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._filterStart)).toBe('2024-01-01');
            });

            test('Setting end date applies filter to module', async () => {
                const endInput = page.locator('input[data-filter="end"]');
                await endInput.fill('2024-03-31');
                await endInput.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));
                expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._filterEnd)).toBe('2024-03-31');
            });

            test('End date filter advances by one day for picture timestamps', async () => {
                const endInput = page.locator('input[data-filter="end"]');
                // Use mid-January to avoid DST edge cases (France: last Sunday of March/October)
                await endInput.fill('2024-01-15');
                await endInput.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));
                expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._filterEndPlusOne)).toBe('2024-01-16');
            });

            test('Both date bounds can be set simultaneously', async () => {
                const startInput = page.locator('input[data-filter="start"]');
                const endInput = page.locator('input[data-filter="end"]');
                await startInput.fill('2024-01-01');
                await startInput.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));
                await endInput.fill('2024-12-31');
                await endInput.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));
                const { filterStart, filterEnd } = await page.evaluate(() => ({
                    filterStart: lizMap.mainLizmap.panoramax._filterStart,
                    filterEnd: lizMap.mainLizmap.panoramax._filterEnd,
                }));
                expect(filterStart).toBe('2024-01-01');
                expect(filterEnd).toBe('2024-12-31');
            });

            test('Clearing start date removes filter', async () => {
                const startInput = page.locator('input[data-filter="start"]');
                await startInput.fill('2024-01-01');
                await startInput.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));
                await startInput.fill('');
                await startInput.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));
                expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._filterStart)).toBeNull();
            });

            test('Clearing end date removes filter', async () => {
                const endInput = page.locator('input[data-filter="end"]');
                await endInput.fill('2024-03-31');
                await endInput.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));
                await endInput.fill('');
                await endInput.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));
                const { filterEnd, filterEndPlusOne } = await page.evaluate(() => ({
                    filterEnd: lizMap.mainLizmap.panoramax._filterEnd,
                    filterEndPlusOne: lizMap.mainLizmap.panoramax._filterEndPlusOne,
                }));
                expect(filterEnd).toBeNull();
                expect(filterEndPlusOne).toBeNull();
            });
        });

        // ── 6. Picture type filter ────────────────────────────────────────────

        test.describe('Picture type filter', () => {

            test.afterEach(async () => {
                await page.evaluate(() => lizMap.mainLizmap.panoramax.setTypeFilter(null));
                await page.locator('select[data-filter="type"]').selectOption('');
            });

            test('Selecting "flat" applies type filter', async () => {
                await page.locator('select[data-filter="type"]').selectOption('flat');
                expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._filterType)).toBe('flat');
            });

            test('Selecting "equirectangular" applies type filter', async () => {
                await page.locator('select[data-filter="type"]').selectOption('equirectangular');
                expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._filterType)).toBe('equirectangular');
            });

            test('Selecting "—" clears type filter', async () => {
                const typeSelect = page.locator('select[data-filter="type"]');
                await typeSelect.selectOption('flat');
                await typeSelect.selectOption('');
                expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._filterType)).toBeNull();
            });
        });

        // ── 7. Account filter ─────────────────────────────────────────────────
        // Autocomplete: typing queries the Panoramax /users/search?q= endpoint.
        // Tests are sequential: search → exact select → clear → unknown.

        test.describe('Account filter', () => {

            const TEST_ACCOUNT_ID = 'test-account-uuid-1234';
            const TEST_ACCOUNT_NAME = 'Test User';

            test.beforeEach(async () => {
                // Intercept the /users/search?q= search endpoint (more specific than the
                // catch-all, so Playwright LIFO routing gives it priority).
                await page.route('**/panoramax.openstreetmap.fr/api/users/search*', (route) => {
                    const q = new URL(route.request().url()).searchParams.get('q') || '';
                    const match = TEST_ACCOUNT_NAME.toLowerCase().includes(q.toLowerCase());
                    const body = match
                        ? JSON.stringify({ features: [{ id: TEST_ACCOUNT_ID, label: TEST_ACCOUNT_NAME }] })
                        : JSON.stringify({ features: [] });
                    route.fulfill({ status: 200, contentType: 'application/json', body });
                });
            });

            test.afterEach(async () => {
                await page.unroute('**/panoramax.openstreetmap.fr/api/users/search*');
                await page.evaluate(() => lizMap.mainLizmap.panoramax.setAccountFilter(null));
                const input = page.locator('input[data-filter="account"]');
                await input.fill('');
                await input.evaluate(el => el.dispatchEvent(new Event('input', { bubbles: true })));
            });

            test('Account input is always enabled', async () => {
                await expect(page.locator('input[data-filter="account"]')).toBeEnabled();
            });

            test('Typing populates the datalist from the API', async () => {
                const accountInput = page.locator('input[data-filter="account"]');
                await accountInput.fill('Test');
                await accountInput.evaluate(el => el.dispatchEvent(new Event('input', { bubbles: true })));
                await page.waitForFunction(
                    () => document.querySelectorAll('#pnx-accounts-list option').length > 0
                );
                await expect(page.locator(`#pnx-accounts-list option[value="${TEST_ACCOUNT_NAME}"]`)).toBeAttached();
            });

            test('Selecting an account name by exact match applies the UUID filter without an extra request', async () => {
                // First search to populate the cache, then select the exact name.
                const accountInput = page.locator('input[data-filter="account"]');
                await accountInput.fill('Test');
                await accountInput.evaluate(el => el.dispatchEvent(new Event('input', { bubbles: true })));
                await page.waitForFunction(
                    () => document.querySelectorAll('#pnx-accounts-list option').length > 0
                );

                // Count search requests fired from now on: selecting an exact match
                // must not trigger any additional API call.
                let searchCount = 0;
                const countSearches = (req) => {
                    if (req.url().includes('/users/search')) { searchCount++; }
                };
                page.on('request', countSearches);

                await accountInput.fill(TEST_ACCOUNT_NAME);
                await accountInput.evaluate(el => el.dispatchEvent(new Event('input', { bubbles: true })));
                expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._filterAccount)).toBe(TEST_ACCOUNT_ID);

                // Wait past the debounce window to be sure no request is queued.
                await page.waitForTimeout(500);
                page.off('request', countSearches);
                expect(searchCount).toBe(0);
            });

            test('Clearing account input clears account filter', async () => {
                const accountInput = page.locator('input[data-filter="account"]');
                await accountInput.fill('');
                await accountInput.evaluate(el => el.dispatchEvent(new Event('input', { bubbles: true })));
                expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._filterAccount)).toBeNull();
            });

            test('Typing an unknown name clears the filter', async () => {
                const accountInput = page.locator('input[data-filter="account"]');
                await accountInput.fill('NoSuchUser');
                await accountInput.evaluate(el => el.dispatchEvent(new Event('input', { bubbles: true })));
                // After debounce the search returns [] and the filter is cleared.
                await page.waitForFunction(
                    () => lizMap.mainLizmap.panoramax._filterAccount === null
                );
                await expect(page.locator('#pnx-accounts-list option')).toHaveCount(0);
            });
        });

        // ── 8. Map click interactions ─────────────────────────────────────────

        test.describe('Map click interactions', () => {

            test('panoramax.picture.selected event triggers viewer.select()', async () => {
                await page.evaluate(() => {
                    window._pnxSelectCalls = [];
                    const viewer = document.querySelector('pnx-photo-viewer');
                    viewer.select = (seqId, picId) => window._pnxSelectCalls.push({ seqId, picId });
                });

                await page.evaluate(() => {
                    lizMap.mainEventDispatcher.dispatch({
                        type: 'panoramax.picture.selected',
                        seqId: 'seq-1',
                        picId: 'pic-1',
                    });
                });

                const calls = await page.evaluate(() => window._pnxSelectCalls);
                expect(calls).toHaveLength(1);
                expect(calls[0].seqId).toBe('seq-1');
                expect(calls[0].picId).toBe('pic-1');
            });

            test('Map click on inactive module has no effect', async () => {
                await page.locator('#button-panoramax').click();
                await expect(page.locator('#panoramax')).not.toBeVisible();
                expect(await page.evaluate(() => lizMap.mainLizmap.panoramax.active)).toBe(false);

                await page.evaluate(() => {
                    window._pnxEvents = [];
                    lizMap.mainEventDispatcher.addListener(
                        (e) => window._pnxEvents.push(e),
                        'panoramax.picture.selected'
                    );
                    lizMap.mainEventDispatcher.addListener(
                        (e) => window._pnxEvents.push(e),
                        'panoramax.position.selected'
                    );
                });

                // Simulate a click through the module's handler — _active guard must reject it
                await page.evaluate(() => {
                    lizMap.mainLizmap.panoramax._handleClick({
                        pixel: [450, 325],
                        coordinate: [700000, 6861000],
                    });
                });

                expect(await page.evaluate(() => window._pnxEvents)).toHaveLength(0);
            });
        });

        // ── 9. "Open in Panoramax" external link ──────────────────────────────

        test.describe('Open in Panoramax link', () => {

            /**
             * Inject a mock _psv and call _updateExternalLink() directly.
             * oncePSVReady() never resolves in the mocked API environment, so we
             * cannot rely on _wirePSV() having run. Testing URL generation through
             * _updateExternalLink() directly is the correct approach here.
             * @param {{ picId?: string, seqId?: string|null, lon?: number, lat?: number, x?: number, y?: number, z?: number }} [options]
             */
            const simulatePictureLoaded = async (options = {}) => {
                const {
                    picId = 'test-pic-uuid',
                    seqId = 'test-seq-uuid',
                    lon = 2.360953,
                    lat = 48.857579,
                    x = 113.53,
                    y = 0.00,
                    z = 30,
                } = options;
                await page.evaluate(
                    /** @param {{ picId: string, seqId: string|null, lon: number, lat: number, x: number, y: number, z: number }} args */
                    ({ picId, seqId, lon, lat, x, y, z }) => {
                        const comp = /** @type {any} */ (document.querySelector('lizmap-panoramax'));
                        if (!comp._psv) { comp._psv = {}; }
                        comp._psv.getPictureId = () => picId;
                        comp._psv.getPictureMetadata = () => seqId ? { sequence: { id: seqId } } : null;
                        comp._psv.getXYZ = () => ({ x, y, z });
                        comp._currentLon = lon;
                        comp._currentLat = lat;
                        comp._updateExternalLink();
                    },
                    { picId, seqId, lon, lat, x, y, z }
                );
            };

            test.beforeEach(async () => {
                // Section 8's last test closes the dock — reopen it if needed.
                const isVisible = await page.locator('pnx-photo-viewer').isVisible();
                if (!isVisible) {
                    await page.locator('#button-panoramax').click();
                    await expect(page.locator('pnx-photo-viewer')).toBeVisible({ timeout: 5000 });
                }
            });

            test.afterEach(async () => {
                // Reset link DOM state and component position between tests.
                await page.evaluate(() => {
                    const link = document.querySelector('a.panoramax-open-external');
                    if (link) {
                        link.classList.add('d-none');
                        link.removeAttribute('href');
                    }
                    const comp = /** @type {any} */ (document.querySelector('lizmap-panoramax'));
                    if (comp) {
                        comp._currentLon = null;
                        comp._currentLat = null;
                        comp._psv = null;
                    }
                });
            });

            test('Link is present and hidden before a picture loads', async () => {
                const link = page.locator('a.panoramax-open-external');
                await expect(link).toBeAttached();
                await expect(link).toHaveClass(/d-none/);
            });

            test('Link opens in a new tab', async () => {
                await expect(page.locator('a.panoramax-open-external'))
                    .toHaveAttribute('target', '_blank');
            });

            test('Link appears after picture-loaded event', async () => {
                await simulatePictureLoaded();
                await expect(page.locator('a.panoramax-open-external')).not.toHaveClass(/d-none/);
            });

            test('Link href contains correct pic and seq ids', async () => {
                await simulatePictureLoaded({
                    picId: '19e66c90-003b-439a-9d8a-e64a3c9f5012',
                    seqId: 'fb880ec0-ff78-4a8f-b000-42218c0bf7f7',
                });
                const href = await page.locator('a.panoramax-open-external').getAttribute('href');
                expect(href).toContain('pic=19e66c90-003b-439a-9d8a-e64a3c9f5012');
                expect(href).toContain('seq=fb880ec0-ff78-4a8f-b000-42218c0bf7f7');
            });

            test('Link href contains correct map position', async () => {
                await simulatePictureLoaded({ lat: 48.857579, lon: 2.360953 });
                const href = await page.locator('a.panoramax-open-external').getAttribute('href');
                expect(href).toContain('focus=pic');
                expect(href).toContain('map=17/48.857579/2.360953');
            });

            test('Link href contains correct xyz view angle', async () => {
                await simulatePictureLoaded({ x: 113.53, y: 0.00, z: 30 });
                const href = await page.locator('a.panoramax-open-external').getAttribute('href');
                expect(href).toContain('xyz=113.53/0.00/30');
            });

            test('Link href updates when view rotates', async () => {
                await simulatePictureLoaded({ x: 45.00 });
                const href1 = await page.locator('a.panoramax-open-external').getAttribute('href');
                expect(href1).toContain('xyz=45.00');

                await page.evaluate(() => {
                    const comp = /** @type {any} */ (document.querySelector('lizmap-panoramax'));
                    comp._psv.getXYZ = () => ({ x: 180.00, y: 0.00, z: 30 });
                    comp._updateExternalLink();
                });
                const href2 = await page.locator('a.panoramax-open-external').getAttribute('href');
                expect(href2).toContain('xyz=180.00');
            });

            test('Link omits seq parameter when picture has no sequence', async () => {
                await simulatePictureLoaded({ seqId: null });
                const href = await page.locator('a.panoramax-open-external').getAttribute('href');
                expect(href).toContain('pic=test-pic-uuid');
                expect(href).not.toContain('seq=');
            });

            test('Link href points to the configured Panoramax instance origin', async () => {
                await simulatePictureLoaded();
                const href = await page.locator('a.panoramax-open-external').getAttribute('href');
                expect(href).toMatch(/^https:\/\/panoramax\.openstreetmap\.fr\//);
            });
        });
    });
});
