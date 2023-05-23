import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';
import LayerGroup from 'ol/layer/Group';
import {html, render} from 'lit-html';
import {when} from 'lit-html/directives/when.js';

export default class Treeview extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        this._layerTemplate = layerGroup =>
        html`
        <ul>
            ${layerGroup.getLayers().getArray().reverse().map(layer => html`<li>${layer.get('name')}${when(layer instanceof LayerGroup, () => this._layerTemplate(layer))}</li>`)}
        </ul>`;

        render(this._layerTemplate(mainLizmap.baseLayersMap.overlayLayersGroup), this);

    }

    disconnectedCallback() {
    }
}