import { mainLizmap } from '../modules/Globals.js';
import { html, render } from 'lit-html';

import { transform, get as getProjection } from 'ol/proj';

export default class MousePosition extends HTMLElement {
    constructor() {
        super();

        this.numDigits = 0;
        this.displayUnit = 'm';
    }

    mainTemplate(lon, lat){
        return html`
                <div class="mouse-position">
                    <input type="number" step="any" class="input-small" placeholder="longitude" .value=${lon}>
                    <input type="number" step="any" class="input-small" placeholder="latitude" .value=${lat}>
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
    }

    redraw(evt){
        if (evt == null) {
            this.reset();
            return;
        }else{
            const { lon, lat } = mainLizmap.lizmap3.map.getLonLatFromPixel(evt.xy);
            let lonLatToDisplay = [lon, lat];

            // Ex formatOutput() code
            const qgisProjectProjection = getProjection(mainLizmap.qgisProjectProjection);
            if (qgisProjectProjection && qgisProjectProjection.getUnits() === 'm' && this.displayUnit === 'm') {
                lonLatToDisplay = transform(lonLatToDisplay, mainLizmap.projection, mainLizmap.qgisProjectProjection);
            }

            render(this.mainTemplate(lonLatToDisplay[0].toFixed(this.numDigits), lonLatToDisplay[1].toFixed(this.numDigits)), this);
        }
    }

    reset(){

    }

    connectedCallback() {
        // Listen to mousemove event
        mainLizmap.lizmap3.map.events.register('mousemove', this, this.redraw);
    }

    disconnectedCallback() {
        mainLizmap.lizmap3.map.events.unregister('mousemove', this, this.redraw);
    }
}
