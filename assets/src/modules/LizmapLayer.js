import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import Stamen from 'ol/source/Stamen.js';

export default class LizmapLayer {
    constructor(layerId, visible) {
        this._OLlayer;
        this._layerId = layerId;
        if (layerId === 'osmMapnik') {
            this._OLlayer = new TileLayer({
                layerId: layerId,
                visible: visible,
                source: new OSM()
            })
        } else if (layerId === 'osmStamenToner') {
            this._OLlayer = new TileLayer({
                layerId: layerId,
                visible: visible,
                source: new Stamen({
                    layer: 'toner'
                })
            });
        }
    }

    get OLlayer() {
        return this._OLlayer;
    }

    get layerId() {
        return this._layerId;
    }

    set layerVisible(visible) {
        this._OLlayer.setVisible(visible);
    }
}