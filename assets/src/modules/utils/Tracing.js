/**
 * @module modules/utils/Tracing.js
 * @name Tracing
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */

/**
 * A 2D coordinate
 * @typedef {number[]} Coordinate
 */

/**
 * A location on a path
 * @typedef {object} PathLocation
 * @property {number}     index    - index of the segment the location is on
 * @property {number}     t        - position on the segment, from 0 (start) to 1 (end)
 * @property {Coordinate} coord    - the located coordinate
 * @property {number}     distance - distance between the located point and the path
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
 * Length of a polyline
 * @param {Coordinate[]} coords - the polyline coordinates
 * @returns {number} the length
 */
export function pathLength(coords) {
    let length = 0;
    for (let i = 0; i < coords.length - 1; i++) {
        length += Math.hypot(coords[i + 1][0] - coords[i][0], coords[i + 1][1] - coords[i][1]);
    }
    return length;
}

/**
 * Closest point of a segment to a point
 * @param {Coordinate} point - the point
 * @param {Coordinate} a     - segment start
 * @param {Coordinate} b     - segment end
 * @returns {{coord: Coordinate, t: number, distance: number}} the closest point
 */
export function closestPointOnSegment(point, a, b) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const lengthSquared = dx * dx + dy * dy;
    let t = 0;
    if (lengthSquared > 0) {
        t = ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / lengthSquared;
        t = Math.max(0, Math.min(1, t));
    }
    const coord = [a[0] + t * dx, a[1] + t * dy];
    return { coord: coord, t: t, distance: Math.hypot(point[0] - coord[0], point[1] - coord[1]) };
}

/**
 * Locate the closest point of a path to a point
 * @param {Coordinate[]} points - the path vertices, without the closing vertex for a closed path
 * @param {boolean}      closed - is the path closed (a ring)
 * @param {Coordinate}   point  - the point to locate
 * @returns {PathLocation|null} the location, null if the path has no segment
 */
export function locateOnPath(points, closed, point) {
    const segmentCount = closed ? points.length : points.length - 1;
    let best = null;
    for (let i = 0; i < segmentCount; i++) {
        const closest = closestPointOnSegment(point, points[i], points[(i + 1) % points.length]);
        if (best === null || closest.distance < best.distance) {
            best = { index: i, t: closest.t, coord: closest.coord, distance: closest.distance };
        }
    }
    return best;
}

/**
 * The part of a path between two locations, following the path vertices.
 * For a closed path, the shortest way around is returned.
 * @param {Coordinate[]} points - the path vertices, without the closing vertex for a closed path
 * @param {boolean}      closed - is the path closed (a ring)
 * @param {PathLocation} from   - the start location
 * @param {PathLocation} to     - the end location
 * @returns {Coordinate[]} the traced coordinates, from the start to the end location
 */
export function tracePath(points, closed, from, to) {
    const n = points.length;
    const fromPosition = from.index + from.t;
    const toPosition = to.index + to.t;

    if (!closed) {
        const coords = [from.coord];
        if (toPosition >= fromPosition) {
            for (let v = from.index + 1; v <= to.index; v++) {
                coords.push(points[v]);
            }
        } else {
            for (let v = from.index; v > to.index; v--) {
                coords.push(points[v]);
            }
        }
        coords.push(to.coord);
        return removeDuplicates(coords);
    }

    // Forward way
    const forward = [from.coord];
    if (!(from.index === to.index && toPosition >= fromPosition)) {
        let v = (from.index + 1) % n;
        for (let count = 0; count <= n; count++) {
            forward.push(points[v]);
            if (v === to.index) {
                break;
            }
            v = (v + 1) % n;
        }
    }
    forward.push(to.coord);

    // Backward way
    const backward = [from.coord];
    if (!(from.index === to.index && toPosition <= fromPosition)) {
        let v = from.index;
        const stop = (to.index + 1) % n;
        for (let count = 0; count <= n; count++) {
            backward.push(points[v]);
            if (v === stop) {
                break;
            }
            v = (v - 1 + n) % n;
        }
    }
    backward.push(to.coord);

    const forwardPath = removeDuplicates(forward);
    const backwardPath = removeDuplicates(backward);
    return pathLength(forwardPath) <= pathLength(backwardPath) ? forwardPath : backwardPath;
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
