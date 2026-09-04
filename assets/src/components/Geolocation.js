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
        this._closeBtn = this.closest('.geolocation')?.querySelector('button.btn-geolocation-close');
        this._closeHandler = () => document.getElementById('button-geolocation')?.click();
        this._closeBtn?.addEventListener('click', this._closeHandler);

        // Display
        const mainTemplate = () => html`
        <div class="menu-content">
            <div class="button-bar">
                <button type="button"
                    class="btn-tracking btn btn-sm ${mainLizmap.geolocation.isTracking ? 'active btn-success' : ''}"
                    title="${mainLizmap.geolocation.isTracking ? (
                        mainLizmap.geolocation.firstGeolocation ?
                            lizDict['geolocate.toolbar.waiting'] :
                                lizDict['geolocate.toolbar.stop']) :
                            lizDict['geolocate.toolbar.start']
                    }"
                    @click=${ () => mainLizmap.geolocation.toggleTracking()}
                    ?disabled=${mainLizmap.geolocation.isTracking && mainLizmap.geolocation.firstGeolocation}
                    >
                    ${mainLizmap.geolocation.isTracking ? html`
                    <svg width="24" height="24">
                        <use href="${lizUrls.svgSprite}#stop"/>
                    </svg>
                    ` : html`
                    <svg width="24" height="24">
                        <use href="${lizUrls.svgSprite}#start"/>
                    </svg>
                    `}
                    <span class="icon"></span>
                    ${mainLizmap.geolocation.isTracking ? (
                        mainLizmap.geolocation.firstGeolocation ?
                            lizDict['geolocate.toolbar.waiting'] :
                                lizDict['geolocate.toolbar.stop']) :
                            lizDict['geolocate.toolbar.start']
                    }
                </button>
                <button type="button"
                    class="btn-center btn btn-sm"
                    title="${lizDict['geolocate.toolbar.center']}"
                    @click=${ () => mainLizmap.geolocation.center()}
                    ?disabled=${
                        !mainLizmap.geolocation.isTracking |
                        mainLizmap.geolocation.isBind |
                        mainLizmap.geolocation.firstGeolocation
                    }>
                    <svg width="24" height="24">
                        <use href="${lizUrls.svgSprite}#crosshair"/>
                    </svg>
                    <span class="icon"></span>
                    ${lizDict['geolocate.toolbar.center']}
                </button>
                <div class="bind-group input-group input-group-sm">
                    <button type="button"
                        class="bind-btn btn btn-sm ${mainLizmap.geolocation.isBind ? 'active btn-success' : ''}"
                        title="${lizDict['geolocate.toolbar.bind']}"
                        @click=${() => mainLizmap.geolocation.toggleBind()}
                        ?disabled=${
                            !mainLizmap.geolocation.isTracking | mainLizmap.geolocation.firstGeolocation
                        }>
                        <svg width="24" height="24">
                            <use href="${lizUrls.svgSprite}#crosshair2"/>
                        </svg>
                        <span class="icon"></span>
                            ${lizDict['geolocate.toolbar.bind']}
                    </button>
                    <input
                        class="bind-control form-control form-control-sm"
                        title="${lizDict['geolocate.toolbar.interval']}"
                        type="number"
                        min="1"
                        ?disabled=${
                            !mainLizmap.geolocation.isBind ||
                            !mainLizmap.geolocation.isTracking
                        }
                        value="${mainLizmap.geolocation.bindIntervalInSecond}"
                        @input=${(event) => mainLizmap.geolocation.bindIntervalInSecond = parseInt(event.target.value)}
                        >
                    <span class="bind-text input-group-text">s</span>
                </div>
                ${mainLizmap.geolocation.displayDirection ? html`
                <button type="button"
                    class="btn-rotate-map btn btn-sm ${mainLizmap.geolocation.isRotatedView ? 'active btn-success' : ''}"
                    title="${lizDict['geolocate.toolbar.rotate']}"
                    @click=${() => mainLizmap.geolocation.toggleRotatedView()}
                    ?disabled=${
                            !mainLizmap.geolocation.isBind ||
                            !mainLizmap.geolocation.isTracking
                    }>
                    <svg width="24" height="24">
                        <use href="${lizUrls.svgSprite}#compass"/>
                    </svg>
                </button>
                ` : ''}
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
                'geolocation.isRotatedView',
                'geolocation.position',
                'geolocation.accuracy'
            ]
        );
    }

    disconnectedCallback() {
        this._closeBtn?.removeEventListener('click', this._closeHandler);
    }
}
