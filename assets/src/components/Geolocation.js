import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';

export default class Geolocation extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Listen click event
        document.querySelectorAll('#button-geolocation')[0].addEventListener('click', () => {
            mainLizmap.geolocation.startGeolocation();
        });

        // Display
        const myTemplate = () => html`
        <div class="menu-content">
    <div id=geolocation-coords><small>${mainLizmap.geolocation.position ? mainLizmap.geolocation.position[0].toString() + ', ' + mainLizmap.geolocation.position[1].toString() : ''}</small></div>
            <div class="button-bar">
                <button id="geolocation-stop" class="btn btn-small btn-primary" @click=${ () => mainLizmap.geolocation.toggleTracking()}><span class="icon"></span>${mainLizmap.geolocation.isTracking ? 'Stop' : 'Start'}</button>
                <button id="geolocation-center" class="btn btn-small btn-primary" @click=${ () => mainLizmap.geolocation.center()} ?disabled=${!mainLizmap.geolocation.isTracking | mainLizmap.geolocation.isBind}><span class="icon"></span>Center</button>
                <button id="geolocation-bind" class="btn btn-small btn-primary ${mainLizmap.geolocation.isBind ? 'active' : ''}" @click=${ () => mainLizmap.geolocation.toggleBind()} ?disabled=${!mainLizmap.geolocation.isTracking}><span class="icon"></span>Stay centered</button>
            </div>
            <div id="geolocation-edition-group" style="display:none; margin-top:5px;">
                <table>
                    <tr>
                        <td style="vertical-align: top;">
                            <span id="geolocation-edition-title" style="font-weight:bold"></span>
                        </td>
                        <td>
                            <label id="geolocation-edition-linked-label" class="checkbox"><input id="geolocation-edition-linked" type="checkbox" value="1" disabled="disabled"></label>
                            <button id="geolocation-edition-add" class="btn btn-small btn-primary" disabled="disabled"><span class="icon"></span></button>
                            <button id="geolocation-edition-submit" class="btn btn-small btn-primary" disabled="disabled"><span class="icon"></span></button>
                        </td>
                    </tr>
                </table>
            </div>
        </div>`;

        mainEventDispatcher.addListener(
            () => {
                render(myTemplate(), this);
            },
            'geolocation.isTracking'
        );

        mainEventDispatcher.addListener(
            () => {
                render(myTemplate(), this);
            },
            'geolocation.isBind'
        );

        mainEventDispatcher.addListener(
            () => {
                render(myTemplate(), this);
            },
            'geolocation.position'
        );

    }

    disconnectedCallback() {

    }
}
