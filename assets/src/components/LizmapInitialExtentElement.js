import { LizmapMapManager, MainEventDispatcher } from "../modules/LizmapGlobals";

import { library, findIconDefinition, icon } from '@fortawesome/fontawesome-svg-core';
import { faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons';
library.add(faExpandArrowsAlt);

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
            button{
                display:block;
                width: 30px;
                height: 30px;
                padding: 0;
            }
            svg{
                height: 26px;
            }
            </style>`;

        const initialExtentButton = document.createElement('button');
        const iconDef = findIconDefinition({ prefix: 'fas', iconName: 'expand-arrows-alt' });
        const i = icon(iconDef);
        initialExtentButton.appendChild(i.node[0]);
        shadowRoot.appendChild(initialExtentButton);
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
