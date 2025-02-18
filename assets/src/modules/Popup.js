/**
 * @module modules/Popup.js
 * @name Popup
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */


import Overlay from 'ol/Overlay.js';
import WMS from '../modules/WMS.js';
import { Utils } from './Utils.js';

/**
 * @class
 * @name Popup
 */
export default class Popup {

    /**
     * Create a popup instance
     * @param {Config} initialConfig - The lizmap initial config instance
     * @param {Layers}  lizmapState   - The lizmap user interface state
     * @param {Map}    map           - OpenLayers map
     * @param {Digitizing} digitizing - The Lizmap digitizing instance
     */
    constructor(initialConfig, lizmapState, map, digitizing) {

        this._initialConfig = initialConfig;
        this._lizmapState = lizmapState;
        this._map = map;
        this._digitizing = digitizing;

        this._pointTolerance = initialConfig.options?.pointTolerance || 25;
        this._lineTolerance = initialConfig.options?.lineTolerance || 10;
        this._polygonTolerance = initialConfig.options?.polygonTolerance || 5;

        // Allow toggling of active state
        this.active = true;

        // OL2
        OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
            defaultHandlerOptions: {
                'single': true,
                'double': false,
                'pixelTolerance': 10,
                'stopSingle': false,
                'stopDouble': false
            },
            initialize: function () {
                this.handlerOptions = OpenLayers.Util.extend(
                    {}, this.defaultHandlerOptions
                );
                OpenLayers.Control.prototype.initialize.apply(
                    this, arguments
                );
                this.handler = new OpenLayers.Handler.Click(
                    this, {
                        'click': this.trigger
                    }, this.handlerOptions
                );
            },
            trigger: evt => {
                this.handleClickOnMap(evt);
            }
        });

        var click = new OpenLayers.Control.Click();
        lizMap.map.addControl(click);
        click.activate();

        // OL8
        /**
         * Create an overlay to anchor the popup to the map.
         * @returns {boolean} False
         */
        document.getElementById('liz_layer_popup_closer').onclick = () => {
            this._overlay.setPosition(undefined);
            this._map.clearHighlightFeatures();
            return false;
        };
        this._overlay = new Overlay({
            element: document.getElementById('liz_layer_popup'),
            autoPan: {
                animation: {
                    duration: 250,
                },
            },
        });

        this._map.addOverlay(this._overlay);
        this._map.on('singleclick', evt => this.handleClickOnMap(evt));
    }

    get mapPopup() {
        return this._overlay;
    }

    handleClickOnMap(evt) {
        const pointTolerance = this._pointTolerance;
        const lineTolerance = this._lineTolerance;
        const polygonTolerance = this._polygonTolerance;

        if (!this.active || lizMap.editionPending || this._digitizing.toolSelected != 'deactivate' || this._digitizing.isEdited || this._digitizing.isErasing) {
            return;
        }

        const xCoord = evt?.xy?.x || evt?.pixel?.[0];
        const yCoord = evt?.xy?.y || evt?.pixel?.[1];

        // Order popups following layers order
        let candidateLayers = this._lizmapState.rootMapGroup.findMapLayers().toSorted((a, b) => b.layerOrder - a.layerOrder);

        // Only request visible layers
        candidateLayers = candidateLayers.filter(layer => layer.visibility);

        // Only request layers with 'popup' checked in plugin
        // Or some edition capabilities
        candidateLayers = candidateLayers.filter(layer => {
            const layerCfg = layer.layerConfig;

            let editionLayerCapabilities;

            if (this._initialConfig?.editionLayers?.layerNames.includes(layer.name)) {
                editionLayerCapabilities = this._initialConfig?.editionLayers?.getLayerConfigByLayerName(layer.name)?.capabilities;
            }
            return layerCfg.popup || editionLayerCapabilities?.modifyAttribute || editionLayerCapabilities?.modifyGeometry || editionLayerCapabilities?.deleteFeature;
        });

        if(!candidateLayers.length){
            return;
        }

        //const layersWMS = candidateLayers.map(layer => layer.wmsName).join();
        //const layersStyles = candidateLayers.map(layer => layer.wmsSelectedStyleName || "").join()
        const layersNames = [];
        const layersStyles = [];
        const filterTokens = [];
        const legendOn = [];
        const legendOff = [];
        let popupMaxFeatures = 10;
        for (const layer of candidateLayers) {
            const layerWmsParams = layer.wmsParameters;
            // Add layer to the list of layers
            layersNames.push(layerWmsParams['LAYERS']);
            // Optionally add layer style if needed (same order as layers )
            layersStyles.push(layerWmsParams['STYLES']);
            if ('FILTERTOKEN' in layerWmsParams) {
                filterTokens.push(layerWmsParams['FILTERTOKEN']);
            }
            if ('LEGEND_ON' in layerWmsParams) {
                legendOn.push(layerWmsParams['LEGEND_ON']);
            }
            if ('LEGEND_OFF' in layerWmsParams) {
                legendOff.push(layerWmsParams['LEGEND_OFF']);
            }
            if (layer.layerConfig.popupMaxFeatures > popupMaxFeatures) {
                popupMaxFeatures = layer.layerConfig.popupMaxFeatures;
            }
        }

        const wms = new WMS();

        const [width, height] = this._map.getSize();

        let bbox = this._map.getView().calculateExtent();

        if (this._map.getView().getProjection().getAxisOrientation().substring(0, 2) === 'ne') {
            bbox = [bbox[1], bbox[0], bbox[3], bbox[2]];
        }

        const wmsParams = {
            QUERY_LAYERS: layersNames.join(','),
            LAYERS: layersNames.join(','),
            STYLE: layersStyles.join(','),
            CRS: this._map.getView().getProjection().getCode(),
            BBOX: bbox,
            WIDTH: width,
            HEIGHT: height,
            FEATURE_COUNT: popupMaxFeatures,
            I: Math.round(xCoord),
            J: Math.round(yCoord),
            FI_POINT_TOLERANCE: pointTolerance,
            FI_LINE_TOLERANCE: lineTolerance,
            FI_POLYGON_TOLERANCE: polygonTolerance
        };

        if (filterTokens.length) {
            wmsParams.FILTERTOKEN = filterTokens.join(';');
        }
        if (legendOn.length) {
            wmsParams.LEGEND_ON = legendOn.join(';');
        }
        if (legendOff.length) {
            wmsParams.LEGEND_OFF = legendOff.join(';');
        }

        document.getElementById('newOlMap').style.cursor = 'wait';

        wms.getFeatureInfo(wmsParams).then(response => {
            lizMap.displayGetFeatureInfo(Utils.sanitizeGFIContent(response), { x: xCoord, y: yCoord }, evt?.coordinate);
        }).finally(() => {
            document.getElementById('newOlMap').style.cursor = 'auto';
        });
    }
}
