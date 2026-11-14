// @ts-check
import { expect, test } from '@playwright/test';
import { ProjectPage } from './pages/project';

/**
 * Tracing on edition.
 *
 * The line layer line_2154 of form_edition_simple_fields gets a snapping
 * configuration on polygon_2154, injected in the project configuration.
 * The snapping GetFeature request returns a square drawn around the map center.
 * The test traces the square from its bottom edge to its right edge: the traced
 * line must follow the bottom right corner, shifted by the offset.
 */
test.describe('Edition trace without translation @readonly', () => {
    // The tracing strings are not translated in German yet:
    // the button must still work, with the English texts
    test.use({ locale: 'de-DE' });

    test('Trace button activates tracing', async ({ page }) => {
        const lineProject = new ProjectPage(page, 'form_edition_simple_fields');
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const config = await response.json();
            Object.assign(config.editionLayers.line_2154, {
                snap_layers: ['form_edition_polygon_2154_6b836ded_12c4_44ee_a6c4_44bf0a0d349e'],
                snap_vertices: 'True',
                snap_segments: 'True',
                snap_intersections: 'False',
                snap_vertices_tolerance: 10,
                snap_segments_tolerance: 10,
                snap_intersections_tolerance: 10,
                snap_on_start: 'False',
            });
            await route.fulfill({ response, json: config });
        });
        await lineProject.open();
        const formRequest = await lineProject.openEditingFormWithLayer('line_2154');
        await formRequest.response();
        await page.locator('button[data-bs-target="#tabdigitization"]').click();

        const traceButton = page.locator('lizmap-trace-geom .edition-trace-toggle');
        await expect(traceButton).toHaveAttribute('data-bs-title', 'Trace along the snapping features');
        await expect(traceButton).not.toHaveClass(/edition-trace-unavailable/);
        await traceButton.click();
        await expect(traceButton).toHaveClass(/active/);
        await expect(page.locator('lizmap-trace-geom .edition-trace-offset')).toBeVisible();
    });
});

test.describe('Edition trace @readonly', () => {

    const polygonLayerId = 'form_edition_polygon_2154_6b836ded_12c4_44ee_a6c4_44bf0a0d349e';
    // Half size of the square in pixels
    const half = 100;

    [
        { offset: 0, title: 'without offset' },
        { offset: 2, title: 'with a positive offset, on the left' },
        { offset: -2, title: 'with a negative offset, on the right' },
    ].forEach(({ offset, title }) => {
        test(`Trace a snapped polygon ${title}`, async ({ page }) => {
            // Add a snapping configuration to the line layer
            await page.route('**/service/getProjectConfig*', async route => {
                const response = await route.fetch();
                const config = await response.json();
                Object.assign(config.editionLayers.line_2154, {
                    snap_layers: [polygonLayerId],
                    snap_vertices: 'True',
                    snap_segments: 'True',
                    snap_intersections: 'False',
                    snap_vertices_tolerance: 10,
                    snap_segments_tolerance: 10,
                    snap_intersections_tolerance: 10,
                    snap_on_start: 'False',
                });
                await route.fulfill({ response, json: config });
            });

            const project = new ProjectPage(page, 'form_edition_simple_fields');
            await project.open();

            // Square around the map center, in map projection
            const square = await page.evaluate((half) => {
                const map = globalThis.lizMap.map;
                const center = map.getCenter();
                const resolution = map.getResolution();
                return {
                    xmin: center.lon - half * resolution,
                    ymin: center.lat - half * resolution,
                    xmax: center.lon + half * resolution,
                    ymax: center.lat + half * resolution,
                };
            }, half);

            // Snapping data: the square
            await page.route('**/lizmap/service*', async route => {
                const postData = route.request().postData() ?? '';
                if (!(postData.includes('GetFeature') && postData.includes('polygon_2154'))) {
                    await route.fallback();
                    return;
                }
                const { xmin, ymin, xmax, ymax } = square;
                await route.fulfill({
                    contentType: 'application/vnd.geo+json; charset=utf-8',
                    json: {
                        type: 'FeatureCollection',
                        features: [{
                            type: 'Feature',
                            id: 'polygon_2154.1',
                            properties: { id: 1 },
                            geometry: {
                                type: 'Polygon',
                                coordinates: [[[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin]]],
                            },
                        }],
                    },
                });
            });

            const formRequest = await project.openEditingFormWithLayer('line_2154');
            await formRequest.response();
            await page.getByRole('tab', { name: 'Digitization' }).click();

            // The trace button activates tracing and snapping, which loads the square
            const traceButton = page.locator('lizmap-trace-geom .edition-trace-toggle');
            await expect(traceButton).toBeEnabled();
            const offsetInput = page.locator('lizmap-trace-geom .edition-trace-offset');
            await expect(offsetInput).toHaveCount(0);
            await traceButton.click();
            await expect(traceButton).toHaveClass(/active/);
            await expect(offsetInput).toBeVisible();
            await expect.poll(() => page.evaluate(
                () => globalThis.lizMap.mainLizmap.snapping.snapLayer.features.length
            )).toBe(1);

            await offsetInput.fill(String(offset));
            await offsetInput.press('Enter');

            const center = await page.evaluate(() => {
                const map = globalThis.lizMap.map;
                const pixel = map.getPixelFromLonLat(map.getCenter());
                return { x: pixel.x, y: pixel.y };
            });
            const mapBox = await project.mapOl2.boundingBox();
            expect(mapBox).not.toBeNull();

            // Trace start on the bottom edge
            await project.clickOnMapLegacy(center.x - 50, center.y + half);
            // Move along the square to the right edge: the trace is previewed
            for (const [dx, dy] of [[0, half], [half, half], [half, 50], [half, -50]]) {
                // @ts-ignore
                await page.mouse.move(mapBox.x + center.x + dx, mapBox.y + center.y + dy, { steps: 5 });
            }
            await expect.poll(() => page.evaluate(
                () => globalThis.lizMap.map.getLayersByName('editiontracelayer')[0].features.length
            )).toBe(1);
            // Trace end on the right edge
            await project.dblClickOnMapLegacy(center.x + half, center.y - 50);

            const result = await page.evaluate(({ square, offset }) => {
                const OpenLayers = globalThis.OpenLayers;
                const map = globalThis.lizMap.map;
                // Meters to map units in the offset direction, at the middle of an edge:
                // the north-south and east-west scales differ in EPSG:3857.
                // OpenLayers rounds geodesic distances to the millimeter: use a long centered probe
                const half = 50 * map.getResolution();
                const factor = (x, y, dx, dy) => 2 * half / new OpenLayers.Geometry.LineString([
                    new OpenLayers.Geometry.Point(x - dx * half, y - dy * half),
                    new OpenLayers.Geometry.Point(x + dx * half, y + dy * half),
                ]).getGeodesicLength(map.getProjectionObject());
                const lines = globalThis.lizMap.mainLizmap.edition.editLayer.features
                    .map(feature => feature.geometry)
                    .filter(geometry => geometry?.CLASS_NAME === 'OpenLayers.Geometry.LineString');
                return {
                    // Traced from left to right on the bottom edge, then upward on the right edge:
                    // the left side is to the north, then to the west.
                    // The scale is taken at the middle of each traced segment.
                    bottomOffset: offset * factor(square.xmin + (square.xmax - square.xmin) * 0.625, square.ymin, 0, 1),
                    rightOffset: offset * factor(square.xmax, square.ymin + (square.ymax - square.ymin) * 0.375, 1, 0),
                    lineCount: lines.length,
                    points: lines.length ? lines[lines.length - 1].components.map(p => [p.x, p.y]) : [],
                };
            }, { square, offset });

            expect(result.lineCount).toBe(1);
            // Trace start, square corner, trace end
            expect(result.points).toHaveLength(3);
            const { bottomOffset, rightOffset } = result;
            const tolerance = 1e-4 * (square.xmax - square.xmin);
            const [first, corner, last] = result.points;
            const near = (value, expected) => expect(Math.abs(value - expected)).toBeLessThan(tolerance);
            near(first[1], square.ymin + bottomOffset);
            near(corner[0], square.xmax - rightOffset);
            near(corner[1], square.ymin + bottomOffset);
            near(last[0], square.xmax - rightOffset);
            expect(last[1]).toBeGreaterThan(corner[1]);

            // The geometry is drawn: tracing is off and explains why it can not be used
            await expect(traceButton).not.toHaveClass(/active/);
            await expect(traceButton).toHaveClass(/edition-trace-unavailable/);
            // aria-disabled: Playwright would wait for the button to be enabled
            await traceButton.click({ force: true });
            await expect(page.locator('#message')).toContainText('while drawing a new geometry');
            await expect(offsetInput).toHaveCount(0);
        });
    });
});
