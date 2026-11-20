/**
 * @module utils/Measure.js
 * @name Measure
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */

import { getArea, getLength } from 'ol/sphere.js';
import { LineString, Polygon, Circle as CircleGeom } from 'ol/geom.js';
import { fromCircle } from 'ol/geom/Polygon.js';

/**
 * Format a length in meters for display
 * @param {number} length - The length in meters
 * @returns {string} The formatted length
 */
export function formatLength(length) {
    if (length > 100) {
        return Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    }
    return Math.round(length * 100) / 100 + ' ' + 'm';
}

/**
 * Format an area in square meters for display
 * @param {number} area - The area in square meters
 * @param {boolean} [html] - Use HTML markup for the unit exponent instead of an unicode superscript
 * @returns {string} The formatted area
 */
export function formatArea(area, html = false) {
    const squared = html ? '<sup>2</sup>' : '²';
    if (area > 10000) {
        return Math.round((area / 1000000) * 100) / 100 + ' ' + 'km' + squared;
    }
    return Math.round(area * 100) / 100 + ' ' + 'm' + squared;
}

/**
 * Get the formatted measures of a geometry:
 * the length for a line, the perimeter and the area for a polygon,
 * the radius and the area for a circle.
 * Other geometry types have no measure.
 * @param {import('ol/geom/Geometry.js').default} geom - The geometry
 * @param {import('ol/proj.js').ProjectionLike} projection - The projection of the geometry
 * @param {boolean} [html] - Use HTML markup for the area unit exponent
 * @returns {string[]} The formatted measures, empty if the geometry has no measure
 */
export function getMeasures(geom, projection, html = false) {
    const options = { projection: projection };
    if (geom instanceof Polygon) {
        // Perimeter of the exterior ring, closed if needed
        const ring = Array.from(geom.getCoordinates()[0] ?? []);
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first && (first[0] !== last[0] || first[1] !== last[1])) {
            ring.push(Array.from(first));
        }
        const perimeter = getLength(new Polygon([ring]), options);
        return [formatLength(perimeter), formatArea(getArea(geom, options), html)];
    }
    if (geom instanceof CircleGeom) {
        const radius = getLength(new LineString([geom.getFirstCoordinate(), geom.getLastCoordinate()]), options);
        // Approximate the circle with a 128-sided polygon to get its area
        const area = getArea(fromCircle(geom, 128), options);
        return [formatLength(radius), formatArea(area, html)];
    }
    if (geom instanceof LineString) {
        return [formatLength(getLength(geom, options))];
    }
    return [];
}
