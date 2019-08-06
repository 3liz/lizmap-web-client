import 'ol/ol.css';

// OLMap and not Map to avoid collision with global object Map
import OLMap from 'ol/Map.js';
import View from 'ol/View.js';
import LayerGroup from "ol/layer/Group";
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import Stamen from "ol/source/Stamen";

import { MainEventDispatcher } from "../modules/LizmapGlobals";

export default class LizmapOlMapElement extends HTMLElement {
    constructor() {
        super();

        this._OLMap = null;
        this._OLlayerGroup = null;
        this._mapId = '';
    }

    get mapId() {
        return this._mapId;
    }

    connectedCallback() {
        this._mapId = this.getAttribute('map-id');

        MainEventDispatcher.addListener(this.onLoadedMapConfig.bind(this),
            { type: 'map-config-loaded', mapId: this.mapId });

        MainEventDispatcher.addListener(this.onLoadedBaseLayers.bind(this),
            { type: 'map-base-layers-loaded', mapId: this.mapId });

        MainEventDispatcher.addListener(this.onBaseLayerVisibility.bind(this),
            { type: 'map-base-layers-visibility', mapId: this.mapId });

        MainEventDispatcher.addListener(this.onZoomSet.bind(this),
            { type: 'map-zoom-set', mapId: this.mapId });
    }

    disconnectedCallback() {
        MainEventDispatcher.removeListener(this.onLoadedMapConfig.bind(this),
            { type: 'map-config-loaded', mapId: this.mapId });

        MainEventDispatcher.removeListener(this.onLoadedBaseLayers.bind(this),
            { type: 'map-base-layers-loaded', mapId: this.mapId });

        MainEventDispatcher.removeListener(this.onBaseLayerVisibility.bind(this),
            { type: 'map-base-layers-visibility', mapId: this.mapId });

        MainEventDispatcher.removeListener(this.onZoomSet.bind(this),
            { type: 'map-zoom-set', mapId: this.mapId });

    }

    onLoadedMapConfig(event) {
        this._mapId = event.mapId;

        this._OLMap = new OLMap({
            target: this,
            view: new View({
                center: [0, 0],
                zoom: this._zoom
            })
        });

        this._OLMap.getView().fit(event.config.options.initialExtent);

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

    onZoomSet(event) {
        this._OLMap.getView().setZoom(event.zoom);
    }
}
