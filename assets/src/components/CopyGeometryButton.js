/**
 * @module components/CopyGeometryButton.js
 * @name CopyGeometryButton
 * @copyright 2024 3Liz
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';

/**
 * Web component for "Copy existing geometry" button
 * @class
 * @augments HTMLElement
 */
export default class CopyGeometryButton extends HTMLElement {
    constructor() {
        super();
        this._active = false;
    }

    connectedCallback() {
        this._template = () => html`
            <button
                class="btn btn-small ${this._active ? 'active btn-primary' : ''}"
                data-original-title="${lizDict['digitizing.toolbar.copyGeometry'] || 'Copy existing geometry'}"
                ?disabled=${!this._canActivate()}
                @click=${() => this._toggle()}>
                <svg>
                    <use href="${lizUrls.svgSprite}#mActionEditCopy"/>
                </svg>
            </button>
        `;

        render(this._template(), this);

        // Add tooltip
        $('button', this).tooltip({
            placement: 'top'
        });

        // Listen for geometry copy events
        mainEventDispatcher.addListener(() => {
            this._active = true;
            render(this._template(), this);
        }, 'geometryCopy.activated');

        mainEventDispatcher.addListener(() => {
            this._active = false;
            render(this._template(), this);
        }, 'geometryCopy.deactivated');

        // Listen for edition state changes
        mainEventDispatcher.addListener(() => {
            render(this._template(), this);
        }, 'edition.drawFeatureActivated');

        mainEventDispatcher.addListener(() => {
            render(this._template(), this);
        }, 'edition.formDisplayed');

        mainEventDispatcher.addListener(() => {
            render(this._template(), this);
        }, 'edition.formClosed');
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

    /**
     * Toggle copy mode
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

    disconnectedCallback() {
        // Cleanup if needed
    }
}
