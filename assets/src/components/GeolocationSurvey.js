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
                    <button class="btn btn-primary ${mainLizmap.geolocationSurvey.beepMode ? 'active' : ''}" @click=${() => mainLizmap.geolocationSurvey.toggleBeepMode()}><i class="icon-music icon-white"></i></button>
                    <button class="btn btn-primary ${mainLizmap.geolocationSurvey.vibrateMode ? 'active' : ''}" @click=${() => mainLizmap.geolocationSurvey.toggleVibrateMode()}>📳</button>
                </div>
            </div>
            <div class="control-group">
                <label class="jforms-label control-label"><button class="btn btn-primary ${mainLizmap.geolocationSurvey.distanceMode ? 'active' : ''}" @click=${() => mainLizmap.geolocationSurvey.toggleDistanceMode()}>Distance&nbsp;(m)</button></label>
                <div class="controls">
                    <input class="jforms-ctrl-input input-small" type="number" min="0" @change=${ (event) => mainLizmap.geolocationSurvey.distanceLimit = parseInt(event.target.value)}>
                    ${mainLizmap.geolocationSurvey.distanceMode ? html`${mainLizmap.edition.lastSegmentLength}` : ''}
                </div>
            </div>
            <div class="control-group">
                <label class="jforms-label control-label"><button class="btn btn-primary ${mainLizmap.geolocationSurvey.timeMode ? 'active' : ''}" @click=${() => mainLizmap.geolocationSurvey.toggleTimeMode()}>Temps&nbsp;(s)</button></label>
                <div class="controls">
                    <input class="jforms-ctrl-input input-small" type="number" min="0" @change=${ (event) => mainLizmap.geolocationSurvey.timeLimit = parseInt(event.target.value)}>
                    ${mainLizmap.geolocationSurvey.timeMode ? html`${mainLizmap.geolocationSurvey.timeCount}` : ''}
                </div>
            </div>
            <div class="control-group">
                <label class="jforms-label control-label"><button class="btn btn-primary ${mainLizmap.geolocationSurvey.accuracyMode ? 'active' : ''}" @click=${() => mainLizmap.geolocationSurvey.toggleAccuracyMode()}>Accuracy&nbsp;(m)</button></label>
                <div class="controls">
                    <input class="jforms-ctrl-input input-small" type="number" min="0" @change=${ (event) => mainLizmap.geolocationSurvey.accuracyLimit = parseInt(event.target.value)}>
                    ${mainLizmap.geolocationSurvey.accuracyMode ? html`${mainLizmap.geolocation.accuracy}` : ''}
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
