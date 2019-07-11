import 'ol/ol.css';

// OLMap and not Map to avoid collision with global object Map
import OLMap from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';

import LizmapLayerGroup from './LizmapLayerGroup.js';

export default class LizmapMapElement extends HTMLElement {
    constructor() {
        super();

        this._OLMap;
        this._baseLayerGroup;
    }

    connectedCallback() {
    	const map  = new OLMap({
            target: this,
            view: new View({
                center: [0, 0],
                zoom: 2
            })
        });
        this._OLMap = map;

        const baseLayerGroup = new LizmapLayerGroup({
            mutuallyExclusive: true,
            layersList: this.baseLayers
        });

        this._baseLayerGroup = baseLayerGroup;
    }

    get baseLayerGroup(){
    	return this._baseLayerGroup;
    }

    /**
    * @param LizmapLayerGroup lizmapLayerGroup
    **/

    set baseLayerGroup(lizmapLayerGroup){
    	this._baseLayerGroup = lizmapLayerGroup;
    	this._OLMap.addLayer(lizmapLayerGroup.OLlayerGroup);
    }

    set baseLayerVisible(layerId){
    	this._baseLayerGroup.layerVisible = layerId;
    }

    // TODO get base layers list from config
    get baseLayers(){
    	return new Map([
            ['osmMapnik',{name: 'OSM', visible: false}],
            ['osmStamenToner',{name: 'OSM Toner', visible: true}]
        ]);
    }
}
