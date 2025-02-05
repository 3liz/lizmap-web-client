/**
 * @module components/MousePosition.js
 * @name MousePosition
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap } from '../modules/Globals.js';
import { html, render } from 'lit-html';

import { transform, get as getProjection } from 'ol/proj.js';

import { forward } from '../dependencies/mgrs.js';

import MGRS from '../modules/MGRS.js';

/**
 * @class
 * @name MousePosition
 * @augments HTMLElement
 */
export default class MousePosition extends HTMLElement {
    constructor() {
        super();

        this._numDigits = 0;

        // 'm', 'ft', 'us-ft','degrees', 'dm', 'dms'
        this._displayUnit = 'm';

        // 'm', 'ft', 'us-ft', 'degrees'
        this._qgisProjectProjectionUnits;

        // lon/lat in map projection
        this._longitude;
        this._latitude;

        // lon/lat in inputs (written when mouse move or by user)
        this._lonInput;
        this._latInput;
    }

    // Don't add line break between <input>s or it adds a space in UI
    mainTemplate(lon, lat){
        const inputLongitude = html`<input type="number" step="any" placeholder="longitude" @input=${(event) => this._lonInput = parseFloat(event.target.value)} @keydown=${(event) => { if (event.key === 'Enter') { this._centerToCoords(); } }} .value=${isNaN(lon) ? 0 : lon}>`;
        const inputLatitude = html`<input type="number" step="any" placeholder="latitude" @input=${(event) => this._latInput = parseFloat(event.target.value)} @keydown=${(event) => { if (event.key === 'Enter') { this._centerToCoords(); } }} .value=${isNaN(lat) ? 0 : lat}>`;
        return html`
            <div class="mouse-position">
                <div class="editable-position ${['dm', 'dms', 'mgrs'].includes(this._displayUnit) ? 'hide' : ''}">
                    ${inputLongitude}${inputLatitude}
                </div>
                <div class="readonly-position ${['dm', 'dms', 'mgrs'].includes(this._displayUnit) ? '' : 'hide'}">
                    <span>${lon}</span>
                    <span>${lat}</span>
                </div>
                <button class="btn btn-sm" title="${lizDict['mouseposition.removeCenterPoint']}" @click=${() => this._removeCenterPoint()}><i class="icon-refresh"></i></button>
            </div>
            <div class="coords-unit">
                <select title="${lizDict['mouseposition.select']}" @change=${(event) => { this.displayUnit = event.target.value }}>
                    ${this._qgisProjectProjectionUnits === 'm' ? html`
                    <option selected value="m">${lizDict['mouseposition.units.m']}</option>` : ''}
                    ${ ['ft', 'us-ft'].includes(this._qgisProjectProjectionUnits) ? html`
                    <option selected value="f">${lizDict['mouseposition.units.f']}</option>` : ''}

                    <option value="degrees">${lizDict['mouseposition.units.d']}</option>
                    <option value="dm">${lizDict['mouseposition.units.dm']}</option>
                    <option value="dms">${lizDict['mouseposition.units.dms']}</option>
                    <option value="mgrs">MGRS</option>
                </select>
            </div>`;
    }

    _centerToCoords() {
        if (this._lonInput && this._latInput) {
            let lonlatInputInMapProj;

            // If map projection is not yet in degrees => reproject to EPSG:4326
            if (this._displayUnit === 'degrees' && mainLizmap.lizmap3.map.projection.getUnits() !== 'degrees') {
                lonlatInputInMapProj = transform([this._lonInput, this._latInput], 'EPSG:4326', mainLizmap.projection);
            } else {
                lonlatInputInMapProj = transform([this._lonInput, this._latInput], mainLizmap.qgisProjectProjection, mainLizmap.projection);
            }

            mainLizmap.center = lonlatInputInMapProj;
            // Display point
            const featureAsWKT = `POINT(${lonlatInputInMapProj[0]} ${lonlatInputInMapProj[1]})`;
            mainLizmap.map.setHighlightFeatures(featureAsWKT,"wkt", mainLizmap.projection);
        }
    }

    _removeCenterPoint() {
        mainLizmap.map.clearHighlightFeatures();
    }

    /**
     * Update the display unit of the mouse position
     * @param {string} unit - Unit to display 'm', 'mgrs' ...
     */
    set displayUnit(unit){
        unit === 'm' ? this._numDigits = 0 : this._numDigits = 5;
        this._displayUnit = unit;

        if (this._longitude && this._latitude){
            this.redraw(this._longitude, this._latitude);
        }

        if(unit === 'mgrs'){
            if(!this._MGRS){
                this._MGRS = new MGRS({
                    showLabels: true,
                    wrapX: false,
                });
                this._MGRS.setProperties({
                    name: 'LizmapMousePositionMGRS'
                });
            }
            mainLizmap.map.addToolLayer(this._MGRS);
        } else {
            if(this._MGRS){
                mainLizmap.map.removeToolLayer(this._MGRS);
            }
        }
    }

    // Callback to map's mousemove event
    _mousemove(evt){
        if (evt == null) {
            return;
        }else{
            let lon,lat;
            // OL2
            if(evt.xy){
                const lonlat = mainLizmap.lizmap3.map.getLonLatFromPixel(evt.xy);
                if (lonlat !== null) {
                    lon = lonlat.lon;
                    lat = lonlat.lat;
                }
            } else if (evt.pixel){ //OL6
                [lon, lat ] = mainLizmap.map.getCoordinateFromPixel(evt.pixel);
            }

            if(lon && lat){
                this._longitude = lon;
                this._latitude = lat;

                this.redraw(lon, lat);
            }
        }
    }

    redraw(lon, lat) {
        let lonLatToDisplay = [lon, lat];

        // Display in degree, degree minute, degree minute second or MGRS
        if (['degrees', 'dm', 'dms', 'mgrs'].includes(this._displayUnit)) {
            // If map projection is not yet in degrees => reproject to EPSG:4326
            if (mainLizmap.lizmap3.map.projection.getUnits() !== 'degrees') {
                lonLatToDisplay = transform(lonLatToDisplay, mainLizmap.projection, 'EPSG:4326');
            }

            // If in degrees, lon/lat are editable
            if (this._displayUnit === 'degrees') {
                render(this.mainTemplate(lonLatToDisplay[0].toFixed(this._numDigits), lonLatToDisplay[1].toFixed(this._numDigits)), this);
            } else if (this._displayUnit === 'mgrs') {
                let mgrsCoords = '';
                try {
                    mgrsCoords = forward(lonLatToDisplay);

                    mgrsCoords = mgrsCoords.slice(0, -12) + ' ' + mgrsCoords.slice(-12, -10) + ' ' + mgrsCoords.slice(-10, -5) + ' ' + mgrsCoords.slice(-5);
                } catch (error) {
                    console.error(error);
                }

                render(this.mainTemplate(mgrsCoords, ''), this);
            } else {
                lonLatToDisplay[0] = this.getFormattedLonLat(lonLatToDisplay[0], 'lon', this._displayUnit);
                lonLatToDisplay[1] = this.getFormattedLonLat(lonLatToDisplay[1], 'lat', this._displayUnit);

                render(this.mainTemplate(lonLatToDisplay[0], lonLatToDisplay[1]), this);
            }
        } else {
            lonLatToDisplay = transform(lonLatToDisplay, mainLizmap.projection, mainLizmap.qgisProjectProjection);

            render(this.mainTemplate(lonLatToDisplay[0].toFixed(this._numDigits), lonLatToDisplay[1].toFixed(this._numDigits)), this);
        }

        this._lonInput = lonLatToDisplay[0];
        this._latInput = lonLatToDisplay[1];
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
        this.displayUnit = this._qgisProjectProjectionUnits;

        // Listen to mousemove event
        // OL2
        mainLizmap.lizmap3.map.events.register('mousemove', this, this._mousemove);
        // OL6
        mainLizmap.map.on('pointermove', (evt) => this._mousemove(evt));

        // First render
        render(this.mainTemplate(null, null), this);
    }

    disconnectedCallback() {
        // OL2
        mainLizmap.lizmap3.map.events.unregister('mousemove', this, this._mousemove);
        // OL6
        mainLizmap.map.un('pointermove', (evt) => this._mousemove(evt));
    }
}
