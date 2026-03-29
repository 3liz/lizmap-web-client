/**
 * @module modules/Digitizing.js
 * @name Digitizing
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */
import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { deepFreeze } from './config/Tools.js';
import { createEnum } from './utils/Enums.js';
import { Utils } from './Utils.js';
import map from './map.js';

import GeoJSON from 'ol/format/GeoJSON.js';
import GPX from 'ol/format/GPX.js';
import KML from 'ol/format/KML.js';
import WKT from 'ol/format/WKT.js';

import { Draw, Modify, Select, Translate, DoubleClickZoom } from 'ol/interaction.js';
import { click } from 'ol/events/condition.js';
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
 * @fires digitizingFeatureDrawn
 */
export class Digitizing {
    /**
     * Build the lizmap Digitizing instance
     * @param {map}           map           - OpenLayers map
     * @param {object}        lizmap3       - The old lizmap object
     * @fires digitizingFeatureDrawn
     */
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

        this._singlePartGeometry = false;

        this._isEdited = false;
        this._isRotate = false;
        this._isTranslating = false;
        this._hasMeasureVisible = false;
        this._isSaved = false;
        this._isSplitting = false;
        this._isSplitLocked = false;
        this._isReshaping = false;
        this._isErasing = false;

        this._drawInteraction;
        this._dblClickListener = null;

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
            condition: click,
            hitTolerance: 5,
            wrapX: false,
            layers: (layer) => layer === this._drawLayer,
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
                // In edition context, prevent deselection — always keep the feature selected
                if (this._context === 'edition' && this.featureDrawn && this.featureDrawn.length === 1) {
                    this._selectInteraction.getFeatures().push(this.featureDrawn[0]);
                    return;
                }
                // When a feature is deselected, set the color from the first selected feature if any
                const selectedFeatures = this._selectInteraction.getFeatures().getArray();
                if (selectedFeatures.length) {
                    this.drawColor = selectedFeatures[0].get('color');
                }
            }
            mainEventDispatcher.dispatch('digitizing.editionBegins');
        });

        this._modifyInteraction = new Modify({
            features: this._selectInteraction.getFeatures(),
        });

        this._modifyInteraction.on('modifyend', () => {
            mainEventDispatcher.dispatch('digitizing.geometryChanged');
        });

        this._translateInteraction = new Translate({
            features: this._selectInteraction.getFeatures(),
            hitTolerance: 20
        });

        this._translateInteraction.on('translateend', () => {
            mainEventDispatcher.dispatch('digitizing.geometryChanged');
        });

        this._transformRotateInteraction = new Transform({
            rotate: true,
            scale: false,
        });

        this._transformRotateInteraction.on('rotateend', () => {
            mainEventDispatcher.dispatch('digitizing.geometryChanged');
        });

        this._transformScaleInteraction = new Transform({
            rotate: false,
            scale: true,
        });

        this._transformScaleInteraction.on('scaleend', () => {
            mainEventDispatcher.dispatch('digitizing.geometryChanged');
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

        // Listener for color
        this._addFeatureColorListener = (event) => {
            // Set main color if feature does not have one
            if(!event.feature.get('color')){
                event.feature.set('color', this._drawColor);
            }
        };

        // Listener for text
        this._addFeatureTextListener = (event) => {
            // Launch edition mode when text tool is selected
            if (this._toolSelected === 'text') {
                event.feature.set('text', lizDict['digitizing.toolbar.newText']);
                // Set mode 'textonly' to not display point geometry
                event.feature.set('mode', 'textonly');
                this.isEdited = true;
            }
        };

        // Listener for single part geometry
        this._addFeatureSinglePartGeometryListener = (event) => {
            if (this.singlePartGeometry) {
                const features = event.target.getFeatures();
                if (features.length > 1) {
                    event.target.removeFeatures(features.filter((f) => f != event.feature));
                }
            }
        };

        // Listener for save feature drawn
        this._addFeatureSaveDispatchListener = () => {
            // Save features drawn in localStorage
            this.saveFeatureDrawn();
            /**
             * @event digitizingFeatureDrawn
             * @type {object}
             * @property {string} type - digitizing.featureDrawn
             * @example
             * lizMap.mainEventDispatcher.addListener(() => {
             *     console.log('A feature has been drawn');
             * }, 'digitizing.featureDrawn');
             */
            mainEventDispatcher.dispatch('digitizing.featureDrawn');
        };

        this._drawSource.on('addfeature', this._addFeatureColorListener);
        this._drawSource.on('addfeature', this._addFeatureTextListener);
        this._drawSource.on('addfeature', this._addFeatureSaveDispatchListener);

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
                    this.toolSelected = this._tools[0]; // DigitizingTools.Deactivate
                } else if (['draw', 'print'].includes(e.id)) {
                    // Display draw for print redlining
                    this.context = e.id === 'print' ? 'draw' : e.id;
                    this.toggleVisibility(true);
                }
            },
            minidockclosed: (e) => {
                if (e.id == 'draw') {
                    this.toolSelected = this._tools[0]; // DigitizingTools.Deactivate
                    this.toggleVisibility(false);
                    this.resetConstraints();
                }
            }
        });
    }

    /**
     * Get the draw layer
     * @type {VectorLayer}
     * @readonly
     */
    get drawLayer() {
        return this._drawLayer;
    }

    /**
     * Get the edited features
     * @type {Array<Feature>}
     * @readonly
     */
    get editedFeatures() {
        return this._selectInteraction.getFeatures().getArray();
    }

    /**
     * Get the edited feature text
     * @type {string}
     */
    get editedFeatureText() {
        if (this.editedFeatures.length === 1) {
            return this.editedFeatures[0].get('text') || '';
        }
        return '';
    }

    /**
     * Set the edited feature text
     * @type {string}
     * @param {string} text - The text to set for the edited feature
     * @fires digitizingEditedFeatureText
     */
    set editedFeatureText(text) {
        if (this.editedFeatures.length !== 0) {
            this.editedFeatures.forEach(feature => feature.set('text', text));
            /**
             * @event digitizingEditedFeatureText
             * @type {object}
             * @property {string} type - digitizing.editedFeatureText
             * @property {string} text - The text set for the edited feature
             * @example
             * lizMap.mainEventDispatcher.addListener((lizmapEvent) => {
             *     console.log('The edited feature text has been updated: '+lizmapEvent.text);
             * }, 'digitizing.editedFeatureText');
             */
            mainEventDispatcher.dispatch({
                type:'digitizing.editedFeatureText',
                text: text,
            });
        }
    }

    /**
     * Get the edited feature text rotation
     * @type {string}
     */
    get editedFeatureTextRotation() {
        if (this.editedFeatures.length === 1) {
            return this.editedFeatures[0].get('rotation') || '';
        }
        return '';
    }

    /**
     * Set the edited feature text rotation
     * @type {string}
     * @param {string} rotation - The rotation to set for the edited feature
     * @fires digitizingEditedFeatureRotation
     */
    set editedFeatureTextRotation(rotation) {
        if (this.editedFeatures.length !== 0) {
            this.editedFeatures.forEach(feature => feature.set('rotation', rotation));
            /**
             * @event digitizingEditedFeatureRotation
             * @type {object}
             * @property {string} type - digitizing.editedFeatureRotation
             * @example
             * lizMap.mainEventDispatcher.addListener((lizmapEvent) => {
             *     console.log('The edited feature rotation has been changed: '+lizmapEvent.rotation);
             * }, 'digitizing.editedFeatureRotation');
             */
            mainEventDispatcher.dispatch({
                type: 'digitizing.editedFeatureRotation',
                rotation: rotation,
            });
        }
    }

    /**
     * Get the edited feature text scale
     * @type {number}
     */
    get editedFeatureTextScale() {
        if (this.editedFeatures.length !== 0) {
            return this.editedFeatures[0].get('scale') || 1;
        }
        return 1;
    }

    /**
     * Set the edited feature text scale
     * @type {number}
     * @param {number} scale - The scale to set for the edited feature
     * @fires digitizingEditedFeatureScale
     */
    set editedFeatureTextScale(scale) {
        if(isNaN(scale)){
            scale = 1;
        }
        if (this.editedFeatures.length !== 0) {
            this.editedFeatures.forEach(feature => feature.set('scale', scale));
            /**
             * @event digitizingEditedFeatureScale
             * @type {object}
             * @property {string} type - digitizing.editedFeatureScale
             * @example
             * lizMap.mainEventDispatcher.addListener((lizmapEvent) => {
             *     console.log('The edited feature text scale has been changed: '+lizmapEvent.scale);
             * }, 'digitizing.editedFeatureScale');
             */
            mainEventDispatcher.dispatch({
                type: 'digitizing.editedFeatureScale',
                scale: scale,
            });
        }
    }


    /**
     * Get the context
     * @type {string}
     */
    get context() {
        return this._context;
    }

    /**
     * Set the context
     * @type {string}
     * @param {string} aContext - The context to set
     */
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
        this._singlePartGeometry = false;
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

    /**
     * Get the selected tool
     * @type {string}
     */
    get toolSelected() {
        return this._toolSelected;
    }

    /**
     * Set the selected too
     * @type {string}
     * @param {string} tool - The tool to select
     * @fires digitizingToolSelected
     */
    /**
     * Disable DoubleClickZoom interaction on the map
     * @private
     */
    _disableDoubleClickZoom() {
        this._map.getInteractions().forEach(interaction => {
            if (interaction instanceof DoubleClickZoom) {
                interaction.setActive(false);
            }
        });
    }

    /**
     * Enable DoubleClickZoom interaction on the map
     * @private
     */
    _enableDoubleClickZoom() {
        // Delay re-enabling past OL's 250ms dblclick detection window
        // to prevent the finishing double-click from also triggering a zoom
        setTimeout(() => {
            this._map.getInteractions().forEach(interaction => {
                if (interaction instanceof DoubleClickZoom) {
                    interaction.setActive(true);
                }
            });
        }, 300);
    }

    /**
     * Restore edit mode if in edition context with a drawn feature.
     * Called when other tools (rotate, scale, split, reshape) deactivate.
     * @private
     */
    _restoreEditionEditMode() {
        if (this._context === 'edition' && this.featureDrawn) {
            this.isEdited = true;
        }
    }

    /**
     * Deactivate all tools by directly manipulating internal state.
     * Avoids setter re-entrancy issues. Call before activating a new tool.
     * @private
     */
    _deactivateAllTools() {
        // Deactivate edit mode
        if (this._isEdited) {
            this._isEdited = false;
            this._selectInteraction.getFeatures().clear();
            this._map.removeInteraction(this._selectInteraction);
            this._map.removeInteraction(this._modifyInteraction);
            this.saveFeatureDrawn();
            mainEventDispatcher.dispatch('digitizing.editionEnds');
        }

        // Deactivate translate/move mode
        if (this._isTranslating) {
            this._isTranslating = false;
            this._selectInteraction.getFeatures().clear();
            this._map.removeInteraction(this._translateInteraction);
            this._map.removeInteraction(this._selectInteraction);
        }

        // Deactivate rotate
        if (this._isRotate) {
            this._isRotate = false;
            this._transformRotateInteraction.getFeatures().clear();
            this._map.removeInteraction(this._transformRotateInteraction);
            mainEventDispatcher.dispatch({ type: 'digitizing.rotate', isRotate: false });
        }

        // Deactivate scale
        if (this._isScaling) {
            this._isScaling = false;
            this._transformScaleInteraction.getFeatures().clear();
            this._map.removeInteraction(this._transformScaleInteraction);
            mainEventDispatcher.dispatch({ type: 'digitizing.scaling', isScaling: false });
        }

        // Deactivate split
        if (this._isSplitting) {
            this._isSplitting = false;
            this._map.removeInteraction(this._splitInteraction);
            if (this._splitSource) {
                this._splitSource.clear();
                this._splitSource = null;
            }
            mainEventDispatcher.dispatch({ type: 'digitizing.split', isSplitting: false });
        }

        // Deactivate reshape
        if (this._isReshaping) {
            this._isReshaping = false;
            if (this._reshapeInteraction) {
                this._map.removeInteraction(this._reshapeInteraction);
            }
            if (this._reshapeSource) {
                this._reshapeSource.clear();
                this._reshapeSource = null;
            }
            mainEventDispatcher.dispatch({ type: 'digitizing.reshape', isReshaping: false });
        }

        // Deactivate erasing
        if (this._isErasing) {
            this._map.un('singleclick', this._erasingCallBack);
            this._isErasing = false;
            mainEventDispatcher.dispatch('digitizing.erasingEnds');
        }

        // Deactivate draw tool
        this._map.removeInteraction(this._drawInteraction);
        if (this._dblClickListener) {
            this._map.getViewport().removeEventListener('dblclick', this._dblClickListener);
            this._dblClickListener = null;
        }
        this._drawSource.un('addfeature', this._addFeatureColorListener);
        this._drawSource.un('addfeature', this._addFeatureTextListener);
        this._drawSource.un('addfeature', this._addFeatureSinglePartGeometryListener);
        this._drawSource.un('addfeature', this._addFeatureSaveDispatchListener);
        this._toolSelected = this._tools[0]; // deactivate

        this._enableDoubleClickZoom();
    }

    set toolSelected(tool) {
        if (this._tools.includes(tool)) {
            // Disable all tools
            this._map.removeInteraction(this._drawInteraction);
            if (this._dblClickListener) {
                this._map.getViewport().removeEventListener('dblclick', this._dblClickListener);
                this._dblClickListener = null;
            }
            this._drawSource.un('addfeature', this._addFeatureColorListener);
            this._drawSource.un('addfeature', this._addFeatureTextListener);
            this._drawSource.un('addfeature', this._addFeatureSinglePartGeometryListener);
            this._drawSource.un('addfeature', this._addFeatureSaveDispatchListener);

            // If tool === 'deactivate' or current selected tool is selected again => deactivate
            if (tool === this._toolSelected || tool === this._tools[0]) {
                this._toolSelected = this._tools[0];
                this._enableDoubleClickZoom();
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

                    // Dispatch after microtask so the feature is in the source
                    Promise.resolve().then(() => {
                        mainEventDispatcher.dispatch('digitizing.geometryChanged');
                    });
                });

                this._map.addInteraction(this._drawInteraction);
                this._disableDoubleClickZoom();

                // With constraints active, OL's atFinish_() compares the actual click pixel
                // against the constrained coordinate (which can be far from the click). This
                // causes double-click to add a vertex instead of finishing. We intercept the
                // DOM dblclick to remove the extra vertex OL added on the second pointer-up
                // and call finishDrawing() ourselves. Safe when constraints are off too:
                // finishDrawing() was already called by OL and is a no-op by then.
                this._dblClickListener = () => {
                    this._drawInteraction.removeLastPoint();
                    this._drawInteraction.finishDrawing();
                };
                this._map.getViewport().addEventListener('dblclick', this._dblClickListener);

                this._drawSource.on('addfeature', this._addFeatureColorListener);
                this._drawSource.on('addfeature', this._addFeatureTextListener);
                this._drawSource.on('addfeature', this._addFeatureSinglePartGeometryListener);
                this._drawSource.on('addfeature', this._addFeatureSaveDispatchListener);

                this._toolSelected = tool;

                // Disable other tools when digitizing tool changes
                this.isEdited = false;
                this.isErasing = false;
                this.isRotate = false;
                this.isScaling = false;
                this.isSplitting = false;
                this.isReshaping = false;
            }

            /**
             * @event digitizingToolSelected
             * @type {object}
             * @property {string} type - digitizing.toolSelected
             * @example
             * lizMap.mainEventDispatcher.addListener((lizmapEvent) => {
             *     console.log('The digitizing selected tool has changed: '+lizmapEvent.tool);
             * }, 'digitizing.toolSelected');
             */
            mainEventDispatcher.dispatch({
                type: 'digitizing.toolSelected',
                tool: this._toolSelected,
            });

            // Ensure snap interaction is ordered after the new draw interaction
            if (mainLizmap.snapping) {
                mainLizmap.snapping.reorderSnapInteraction();
            }
        }
    }

    /**
     * Get the drawing color
     * @type {string}
     */
    get drawColor() {
        return this._drawColor;
    }

    /**
     * Set the drawing color
     * @type {string}
     * @param {string} color - The color to set
     * @fires digitizingDrawColor
     */
    set drawColor(color) {
        this._drawColor = color;
        // Save color
        localStorage.setItem(this._repoAndProjectString + '_drawColor', this._drawColor);
        /**
         * @event digitizingDrawColor
         * @type {object}
         * @property {string} type - digitizing.drawColor
         * @example
         * lizMap.mainEventDispatcher.addListener((lizmapEvent) => {
         *     console.log('The digitizing draw color has changed: '+lizmapEvent.color);
         * }, 'digitizing.drawColor');
         */
        mainEventDispatcher.dispatch({
            type: 'digitizing.drawColor',
            color: this._drawColor,
        });
    }

    /**
     * Is digitizing single part geometry ?
     * @type {boolean}
     */
    get singlePartGeometry() {
        return this._singlePartGeometry;
    }

    /**
     * Update is digitizing single part geometry ?
     * @param {boolean} isSinglePart the digitizing single part geometry value
     */
    set singlePartGeometry(isSinglePart) {
        this._singlePartGeometry = isSinglePart;
    }

    /**
     * Get the features drawn
     * @type {Array<Feature>|null}
     */
    get featureDrawn() {
        const features = this._drawLayer.getSource().getFeatures();
        if (features.length) {
            return features;
        }
        return null;
    }

    /**
     * Is digitizing tool active or not?
     * @todo active state should be set on UI's events
     * @readonly
     * @memberof Digitizing
     * @returns {boolean} true if digitizing tool is active, false otherwise
     */
    get isActive() {
        const isActive = document.getElementById('button-draw')?.parentElement?.classList?.contains('active');
        return isActive ? true : false;
    }

    /**
     * Is digitizing edit tool active or not?
     * @type {boolean}
     */
    get isEdited() {
        return this._isEdited;
    }

    /**
     * Set the digitizing edit tool is active or not
     * @type {boolean}
     * @fires digitizingEditionBegins
     * @fires digitizingEditionEnds
     */
    set isEdited(edited) {
        if (this._isEdited !== edited) {
            if (edited) {
                this._deactivateAllTools();
                this._isEdited = true;

                // Automatically edit the feature if unique
                if (this.featureDrawn && this.featureDrawn.length === 1) {
                    this._selectInteraction.getFeatures().push(this.featureDrawn[0]);
                    this.drawColor = this.featureDrawn[0].get('color');
                }

                this._map.addInteraction(this._selectInteraction);
                this._map.addInteraction(this._modifyInteraction);

                /**
                 * @event digitizingEditionBegins
                 * @type {object}
                 * @property {string} type - digitizing.editionBegins
                 * @example
                 * lizMap.mainEventDispatcher.addListener(() => {
                 *     console.log('Edition begins');
                 * }, 'digitizing.editionBegins');
                 */
                mainEventDispatcher.dispatch('digitizing.editionBegins');
            } else {
                this._isEdited = false;
                // Clear selection
                this._selectInteraction.getFeatures().clear();
                this._map.removeInteraction(this._selectInteraction);
                this._map.removeInteraction(this._modifyInteraction);

                this.saveFeatureDrawn();

                /**
                 * @event digitizingEditionEnds
                 * @type {object}
                 * @property {string} type - digitizing.editionEnds
                 * @example
                 * lizMap.mainEventDispatcher.addListener(() => {
                 *     console.log('Edition ends');
                 * }, 'digitizing.editionEnds');
                 */
                mainEventDispatcher.dispatch('digitizing.editionEnds');
            }
        }
    }

    /**
     * Is the digitizing rotation tool active or not?
     * @type {boolean}
     */
    get isRotate() {
        return this._isRotate;
    }

    /**
     * Set the digitizing rotation tool is active or not
     * @type {boolean}
     * @fires digitizingRotate
     */
    set isRotate(isRotate) {
        if (this._isRotate !== isRotate) {
            if (isRotate) {
                this._deactivateAllTools();
                this._isRotate = true;

                // Automatically select the feature if unique
                if (this.featureDrawn && this.featureDrawn.length === 1) {
                    this._transformRotateInteraction.getFeatures().push(this.featureDrawn[0]);
                }
                this._map.addInteraction(this._transformRotateInteraction);
            } else {
                this._isRotate = false;
                this._transformRotateInteraction.getFeatures().clear();
                this._map.removeInteraction(this._transformRotateInteraction);
                this._restoreEditionEditMode();
            }

            /**
             * @event digitizingRotate
             * @type {object}
             * @property {string} type - digitizing.rotate
             * @example
             * lizMap.mainEventDispatcher.addListener((lizmapEvent) => {
             *     console.log('The digitizing rotation tool is active or not? '+lizmapEvent.isRotate);
             * }, 'digitizing.rotate');
             */
            mainEventDispatcher.dispatch({
                type: 'digitizing.rotate',
                isRotate: this._isRotate,
            });
        }
    }

    /**
     * Is the digitizing scale tool active or not?
     * @type {boolean}
     */
    get isScaling() {
        return this._isScaling;
    }

    /**
     * Set the digitizing scale tool is active or not
     * @type {boolean}
     * @fires digitizingScaling
     */
    set isScaling(isScaling) {
        if (this._isScaling !== isScaling) {
            if (isScaling) {
                this._deactivateAllTools();
                this._isScaling = true;

                // Automatically select the feature if unique
                if (this.featureDrawn && this.featureDrawn.length === 1) {
                    this._transformScaleInteraction.getFeatures().push(this.featureDrawn[0]);
                }
                this._map.addInteraction(this._transformScaleInteraction);
            } else {
                this._isScaling = false;
                this._transformScaleInteraction.getFeatures().clear();
                this._map.removeInteraction(this._transformScaleInteraction);
                this._restoreEditionEditMode();
            }

            /**
             * @event digitizingScaling
             * @type {object}
             * @property {string} type - digitizing.scaling
             * @example
             * lizMap.mainEventDispatcher.addListener((lizmapEvent) => {
             *     console.log('The digitizing scaling tool is active or not? '+lizmapEvent.isScaling);
             * }, 'digitizing.rotate');
             */
            mainEventDispatcher.dispatch({
                type: 'digitizing.scaling',
                isScaling: this._isScaling,
            });
        }
    }

    /**
     * Is the digitizing split tool active or not?
     * @type {boolean}
     */
    get isSplitting() {
        return this._isSplitting;
    }

    /**
     * Is digitizing locked after a split (all tools except vertex editing disabled)?
     * Cleared when the editing session deactivates.
     * @type {boolean}
     */
    get isSplitLocked() {
        return this._isSplitLocked;
    }

    set isSplitLocked(locked) {
        if (this._isSplitLocked !== locked) {
            this._isSplitLocked = locked;
            mainEventDispatcher.dispatch({
                type: 'digitizing.splitLocked',
                isSplitLocked: locked,
            });
        }
    }

    /**
     * Set the digitizing split tool is active or not
     * @type {boolean}
     * @fires digitizingSplit
     */
    set isSplitting(isSplitting) {
        if (this._isSplitting !== isSplitting) {
            if (isSplitting) {
                this._deactivateAllTools();
                this._isSplitting = true;

                // Use a separate source for the split line so it doesn't trigger
                // addfeature listeners (singlePartGeometry would remove existing features)
                this._splitSource = new VectorSource();
                this._splitInteraction = new Draw({
                    source: this._splitSource,
                    type: 'LineString',
                    style: this._drawStyleFunction
                });
                this._splitInteraction.on('drawend', event => {
                    if (this._isOperationInProgress) return;
                    this._isOperationInProgress = true;

                    // Get the split line geometry and clear the temporary source
                    const splitLineGeom = event.feature.getGeometry();
                    this._splitSource.clear();

                    // Take a snapshot of existing features (avoid modifying during iteration)
                    const existingFeatures = [...this._drawSource.getFeatures()];

                    // Find features that intersect the split line
                    const featuresToSplit = existingFeatures.filter(
                        f => splitLineGeom.intersectsExtent(f.getGeometry().getExtent())
                    );
                    if (featuresToSplit.length === 0) {
                        this._isOperationInProgress = false;
                        return;
                    }

                    // Lazy-load geometry libraries
                    Promise.all([
                        import(/* webpackChunkName: 'OLparser' */ 'jsts/org/locationtech/jts/io/OL3Parser.js'),
                        import(/* webpackChunkName: 'UnionOp' */ 'jsts/org/locationtech/jts/operation/union/UnionOp.js'),
                        import(/* webpackChunkName: 'Polygonizer' */ 'jsts/org/locationtech/jts/operation/polygonize/Polygonizer.js'),
                        import(/* webpackChunkName: 'lineSplit' */ '@turf/line-split'),
                    ]).then(([
                        { default: OLparser },
                        { default: UnionOp },
                        { default: Polygonizer },
                        { default: lineSplit }
                    ]) => {
                        const parser = new OLparser();
                        parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon);
                        const format = new GeoJSON();

                        const allSplitFeatures = [];

                        for (const feature of featuresToSplit) {
                            const geomType = feature.getGeometry().getType();
                            const featureColor = feature.get('color') || this._drawColor;
                            let newFeatures = null;

                            if (geomType === 'Polygon') {
                                const jstsLine = parser.read(splitLineGeom);
                                const jstsDrawnGeom = parser.read(feature.getGeometry());
                                const union = UnionOp.union(jstsDrawnGeom.getExteriorRing(), jstsLine);
                                const polygonizer = new Polygonizer();
                                polygonizer.add(union);
                                const polygons = polygonizer.getPolygons();

                                if (polygons.array.length >= 2) {
                                    newFeatures = polygons.array.map(geom => {
                                        const f = new Feature({ geometry: new Polygon(parser.write(geom).getCoordinates()) });
                                        f.set('color', featureColor);
                                        return f;
                                    });
                                }
                            } else if (geomType === 'LineString') {
                                const turfDrawn = format.writeFeatureObject(feature);
                                const turfSplitter = format.writeFeatureObject(event.feature);
                                const split = lineSplit(turfDrawn, turfSplitter);

                                if (split.features.length > 1) {
                                    newFeatures = split.features.map(sf => {
                                        const f = format.readFeature(sf);
                                        f.set('color', featureColor);
                                        return f;
                                    });
                                }
                            }

                            if (newFeatures && newFeatures.length > 1) {
                                // Disable single-part constraint before adding multiple features
                                // so the addfeature listener doesn't remove the first part
                                // when the second is added.
                                this._singlePartGeometry = false;
                                // Remove original, add all split parts
                                this._drawSource.removeFeature(feature);
                                newFeatures.forEach(f => this._drawSource.addFeature(f));
                                allSplitFeatures.push(...newFeatures);
                            }
                        }

                        if (allSplitFeatures.length > 0) {
                            // Multiple parts now exist — disable single part constraint
                            this._singlePartGeometry = false;

                            // Switch to edit mode and select all split features
                            this.isEdited = true;
                            allSplitFeatures.forEach(f => {
                                this._selectInteraction.getFeatures().push(f);
                            });

                            // Store split results on instance — OL Feature objects
                            // cannot be passed through EventDispatcher (JSON.stringify fails)
                            this._lastSplitFeatures = allSplitFeatures;
                            this._lastSplitGeometryType = allSplitFeatures[0].getGeometry().getType() === 'Polygon' ? 'polygon' : 'line';
                            mainEventDispatcher.dispatch('digitizing.splitComplete');
                            // Deactivate split tool and lock all other tools until features are saved
                            this.isSplitting = false;
                            this.isSplitLocked = true;
                        }
                        this._isOperationInProgress = false;
                    }).catch(error => {
                        console.error('Split operation failed:', error);
                        this._isOperationInProgress = false;
                    });
                });
                this._map.addInteraction(this._splitInteraction);
                this._disableDoubleClickZoom();
                // Re-order snap interaction so it processes before the split Draw
                if (mainLizmap.snapping) {
                    mainLizmap.snapping.reorderSnapInteraction();
                }
            } else {
                this._isSplitting = false;
                this._map.removeInteraction(this._splitInteraction);
                if (this._splitSource) {
                    this._splitSource.clear();
                    this._splitSource = null;
                }
                this._enableDoubleClickZoom();
                this._restoreEditionEditMode();
            }

            /**
             * @event digitizingSplit
             * @type {object}
             * @property {string} type - digitizing.split
             * @example
             * lizMap.mainEventDispatcher.addListener((lizmapEvent) => {
             *     console.log('The digitizing split tool is active or not? '+lizmapEvent.isSplitting);
             * }, 'digitizing.split');
             */
            mainEventDispatcher.dispatch({
                type: 'digitizing.split',
                isSplitting: this._isSplitting,
            });
        }
    }

    /**
     * Is the digitizing reshape tool active or not?
     * @type {boolean}
     */
    get isReshaping() {
        return this._isReshaping;
    }

    /**
     * Set the digitizing reshape tool active or not
     * @type {boolean}
     * @fires digitizingReshape
     */
    set isReshaping(isReshaping) {
        if (this._isReshaping !== isReshaping) {
            if (isReshaping) {
                this._deactivateAllTools();
                this._isReshaping = true;

                // Use a separate source so the reshape line doesn't trigger
                // addfeature listeners (singlePartGeometry would remove existing features)
                this._reshapeSource = new VectorSource();
                this._reshapeInteraction = new Draw({
                    source: this._reshapeSource,
                    type: 'LineString',
                    style: this._drawStyleFunction
                });
                this._reshapeInteraction.on('drawend', event => {
                    if (this._isOperationInProgress) return;
                    this._isOperationInProgress = true;

                    import(
                        /* webpackChunkName: 'lineSplit' */ '@turf/line-split'
                    ).then(({ default: lineSplit }) => {
                        const reshapeLine = event.feature.getGeometry();

                        // Clear the temporary reshape source
                        this._reshapeSource.clear();

                        // Find the existing feature to reshape
                        const existingFeatures = this._drawSource.getFeatures();
                        const existingFeature = existingFeatures.find(
                            f => f.getGeometry().getType() === 'LineString'
                        );
                        if (!existingFeature) {
                            this._isOperationInProgress = false;
                            return;
                        }

                        const existingGeom = existingFeature.getGeometry();
                        const format = new GeoJSON();

                        // Try to split (Mode 1: Trim)
                        const turfExisting = format.writeFeatureObject(existingFeature);
                        const turfReshape = format.writeFeatureObject(event.feature);
                        const split = lineSplit(turfExisting, turfReshape);

                        if (split.features.length > 1) {
                            // Intersection found — keep the longer segment
                            let longestFeature = split.features[0];
                            let longestLength = 0;
                            for (const seg of split.features) {
                                const segFeature = format.readFeature(seg);
                                if (!segFeature?.getGeometry()) continue;
                                const len = segFeature.getGeometry().getLength();
                                if (len > longestLength) {
                                    longestLength = len;
                                    longestFeature = seg;
                                }
                            }
                            const newGeom = format.readFeature(longestFeature).getGeometry();
                            existingFeature.setGeometry(newGeom);
                            mainEventDispatcher.dispatch('digitizing.geometryChanged');
                        } else {
                            // No intersection — Mode 2: Extend to target line
                            // Extend the existing line along its endpoint direction
                            // until it hits the drawn "target" line
                            const existCoords = existingGeom.getCoordinates();
                            const reshapeCoords = reshapeLine.getCoordinates();

                            // Ray-segment intersection: find where ray from P in direction D
                            // intersects segment A-B. Returns parameter t along ray, or null.
                            const raySegmentIntersect = (px, py, dx, dy, ax, ay, bx, by) => {
                                const sx = bx - ax, sy = by - ay;
                                const denom = dx * sy - dy * sx;
                                if (Math.abs(denom) < 1e-10) return null;
                                const t = ((ax - px) * sy - (ay - py) * sx) / denom;
                                const u = ((ax - px) * dy - (ay - py) * dx) / denom;
                                if (t > 0 && u >= 0 && u <= 1) return t;
                                return null;
                            };

                            // Try extending from end of existing line
                            const endPt = existCoords[existCoords.length - 1];
                            const prevPt = existCoords[existCoords.length - 2];
                            const endDx = endPt[0] - prevPt[0];
                            const endDy = endPt[1] - prevPt[1];

                            let bestEndT = Infinity;
                            let bestEndIntersection = null;
                            for (let i = 0; i < reshapeCoords.length - 1; i++) {
                                const t = raySegmentIntersect(
                                    endPt[0], endPt[1], endDx, endDy,
                                    reshapeCoords[i][0], reshapeCoords[i][1],
                                    reshapeCoords[i + 1][0], reshapeCoords[i + 1][1]
                                );
                                if (t !== null && t < bestEndT) {
                                    bestEndT = t;
                                    bestEndIntersection = [
                                        endPt[0] + endDx * t,
                                        endPt[1] + endDy * t
                                    ];
                                }
                            }

                            // Try extending from start of existing line
                            const startPt = existCoords[0];
                            const nextPt = existCoords[1];
                            const startDx = startPt[0] - nextPt[0];
                            const startDy = startPt[1] - nextPt[1];

                            let bestStartT = Infinity;
                            let bestStartIntersection = null;
                            for (let i = 0; i < reshapeCoords.length - 1; i++) {
                                const t = raySegmentIntersect(
                                    startPt[0], startPt[1], startDx, startDy,
                                    reshapeCoords[i][0], reshapeCoords[i][1],
                                    reshapeCoords[i + 1][0], reshapeCoords[i + 1][1]
                                );
                                if (t !== null && t < bestStartT) {
                                    bestStartT = t;
                                    bestStartIntersection = [
                                        startPt[0] + startDx * t,
                                        startPt[1] + startDy * t
                                    ];
                                }
                            }

                            let newCoords = null;
                            if (bestEndIntersection && bestStartIntersection) {
                                // Both endpoints can extend — extend both
                                newCoords = [bestStartIntersection, ...existCoords, bestEndIntersection];
                            } else if (bestEndIntersection) {
                                newCoords = [...existCoords, bestEndIntersection];
                            } else if (bestStartIntersection) {
                                newCoords = [bestStartIntersection, ...existCoords];
                            }

                            if (newCoords) {
                                existingFeature.setGeometry(new LineString(newCoords));
                                mainEventDispatcher.dispatch('digitizing.geometryChanged');
                            }
                        }
                        this._isOperationInProgress = false;
                    }).catch(error => {
                        console.error('Reshape operation failed:', error);
                        this._isOperationInProgress = false;
                    });
                });
                this._map.addInteraction(this._reshapeInteraction);
                this._disableDoubleClickZoom();
                // Re-order snap interaction so it processes before the reshape Draw
                if (mainLizmap.snapping) {
                    mainLizmap.snapping.reorderSnapInteraction();
                }
            } else {
                this._isReshaping = false;
                if (this._reshapeInteraction) {
                    this._map.removeInteraction(this._reshapeInteraction);
                }
                if (this._reshapeSource) {
                    this._reshapeSource.clear();
                    this._reshapeSource = null;
                }
                this._enableDoubleClickZoom();
                this._restoreEditionEditMode();
            }

            mainEventDispatcher.dispatch({
                type: 'digitizing.reshape',
                isReshaping: this._isReshaping,
            });
        }
    }

    /**
     * Is the digitizing erase tool active or not?
     * @type {boolean}
     */
    get isErasing() {
        return this._isErasing;
    }

    /**
     * Set the digitizing erase tool is active or not
     * @type {boolean}
     * @fires digitizingErasingBegins
     * @fires digitizingErase
     * @fires digitizingErasingEnds
     */
    set isErasing(isErasing) {
        if (this._isErasing !== isErasing) {
            if (isErasing) {
                this._deactivateAllTools();
                this._isErasing = true;

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

                        /**
                         * @event digitizingErase
                         * @type {object}
                         * @property {string} type - digitizing.erase
                         * @example
                         * lizMap.mainEventDispatcher.addListener(() => {
                         *     console.log('A drawn feature has been erased');
                         * }, 'digitizing.erase');
                         */
                        mainEventDispatcher.dispatch('digitizing.erase');
                        mainEventDispatcher.dispatch('digitizing.geometryChanged');
                    }
                };

                this._map.on('singleclick', this._erasingCallBack );
                /**
                 * @event digitizingErasingBegins
                 * @type {object}
                 * @property {string} type - digitizing.erasingBegins
                 * @example
                 * lizMap.mainEventDispatcher.addListener(() => {
                 *     console.log('The digitizing erasing tool begins');
                 * }, 'digitizing.erasingBegins');
                 */
                mainEventDispatcher.dispatch('digitizing.erasingBegins');

                // Automatically erase the feature if unique
                if (this.featureDrawn.length === 1) {
                    const coord = this.featureDrawn[0].getGeometry().getFirstCoordinate();
                    const pixel = this._map.getPixelFromCoordinate(coord);
                    this._map.dispatchEvent({
                        type: 'singleclick',
                        pixel: pixel,
                    });
                }
            } else {
                this._map.un('singleclick', this._erasingCallBack );
                /**
                 * @event digitizingErasingEnds
                 * @type {object}
                 * @property {string} type - digitizing.erasingEnds
                 * @example
                 * lizMap.mainEventDispatcher.addListener(() => {
                 *     console.log('The digitizing erasing tool ends');
                 * }, 'digitizing.erasingEnds');
                 */
                this._isErasing = false;
                mainEventDispatcher.dispatch('digitizing.erasingEnds');
            }
        }
    }

    /**
     * Is the digitizing measure tool visible or not
     * @type {boolean}
     */
    get hasMeasureVisible() {
        return this._hasMeasureVisible;
    }

    /**
     * Set the digitizing measure tool is active or not
     * @type {boolean}
     * @fires digitizingMeasure
     */
    set hasMeasureVisible(visible) {
        this._hasMeasureVisible = visible;
        for (const overlays of this._measureTooltips) {
            overlays[0].getElement().classList.toggle('hide', !visible);
            overlays[1].getElement().classList.toggle('hide', !visible);
        }
        /**
         * @event digitizingMeasure
         * @type {object}
         * @property {string} type - digitizing.measure
         * @example
         * lizMap.mainEventDispatcher.addListener((lizmapEvent) => {
         *     console.log('The digitizing measure tool is active or not? '+lizmapEvent.visible);
         * }, 'digitizing.measure');
         */
        mainEventDispatcher.dispatch({
            type: 'digitizing.measure',
            visible: this._hasMeasureVisible
        });
    }

    /**
     * Is the digitizing constraints panel visible or not
     * @type {boolean}
     */
    get hasConstraintsPanelVisible() {
        return this._hasMeasureVisible && ['line', 'polygon'].includes(this.toolSelected);
    }

    /**
     * Is the digitizing save tool active or not?
     * @type {boolean}
     */
    get isSaved() {
        return this._isSaved;
    }

    /**
     * Get the distance constraint
     * @type {number}
     */
    get distanceConstraint(){
        return this._distanceConstraint;
    }

    /**
     * Set the distance constraint
     * @type {number}
     */
    set distanceConstraint(distanceConstraint){
        this._distanceConstraint = parseFloat(distanceConstraint)
    }

    /**
     * Get the angle constraint
     * @type {number}
     */
    get angleConstraint(){
        return this._angleConstraint;
    }

    /**
     * Set the angle constraint
     * @type {number}
     */
    set angleConstraint(angleConstraint){
        this._angleConstraint = parseFloat(angleConstraint)
    }

    /**
     * Reset distance and angle constraints to zero and clear their visual overlay.
     */
    resetConstraints() {
        this._distanceConstraint = 0;
        this._angleConstraint = 0;
        // Hide and clear the on-map constraint layer (circle / angle guide lines)
        this._constraintLayer.getSource().clear();
        this._constraintLayer.setVisible(false);
        mainEventDispatcher.dispatch('digitizing.constraintReset');
    }

    /**
     * Erase a feature from the draw source
     * @private
     * @param {Feature} feature - the feature to erase
     * @returns {void}
     */
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

    /**
     * User changed the color of the drawing
     * @private
     * @param {string} color - the color to set
     * @fires digitizingDrawColor
     */
    _userChangedColor(color) {
        this._drawColor = color;

        this._selectInteraction.getFeatures().forEach(feature => {
            feature.set('color', color);
        });

        // Save color
        localStorage.setItem(this._repoAndProjectString + '_drawColor', this._drawColor);

        mainEventDispatcher.dispatch({
            type: 'digitizing.drawColor',
            color: this._drawColor,
        });
    }

    /**
     * The constraints handler
     * @private
     * @param {*} coords   - the mouse coordinates
     * @param {*} geom     - the geometry
     * @param {*} geomType - the geometry type
     * @returns {void}
     */
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
                if (this.getProjectedLength(
                    new LineString([closestClockwise, cursorPointCoords])
                ) < this.getProjectedLength(
                    new LineString([closestAntiClockwise, cursorPointCoords])
                )) {
                    constrainedAngleLineString = constrainedAngleClockwise.clone();
                } else {
                    constrainedAngleLineString = constrainedAngleAntiClockwise.clone();
                }

                if (this._distanceConstraint) {
                    const ratio = this._distanceConstraint / this.getProjectedLength(constrainedAngleLineString);
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

    /**
     * The tooltips handler
     * @private
     * @param {*} coords   - the mouse coordinates
     * @param {*} geom     - the geometry
     * @param {*} geomType - the geometry type
     * @returns {void}
     */
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

    /**
     * The tooltips measure handler
     * @private
     * @param {*} coords   - the mouse coordinates
     * @param {*} geom     - the geometry
     * @param {*} geomType - the geometry type
     * @param {*} overlay  - the overlay
     * @returns {void}
     */
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
     * Get spherical length of a geometry based on provided projection
     * @param {Geometry} geom The geom.
     * @param {null|string} projection The projection.
     * @returns {number} The calculated spherical length.
     */
    getProjectedLength(geom, projection = null) {
        if(!projection) {
            projection = this._map.getView().getProjection();
        }

        return getLength(geom, {projection: projection});
    }

    /**
     * Format length output.
     * @param {Geometry} geom The geom.
     * @returns {string} The formatted length.
     */
    formatLength(geom) {
        const length = this.getProjectedLength(geom);
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

    /**
     * Get the SLD for the drawn feature at the index
     * @param {number} index - The index of the drawn feature
     * @returns {null|string} The SLD for the drawn feature or null if the feature does not exist at the index
     */
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

    /**
     * Get the drawing layer visibility
     * @returns {boolean} - true if visible
     */
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

        /**
         * @event digitizingVisibility
         * @type {object}
         * @property {string} type - digitizing.visibility
         * @example
         * lizMap.mainEventDispatcher.addListener((lizmapEvent) => {
         *     console.log('The digitizing visibility has changed: '+lizmapEvent.visible);
         * }, 'digitizing.visibility');
         */
        mainEventDispatcher.dispatch({
            type: 'digitizing.visibility',
            visible: visible,
        });
    }

    /**
     * Toggle edit mode
     */
    toggleEdit() {
        this.isEdited = !this.isEdited;
    }

    /**
     * Toggle rotate mode
     */
    toggleRotate() {
        this.isRotate = !this.isRotate;
    }

    /**
     * Toggle scaling mode
     */
    toggleScaling() {
        this.isScaling = !this.isScaling;
    }

    /**
     * Whether translate/move mode is active
     * @type {boolean}
     */
    get isTranslating() {
        return this._isTranslating;
    }

    set isTranslating(translating) {
        if (translating) {
            this._deactivateAllTools();
            this._isTranslating = true;

            // Select the feature and add only Translate + Select (no Modify)
            if (this.featureDrawn && this.featureDrawn.length === 1) {
                this._selectInteraction.getFeatures().push(this.featureDrawn[0]);
            }
            this._map.addInteraction(this._selectInteraction);
            this._map.addInteraction(this._translateInteraction);
            mainEventDispatcher.dispatch('digitizing.translate');
        } else {
            this._isTranslating = false;
            this._map.removeInteraction(this._translateInteraction);
            this._map.removeInteraction(this._selectInteraction);
            this._selectInteraction.getFeatures().clear();
            mainEventDispatcher.dispatch('digitizing.translate');
        }
    }

    /**
     * Toggle translate/move mode
     */
    toggleTranslate() {
        if (this._isTranslating) {
            this.isTranslating = false;
            // Return to edit mode
            if (this.featureDrawn) {
                this.isEdited = true;
            }
        } else {
            this.isTranslating = true;
        }
    }

    /**
     * Toggle measure mode
     */
    toggleMeasure() {
        this.hasMeasureVisible = !this.hasMeasureVisible;
        if (!this.hasMeasureVisible) {
            this.resetConstraints();
        }
    }

    /**
     * Toggle split mode
     */
    toggleSplit() {
        this.isSplitting = !this._isSplitting;
    }

    /**
     * Toggle reshape mode
     */
    toggleReshape() {
        this.isReshaping = !this._isReshaping;
    }

    /**
     * Create a parallel line offset from the existing LineString feature.
     * Uses miter joins (like QGIS) for correct geometry at vertices.
     * Converts offset from meters to map projection units automatically.
     * @param {number} offsetDistance - Offset in meters (positive = right, negative = left)
     */
    createParallel(offsetDistance) {
        if (!offsetDistance || !this.featureDrawn) return;

        const existingFeature = this._drawSource.getFeatures().find(
            f => f.getGeometry().getType() === 'LineString'
        );
        if (!existingFeature) return;

        const coords = existingFeature.getGeometry().getCoordinates();
        if (coords.length < 2) return;

        // Convert meters to map projection units
        const projection = this._map.getView().getProjection();
        const metersPerUnit = projection.getMetersPerUnit() || 1;
        const d = offsetDistance / metersPerUnit;

        // Compute offset point for a segment's endpoint
        const offsetSegPoint = (p, dx, dy, len) => [
            p[0] + (dy / len) * d,
            p[1] + (-dx / len) * d
        ];

        // Compute the intersection of two lines (p1→p2) and (p3→p4)
        const lineIntersection = (p1, p2, p3, p4) => {
            const dx1 = p2[0] - p1[0], dy1 = p2[1] - p1[1];
            const dx2 = p4[0] - p3[0], dy2 = p4[1] - p3[1];
            const denom = dx1 * dy2 - dy1 * dx2;
            if (Math.abs(denom) < 1e-10) return null; // parallel segments
            const t = ((p3[0] - p1[0]) * dy2 - (p3[1] - p1[1]) * dx2) / denom;
            return [p1[0] + t * dx1, p1[1] + t * dy1];
        };

        // Build offset segments: for each original segment, offset both endpoints
        const offsetSegments = [];
        for (let i = 0; i < coords.length - 1; i++) {
            const dx = coords[i + 1][0] - coords[i][0];
            const dy = coords[i + 1][1] - coords[i][1];
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len === 0) continue;
            offsetSegments.push({
                p1: offsetSegPoint(coords[i], dx, dy, len),
                p2: offsetSegPoint(coords[i + 1], dx, dy, len)
            });
        }

        if (offsetSegments.length === 0) return;

        // Build offset polyline using miter joins
        const offsetCoords = [offsetSegments[0].p1];
        for (let i = 0; i < offsetSegments.length - 1; i++) {
            const seg1 = offsetSegments[i];
            const seg2 = offsetSegments[i + 1];
            const intersection = lineIntersection(seg1.p1, seg1.p2, seg2.p1, seg2.p2);
            if (intersection) {
                // Limit miter to avoid extreme spikes (miter limit = 5x offset)
                const orig = coords[i + 1];
                const miterDist = Math.sqrt(
                    (intersection[0] - orig[0]) ** 2 + (intersection[1] - orig[1]) ** 2
                );
                if (miterDist > Math.abs(d) * 5) {
                    // Fall back to bevel: use both segment endpoints
                    offsetCoords.push(seg1.p2);
                    offsetCoords.push(seg2.p1);
                } else {
                    offsetCoords.push(intersection);
                }
            } else {
                // Parallel segments — use endpoint of first segment
                offsetCoords.push(seg1.p2);
            }
        }
        offsetCoords.push(offsetSegments[offsetSegments.length - 1].p2);

        existingFeature.setGeometry(new LineString(offsetCoords));
        mainEventDispatcher.dispatch('digitizing.geometryChanged');
    }

    /**
     * Toggle erase mode
     */
    toggleErasing() {
        this.isErasing = !this._isErasing;
    }

    /**
     * Toggle save mode
     * @returns {void}
     * @fires digitizingSave
     */
    toggleSave() {
        this._isSaved = !this._isSaved;

        this.saveFeatureDrawn();

        /**
         * @event digitizingSave
         * @type {object}
         * @property {string} type - digitizing.save
         * @example
         * lizMap.mainEventDispatcher.addListener((lizmapEvent) => {
         *     console.log('The digitizing save tool is active or not: '+lizmapEvent.isSaved);
         * }, 'digitizing.save');
         */
        mainEventDispatcher.dispatch({
            type: 'digitizing.save',
            isSaved: this._isSaved,
        });
    }

    /**
     * Erase all drawn features
     * @returns {void}
     * @fires digitizingEraseAll
     * @fires digitizingErase
     */
    eraseAll() {
        this.isEdited = false;
        this.isRotate = false
        this.isErasing = false;
        this.isSplitting = false;
        this.isReshaping = false;

        this._measureTooltips.forEach((measureTooltip) => {
            this._map.removeOverlay(measureTooltip[0]);
            this._map.removeOverlay(measureTooltip[1]);
            this._measureTooltips.delete(measureTooltip);
        });
        this._drawSource.clear();

        this.saveFeatureDrawn();

        /**
         * @event digitizingEraseAll
         * @type {object}
         * @property {string} type - digitizing.erase.all
         * @example
         * lizMap.mainEventDispatcher.addListener(() => {
         *     console.log('All drawn features have been erased');
         * }, 'digitizing.erase.all');
         */
        mainEventDispatcher.dispatch('digitizing.erase.all');
        mainEventDispatcher.dispatch('digitizing.erase');
        mainEventDispatcher.dispatch('digitizing.geometryChanged');
    }

    /**
     * Get a feature as WKT in the given SRID
     * @param {string|number} srid - Target SRID (e.g. 4326)
     * @param {Feature} [feature] - Optional specific feature. Defaults to first drawn feature.
     * @returns {string} WKT string or empty string if no features
     */
    getFeatureAsWKT(srid, feature) {
        if (!feature) {
            const features = this.featureDrawn;
            if (!features || features.length === 0) return '';
            feature = features[0];
        }
        const wktFormat = new WKT();
        const geom = feature.getGeometry().clone();
        geom.transform(this._map.getView().getProjection(), 'EPSG:' + srid);
        return wktFormat.writeGeometry(geom);
    }

    /**
     * Load a feature from WKT string and add it to the draw source
     * @param {string} wktString - WKT geometry string
     * @param {string|number} srid - Source SRID of the WKT
     * @returns {Feature|null} The loaded feature or null
     */
    loadFeatureFromWKT(wktString, srid) {
        if (!wktString) return null;
        const wktFormat = new WKT();
        const feature = wktFormat.readFeature(wktString, {
            dataProjection: 'EPSG:' + srid,
            featureProjection: this._map.getView().getProjection()
        });
        this.eraseAll();
        feature.set('color', this._drawColor);
        this._drawSource.addFeature(feature);
        return feature;
    }

    /**
     * Save all drawn features in local storage
     * @returns {void}
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
                try {
                    localStorage.setItem(
                        this._repoAndProjectString + '_' + this._context + '_drawLayer',
                        JSON.stringify(savedFeatures),
                    );
                } catch (e) {
                    if (e.name === 'QuotaExceededError') {
                        this._lizmap3.addMessage(lizDict['digitizing.save.quota.error'] || 'Drawing storage quota exceeded', 'warning', true);
                    } else {
                        console.error('Failed to save drawing to localStorage:', e);
                    }
                }
            } else {
                localStorage.removeItem(this._repoAndProjectString + '_' + this._context + '_drawLayer');
            }
        } else {
            localStorage.removeItem(this._repoAndProjectString + '_' + this._context + '_drawLayer');
        }
    }

    /**
     * Load all drawn features from local storage
     * @returns {void}
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
                console.warn('`'+savedGeomJSON+'` is not a JSON!');
                // the saved data could be a WKT from previous lizmap version
                try {
                    const formatWKT = new WKT();
                    loadedFeatures = formatWKT.readFeatures(savedGeomJSON);
                    console.warn(loadedFeatures.length+' features read from WKT!');
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
                    console.warn('`'+savedGeomJSON+'` is not a WKT!');
                    console.error(json_error);
                    console.error(wkt_error);
                }
            }

            // Draw features
            this._isSaved = (loadedFeatures.length > 0);
            this._drawSource.addFeatures(loadedFeatures);
        }
    }

    /**
     * Download the drawn features
     * @param {*} format - the format to download the drawn features
     * @returns {void}
     */
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

    /**
     * Import file to draw features stored in it
     * @param {*} file - the file to draw
     * @returns {void}
     */
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
                    this._lizmap3.addMessage(error.message || String(error), 'danger', true);
                }

                if (OL6features) {
                    // Add imported features to map
                    this._drawSource.addFeatures(OL6features);
                    // And zoom to their bounding extent
                    const featuresGeometry = OL6features.map(feature => feature.getGeometry());
                    const featuresGeometryCollection = new GeometryCollection(featuresGeometry);
                    this._map.zoomToGeometryOrExtent(featuresGeometryCollection.getExtent());

                    // since a feature is added on the map,
                    // we should emit the "featureDrawn" event anyway, no matter which tool is currently selected.
                    // Check first if the listener is already registered on source, before manually trigger
                    // the callback.
                    if (!this._drawSource.hasListener("addfeature")) {
                        this._addFeatureSaveDispatchListener();
                    }
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
