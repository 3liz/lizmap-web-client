/**
 * @module components/BaseLayers.js
 * @name BaseLayers
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap } from '../modules/Globals.js';
import { BaseLayerTypes } from '../modules/config/BaseLayer.js';
import {html, render} from 'lit-html';
import { keyed } from 'lit-html/directives/keyed.js';

/**
 * @class
 * @name BaseLayers
 * @augments HTMLElement
 */
export default class BaseLayers extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        if (mainLizmap.state.baseLayers.baseLayers.length === 0) {
            document.getElementById('switcher-baselayer').classList.add('hide');
            return;
        }

        this._template = () => html`
            ${mainLizmap.state.baseLayers.baseLayers.length > 1
                ? keyed(mainLizmap.state.baseLayers.selectedBaseLayerName, html`
                <select @change=${(event) => { mainLizmap.state.baseLayers.selectedBaseLayerName = event.target.value }}>
                    ${mainLizmap.state.baseLayers.baseLayers.map((config) =>
                    html`<option ?selected="${mainLizmap.state.baseLayers.selectedBaseLayerName === config.name}" value="${config.name}">${config.type === BaseLayerTypes.Empty ? lizDict['baselayer.empty.title'] : config.title}</option>`
                    )}
                </select>`)
                :
                html`${mainLizmap.state.baseLayers.baseLayers[0].title}`
            }
        `;

        render(this._template(), this);

        mainLizmap.state.baseLayers.addListener(
            () => {
                render(this._template(), this);
            }, ['baselayers.selection.changed']
        );
    }

    disconnectedCallback() {
        mainLizmap.state.baseLayers.addListener(
            () => {
                render(this._template(), this);
            }, ['baselayers.selection.changed']
        );
    }
}
