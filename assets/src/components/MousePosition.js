import { mainLizmap } from '../modules/Globals.js';
import { html, render } from 'lit-html';

import { transform, get as getProjection } from 'ol/proj';

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

    // Render editablePositionTemplate and readonlyPositionTemplate apart because values change a lot
    // Don't add line break between <input>s or it adds a space in UI
    editablePositionTemplate(lon, lat){
        return html`<input type="number" step="any" placeholder="longitude" @input=${(event) => this._lonInput = parseFloat(event.target.value)} @keydown=${(event) => { if (event.key === 'Enter') { this._centerToCoords(); } }} .value=${lon}><input type="number" step="any" placeholder="latitude" @input=${(event) => this._latInput = parseFloat(event.target.value)} @keydown=${(event) => { if (event.key === 'Enter') { this._centerToCoords(); } }} .value=${lat}>`;
    }

    readonlyPositionTemplate(lon, lat) {
        return html`
            <span>${lon}</span>
            <span>${lat}</span>`;
    }

    mainTemplate(lon, lat){
        return html`
            <div class="mouse-position">
                <div class="editable-position ${['dm', 'dms'].includes(this._displayUnit) ? 'hide' : ''}">${this.editablePositionTemplate(lon, lat)}</div>
                <div class="readonly-position ${['dm', 'dms'].includes(this._displayUnit) ? '' : 'hide'}">${this.readonlyPositionTemplate(lon, lat)}</div>
                <button class="btn btn-mini" title="${lizDict['mouseposition.removeCenterPoint']}" @click=${() => this._removeCenterPoint()}><i class="icon-refresh"></i></button>
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
            const centerPoint = new OpenLayers.Geometry.Point(lonlatInputInMapProj[0], lonlatInputInMapProj[1]);
            const locateLayer = mainLizmap.lizmap3.map.getLayersByName('locatelayer')[0];
            locateLayer.removeAllFeatures();
            locateLayer.addFeatures(new OpenLayers.Feature.Vector(centerPoint));
        }
    }

    _removeCenterPoint() {
        mainLizmap.lizmap3.map.getLayersByName('locatelayer')[0].removeAllFeatures();
    }

    /**
     * @param {string} unit
     */
    set displayUnit(unit){
        unit === 'm' ? this._numDigits = 0 : this._numDigits = 5;
        this._displayUnit = unit;

        if (this._longitude && this._latitude){
            this.redraw(this._longitude, this._latitude);
            render(this.mainTemplate(this._longitude, this._latitude), this);
        }
    }

    // Callback to map's mousemove event
    _mousemove(evt){
        if (evt == null) {
            return;
        }else{
            const { lon, lat } = mainLizmap.lizmap3.map.getLonLatFromPixel(evt.xy);

            this._longitude = lon;
            this._latitude = lat;

            this.redraw(lon, lat);
        }
    }

    redraw(lon, lat){
        let lonLatToDisplay = [lon, lat];

        // Display in degree, degree minute, degree minute second
        if (['degrees', 'dm', 'dms'].includes(this._displayUnit)) {
            // If map projection is not yet in degrees => reproject to EPSG:4326
            if (mainLizmap.lizmap3.map.projection.getUnits() !== 'degrees'){
                lonLatToDisplay = transform(lonLatToDisplay, mainLizmap.projection, 'EPSG:4326');
            }

            // If in degrees, lon/lat are editable
            if (this._displayUnit === 'degrees'){
                render(this.editablePositionTemplate(lonLatToDisplay[0].toFixed(this._numDigits), lonLatToDisplay[1].toFixed(this._numDigits)),
                    this.querySelector('.mouse-position > .editable-position'));

            }else{
                lonLatToDisplay[0] = this.getFormattedLonLat(lonLatToDisplay[0], 'lon', this._displayUnit);
                lonLatToDisplay[1] = this.getFormattedLonLat(lonLatToDisplay[1], 'lat', this._displayUnit);

                render(this.readonlyPositionTemplate(lonLatToDisplay[0], lonLatToDisplay[1]),
                    this.querySelector('.mouse-position > .readonly-position'));
            }
        }else{
            lonLatToDisplay = transform(lonLatToDisplay, mainLizmap.projection, mainLizmap.qgisProjectProjection);

            render(this.editablePositionTemplate(lonLatToDisplay[0].toFixed(this._numDigits), lonLatToDisplay[1].toFixed(this._numDigits)),
                this.querySelector('.mouse-position > .editable-position'));
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
        mainLizmap.lizmap3.map.events.register('mousemove', this, this._mousemove);
        // First render
        render(this.mainTemplate(null, null), this);
    }

    disconnectedCallback() {
        mainLizmap.lizmap3.map.events.unregister('mousemove', this, this._mousemove);
    }
}
