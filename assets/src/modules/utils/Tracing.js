/**
 * @module modules/utils/Tracing.js
 * @name Tracing
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */

import { closestOnSegment } from 'ol/coordinate.js';

/**
 * A 2D coordinate
 * @typedef {number[]} Coordinate
 */

/**
 * A path: the vertices of a line or of a ring
 * @typedef {object} TracePath
 * @property {Coordinate[]} points - the vertices, without the closing vertex for a ring
 * @property {boolean}      closed - is the path closed (a ring)
 */

/**
 * A location on the trace graph
 * @typedef {object} GraphLocation
 * @property {number}     edge     - index of the graph edge the location is on
 * @property {number}     t        - position on the edge, from 0 (start) to 1 (end)
 * @property {Coordinate} coord    - the located coordinate
 * @property {number}     distance - distance between the located point and the edge
 */

/**
 * A traced route
 * @typedef {object} TracedRoute
 * @property {Coordinate[]} coords   - the traced coordinates
 * @property {Array<{path: TracePath, segment: number}>} segments - for each traced segment,
 *           the path and the index of the path segment it lies on
 */

/**
 * Are two coordinates equal, with a tolerance relative to their magnitude
 * @param {Coordinate} a - first coordinate
 * @param {Coordinate} b - second coordinate
 * @returns {boolean} true if equal
 */
function sameCoordinate(a, b) {
    const epsilon = 1e-9 * Math.max(1, Math.abs(a[0]), Math.abs(a[1]));
    return Math.abs(a[0] - b[0]) <= epsilon && Math.abs(a[1] - b[1]) <= epsilon;
}

/**
 * Remove consecutive duplicate coordinates
 * @param {Coordinate[]} coords - the coordinates
 * @returns {Coordinate[]} the coordinates without consecutive duplicates
 */
export function removeDuplicates(coords) {
    const result = [];
    for (const coord of coords) {
        if (result.length === 0 || !sameCoordinate(result[result.length - 1], coord)) {
            result.push(coord);
        }
    }
    return result;
}

/**
 * Closest point of a segment to a point
 * @param {Coordinate} point - the point
 * @param {Coordinate} a     - segment start
 * @param {Coordinate} b     - segment end
 * @returns {{coord: Coordinate, t: number, distance: number}} the closest point
 */
export function closestPointOnSegment(point, a, b) {
    const coord = closestOnSegment(point, [a, b]);
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const lengthSquared = dx * dx + dy * dy;
    // Position of the closest point on the segment
    const t = lengthSquared > 0 ? ((coord[0] - a[0]) * dx + (coord[1] - a[1]) * dy) / lengthSquared : 0;
    return { coord: coord, t: t, distance: Math.hypot(point[0] - coord[0], point[1] - coord[1]) };
}

/**
 * Intersection of two infinite lines
 * @param {Coordinate[]} line1 - the first line, two distinct points
 * @param {Coordinate[]} line2 - the second line, two distinct points
 * @returns {Coordinate|null} the intersection, null if the lines are parallel
 */
export function intersectLines(line1, line2) {
    const [a, b] = line1;
    const [c, d] = line2;
    const r = [b[0] - a[0], b[1] - a[1]];
    const s = [d[0] - c[0], d[1] - c[1]];
    const denominator = r[0] * s[1] - r[1] * s[0];
    // Compare with the lengths to be independent of the coordinate scale
    if (Math.abs(denominator) <= 1e-12 * Math.hypot(...r) * Math.hypot(...s)) {
        return null;
    }
    const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / denominator;
    return [a[0] + t * r[0], a[1] + t * r[1]];
}

/**
 * Offset a polyline. A positive distance shifts the polyline to the left
 * of its direction, a negative one to the right, as the QGIS tracing offset.
 * Vertices are joined with a miter, replaced by a bevel when the angle is too sharp.
 * @param {Coordinate[]} coords     - the polyline coordinates
 * @param {number[]}     distances  - the offset distance of each segment
 * @param {number}       miterLimit - the maximum miter length, as a ratio of the distance
 * @returns {Coordinate[]} the offset polyline
 */
export function offsetPolyline(coords, distances, miterLimit = 5) {
    const points = removeDuplicates(coords);
    if (points.length < 2) {
        return points.slice();
    }

    const segments = [];
    for (let k = 0; k < points.length - 1; k++) {
        const a = points[k];
        const b = points[k + 1];
        const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
        // Left normal
        const nx = -(b[1] - a[1]) / length;
        const ny = (b[0] - a[0]) / length;
        const d = distances[k] ?? distances[distances.length - 1] ?? 0;
        segments.push({
            d: d,
            start: [a[0] + nx * d, a[1] + ny * d],
            end: [b[0] + nx * d, b[1] + ny * d],
        });
    }

    const result = [segments[0].start];
    for (let k = 1; k < segments.length; k++) {
        const previous = segments[k - 1];
        const current = segments[k];
        const vertex = points[k];
        const maxDistance = Math.max(Math.abs(previous.d), Math.abs(current.d));
        if (maxDistance === 0) {
            result.push(vertex);
            continue;
        }
        const corner = intersectLines([previous.start, previous.end], [current.start, current.end]);
        if (corner === null) {
            // Collinear segments
            result.push(current.start);
        } else if (Math.hypot(corner[0] - vertex[0], corner[1] - vertex[1]) > miterLimit * maxDistance) {
            // Too sharp: bevel
            result.push(previous.end, current.start);
        } else {
            result.push(corner);
        }
    }
    result.push(segments[segments.length - 1].end);
    return removeDuplicates(result);
}

/**
 * Minimal binary heap of [priority, value] pairs, lowest priority first
 * @private
 */
class MinHeap {
    constructor() {
        this._items = [];
    }

    get size() {
        return this._items.length;
    }

    push(priority, value) {
        const items = this._items;
        items.push([priority, value]);
        let i = items.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (items[parent][0] <= items[i][0]) {
                break;
            }
            [items[parent], items[i]] = [items[i], items[parent]];
            i = parent;
        }
    }

    pop() {
        const items = this._items;
        const top = items[0];
        const last = items.pop();
        if (items.length > 0) {
            items[0] = last;
            let i = 0;
            for (;;) {
                const left = 2 * i + 1;
                const right = left + 1;
                let smallest = i;
                if (left < items.length && items[left][0] < items[smallest][0]) {
                    smallest = left;
                }
                if (right < items.length && items[right][0] < items[smallest][0]) {
                    smallest = right;
                }
                if (smallest === i) {
                    break;
                }
                [items[smallest], items[i]] = [items[i], items[smallest]];
                i = smallest;
            }
        }
        return top;
    }
}

/**
 * The network of paths to trace along, as the QGIS tracer graph.
 *
 * The paths are split where they meet: at shared vertices, where a path ends on
 * another path segment, and where segments cross. The traced route between two
 * locations is the shortest one through this network, across the junctions.
 */
export class TraceGraph {

    /**
     * Build the graph
     * @param {TracePath[]} paths - the paths
     */
    constructor(paths) {
        /** @type {Array<{coord: Coordinate, edges: number[]}>} */
        this.nodes = [];
        /** @type {Array<{a: number, b: number, path: TracePath, segment: number, length: number}>} */
        this.edges = [];
        this._nodeKeys = new Map();

        let magnitude = 1;
        for (const path of paths) {
            for (const point of path.points) {
                magnitude = Math.max(magnitude, Math.abs(point[0]), Math.abs(point[1]));
            }
        }
        // Coordinates closer than this are the same node
        this._epsilon = 1e-9 * magnitude;

        // Path segments, with the positions where they are split
        const segments = [];
        for (const path of paths) {
            const n = path.points.length;
            const count = path.closed ? n : n - 1;
            for (let i = 0; i < count; i++) {
                const a = path.points[i];
                const b = path.points[(i + 1) % n];
                if (sameCoordinate(a, b)) {
                    continue;
                }
                segments.push({
                    path: path,
                    segment: i,
                    a: a,
                    b: b,
                    splits: [{ t: 0, coord: a }, { t: 1, coord: b }],
                });
            }
        }

        this._cellSize = this._chooseCellSize(segments);
        this._splitAtJunctions(segments);

        for (const segment of segments) {
            segment.splits.sort((x, y) => x.t - y.t);
            let previous = null;
            for (const split of segment.splits) {
                const node = this._node(split.coord);
                if (previous !== null && previous !== node) {
                    this._addEdge(previous, node, segment);
                }
                previous = node;
            }
        }

        // Spatial index of the edges
        this._grid = new Map();
        this.edges.forEach((edge, index) => {
            const a = this.nodes[edge.a].coord;
            const b = this.nodes[edge.b].coord;
            this._forEachCell(
                Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1]),
                key => {
                    if (!this._grid.has(key)) {
                        this._grid.set(key, []);
                    }
                    this._grid.get(key).push(index);
                }
            );
        });
    }

    /**
     * Grid cell size: about the mean segment length, with at most about 256 cells per side
     * @param {Array} segments - the path segments
     * @returns {number} the cell size
     * @private
     */
    _chooseCellSize(segments) {
        if (segments.length === 0) {
            return 1;
        }
        let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity, total = 0;
        for (const { a, b } of segments) {
            xmin = Math.min(xmin, a[0], b[0]);
            ymin = Math.min(ymin, a[1], b[1]);
            xmax = Math.max(xmax, a[0], b[0]);
            ymax = Math.max(ymax, a[1], b[1]);
            total += Math.hypot(b[0] - a[0], b[1] - a[1]);
        }
        const extent = Math.max(xmax - xmin, ymax - ymin);
        return Math.max(total / segments.length, extent / 256, this._epsilon * 1000);
    }

    /**
     * Number of grid cells covered by a bounding box
     * @param {number} xmin - west
     * @param {number} ymin - south
     * @param {number} xmax - east
     * @param {number} ymax - north
     * @returns {number} the number of cells
     * @private
     */
    _cellCount(xmin, ymin, xmax, ymax) {
        const size = this._cellSize;
        return (Math.floor(xmax / size) - Math.floor(xmin / size) + 1)
            * (Math.floor(ymax / size) - Math.floor(ymin / size) + 1);
    }

    /**
     * Call a function for the key of each grid cell covered by a bounding box
     * @param {number}                 xmin     - west
     * @param {number}                 ymin     - south
     * @param {number}                 xmax     - east
     * @param {number}                 ymax     - north
     * @param {function(string): void} callback - called with each cell key
     * @private
     */
    _forEachCell(xmin, ymin, xmax, ymax, callback) {
        const size = this._cellSize;
        for (let ix = Math.floor(xmin / size); ix <= Math.floor(xmax / size); ix++) {
            for (let iy = Math.floor(ymin / size); iy <= Math.floor(ymax / size); iy++) {
                callback(ix + ',' + iy);
            }
        }
    }

    /**
     * Split the segments where they meet or cross
     * @param {Array} segments - the path segments
     * @private
     */
    _splitAtJunctions(segments) {
        const epsilon = this._epsilon;
        const cells = new Map();
        segments.forEach((segment, index) => {
            this._forEachCell(
                Math.min(segment.a[0], segment.b[0]) - epsilon, Math.min(segment.a[1], segment.b[1]) - epsilon,
                Math.max(segment.a[0], segment.b[0]) + epsilon, Math.max(segment.a[1], segment.b[1]) + epsilon,
                key => {
                    if (!cells.has(key)) {
                        cells.set(key, []);
                    }
                    cells.get(key).push(index);
                }
            );
        });

        const tested = new Set();
        for (const indexes of cells.values()) {
            for (let i = 0; i < indexes.length; i++) {
                for (let j = i + 1; j < indexes.length; j++) {
                    const first = Math.min(indexes[i], indexes[j]);
                    const second = Math.max(indexes[i], indexes[j]);
                    const pair = first * segments.length + second;
                    if (tested.has(pair)) {
                        continue;
                    }
                    tested.add(pair);
                    this._splitPair(segments[first], segments[second]);
                }
            }
        }
    }

    /**
     * Split two segments where they meet or cross
     * @param {object} s1 - the first segment
     * @param {object} s2 - the second segment
     * @private
     */
    _splitPair(s1, s2) {
        const epsilon = this._epsilon;
        const r = [s1.b[0] - s1.a[0], s1.b[1] - s1.a[1]];
        const s = [s2.b[0] - s2.a[0], s2.b[1] - s2.a[1]];
        const rLength = Math.hypot(...r);
        const sLength = Math.hypot(...s);
        const denominator = r[0] * s[1] - r[1] * s[0];

        if (Math.abs(denominator) > 1e-12 * rLength * sLength) {
            const q = [s2.a[0] - s1.a[0], s2.a[1] - s1.a[1]];
            let t = (q[0] * s[1] - q[1] * s[0]) / denominator;
            let u = (q[0] * r[1] - q[1] * r[0]) / denominator;
            const tTolerance = epsilon / rLength;
            const uTolerance = epsilon / sLength;
            if (t < -tTolerance || t > 1 + tTolerance || u < -uTolerance || u > 1 + uTolerance) {
                return;
            }
            t = Math.min(1, Math.max(0, t));
            u = Math.min(1, Math.max(0, u));
            // Use an existing vertex when the junction is at the end of a segment
            let coord;
            if (t <= tTolerance) {
                coord = s1.a;
            } else if (t >= 1 - tTolerance) {
                coord = s1.b;
            } else if (u <= uTolerance) {
                coord = s2.a;
            } else if (u >= 1 - uTolerance) {
                coord = s2.b;
            } else {
                coord = [s1.a[0] + t * r[0], s1.a[1] + t * r[1]];
            }
            s1.splits.push({ t: t, coord: coord });
            s2.splits.push({ t: u, coord: coord });
            return;
        }

        // Parallel segments: split where an end of one lies on the other
        for (const [segment, other] of [[s1, s2], [s2, s1]]) {
            for (const end of [other.a, other.b]) {
                const closest = closestPointOnSegment(end, segment.a, segment.b);
                if (closest.distance <= epsilon && closest.t > 0 && closest.t < 1) {
                    segment.splits.push({ t: closest.t, coord: end });
                }
            }
        }
    }

    /**
     * Get or create the node at a coordinate
     * @param {Coordinate} coord - the coordinate
     * @returns {number} the node index
     * @private
     */
    _node(coord) {
        const key = Math.round(coord[0] / this._epsilon) + ',' + Math.round(coord[1] / this._epsilon);
        let index = this._nodeKeys.get(key);
        if (index === undefined) {
            index = this.nodes.length;
            this.nodes.push({ coord: coord, edges: [] });
            this._nodeKeys.set(key, index);
        }
        return index;
    }

    /**
     * Add an edge between two nodes
     * @param {number} a       - the start node
     * @param {number} b       - the end node
     * @param {object} segment - the path segment the edge lies on
     * @private
     */
    _addEdge(a, b, segment) {
        const ca = this.nodes[a].coord;
        const cb = this.nodes[b].coord;
        const index = this.edges.length;
        this.edges.push({
            a: a,
            b: b,
            path: segment.path,
            segment: segment.segment,
            length: Math.hypot(cb[0] - ca[0], cb[1] - ca[1]),
        });
        this.nodes[a].edges.push(index);
        this.nodes[b].edges.push(index);
    }

    /**
     * Locate the closest point of the graph to a point
     * @param {Coordinate} point     - the point
     * @param {number}     tolerance - the maximum distance
     * @returns {GraphLocation|null} the location, null if no edge is within the tolerance
     */
    locate(point, tolerance) {
        let best = null;
        const test = index => {
            const edge = this.edges[index];
            const closest = closestPointOnSegment(point, this.nodes[edge.a].coord, this.nodes[edge.b].coord);
            if (closest.distance <= tolerance && (best === null || closest.distance < best.distance)) {
                best = { edge: index, t: closest.t, coord: closest.coord, distance: closest.distance };
            }
        };
        const box = [point[0] - tolerance, point[1] - tolerance, point[0] + tolerance, point[1] + tolerance];
        if (this._cellCount(...box) > this._grid.size) {
            // The tolerance covers more cells than the indexed ones: test every edge
            this.edges.forEach((edge, index) => test(index));
            return best;
        }
        const seen = new Set();
        this._forEachCell(...box, key => {
            for (const index of this._grid.get(key) ?? []) {
                if (!seen.has(index)) {
                    seen.add(index);
                    test(index);
                }
            }
        });
        return best;
    }

    /**
     * Shortest distances from a location to every node of the graph
     * @param {GraphLocation} from - the start location
     * @returns {{from: GraphLocation, distances: Float64Array, previous: Int32Array}} the shortest path tree:
     *          for each node, its distance and the edge it is reached by (-1 unreached, -2 from the start edge)
     */
    shortestPathTree(from) {
        const distances = new Float64Array(this.nodes.length).fill(Infinity);
        const previous = new Int32Array(this.nodes.length).fill(-1);
        const heap = new MinHeap();
        const start = this.edges[from.edge];
        for (const node of [start.a, start.b]) {
            const coord = this.nodes[node].coord;
            const distance = Math.hypot(coord[0] - from.coord[0], coord[1] - from.coord[1]);
            if (distance < distances[node]) {
                distances[node] = distance;
                previous[node] = -2;
                heap.push(distance, node);
            }
        }
        while (heap.size > 0) {
            const [distance, node] = heap.pop();
            if (distance > distances[node]) {
                continue;
            }
            for (const edgeIndex of this.nodes[node].edges) {
                const edge = this.edges[edgeIndex];
                const next = edge.a === node ? edge.b : edge.a;
                const nextDistance = distance + edge.length;
                if (nextDistance < distances[next]) {
                    distances[next] = nextDistance;
                    previous[next] = edgeIndex;
                    heap.push(nextDistance, next);
                }
            }
        }
        return { from: from, distances: distances, previous: previous };
    }

    /**
     * The shortest route from the start of a shortest path tree to a location
     * @param {{from: GraphLocation, distances: Float64Array, previous: Int32Array}} tree - the shortest path tree
     * @param {GraphLocation} to - the end location
     * @returns {TracedRoute|null} the route, null if the location can not be reached
     */
    route(tree, to) {
        const from = tree.from;
        const startEdge = this.edges[from.edge];
        const endEdge = this.edges[to.edge];

        let best = null;
        if (from.edge === to.edge) {
            best = { node: null, length: Math.hypot(to.coord[0] - from.coord[0], to.coord[1] - from.coord[1]) };
        }
        for (const node of [endEdge.a, endEdge.b]) {
            const coord = this.nodes[node].coord;
            const length = tree.distances[node] + Math.hypot(to.coord[0] - coord[0], to.coord[1] - coord[1]);
            if (length < (best?.length ?? Infinity)) {
                best = { node: node, length: length };
            }
        }
        if (best === null || !isFinite(best.length)) {
            return null;
        }

        // Each entry starts a traced segment lying on the given path segment
        const entries = [];
        if (best.node === null) {
            entries.push({ coord: from.coord, source: startEdge });
        } else {
            const nodes = [best.node];
            const edges = [];
            let node = best.node;
            while (tree.previous[node] >= 0) {
                const edgeIndex = tree.previous[node];
                const edge = this.edges[edgeIndex];
                edges.push(edge);
                node = edge.a === node ? edge.b : edge.a;
                nodes.push(node);
            }
            nodes.reverse();
            edges.reverse();
            entries.push({ coord: from.coord, source: startEdge });
            nodes.forEach((nodeIndex, k) => {
                entries.push({ coord: this.nodes[nodeIndex].coord, source: k < edges.length ? edges[k] : endEdge });
            });
        }
        entries.push({ coord: to.coord, source: null });

        // Remove duplicate coordinates, keeping the path segment of the following entry
        const kept = [];
        for (const entry of entries) {
            const previous = kept[kept.length - 1];
            if (previous && sameCoordinate(previous.coord, entry.coord)) {
                previous.source = entry.source;
            } else {
                kept.push({ coord: entry.coord, source: entry.source });
            }
        }
        return {
            coords: kept.map(entry => entry.coord),
            segments: kept.slice(0, -1).map(entry => ({ path: entry.source.path, segment: entry.source.segment })),
        };
    }
}
