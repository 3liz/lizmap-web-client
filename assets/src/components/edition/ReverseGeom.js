/**
 * @module components/edition/ReverseGeom.js
 * @name ReverseGeom
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from '../../modules/Globals.js';

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
                <use href="${lizUrls.svgSprite}#mActionReverseLine"/>
            </svg>`);
    }

    _canReverse() {
        const features = mainLizmap.digitizing.featureDrawn;
        return features && features.length > 0;
    }

    _reverse(){
        if (!this._canReverse()) {
            return;
        }

        const features = mainLizmap.digitizing.featureDrawn;
        const geom = features[0].getGeometry();
        const geomType = geom.getType();

        if (geomType === 'LineString') {
            geom.setCoordinates(geom.getCoordinates().reverse());
        } else if (geomType === 'Polygon') {
            const rings = geom.getCoordinates();
            geom.setCoordinates(rings.map(ring => ring.reverse()));
        } else if (geomType === 'MultiLineString') {
            const lines = geom.getCoordinates();
            geom.setCoordinates(lines.map(line => line.reverse()));
        } else {
            return;
        }

        mainEventDispatcher.dispatch('digitizing.geometryChanged');

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
