import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';

import Feature from 'ol/Feature';

import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';

import GeoJSON from 'ol/format/GeoJSON';
import GPX from 'ol/format/GPX';
import KML from 'ol/format/KML';

export default class Digitizing {

    constructor() {

        this._tools = ['deactivate', 'point', 'line', 'polygon', 'box', 'circle', 'freehand'];
        this._toolSelected = this._tools[0];

        this._repoAndProjectString = lizUrls.params.repository + '_' + lizUrls.params.project;

        // Set draw color to value in local storage if any or default (red)
        this._drawColor = localStorage.getItem(this._repoAndProjectString + '_drawColor') || '#ff0000';

        this._featureDrawnVisibility = true;

        this._isEdited = false;

        // Draw tools style
        const drawStyle = new OpenLayers.Style({
            pointRadius: 7,
            fillColor: this._drawColor,
            fillOpacity: 0.2,
            strokeColor: this._drawColor,
            strokeOpacity: 1,
            strokeWidth: 3
        });

        const drawStyleTemp = new OpenLayers.Style({
            pointRadius: 7,
            fillColor: this._drawColor,
            fillOpacity: 0.3,
            strokeColor: this._drawColor,
            strokeOpacity: 1,
            strokeWidth: 3
        });

        const drawStyleSelect = new OpenLayers.Style({
            pointRadius: 7,
            fillColor: 'blue',
            fillOpacity: 0.3,
            strokeColor: 'blue',
            strokeOpacity: 1,
            strokeWidth: 3
        });

        const drawStyleMap = new OpenLayers.StyleMap({
            'default': drawStyle,
            'temporary': drawStyleTemp,
            'select': drawStyleSelect
        });

        this._drawLayer = new OpenLayers.Layer.Vector(
            'drawLayer', {
            styleMap: drawStyleMap
        }
        );

        this._drawLayer.events.on({
            'featureadded': () => {
                // Save features drawn in localStorage
                this.saveFeatureDrawn();

                mainEventDispatcher.dispatch('digitizing.featureDrawn');
            }
        });

        mainLizmap.lizmap3.map.addLayer(this._drawLayer);

        // Disable getFeatureInfo when drawing with clicks
        const drawAndGetFeatureInfoMutuallyExclusive = (event) => {
            if (lizMap.controls.hasOwnProperty('featureInfo') && lizMap.controls.featureInfo) {
                if (event.type === 'activate' && lizMap.controls.featureInfo.active) {
                    lizMap.controls.featureInfo.deactivate();
                }
                else if (event.type === 'deactivate' && !lizMap.controls.featureInfo.active) {
                    lizMap.controls.featureInfo.activate();
                }
            }
        };

        /**
         * Point
         * @type @new;OpenLayers.Control.DrawFeature
         */
        this._drawPointLayerCtrl = new OpenLayers.Control.DrawFeature(
            this._drawLayer,
            OpenLayers.Handler.Point,
            {
                styleMap: drawStyleMap,
                eventListeners: {
                    'activate': drawAndGetFeatureInfoMutuallyExclusive,
                    'deactivate': drawAndGetFeatureInfoMutuallyExclusive
                }
            }
        );

        /**
         * Line
         * @type @new;OpenLayers.Control.DrawFeature
         */
        this._drawLineLayerCtrl = new OpenLayers.Control.DrawFeature(
            this._drawLayer,
            OpenLayers.Handler.Path,
            {
                styleMap: drawStyleMap,
                eventListeners: {
                    'activate': drawAndGetFeatureInfoMutuallyExclusive,
                    'deactivate': drawAndGetFeatureInfoMutuallyExclusive
                }
            }
        );

        /**
         * Polygon
         * @type @new;OpenLayers.Control.DrawFeature
         */
        this._drawPolygonLayerCtrl = new OpenLayers.Control.DrawFeature(
            this._drawLayer,
            OpenLayers.Handler.Polygon,
            {
                styleMap: drawStyleMap,
                eventListeners: {
                    'activate': drawAndGetFeatureInfoMutuallyExclusive,
                    'deactivate': drawAndGetFeatureInfoMutuallyExclusive
                }
            }
        );

        /**
         * Box
         * @type @new;OpenLayers.Control.DrawFeature
         */
        this._drawBoxLayerCtrl = new OpenLayers.Control.DrawFeature(this._drawLayer,
            OpenLayers.Handler.RegularPolygon,
            { handlerOptions: { sides: 4, irregular: true } }
        );

        /**
         * Circle
         * @type @new;OpenLayers.Control.DrawFeature
         */
        this._drawCircleLayerCtrl = new OpenLayers.Control.DrawFeature(this._drawLayer,
            OpenLayers.Handler.RegularPolygon,
            { handlerOptions: { sides: 40 } }
        );

        /**
         * Freehand
         * @type @new;OpenLayers.Control.DrawFeature
         */
        this._drawFreehandLayerCtrl = new OpenLayers.Control.DrawFeature(this._drawLayer,
            OpenLayers.Handler.Polygon, {
            styleMap: drawStyleMap,
            handlerOptions: { freehand: true }
        }
        );

        this._drawCtrls = [this._drawPointLayerCtrl, this._drawLineLayerCtrl, this._drawPolygonLayerCtrl, this._drawBoxLayerCtrl, this._drawCircleLayerCtrl, this._drawFreehandLayerCtrl];

        this._editCtrl = new OpenLayers.Control.ModifyFeature(this._drawLayer,
            {
                clickout: false,
                eventListeners: {
                    'activate': drawAndGetFeatureInfoMutuallyExclusive,
                    'deactivate': drawAndGetFeatureInfoMutuallyExclusive
                }
            }
        );

        // Add draw and modification controls to map
        mainLizmap.lizmap3.map.addControls(this._drawCtrls);
        mainLizmap.lizmap3.map.addControl(this._editCtrl);

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
            for (const drawControl of this._drawCtrls) {
                drawControl.deactivate();
            }

            // If current selected tool is selected again => unactivate
            if (this._toolSelected === tool) {
                this._toolSelected = this._tools[0];
            } else {
                switch (tool) {
                    case this._tools[1]:
                        this._drawPointLayerCtrl.activate();
                        break;
                    case this._tools[2]:
                        this._drawLineLayerCtrl.activate();
                        break;
                    case this._tools[3]:
                        this._drawPolygonLayerCtrl.activate();
                        break;
                    case this._tools[4]:
                        this._drawBoxLayerCtrl.activate();
                        break;
                    case this._tools[5]:
                        this._drawCircleLayerCtrl.activate();
                        break;
                    case this._tools[6]:
                        this._drawFreehandLayerCtrl.activate();
                        break;
                }

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

        // Update default and temporary draw styles
        const drawStyles = this._drawLayer.styleMap.styles;

        drawStyles.default.defaultStyle.fillColor = color;
        drawStyles.default.defaultStyle.strokeColor = color;

        drawStyles.temporary.defaultStyle.fillColor = color;
        drawStyles.temporary.defaultStyle.strokeColor = color;

        // Refresh layer
        this._drawLayer.redraw(true);

        // Save color
        localStorage.setItem(this._repoAndProjectString + '_drawColor', this._drawColor);

        mainEventDispatcher.dispatch('digitizing.drawColor');
    }

    get featureDrawn() {
        if (this._drawLayer.features.length) {
            return this._drawLayer.features;
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

    saveFeatureDrawn() {
        const formatWKT = new OpenLayers.Format.WKT();

        // Save features in WKT format
        if (this.featureDrawn) {
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
                }
                else if (featureGeometry.CLASS_NAME === 'OpenLayers.Geometry.LineString') {
                    let coordinates = [];
                    for (const component of featureGeometry.components) {
                        coordinates.push([component.x, component.y]);
                    }
                    OL6feature = new Feature(new LineString(coordinates));
                }
                else if (featureGeometry.CLASS_NAME === 'OpenLayers.Geometry.Polygon') {
                    let coordinates = [];
                    for (const component of featureGeometry.components[0].components) {
                        coordinates.push([component.x, component.y]);
                    }
                    OL6feature = new Feature(new Polygon([coordinates]));
                }

                // Reproject to EPSG:4326
                OL6feature.getGeometry().transform(mainLizmap.projection, 'EPSG:4326');

                OL6Allfeatures.push(OL6feature);
            }

            if (format === 'geojson') {
                const geoJSON = (new GeoJSON()).writeFeatures(OL6Allfeatures);
                this._downloadString(geoJSON, 'application/geo+json', 'export.geojson');
            }
            else if (format === 'gpx') {
                const gpx = (new GPX()).writeFeatures(OL6Allfeatures);
                this._downloadString(gpx, 'application/gpx+xml', 'export.gpx');
            } else if (format === 'kml') {
                const kml = (new KML()).writeFeatures(OL6Allfeatures);
                this._downloadString(kml, 'application/vnd.google-earth.kml+xml', 'export.kml');
            }
        }
    }

    _downloadString(text, fileType, fileName) {
        var blob = new Blob([text], { type: fileType });

        var a = document.createElement('a');
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
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
                        } else if (importedGeomType === 'LineString') {
                            for (const coordinate of importedGeomCoordinates) {
                                importedGeomAsArrayOfPoints.push(new OpenLayers.Geometry.Point(coordinate[0], coordinate[1]));
                            }

                            geomToDraw = new OpenLayers.Geometry.LineString(importedGeomAsArrayOfPoints);
                        } else if (importedGeomType === 'Polygon') {
                            for (const coordinate of importedGeomCoordinates[0]) {
                                importedGeomAsArrayOfPoints.push(new OpenLayers.Geometry.Point(coordinate[0], coordinate[1]));
                            }

                            geomToDraw = new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing(importedGeomAsArrayOfPoints)]);
                        }

                        if (geomToDraw) {
                            OL2Features.push(new OpenLayers.Feature.Vector(geomToDraw));
                        }
                    }

                    if (OL2Features) {
                        this._drawLayer.addFeatures(OL2Features);
                        this._drawLayer.redraw(true);
                    }
                }
            };
        })(this);

        reader.readAsText(file);
    }
}
