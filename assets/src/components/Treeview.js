import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';
import {html, render} from 'lit-html';
import {when} from 'lit-html/directives/when.js';

import WMSCapabilities from 'ol/format/WMSCapabilities.js';

export default class Treeview extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        this._WMSCapabilities = (new WMSCapabilities()).read(lizMap.WMSCapabilities);
        this._rootLayer = this._WMSCapabilities?.Capability?.Layer;

        if(!this._rootLayer){
            return;
        }
        console.log(this._WMSCapabilities);

        this._layerTemplate = layer =>
        html`
        <ul>
            ${layer.map(layer => html`<li>${layer.Title}${when(layer.Layer, () => this._layerTemplate(layer.Layer))}</li>`)}
        </ul>`;

        render(this._layerTemplate(this._rootLayer.Layer), this);

    }

    disconnectedCallback() {
    }
}
