// @ts-check
import { expect, test } from '@playwright/test';
import { ProjectPage } from './pages/project';

/**
 * Tracing on edition.
 *
 * The edition layers of form_edition_simple_fields get a snapping configuration,
 * injected in the project configuration. The snapping GetFeature request returns
 * a geometry built from a square drawn around the map center: the square itself,
 * as a polygon, or an open line along two of its sides.
 *
 * Positions are given in pixels from the map center; the square spans HALF pixels
 * on each side of the center. The map is in EPSG:3857, the y pixel axis points down:
 * a positive dy is south, the bottom edge of the square is at dy = HALF.
 */

const LAYER_IDS = {
    line_2154: 'form_edition_line_2154_8797dd9f_d762_436f_91b6_1f06a37e9cf3',
    polygon_2154: 'form_edition_polygon_2154_6b836ded_12c4_44ee_a6c4_44bf0a0d349e',
};

// Half size of the square in pixels
const HALF = 100;

// Tolerance in map units for the checks not about the offset precision
const TOLERANCE = 0.05;

/**
 * Snapping geometries built from the square around the map center
 * @type {{[key: string]: function(object): object}}
 */
const GEOMETRIES = {
    square: ({ xmin, ymin, xmax, ymax }) => ({
        type: 'Polygon',
        coordinates: [[[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin]]],
    }),
    // Open line: bottom edge from west to east, then right edge from south to north
    bottomRight: ({ xmin, ymin, xmax, ymax }) => ({
        type: 'LineString',
        coordinates: [[xmin, ymin], [xmax, ymin], [xmax, ymax]],
    }),
};

/**
 * Open form_edition_simple_fields and a new feature form, the edition layer
 * snapping on the snap layer, which returns the given geometry
 * @param {import('@playwright/test').Page} page - the page
 * @param {object}  options              - the options
 * @param {string}  options.editionLayer - the edited layer name
 * @param {string}  options.snapLayer    - the snapping layer name
 * @param {string}  options.geometry     - the snapping geometry name, see GEOMETRIES
 * @param {boolean} options.activate     - activate tracing
 * @param {number}  options.offset       - the tracing offset in meters
 * @param {number}  options.shift        - shift of the square to the east, in pixels
 * @returns {Promise<object>} the square and helpers
 */
async function openTracing(page, { editionLayer, snapLayer = 'polygon_2154', geometry = 'square', activate = true, offset = 0, shift = 0 }) {
    // Add a snapping configuration to the edition layer
    await page.route('**/service/getProjectConfig*', async route => {
        const response = await route.fetch();
        const config = await response.json();
        Object.assign(config.editionLayers[editionLayer], {
            snap_layers: [LAYER_IDS[snapLayer]],
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
    const square = await page.evaluate(({ half, shift }) => {
        const map = globalThis.lizMap.map;
        const center = map.getCenter();
        const resolution = map.getResolution();
        return {
            xmin: center.lon + (shift - half) * resolution,
            ymin: center.lat - half * resolution,
            xmax: center.lon + (shift + half) * resolution,
            ymax: center.lat + half * resolution,
        };
    }, { half: HALF, shift });

    // Snapping data
    await page.route('**/lizmap/service*', async route => {
        const postData = route.request().postData() ?? '';
        if (!(postData.includes('GetFeature') && postData.includes(snapLayer))) {
            await route.fallback();
            return;
        }
        await route.fulfill({
            contentType: 'application/vnd.geo+json; charset=utf-8',
            json: {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    id: `${snapLayer}.1`,
                    properties: { id: 1 },
                    geometry: GEOMETRIES[geometry](square),
                }],
            },
        });
    });

    const formRequest = await project.openEditingFormWithLayer(editionLayer);
    await formRequest.response();
    await page.locator('button[data-bs-target="#tabdigitization"]').click();

    const traceButton = page.locator('lizmap-trace-geom .edition-trace-toggle');
    const offsetInput = page.locator('lizmap-trace-geom .edition-trace-offset');

    if (activate) {
        await expect(offsetInput).toHaveCount(0);
        await traceButton.click();
        await expect(traceButton).toHaveClass(/active/);
        await expect(offsetInput).toBeVisible();
        // Activating tracing starts snapping, which loads the snapping geometry
        await expect.poll(() => page.evaluate(
            () => globalThis.lizMap.mainLizmap.snapping.snapLayer.features.length
        )).toBe(1);
        await offsetInput.fill(String(offset));
        await offsetInput.press('Enter');
    }

    const center = await page.evaluate(() => {
        const map = globalThis.lizMap.map;
        const pixel = map.getPixelFromLonLat(map.getCenter());
        return { x: pixel.x, y: pixel.y };
    });
    const mapBox = await project.mapOl2.boundingBox();
    expect(mapBox).not.toBeNull();

    const move = async (dx, dy) => {
        // @ts-ignore
        await page.mouse.move(mapBox.x + center.x + dx, mapBox.y + center.y + dy, { steps: 5 });
    };

    return {
        project,
        square,
        traceButton,
        offsetInput,
        move,
        click: async (dx, dy) => {
            await move(dx, dy);
            await project.clickOnMapLegacy(center.x + dx, center.y + dy);
        },
        dblclick: async (dx, dy) => {
            await move(dx, dy);
            await project.dblClickOnMapLegacy(center.x + dx, center.y + dy);
        },
    };
}

/**
 * Coordinates of the drawn geometry: the line, or the polygon exterior ring
 * @param {import('@playwright/test').Page} page - the page
 * @returns {Promise<{type: string, points: number[][]}|null>} the drawn geometry
 */
async function drawnGeometry(page) {
    return page.evaluate(() => {
        const geometries = globalThis.lizMap.mainLizmap.edition.editLayer.features
            .map(feature => feature.geometry)
            .filter(geometry => geometry && geometry.CLASS_NAME !== 'OpenLayers.Geometry.Point');
        const geometry = geometries[geometries.length - 1];
        if (!geometry) {
            return null;
        }
        const line = geometry.CLASS_NAME === 'OpenLayers.Geometry.Polygon' ? geometry.components[0] : geometry;
        return { type: geometry.CLASS_NAME, points: line.components.map(p => [p.x, p.y]) };
    });
}

/**
 * Map units for a meter, measured in a direction around a point.
 * OpenLayers rounds geodesic distances to the millimeter: use a long centered probe.
 * @param {import('@playwright/test').Page} page - the page
 * @param {number[]} point     - the point
 * @param {number[]} direction - the unit direction
 * @returns {Promise<number>} the map units per meter
 */
async function mapUnitsPerMeter(page, point, direction) {
    return page.evaluate(({ point, direction }) => {
        const OpenLayers = globalThis.OpenLayers;
        const map = globalThis.lizMap.map;
        const half = 50 * map.getResolution();
        const [x, y] = point;
        const [dx, dy] = direction;
        return 2 * half / new OpenLayers.Geometry.LineString([
            new OpenLayers.Geometry.Point(x - dx * half, y - dy * half),
            new OpenLayers.Geometry.Point(x + dx * half, y + dy * half),
        ]).getGeodesicLength(map.getProjectionObject());
    }, { point, direction });
}

/**
 * Check a value with a tolerance
 * @param {number} actual    - the actual value
 * @param {number} expected  - the expected value
 * @param {number} tolerance - the tolerance
 */
function expectNear(actual, expected, tolerance = TOLERANCE) {
    expect(Math.abs(actual - expected), `${actual} must be near ${expected}`).toBeLessThan(tolerance);
}

test.describe('Edition trace @readonly', () => {

    [
        { offset: 0, title: 'without offset' },
        { offset: 2, title: 'with a positive offset, on the left' },
        { offset: -2, title: 'with a negative offset, on the right' },
    ].forEach(({ offset, title }) => {
        test(`Trace a snapped polygon ${title}`, async ({ page }) => {
            const { square, traceButton, offsetInput, click, move, dblclick } = await openTracing(
                page, { editionLayer: 'line_2154', offset }
            );

            // Trace start on the bottom edge
            await click(-50, HALF);
            // Move along the square to the right edge: the trace is previewed
            for (const [dx, dy] of [[0, HALF], [HALF, HALF], [HALF, 50], [HALF, -50]]) {
                await move(dx, dy);
            }
            await expect.poll(() => page.evaluate(
                () => globalThis.lizMap.map.getLayersByName('editiontracelayer')[0].features.length
            )).toBe(1);
            // Trace end on the right edge
            await dblclick(HALF, -50);

            // Traced from left to right on the bottom edge, then upward on the right edge:
            // the left side is to the north, then to the west.
            // The scale is taken at the middle of each traced segment, in the offset direction:
            // the north-south and east-west scales differ in EPSG:3857.
            const side = square.xmax - square.xmin;
            const bottomOffset = offset * await mapUnitsPerMeter(page, [square.xmin + side * 0.625, square.ymin], [0, 1]);
            const rightOffset = offset * await mapUnitsPerMeter(page, [square.xmax, square.ymin + side * 0.375], [1, 0]);

            const drawn = await drawnGeometry(page);
            expect(drawn?.type).toBe('OpenLayers.Geometry.LineString');
            // Trace start, square corner, trace end
            expect(drawn?.points).toHaveLength(3);
            // @ts-ignore
            const [first, corner, last] = drawn.points;
            const tolerance = 1e-4 * side;
            expectNear(first[1], square.ymin + bottomOffset, tolerance);
            expectNear(corner[0], square.xmax - rightOffset, tolerance);
            expectNear(corner[1], square.ymin + bottomOffset, tolerance);
            expectNear(last[0], square.xmax - rightOffset, tolerance);
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

    test('Chain two traces around two corners, joined at the offset', async ({ page }) => {
        const offset = 2;
        const { square, click, dblclick } = await openTracing(page, { editionLayer: 'line_2154', offset });

        // Bottom edge -> right edge -> top edge
        await click(-50, HALF);
        await click(HALF, 0);
        await dblclick(0, -HALF);

        // The scale is taken at the middle of each traced segment, in the offset direction
        const side = square.xmax - square.xmin;
        const bottom = offset * await mapUnitsPerMeter(page, [square.xmin + side * 0.625, square.ymin], [0, 1]);
        const rightFirst = offset * await mapUnitsPerMeter(page, [square.xmax, square.ymin + side * 0.25], [1, 0]);
        const rightSecond = offset * await mapUnitsPerMeter(page, [square.xmax, square.ymin + side * 0.75], [1, 0]);
        const top = offset * await mapUnitsPerMeter(page, [square.xmin + side * 0.75, square.ymax], [0, 1]);
        const tolerance = 1e-4 * side;

        const drawn = await drawnGeometry(page);
        // Trace start, bottom right corner, middle vertex, top right corner, trace end
        expect(drawn?.points).toHaveLength(5);
        // @ts-ignore
        const [start, bottomRight, middle, topRight, end] = drawn.points;
        // Going east, left is north
        expectNear(start[1], square.ymin + bottom, tolerance);
        expectNear(bottomRight[0], square.xmax - rightFirst, tolerance);
        expectNear(bottomRight[1], square.ymin + bottom, tolerance);
        // Going north, left is west: the second trace starts at the end of the first one
        expectNear(middle[0], square.xmax - rightFirst, tolerance);
        expectNear(topRight[0], square.xmax - rightSecond, tolerance);
        expectNear(topRight[1], square.ymax - top, tolerance);
        // Going west, left is south
        expectNear(end[1], square.ymax - top, tolerance);
    });

    test('Trace the shortest way around a ring, through its closing vertex', async ({ page }) => {
        // The square is shifted to the east, its left edge at the map center:
        // the dock covers the west of the map
        const { square, click, dblclick } = await openTracing(page, { editionLayer: 'line_2154', shift: HALF });

        // From the bottom edge (first ring segment) to the left edge (last ring segment):
        // the short way passes the first vertex of the ring, the bottom left corner
        await click(50, HALF);
        await dblclick(0, 50);

        const drawn = await drawnGeometry(page);
        expect(drawn?.points).toHaveLength(3);
        // @ts-ignore
        const [start, corner, end] = drawn.points;
        expectNear(start[1], square.ymin);
        expectNear(corner[0], square.xmin);
        expectNear(corner[1], square.ymin);
        expectNear(end[0], square.xmin);
    });

    test('Trace backward along an open line, the offset following the drawing direction', async ({ page }) => {
        const offset = 2;
        const { square, click, dblclick } = await openTracing(
            page, { editionLayer: 'line_2154', geometry: 'bottomRight', offset }
        );

        // Against the line direction: from the right edge down to the bottom edge
        await click(HALF, -50);
        await dblclick(-50, HALF);

        // The scale is taken at the middle of each traced segment, in the offset direction
        const side = square.xmax - square.xmin;
        const right = offset * await mapUnitsPerMeter(page, [square.xmax, square.ymin + side * 0.375], [1, 0]);
        const bottom = offset * await mapUnitsPerMeter(page, [square.xmin + side * 0.625, square.ymin], [0, 1]);
        const tolerance = 1e-4 * side;

        const drawn = await drawnGeometry(page);
        expect(drawn?.points).toHaveLength(3);
        // @ts-ignore
        const [start, corner, end] = drawn.points;
        // Going south, left is east; going west, left is south: outside the corner
        expectNear(start[0], square.xmax + right, tolerance);
        expectNear(corner[0], square.xmax + right, tolerance);
        expectNear(corner[1], square.ymin - bottom, tolerance);
        expectNear(end[1], square.ymin - bottom, tolerance);
    });

    test('Trace on a polygon layer', async ({ page }) => {
        const { square, click, dblclick } = await openTracing(
            page, { editionLayer: 'polygon_2154', snapLayer: 'line_2154' }
        );

        // Trace from the bottom edge to the right edge, then a free vertex at the center
        await click(-50, HALF);
        await click(HALF, 50);
        await dblclick(0, 0);

        const drawn = await drawnGeometry(page);
        expect(drawn?.type).toBe('OpenLayers.Geometry.Polygon');
        // Trace start, bottom right corner, trace end, free vertex, closing vertex
        expect(drawn?.points).toHaveLength(5);
        // @ts-ignore
        const [start, corner, end, free, closing] = drawn.points;
        expectNear(start[1], square.ymin);
        expectNear(corner[0], square.xmax);
        expectNear(corner[1], square.ymin);
        expectNear(end[0], square.xmax);
        expectNear(free[0], (square.xmin + square.xmax) / 2, (square.xmax - square.xmin) / 20);
        expect(closing).toEqual(start);
    });

    test('A free vertex before a trace is kept', async ({ page }) => {
        const { square, click, dblclick } = await openTracing(page, { editionLayer: 'line_2154' });

        // Free vertex inside the square, far from its edges
        await click(-50, 0);
        // Trace from the bottom edge to the right edge
        await click(-50, HALF);
        await dblclick(HALF, 50);

        const drawn = await drawnGeometry(page);
        expect(drawn?.points).toHaveLength(4);
        // @ts-ignore
        const [free, start, corner, end] = drawn.points;
        expect(free[1]).toBeGreaterThan(square.ymin + (square.ymax - square.ymin) / 4);
        expectNear(start[1], square.ymin);
        expectNear(corner[0], square.xmax);
        expectNear(corner[1], square.ymin);
        expectNear(end[0], square.xmax);
    });

    test('Deactivating tracing while drawing puts the trace start back', async ({ page }) => {
        const offset = 2;
        const { square, traceButton, click, move, dblclick } = await openTracing(
            page, { editionLayer: 'line_2154', offset }
        );
        const firstVertexY = () => page.evaluate(
            () => globalThis.lizMap.mainLizmap.edition.drawControl.handler.line.geometry.components[0].y
        );

        // The trace start is on the bottom edge
        await click(-50, HALF);
        expectNear(await firstVertexY(), square.ymin);

        // The preview moves it to the offset
        await move(HALF, 50);
        expect(await firstVertexY()).toBeGreaterThan(square.ymin + TOLERANCE);

        // Deactivating tracing puts it back on the bottom edge
        await traceButton.click();
        await expect(traceButton).not.toHaveClass(/active/);
        expectNear(await firstVertexY(), square.ymin);

        // Without tracing, the next vertex is added alone
        await dblclick(HALF, 50);
        const drawn = await drawnGeometry(page);
        expect(drawn?.points).toHaveLength(2);
        // @ts-ignore
        expectNear(drawn.points[0][1], square.ymin);
    });

    test('Tracing explains it is not available on a point layer', async ({ page }) => {
        const { traceButton, offsetInput } = await openTracing(
            page, { editionLayer: 'point_2154', activate: false }
        );

        await expect(traceButton).toHaveClass(/edition-trace-unavailable/);
        await expect(traceButton).toHaveAttribute('aria-disabled', 'true');
        // aria-disabled: Playwright would wait for the button to be enabled
        await traceButton.click({ force: true });
        await expect(page.locator('#message')).toContainText('available for line and polygon layers');
        await expect(traceButton).not.toHaveClass(/active/);
        await expect(offsetInput).toHaveCount(0);
    });
});
