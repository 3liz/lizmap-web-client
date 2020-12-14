import { mainLizmap } from '../modules/Globals.js';
import ScaleLine from 'ol/control/ScaleLine';

export default class Scaleline extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        // DPI is adjusted here because this commit https://github.com/openlayers/openlayers/commit/857f4e01ac9c6c27d83f7cc1f5eda86c53405228
        // has not been released yet. Also we use 25.40005080010160020 as it is more precise
        // TODO : Change this value when commit released and Lizmap up to date with OL 6
        const ADJUSTED_DPI = (96 * 1000) / (25.40005080010160020 * 39.37);

        this._olScaleline = new ScaleLine({
            target: this,
            minWidth: 76,
            bar: true,
            text: true,
            dpi: ADJUSTED_DPI
        });

        mainLizmap.map._olMap.addControl(
            this._olScaleline
        );
    }

    disconnectedCallback() {
        mainLizmap.map._olMap.removeControl(
            this._olScaleline
        );
    }
}
