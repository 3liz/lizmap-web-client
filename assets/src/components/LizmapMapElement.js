import 'ol/ol.css';

// OLMap and not Map to avoid collision with global object Map
import OLMap from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';

import {MainEventDispatcher} from "../modules/LizmapGlobals";
import LayerGroup from "ol/layer/Group";
import Stamen from "ol/source/Stamen";

export default class LizmapMapElement extends HTMLElement {
    constructor() {
        super();

        this._OLMap = null;
        this._OLlayerGroup = null;
        this._mapId = '';
    }

    get mapId () {
        return this._mapId;
    }

    connectedCallback() {
        this._mapId = this.getAttribute('map-id');
        this._OLMap = new OLMap({
            target: this,
            view: new View({
                center: [0, 0],
                zoom: 2
            })
        });

        MainEventDispatcher.addListener(this.onLoadedBaseLayers.bind(this),
            { type: 'map-base-layers-loaded', mapId : this.mapId});

        MainEventDispatcher.addListener(this.onBaseLayerVisibility.bind(this),
            { type: 'map-base-layers-visibility', mapId : this.mapId});
    }

    disconnectedCallback() {
        MainEventDispatcher.removeListener(this.onLoadedBaseLayers.bind(this),
            { type: 'map-base-layers-loaded', mapId : this.mapId});

        MainEventDispatcher.removeListener(this.onBaseLayerVisibility.bind(this),
            { type: 'map-base-layers-visibility', mapId : this.mapId});

    }


    onLoadedBaseLayers(event) {
        let OLLayers = event.baseLayerGroup.layers.map((layer) => {
            let olLayer;
            if (layer.layerId === 'osmMapnik') {
                olLayer = new TileLayer({
                    layerId: layer.layerId,
                    visible: layer.visible,
                    source: new OSM()
                })
            } else if (layer.layerId === 'osmStamenToner') {
                olLayer = new TileLayer({
                    layerId: layer.layerId,
                    visible: layer.visible,
                    source: new Stamen({
                        layer: 'toner'
                    })
                });
            }
            return olLayer;
        });

        this._OLlayerGroup = new LayerGroup({
            layers: OLLayers
        });

        this._OLMap.addLayer(this._OLlayerGroup);
    }

    onBaseLayerVisibility(event) {
        let olLayers = this._OLlayerGroup.getLayers();
        event.layers.forEach((lzmLayer, idx) => {
            olLayers.item(idx).setVisible(lzmLayer.visible);
        });
    }
}
