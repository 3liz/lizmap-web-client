import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import ScaleLine from 'ol/control/ScaleLine';

export default class Scaleline {

    constructor() {
        this._olScaleline = new ScaleLine({
            target: document.getElementsByTagName('lizmap-scaleline')[0],
            bar: true,
            text: true
        });

        mainLizmap.map._olMap.addControl(this._olScaleline);
    }
}
