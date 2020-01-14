import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';

export default class Geolocation extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Display
        const positionTemplate = () => html`
        <small>${mainLizmap.geolocation.position ? mainLizmap.geolocation.position[0].toString() + ', ' + mainLizmap.geolocation.position[1].toString() : ''}</small>`;

        const mainTemplate = () => html`
        <div class="menu-content">
            <div id=geolocation-coords>${positionTemplate()}</div>
            <div class="button-bar">
                <button id="geolocation-stop" class="btn btn-small btn-primary" @click=${ () => mainLizmap.geolocation.toggleTracking()}><span class="icon"></span>${mainLizmap.geolocation.isTracking ? 'Stop' : 'Start'}</button>
                <button id="geolocation-center" class="btn btn-small btn-primary" @click=${ () => mainLizmap.geolocation.center()} ?disabled=${!mainLizmap.geolocation.isTracking | mainLizmap.geolocation.isBind}><span class="icon"></span>Center</button>
                <button id="geolocation-bind" class="btn btn-small btn-primary ${mainLizmap.geolocation.isBind ? 'active' : ''}" @click=${ () => mainLizmap.geolocation.toggleBind()} ?disabled=${!mainLizmap.geolocation.isTracking}><span class="icon"></span>Stay centered</button>
            </div>
        </div>`;

        render(mainTemplate(), this);

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            'geolocation.isTracking'
        );

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            'geolocation.isBind'
        );

        mainEventDispatcher.addListener(
            () => {
                render(positionTemplate(), document.getElementById('geolocation-coords'));
            },
            'geolocation.position'
        );
    }

    disconnectedCallback() {
    }
}
