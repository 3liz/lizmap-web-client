/**
 * @module components/Scaleline.js
 * @name Scaleline
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap } from '../modules/Globals.js';
import { ADJUSTED_DPI } from '../utils/Constants.js';
import ScaleLine from 'ol/control/ScaleLine.js';

/**
 * @class
 * @name Scaleline
 * @augments HTMLElement
 */
export default class Scaleline extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this._olScaleline = new ScaleLine({
            target: this,
            minWidth: 76,
            bar: true,
            text: !mainLizmap.initialConfig.options.hide_numeric_scale_value,
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
