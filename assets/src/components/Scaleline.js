import { mainLizmap } from '../modules/Globals.js';
import { ADJUSTED_DPI } from '../utils/Constants.js';
import ScaleLine from 'ol/control/ScaleLine.js';

export default class Scaleline extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this._olScaleline = new ScaleLine({
            target: this,
            minWidth: 76,
            bar: true,
            text: true,
            dpi: ADJUSTED_DPI
        });

        mainLizmap.map.addControl(
            this._olScaleline
        );
    }

    disconnectedCallback() {
        mainLizmap.map.removeControl(
            this._olScaleline
        );
    }
}
