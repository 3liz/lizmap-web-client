/**
 * @module modules/Popup.js
 * @name Popup
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */


import { mainLizmap } from '../modules/Globals.js';
import WMS from '../modules/WMS.js';
import DOMPurify from 'dompurify';

/**
 * @class
 * @name Popup
 */
export default class Popup {

    constructor() {

        this._pointTolerance = mainLizmap.config.options?.pointTolerance || 25;
        this._lineTolerance = mainLizmap.config.options?.lineTolerance || 10;
        this._polygonTolerance = mainLizmap.config.options?.polygonTolerance || 5;

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
                if(lizMap.editionPending){
                    return;
                }

                let candidateLayers = mainLizmap.state.rootMapGroup.findMapLayers().reverse();

                // Only request visible layers
                candidateLayers = candidateLayers.filter(layer => layer.visibility);

                // Only request layers with 'popup' checked in plugin
                // Or some edition capabilities
                candidateLayers = candidateLayers.filter(layer => {
                    const layerCfg = layer.layerConfig;

                    let editionLayerCapabilities;

                    if (mainLizmap.initialConfig?.editionLayers?.layerNames.includes(layer.name)) {
                        editionLayerCapabilities = mainLizmap.initialConfig?.editionLayers?.getLayerConfigByLayerName(layer.name)?.capabilities;
                    }
                    return layerCfg.popup || editionLayerCapabilities?.modifyAttribute || editionLayerCapabilities?.modifyGeometry || editionLayerCapabilities?.deleteFeature;
                });

                if(!candidateLayers.length){
                    return;
                }

                // const layersWMS = candidateLayers.map(layer => layer.wmsName).join();
                // const layersStyles = candidateLayers.map(layer => layer.wmsSelectedStyleName || "").join();
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

                const [width, height] = lizMap.mainLizmap.map.getSize();

                let bbox = mainLizmap.map.getView().calculateExtent();

                if (mainLizmap.map.getView().getProjection().getAxisOrientation().substring(0, 2) === 'ne') {
                    bbox = [bbox[1], bbox[0], bbox[3], bbox[2]];
                }

                const wmsParams = {
                    QUERY_LAYERS: layersNames.join(','),
                    LAYERS: layersNames.join(','),
                    STYLE: layersStyles.join(','),
                    CRS: mainLizmap.projection,
                    BBOX: bbox,
                    FEATURE_COUNT: popupMaxFeatures,
                    WIDTH: width,
                    HEIGHT: height,
                    I: Math.round(evt.xy.x),
                    J: Math.round(evt.xy.y),
                    FI_POINT_TOLERANCE: this._pointTolerance,
                    FI_LINE_TOLERANCE: this._lineTolerance,
                    FI_POLYGON_TOLERANCE: this._polygonTolerance
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

                document.getElementById('map').style.cursor = 'wait';

                wms.getFeatureInfo(wmsParams).then(response => {
                    lizMap.displayGetFeatureInfo(response, evt.xy);
                }).finally(() => {
                    document.getElementById('map').style.cursor = 'auto';
                });
            }
        });

        var click = new OpenLayers.Control.Click();
        lizMap.map.addControl(click);
        click.activate();
    }
}
