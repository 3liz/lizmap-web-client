
import {LizmapMapManager, MainEventDispatcher} from "../modules/LizmapGlobals";

export default class LizmapBaseLayersElement extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({ mode: 'open' });
        this._select = document.createElement('select');
        shadowRoot.appendChild(this._select);

        this._select.addEventListener('change', (event) => {
            LizmapMapManager.getMap(this.mapId).baseLayerGroup.layerVisible = event.target.value;
        });
        this._layers = [];
        this._mapId = '';
    }

    get mapId () {
        return this._mapId;
    }

    connectedCallback() {
        this._mapId = this.getAttribute('map-id');
        MainEventDispatcher.addListener(this.onLoadedBaseLayers.bind(this),
            { type: 'map-base-layers-loaded', mapId : this.mapId});
    }

    disconnectedCallback() {
        MainEventDispatcher.removeListener(this.onLoadedBaseLayers.bind(this),
            { type: 'map-base-layers-loaded', mapId : this.mapId});

    }

    onLoadedBaseLayers(event) {
        this._layers = event.baseLayerGroup.layers;
        this.render();
    }

    render() {
        this._select.textContent = '';
        this._layers.forEach((layer) => {
            let newNode = document.createElement('option');
            newNode.setAttribute('value', layer.layerId);
            if (layer.visible) {
                newNode.setAttribute('selected', 'selected');
            }
            newNode.innerText = layer.layerName;

            this._select.appendChild(newNode);
        });
    }
}

