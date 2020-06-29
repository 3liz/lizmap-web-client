import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader.js';
import GeoJSONWriter from 'jsts/org/locationtech/jts/io/GeoJSONWriter.js';
import BufferOp from 'jsts/org/locationtech/jts/operation/buffer/BufferOp.js';

export default class Digitizing {

    constructor() {

        this._tools = ['deactivate', 'point', 'line', 'polygon', 'box', 'circle', 'freehand'];
        this._toolSelected = this._tools[0];

        this._drawColor = '#ff0000';
        this._bufferValue = 0;

        this._featureDrawn = null;
        this._featureDrawnVisibility = true;

        // Draw tools style
        const drawStyle = new OpenLayers.Style({
            pointRadius: 7,
            fillColor: this._drawColor,
            fillOpacity: 0.2,
            strokeColor: this._drawColor,
            strokeOpacity: 1,
            strokeWidth: 2
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

        this._bufferLayer = new OpenLayers.Layer.Vector(
            'drawBufferLayer', {
                styleMap: new OpenLayers.StyleMap({
                    fillColor: 'blue',
                    fillOpacity: 0.1,
                    strokeColor: 'blue',
                    strokeOpacity: 1,
                    strokeWidth: 1,
                    strokeDashstyle: 'longdash'
                })
            }
        );

        mainLizmap.lizmap3.map.addLayers([this._drawLayer, this._bufferLayer]);

        const onDrawFeatureAdded = (feature) => {
            /**
             * @todo Ne gère que si il ya a seulement 1 géométrie
             */
            if (feature.layer) {
                if (feature.layer.features.length > 1) {
                    feature.layer.destroyFeatures(feature.layer.features.shift());
                }
            }

            this._featureDrawn = feature;

            // Handle buffer if any
            this._bufferLayer.destroyFeatures();
            if (this._bufferValue > 0) {
                const geoJSONParser = new OpenLayers.Format.GeoJSON();
                const drawGeoJSON = geoJSONParser.write(feature.geometry);
                const jstsGeoJSONReader = new GeoJSONReader();
                const jstsGeoJSONWriter = new GeoJSONWriter();
                const jstsGeom = jstsGeoJSONReader.read(drawGeoJSON);
                const jstsbBufferedGeom = BufferOp.bufferOp(jstsGeom, this._bufferValue);
                const bufferedDraw = geoJSONParser.read(jstsGeoJSONWriter.write(jstsbBufferedGeom));

                // Draw buffer
                this._bufferLayer.addFeatures(bufferedDraw);
                this._bufferLayer.redraw(true);

                this._featureDrawn = bufferedDraw[0];
            }

            mainEventDispatcher.dispatch('digitizing.featureDrawn');

            this.toolSelected = 'deactivate';
        };

        /**
         * Point
         * @type @new;OpenLayers.Control.DrawFeature
         */
        this._drawPointLayerCtrl = new OpenLayers.Control.DrawFeature(
            this._drawLayer,
            OpenLayers.Handler.Point,
            {
                'featureAdded': onDrawFeatureAdded,
                styleMap: drawStyleMap,
                eventListeners: {
                    // getFeatureInfo and point draw controls are mutually exclusive
                    'activate': function () {
                        if ('featureInfo' in lizMap.controls && lizMap.controls.featureInfo && lizMap.controls.featureInfo.active) {
                            lizMap.controls.featureInfo.deactivate();
                        }
                    },
                    'deactivate': function () {
                        if ('featureInfo' in lizMap.controls && lizMap.controls.featureInfo && !lizMap.controls.featureInfo.active) {
                            lizMap.controls.featureInfo.activate();
                        }
                    }
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
                'featureAdded': onDrawFeatureAdded,
                styleMap: drawStyleMap,
                eventListeners: {
                    // getFeatureInfo and point draw controls are mutually exclusive
                    'activate': function () {
                        if ('featureInfo' in lizMap.controls && lizMap.controls.featureInfo && lizMap.controls.featureInfo.active) {
                            lizMap.controls.featureInfo.deactivate();
                        }
                    },
                    'deactivate': function () {
                        if ('featureInfo' in lizMap.controls && lizMap.controls.featureInfo && !lizMap.controls.featureInfo.active) {
                            lizMap.controls.featureInfo.activate();
                        }
                    }
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
                'featureAdded': onDrawFeatureAdded,
                styleMap: drawStyleMap,
                eventListeners: {
                    // getFeatureInfo and polygon draw controls are mutually exclusive
                    'activate': function () {
                        if ('featureInfo' in lizMap.controls && lizMap.controls.featureInfo && lizMap.controls.featureInfo.active) {
                            lizMap.controls.featureInfo.deactivate();
                        }
                    },
                    'deactivate': function () {
                        if ('featureInfo' in lizMap.controls && lizMap.controls.featureInfo && !lizMap.controls.featureInfo.active) {
                            lizMap.controls.featureInfo.activate();
                        }
                    }
                }
            }
        );

        /**
         * Box
         * @type @new;OpenLayers.Control.DrawFeature
         */
        this._drawBoxLayerCtrl = new OpenLayers.Control.DrawFeature(this._drawLayer,
            OpenLayers.Handler.RegularPolygon,
            { handlerOptions: { sides: 4, irregular: true }, 'featureAdded': onDrawFeatureAdded }
        );

        /**
         * Circle
         * @type @new;OpenLayers.Control.DrawFeature
         */
        this._drawCircleLayerCtrl = new OpenLayers.Control.DrawFeature(this._drawLayer,
            OpenLayers.Handler.RegularPolygon,
            { handlerOptions: { sides: 40 }, 'featureAdded': onDrawFeatureAdded }
        );

        /**
         * Freehand
         * @type @new;OpenLayers.Control.DrawFeature
         */
        this._drawFreehandLayerCtrl = new OpenLayers.Control.DrawFeature(this._drawLayer,
            OpenLayers.Handler.Polygon, {
            'featureAdded': onDrawFeatureAdded, styleMap: drawStyleMap,
            handlerOptions: { freehand: true }
        });

        this._drawControls = [this._drawPointLayerCtrl, this._drawLineLayerCtrl, this._drawPolygonLayerCtrl, this._drawBoxLayerCtrl, this._drawCircleLayerCtrl, this._drawFreehandLayerCtrl];

        // Add controls to map
        mainLizmap.lizmap3.map.addControls(this._drawControls);

        mainLizmap.lizmap3.events.on({
            'minidockopened': (mdoEvt) => {
                if (mdoEvt.id == 'selectiontool') {
                    this.toolSelected = 'deactivate';
                    this._drawLayer.destroyFeatures();
                    this._bufferLayer.destroyFeatures();
                }
            },
            'minidockclosed': (mdcEvt) => {
                if (mdcEvt.id == 'selectiontool') {
                    this.toolSelected = 'deactivate';
                    this._drawLayer.destroyFeatures();
                    this._bufferLayer.destroyFeatures();
                }
            }
        });
    }

    get drawLayer(){
        return this._drawLayer;
    }

    get bufferLayer() {
        return this._bufferLayer;
    }

    get toolSelected() {
        return this._toolSelected;
    }

    set toolSelected(tool) {
        if (this._tools.includes(tool)) {
            // Disable all tools
            for (const drawControl of this._drawControls) {
                drawControl.deactivate();
            }

            // If current selected tool is selected again => unactivate
            if(this._toolSelected === tool){
                this._toolSelected = this._tools[0];
            }else{
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

            mainEventDispatcher.dispatch('digitizing.toolSelected');
        }
    }

    get drawColor(){
        return this._drawColor;
    }

    set drawColor(color){
        this._drawColor = color;

        // Update default and temporary draw styles
        const drawStyles = this._drawLayer.styleMap.styles;

        drawStyles.default.defaultStyle.fillColor = color;
        drawStyles.default.defaultStyle.strokeColor = color;

        drawStyles.temporary.defaultStyle.fillColor = color;
        drawStyles.temporary.defaultStyle.strokeColor = color;
    }

    get bufferValue(){
        return this._bufferValue;
    }

    set bufferValue(bufferValue){
        this._bufferValue = isNaN(bufferValue) ? 0 : bufferValue;

        mainEventDispatcher.dispatch('digitizing.bufferValue');
    }

    get featureDrawn(){
        return this._featureDrawn;
    }

    toggleFeatureDrawnVisibility() {
        this._featureDrawnVisibility = !this._featureDrawnVisibility;

        this._drawLayer.setVisibility(this._featureDrawnVisibility);
        this._bufferLayer.setVisibility(this._featureDrawnVisibility);

        mainEventDispatcher.dispatch('digitizing.featureDrawnVisibility');
    }
}
