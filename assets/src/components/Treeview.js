import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';
import LayerGroup from 'ol/layer/Group';
import {html, render} from 'lit-html';
import {when} from 'lit-html/directives/when.js';

export default class Treeview extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        this._onChange = () => {
            render(this._layerTemplate(mainLizmap.baseLayersMap.overlayLayersGroup), this);
        };

        this._layerTemplate = layerGroup =>
        html`
        <ul>
            ${layerGroup.getLayers().getArray().slice().reverse().map(layer => html`
            <li>
                <label class="checkbox">
                    <input type="checkbox" .checked=${layer.getVisible()} @click=${() => layer.setVisible(!layer.getVisible())} >${layer.get('name')}
                </label>
                ${when(layer instanceof LayerGroup, () => this._layerTemplate(layer))}
            </li>`
            )}
        </ul>`;

        render(this._layerTemplate(mainLizmap.baseLayersMap.overlayLayersGroup), this);

        mainLizmap.baseLayersMap.overlayLayersGroup.on('change', this._onChange);
    }

    disconnectedCallback() {
    }
}