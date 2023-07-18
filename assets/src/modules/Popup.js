import { mainLizmap } from '../modules/Globals.js';
import WMS from '../modules/WMS.js';

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

                let candidateLayers = mainLizmap.state.rootMapGroup.findMapLayers();

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
    
                const layersWMS = candidateLayers.map(layer => layer.wmsName).join();
    
                const wms = new WMS();
    
                const [width, height] = lizMap.mainLizmap.map.getSize();

                let bbox = mainLizmap.map.getView().calculateExtent();

                if (mainLizmap.map.getView().getProjection().getAxisOrientation().substring(0, 2) === 'ne') {
                    bbox = [bbox[1], bbox[0], bbox[3], bbox[2]];
                }

                const wmsParams = {
                    QUERY_LAYERS: layersWMS,
                    LAYERS: layersWMS,
                    CRS: mainLizmap.projection,
                    BBOX: bbox,
                    FEATURE_COUNT: 10,
                    WIDTH: width,
                    HEIGHT: height,
                    I: evt.xy.x,
                    J: evt.xy.y,
                    FI_POINT_TOLERANCE: this._pointTolerance,
                    FI_LINE_TOLERANCE: this._lineTolerance,
                    FI_POLYGON_TOLERANCE: this._polygonTolerance
                };

                const filterTokens = [];
                candidateLayers.forEach(layer => {
                    let filterToken = layer.wmsParameters?.FILTERTOKEN;
                    if (filterToken) {
                        filterTokens.push(filterToken);
                    }
                });

                if (filterTokens.length) {
                    wmsParams['FILTERTOKEN'] = filterTokens.join(';');
                }
    
                document.querySelector('body').style.cursor = 'wait'
    
                wms.getFeatureInfo(wmsParams).then(response => {
                    lizMap.displayGetFeatureInfo(response, evt.xy);
                }).finally(() => {
                    document.querySelector('body').style.cursor = 'auto';
                });
            }
        });
        
        var click = new OpenLayers.Control.Click();
        lizMap.map.addControl(click);
        click.activate();
    }
}