import { html, render } from 'lit-html';
import { mainLizmap } from '../modules/Globals.js';

export default class Tooltip extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        this._tooltipLayersCfg = mainLizmap.config.tooltipLayers;

        this._template = () => html`
            <select @change=${ event => { mainLizmap.tooltip.activate(event.target.value) }}>
                <option value="">---</option>
                ${Object.keys(this._tooltipLayersCfg).map( tooltipLayerName =>
                    html`<option value="${tooltipLayerName}">${mainLizmap.state.layersAndGroupsCollection.getLayerByName(tooltipLayerName).title}</option>`
                )}
            </select>
        `;

        render(this._template(), this);
    }

    disconnectedCallback() {
    }
}
