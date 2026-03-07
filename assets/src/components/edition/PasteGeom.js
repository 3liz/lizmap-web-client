/**
 * @module components/edition/PasteGeom.js
 * @name PasteGeom
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from '../../modules/Globals.js';
import { html, render } from 'lit-html';

/**
 * Web component for copy and paste geometry workflow.
 * Activates copy mode to pick a geometry from the map,
 * which is then automatically applied to the current editing feature.
 * @class
 * @name pasteGeom
 * @augments HTMLElement
 */
export default class pasteGeom extends HTMLElement {
    constructor() {
        super();
        this._active = false;
    }

    /**
     * Toggle copy geometry mode
     */
    _toggle() {
        if (!mainLizmap?.geometryCopyHandler) {
            lizMap.addMessage('Copy geometry feature not ready yet. Please try again.', 'error', true);
            return;
        }

        if (this._active) {
            mainLizmap.geometryCopyHandler.deactivate();
        } else {
            mainLizmap.geometryCopyHandler.activate();
        }
    }

    /**
     * Check if copy mode can be activated
     * @returns {boolean} True if can activate
     */
    _canActivate() {
        const drawActive = mainLizmap?.edition?.drawFeatureActivated || false;
        const hasLayerId = !!mainLizmap?.edition?.layerId;
        return drawActive || hasLayerId;
    }

    connectedCallback() {
        this._template = () =>
            html`
        <button class='btn btn-sm ${this._active ? 'active btn-primary' : ''}'
            data-bs-toggle="tooltip"
            data-bs-title='${lizDict['edition.geom.copyPaste'] || 'Copy and paste an existing geometry'}'
            ?disabled=${!this._canActivate()}
            @click=${() => this._toggle()}>
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
                this._active = true;
                render(this._template(), this);
            }, 'geometryCopy.activated'
        );

        mainEventDispatcher.addListener(
            () => {
                this._active = false;
                render(this._template(), this);
            }, 'geometryCopy.deactivated'
        );

        mainEventDispatcher.addListener(
            () => {
                render(this._template(), this);
            }, 'edition.drawFeatureActivated'
        );

        mainEventDispatcher.addListener(
            () => {
                render(this._template(), this);
            }, 'edition.formDisplayed'
        );

        mainEventDispatcher.addListener(
            () => {
                render(this._template(), this);
            }, 'edition.formClosed'
        );
    }

    disconnectedCallback() {}
}
