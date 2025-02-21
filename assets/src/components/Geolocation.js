/**
 * @module components/Geolocation.js
 * @name Geolocation
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';
import {html, render} from 'lit-html';

/**
 * @class
 * @name Geolocation
 * @augments HTMLElement
 */
export default class Geolocation extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Display
        const mainTemplate = () => html`
        <div class="menu-content">
            <div class="button-bar">
                <button
                    class="btn btn-sm ${mainLizmap.geolocation.isTracking ? 'active btn-success' : ''}"
                    @click=${ () => mainLizmap.geolocation.toggleTracking()}
                    ?disabled=${mainLizmap.geolocation.isTracking && mainLizmap.geolocation.firstGeolocation}
                    >
                    <span class="icon"></span>
                    ${mainLizmap.geolocation.isTracking ? (
                        mainLizmap.geolocation.firstGeolocation ?
                            lizDict['geolocate.toolbar.waiting'] :
                                lizDict['geolocate.toolbar.stop']) :
                            lizDict['geolocate.toolbar.start']
                    }
                </button>
                <button
                    class="btn btn-sm"
                    @click=${ () => mainLizmap.geolocation.center()}
                    ?disabled=${
                        !mainLizmap.geolocation.isTracking |
                        mainLizmap.geolocation.isBind |
                        mainLizmap.geolocation.firstGeolocation
                    }
                    ><span class="icon"></span>
                    ${lizDict['geolocate.toolbar.center']}
                </button>
                <div class="input-prepend input-append">
                    <button
                        class="btn btn-sm ${mainLizmap.geolocation.isBind ? 'active btn-success' : ''}"
                        @click=${() => mainLizmap.geolocation.toggleBind()}
                        ?disabled=${
                            !mainLizmap.geolocation.isTracking | mainLizmap.geolocation.firstGeolocation
                        }>
                        <span class="icon"></span>
                            ${lizDict['geolocate.toolbar.bind']}
                    </button>
                    <input
                        class="input-mini"
                        type="number"
                        min="1"
                        ?disabled=${
                            !mainLizmap.geolocation.isBind ||
                            !mainLizmap.geolocation.isTracking
                        }
                        value="${mainLizmap.geolocation.bindIntervalInSecond}"
                        @input=${(event) => mainLizmap.geolocation.bindIntervalInSecond = parseInt(event.target.value)}
                        >
                    <span class="add-on">s</span>
                </div>
            </div>
            <div class="geolocation-infos">
                <div>
                    <small class="geolocation-coords">
                        <div>
                            X : ${mainLizmap.geolocation.position ? mainLizmap.geolocation.position[0].toString() : ''}
                        </div>
                        <div>
                            Y : ${mainLizmap.geolocation.position ? mainLizmap.geolocation.position[1].toString() : ''}
                        </div>
                    </small>
                </div>
                <div>
                    <small class="geolocation-accuracy">
                        <div>${lizDict['geolocate.infos.accuracy']} : ${mainLizmap.geolocation.accuracy}</div>
                    </small>
                </div>
            </div>
        </div>`;

        render(mainTemplate(), this);

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            [
                'geolocation.isTracking',
                'geolocation.firstGeolocation',
                'geolocation.isBind',
                'geolocation.position',
                'geolocation.accuracy'
            ]
        );
    }

    disconnectedCallback() {
    }
}
