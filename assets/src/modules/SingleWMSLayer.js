import { mainLizmap } from './Globals.js'
import map from './map.js'
import { MapLayerLoadStatus, MapLayerState } from '../modules/state/MapLayer.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer.js';
import TileWMS from 'ol/source/TileWMS.js';
import { BaseLayerState } from './state/BaseLayer.js';
import { ValidationError } from './Errors.js';

/**
 * Class for manage the load/display selected layers as a single OpenLayers ImageWMS layer
 * @class
 */
export default class SingleWMSLayer {
    /**
     * Initialize the ImageWMS layer
     * @param {map} mainMapInstance the main map instance
     */
    //constructor(singleWMSLayerList) {
    constructor(mainMapInstance) {
        if (!mainLizmap.state.map.singleWMSLayer || !mainMapInstance || !(mainMapInstance instanceof map) || mainMapInstance.statesSingleWMSLayers.size == 0) {
            throw new ValidationError('The Configuration is not valid, could not load the map as single WMS Layer');
        }

        /**
         * the map instance
         * @type {map}
         */
        this._mainMapInstance = mainMapInstance;

        /**
         * all the layers that should be inluded in the single ImageWMS. Contains layers names with their states sorted by layerOrder (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
         * @type {Map<string,MapLayerState|BaseLayerState>}
         */
        this._singleWMSLayerList = mainMapInstance.statesSingleWMSLayers;

        /**
         * list of base layers names
         * @type {string[]}
         */
        this._baseLayers = [];

        /**
         * list of all map layers names
         * @type {string[]}
         */
        this._mapLayers = [];

        /**
         * list of layers names on the current single layer displayed on map
         * @type {string[]}
         */
        this._layersName = [];
        /**
         * list of layers wms names on the current single layer displayed on map
         * @type {string[]}
         */
        this._layersWmsName = [];

        /**
         * list of layers styles on the current single layer displayed on map
         * @type {string[]}
         */
        this._layerStyles = [];

        /**
         * list of selection token parameter on the current single layer displayed on map
         * @type {string[]}
         */
        this._selectionTokens = [];

        /**
         * list of filter token parameter on the current single layer displayed on map
         * @type {string[]}
         */
        this._filterTokens = [];

        /**
         * list of legendOn parameter on the current single layer displayed on map
         * @type {string[]}
         */
        this._legendOn = [];

        /**
         * list of legendOff parameter on the current single layer displayed on map
         * @type {string[]}
         */
        this._legendOff = [];

        /**
         * the single WMS layer instance
         * @type {?ImageLayer<ImageWMS>}
         */
        this._layer = null;

        /**
         * timeout function to manage the image layer reload
         * @type {?Function}
         */
        this._timeout = null

        /**
         * the WMS Ratio.
         * @type {number}
         */
        this._WMSRatio = mainMapInstance._WMSRatio;

        /**
         * the image format
         * @type {string}
         * @todo could the format be readed from project config too?
         */
        this._format = "image/png";

        /**
         * minimun map scale
         * @type {number}
         */
        this._minScale = 1;

        /**
         * maximum map scale
         * @type {number}
         */
        this._maxScale = 1000000000000;

        /**
         * meters per units
         * @type {number}
         */
        this._metersPerUnit = mainMapInstance.getView().getProjection().getMetersPerUnit();

        /**
         * ordered layers
         * @type {string[]}
         */
        this._orderedLayers = [];

        // construct base and map layers array
        this._singleWMSLayerList.forEach((m,k) => {
            if (m instanceof BaseLayerState) {
                this._baseLayers.push(k);
            } else if (m instanceof MapLayerState){
                this._mapLayers.push(k);
            }
        });

        this._orderedLayers = this._baseLayers.concat(this._mapLayers);
        // initialize single Image layer
        this.initializeLayer();

        // register listener for map layers
        mainLizmap.state.rootMapGroup.addListener(
            evt => {
                if (this._mapLayers.includes(evt.name)) {
                    // the layer is included in the single WMS request

                    // wait a bit in order to reduce the amount of requests
                    // e.g. when user turn on/off layers quickly
                    clearTimeout(this._timeout);
                    this._timeout = setTimeout(()=>{
                        this.updateMap();
                    },600)
                }
            },
            ['layer.visibility.changed','group.visibility.changed','layer.symbol.checked.changed', 'layer.style.changed', 'layer.selection.token.changed', 'layer.filter.token.changed']
        );

        // register listener for base layers
        mainLizmap.state.baseLayers.addListener(
            () => {
                this.updateMap();
            },
            ['baselayers.selection.changed']
        );

    }
    /**
     * Get the single WMS layer instance
     * @type {ImageLayer<ImageWMS>}
     */
    get layer(){
        return this._layer;
    }
    /**
     * creates the layer instance and get the startup single image
     * @memberof SingleWMSLayer
     */
    initializeLayer(){
        let minResolution =  undefined; //Utils.getResolutionFromScale(this._minScale, this._metersPerUnit);
        let maxResolution =  undefined; //Utils.getResolutionFromScale(this._maxScale, this._metersPerUnit);

        if(this._mainMapInstance.useTileWms){
            this._layer = new TileLayer({
                // extent: extent,
                minResolution: minResolution,
                maxResolution: maxResolution,
                source: new TileWMS({
                    url: mainLizmap.serviceURL,
                    serverType: 'qgis',
                    tileGrid: this._mainMapInstance.customTileGrid,
                    params: {
                        LAYERS: null,
                        FORMAT: this._format,
                        STYLES: null,
                        DPI: 96,
                        TILED: 'true'
                    },
                    wrapX: false, // do not reused across the 180° meridian.
                    hidpi: this._mainMapInstance.hidpi, // pixelRatio is used in useTileWms and customTileGrid definition
                })
            });
        } else {
            this._layer = new ImageLayer({
                minResolution: minResolution,
                maxResolution: maxResolution,
                source: new ImageWMS({
                    url: mainLizmap.serviceURL,
                    serverType: 'qgis',
                    ratio: this._WMSRatio,
                    hidpi: this._mainMapInstance.hidpi,
                    params: {
                        LAYERS: null,
                        FORMAT: this._format,
                        STYLES: null,
                        DPI: 96
                    }
                })
            });
            // Force no cache w/ Firefox
            if(navigator.userAgent.includes("Firefox")){
                this._layer.getSource().setImageLoadFunction((image, src) => {
                    (image.getImage()).src = src + '&ts=' + Date.now();
                });
            }
        }

        this._layer.setVisible(false);

        this._layer.setProperties({
            name: "singleWMSLayer"
        });

        // put the layer on top of the base layers
        this._layer.setZIndex(0);

        // manage the spinners
        this._layer.getSource().on('imageloadstart', () => {
            for (const name of this._layersName) {
                //add spinners on visible layers
                const mapLayer = mainLizmap.state.rootMapGroup.getMapLayerByName(name);
                mapLayer.loadStatus = MapLayerLoadStatus.Loading;
            }

        });
        this._layer.getSource().on('imageloadend', () => {
            //remove spinners
            for (const name of this._mapLayers) {
                const mapLayer = mainLizmap.state.rootMapGroup.getMapLayerByName(name);
                mapLayer.loadStatus = MapLayerLoadStatus.Ready;
            }
        });

        this._layer.getSource().on('imageloaderror', () => {
            for (const name of this._mapLayers) {
                const mapLayer = mainLizmap.state.rootMapGroup.getMapLayerByName(name);
                mapLayer.loadStatus = MapLayerLoadStatus.Error;
            }
        });

        // get the first image to display
        this.updateMap();
    }

    /**
     * update layer content
     * @memberof SingleWMSLayer
     */
    updateMap(){

        this.prepareWMSParams()

        const wmsParams = this._layer.getSource().getParams();
        let param = {
            LAYERS: this._layersWmsName.join(","),
            FORMAT: this._format,
            STYLES: this._layerStyles.join(","),
            DPI: 96
        }
        if (this._selectionTokens.join("").split("").length > 0)
            param["SELECTIONTOKEN"] = this._selectionTokens.join(";");
        if (this._filterTokens.join("").split("").length > 0)
            param["FILTERTOKEN"] = this._filterTokens.join(";");
        if  (this._legendOn.join("").split("").length > 0)
            param["LEGEND_ON"] = this._legendOn.join(";");
        if  (this._legendOff.join("").split("").length > 0)
            param["LEGEND_OFF"] = this._legendOff.join(";");

        // updateParams merges the object, need to manually remove object keys
        // that aren't in the current param object
        for (const key of Object.keys(wmsParams)) {
            if(!Object.hasOwn(param, key)){
                delete wmsParams[key];
            }
        }
        Object.assign(wmsParams, param);

        // update the map
        if (this._layersWmsName.length == 0) {
            // don't want to perform WMS request if the layer list is empty
            this._layer.setVisible(false)
        } else {
            this._layer.getSource().updateParams(wmsParams);
            this._layer.setVisible(true)
        }
    }
    /**
     * update class properties to construct the wms parameters used to get the single image
     * @memberof SingleWMSLayer
     */
    prepareWMSParams(){

        const baseLayersState = mainLizmap.state.baseLayers;
        this._layersName = [];
        this._layersWmsName = [];
        this._layerStyles = [];
        this._selectionTokens =[];
        this._filterTokens = [];
        this._legendOn = [];
        this._legendOff = [];

        this._orderedLayers.forEach((layerName) => {
            //since _orderedLayers property respect the layerOrder, if there is a baselayer in the list, then it will be put
            //at the bottom of the image
            const currentLayerState = this._singleWMSLayerList.get(layerName);
            // detect baseLayer, if any
            if (currentLayerState instanceof BaseLayerState) {
                if(this._baseLayers.includes(baseLayersState.selectedBaseLayerName)){
                    // get item state
                    const selectedBaseLayerState = baseLayersState.selectedBaseLayer.itemState;
                    this._layersWmsName.push(selectedBaseLayerState.wmsName);
                    this._layerStyles.push(selectedBaseLayerState.wmsSelectedStyleName || "");
                }
            } else if (currentLayerState instanceof MapLayerState){
                // get item visibility
                if(currentLayerState.visibility) {
                    this._layersName.push(currentLayerState.name);
                    this._layersWmsName.push(currentLayerState.wmsName);
                    this._layerStyles.push(currentLayerState.wmsSelectedStyleName || "");
                    const wmsParam = currentLayerState.wmsParameters;
                    if (wmsParam){
                        if(wmsParam.SELECTIONTOKEN)
                            this._selectionTokens.push(wmsParam.SELECTIONTOKEN);
                        if(wmsParam.FILTERTOKEN)
                            this._filterTokens.push(wmsParam.FILTERTOKEN);
                        if(wmsParam.LEGEND_ON)
                            this._legendOn.push(wmsParam.LEGEND_ON);
                        if(wmsParam.LEGEND_OFF)
                            this._legendOff.push(wmsParam.LEGEND_OFF);
                    }
                }
            }
        })
    }
}
