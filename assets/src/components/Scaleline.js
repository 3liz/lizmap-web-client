import { mainLizmap } from '../modules/Globals.js';
import ScaleLine from 'ol/control/ScaleLine';

export default class Scaleline extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        // Adjust OL2 to OL6 DPI value
        // We use 25.40005080010160020 for inch to meter conversion as it is more precise
        // const ADJUSTED_DPI = 96 * 25.4 / 25.40005080010160020;
        const ADJUSTED_DPI = 95.999808;

        this._olScaleline = new ScaleLine({
            target: this,
            minWidth: 76,
            bar: true,
            text: true,
            dpi: ADJUSTED_DPI
        });

        mainLizmap.baseLayersMap.addControl(
            this._olScaleline
        );
    }

    disconnectedCallback() {
        mainLizmap.baseLayersMap.removeControl(
            this._olScaleline
        );
    }
}
