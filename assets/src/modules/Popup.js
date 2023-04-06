import { mainLizmap } from '../modules/Globals.js';
import WMS from '../modules/WMS.js';

export default class Popup {

    constructor() {
        mainLizmap.map.on('singleclick', evt => {
            const layers = lizMap.map.getControlsByClass('OpenLayers.Control.WMSGetFeatureInfo')[0].findLayers();
            if(!layers.length){
                return;
            }

            const layersWMS = layers.map(layer => layer.params.LAYERS).join();

            const wms = new WMS();

            const [width, height] = lizMap.mainLizmap.map.getSize();
            const [pixelI, pixelJ] = evt.pixel;

            const wmsParams = {
              QUERY_LAYERS: layersWMS,
              LAYERS: layersWMS,
              CRS: mainLizmap.projection,
              BBOX: mainLizmap.map.getView().calculateExtent(),
              FEATURE_COUNT: 10,
              WIDTH: width,
              HEIGHT: height,
              I: pixelI,
              J: pixelJ,
            };

            document.querySelector('body').style.cursor = 'wait'

            wms.getFeatureInfo(wmsParams).then(response => {
                mainLizmap._lizmap3.displayGetFeatureInfo(response);
            }).finally(() => {
                document.querySelector('body').style.cursor = 'auto';
            });
        });
    }
}