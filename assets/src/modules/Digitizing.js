import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import Utils from '../modules/Utils.js';

import Feature from 'ol/Feature';

import Point from 'ol/geom/Point';
import MultiPoint from 'ol/geom/MultiPoint';
import LineString from 'ol/geom/LineString';
import MultiLineString from 'ol/geom/MultiLineString';
import Polygon from 'ol/geom/Polygon';
import MultiPolygon from 'ol/geom/MultiPolygon';

import GeoJSON from 'ol/format/GeoJSON';
import GPX from 'ol/format/GPX';
import KML from 'ol/format/KML';

import Draw, {
    createBox,
} from 'ol/interaction/Draw';

import {Circle, Fill, Stroke, Style} from 'ol/style';

import {Vector as VectorSource} from 'ol/source';
import {Vector as VectorLayer} from 'ol/layer';

export default class Digitizing {

    constructor() {

        mainLizmap.newOlMap = true;

        this._tools = ['deactivate', 'point', 'line', 'polygon', 'box', 'circle', 'freehand'];
        this._toolSelected = this._tools[0];

        this._repoAndProjectString = lizUrls.params.repository + '_' + lizUrls.params.project;

        // Set draw color to value in local storage if any or default (red)
        this._drawColor = localStorage.getItem(this._repoAndProjectString + '_drawColor') || '#ff0000';

        this._featureDrawnVisibility = true;

        this._isEdited = false;
        this._isSaved = false;

        this._drawInteraction;

        this._drawStyleFunction = () => {
            return new Style({
                image: new Circle({
                    fill: new Fill({
                        color: this._drawColor,
                    }),
                    radius: 6,
                }),
                fill: new Fill({
                    color: this._drawColor + '33',
                }),
                stroke: new Stroke({
                    color: this._drawColor,
                    width: 2
                }),
            });
        }

        this._drawLayer = new VectorLayer({
            source: new VectorSource({wrapX: false}),
            style: this._drawStyleFunction
        });

        mainLizmap.map.addLayer(this._drawLayer);

        // Load and display saved feature if any
        this.loadFeatureDrawnToMap();

        // Disable drawing tool when measure tool is activated
        mainLizmap.lizmap3.events.on({
            minidockopened: (e) => {
                if (e.id == 'measure') {
                    this.toolSelected = this._tools[0];
                }
            }
        });
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

            // If current selected tool is selected again => unactivate
            if (this._toolSelected === tool) {
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
                        break;
                    case this._tools[3]:
                        drawOptions.type = 'Polygon';
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

                mainLizmap.map.addInteraction(this._drawInteraction);

                this._toolSelected = tool;
            }

            // Disable edition when tool changes
            if (this._toolSelected !== this._tools[0]) {
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
        // if (this._drawLayer.features.length) {
        //     return this._drawLayer.features;
        // }
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
                    this._editCtrl.standalone = true;
                    this._editCtrl.selectFeature(this.featureDrawn[0]);
                } else {
                    this._editCtrl.standalone = false;
                }
                this._editCtrl.activate();
                this.toolSelected = 'deactivate';

                mainEventDispatcher.dispatch('digitizing.editionBegins');
            } else {
                this._editCtrl.deactivate();
                this.saveFeatureDrawn();

                mainEventDispatcher.dispatch('digitizing.editionEnds');
            }
        }
    }
    get isSaved() {
        return this._isSaved;
    }

    // Get SLD for featureDrawn[index]
    getFeatureDrawnSLD(index) {
        if (this.featureDrawn[index]) {
            const style = this.featureDrawn[index].layer.styleMap.styles.default.defaultStyle;
            let symbolizer = '';
            let strokeAndFill = `<Stroke>
                                        <SvgParameter name="stroke">${style.strokeColor}</SvgParameter>
                                        <SvgParameter name="stroke-opacity">${style.strokeOpacity}</SvgParameter>
                                        <SvgParameter name="stroke-width">${style.strokeWidth}</SvgParameter>
                                    </Stroke>
                                    <Fill>
                                        <SvgParameter name="fill">${style.fillColor}</SvgParameter>
                                        <SvgParameter name="fill-opacity">${style.fillOpacity}</SvgParameter>
                                    </Fill>`;

            // We consider LINESTRING and POLYGON together currently
            if (this.featureDrawn[index].geometry.CLASS_NAME === 'OpenLayers.Geometry.Point') {
                symbolizer = `<PointSymbolizer>
                                <Graphic>
                                    <Mark>
                                        <WellKnownName>circle</WellKnownName>
                                        ${strokeAndFill}
                                    </Mark>
                                    <Size>${2 * style.pointRadius}</Size>
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

    toggleFeatureDrawnVisibility() {
        this._featureDrawnVisibility = !this._featureDrawnVisibility;

        this._drawLayer.setVisibility(this._featureDrawnVisibility);

        mainEventDispatcher.dispatch('digitizing.featureDrawnVisibility');
    }

    toggleEdit() {
        this.isEdited = !this.isEdited;
    }

    erase() {
        if (!confirm(lizDict['digitizing.confirme.erase'])) {
            return false;
        }
        this._drawLayer.destroyFeatures();

        localStorage.removeItem(this._repoAndProjectString + '_drawLayer');

        this.isEdited = false;

        mainEventDispatcher.dispatch('digitizing.erase');
    }

    toggleSave() {
        this._isSaved = !this._isSaved;

        this.saveFeatureDrawn();

        mainEventDispatcher.dispatch('digitizing.save');
    }

    saveFeatureDrawn() {
        const formatWKT = new OpenLayers.Format.WKT();

        // Save features in WKT format if any and if save mode is on
        if (this.featureDrawn && this._isSaved) {
            localStorage.setItem(this._repoAndProjectString + '_drawLayer', formatWKT.write(this.featureDrawn));
        }
    }

    loadFeatureDrawnToMap() {
        const formatWKT = new OpenLayers.Format.WKT();

        const drawLayerWKT = localStorage.getItem(this._repoAndProjectString + '_drawLayer');

        if (drawLayerWKT) {
            this._drawLayer.addFeatures(formatWKT.read(drawLayerWKT));
            this._drawLayer.redraw(true);
        }
    }

    download(format) {
        if (this.featureDrawn) {
            const OL6Allfeatures = [];

            // Create OL6 features with OL2 features coordinates
            for (const featureDrawn of this.featureDrawn) {
                const featureGeometry = featureDrawn.geometry;
                let OL6feature;

                if (featureGeometry.CLASS_NAME === 'OpenLayers.Geometry.Point') {
                    OL6feature = new Feature(new Point([featureGeometry.x, featureGeometry.y]));
                } else if (featureGeometry.CLASS_NAME === 'OpenLayers.Geometry.MultiPoint') {
                    let coordinates = [];
                    for (const component of featureGeometry.components){
                        coordinates.push([component.x, component.y]);
                    }
                    OL6feature = new Feature(new MultiPoint(coordinates));
                } else if (featureGeometry.CLASS_NAME === 'OpenLayers.Geometry.LineString') {
                    let coordinates = [];
                    for (const component of featureGeometry.components) {
                        coordinates.push([component.x, component.y]);
                    }
                    OL6feature = new Feature(new LineString(coordinates));
                } else if (featureGeometry.CLASS_NAME === 'OpenLayers.Geometry.MultiLineString') {
                    let lineStringArray = [];
                    for (const lineStringComponent of featureGeometry.components) {
                        let coordinates = [];
                        for (const pointComponent of lineStringComponent.components){
                            coordinates.push([pointComponent.x, pointComponent.y]);
                        }
                        lineStringArray.push(new LineString(coordinates));
                    }
                    OL6feature = new Feature(new MultiLineString(lineStringArray));
                } else if (featureGeometry.CLASS_NAME === 'OpenLayers.Geometry.Polygon') {
                    let linearRingArray = [];
                    for (const linearRingComponent of featureGeometry.components) {
                        let coordinates = [];
                        for (const pointComponent of linearRingComponent.components) {
                            coordinates.push([pointComponent.x, pointComponent.y]);
                        }
                        linearRingArray.push(coordinates);
                    }
                    OL6feature = new Feature(new Polygon(linearRingArray));
                } else if (featureGeometry.CLASS_NAME === 'OpenLayers.Geometry.MultiPolygon') {
                    let polygonArray = [];
                    for (const polygonComponent of featureGeometry.components) {
                        let linearRingArray = [];
                        for (const linearRingComponent of polygonComponent.components) {
                            let coordinates = [];
                            for (const pointComponent of linearRingComponent.components){
                                coordinates.push([pointComponent.x, pointComponent.y]);
                            }
                            linearRingArray.push(coordinates);
                        }
                        polygonArray.push(new Polygon(linearRingArray));
                    }
                    OL6feature = new Feature(new MultiPolygon(polygonArray));
                }

                // Reproject to EPSG:4326
                OL6feature.getGeometry().transform(mainLizmap.projection, 'EPSG:4326');

                OL6Allfeatures.push(OL6feature);
            }

            if (format === 'geojson') {
                const geoJSON = (new GeoJSON()).writeFeatures(OL6Allfeatures);
                Utils.downloadFileFromString(geoJSON, 'application/geo+json', 'export.geojson');
            } else if (format === 'gpx') {
                const gpx = (new GPX()).writeFeatures(OL6Allfeatures);
                Utils.downloadFileFromString(gpx, 'application/gpx+xml', 'export.gpx');
            } else if (format === 'kml') {
                const kml = (new KML()).writeFeatures(OL6Allfeatures);
                Utils.downloadFileFromString(kml, 'application/vnd.google-earth.kml+xml', 'export.kml');
            }
        }
    }

    import(file) {
        const reader = new FileReader();

        // Get extension file
        const fileExtension = file.name.split('.').pop();

        reader.onload = (() => {
            return (e) => {
                const fileContent = e.target.result;
                let OL6features;

                // Handle GeoJSON, GPX or KML strings
                try {
                    // Check extension to the feature type
                    if (fileExtension === 'geojson' || fileExtension === 'json') {
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
                    const OL2Features = [];

                    for (const OL6feature of OL6features) {
                        // Draw loaded features
                        const importedGeom = OL6feature.getGeometry();
                        const importedGeomType = importedGeom.getType();

                        // Convert from EPSG:4326 to current projection
                        importedGeom.transform('EPSG:4326', mainLizmap.projection);
                        const importedGeomCoordinates = importedGeom.getCoordinates();

                        const importedGeomAsArrayOfPoints = [];
                        let geomToDraw;

                        if (importedGeomType === 'Point') {
                            geomToDraw = new OpenLayers.Geometry.Point(importedGeomCoordinates[0], importedGeomCoordinates[1]);
                        } else if (importedGeomType === 'MultiPoint') {
                            let pointsCoords = [];
                            for (const coordinate of importedGeomCoordinates) {
                                pointsCoords.push(new OpenLayers.Geometry.Point(coordinate[0], coordinate[1]));
                            }
                            
                            geomToDraw = new OpenLayers.Geometry.MultiPoint(pointsCoords);
                        } else if (importedGeomType === 'LineString') {
                            for (const coordinate of importedGeomCoordinates) {
                                importedGeomAsArrayOfPoints.push(new OpenLayers.Geometry.Point(coordinate[0], coordinate[1]));
                            }

                            geomToDraw = new OpenLayers.Geometry.LineString(importedGeomAsArrayOfPoints);
                        } else if (importedGeomType === 'MultiLineString') {
                            const lineStringArray = [];
                            for (const lineStringCoords of importedGeomCoordinates) {
                                let pointsCoords = [];
                                for (const coordinate of lineStringCoords) {
                                    pointsCoords.push(new OpenLayers.Geometry.Point(coordinate[0], coordinate[1]));
                                }
                                lineStringArray.push(new OpenLayers.Geometry.LineString(pointsCoords));
                            }

                            geomToDraw = new OpenLayers.Geometry.MultiLineString(lineStringArray);
                        } else if (importedGeomType === 'Polygon') {
                            const linearRingsArray = [];
                            for (const linearRingsCoords of importedGeomCoordinates) {
                                let pointsCoords = [];
                                for (const coordinate of linearRingsCoords) {
                                    pointsCoords.push(new OpenLayers.Geometry.Point(coordinate[0], coordinate[1]));
                                }
                                linearRingsArray.push(new OpenLayers.Geometry.LinearRing(pointsCoords));
                            }

                            geomToDraw = new OpenLayers.Geometry.Polygon(linearRingsArray);
                        } else if (importedGeomType === 'MultiPolygon') {
                            const polygonsArray = [];
                            for (const polygonCoords of importedGeomCoordinates){
                                const linearRingsArray = [];
                                for (const linearRingsCoords of polygonCoords){
                                    let pointsCoords = [];
                                    for (const coordinate of linearRingsCoords) {
                                        pointsCoords.push(new OpenLayers.Geometry.Point(coordinate[0], coordinate[1]));
                                    }
                                    linearRingsArray.push(new OpenLayers.Geometry.LinearRing(pointsCoords));
                                }
                                polygonsArray.push(new OpenLayers.Geometry.Polygon(linearRingsArray));
                            }

                            geomToDraw = new OpenLayers.Geometry.MultiPolygon(polygonsArray);
                        }

                        if (geomToDraw) {
                            OL2Features.push(new OpenLayers.Feature.Vector(geomToDraw));
                        }
                    }

                    if (OL2Features) {
                        // Add imported features to map and zoom to their extent
                        this._drawLayer.addFeatures(OL2Features);
                        this._drawLayer.redraw(true);
                        mainLizmap.lizmap3.map.zoomToExtent(this._drawLayer.getDataExtent());
                    }
                }
            };
        })(this);

        reader.readAsText(file);
    }
}
