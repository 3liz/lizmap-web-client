import { LayerTreeGroup } from './state/LayerTree.js';

export class State {
    /**
     * @param {Config} initialCfg - the lizmap initial config instance
     */
    constructor(initialCfg) {
        this._initialConfig = initialCfg;
    }

    /**
     * Root tree layer group
     *
     * @type {LayerTreeGroup}
     **/
    get layerTree() {
        if (this._layerTree == null) {
            this._layerTree = new LayerTreeGroup(this._initialConfig.layerTree);
        }
        return this._layerTree;
    }
}
