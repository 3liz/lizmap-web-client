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
        if (mainLizmap?.digitizing?.isSplitLocked) return false;
        const digitizingActive = mainLizmap?.digitizing?.toolSelected !== 'deactivate'
            || mainLizmap?.digitizing?.context === 'edition';
        const hasLayerId = !!mainLizmap?.edition?.layerId;
        return digitizingActive || hasLayerId;
    }

    connectedCallback() {
        this._template = () => {
            const splitLocked = mainLizmap?.digitizing?.isSplitLocked;
            const tooltip = splitLocked
                ? (lizDict['edition.split.save.first'] || 'Save features first before using this tool.')
                : (lizDict['edition.geom.copyPaste'] || 'Copy the geometry from an existing map layer feature');
            return html`
        <button class='btn edition-tool-btn ${this._active ? 'active btn-primary' : ''}'
            data-bs-toggle="tooltip"
            data-bs-title='${tooltip}'
            ?disabled=${!this._canActivate()}
            @click=${() => this._toggle()}>
            <svg>
                <use href="${lizUrls.svgSprite}#copyGeometry"/>
            </svg>
        </button>`;
        };

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

        mainEventDispatcher.addListener(
            () => {
                render(this._template(), this);
            }, 'digitizing.splitLocked'
        );
    }

    disconnectedCallback() {}
}
