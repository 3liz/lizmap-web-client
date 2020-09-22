import { mainLizmap } from '../modules/Globals.js';
import { html, render } from 'lit-html';

import { transform, get as getProjection } from 'ol/proj';

export default class MousePosition extends HTMLElement {
    constructor() {
        super();

        this._numDigits = 0;
        this._displayUnit = 'm';

        this._lastLon;
        this._lastLat;

        this._qgisProjectProjectionUnits;
    }

    // Render editablePositionTemplate and readonlyPositionTemplate apart because values change a lot
    editablePositionTemplate(lon, lat){
        return html`
            <input type="number" step="any" class="input-small" placeholder="longitude" .value=${lon}>
            <input type="number" step="any" class="input-small" placeholder="latitude" .value=${lat}>`;
    }

    readonlyPositionTemplate(lon, lat) {
        return html`
            <span>${lon}</span>
            <span>${lat}</span>`;
    }

    mainTemplate(lon, lat){
        return html`
            <div class="mouse-position">
                <div class="editable-position ${['m', 'd'].includes(this._displayUnit) ? '' : 'hide'}">${this.editablePositionTemplate(lon, lat)}</div>
                <div class="readonly-position ${['m', 'd'].includes(this._displayUnit) ? 'hide' : ''}">${this.readonlyPositionTemplate(lon, lat)}</div>
            </div>
            <div class="coords-unit">
                <select title="${lizDict['mouseposition.select']}" @change=${(event) => { this.displayUnit = event.target.value }}>
                ${this._qgisProjectProjectionUnits === 'm' ? html`<option value="m">${lizDict['mouseposition.units.m']}</option>` : ''}
                ${this._qgisProjectProjectionUnits === 'f' ? html`<option value="f">${lizDict['mouseposition.units.f']}</option>` : ''}
                ${['degrees', 'm'].includes(this._qgisProjectProjectionUnits) ? html`
                    <option value="d">${lizDict['mouseposition.units.d']}</option>
                    <option value="dm">${lizDict['mouseposition.units.dm']}</option>
                    <option value="dms">${lizDict['mouseposition.units.dms']}</option>` : ''}
                </select>
            </div>`;
    }

    /**
     * @param {string} unit
     */
    set displayUnit(unit){
        unit === 'm' ? this._numDigits = 0 : this._numDigits = 5;
        this._displayUnit = unit;

        render(this.mainTemplate(this._lastLon, this._lastLat), this);
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

        // Display coordinates in QGIS project projection if in meter and meter chosen
        if (this._qgisProjectProjectionUnits === 'm' && this._displayUnit === 'm') {
            lonLatToDisplay = transform(lonLatToDisplay, mainLizmap.projection, mainLizmap.qgisProjectProjection);

            render(this.editablePositionTemplate(lonLatToDisplay[0].toFixed(this._numDigits), lonLatToDisplay[1].toFixed(this._numDigits)),
                this.querySelector('.mouse-position > .editable-position'));

        } // Display in degree, degree minute, degree minute second
        else if (this._displayUnit.indexOf('d') === 0 && mainLizmap.lizmap3.map.projection.getUnits() !== 'degrees') {
            lonLatToDisplay = transform(lonLatToDisplay, mainLizmap.projection, 'EPSG:4326');

            // If in degree, lon/lat are editable
            if (this._displayUnit === 'd'){
                render(this.editablePositionTemplate(lonLatToDisplay[0].toFixed(this._numDigits), lonLatToDisplay[1].toFixed(this._numDigits)),
                    this.querySelector('.mouse-position > .editable-position'));

            }else{
                lonLatToDisplay[0] = this.getFormattedLonLat(lonLatToDisplay[0], 'lon', this._displayUnit);
                lonLatToDisplay[1] = this.getFormattedLonLat(lonLatToDisplay[1], 'lat', this._displayUnit);

                render(this.readonlyPositionTemplate(lonLatToDisplay[0], lonLatToDisplay[1]),
                    this.querySelector('.mouse-position > .readonly-position'));
            }
        }
    }

    reset(){

    }

    getFormattedLonLat (coordinate, axis, dmsOption) {
        if (!dmsOption) {
            dmsOption = 'dms';    //default to show degree, minutes, seconds
        }

        coordinate = (coordinate + 540) % 360 - 180; // normalize for sphere being round

        var abscoordinate = Math.abs(coordinate);
        var coordinatedegrees = Math.floor(abscoordinate);

        var coordinateminutes = (abscoordinate - coordinatedegrees) / (1 / 60);
        var tempcoordinateminutes = coordinateminutes;
        coordinateminutes = Math.floor(coordinateminutes);
        var coordinateseconds = (tempcoordinateminutes - coordinateminutes) / (1 / 60);
        coordinateseconds = Math.round(coordinateseconds * 10);
        coordinateseconds /= 10;

        if (coordinateseconds >= 60) {
            coordinateseconds -= 60;
            coordinateminutes += 1;
            if (coordinateminutes >= 60) {
                coordinateminutes -= 60;
                coordinatedegrees += 1;
            }
        }

        if (coordinatedegrees < 10) {
            coordinatedegrees = "0" + coordinatedegrees;
        }
        var str = coordinatedegrees + "\u00B0";

        if (dmsOption.indexOf('dms') >= 0) {
            if (coordinateminutes < 10) {
                coordinateminutes = "0" + coordinateminutes;
            }
            str += coordinateminutes + "'";

            if (coordinateseconds < 10) {
                coordinateseconds = "0" + coordinateseconds;
            }
            str += coordinateseconds + '"';
        } else if (dmsOption.indexOf('dm') >= 0) {
            coordinateminutes = Math.round(tempcoordinateminutes * 1000);
            coordinateminutes = coordinateminutes / 1000;
            if (coordinateminutes < 10) {
                coordinateminutes = "0" + coordinateminutes;
            }
            str += coordinateminutes + "'";
        }

        if (axis == "lon") {
            str += coordinate < 0 ? "W" : "E";
        } else {
            str += coordinate < 0 ? "S" : "N";
        }
        return str;
    }

    connectedCallback() {
        // Init variables
        this._qgisProjectProjectionUnits = getProjection(mainLizmap.qgisProjectProjection).getUnits();
        this._displayUnit = this._qgisProjectProjectionUnits;
        if (this._qgisProjectProjectionUnits === 'degrees'){
            this.displayUnit = 'd';
        }
        // Listen to mousemove event
        mainLizmap.lizmap3.map.events.register('mousemove', this, this._mousemove);
        // First render
        render(this.mainTemplate(null, null), this);
    }

    disconnectedCallback() {
        mainLizmap.lizmap3.map.events.unregister('mousemove', this, this._mousemove);
    }
}
