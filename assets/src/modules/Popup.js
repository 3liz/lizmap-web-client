/**
 * @module modules/Popup.js
 * @name Popup
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */


import { mainLizmap } from '../modules/Globals.js';
import Overlay from 'ol/Overlay.js';
import WMS from '../modules/WMS.js';
import DOMPurify from 'dompurify';

/**
 * @class
 * @name Popup
 */
export default class Popup {
    constructor() {
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
        */
        document.getElementById('liz_layer_popup_closer').onclick = () => {
            this._overlay.setPosition(undefined);
            mainLizmap.map.clearHighlightFeatures();
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

        mainLizmap.map.addOverlay(this._overlay);
        mainLizmap.map.on('singleclick', evt => this.handleClickOnMap(evt));
    }

    get mapPopup() {
        return this._overlay;
    }

    handleClickOnMap(evt) {
        const pointTolerance = mainLizmap.config.options?.pointTolerance || 25;
        const lineTolerance = mainLizmap.config.options?.lineTolerance || 10;
        const polygonTolerance = mainLizmap.config.options?.polygonTolerance || 5;

        if (lizMap.editionPending || mainLizmap.selectionTool.isActive || mainLizmap.digitizing.isActive) {
            return;
        }

        const xCoord = evt?.xy?.x || evt?.pixel?.[0];
        const yCoord = evt?.xy?.y || evt?.pixel?.[1];

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

        //const layersWMS = candidateLayers.map(layer => layer.wmsName).join();
        //const layersStyles = candidateLayers.map(layer => layer.wmsSelectedStyleName || "").join()
        const layersNames = [];
        const layersStyles = [];
        const filterTokens = [];
        const legendOn = [];
        const legendOff = [];
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
            FEATURE_COUNT: 10,
            WIDTH: width,
            HEIGHT: height,
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
            const sanitizedResponse = DOMPurify.sanitize(response, {
                CUSTOM_ELEMENT_HANDLING: {
                    tagNameCheck: /^lizmap-/,
                    attributeNameCheck: /crs|bbox|edition-restricted/,
                }
            });
            lizMap.displayGetFeatureInfo(sanitizedResponse, { x: xCoord, y: yCoord }, evt?.coordinate);
        }).finally(() => {
            document.getElementById('newOlMap').style.cursor = 'auto';
        });
    }
}
