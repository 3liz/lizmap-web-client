/**
 * @module components/edition/PasteStoredGeom.js
 * @name PasteStoredGeom
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from '../../modules/Globals.js';
import { html, render } from 'lit-html';
import { Feature } from 'ol';

/**
 * Web component used to paste a geometry from featureStorage.
 * This is the original paste functionality that allows pasting
 * geometries copied from other tools (drawing, selection, popups, etc.).
 * Currently hidden - to be completed in a future iteration.
 * @class
 * @name PasteStoredGeom
 * @augments HTMLElement
 */
export default class PasteStoredGeom extends HTMLElement {
    constructor() {
        super();
    }

    _paste(){
        if(!confirm(lizDict['edition.confirm.paste'])){
            return;
        }

        const storedData = mainLizmap?.featureStorage?.get();
        const features = storedData?.features;

        if(!features || features.length === 0){
            lizMap.addMessage(lizDict['edition.error.noGeometryToPaste'] || 'No geometry available to paste', 'error', true);
            return;
        }

        const geom = features[0].getGeometry().clone();
        const feature = new Feature(geom);
        mainLizmap.digitizing._drawSource.clear();
        mainLizmap.digitizing._drawSource.addFeature(feature);
        mainEventDispatcher.dispatch('digitizing.geometryChanged');

        // Visual feedback
        lizMap.addMessage(lizDict['edition.geom.pasted'] || 'Geometry pasted successfully', 'info', true);
    }

    connectedCallback() {
        this._template = () =>
            html`
        <button class='btn edition-tool-btn' data-bs-toggle="tooltip" data-bs-title='${lizDict['edition.geom.paste'] || 'Paste the geometry'}' ?disabled=${!mainLizmap.featureStorage.hasFeatures()} @click=${() => this._paste()}>
            <svg>
                <use href="${lizUrls.svgSprite}#mActionEditPaste"/>
            </svg>
        </button>`;

        render(this._template(), this);

        // Add tooltip on buttons
        $('button', this).tooltip({
            placement: 'top'
        });

        mainEventDispatcher.addListener(
            () => {
                render(this._template(), this);
            }, 'featureStorage.set'
        );

        mainEventDispatcher.addListener(
            () => {
                render(this._template(), this);
            }, 'featureStorage.copy'
        );

        mainEventDispatcher.addListener(
            () => {
                render(this._template(), this);
            }, 'featureStorage.clear'
        );
    }

    disconnectedCallback() {}
}
