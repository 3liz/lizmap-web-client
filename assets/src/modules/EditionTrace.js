/**
 * @module modules/EditionTrace.js
 * @name EditionTrace
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */

import { mainEventDispatcher } from './Globals.js';
import Edition from './Edition.js';
import Snapping from './Snapping.js';
import {
    intersectLines,
    locateOnPath,
    offsetPolyline,
    tracePath,
} from './utils/Tracing.js';

/**
 * Default pixel tolerance to find the traced feature, when snapping has none
 * @type {number}
 */
const DEFAULT_TOLERANCE_PX = 10;

/**
 * Tracing for the edition, as the QGIS tracing digitizing tool.
 *
 * While drawing a line or a polygon, a vertex added on a feature loaded for
 * snapping becomes the trace start. Moving the cursor along the same feature
 * previews the path following its vertices, and the next click adds the
 * traced vertices. An offset distance in meters shifts the traced path:
 * positive to the left of the drawing direction, negative to the right.
 * @class
 * @name EditionTrace
 */
export default class EditionTrace {

    /**
     * Create an edition trace instance
     * @param {Edition}  edition  - The edition module
     * @param {Snapping} snapping - The snapping module, providing the traced features
     * @param {object}   lizmap3  - The old lizmap object
     */
    constructor(edition, snapping, lizmap3) {
        this._edition = edition;
        this._snapping = snapping;
        this._lizmap3 = lizmap3;

        this._active = false;
        this._offset = 0;
        // Last fixed vertex the trace starts from, see _createAnchor
        this._anchor = null;
        // Traced path previewed between the anchor and the cursor
        this._preview = null;
        // Paths of the snapping features, built on demand
        this._paths = null;
        // Draw handlers already wrapped
        this._wrappedHandlers = new WeakSet();

        this._guideLayer = new OpenLayers.Layer.Vector('editiontracelayer', {
            visibility: false,
            displayInLayerSwitcher: false,
            styleMap: new OpenLayers.StyleMap({
                strokeColor: '#ff6f00',
                strokeWidth: 3,
                strokeOpacity: 0.9,
                strokeDashstyle: 'dash',
                pointRadius: 0,
            }),
        });
        this._lizmap3.map.addLayer(this._guideLayer);

        // Rebuild the paths when the snapping features change
        const snapLayer = this._snapping.snapLayer;
        snapLayer?.events.on({
            featuresadded: () => this._paths = null,
            featuresremoved: () => this._paths = null,
            scope: this,
        });

        mainEventDispatcher.addListener(
            () => {
                if (this._edition.drawFeatureActivated) {
                    this._wrapDrawControl(this._edition.drawControl);
                    this._reset();
                } else {
                    this.active = false;
                }
                this._dispatchChange();
            },
            'edition.drawFeatureActivated'
        );

        mainEventDispatcher.addListener(
            () => {
                this.active = false;
            },
            'edition.formClosed'
        );

        mainEventDispatcher.addListener(
            () => {
                if (!this._snapping.active) {
                    this.active = false;
                }
            },
            'snapping.active'
        );
    }

    /**
     * Can tracing be used: a line or polygon is being drawn and snapping is configured
     * @type {boolean}
     */
    get available() {
        return this.unavailableReason === null;
    }

    /**
     * Why tracing can not be used now
     * @type {string|null} the locale key of the reason, null if tracing can be used
     */
    get unavailableReason() {
        if (this._snapping.config === undefined) {
            return 'edition.trace.unavailable.snapping';
        }
        if (!['line', 'polygon'].includes(this._editedGeometryType())) {
            return 'edition.trace.unavailable.geometry';
        }
        if (!this._edition.drawFeatureActivated) {
            return 'edition.trace.unavailable.drawing';
        }
        return null;
    }

    /**
     * Toggle tracing, or explain why it can not be used
     */
    toggle() {
        const reason = this.unavailableReason;
        if (reason !== null && !this._active) {
            this._lizmap3.addMessage(EditionTrace.translate(reason), 'info', true, 7000);
            return;
        }
        this.active = !this._active;
    }

    /**
     * Translate a tracing locale key, with the English text as fallback
     * for the languages not translated yet
     * @param {string} key - the locale key
     * @returns {string} the translated text
     */
    static translate(key) {
        const fallbacks = {
            'edition.geom.trace': 'Trace along the snapping features',
            'edition.trace.offset': 'Trace offset in meters',
            'edition.trace.offset.help': 'Offset in meters: positive to the left of the drawing direction, negative to the right',
            'edition.trace.unavailable.snapping': 'Tracing follows the snapping features: no snapping layer is configured for this layer.',
            'edition.trace.unavailable.geometry': 'Tracing is available for line and polygon layers.',
            'edition.trace.unavailable.drawing': 'Tracing is available while drawing a new geometry. Use "Restart drawing" to draw the geometry again.',
        };
        return globalThis.lizDict?.[key] || fallbacks[key] || key;
    }

    /**
     * Geometry type of the edited layer, also known when no geometry is drawn
     * @returns {string|undefined} point, line, polygon or undefined
     * @private
     */
    _editedGeometryType() {
        if (this._edition.layerGeometry) {
            return this._edition.layerGeometry;
        }
        const editionLayers = this._lizmap3.config?.editionLayers ?? {};
        for (const editionLayer of Object.values(editionLayers)) {
            if (editionLayer.layerId === this._edition.layerId) {
                return editionLayer.geometryType;
            }
        }
        return undefined;
    }

    /**
     * Is tracing active
     * @type {boolean}
     */
    get active() {
        return this._active;
    }

    /**
     * Activate or deactivate tracing. Activating it starts snapping, which loads the traced features.
     * @type {boolean}
     */
    set active(active) {
        active = !!active && this.available;
        if (active === this._active) {
            return;
        }
        this._active = active;
        if (active && !this._snapping.active) {
            this._snapping.active = true;
        }
        this._reset();
        this._dispatchChange();
    }

    /**
     * The offset distance in meters: positive to the left of the drawing direction, negative to the right
     * @type {number}
     */
    get offset() {
        return this._offset;
    }

    /**
     * Set the offset distance in meters
     * @type {number}
     */
    set offset(offset) {
        const value = parseFloat(offset);
        this._offset = isNaN(value) ? 0 : value;
        this._dispatchChange();
    }

    /**
     * The OL2 draw handler of the edition
     * @type {object|undefined}
     * @private
     */
    get _drawHandler() {
        return this._edition.drawControl?.handler;
    }

    /**
     * Forget the trace start and the preview, restoring the previewed vertex
     * @private
     */
    _reset() {
        this._restoreAnchorVertex();
        this._anchor = null;
        this._preview = null;
        this._drawGuide(null);
    }

    /**
     * Wrap the callbacks of the draw handler:
     * - modify, called when the sketch point moves, previews the traced path
     * - point, called when a vertex is added, adds the traced vertices
     * @param {object} drawControl - The OL2 DrawFeature control
     * @private
     */
    _wrapDrawControl(drawControl) {
        const handler = drawControl?.handler;
        if (!handler?.callbacks || this._wrappedHandlers.has(handler)) {
            return;
        }
        this._wrappedHandlers.add(handler);

        const self = this;
        const originalModify = handler.callbacks.modify;
        handler.callbacks.modify = function (vertex, ...args) {
            // Snapping, triggered by the original callback, moves the cursor on the feature first
            if (originalModify) {
                originalModify.call(this, vertex, ...args);
            }
            self._onSketchModified(handler, vertex);
        };

        const originalPoint = handler.callbacks.point;
        handler.callbacks.point = function (...args) {
            self._onPointAdded(handler);
            if (originalPoint) {
                originalPoint.call(this, ...args);
            }
        };

        // Each new geometry starts without trace
        drawControl.layer?.events.register('sketchcomplete', this, () => this._reset());
    }

    /**
     * Index of the last fixed vertex in the sketch
     * @param {object} handler - The OL2 draw handler
     * @returns {number} the index, -1 if there is none
     * @private
     */
    _lastFixedIndex(handler) {
        return handler.line ? handler.getCurrentPointIndex() - 1 : -1;
    }

    /**
     * Preview the traced path between the trace start and the cursor
     * @param {object} handler - The OL2 draw handler
     * @param {object} vertex  - The sketch point, OL2 point geometry
     * @private
     */
    _onSketchModified(handler, vertex) {
        if (!this._active || !this._anchor) {
            return;
        }
        if (this._anchor.index !== this._lastFixedIndex(handler)) {
            // The sketch changed (undo, new geometry): forget the trace start
            this._anchor = null;
            this._preview = null;
            this._drawGuide(null);
            return;
        }

        this._restoreAnchorVertex();
        this._preview = null;

        const cursor = [vertex.x, vertex.y];
        const tolerance = this._tolerance();
        let best = null;
        for (const candidate of this._anchor.candidates) {
            const location = locateOnPath(candidate.path.points, candidate.path.closed, cursor);
            if (location && location.distance <= tolerance && (best === null || location.distance < best.location.distance)) {
                best = { candidate: candidate, location: location };
            }
        }

        const traced = best
            ? tracePath(best.candidate.path.points, best.candidate.path.closed, best.candidate.location, best.location)
            : [];
        if (traced.length < 2) {
            this._drawGuide(null);
            return;
        }

        const offsetPath = this._offsetPath(traced);

        // Join with the previous traced part
        if (this._anchor.lastSegment) {
            const corner = intersectLines(this._anchor.lastSegment, [offsetPath[0], offsetPath[1]]);
            const maxJoin = 5 * Math.abs(this._offsetInMapUnits(traced[0], traced[1]));
            if (corner && Math.hypot(corner[0] - this._anchor.original[0], corner[1] - this._anchor.original[1]) <= maxJoin) {
                offsetPath[0] = corner;
            } else {
                offsetPath[0] = this._anchor.original;
            }
        }

        // Move the trace start and the sketch point
        this._setVertex(handler.line.geometry.components[this._anchor.index], offsetPath[0]);
        const end = offsetPath[offsetPath.length - 1];
        vertex.x = end[0];
        vertex.y = end[1];

        this._preview = {
            anchorIndex: this._anchor.index,
            path: best.candidate.path,
            location: best.location,
            offsetPath: offsetPath,
        };
        this._drawGuide(offsetPath);
    }

    /**
     * A vertex has been fixed: add the previewed traced vertices,
     * then make the fixed vertex the next trace start
     * @param {object} handler - The OL2 draw handler
     * @private
     */
    _onPointAdded(handler) {
        if (!this._active || !handler.line) {
            return;
        }
        const geometry = handler.line.geometry;
        const fixedIndex = this._lastFixedIndex(handler);
        const preview = this._preview;

        if (preview && this._anchor && preview.anchorIndex === this._anchor.index && fixedIndex === this._anchor.index + 1) {
            const offsetPath = preview.offsetPath;
            // Intermediate vertices between the trace start and the fixed vertex
            for (let k = 1; k < offsetPath.length - 1; k++) {
                geometry.addComponent(
                    new OpenLayers.Geometry.Point(offsetPath[k][0], offsetPath[k][1]),
                    this._anchor.index + k
                );
            }
            const endIndex = this._anchor.index + offsetPath.length - 1;
            const end = offsetPath[offsetPath.length - 1];
            this._setVertex(geometry.components[endIndex], end);
            geometry.clearBounds();

            this._anchor = {
                index: endIndex,
                original: end,
                candidates: [{ path: preview.path, location: preview.location }],
                lastSegment: [offsetPath[offsetPath.length - 2], end],
            };
        } else {
            this._restoreAnchorVertex();
            this._anchor = this._createAnchor(geometry.components[fixedIndex], fixedIndex);
        }
        this._preview = null;
        this._drawGuide(null);
    }

    /**
     * Create a trace start from a fixed vertex lying on snapping features
     * @param {object} vertex - The OL2 point geometry
     * @param {number} index  - The vertex index in the sketch
     * @returns {object|null} the trace start, null if the vertex is not on a feature
     * @private
     */
    _createAnchor(vertex, index) {
        if (!vertex) {
            return null;
        }
        const coord = [vertex.x, vertex.y];
        const tolerance = this._tolerance();
        const candidates = [];
        for (const path of this._getPaths()) {
            if (coord[0] < path.bounds[0] - tolerance || coord[0] > path.bounds[2] + tolerance
                || coord[1] < path.bounds[1] - tolerance || coord[1] > path.bounds[3] + tolerance) {
                continue;
            }
            const location = locateOnPath(path.points, path.closed, coord);
            if (location && location.distance <= tolerance) {
                candidates.push({ path: path, location: location });
            }
        }
        if (candidates.length === 0) {
            return null;
        }
        return {
            index: index,
            original: coord,
            candidates: candidates,
            lastSegment: null,
        };
    }

    /**
     * Put the trace start vertex back where it was fixed
     * @private
     */
    _restoreAnchorVertex() {
        const components = this._drawHandler?.line?.geometry.components;
        if (this._anchor && components?.[this._anchor.index]) {
            this._setVertex(components[this._anchor.index], this._anchor.original);
        }
    }

    /**
     * Move an OL2 point
     * @param {object}   point - OL2 point geometry
     * @param {number[]} coord - the new coordinate
     * @private
     */
    _setVertex(point, coord) {
        if (point && (point.x !== coord[0] || point.y !== coord[1])) {
            point.x = coord[0];
            point.y = coord[1];
            point.clearBounds();
        }
    }

    /**
     * Offset a traced path with the offset distance
     * @param {number[][]} traced - the traced coordinates
     * @returns {number[][]} the offset path
     * @private
     */
    _offsetPath(traced) {
        if (this._offset === 0) {
            return traced.map(coord => [coord[0], coord[1]]);
        }
        const distances = [];
        for (let k = 0; k < traced.length - 1; k++) {
            distances.push(this._offsetInMapUnits(traced[k], traced[k + 1]));
        }
        return offsetPolyline(traced, distances);
    }

    /**
     * The offset distance in map units for a segment,
     * consistent with the geodesic segment length displayed by the edition.
     * The scale is measured perpendicular to the segment, the offset direction,
     * because it differs from the scale along the segment in a geographic projection
     * and, slightly, in EPSG:3857.
     * The probe is centered on the middle of the segment and spans about 100 pixels:
     * OpenLayers rounds geodesic distances to the millimeter, so a short probe is imprecise.
     * @param {number[]} a - segment start
     * @param {number[]} b - segment end
     * @returns {number} the signed offset in map units
     * @private
     */
    _offsetInMapUnits(a, b) {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const planar = Math.hypot(dx, dy);
        if (planar === 0 || this._offset === 0) {
            return this._offset;
        }
        const halfProbe = 50 * this._lizmap3.map.getResolution();
        const nx = -dy / planar;
        const ny = dx / planar;
        const middle = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const geodesic = new OpenLayers.Geometry.LineString([
            new OpenLayers.Geometry.Point(middle[0] - nx * halfProbe, middle[1] - ny * halfProbe),
            new OpenLayers.Geometry.Point(middle[0] + nx * halfProbe, middle[1] + ny * halfProbe),
        ]).getGeodesicLength(this._lizmap3.map.getProjectionObject());
        return geodesic > 0 ? this._offset * 2 * halfProbe / geodesic : this._offset;
    }

    /**
     * Tolerance in map units to find the traced feature
     * @returns {number} the tolerance
     * @private
     */
    _tolerance() {
        const pixels = parseFloat(this._snapping.config?.snap_segments_tolerance) || DEFAULT_TOLERANCE_PX;
        return pixels * this._lizmap3.map.getResolution();
    }

    /**
     * Get the paths (lines and rings) of the snapping features
     * @returns {Array<{points: number[][], closed: boolean, bounds: number[]}>} the paths
     * @private
     */
    _getPaths() {
        if (this._paths === null) {
            this._paths = [];
            for (const feature of this._snapping.snapLayer?.features ?? []) {
                if (feature.geometry) {
                    this._collectPaths(feature.geometry, this._paths);
                }
            }
        }
        return this._paths;
    }

    /**
     * Collect the paths of an OL2 geometry
     * @param {object} geometry - OL2 geometry
     * @param {Array}  paths    - The array to fill
     * @private
     */
    _collectPaths(geometry, paths) {
        switch (geometry.CLASS_NAME) {
            case 'OpenLayers.Geometry.LineString':
            case 'OpenLayers.Geometry.LinearRing': {
                const points = geometry.components.map(p => [p.x, p.y]);
                let closed = geometry.CLASS_NAME === 'OpenLayers.Geometry.LinearRing';
                const first = points[0];
                const last = points[points.length - 1];
                if (points.length > 2 && first[0] === last[0] && first[1] === last[1]) {
                    closed = true;
                    points.pop();
                }
                if (points.length > 1) {
                    const xs = points.map(p => p[0]);
                    const ys = points.map(p => p[1]);
                    paths.push({
                        points: points,
                        closed: closed,
                        bounds: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
                    });
                }
                break;
            }
            case 'OpenLayers.Geometry.Polygon':
            case 'OpenLayers.Geometry.MultiLineString':
            case 'OpenLayers.Geometry.MultiPolygon':
            case 'OpenLayers.Geometry.Collection':
                for (const component of geometry.components) {
                    this._collectPaths(component, paths);
                }
                break;
        }
    }

    /**
     * Draw the previewed traced path
     * @param {number[][]|null} coords - the path to draw, null to clear
     * @private
     */
    _drawGuide(coords) {
        this._guideLayer.destroyFeatures();
        if (!coords || coords.length < 2) {
            this._guideLayer.setVisibility(false);
            return;
        }
        this._guideLayer.addFeatures([
            new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(
                coords.map(c => new OpenLayers.Geometry.Point(c[0], c[1]))
            )),
        ]);
        this._guideLayer.setVisibility(true);
        // Keep the preview on top of the other layers
        this._lizmap3.map.setLayerIndex(this._guideLayer, this._lizmap3.map.layers.length - 1);
    }

    /**
     * Dispatch the change event
     * @private
     */
    _dispatchChange() {
        /**
         * @event editionTraceChanged
         * @type {object}
         * @property {string} type - edition.trace.changed
         */
        mainEventDispatcher.dispatch('edition.trace.changed');
    }
}
