import { mainLizmap } from '../modules/Globals.js';
import { html, render } from 'lit-html';

import { transform } from 'ol/proj';

export default class GoToCoordinates extends HTMLElement {
    constructor() {
        super();

        this._latitude;
        this._longitude;
    }

    get _coordsInMapProj(){
        if (this._latitude && this._longitude) {
            return transform([this._latitude, this._longitude], 'EPSG:4326', mainLizmap.projection);
        }
        return null;
    }

    _zoomToCoords() {
        const coordsInMapProj = this._coordsInMapProj;
        if (coordsInMapProj){
            mainLizmap.extent = [coordsInMapProj[0], coordsInMapProj[1], coordsInMapProj[0], coordsInMapProj[1]];
        }
    }

    _centerToCoords(){
        const coordsInMapProj = this._coordsInMapProj;
        if (coordsInMapProj) {
            mainLizmap.center = coordsInMapProj;
        }
    }

    connectedCallback() {
        // Display
        const mainTemplate = () => html`
        <div class="form-inline">
            <input type="number" step="any" class="input-mini" placeholder="${lizDict['latitude']}" @input=${(event) => this._latitude = event.target.value}>
            <input type="number" step="any" class="input-mini" placeholder="${lizDict['longitude']}" @input=${(event) => this._longitude = event.target.value}>
            <button class="btn btn-mini" title="${lizDict['attributeLayers.btn.zoom.title']}" @click=${() => this._zoomToCoords()}><i class="icon-zoom-in"></i></button>
            <button class="btn btn-mini" title="${lizDict['attributeLayers.btn.center.title']}" @click=${() => this._centerToCoords()}><i class="icon-screenshot"></i></button>
        </div>`;

        render(mainTemplate(), this);
    }
}
