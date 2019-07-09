import LizmapLayer from './LizmapLayer.js';
import LayerGroup from 'ol/layer/Group';

// attribut selected
export default class LizmapLayerGroup {
    constructor(opt_options) {

        this._mutuallyExclusive = opt_options.mutuallyExclusive;

        this._lizmapLayers = [];

        for (let [layerId, config] of opt_options.layersList) {
            const lizmapLayer = new LizmapLayer(layerId, config.visible);

            this._lizmapLayers.push(lizmapLayer);
        }

        this._OLlayerGroup = new LayerGroup({
            layers: this.OLLayers()
        });
    }

    // Make class iterable
    [Symbol.iterator]() {
        let index = -1;

        return {
            next: () => ({ value: this._lizmapLayers[++index], done: !(index in this._lizmapLayers) })
        };
    };

    get OLlayerGroup() {
        return this._OLlayerGroup;
    }

    set layerVisible(layerId) {
        for (let i = 0; i < this._lizmapLayers.length; i++) {
            // Set visibility to false when mutually exclusive
            if (this._mutuallyExclusive) {
                this._lizmapLayers[i].layerVisible = false;
            }
            if (this._lizmapLayers[i].layerId === layerId) {
                this._lizmapLayers[i].layerVisible = true;
            }
        }
    }

    // TODO : utiliser map()
    OLLayers() {
        let OLLayers = [];

        for (let i = 0; i < this._lizmapLayers.length; i++) {
            OLLayers.push(this._lizmapLayers[i].OLlayer);
        }

        return OLLayers;
    }
}