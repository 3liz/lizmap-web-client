/**
 * @module components/edition/ReverseGeom.js
 * @name ReverseGeom
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap } from '../../modules/Globals.js';

import '../../images/svg/mActionReverseLine.svg';

/**
 * Web component used to reverse vertices order for a modified feature
 * @class
 * @name reverseGeom
 * @augments HTMLElement
 */
export default class reverseGeom extends HTMLElement {
    constructor() {
        super();

        this.insertAdjacentHTML('afterbegin',
            `<svg>
                <use xlink:href="#mActionReverseLine"></use>
            </svg>`);
    }

    _reverse(){
        if (!mainLizmap.edition.modifyFeatureControl
            || !mainLizmap.edition.modifyFeatureControl.active
            || mainLizmap.edition.modifyFeatureControl.vertices.length == 0){
            return;
        }

        const lonLat = [];

        for (const vertice of mainLizmap.edition.modifyFeatureControl.vertices) {
            lonLat.push([vertice.geometry.x, vertice.geometry.y]);
        }

        lonLat.reverse();

        for (let index = 0; index < lonLat.length; index++) {
            mainLizmap.edition.modifyFeatureControl.vertices[index].move(new OpenLayers.LonLat(lonLat[index][0], lonLat[index][1]));
        }

        mainLizmap.edition.modifyFeatureControl.layer.events.triggerEvent("featuremodified", { feature: mainLizmap.edition.modifyFeatureControl.feature });

        // Tell user reverse is done
        lizMap.addMessage(lizDict['edition.revertgeom.success'], 'success', true).attr('id', 'lizmap-edition-message');
    }

    connectedCallback() {
        this.addEventListener('click', this._reverse);
    }

    disconnectedCallback() {
        this.removeEventListener('click', this._reverse);
    }
}
