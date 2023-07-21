import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { BaseLayerTypes } from '../modules/config/BaseLayer.js';
import {html, render} from 'lit-html';


export default class BaseLayers extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        if (mainLizmap.state.baseLayers.baseLayers.length === 0) {
            document.getElementById('switcher-baselayer').classList.add('hide');
            return;
        }

        this._template = () => html`
            ${mainLizmap.state.baseLayers.baseLayers.length > 1
                ? html`
                <select @change=${(event) => { mainLizmap.state.baseLayers.selectedBaseLayerName = event.target.value }}>
                    ${mainLizmap.state.baseLayers.baseLayers.map((config) =>
                    html`<option .selected="${mainLizmap.state.baseLayers.selectedBaseLayerName === config.name}" value="${config.name}">${config.type === BaseLayerTypes.Empty ? lizDict['baselayer.empty.title'] : config.title}</option>`
                    )}
                </select>`
                :
                html`${mainLizmap.state.baseLayers.baseLayers[0].title}`
            }
        `;

        render(this._template(), this);

        mainEventDispatcher.addListener(
            () => {
                render(this._template(), this);
            }, ['baselayers.selection.changed']
        );
    }

    disconnectedCallback() {
        mainEventDispatcher.removeListener(
            () => {
                render(this._template(), this);
            }, ['baselayers.selection.changed']
        );
    }
}
