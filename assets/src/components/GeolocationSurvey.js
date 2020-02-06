import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';

export default class GeolocationSurvey extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const mainTemplate = () => html`
        <div class="control-group ${mainLizmap.geolocation.isLinkedToEdition ? '' : 'hide'}">
            <label class="jforms-label control-label" for="geolocation-survey-distance">Distance :</label>
            <div class="controls">
                <input id="geolocation-survey-distance" class="jforms-ctrl-input" value="" type="text">
            </div>
        </div>`;

        render(mainTemplate(), this);

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            'geolocation.isLinkedToEdition'
        );
    }

    disconnectedCallback() {
    }
}
