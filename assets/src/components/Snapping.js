/**
 * @module components/Snapping.js
 * @name Snapping
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';
import '../images/svg/refresh.svg';

/**
 * @class
 * @name Snapping
 * @augments HTMLElement
 */
export default class Snapping extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Display
        const mainTemplate = () => html`
        <div class="${mainLizmap.snapping.config !== undefined ? '' : 'hide'}">
            <h3>${lizDict['snapping.title']}</h3>
            <div class="control-group">
                <div class="controls">
                    <div class="btn-group">
                        <button class="btn ${mainLizmap.snapping.active ? 'active btn-success' : ''}" @click=${() => mainLizmap.snapping.toggle()}>${mainLizmap.snapping.active ? lizDict['geolocate.toolbar.stop'] : lizDict['geolocate.toolbar.start']}</button>
                        <button class="btn ${mainLizmap.snapping._snapLayersRefreshable ? 'btn-warning' : ''}" ?disabled=${!mainLizmap.snapping._snapLayersRefreshable} @click=${() => mainLizmap.snapping.getSnappingData() }>
                            <svg width="14" height="14">
                                <use xlink:href="#refresh"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            ${mainLizmap.snapping.active ?
                html`<div class="control-group">
                    <h3>${lizDict['snapping.list.title']}</h3>
                    <div class="snap-layers-list">
                        ${mainLizmap.snapping?.config?.snap_layers.map((snapLayer) =>
                            html`<div class="snap-layer">
                                <input id="${'snap-layer-'+snapLayer}" name="${snapLayer}" @change=${()=> mainLizmap.snapping.snapToggled = snapLayer} .disabled=${!mainLizmap.snapping?.config?.snap_enabled[snapLayer]} .checked=${mainLizmap.snapping?.config?.snap_on_layers[snapLayer]} type="checkbox"/><label for="${'snap-layer-'+snapLayer}" class="${mainLizmap.snapping?.config?.snap_enabled[snapLayer] ? '' : 'snap-disabled'}">${mainLizmap.state.layersAndGroupsCollection.getLayerById(snapLayer).title}</label>
                            </div>
                            `
                        )}
                    </div>
                </div>`
                : ''
            }
        <div>`;

        render(mainTemplate(), this);

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            [
                'snapping.config',
                'snapping.active',
                'snapping.refreshable'
            ]
        );
    }

    disconnectedCallback() {
    }
}
