import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';

export default class Geolocation extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Display
        // Render positionTemplate and accuracyTemplate apart because their values might change a lot
        const positionTemplate = () => html`
            <div>X : ${mainLizmap.geolocation.position ? mainLizmap.geolocation.position[0].toString() : ''}</div>
            <div>Y : ${mainLizmap.geolocation.position ? mainLizmap.geolocation.position[1].toString() : ''}</div>`;

        const accuracyTemplate = () => html`
            <div>Accuracy (m) : ${mainLizmap.geolocation.accuracy}</div>`;

        const mainTemplate = () => html`
        <div class="menu-content">
            <div class="button-bar">
                <button class="btn btn-small btn-primary" @click=${ () => mainLizmap.geolocation.toggleTracking()}><span class="icon"></span>${mainLizmap.geolocation.isTracking ? 'Stop' : 'Start'}</button>
                <button class="btn btn-small btn-primary" @click=${ () => mainLizmap.geolocation.center()} ?disabled=${!mainLizmap.geolocation.isTracking | mainLizmap.geolocation.isBind}><span class="icon"></span>Center</button>
                <button class="btn btn-small btn-primary ${mainLizmap.geolocation.isBind ? 'active' : ''}" @click=${ () => mainLizmap.geolocation.toggleBind()} ?disabled=${!mainLizmap.geolocation.isTracking}><span class="icon"></span>Stay centered</button>
            </div>
            <div class="geolocation-infos">
                <div><small class="geolocation-coords">${positionTemplate()}</small></div>
                <div><small class="geolocation-accuracy">${accuracyTemplate()}</small></div>
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
                render(positionTemplate(), this.querySelector('.geolocation-coords'));
            },
            'geolocation.position'
        );

        mainEventDispatcher.addListener(
            () => {
                render(accuracyTemplate(), this.querySelector('.geolocation-accuracy'));
            },
            'geolocation.accuracy'
        );
    }

    disconnectedCallback() {
    }
}
