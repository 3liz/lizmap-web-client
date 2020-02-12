import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';

export default class GeolocationSurvey extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const mainTemplate = () => html`
        <div class="control-group ${mainLizmap.geolocation.isLinkedToEdition && ['line', 'polygon'].includes(mainLizmap.edition.layerGeometry)  ? '' : 'hide'}">
            <label class="jforms-label control-label"><button class="btn btn-primary ${mainLizmap.geolocationSurvey.distanceMode ? 'active' : ''}" @click=${() => mainLizmap.geolocationSurvey.toggleDistanceMode()}>Distance</button></label>
            <div class="controls">
                <input id="geolocation-survey-distance" class="jforms-ctrl-input input-small" type="number" min="0" @change=${ (event) => mainLizmap.geolocationSurvey.distanceLimit = parseInt(event.target.value)} ?disabled=${!mainLizmap.geolocationSurvey.distanceMode}>
                ${mainLizmap.edition.lastSegmentLength}
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
                if (mainLizmap.geolocationSurvey.distanceMode){
                    render(mainTemplate(), this);
                }
            },
            'edition.lastSegmentLength'
        );

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            'geolocationSurvey.distanceMode'
        );
    }

    disconnectedCallback() {
    }
}
