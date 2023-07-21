import EventDispatcher from './../utils/EventDispatcher.js';
import { MapState } from './state/Map.js';
import { BaseLayersState } from './state/BaseLayer.js';
import { LayersAndGroupsCollection } from './state/Layer.js';
import { MapGroupState } from './state/MapLayer.js';
import { LayerTreeGroupState } from './state/LayerTree.js';

export class State extends EventDispatcher {
    /**
     * @param {Config} initialCfg - the lizmap initial config instance
     */
    constructor(initialCfg) {
        super()
        this._initialConfig = initialCfg;
        this._map = new MapState();
        this._map.addListener(this.dispatch.bind(this), 'map.state.changed');
        this._baseLayers = null;
        this._collection = null;
        this._rootMapGroup = null;
        this._layerTree = null;
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
     * The base layers state
     *
     * @type {BaseLayersState}
     **/
    get baseLayers() {
        if (this._baseLayers == null) {
            this._baseLayers = new BaseLayersState(this._initialConfig.baseLayers, this.layersAndGroupsCollection);
            // Dispatch events from base layers
            this._baseLayers.addListener(this.dispatch.bind(this), 'baselayers.selection.changed');
        }
        return this._baseLayers;
    }

    /**
     * The layers and groups collection
     *
     * @type {LayersAndGroupsCollection}
     **/
    get layersAndGroupsCollection() {
        if (this._collection == null) {
            this._collection = new LayersAndGroupsCollection(this._initialConfig.layerTree, this._initialConfig.layersOrder);
            // Dispatch events from groups and layers
            this._collection.addListener(this.dispatch.bind(this), 'group.visibility.changed');
            this._collection.addListener(this.dispatch.bind(this), 'group.opacity.changed');
            this._collection.addListener(this.dispatch.bind(this), 'layer.visibility.changed');
            this._collection.addListener(this.dispatch.bind(this), 'layer.opacity.changed');
            this._collection.addListener(this.dispatch.bind(this), 'layer.style.changed');
            this._collection.addListener(this.dispatch.bind(this), 'layer.symbol.checked.changed');
            this._collection.addListener(this.dispatch.bind(this), 'layer.selection.changed');
            this._collection.addListener(this.dispatch.bind(this), 'layer.selection.token.changed');
            this._collection.addListener(this.dispatch.bind(this), 'layer.filter.changed');
            this._collection.addListener(this.dispatch.bind(this), 'layer.filter.token.changed');
        }
        return this._collection;
    }

    /**
     * Root map group
     *
     * @type {MapGroupState}
     **/
    get rootMapGroup() {
        if (this._rootMapGroup == null) {
            this._rootMapGroup = new MapGroupState(this.layersAndGroupsCollection.root);
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
