import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import {html, render} from 'lit-html';


export default class BaseLayers extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        if (mainLizmap.baseLayersMap.baseLayersGroup.getLayers().getLength() === 0) {
            document.getElementById('switcher-baselayer').classList.add('hide');
            return;
        }

        this._template = () => html`
            ${mainLizmap.baseLayersMap.baseLayersGroup.getLayers().getLength() > 1 
                ? html`<select @change=${(event) => { mainLizmap.baseLayersMap.changeBaseLayer(event.target.value) }}>
                        ${mainLizmap.baseLayersMap.baseLayersGroup.getLayers().getArray().slice().reverse().map((layer) => 
                            html`<option .selected="${layer.getVisible()}" value="${layer.get('name')}">${layer.get('title')}</option>`)}
                            <option .selected="${mainLizmap.initialConfig.baseLayers.startupBaselayerName === 'empty'}" class="${mainLizmap.baseLayersMap.hasEmptyBaseLayer ? '' : 'hide'}" value="emptyBaselayer">${lizDict['baselayer.empty.title']}</option>
                        </select>`
                        : 
                        html`${mainLizmap.baseLayersMap.baseLayersGroup.getLayers().getArray()[0].get('title')}`
            }
        `;

        render(this._template(), this);

        mainEventDispatcher.addListener(
            () => {
                render(this._template(), this);
            }, ['baseLayers.changed']
        );
    }

    disconnectedCallback() {
        mainEventDispatcher.removeListener(
            () => {
                render(this._template(), this);
            }, ['baseLayers.changed']
        );
    }
}