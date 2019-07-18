import LizmapLayerGroup from '../modules/LizmapLayerGroup.js';

export default class LizmapBaseLayersElement extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({ mode: 'open' });

        this._mapElement;
    }

    connectedCallback() {

        const self = this;

        // TODO addeventlistener
        window.onload = function() {
            const mapSelector = self.getAttribute('map-selector');

            if (mapSelector) {
                const mapElement = document.querySelector(mapSelector);

                if (mapElement) {
                    if (mapElement.nodeName === "LIZMAP-MAP") {
                        self._mapElement = mapElement;
                        const baseLayerGroup = new LizmapLayerGroup({
                            mutuallyExclusive: true,
                            layersList: mapElement.baseLayers
                        });

                        mapElement.baseLayerGroup = baseLayerGroup;

                        self.render();
                    } else {
                        console.warn("Element is not a lizmap-map element.");
                    }
                } else {
                    console.warn("map-selector does not reference an element.");
                }
            } else {
                console.warn("map-selector undefined.");
            }
        };
    }

    render() {
        let newSelect = document.createElement('select');

        for (let [layerId, config] of this._mapElement.baseLayers) {
            let newNode = document.createElement('option');
            newNode.setAttribute('value', layerId);
            if (config.visible) {
                newNode.setAttribute('selected', 'selected');
            }
            newNode.innerText = config.name;

            newSelect.appendChild(newNode);
        }

        // Event change
        newSelect.onchange = (event) => {
            this._mapElement.baseLayerVisible = event.target.value;
        };

        this.shadowRoot.appendChild(newSelect);
    }
}

