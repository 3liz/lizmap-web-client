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
        } else if (url.includes('/users/')) {
            // Account name resolution
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'Test User' }) });
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
                await expect(options.nth(1)).toHaveText('flat');
                await expect(options.nth(2)).toHaveAttribute('value', 'equirectangular');
                await expect(options.nth(2)).toHaveText('equirectangular');
            });

            test('Account select is disabled initially', async () => {
                await expect(page.locator('select[data-filter="account"]')).toBeDisabled();
            });

            test('Account select has a default empty option', async () => {
                const firstOption = page.locator('select[data-filter="account"] option').first();
                await expect(firstOption).toHaveAttribute('value', '');
                await expect(firstOption).toHaveText('—');
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
        // Tests build on each other: inject → enable → name check → select → clear

        test.describe('Account filter', () => {

            const TEST_ACCOUNT_ID = 'test-account-uuid-1234';

            const injectFakeAccount = async () => {
                await page.evaluate((accountId) => {
                    const fakeFeature = { get: (key) => key === 'account_id' ? accountId : null };
                    const fakeTile = { getFeatures: () => [fakeFeature] };
                    lizMap.mainLizmap.panoramax._onTileLoaded(fakeTile);
                }, TEST_ACCOUNT_ID);
                await page.waitForFunction(
                    () => document.querySelector('select[data-filter="account"]')?.disabled === false
                );
            };

            test('Account select is disabled when no accounts are known', async () => {
                await expect(page.locator('select[data-filter="account"]')).toBeDisabled();
            });

            test('Account select is enabled and populated after tile loads accounts', async () => {
                await injectFakeAccount();
                const accountSelect = page.locator('select[data-filter="account"]');
                await expect(accountSelect).toBeEnabled();
                await expect(accountSelect.locator('option')).toHaveCount(2);
            });

            test('Account name is resolved from API', async () => {
                // Account already injected — mock returns { name: 'Test User' }
                const accountOption = page.locator(`select[data-filter="account"] option[value="${TEST_ACCOUNT_ID}"]`);
                await expect(accountOption).toHaveText('Test User');
            });

            test('Account filter is applied to module when selection changes', async () => {
                await page.locator('select[data-filter="account"]').selectOption(TEST_ACCOUNT_ID);
                expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._filterAccount)).toBe(TEST_ACCOUNT_ID);
            });

            test('Selecting "—" clears account filter', async () => {
                await page.locator('select[data-filter="account"]').selectOption('');
                expect(await page.evaluate(() => lizMap.mainLizmap.panoramax._filterAccount)).toBeNull();
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
    });
});
