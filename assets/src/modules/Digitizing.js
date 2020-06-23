import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader.js';
import GeoJSONWriter from 'jsts/org/locationtech/jts/io/GeoJSONWriter.js';
import BufferOp from 'jsts/org/locationtech/jts/operation/buffer/BufferOp.js';

export default class Digitizing {

    constructor() {

        this._tools = ['deactivate', 'point', 'line', 'polygon', 'box', 'circle', 'freehand'];
        this._toolSelected = this._tools[0];

        this._bufferValue = 0;

        this._featureDrawn = null;
        this._featureDrawnVisibility = true;

        // Draw and selection tools style
        const drawStyle = new OpenLayers.Style({
            pointRadius: 7,
            fillColor: '#94EF05',
            fillOpacity: 0.2,
            strokeColor: 'yellow',
            strokeOpacity: 1,
            strokeWidth: 2
        });

        const drawStyleTemp = new OpenLayers.Style({
            pointRadius: 7,
            fillColor: 'orange',
            fillOpacity: 0.3,
            strokeColor: 'blue',
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

        const queryLayer = new OpenLayers.Layer.Vector(
            'selectionQueryLayer', {
                styleMap: drawStyleMap
            }
        );

        const bufferLayer = new OpenLayers.Layer.Vector(
            'selectionBufferLayer', {
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

        mainLizmap.lizmap3.map.addLayers([queryLayer, bufferLayer]);
        mainLizmap.lizmap3.layers['selectionQueryLayer'] = queryLayer;
        mainLizmap.lizmap3.layers['selectionBufferLayer'] = bufferLayer;

        mainLizmap.lizmap3.controls['selectiontool'] = {};

        const onQueryFeatureAdded = (feature) => {
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
            mainLizmap.lizmap3.layers['selectionBufferLayer'].destroyFeatures();
            if (this._bufferValue > 0) {
                const geoJSONParser = new OpenLayers.Format.GeoJSON();
                const selectionGeoJSON = geoJSONParser.write(feature.geometry);
                const jstsGeoJSONReader = new GeoJSONReader();
                const jstsGeoJSONWriter = new GeoJSONWriter();
                const jstsGeom = jstsGeoJSONReader.read(selectionGeoJSON);
                const jstsbBufferedGeom = BufferOp.bufferOp(jstsGeom, this._bufferValue);
                const bufferedSelection = geoJSONParser.read(jstsGeoJSONWriter.write(jstsbBufferedGeom));

                // Draw buffer
                mainLizmap.lizmap3.layers['selectionBufferLayer'].addFeatures(bufferedSelection);
                mainLizmap.lizmap3.layers['selectionBufferLayer'].redraw(true);

                this._featureDrawn = bufferedSelection[0];
            }

            mainEventDispatcher.dispatch('digitizing.featureDrawn');

            this.toolSelected = 'deactivate';
        };

        /**
         * Box
         * @type @new;OpenLayers.Control.DrawFeature
         */
        const queryBoxLayerCtrl = new OpenLayers.Control.DrawFeature(queryLayer,
            OpenLayers.Handler.RegularPolygon,
            { handlerOptions: { sides: 4, irregular: true }, 'featureAdded': onQueryFeatureAdded }
        );

        /**
         * Circle
         * @type @new;OpenLayers.Control.DrawFeature
         */
        const queryCircleLayerCtrl = new OpenLayers.Control.DrawFeature(queryLayer,
            OpenLayers.Handler.RegularPolygon,
            { handlerOptions: { sides: 40 }, 'featureAdded': onQueryFeatureAdded }
        );

        /**
         * Point
         * @type @new;OpenLayers.Control.DrawFeature
         */
        const queryPointLayerCtrl = new OpenLayers.Control.DrawFeature(
            queryLayer,
            OpenLayers.Handler.Point,
            {
                'featureAdded': onQueryFeatureAdded,
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
        const queryLineLayerCtrl = new OpenLayers.Control.DrawFeature(
            queryLayer,
            OpenLayers.Handler.Path,
            {
                'featureAdded': onQueryFeatureAdded,
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
        const queryPolygonLayerCtrl = new OpenLayers.Control.DrawFeature(
            queryLayer,
            OpenLayers.Handler.Polygon,
            {
                'featureAdded': onQueryFeatureAdded,
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
         * Freehand
         * @type @new;OpenLayers.Control.DrawFeature
         */
        const queryFreehandLayerCtrl = new OpenLayers.Control.DrawFeature(queryLayer,
            OpenLayers.Handler.Polygon, {
            'featureAdded': onQueryFeatureAdded, styleMap: drawStyleMap,
            handlerOptions: { freehand: true }
        }
        );

        // TODO : keep reference to controls in this class
        mainLizmap.lizmap3.map.addControls([queryPointLayerCtrl, queryLineLayerCtrl, queryPolygonLayerCtrl, queryBoxLayerCtrl, queryCircleLayerCtrl, queryFreehandLayerCtrl]);

        mainLizmap.lizmap3.controls['selectiontool']['queryPointLayerCtrl'] = queryPointLayerCtrl;
        mainLizmap.lizmap3.controls['selectiontool']['queryLineLayerCtrl'] = queryLineLayerCtrl;
        mainLizmap.lizmap3.controls['selectiontool']['queryPolygonLayerCtrl'] = queryPolygonLayerCtrl;
        mainLizmap.lizmap3.controls['selectiontool']['queryBoxLayerCtrl'] = queryBoxLayerCtrl;
        mainLizmap.lizmap3.controls['selectiontool']['queryCircleLayerCtrl'] = queryCircleLayerCtrl;
        mainLizmap.lizmap3.controls['selectiontool']['queryFreehandLayerCtrl'] = queryFreehandLayerCtrl;

        mainLizmap.lizmap3.events.on({
            'minidockopened': (mdoEvt) => {
                if (mdoEvt.id == 'selectiontool') {
                    this.toolSelected = 'deactivate';
                    mainLizmap.lizmap3.layers['selectionQueryLayer'].destroyFeatures();
                    mainLizmap.lizmap3.layers['selectionBufferLayer'].destroyFeatures();
                }
            },
            'minidockclosed': (mdcEvt) => {
                if (mdcEvt.id == 'selectiontool') {
                    this.toolSelected = 'deactivate';
                    mainLizmap.lizmap3.layers['selectionQueryLayer'].destroyFeatures();
                    mainLizmap.lizmap3.layers['selectionBufferLayer'].destroyFeatures();
                }
            },
            'layerSelectionChanged': () => {
                mainEventDispatcher.dispatch('selectionTool.selectionChanged');
            },
            'layerFilteredFeaturesChanged': (lffcEvt) => {
                if ($('#mapmenu li.selectiontool').hasClass('active') &&
                    this.allFeatureTypeSelected.includes(lffcEvt.featureType)) {
                    mainEventDispatcher.dispatch('selectionTool.filteredFeaturesChanged');
                }
            }
        });
    }

    get toolSelected() {
        return this._toolSelected;
    }

    set toolSelected(tool) {
        if (this._tools.includes(tool)) {
            // Disable all tools
            for (const key in mainLizmap.lizmap3.controls.selectiontool) {
                mainLizmap.lizmap3.controls.selectiontool[key].deactivate();
            }

            // If current selected tool is selected again => unactivate
            if(this._toolSelected === tool){
                this._toolSelected = this._tools[0];
            }else{
                switch (tool) {
                    case this._tools[1]:
                        mainLizmap.lizmap3.controls.selectiontool.queryPointLayerCtrl.activate();
                        break;
                    case this._tools[2]:
                        mainLizmap.lizmap3.controls.selectiontool.queryLineLayerCtrl.activate();
                        break;
                    case this._tools[3]:
                        mainLizmap.lizmap3.controls.selectiontool.queryPolygonLayerCtrl.activate();
                        break;
                    case this._tools[4]:
                        mainLizmap.lizmap3.controls.selectiontool.queryBoxLayerCtrl.activate();
                        break;
                    case this._tools[5]:
                        mainLizmap.lizmap3.controls.selectiontool.queryCircleLayerCtrl.activate();
                        break;
                    case this._tools[6]:
                        mainLizmap.lizmap3.controls.selectiontool.queryFreehandLayerCtrl.activate();
                        break;
                }

                this._toolSelected = tool;
            }

            mainEventDispatcher.dispatch('digitizing.toolSelected');
        }
    }

    get bufferValue(){
        return this._bufferValue;
    }

    set bufferValue(bufferValue){
        this._bufferValue = bufferValue;

        mainEventDispatcher.dispatch('digitizing.bufferValue');
    }

    get featureDrawn(){
        return this._featureDrawn;
    }

    toggleFeatureDrawnVisibility() {
        this._featureDrawnVisibility = !this._featureDrawnVisibility;

        mainLizmap.lizmap3.layers['selectionQueryLayer'].setVisibility(this._featureDrawnVisibility);
        mainLizmap.lizmap3.layers['selectionBufferLayer'].setVisibility(this._featureDrawnVisibility);

        mainEventDispatcher.dispatch('digitizing.featureDrawnVisibility');
    }
}
