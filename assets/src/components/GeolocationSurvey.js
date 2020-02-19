import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';
import {html, render} from 'lit-html';

export default class GeolocationSurvey extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const mainTemplate = () => html`
        <div class="${mainLizmap.geolocation.isTracking && mainLizmap.geolocation.isLinkedToEdition && ['line', 'polygon'].includes(mainLizmap.edition.layerGeometry) ? '' : 'hide'}">
            <div class="control-group" style="text-align:center">
                <div class="btn-group">
                    <button class="btn ${mainLizmap.geolocationSurvey.beepMode ? 'active btn-success' : ''}" @click=${() => mainLizmap.geolocationSurvey.toggleBeepMode()}><i class="icon-music"></i></button>
                    <button class="btn ${mainLizmap.geolocationSurvey.vibrateMode ? 'active btn-success' : ''}" @click=${() => mainLizmap.geolocationSurvey.toggleVibrateMode()}>📳</button>
                </div>
            </div>
            <div class="control-group">
                <label class="jforms-label control-label"><button class="btn ${mainLizmap.geolocationSurvey.distanceMode ? 'active btn-success' : ''}" @click=${() => mainLizmap.geolocationSurvey.toggleDistanceMode()}>Distance</button></label>
                <div class="controls">
                    <div class="input-append">
                        <input class="jforms-ctrl-input input-mini" type="number" min="0" @change=${ (event) => mainLizmap.geolocationSurvey.distanceLimit = parseInt(event.target.value)}><span class="add-on">m</span>
                    </div>
                    ${mainLizmap.geolocationSurvey.distanceMode ? html`${mainLizmap.edition.lastSegmentLength}` : ''}
                </div>
            </div>
            <div class="control-group">
                <label class="jforms-label control-label"><button class="btn ${mainLizmap.geolocationSurvey.timeMode ? 'active btn-success' : ''}" @click=${() => mainLizmap.geolocationSurvey.toggleTimeMode()}>Time</button></label>
                <div class="controls">
                    <div class="input-append">
                        <input class="jforms-ctrl-input input-mini" type="number" min="0" @change=${ (event) => mainLizmap.geolocationSurvey.timeLimit = parseInt(event.target.value)}><span class="add-on">s</span>
                    </div>
                    ${mainLizmap.geolocationSurvey.timeMode ? html`${mainLizmap.geolocationSurvey.timeCount}` : ''}
                </div>
            </div>
            <div class="control-group">
                <label class="jforms-label control-label"><button class="btn ${mainLizmap.geolocationSurvey.accuracyMode ? 'active btn-success' : ''}" @click=${() => mainLizmap.geolocationSurvey.toggleAccuracyMode()}>Accuracy</button></label>
                <div class="controls">
                    <div class="input-append">
                        <input class="jforms-ctrl-input input-mini" type="number" min="0" @change=${ (event) => mainLizmap.geolocationSurvey.accuracyLimit = parseInt(event.target.value)}><span class="add-on">m</span>
                    </div>
                    ${mainLizmap.geolocationSurvey.accuracyMode ? html`${mainLizmap.geolocation.accuracy}` : ''}
                </div>
            </div>
            <div class="control-group">
                <label class="jforms-label control-label"><button class="btn ${mainLizmap.geolocationSurvey.averageRecordMode ? 'active btn-success' : ''}" @click=${() => mainLizmap.geolocationSurvey.toggleAverageRecordMode()}>Average</button></label>
                <div class="controls">
                    <div class="input-append">
                        <input class="jforms-ctrl-input input-mini" type="number" min="0" @change=${ (event) => mainLizmap.geolocationSurvey.averageRecordLimit = parseInt(event.target.value)}><span class="add-on">s</span>
                    </div>
                </div>
            </div>
        </div>`;

        render(mainTemplate(), this);

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            'geolocation.isLinkedToEdition'
        );

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            'geolocation.isTracking'
        );

        mainEventDispatcher.addListener(
            () => {
                if (mainLizmap.geolocationSurvey.distanceMode) {
                    render(mainTemplate(), this);
                }
            },
            'edition.lastSegmentLength'
        );

        mainEventDispatcher.addListener(
            () => {
                if (mainLizmap.geolocationSurvey.accuracyMode) {
                    render(mainTemplate(), this);
                }
            },
            'geolocation.accuracy'
        );

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            'geolocationSurvey.distanceMode'
        );

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            'geolocationSurvey.timeMode'
        );

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            'geolocationSurvey.timeCount'
        );

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            'geolocationSurvey.accuracyMode'
        );

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            'geolocationSurvey.averageRecordMode'
        );

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            'geolocationSurvey.beepMode'
        );

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            'geolocationSurvey.vibrateMode'
        );
    }

    disconnectedCallback() {
    }
}
