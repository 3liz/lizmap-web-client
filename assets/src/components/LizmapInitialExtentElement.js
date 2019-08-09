import { LizmapMapManager, MainEventDispatcher } from "../modules/LizmapGlobals";

import { library, findIconDefinition, icon } from '@fortawesome/fontawesome-svg-core';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
library.add(faCamera);

export default class LizmapInitialExtentElement extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({ mode: 'open' });

        shadowRoot.innerHTML = `
            <style>
            :host{
                top: 90px;
                right: 20px;
                position: absolute;
                z-index: 1;
                background: white;
            }
            </style>`;

        const initialExtentButton = document.createElement('button');
        initialExtentButton.innerHTML = 'E';

        shadowRoot.appendChild(initialExtentButton);

        const glasses = findIconDefinition({ prefix: 'fas', iconName: 'camera' });

        const i = icon(glasses);

        shadowRoot.appendChild(i.node[0]);

    }

    connectedCallback() {
        this._mapId = this.getAttribute('map-id');
    }

    disconnectedCallback() {

    }

    get mapId() {
        return this._mapId;
    }

}
