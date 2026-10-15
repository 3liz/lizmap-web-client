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

    _reverse(){
        // OL10 path: operate on the feature currently in the digitizing draw layer.
        // (The legacy OL2 modifyFeatureControl is no longer activated.)
        const features = mainLizmap.digitizing?.featureDrawn;
        if (!features || features.length === 0) return;

        const feature = features[0];
        const geom = feature.getGeometry();
        const type = geom.getType();

        if (type === 'LineString' || type === 'MultiPoint') {
            geom.setCoordinates(geom.getCoordinates().slice().reverse());
        } else if (type === 'Polygon') {
            geom.setCoordinates(geom.getCoordinates().map(ring => ring.slice().reverse()));
        } else if (type === 'MultiLineString') {
            geom.setCoordinates(geom.getCoordinates().map(line => line.slice().reverse()));
        } else if (type === 'MultiPolygon') {
            geom.setCoordinates(
                geom.getCoordinates().map(poly => poly.map(ring => ring.slice().reverse()))
            );
        } else {
            // Point geometries have nothing to reverse.
            return;
        }

        // Sync the hidden geom form field via the digitizing change event.
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
