import { LizmapMapManager, MainEventDispatcher } from "../modules/LizmapGlobals";

export default class LizmapZoomSliderElement extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({ mode: 'open' });

        shadowRoot.innerHTML = `
            <style>
            :host{
                top: 70px;
                right: 20px;
                position: absolute;
                z-index: 1;
                background: white;
            }
            </style>`;

        this._inputRange = document.createElement('input');
        this._inputRange.type = 'range';

        // Set zoom value on input change
        this._inputRange.addEventListener('change', (event) => {
            LizmapMapManager.getMap(this.mapId).zoom = this.rangeValue;
        });

        shadowRoot.appendChild(this._inputRange);

    }

    connectedCallback() {
        this._mapId = this.getAttribute('map-id');

        MainEventDispatcher.addListener(this.onZoomSet.bind(this),
            { type: 'map-zoom-set', mapId: this.mapId });

        MainEventDispatcher.addListener(this.onMinMaxZoomSet.bind(this),
            { type: 'map-min-max-zoom-set', mapId: this.mapId });
    }

    disconnectedCallback() {
        MainEventDispatcher.removeListener(this.onZoomSet.bind(this),
            { type: 'map-zoom-set', mapId: this.mapId });

        MainEventDispatcher.removeListener(this.onMinMaxZoomSet.bind(this),
            { type: 'map-map-min-max-zoom-set', mapId: this.mapId });
    }

    get mapId() {
        return this._mapId;
    }

    get rangeValue(){
        return parseInt(this._inputRange.value, 10);
    }

    onZoomSet(event) {
        if (this.rangeValue !== event.zoom){
            this._inputRange.value = event.zoom;
        }
    }

    onMinMaxZoomSet(event) {
        this._inputRange.min = event.minZoom;
        this._inputRange.max = event.maxZoom;
    }
}
