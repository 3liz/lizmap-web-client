import { mainLizmap } from '../modules/Globals.js';
import { html, render } from 'lit-html';

import { transform, get as getProjection } from 'ol/proj';

export default class MousePosition extends HTMLElement {
    constructor() {
        super();

        this.numDigits = 0;
        this.displayUnit = 'm';

        this._lastLon;
        this._lastLat;
    }

    // Render positionTemplate apart because values change a lot
    positionTemplate(lon, lat){
        return html`
            <input type="number" step="any" class="input-small" placeholder="longitude" .value=${lon}>
            <input type="number" step="any" class="input-small" placeholder="latitude" .value=${lat}>`;
    }

    mainTemplate(lon, lat){
        return html`
            <div class="mouse-position">
                ${this.positionTemplate(lon, lat)}
            </div>
            <div class="coords-unit">
                <select title="${lizDict['mouseposition.select']}" @change=${(event) => { this._displayUnit = event.target.value }}>
                    <option value="m">${lizDict['mouseposition.units.m']}</option>
                    <option value="f">${lizDict['mouseposition.units.f']}</option>
                    <option value="d">${lizDict['mouseposition.units.d']}</option>
                    <option value="dm">${lizDict['mouseposition.units.dm']}</option>
                    <option value="dms">${lizDict['mouseposition.units.dms']}</option>
                </select>
            </div>`;
    }

    set _displayUnit(unit){
        unit === 'm' ? this.numDigits = 0 : this.numDigits = 5;
        this.displayUnit = unit;

        this.redraw(this._lastLon, this._lastLat);
    }

    // Callback to map's mousemove event
    _mousemove(evt){
        if (evt == null) {
            this.reset();
            return;
        }else{
            const { lon, lat } = mainLizmap.lizmap3.map.getLonLatFromPixel(evt.xy);

            this._lastLon = lon;
            this._lastLat = lat;

            this.redraw(lon, lat);
        }
    }

    redraw(lon, lat){
        let lonLatToDisplay = [lon, lat];

        // Ex formatOutput() code
        const qgisProjectProjection = getProjection(mainLizmap.qgisProjectProjection);

        // Display coordinates in QGIS project projection if in meter and meter chosen
        if (qgisProjectProjection && qgisProjectProjection.getUnits() === 'm' && this.displayUnit === 'm') {
            lonLatToDisplay = transform(lonLatToDisplay, mainLizmap.projection, mainLizmap.qgisProjectProjection);
        }

        if (this.displayUnit.indexOf('d') === 0 && mainLizmap.lizmap3.map.projection.getUnits() !== 'degrees') {
            lonLatToDisplay = transform(lonLatToDisplay, mainLizmap.projection, 'EPSG:4326');
        }

        render(this.positionTemplate(lonLatToDisplay[0].toFixed(this.numDigits),lonLatToDisplay[1].toFixed(this.numDigits)),
            this.querySelector('.mouse-position'));
    }

    reset(){

    }

    connectedCallback() {
        // First render
        render(this.mainTemplate(null, null), this);
        // Listen to mousemove event
        mainLizmap.lizmap3.map.events.register('mousemove', this, this._mousemove);
    }

    disconnectedCallback() {
        mainLizmap.lizmap3.map.events.unregister('mousemove', this, this._mousemove);
    }
}
