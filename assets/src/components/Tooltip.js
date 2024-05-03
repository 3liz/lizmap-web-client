import { html, render } from 'lit-html';
import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';

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
                    html`<option ?selected=${this._tooltipLayersCfgs.length === 1} value="${tooltipLayerCfg.order}">${mainLizmap.state.layersAndGroupsCollection.getLayerByName(tooltipLayerCfg.name).title}</option>`
                )}
            </select>
        `;

        document.querySelector(".btn-tooltip-layer-clear").addEventListener('click', () => {
            document.getElementById('button-tooltip-layer').click();
        });

        lizMap.events.on({
            minidockopened: event => {
                if ( event.id === 'tooltip-layer' ) {
                    // Activate last selected tooltip layer
                    mainLizmap.tooltip.activate(this.querySelector('select').value);
                }
            },
            minidockclosed: event => {
                if ( event.id === 'tooltip-layer' ) {
                    // Deactivate tooltip on close
                    mainLizmap.tooltip.deactivate();
                }
            }
        });

        mainEventDispatcher.addListener(
            () => {
                this.classList.add('spinner');
            },
            ['tooltip.loading']
        );

        mainEventDispatcher.addListener(
            () => {
                this.classList.remove('spinner');
            },
            ['tooltip.loaded']
        );

        render(this._template(), this);
    }

    disconnectedCallback() {
    }
}
