import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import Utils from '../modules/Utils.js';

import GeoJSON from 'ol/format/GeoJSON';
import GPX from 'ol/format/GPX';
import KML from 'ol/format/KML';

import { Draw, Modify, Select } from 'ol/interaction';
import { createBox } from 'ol/interaction/Draw';

import { Circle, Fill, Stroke, RegularShape, Style } from 'ol/style';

import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Feature } from 'ol';

import { Point, LineString, Polygon, Circle as CircleGeom } from 'ol/geom';
import { circular } from 'ol/geom/Polygon';

import { getArea, getLength } from 'ol/sphere';
import Overlay from 'ol/Overlay';
import { unByKey } from 'ol/Observable';

import { transform } from 'ol/proj';

export default class Digitizing {

    constructor() {

        this._tools = ['deactivate', 'point', 'line', 'polygon', 'box', 'circle', 'freehand'];
        this._toolSelected = this._tools[0];

        this._repoAndProjectString = lizUrls.params.repository + '_' + lizUrls.params.project;

        // Set draw color to value in local storage if any or default (red)
        this._drawColor = localStorage.getItem(this._repoAndProjectString + '_drawColor') || '#ff0000';

        this._isEdited = false;
        this._isSaved = false;

        this._drawInteraction;

        this._measureTooltipElement;
        this._measureTooltips = [];

        this._selectInteraction = new Select({
            wrapX: false,
        });

        this._modifyInteraction = new Modify({
            features: this._selectInteraction.getFeatures(),
        });

        this._pointRadius = 6;
        this._fillOpacity = 0.2;
        this._strokeWidth = 2;

        this._drawStyleFunction = () => {
            return new Style({
                image: new Circle({
                    fill: new Fill({
                        color: this._drawColor,
                    }),
                    radius: this._pointRadius,
                }),
                fill: new Fill({
                    color: this._drawColor + '33', // Opacity: 0.2
                }),
                stroke: new Stroke({
                    color: this._drawColor,
                    width: this._strokeWidth
                }),
            });
        }

        this._drawSource = new VectorSource({ wrapX: false });

        this._drawSource.on('addfeature', () => {
            // Save features drawn in localStorage
            this.saveFeatureDrawn();
            mainEventDispatcher.dispatch('digitizing.featureDrawn');
        });

        this._drawLayer = new VectorLayer({
            visible: false,
            source: this._drawSource,
            style: this._drawStyleFunction
        });

        mainLizmap.map.addLayer(this._drawLayer);

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
        mainLizmap.map.addLayer(this._constraintLayer);

        // Constraints values
        this._distanceConstraint = 0;
        this._angleConstraint = 0;

        // Load and display saved feature if any
        this.loadFeatureDrawnToMap();

        // Disable drawing tool when measure tool is activated
        mainLizmap.lizmap3.events.on({
            minidockopened: (e) => {
                if (e.id == 'measure') {
                    this.toolSelected = this._tools[0];
                } else if (e.id == 'draw' || e.id == 'selectiontool') {
                    mainLizmap.newOlMap = true;
                    this.toggleFeatureDrawnVisibility(true);
                }
            },
            minidockclosed: (e) => {
                if (e.id == 'draw' || e.id == 'selectiontool') {
                    mainLizmap.newOlMap = false;
                    this.toggleFeatureDrawnVisibility(false);
                }
            }
        });

        this.createMeasureTooltip();
    }

    get drawLayer() {
        return this._drawLayer;
    }

    get toolSelected() {
        return this._toolSelected;
    }

    set toolSelected(tool) {
        if (this._tools.includes(tool)) {
            // Disable all tools
            mainLizmap.map.removeInteraction(this._drawInteraction);

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
                        drawOptions.geometryFunction = (coords, geom) => this._contraintsHandler(coords, geom, drawOptions.type);
                        break;
                    case this._tools[3]:
                        drawOptions.type = 'Polygon';
                        drawOptions.geometryFunction = (coords, geom) => this._contraintsHandler(coords, geom, drawOptions.type);
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
                }

                this._drawInteraction = new Draw(drawOptions);

                this._drawInteraction.on('drawend', () => {
                    this._constraintLayer.setVisible(false);
                    this._measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
                    this._measureTooltips[this._measureTooltips.length - 1].setOffset([0, -7]);
                    // unset tooltip so that a new one can be created
                    this._measureTooltipElement = null;
                    this.createMeasureTooltip();
                    unByKey(this._listener);
                });

                mainLizmap.map.addInteraction(this._drawInteraction);

                this._toolSelected = tool;

                // Disable edition when tool changes
                this.isEdited = false;
            }

            mainEventDispatcher.dispatch('digitizing.toolSelected');
        }
    }

    get drawColor() {
        return this._drawColor;
    }

    set drawColor(color) {
        this._drawColor = color;

        // Refresh draw layer
        this._drawLayer.changed();

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

    get featureDrawnVisibility() {
        return this._featureDrawnVisibility;
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
                }

                mainLizmap.map.removeInteraction(this._drawInteraction);

                mainLizmap.map.addInteraction(this._selectInteraction);
                mainLizmap.map.addInteraction(this._modifyInteraction);

                this.toolSelected = 'deactivate';

                mainEventDispatcher.dispatch('digitizing.editionBegins');
            } else {
                // Clear selection
                this._selectInteraction.getFeatures().clear();
                mainLizmap.map.removeInteraction(this._selectInteraction);
                mainLizmap.map.removeInteraction(this._modifyInteraction);

                this.saveFeatureDrawn();

                mainEventDispatcher.dispatch('digitizing.editionEnds');
            }
        }
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

            if (this._distanceConstraint) {
                // Draw circle with distanceConstraint as radius
                const circle = circular(
                    transform(lastDrawnPointCoords, 'EPSG:3857', 'EPSG:4326'),
                    this._distanceConstraint,
                    128
                );

                constrainedPointCoords = transform(circle.getClosestPoint(transform(cursorPointCoords, 'EPSG:3857', 'EPSG:4326')), 'EPSG:4326', 'EPSG:3857');

                // Draw visual constraint features
                this._constraintLayer.getSource().addFeature(
                    new Feature({
                        geometry: circle.transform('EPSG:4326', 'EPSG:3857')
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
                const constrainedAngleLineString = new LineString([_coords[_coords.length - 3], lastDrawnPointCoords]);
                // Rotate clockwise
                constrainedAngleLineString.rotate(-1 * this._angleConstraint * (Math.PI / 180.0), lastDrawnPointCoords);
                constrainedAngleLineString.scale(100); // stretch line

                this._constraintLayer.getSource().addFeature(new Feature({
                    geometry: constrainedAngleLineString
                }));

                constrainedPointCoords = constrainedAngleLineString.getClosestPoint(cursorPointCoords);
            }

            if (this._distanceConstraint && this._angleConstraint && _coords.length > 2) {
                const constrainedAngleDistanceLineString = new LineString([_coords[_coords.length - 3], lastDrawnPointCoords]);
                // Rotate clockwise
                constrainedAngleDistanceLineString.rotate(-1 * this._angleConstraint * (Math.PI / 180.0), lastDrawnPointCoords);
                const ratio = this._distanceConstraint / getLength(constrainedAngleDistanceLineString);
                constrainedAngleDistanceLineString.scale(ratio, ratio, constrainedAngleDistanceLineString.getLastCoordinate());

                this._constraintLayer.getSource().addFeature(new Feature({
                    geometry: constrainedAngleDistanceLineString
                }));

                constrainedPointCoords = constrainedAngleDistanceLineString.getFirstCoordinate();
            }

            _coords[_coords.length - 1] = constrainedPointCoords;
        }

        if (geomType === 'Polygon') {
            geom.setCoordinates([_coords]);
        } else {
            geom.setCoordinates(_coords);
        }

        // Display draw measures in tooltip

        // Current segment length
        let tooltipContent = this.formatLength(new LineString([_coords[_coords.length - 1], _coords[_coords.length - 2]]));;

        // Total length for LineStrings
        // Perimeter and area for Polygons
        if (geomType === 'Polygon' && _coords.length > 2) {
            // Close LinearRing to get its perimeter
            const perimeterCoords = Array.from(_coords);
            perimeterCoords.push(Array.from(_coords[0]));
            tooltipContent += '<br>' + this.formatLength(new Polygon([perimeterCoords]));
            tooltipContent += '<br>' + this.formatArea(geom);
        } else {
            tooltipContent = this.formatLength(new LineString([_coords[_coords.length - 1], _coords[_coords.length - 2]]));
            tooltipContent += '<br>' + this.formatLength(geom);
        }

        this._measureTooltipElement.innerHTML = tooltipContent;
        this._measureTooltips[this._measureTooltips.length - 1].setPosition(geom.getLastCoordinate());

        return geom;
    }

    /**
     * Format length output.
     * @param {Geometry} geom The geom.
     * @return {string} The formatted length.
     */
    formatLength(geom) {
        const length = getLength(geom);
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
     * @return {string} Formatted area.
     */
    formatArea(polygon) {
        const area = getArea(polygon);
        let output;
        if (area > 10000) {
            output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
        } else {
            output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
        }
        return output;
    }

    /**
     * Creates a new measure tooltip
     */
    createMeasureTooltip() {
        if (this._measureTooltipElement) {
            this._measureTooltipElement.parentNode.removeChild(this._measureTooltipElement);
        }
        this._measureTooltipElement = document.createElement('div');
        this._measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';

        const overlay = new Overlay({
            element: this._measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center',
            stopEvent: false,
            insertFirst: false,
        });

        this._measureTooltips.push(overlay);
        mainLizmap.map.addOverlay(overlay);
    }

    // Get SLD for featureDrawn[index]
    getFeatureDrawnSLD(index) {
        if (this.featureDrawn[index]) {
            // const style = this.featureDrawn[index].layer.styleMap.styles.default.defaultStyle;
            let symbolizer = '';
            let strokeAndFill = `<Stroke>
                                        <SvgParameter name="stroke">${this._drawColor}</SvgParameter>
                                        <SvgParameter name="stroke-opacity">1</SvgParameter>
                                        <SvgParameter name="stroke-width">${this._strokeWidth}</SvgParameter>
                                    </Stroke>
                                    <Fill>
                                        <SvgParameter name="fill">${this._drawColor}</SvgParameter>
                                        <SvgParameter name="fill-opacity">${this._fillOpacity}</SvgParameter>
                                    </Fill>`;

            // We consider LINESTRING and POLYGON together currently
            if (this.featureDrawn[index].getGeometry().getType() === 'Point') {
                symbolizer = `<PointSymbolizer>
                                <Graphic>
                                    <Mark>
                                        <WellKnownName>circle</WellKnownName>
                                        ${strokeAndFill}
                                    </Mark>
                                    <Size>${2 * this._pointRadius}</Size>
                                </Graphic>
                            </PointSymbolizer>`;

            } else {
                symbolizer = `<PolygonSymbolizer>
                                    ${strokeAndFill}
                                </PolygonSymbolizer>`;

            }
            return `<?xml version="1.0" encoding="UTF-8"?>
                    <StyledLayerDescriptor xmlns="http://www.opengis.net/sld"
                        xmlns:ogc="http://www.opengis.net/ogc"
                        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1.0"
                        xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd"
                        xmlns:se="http://www.opengis.net/se">
                        <UserStyle>
                            <FeatureTypeStyle>
                                <Rule>
                                    ${symbolizer}
                                </Rule>
                            </FeatureTypeStyle>
                        </UserStyle>
                    </StyledLayerDescriptor>`;
        }
        return null;
    }

    get visibility(){
        return this._drawLayer.getVisible();
    }

    /**
     * Set visibility or toggle if not defined
     * @param {boolean} visible
     */
    toggleFeatureDrawnVisibility(visible = !this._drawLayer.getVisible()) {
        this._drawLayer.setVisible(visible);

        mainEventDispatcher.dispatch('digitizing.featureDrawnVisibility');
    }

    toggleEdit() {
        this.isEdited = !this.isEdited;
    }

    erase() {
        if (!confirm(lizDict['digitizing.confirme.erase'])) {
            return false;
        }
        this._drawSource.clear(true);

        localStorage.removeItem(this._repoAndProjectString + '_drawLayer');

        this.isEdited = false;

        // Remove overlays
        for (const overlay of this._measureTooltips) {
            mainLizmap.map.removeOverlay(overlay);
        }

        this.createMeasureTooltip();

        mainEventDispatcher.dispatch('digitizing.erase');
    }

    toggleSave() {
        this._isSaved = !this._isSaved;

        this.saveFeatureDrawn();

        mainEventDispatcher.dispatch('digitizing.save');
    }

    /**
     * Save all drawn features in local storage
     */
    saveFeatureDrawn() {
        if (this.featureDrawn && this._isSaved) {
            const savedFeatures = [];
            for(const feature of this.featureDrawn){
                const geomType = feature.getGeometry().getType();

                if( geomType === 'Circle'){
                    savedFeatures.push({
                        type: geomType,
                        center: feature.getGeometry().getCenter(),
                        radius: feature.getGeometry().getRadius()
                    });
                } else {
                    savedFeatures.push({
                        type: geomType,
                        coords: feature.getGeometry().getCoordinates()
                    });
                }
            }
            localStorage.setItem(this._repoAndProjectString + '_drawLayer', JSON.stringify(savedFeatures));
        }
    }

    /**
     * Load all drawn features from local storage
     */
    loadFeatureDrawnToMap() {
        const savedGeomJSON = localStorage.getItem(this._repoAndProjectString + '_drawLayer');

        if (savedGeomJSON) {
            const savedFeatures = JSON.parse(savedGeomJSON);
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
                    this._drawSource.addFeature(new Feature(loadedGeom));
                }
            }
        }
    }

    download(format) {
        if (this.featureDrawn) {
            if (format === 'geojson') {
                const geoJSON = (new GeoJSON()).writeFeatures(this.featureDrawn);
                Utils.downloadFileFromString(geoJSON, 'application/geo+json', 'export.geojson');
            } else if (format === 'gpx') {
                const gpx = (new GPX()).writeFeatures(this.featureDrawn);
                Utils.downloadFileFromString(gpx, 'application/gpx+xml', 'export.gpx');
            } else if (format === 'kml') {
                const kml = (new KML()).writeFeatures(this.featureDrawn);
                Utils.downloadFileFromString(kml, 'application/vnd.google-earth.kml+xml', 'export.kml');
            }
        }
    }

    import(file) {
        const reader = new FileReader();

        // Get file extension
        const fileExtension = file.name.split('.').pop().toLowerCase();

        reader.onload = (() => {
            return (e) => {
                const fileContent = e.target.result;
                let OL6features;

                // Handle GeoJSON, GPX or KML strings
                try {
                    // Check extension for format type
                    if (['json', 'geojson'].includes(fileExtension)) {
                        OL6features = (new GeoJSON()).readFeatures(fileContent);
                    } else if (fileExtension === 'gpx') {
                        OL6features = (new GPX()).readFeatures(fileContent);
                    } else if (fileExtension === 'kml') {
                        OL6features = (new KML()).readFeatures(fileContent);
                    }
                } catch (error) {
                    lizMap.addMessage(error, 'error', true)
                }

                if (OL6features) {
                    // Add imported features to map and zoom to their extent
                    this._drawSource.addFeatures(OL6features);
                    mainLizmap.extent = this._drawSource.getExtent();
                }
            };
        })(this);

        reader.readAsText(file);
    }
}
