import { mainLizmap } from '../modules/Globals.js';
import ScaleLine from 'ol/control/ScaleLine';

export default class Scaleline extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this._olScaleline = new ScaleLine({
            target: this,
            minWidth: 76,
            bar: true,
            text: true
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
