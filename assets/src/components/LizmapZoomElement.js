import { LizmapMapManager, MainEventDispatcher } from "../modules/LizmapGlobals";

export default class LizmapZoomElement extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({ mode: 'open' });

        shadowRoot.innerHTML = `
            <style>
                :host{
                    top: 10px;
                    right: 20px;
                    position: absolute;
                    z-index: 1;
                }
                button{
                    display:block;
                    width: 30px;
                    height: 30px;
                }
            </style>`;

        const zoomin = document.createElement('button');
        zoomin.innerHTML = '+';
        const zoomout = document.createElement('button');
        zoomout.innerHTML = '-';

        zoomin.addEventListener('click', (event) => {
            LizmapMapManager.getMap(this.mapId).zoomIn();
        });

        zoomout.addEventListener('click', (event) => {
            LizmapMapManager.getMap(this.mapId).zoomOut();
        });

        shadowRoot.appendChild(zoomin);
        shadowRoot.appendChild(zoomout);
    }

    connectedCallback() {
        this._mapId = this.getAttribute('map-id');
    }

    get mapId() {
        return this._mapId;
    }
}