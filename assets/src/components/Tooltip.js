import { html, render } from 'lit-html';
import { mainLizmap } from '../modules/Globals.js';

export default class Tooltip extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        this._tooltipLayersCfgs = mainLizmap.initialConfig.tooltipLayers.layerConfigs;

        this._template = () => html`
            <select @change=${ event => { mainLizmap.tooltip.activate(event.target.value) }}>
                <option value="">---</option>
                ${this._tooltipLayersCfgs.map(tooltipLayerCfg =>
                    html`<option value="${tooltipLayerCfg.order}">${mainLizmap.state.layersAndGroupsCollection.getLayerByName(tooltipLayerCfg.name).title}</option>`
                )}
            </select>
        `;

        render(this._template(), this);
    }

    disconnectedCallback() {
    }
}
