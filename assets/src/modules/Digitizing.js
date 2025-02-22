/**
 * @module modules/Digitizing.js
 * @name Digitizing
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */
import { mainEventDispatcher } from '../modules/Globals.js';
import { deepFreeze } from './config/Tools.js';
import { createEnum } from './utils/Enums.js';
import { Utils } from './Utils.js';

import GeoJSON from 'ol/format/GeoJSON.js';
import GPX from 'ol/format/GPX.js';
import KML from 'ol/format/KML.js';
import WKT from 'ol/format/WKT.js';

import { Draw, Modify, Select, Translate } from 'ol/interaction.js';
import { createBox } from 'ol/interaction/Draw.js';

import { Circle, Fill, Stroke, RegularShape, Style, Text } from 'ol/style.js';

import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { Feature } from 'ol';

import {
    LinearRing,
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    Point,
    Polygon,
    Circle as CircleGeom,
    GeometryCollection
} from 'ol/geom.js';

import { circular, fromCircle } from 'ol/geom/Polygon.js';

import { getArea, getLength } from 'ol/sphere.js';
import Overlay from 'ol/Overlay.js';
import { unByKey } from 'ol/Observable.js';

import { transform } from 'ol/proj.js';

import shp from 'shpjs';
import * as flatgeobuf from 'flatgeobuf';
import { register } from "ol/proj/proj4.js";
import proj4 from "proj4";

import Transform from "ol-ext/interaction/Transform.js";

/**
 * Enum for digitizing tools
 * @enum {string}
 * @property {string} Deactivate - Deactivate digitizing tools
 * @property {string} Point - Point digitizing tool
 * @property {string} Line - Line digitizing tool
 * @property {string} Polygon - Polygon digitizing tool
 * @property {string} Box - Box digitizing tool
 * @property {string} Circle - Circle digitizing tool
 * @property {string} Freehand - Freehand digitizing tool
 * @property {string} Text - Text digitizing tool
 */
export const DigitizingTools = createEnum({
    'Deactivate': 'deactivate',
    'Point': 'point',
    'Line': 'line',
    'Polygon': 'polygon',
    'Box': 'box',
    'Circle': 'circle',
    'Freehand': 'freehand',
    'Text': 'text'
});

/**
 * List of digitizing available tools
 * @name DigitizingAvailableTools
 * @constant {Array<string>}
 */
export const DigitizingAvailableTools = deepFreeze([
    DigitizingTools.Deactivate,
    DigitizingTools.Point,
    DigitizingTools.Line,
    DigitizingTools.Polygon,
    DigitizingTools.Box,
    DigitizingTools.Circle,
    DigitizingTools.Freehand,
    DigitizingTools.Text
]);

/**
 * @class
 * @name Digitizing
 */
export class Digitizing {

    constructor(map, lizmap3) {

        this._map = map;
        this._lizmap3 = lizmap3;

        // defined a context to separate drawn features
        this._context = 'draw';
        this._contextFeatures = {};

        this._tools = DigitizingAvailableTools;
        this._toolSelected = this._tools[0];

        this._repoAndProjectString =
            globalThis['lizUrls'].params.repository +
            '_' +
            globalThis['lizUrls'].params.project;

        // Set draw color to value in local storage if any or default (red)
        this._drawColor = localStorage.getItem(this._repoAndProjectString + '_drawColor') || '#ff0000';

        this._isEdited = false;
        this._isRotate = false;
        this._hasMeasureVisible = false;
        this._isSaved = false;
        this._isSplitting = false;
        this._isErasing = false;

        this._drawInteraction;

        this._segmentMeasureTooltipElement;
        this._totalMeasureTooltipElement;

        // Array with pair of tooltips
        // First is for current segment measure
        // Second is for total geom measure
        this._measureTooltips = new Set();

        this._pointRadius = 8;
        this._fillOpacity = 0.2;
        this._strokeWidth = 2;

        this._selectInteraction = new Select({
            wrapX: false,
            style: (feature) => {
                let color = feature.get('color') || this._drawColor;

                if (feature.get('mode') === 'textonly') {
                    color = '#FFF0';
                }
                const featureText = feature.get('text');
                const featureTextRotation = feature.get('rotation') * (Math.PI / 180.0) || null;
                const featureTextScale = feature.get('scale');
                return [
                    new Style({
                        image: new Circle({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: 'rgba(255, 255, 255, 0.5)',
                                width: this._strokeWidth + 4
                            }),
                            radius: this._pointRadius,
                        }),
                        fill: new Fill({
                            color: color + '33', // Opacity: 0.2
                        }),
                        stroke: new Stroke({
                            color: 'rgba(255, 255, 255, 0.5)',
                            width: this._strokeWidth + 8
                        }),
                        text: new Text({
                            text: featureText,
                            rotation: featureTextRotation,
                            scale: featureTextScale,
                            overflow: true,
                            fill: new Fill({
                                color: '#000',
                            }),
                            stroke: new Stroke({
                                color: '#fff',
                                width: 4,
                            }),
                        })
                    }),
                    new Style({
                        stroke: new Stroke({
                            color: color,
                            width: this._strokeWidth
                        }),
                    }),
                    new Style({
                        image: new Circle({
                            radius: 5,
                            fill: new Fill({
                                color: color,
                            }),
                        }),
                        geometry: feature => {
                            const geometryType = feature.getGeometry().getType();
                            if (geometryType === "LineString") {
                                return new MultiPoint(feature.getGeometry().getCoordinates());
                            }
                            if (geometryType === "Polygon") {
                                // return the coordinates of the first ring of the polygon
                                return new MultiPoint(feature.getGeometry().getCoordinates()[0]);
                            }
                        },
                    }),
                ];
            }
        });

        // Set draw color from selected feature color
        this._selectInteraction.on('select', (event) => {
            if (event.selected.length) {
                this.drawColor = event.selected[0].get('color');
            } else {
                // When a feature is deselected, set the color from the first selected feature if any
                const selectedFeatures = this._selectInteraction.getFeatures().getArray();
                if (selectedFeatures.length) {
                    this.drawColor = selectedFeatures[0].get('color');
                }
            }
        });

        this._modifyInteraction = new Modify({
            features: this._selectInteraction.getFeatures(),
        });

        this._translateInteraction = new Translate({
            features: this._selectInteraction.getFeatures(),
            hitTolerance: 20
        });

        this._transformInteraction = new Transform({
            rotate: true,
            scale: false,
        });

        this._drawStyleFunction = (feature) => {
            let color = feature.get('color') || this._drawColor;

            if (feature.get('mode') === 'textonly') {
                color = '#FFF0';
            }

            const featureText = feature.get('text');
            const featureTextRotation = feature.get('rotation') * (Math.PI / 180.0) || null;
            const featureTextScale = feature.get('scale');

            const style = new Style({
                image: new Circle({
                    fill: new Fill({
                        color: color,
                    }),
                    radius: this._pointRadius,
                }),
                fill: new Fill({
                    color: color + '33', // Opacity: 0.2
                }),
                stroke: new Stroke({
                    color: color,
                    width: this._strokeWidth
                }),
                text: new Text({
                    text: featureText,
                    rotation: featureTextRotation,
                    scale: featureTextScale,
                    overflow: true,
                    fill: new Fill({
                        color: '#000',
                    }),
                    stroke: new Stroke({
                        color: '#fff',
                        width: 4,
                    }),
                })
            });

            return style;
        };

        this._drawSource = new VectorSource({ wrapX: false });

        this._drawSource.on('addfeature', (event) => {
            // Set main color if feature does not have one
            if(!event.feature.get('color')){
                event.feature.set('color', this._drawColor);
            }

            // Launch edition mode when text tool is selected
            if (this._toolSelected === 'text') {
                event.feature.set('text', lizDict['digitizing.toolbar.newText']);
                // Set mode 'textonly' to not display point geometry
                event.feature.set('mode', 'textonly');
                this.isEdited = true;
            }

            // Save features drawn in localStorage
            this.saveFeatureDrawn();
            mainEventDispatcher.dispatch('digitizing.featureDrawn');
        });

        this._drawLayer = new VectorLayer({
            source: this._drawSource,
            style: this._drawStyleFunction
        });
        this._drawLayer.setProperties({
            name: 'LizmapDigitizingDrawLayer'
        });

        this._map.addToolLayer(this._drawLayer);

        // Constraint layer
        this._constraintLayer = new VectorLayer({
            source: new VectorSource({ wrapX: false }),
            style: new Style({
                image: new RegularShape({
                    fill: new Fill({
                        color: 'black',
                    }),
                    stroke: new Stroke({
                        color: 'black',
                    }),
                    points: 4,
                    radius: 10,
                    radius2: 0,
                    angle: 0,
                }),
                stroke: new Stroke({
                    color: 'black',
                    lineDash: [10]
                }),
            })
        });
        this._constraintLayer.setProperties({
            name: 'LizmapDigitizingConstraintLayer'
        });
        this._map.addToolLayer(this._constraintLayer);

        // Constraints values
        this._distanceConstraint = 0;
        this._angleConstraint = 0;

        // Load and display saved feature if any
        this.loadFeatureDrawnToMap();

        // Disable drawing tool when measure tool is activated
        this._lizmap3.events.on({
            minidockopened: (e) => {
                if (e.id == 'measure') {
                    this.toolSelected = this._tools[0];
                } else if (['draw', 'selectiontool', 'print'].includes(e.id)) {
                    // Display draw for print redlining
                    this.context = e.id === 'print' ? 'draw' : e.id;
                }
            }
        });
    }

    get drawLayer() {
        return this._drawLayer;
    }

    get context() {
        return this._context;
    }

    get editedFeatures() {
        return this._selectInteraction.getFeatures().getArray();
    }

    get editedFeatureText() {
        if (this.editedFeatures.length === 1) {
            return this.editedFeatures[0].get('text') || '';
        }
        return '';
    }

    set editedFeatureText(text) {
        if (this.editedFeatures.length !== 0) {
            this.editedFeatures.forEach(feature => feature.set('text', text));
            mainEventDispatcher.dispatch('digitizing.editedFeatureText');
        }
    }

    get editedFeatureTextRotation() {
        if (this.editedFeatures.length === 1) {
            return this.editedFeatures[0].get('rotation') || '';
        }
        return '';
    }

    set editedFeatureTextRotation(rotation) {
        if (this.editedFeatures.length !== 0) {
            this.editedFeatures.forEach(feature => feature.set('rotation', rotation));
            mainEventDispatcher.dispatch('digitizing.editedFeatureRotation');
        }
    }

    get editedFeatureTextScale() {
        if (this.editedFeatures.length !== 0) {
            return this.editedFeatures[0].get('scale') || 1;
        }
        return 1;
    }

    set editedFeatureTextScale(scale) {
        if(isNaN(scale)){
            scale = 1;
        }
        if (this.editedFeatures.length !== 0) {
            this.editedFeatures.forEach(feature => feature.set('scale', scale));
            mainEventDispatcher.dispatch('digitizing.editedFeatureScale');
        }
    }

    set context(aContext) {
        if (this._context == aContext) {
            return;
        }
        if (this.featureDrawn) {
            this._contextFeatures[this._context] = this.featureDrawn;
        } else {
            this._contextFeatures[this._context] = null;
        }
        this._isSaved = (
            localStorage.getItem(this._repoAndProjectString + '_' + this._context + '_drawLayer') !== null
        );
        this._measureTooltips.forEach((measureTooltip) => {
            this._map.removeOverlay(measureTooltip[0]);
            this._map.removeOverlay(measureTooltip[1]);
            this._measureTooltips.delete(measureTooltip);
        });
        this._drawLayer.getSource().clear();
        this._context = aContext;
        if (this._contextFeatures[this._context]) {
            const OL6features = this._contextFeatures[this._context];
            if (OL6features) {
                // Add imported features to map and zoom to their extent
                this._drawSource.addFeatures(OL6features);
            }
        } else {
            this.loadFeatureDrawnToMap();
        }
    }

    get toolSelected() {
        return this._toolSelected;
    }

    set toolSelected(tool) {
        if (this._tools.includes(tool)) {
            // Disable all tools
            this._map.removeInteraction(this._drawInteraction);

            // If tool === 'deactivate' or current selected tool is selected again => deactivate
            if (tool === this._toolSelected || tool === this._tools[0]) {
                this._toolSelected = this._tools[0];
            } else {
                const drawOptions = {
                    source: this._drawLayer.getSource(),
                    style: this._drawStyleFunction
                };

                switch (tool) {
                    case this._tools[1]:
                        drawOptions.type = 'Point';
                        break;
                    case this._tools[2]:
                        drawOptions.type = 'LineString';
                        drawOptions.geometryFunction = (coords, geom) => {
                            return this._contraintsHandler(coords, geom, drawOptions.type);
                        }
                        break;
                    case this._tools[3]:
                        drawOptions.type = 'Polygon';
                        drawOptions.geometryFunction = (coords, geom) => {
                            return this._contraintsHandler(coords, geom, drawOptions.type);
                        }
                        break;
                    case this._tools[4]:
                        drawOptions.type = 'Circle';
                        drawOptions.geometryFunction = createBox();
                        break;
                    case this._tools[5]:
                        drawOptions.type = 'Circle';
                        break;
                    case this._tools[6]:
                        drawOptions.type = 'Polygon';
                        drawOptions.freehand = true;
                        break;
                    case this._tools[7]:
                        drawOptions.type = 'Point';
                        drawOptions.style = new Style({
                            text: new Text({
                                text: lizDict['digitizing.toolbar.newText'],
                                fill: new Fill({
                                    color: '#000',
                                }),
                                stroke: new Stroke({
                                    color: '#fff',
                                    width: 4,
                                }),
                            })
                        });
                        break;
                }

                this._drawInteraction = new Draw(drawOptions);

                this._drawInteraction.on('drawstart', event => {
                    this.createMeasureTooltips();
                    this._listener = event.feature.getGeometry().on('change', evt => {
                        const geom = evt.target;
                        if (geom instanceof Polygon) {
                            this._updateTooltips(geom.getCoordinates()[0], geom, 'Polygon');
                        } else if (geom instanceof LineString) {
                            this._updateTooltips(geom.getCoordinates(), geom, 'LineString');
                        } else if (geom instanceof CircleGeom) {
                            this._updateTooltips([geom.getFirstCoordinate(), geom.getLastCoordinate()], geom, 'Circle');
                        }
                    });
                });

                this._drawInteraction.on('drawend', event => {
                    const geom = event.feature.getGeometry();

                    // Close linear ring if needed
                    if (geom instanceof Polygon) {
                        const coordsLinearRing = geom.getCoordinates()[0];
                        if (coordsLinearRing[0] !== coordsLinearRing[coordsLinearRing.length - 1]) {
                            coordsLinearRing.push(coordsLinearRing[0]);
                            geom.setCoordinates([coordsLinearRing]);
                        }
                    }

                    // Attach total overlay to its geom to update
                    // content when the geom is modified
                    geom.set('totalOverlay', Array.from(this._measureTooltips).pop()[1], true);
                    geom.on('change', (e) => {
                        const geom = e.target;
                        this._setTooltipContentByGeom(geom);
                    });

                    this._constraintLayer.setVisible(false);

                    // Remove segment measure and change total measure tooltip style
                    this._segmentMeasureTooltipElement.remove();
                    this._totalMeasureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
                    this._totalMeasureTooltipElement.classList.toggle('hide', !this._hasMeasureVisible);

                    // unset tooltips so that new ones can be created
                    this._segmentMeasureTooltipElement = null;
                    this._totalMeasureTooltipElement = null;
                    unByKey(this._listener);

                    if (geom.getType() === 'LineString') {
                        this._updateTotalMeasureTooltip(
                            null,
                            geom,
                            'LineString',
                            Array.from(this._measureTooltips).pop()[1],
                        );
                    }
                });

                this._map.addInteraction(this._drawInteraction);

                this._toolSelected = tool;

                // Disable other tools when digitizing tool changes
                this.isEdited = false;
                this.isErasing = false;
                this.isRotate = false;
                this.isSplitting = false;
            }

            mainEventDispatcher.dispatch('digitizing.toolSelected');
        }
    }

    get drawColor() {
        return this._drawColor;
    }

    set drawColor(color) {
        this._drawColor = color;
        // Save color
        localStorage.setItem(this._repoAndProjectString + '_drawColor', this._drawColor);
        mainEventDispatcher.dispatch('digitizing.drawColor');
    }

    get featureDrawn() {
        const features = this._drawLayer.getSource().getFeatures();
        if (features.length) {
            return features;
        }
        return null;
    }

    /**
     * Is digitizing tool active or not
     * @todo active state should be set on UI's events
     * @readonly
     * @memberof Digitizing
     * @returns {boolean} true if digitizing tool is active, false otherwise
     */
    get isActive() {
        const isActive = document.getElementById('button-draw')?.parentElement?.classList?.contains('active');
        return isActive ? true : false;
    }

    get isEdited() {
        return this._isEdited;
    }

    set isEdited(edited) {
        if (this._isEdited !== edited) {
            this._isEdited = edited;

            if (this._isEdited) {
                // Automatically edit the feature if unique
                if (this.featureDrawn.length === 1) {
                    this._selectInteraction.getFeatures().push(this.featureDrawn[0]);
                    this.drawColor = this.featureDrawn[0].get('color');
                }

                this._map.removeInteraction(this._drawInteraction);

                this._map.addInteraction(this._translateInteraction);
                this._map.addInteraction(this._selectInteraction);
                this._map.addInteraction(this._modifyInteraction);

                this.toolSelected = 'deactivate';
                this.isErasing = false;
                this.isRotate = false;
                this.isSplitting = false;

                mainEventDispatcher.dispatch('digitizing.editionBegins');
            } else {
                // Clear selection
                this._selectInteraction.getFeatures().clear();
                this._map.removeInteraction(this._translateInteraction);
                this._map.removeInteraction(this._selectInteraction);
                this._map.removeInteraction(this._modifyInteraction);

                this.saveFeatureDrawn();

                mainEventDispatcher.dispatch('digitizing.editionEnds');
            }
        }
    }

    get isRotate() {
        return this._isRotate;
    }

    set isRotate(isRotate) {
        if (this._isRotate !== isRotate) {
            this._isRotate = isRotate;

            if (this._isRotate) {
                this.toolSelected = 'deactivate';
                this.isErasing = false;
                this.isEdited = false;
                this.isSplitting = false;

                this._map.addInteraction(this._transformInteraction);
            } else {
                this._map.removeInteraction(this._transformInteraction);
            }

            mainEventDispatcher.dispatch('digitizing.rotate');
        }
    }

    get isSplitting() {
        return this._isSplitting;
    }

    set isSplitting(isSplitting) {
        if (this._isSplitting !== isSplitting) {
            this._isSplitting = isSplitting;

            if (this._isSplitting) {
                // Disable other tools
                this.toolSelected = 'deactivate';
                this.isEdited = false;
                this.isRotate = false;
                this.isErasing = false;

                this._splitInteraction = new Draw({
                    source: this._drawSource,
                    type: 'LineString'
                });
                this._splitInteraction.on('drawend', event => {
                    Promise.all([
                        import(
                            /* webpackChunkName: 'OLparser' */ 'jsts/org/locationtech/jts/io/OL3Parser.js'
                        ),
                        import(
                            /* webpackChunkName: 'UnionOp' */ 'jsts/org/locationtech/jts/operation/union/UnionOp.js'
                        ),
                        import(
                            /* webpackChunkName: 'Polygonizer' */
                            'jsts/org/locationtech/jts/operation/polygonize/Polygonizer.js'
                        ),
                        import(
                            /* webpackChunkName: 'lineSplit' */ '@turf/line-split'
                        ),
                    ]).then(([
                        { default: OLparser },
                        { default: UnionOp },
                        { default: Polygonizer },
                        { default: lineSplit }
                    ]) => {
                        const parser = new OLparser();
                        parser.inject(
                            Point,
                            LineString,
                            LinearRing,
                            Polygon,
                            MultiPoint,
                            MultiLineString,
                            MultiPolygon
                        );

                        const lineGeometry = event.feature.getGeometry();

                        // Remove line used for splitting
                        this._drawSource.removeFeature(event.feature);

                        for (const feature of this._drawSource.getFeatures()) {
                            // Check if split line intersects with drawn feature
                            if (!lineGeometry.intersectsExtent(feature.getGeometry().getExtent())) {
                                continue;
                            }
                            const geomType = feature.getGeometry().getType();
                            if ( geomType === 'Polygon') {
                                // Convert the OpenLayers geometry to a JSTS geometry
                                const jstsLine = parser.read(lineGeometry);
                                const jstsDrawnGeom = parser.read(feature.getGeometry());

                                // Perform union of Polygon and Line and use Polygonizer to split the polygon by line
                                let union = UnionOp.union(jstsDrawnGeom.getExteriorRing(), jstsLine);
                                let polygonizer = new Polygonizer();

                                // Splitting polygon in two parts
                                polygonizer.add(union);
                                let polygons = polygonizer.getPolygons();

                                // This will execute only if polygon is successfully splitted into two parts
                                if (polygons.array.length == 2) {
                                    // Remove original polygon
                                    this._drawSource.removeFeature(feature);

                                    // Iterate through splitted polygons
                                    polygons.array.forEach(geom => {
                                        let splitted_polygon = new Feature({
                                            geometry: new Polygon(parser.write(geom).getCoordinates())
                                        });

                                        // Add splitted polygon to vector layer
                                        this._drawSource.addFeature(splitted_polygon);
                                        this._selectInteraction.getFeatures().push(splitted_polygon);
                                    });

                                    this.isEdited = true;
                                }
                            } else if (geomType === 'LineString') {
                                const format = new GeoJSON();
                                const turfDrawnFeature = format.writeFeatureObject(feature);
                                const turfSplitterFeature = format.writeFeatureObject(event.feature);

                                const split = lineSplit(turfDrawnFeature, turfSplitterFeature);

                                if (split.features.length > 1) {
                                    // Remove original lineString
                                    this._drawSource.removeFeature(feature);

                                    split.features.forEach((feature) => {
                                        let splitted_line = format.readFeature(feature);
                                        this._drawSource.addFeature(splitted_line);
                                        this._selectInteraction.getFeatures().push(splitted_line);
                                    });
                                }
                                this.isEdited = true;
                            }
                        }
                    });
                });
                this._map.addInteraction(this._splitInteraction);
            } else {
                this._map.removeInteraction(this._splitInteraction);
            }

            mainEventDispatcher.dispatch('digitizing.split');
        }
    }

    get isErasing() {
        return this._isErasing;
    }

    set isErasing(isErasing) {
        if (this._isErasing !== isErasing) {
            this._isErasing = isErasing;

            if (this._isErasing) {
                // deactivate other tools
                this.toolSelected = 'deactivate';
                this.isEdited = false;
                this.isRotate = false;
                this.isSplitting = false;

                this._erasingCallBack = event => {
                    const features = this._map.getFeaturesAtPixel(event.pixel, {
                        layerFilter: layer => {
                            return layer === this._drawLayer;
                        },
                        hitTolerance: 8
                    });
                    if(features.length){
                        if (!confirm(lizDict['digitizing.confirm.erase'])) {
                            return false;
                        }

                        this._eraseFeature(features[0]);

                        // Stop erasing mode when no features left
                        if(this._drawSource.getFeatures().length === 0){
                            this.isErasing = false;
                        }

                        this.saveFeatureDrawn();

                        mainEventDispatcher.dispatch('digitizing.erase');
                    }
                };

                this._map.on('singleclick', this._erasingCallBack );
                mainEventDispatcher.dispatch('digitizing.erasingBegins');
            } else {
                this._map.un('singleclick', this._erasingCallBack );
                mainEventDispatcher.dispatch('digitizing.erasingEnds');
            }
        }
    }

    get hasMeasureVisible() {
        return this._hasMeasureVisible;
    }

    set hasMeasureVisible(visible) {
        this._hasMeasureVisible = visible;
        for (const overlays of this._measureTooltips) {
            overlays[0].getElement().classList.toggle('hide', !visible);
            overlays[1].getElement().classList.toggle('hide', !visible);
        }
        mainEventDispatcher.dispatch('digitizing.measure');
    }

    get hasConstraintsPanelVisible() {
        return this._hasMeasureVisible && ['line', 'polygon'].includes(this.toolSelected);
    }

    get isSaved() {
        return this._isSaved;
    }

    set distanceConstraint(distanceConstraint){
        this._distanceConstraint = parseInt(distanceConstraint)
    }

    set angleConstraint(angleConstraint){
        this._angleConstraint = parseInt(angleConstraint)
    }

    _eraseFeature(feature) {
        const totalOverlay = feature.getGeometry().get('totalOverlay');
        if (totalOverlay) {
            this._measureTooltips.forEach((measureTooltip) => {
                if(measureTooltip[1] === totalOverlay){
                    this._map.removeOverlay(measureTooltip[0]);
                    this._map.removeOverlay(measureTooltip[1]);
                    this._measureTooltips.delete(measureTooltip);
                    return;
                }
            });
        }

        this._drawSource.removeFeature(feature);
    }

    _userChangedColor(color) {
        this._drawColor = color;

        this._selectInteraction.getFeatures().forEach(feature => {
            feature.set('color', color);
        });

        // Save color
        localStorage.setItem(this._repoAndProjectString + '_drawColor', this._drawColor);

        mainEventDispatcher.dispatch('digitizing.drawColor');
    }

    _contraintsHandler(coords, geom, geomType) {
        // Create geom if undefined
        if (!geom) {
            if (geomType === 'Polygon') {
                geom = new Polygon(coords);
            } else {
                geom = new LineString(coords);
            }
        }

        let _coords;

        if (geomType === 'Polygon') {
            // Handle first linearRing in polygon
            // TODO: Polygons with holes are not handled yet
            _coords = coords[0];
        } else {
            _coords = coords;
        }

        if (this._distanceConstraint || this._angleConstraint) {
            // Clear previous visual constraint features
            this._constraintLayer.getSource().clear();
            // Display constraint layer
            this._constraintLayer.setVisible(true);

            // Last point drawn on click
            const lastDrawnPointCoords = _coords[_coords.length - 2];
            // Point under cursor
            const cursorPointCoords = _coords[_coords.length - 1];

            // Contraint where point will be drawn on click
            let constrainedPointCoords = cursorPointCoords;

            const mapProjection = this._map.getView().getProjection();

            if (this._distanceConstraint) {
                // Draw circle with distanceConstraint as radius
                const circle = circular(
                    transform(lastDrawnPointCoords, mapProjection, 'EPSG:4326'),
                    this._distanceConstraint,
                    128
                );

                constrainedPointCoords = transform(
                    circle.getClosestPoint(
                        transform(cursorPointCoords, mapProjection, 'EPSG:4326')
                    ),
                    'EPSG:4326',
                    mapProjection,
                );

                // Draw visual constraint features
                this._constraintLayer.getSource().addFeature(
                    new Feature({
                        geometry: circle.transform('EPSG:4326', mapProjection)
                    })
                );

                if (!this._angleConstraint) {
                    this._constraintLayer.getSource().addFeature(
                        new Feature({
                            geometry: new Point(constrainedPointCoords)
                        })
                    );
                }
            }

            if (this._angleConstraint && _coords.length > 2) {
                const constrainedAngleClockwise = new LineString([_coords[_coords.length - 3], lastDrawnPointCoords]);
                const constrainedAngleAntiClockwise = constrainedAngleClockwise.clone();
                // Rotate clockwise
                constrainedAngleClockwise.rotate(-1 * this._angleConstraint * (Math.PI / 180.0), lastDrawnPointCoords);
                const closestClockwise = constrainedAngleClockwise.getClosestPoint(cursorPointCoords);
                // Rotate anticlockwise
                constrainedAngleAntiClockwise.rotate(this._angleConstraint * (Math.PI / 180.0), lastDrawnPointCoords);
                const closestAntiClockwise = constrainedAngleAntiClockwise.getClosestPoint(cursorPointCoords);

                // Stretch lines
                const scaleFactor = 50;
                constrainedAngleClockwise.scale(scaleFactor, scaleFactor, lastDrawnPointCoords);
                constrainedAngleAntiClockwise.scale(scaleFactor, scaleFactor, lastDrawnPointCoords);

                this._constraintLayer.getSource().addFeatures([
                    new Feature({
                        geometry: constrainedAngleClockwise
                    }),
                    new Feature({
                        geometry: constrainedAngleAntiClockwise
                    })
                ]);

                let constrainedAngleLineString;

                // Display clockwise or anticlockwise angle
                // Closest from cursor is displayed
                if (getLength(
                    new LineString([closestClockwise, cursorPointCoords])
                ) < getLength(
                    new LineString([closestAntiClockwise, cursorPointCoords])
                )) {
                    constrainedAngleLineString = constrainedAngleClockwise.clone();
                } else {
                    constrainedAngleLineString = constrainedAngleAntiClockwise.clone();
                }

                if (this._distanceConstraint) {
                    const ratio = this._distanceConstraint / getLength(constrainedAngleLineString);
                    constrainedAngleLineString.scale(ratio, ratio, constrainedAngleLineString.getLastCoordinate());

                    constrainedPointCoords = constrainedAngleLineString.getFirstCoordinate();
                } else {
                    constrainedPointCoords = constrainedAngleLineString.getClosestPoint(cursorPointCoords);
                }

            }
            _coords[_coords.length - 1] = constrainedPointCoords;
        }

        if (geomType === 'Polygon') {
            geom.setCoordinates([_coords]);
        } else {
            geom.setCoordinates(_coords);
        }

        return geom;
    }

    // Display draw measures in tooltips
    _updateTooltips(coords, geom, geomType) {
        // Current segment length
        let segmentTooltipContent = this.formatLength(
            new LineString([coords[coords.length - 1], coords[coords.length - 2]])
        );

        // Total length for LineStrings
        // Perimeter and area for Polygons
        // Radius and area for Circles
        if(geomType == 'Circle') {
            this._updateTotalMeasureTooltip(coords, geom, geomType, Array.from(this._measureTooltips).pop()[1]);
        } else if (coords.length > 2) {
            this._updateTotalMeasureTooltip(coords, geom, geomType, Array.from(this._measureTooltips).pop()[1]);

            // Display angle ABC between three points. B is center
            const A = coords[coords.length - 1];
            const B = coords[coords.length - 2];
            const C = coords[coords.length - 3];

            const AB = Math.sqrt(Math.pow(B[0] - A[0], 2) + Math.pow(B[1] - A[1], 2));
            const BC = Math.sqrt(Math.pow(B[0] - C[0], 2) + Math.pow(B[1] - C[1], 2));
            const AC = Math.sqrt(Math.pow(C[0] - A[0], 2) + Math.pow(C[1] - A[1], 2));

            let angleInDegrees = (Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * 180) / Math.PI;
            angleInDegrees = Math.round(angleInDegrees * 100) / 100;
            if (isNaN(angleInDegrees)) {
                angleInDegrees = 0;
            }

            segmentTooltipContent += '<br>' + angleInDegrees + '°';
        }

        // Display current segment measure only when drawing lines or polygons
        if (['line', 'polygon'].includes(this.toolSelected)) {
            this._segmentMeasureTooltipElement.innerHTML = segmentTooltipContent;
            Array.from(this._measureTooltips).pop()[0].setPosition(geom.getLastCoordinate());
        }
    }

    _updateTotalMeasureTooltip(coords, geom, geomType, overlay) {
        if (geomType === 'Polygon') {
            // Close LinearRing to get its perimeter
            const perimeterCoords = Array.from(coords);
            perimeterCoords.push(Array.from(coords[0]));
            let totalTooltipContent = this.formatLength(new Polygon([perimeterCoords]));
            totalTooltipContent += '<br>' + this.formatArea(geom);

            overlay.getElement().innerHTML = totalTooltipContent;
            overlay.setPosition(geom.getInteriorPoint().getCoordinates());
        } else if(geomType == 'Circle') {
            // get polygon from circular geometry by approximating the circle with a 128-sided polygon
            let circularGeom = fromCircle(geom,128);
            let totalTooltipContent = this.formatLength(new LineString([coords[0], coords[1]]));
            totalTooltipContent += '<br>' + this.formatArea(circularGeom);

            overlay.getElement().innerHTML = totalTooltipContent;
            overlay.setPosition(circularGeom.getInteriorPoint().getCoordinates());
        }
        else {
            overlay.getElement().innerHTML = this.formatLength(geom);
            overlay.setPosition(geom.getCoordinateAt(0.5));
        }
    }

    /**
     * Format length output.
     * @param {Geometry} geom The geom.
     * @returns {string} The formatted length.
     */
    formatLength(geom) {
        const length = getLength(geom, {projection: this._map.getView().getProjection()});
        let output;
        if (length > 100) {
            output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
        } else {
            output = Math.round(length * 100) / 100 + ' ' + 'm';
        }
        return output;
    }

    /**
     * Format area output.
     * @param {Polygon} polygon The polygon.
     * @returns {string} Formatted area.
     */
    formatArea(polygon) {
        const area = getArea(polygon, {projection: this._map.getView().getProjection()});
        let output;
        if (area > 10000) {
            output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
        } else {
            output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
        }
        return output;
    }

    /**
     * Initializes measure tooltip and change event on a feature loaded from local storage.
     * @param {Geometry} geom The geometry.
     */
    _initMeasureTooltipOnLoadedFeatures(geom){
        // create overlays
        this.createMeasureTooltips();

        geom.set('totalOverlay', Array.from(this._measureTooltips).pop()[1], true);
        // calculate measures
        this._setTooltipContentByGeom(geom);
        geom.on('change', (e) => {
            const geom = e.target;
            this._setTooltipContentByGeom(geom);
        });
        // make measure tooltip static and hidden
        this._totalMeasureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        this._totalMeasureTooltipElement.classList.toggle('hide', !this._hasMeasureVisible);

        // reset measureTooltip element
        this._totalMeasureTooltipElement = null;
    }

    /**
     * Calculates measuements for a specific geometry.
     * @param {Geometry} geom The geometry.
     */
    _setTooltipContentByGeom(geom){
        if (geom instanceof Polygon) {
            this._updateTotalMeasureTooltip(geom.getCoordinates()[0], geom, 'Polygon', geom.get('totalOverlay'));
        } else if (geom instanceof LineString) {
            this._updateTotalMeasureTooltip(geom.getCoordinates(), geom, 'Linestring', geom.get('totalOverlay'));
        } else if ( geom instanceof CircleGeom) {
            this._updateTotalMeasureTooltip(
                [geom.getFirstCoordinate(), geom.getLastCoordinate()], geom, 'Circle', geom.get('totalOverlay')
            );
        }
    }

    /**
     * Creates measure tooltips
     */
    createMeasureTooltips() {
        if (this._segmentMeasureTooltipElement) {
            this._segmentMeasureTooltipElement.parentNode.removeChild(this._segmentMeasureTooltipElement);
        }
        this._segmentMeasureTooltipElement = document.createElement('div');
        this._segmentMeasureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
        this._segmentMeasureTooltipElement.classList.toggle('hide', !this._hasMeasureVisible);

        const segmentOverlay = new Overlay({
            element: this._segmentMeasureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center',
            stopEvent: false,
            insertFirst: false,
        });

        if (this._totalMeasureTooltipElement) {
            this._totalMeasureTooltipElement.parentNode.removeChild(this._totalMeasureTooltipElement);
        }
        this._totalMeasureTooltipElement = document.createElement('div');
        this._totalMeasureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
        this._totalMeasureTooltipElement.classList.toggle('hide', !this._hasMeasureVisible);

        const totalOverlay = new Overlay({
            element: this._totalMeasureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center',
            stopEvent: false,
            insertFirst: false,
        });

        this._measureTooltips.add([segmentOverlay, totalOverlay]);
        this._map.addOverlay(segmentOverlay);
        this._map.addOverlay(totalOverlay);
    }

    // Get SLD for featureDrawn[index]
    getFeatureDrawnSLD(index) {
        if (!this.featureDrawn[index]) {
            return null;
        }
        const color = this.featureDrawn[index].get('color') || this._drawColor;
        let opacityFactor = this.featureDrawn[index].get('mode') == 'textonly' ? 0 : 1;
        let symbolizer = '';
        let strokeAndFill =
        `<Stroke>
            <SvgParameter name="stroke">${color}</SvgParameter>
            <SvgParameter name="stroke-opacity">${1*opacityFactor}</SvgParameter>
            <SvgParameter name="stroke-width">${this._strokeWidth}</SvgParameter>
        </Stroke>
        <Fill>
            <SvgParameter name="fill">${color}</SvgParameter>
            <SvgParameter name="fill-opacity">${this._fillOpacity*opacityFactor}</SvgParameter>
        </Fill>`;

        // We consider LINESTRING and POLYGON together currently
        if (this.featureDrawn[index].getGeometry().getType() === 'Point') {
            symbolizer =
            `<PointSymbolizer>
                <Graphic>
                    <Mark>
                        <WellKnownName>circle</WellKnownName>
                        ${strokeAndFill}
                    </Mark>
                    <Size>${2 * this._pointRadius}</Size>
                </Graphic>
            </PointSymbolizer>`;
        } else {
            symbolizer =
            `<PolygonSymbolizer>
                ${strokeAndFill}
            </PolygonSymbolizer>`;
        }

        /* eslint-disable @stylistic/js/max-len --
         * Block of XML
        **/
        const sld =
        `<?xml version="1.0" encoding="UTF-8"?>
        <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:se="http://www.opengis.net/se">
            <UserStyle>
                <FeatureTypeStyle>
                    <Rule>
                        ${symbolizer}
                    </Rule>
                </FeatureTypeStyle>
            </UserStyle>
        </StyledLayerDescriptor>`;
        /* eslint-enable @stylistic/js/max-len */

        // Remove indentation to avoid big queries full of unecessary spaces
        return sld.replace('    ', '');
    }

    get visibility(){
        return this._drawLayer.getVisible();
    }

    /**
     * Set visibility or toggle if not defined
     * @param {boolean} visible - true to show, false to hide
     */
    toggleVisibility(visible = !this.visibility) {
        this._drawLayer.setVisible(visible);
        for (const overlays of this._measureTooltips) {
            overlays[0].getElement().classList.toggle('hide', !(this._hasMeasureVisible && visible));
            overlays[1].getElement().classList.toggle('hide', !(this._hasMeasureVisible && visible));
        }

        mainEventDispatcher.dispatch('digitizing.visibility');
    }

    toggleEdit() {
        this.isEdited = !this.isEdited;
    }

    toggleRotate() {
        this.isRotate = !this.isRotate;
    }

    toggleMeasure() {
        this.hasMeasureVisible = !this.hasMeasureVisible;
    }

    toggleSplit() {
        this.isSplitting = !this._isSplitting;
    }

    toggleErasing() {
        this.isErasing = !this._isErasing;
    }

    toggleSave() {
        this._isSaved = !this._isSaved;

        this.saveFeatureDrawn();

        mainEventDispatcher.dispatch('digitizing.save');
    }

    eraseAll() {
        this.isEdited = false;
        this.isRotate = false
        this.isErasing = false;
        this.isSplitting = false;

        this._measureTooltips.forEach((measureTooltip) => {
            this._map.removeOverlay(measureTooltip[0]);
            this._map.removeOverlay(measureTooltip[1]);
            this._measureTooltips.delete(measureTooltip);
        });
        this._drawSource.clear();

        this.saveFeatureDrawn();

        mainEventDispatcher.dispatch('digitizing.erase.all');
        mainEventDispatcher.dispatch('digitizing.erase');
    }

    /**
     * Save all drawn features in local storage
     */
    saveFeatureDrawn() {
        if (this._isSaved) {
            if(this.featureDrawn){
                const savedFeatures = [];
                for(const feature of this.featureDrawn){
                    const geomType = feature.getGeometry().getType();

                    if( geomType === 'Circle'){
                        savedFeatures.push({
                            type: geomType,
                            color: feature.get('color'),
                            center: feature.getGeometry().getCenter(),
                            radius: feature.getGeometry().getRadius()
                        });
                    } else {
                        savedFeatures.push({
                            type: geomType,
                            color: feature.get('color'),
                            coords: feature.getGeometry().getCoordinates()
                        });
                    }
                }
                localStorage.setItem(
                    this._repoAndProjectString + '_' + this._context + '_drawLayer',
                    JSON.stringify(savedFeatures),
                );
            } else {
                localStorage.removeItem(this._repoAndProjectString + '_' + this._context + '_drawLayer');
            }
        } else {
            localStorage.removeItem(this._repoAndProjectString + '_' + this._context + '_drawLayer');
        }
    }

    /**
     * Load all drawn features from local storage
     */
    loadFeatureDrawnToMap() {
        // get saved data without context for draw
        const oldSavedGeomJSON =
            this._context === 'draw' ? localStorage.getItem(this._repoAndProjectString + '_drawLayer') : null;

        // Clear old saved data without context for draw from localStorage
        if (oldSavedGeomJSON !== null) {
            localStorage.removeItem(this._repoAndProjectString + '_drawLayer');
            localStorage.setItem(this._repoAndProjectString + '_' + this._context + '_drawLayer', oldSavedGeomJSON);
        }

        // keep saved data without context for draw or get saved data with context
        const savedGeomJSON =
            oldSavedGeomJSON !== null ? oldSavedGeomJSON :
                localStorage.getItem(this._repoAndProjectString + '_' + this._context + '_drawLayer');

        if (savedGeomJSON) {
            let loadedFeatures = [];
            // the saved data could be an invalid JSON
            try {
                const savedFeatures = JSON.parse(savedGeomJSON);

                // convert saved data to features
                for(const feature of savedFeatures){
                    let loadedGeom;
                    if(feature.type === 'Point'){
                        loadedGeom = new Point(feature.coords);
                    } else if(feature.type === 'LineString'){
                        loadedGeom = new LineString(feature.coords);
                    } else if(feature.type === 'Polygon'){
                        loadedGeom = new Polygon(feature.coords);
                    } else if(feature.type === 'Circle'){
                        loadedGeom = new CircleGeom(feature.center, feature.radius);
                    }

                    if(loadedGeom){
                        const loadedFeature = new Feature(loadedGeom);
                        // init measure tooltip
                        this._initMeasureTooltipOnLoadedFeatures(loadedFeature.getGeometry());
                        loadedFeature.set('color', feature.color);
                        loadedFeatures.push(loadedFeature);
                    }
                }
            } catch(json_error) {
                // the saved data is an invalid JSON
                console.log('`'+savedGeomJSON+'` is not a JSON!');
                // the saved data could be a WKT from previous lizmap version
                try {
                    const formatWKT = new WKT();
                    loadedFeatures = formatWKT.readFeatures(savedGeomJSON);
                    console.log(loadedFeatures.length+' features read from WKT!');
                    // set color
                    for(const loadedFeature of loadedFeatures){
                        // init measure tooltip
                        this._initMeasureTooltipOnLoadedFeatures(loadedFeature.getGeometry());
                        loadedFeature.set('color', this._drawColor);
                    }
                    // No features read from localStorage so remove the data
                    if (loadedFeatures.length == 0) {
                        localStorage.removeItem(this._repoAndProjectString + '_' + this._context + '_drawLayer');
                    }
                } catch(wkt_error) {
                    console.log('`'+savedGeomJSON+'` is not a WKT!');
                    console.error(json_error);
                    console.error(wkt_error);
                }
            }

            // Draw features
            this._isSaved = (loadedFeatures.length > 0);
            this._drawSource.addFeatures(loadedFeatures);
        }
    }

    download(format) {
        if (this.featureDrawn) {
            const options = {
                featureProjection: this._lizmap3.map.getProjection(),
                dataProjection: 'EPSG:4326'
            };
            if (format === 'geojson') {
                const geoJSON = (new GeoJSON()).writeFeatures(this.featureDrawn, options);
                Utils.downloadFileFromString(geoJSON, 'application/geo+json', 'export.geojson');
            } else if (format === 'gpx') {
                const gpx = (new GPX()).writeFeatures(this.featureDrawn, options);
                Utils.downloadFileFromString(gpx, 'application/gpx+xml', 'export.gpx');
            } else if (format === 'kml') {
                const kml = (new KML()).writeFeatures(this.featureDrawn, options);
                Utils.downloadFileFromString(kml, 'application/vnd.google-earth.kml+xml', 'export.kml');
            } else if (format === 'fgb') {
                // We create a temp GeoJSON in order to fill the metadata with the projection code
                const tempGeoJSON = (new GeoJSON()).writeFeaturesObject(this.featureDrawn);

                let projCode = options.featureProjection.split(":")[1];
                projCode = parseInt(projCode);

                // The 'serialize' func from GeoJSON allows us to add a projection code
                const fgb = flatgeobuf.geojson.serialize(tempGeoJSON, projCode);
                Utils.downloadFileFromString(fgb, 'application/octet-stream', 'export.fgb');
            }
        }
    }

    import(file) {
        const reader = new FileReader();

        // Get file extension
        const fileExtension = file.name.split('.').pop().toLowerCase();

        // Prepare for flatgeobuf
        let projFGB;

        /**
         * Handle meta data of the FlatGeobuf file
         * @param {object} headerMeta - Meta data of the FlatGeobuf file
         */
        function handleHeaderMeta(headerMeta) {
            const crsFGB = headerMeta.crs;
            projFGB = (crsFGB ? "EPSG:" + crsFGB.code : null);
        }

        /**
         * Reproject all features from a sourceProj to a targetProj
         * @param {Feature} features - Features to reproject
         * @param {string} sourceProj - Source projection
         * @param {string} targetProj - Target projection
         * @returns {Feature} - Reprojected features
         */
        function reprojAll(features, sourceProj, targetProj) {
            for (let i = 0; i < features.length; i++) {
                features[i].getGeometry().transform(sourceProj, targetProj);
            }
            return features;
        }

        // if (fileExtension === 'zip') {
        //     reader.onload = (() => {
        //         return (e) => {
        //             const buffershp = e.target.result;
        //             shp(buffershp).then(response => {
        //                 let OL6features = (new GeoJSON()).readFeatures(
        //                     response,
        //                     {featureProjection: this._lizmap3.map.getProjection()},
        //                 );
        //
        //                 if (OL6features) {
        //                     // Add imported features to map and zoom to their extent
        //                     this._drawSource.addFeatures(OL6features);
        //                 }
        //             });
        //         };
        //     })(this);
        //     reader.readAsArrayBuffer(file);
        // }

        reader.onload = (() => {
            return async (e) => {
                const fileContent = e.target.result;
                let OL6features;

                // Handle GeoJSON, GPX or KML strings
                try {
                    const options = {
                        featureProjection: this._lizmap3.map.getProjection()
                    };
                    // Check extension for format type
                    if (['json', 'geojson'].includes(fileExtension)) {
                        OL6features = (new GeoJSON()).readFeatures(fileContent, options);
                    } else if (fileExtension === 'gpx') {
                        OL6features = (new GPX()).readFeatures(fileContent, options);
                    } else if (fileExtension === 'kml') {
                        // Remove features default style to display layer style
                        OL6features = (new KML({ extractStyles: false })).readFeatures(fileContent, options);
                    } else if (fileExtension === 'zip') {
                        const geojson = await shp(fileContent);
                        if (geojson) {
                            OL6features = (new GeoJSON()).readFeatures(geojson, options);
                        }
                    } else if (fileExtension === 'fgb') {
                        let features = [];

                        const blob = new Blob([fileContent]);
                        const stream = blob.stream();

                        for await (const feature of flatgeobuf.ol.deserialize(stream, null, handleHeaderMeta)) {
                            features.push(feature);
                        }

                        if (projFGB !== null) {
                            const projCode = projFGB.split(":")[1];

                            // Verifiy if the projection is already included in proj4
                            if (Object.keys(proj4.defs).filter((name) => name.includes(projFGB)).length === 0) {
                                // We need a reprojection to be done because flatgeobuf files
                                // doesn't have a precise projection
                                // We neither used wkt located in headers due to some errors
                                // to define it with proj4.
                                // Nor 'fromEPSGcode()' because it returns a 'Projection' object
                                // that sometimes throws errors.
                                let descriptor = await Utils.fetch('https://epsg.io/' + projCode + '.proj4')
                                    .then((res) => res.text())
                                    .catch((error) => {
                                        throw new Error(
                                            lizDict["digitizing.import.fetch.error"] + " : " + error.message
                                        );
                                    });

                                proj4.defs(projFGB, descriptor);
                                register(proj4);
                            }

                            features = reprojAll(features, projFGB, this._lizmap3.map.getProjection());
                        } else {
                            this._lizmap3.addMessage(lizDict["digitizing.import.metadata.error"] + " : " +
                                this._lizmap3.map.getProjection()
                            , 'info'
                            , true)
                        }

                        OL6features = features;
                    }
                } catch (error) {
                    this._lizmap3.addMessage(error, 'danger', true)
                }

                if (OL6features) {
                    // Add imported features to map
                    this._drawSource.addFeatures(OL6features);
                    // And zoom to their bounding extent
                    const featuresGeometry = OL6features.map(feature => feature.getGeometry());
                    const featuresGeometryCollection = new GeometryCollection(featuresGeometry);
                    const extent = featuresGeometryCollection.getExtent();

                    this._map.getView().fit(extent);
                }
            };
        })(this);

        if (fileExtension === 'zip'){
            reader.readAsArrayBuffer(file);
        } else if (fileExtension === 'fgb'){
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    }
}
