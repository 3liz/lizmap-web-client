import { mainEventDispatcher } from '../modules/Globals.js';
import { MapState } from './state/Map.js';
import { MapGroupState } from './state/MapLayer.js';
import { LayerTreeGroupState } from './state/LayerTree.js';

export class State {
    /**
     * @param {Config} initialCfg - the lizmap initial config instance
     */
    constructor(initialCfg) {
        this._initialConfig = initialCfg;
        this._map = new MapState();
        mainEventDispatcher.addListener(this._map.update.bind(this._map), 'map.state.changing');
    }

    /**
     * The map state
     *
     * @type {MapState}
     **/
    get map() {
        return this._map;
    }

    /**
     * Root map group
     *
     * @type {MapGroupState}
     **/
    get rootMapGroup() {
        if (this._rootMapGroup == null) {
            this._rootMapGroup = new MapGroupState(this._initialConfig.layerTree, this._initialConfig.layersOrder);
        }
        return this._rootMapGroup;
    }

    /**
     * Root tree layer group
     *
     * @type {LayerTreeGroupState}
     **/
    get layerTree() {
        if (this._layerTree == null) {
            this._layerTree = new LayerTreeGroupState(this.rootMapGroup);
        }
        return this._layerTree;
    }
}
