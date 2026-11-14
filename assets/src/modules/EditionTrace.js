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
    offsetPolyline,
    TraceGraph,
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
 * snapping becomes the trace start. Moving the cursor over the snapping features
 * previews the shortest route to it through their network, across the junctions
 * where they meet or cross, and the next click adds the traced vertices.
 * An offset distance in meters shifts the traced route: positive to the left
 * of the drawing direction, negative to the right.
 *
 * The OL2 draw handler is wrapped: its modify and point callbacks preview and
 * add the traced vertices, insertXY and finalize, which add or finish without
 * these callbacks, first put the trace start back where it was fixed.
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
        // Paths of the snapping features and their network, built on demand
        this._paths = null;
        this._graph = null;
        // The missing snapping features message is displayed once per activation
        this._noFeatureNotified = false;
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
        this._guideFeature = null;

        // Rebuild the paths and their network when the snapping features change
        const resetPaths = () => {
            this._paths = null;
            this._graph = null;
        };
        const snapLayer = this._snapping.snapLayer;
        snapLayer?.events.on({
            featuresadded: resetPaths,
            featuresremoved: resetPaths,
            scope: this,
        });

        mainEventDispatcher.addListener(
            () => {
                if (this._edition.drawFeatureActivated) {
                    this._wrapDrawControl(this._edition.drawControl);
                    this._dropAnchor();
                } else {
                    this.active = false;
                }
                this._dispatchChange();
            },
            'edition.drawFeatureActivated'
        );

        // Snapping is stopped and its configuration removed when the edition form is closed
        mainEventDispatcher.addListener(
            () => {
                if (!this._snapping.active) {
                    this.active = false;
                }
            },
            'snapping.active'
        );
        mainEventDispatcher.addListener(
            () => {
                if (this._active && !this.available) {
                    this.active = false;
                }
            },
            'snapping.config'
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
        const config = this._snapping.config;
        if (config === undefined) {
            return 'edition.trace.unavailable.snapping';
        }
        if (!['line', 'polygon'].includes(this._editedGeometryType())) {
            return 'edition.trace.unavailable.geometry';
        }
        if (!this._edition.drawFeatureActivated) {
            return 'edition.trace.unavailable.drawing';
        }
        const enabledLayers = (config.snap_layers ?? []).filter(
            layerId => config.snap_enabled?.[layerId] && config.snap_on_layers?.[layerId]
        );
        if (enabledLayers.length === 0) {
            return 'edition.trace.unavailable.nolayer';
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
            'edition.trace.unavailable.nolayer': 'Tracing follows the snapping features: enable at least one visible snapping layer.',
            'edition.trace.nofeature': 'No snapping feature is loaded to trace: show a snapping layer or refresh the snapping data.',
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
        this._dropAnchor();
        if (active) {
            this._noFeatureNotified = false;
            // Keep the preview on top of the other layers
            this._lizmap3.map.setLayerIndex(this._guideLayer, this._lizmap3.map.layers.length - 1);
            if (!this._snapping.active) {
                this._snapping.active = true;
            }
        }
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
     * Wrap the draw handler:
     * - the modify callback, called when the sketch point moves, previews the traced path
     * - the point callback, called when a vertex is added by a click, adds the traced vertices
     * - insertXY, which adds a vertex from its coordinates, and finalize, which finishes or
     *   cancels the sketch, put the trace start back where it was fixed: they do not call
     *   the point callback, the previewed path is not added
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

        const originalInsertXY = handler.insertXY;
        handler.insertXY = function (...args) {
            self._dropAnchor();
            const result = originalInsertXY.apply(this, args);
            self._onVertexInserted(handler);
            return result;
        };

        const originalFinalize = handler.finalize;
        handler.finalize = function (...args) {
            self._dropAnchor();
            return originalFinalize.apply(this, args);
        };
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
        const components = handler.line.geometry.components;
        if (components[this._lastFixedIndex(handler)] !== this._anchor.point) {
            // The trace start is not the last fixed vertex anymore (undo, new geometry)
            this._dropAnchor();
            return;
        }

        this._restoreAnchorVertex();
        this._preview = null;

        const graph = this._getGraph();
        const tolerance = this._tolerance();
        const anchor = this._anchor;
        if (anchor.graph !== graph) {
            // The snapping features changed: locate the trace start on their new network
            anchor.graph = graph;
            anchor.location = graph.locate(anchor.raw, tolerance);
            anchor.tree = null;
        }
        const target = anchor.location ? graph.locate([vertex.x, vertex.y], tolerance) : null;
        if (target) {
            // One shortest path search per trace start, the routes to the cursor are read from it
            anchor.tree ??= graph.shortestPathTree(anchor.location);
        }
        const traced = target ? graph.route(anchor.tree, target) : null;
        if (!traced || traced.coords.length < 2) {
            this._drawGuide(null);
            return;
        }

        const offsetPath = this._offsetPath(traced);

        // Join with the previous traced part
        if (this._anchor.lastSegment) {
            const corner = intersectLines(this._anchor.lastSegment, [offsetPath[0], offsetPath[1]]);
            const first = traced.segments[0];
            const maxJoin = 5 * Math.abs(this._offset * this._mapUnitsPerMeter(first.path, first.segment));
            if (corner && Math.hypot(corner[0] - this._anchor.original[0], corner[1] - this._anchor.original[1]) <= maxJoin) {
                offsetPath[0] = corner;
            } else {
                offsetPath[0] = this._anchor.original;
            }
        }

        // Move the trace start and the sketch point
        this._setVertex(this._anchor.point, offsetPath[0]);
        const end = offsetPath[offsetPath.length - 1];
        vertex.x = end[0];
        vertex.y = end[1];

        this._preview = {
            anchorPoint: this._anchor.point,
            graph: graph,
            location: target,
            offsetPath: offsetPath,
        };
        this._drawGuide(offsetPath);
    }

    /**
     * A vertex has been fixed by a click: add the previewed traced vertices,
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
        const anchor = this._anchor;

        if (preview && anchor && preview.anchorPoint === anchor.point && geometry.components[fixedIndex - 1] === anchor.point) {
            const anchorIndex = fixedIndex - 1;
            const offsetPath = preview.offsetPath;
            // Intermediate vertices between the trace start and the fixed vertex
            for (let k = 1; k < offsetPath.length - 1; k++) {
                geometry.addComponent(
                    new OpenLayers.Geometry.Point(offsetPath[k][0], offsetPath[k][1]),
                    anchorIndex + k
                );
            }
            const endPoint = geometry.components[anchorIndex + offsetPath.length - 1];
            const end = offsetPath[offsetPath.length - 1];
            this._setVertex(endPoint, end);
            geometry.clearBounds();

            // The next trace starts where this one ends on the network
            this._anchor = {
                point: endPoint,
                original: end,
                raw: preview.location.coord,
                graph: preview.graph,
                location: preview.location,
                tree: null,
                lastSegment: [offsetPath[offsetPath.length - 2], end],
            };
        } else {
            this._restoreAnchorVertex();
            this._anchor = this._createAnchor(geometry.components[fixedIndex]);
            if (!this._anchor) {
                this._notifyMissingFeatures();
            }
        }
        this._preview = null;
        this._drawGuide(null);
    }

    /**
     * A vertex has been added from its coordinates: it can start a trace
     * @param {object} handler - The OL2 draw handler
     * @private
     */
    _onVertexInserted(handler) {
        if (this._active && handler.line) {
            this._anchor = this._createAnchor(handler.line.geometry.components[this._lastFixedIndex(handler)]);
        }
    }

    /**
     * Tell once per activation that no snapping feature is loaded to trace
     * @private
     */
    _notifyMissingFeatures() {
        if (this._noFeatureNotified || this._getPaths().length > 0) {
            return;
        }
        this._noFeatureNotified = true;
        this._lizmap3.addMessage(EditionTrace.translate('edition.trace.nofeature'), 'info', true, 7000);
    }

    /**
     * Create a trace start from a fixed vertex lying on snapping features
     * @param {object} vertex - The OL2 point geometry
     * @returns {object|null} the trace start, null if the vertex is not on a feature
     * @private
     */
    _createAnchor(vertex) {
        if (!vertex) {
            return null;
        }
        const coord = [vertex.x, vertex.y];
        const graph = this._getGraph();
        const location = graph.locate(coord, this._tolerance());
        if (!location) {
            return null;
        }
        return {
            point: vertex,
            original: coord,
            raw: location.coord,
            graph: graph,
            location: location,
            tree: null,
            lastSegment: null,
        };
    }

    /**
     * Get the network of the snapping feature paths
     * @returns {TraceGraph} the network
     * @private
     */
    _getGraph() {
        if (this._graph === null) {
            this._graph = new TraceGraph(this._getPaths());
        }
        return this._graph;
    }

    /**
     * Put the trace start vertex back where it was fixed, and forget the trace start
     * @private
     */
    _dropAnchor() {
        const moved = this._restoreAnchorVertex();
        this._anchor = null;
        this._preview = null;
        this._drawGuide(null);
        if (moved && this._drawHandler?.line) {
            this._drawHandler.drawFeature();
        }
    }

    /**
     * Put the trace start vertex back where it was fixed.
     * The vertex is tracked as an object: once removed from the sketch, moving it has no effect.
     * @returns {boolean} true if the vertex has been moved
     * @private
     */
    _restoreAnchorVertex() {
        if (!this._anchor) {
            return false;
        }
        return this._setVertex(this._anchor.point, this._anchor.original);
    }

    /**
     * Move an OL2 point
     * @param {object}   point - OL2 point geometry
     * @param {number[]} coord - the new coordinate
     * @returns {boolean} true if the point has been moved
     * @private
     */
    _setVertex(point, coord) {
        if (!point || (point.x === coord[0] && point.y === coord[1])) {
            return false;
        }
        point.x = coord[0];
        point.y = coord[1];
        point.clearBounds();
        point.parent?.clearBounds();
        return true;
    }

    /**
     * Offset a traced route with the offset distance
     * @param {{coords: number[][], segments: Array<{path: object, segment: number}>}} traced - the traced
     *        coordinates and the path segment of each traced segment
     * @returns {number[][]} the offset route
     * @private
     */
    _offsetPath(traced) {
        if (this._offset === 0) {
            return traced.coords.map(coord => [coord[0], coord[1]]);
        }
        const distances = traced.segments.map(
            ({ path, segment }) => this._offset * this._mapUnitsPerMeter(path, segment)
        );
        return offsetPolyline(traced.coords, distances);
    }

    /**
     * Map units per meter in the offset direction of a path segment,
     * consistent with the geodesic segment length displayed by the edition.
     * The scale is measured perpendicular to the segment, the offset direction,
     * because it differs from the scale along the segment in a geographic projection
     * and, slightly, in EPSG:3857.
     * The probe is centered on the middle of the segment and spans about 100 pixels:
     * OpenLayers rounds geodesic distances to the millimeter, so a short probe is imprecise.
     * The scale is cached on the path, rebuilt when the snapping features change.
     * @param {object} path    - the path
     * @param {number} segment - the segment index
     * @returns {number} the map units per meter
     * @private
     */
    _mapUnitsPerMeter(path, segment) {
        path.scales ??= [];
        if (path.scales[segment] !== undefined) {
            return path.scales[segment];
        }
        const a = path.points[segment];
        const b = path.points[(segment + 1) % path.points.length];
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const planar = Math.hypot(dx, dy);
        let scale = 1;
        if (planar > 0) {
            const halfProbe = 50 * this._lizmap3.map.getResolution();
            const nx = -dy / planar;
            const ny = dx / planar;
            const middle = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
            const geodesic = new OpenLayers.Geometry.LineString([
                new OpenLayers.Geometry.Point(middle[0] - nx * halfProbe, middle[1] - ny * halfProbe),
                new OpenLayers.Geometry.Point(middle[0] + nx * halfProbe, middle[1] + ny * halfProbe),
            ]).getGeodesicLength(this._lizmap3.map.getProjectionObject());
            if (geodesic > 0) {
                scale = 2 * halfProbe / geodesic;
            }
        }
        path.scales[segment] = scale;
        return scale;
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
     * @returns {Array<{points: number[][], closed: boolean}>} the paths
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
                    paths.push({ points: points, closed: closed });
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
     * Draw the previewed traced path, with a single feature updated in place
     * @param {number[][]|null} coords - the path to draw, null to hide it
     * @private
     */
    _drawGuide(coords) {
        if (!coords || coords.length < 2) {
            this._guideLayer.setVisibility(false);
            return;
        }
        const geometry = new OpenLayers.Geometry.LineString(
            coords.map(c => new OpenLayers.Geometry.Point(c[0], c[1]))
        );
        if (this._guideFeature === null) {
            this._guideFeature = new OpenLayers.Feature.Vector(geometry);
            this._guideLayer.addFeatures([this._guideFeature]);
        } else {
            // Remove the rendered previous geometry before drawing the new one
            this._guideLayer.eraseFeatures([this._guideFeature]);
            this._guideFeature.geometry = geometry;
            this._guideLayer.drawFeature(this._guideFeature);
        }
        this._guideLayer.setVisibility(true);
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
