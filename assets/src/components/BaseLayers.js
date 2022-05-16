import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import {html, render} from 'lit-html';


export default class BaseLayers extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        this._template = () => html`
        <select @change=${(event) => { mainLizmap.baseLayersMap.setLayerVisibilityByTitle(event.target.value) }}>
            ${mainLizmap.baseLayersMap.getAllLayers().map((layer) => 
                html`<option ?selected="${layer.getVisible()}" value="${layer.get('title')}">${layer.get('title')}</option>`)}
            <option class="${mainLizmap.baseLayersMap.hasEmptyBaseLayer ? '' : 'hide'}" ?selected="${mainLizmap.baseLayersMap.hasEmptyBaseLayerAtStartup}" value="emptyBaselayer">${lizDict['baselayer.empty.title']}</option>
        </select>`;

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
