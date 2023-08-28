import WMS from '../modules/WMS.js';

export default class Popup {

    /**
     * Create a popup instance
     *
     * @param {Config} initialConfig - The lizmap initial config instance
     * @param {State}  lizmapState   - The lizmap user interface state
     * @param {Map}    map           - OpenLayers map
     */
    constructor(initialConfig, lizmapState, map) {

        this._pointTolerance = initialConfig.options.pointTolerance;
        this._lineTolerance = initialConfig.options.lineTolerance;
        this._polygonTolerance = initialConfig.options.polygonTolerance;

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

                let candidateLayers = lizmapState.rootMapGroup.findMapLayers();

                // Only request visible layers
                candidateLayers = candidateLayers.filter(layer => layer.visibility);

                // Only request layers with 'popup' checked in plugin
                // Or some edition capabilities
                candidateLayers = candidateLayers.filter(layer => {
                    const layerCfg = layer.layerConfig;

                    let editionLayerCapabilities;

                    if (initialConfig.editionLayers?.layerNames.includes(layer.name)) {
                        editionLayerCapabilities = initialConfig.editionLayers?.getLayerConfigByLayerName(layer.name)?.capabilities;
                    }
                    return layerCfg.popup || editionLayerCapabilities?.modifyAttribute || editionLayerCapabilities?.modifyGeometry || editionLayerCapabilities?.deleteFeature;
                });

                if(!candidateLayers.length){
                    return;
                }

                const layersWMS = candidateLayers.map(layer => layer.wmsName).join();

                const wms = new WMS();

                const [width, height] = map.getSize();

                let bbox = map.getView().calculateExtent();

                if (map.getView().getProjection().getAxisOrientation().substring(0, 2) === 'ne') {
                    bbox = [bbox[1], bbox[0], bbox[3], bbox[2]];
                }

                const wmsParams = {
                    QUERY_LAYERS: layersWMS,
                    LAYERS: layersWMS,
                    CRS: map.getView().getProjection().getCode(),
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
