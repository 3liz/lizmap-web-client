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
            ${mainLizmap.hasEditionLayers
            ? html`
            <div id="geolocation-edition-group" class="${mainLizmap.lizmapEditionDrawFeatureActivated ? '' : 'hide'}" style="margin-top:5px;">
                <div>
                    <strong style="vertical-align: top;">Edition&nbsp;:</strong>
                    <div style="display:inline-block">
                        <button class="btn btn-small btn-primary ${mainLizmap.geolocation.hasEditionLinked ? 'active' : ''}" @click=${() => mainLizmap.geolocation.toggleEditionLinked()}>Linked</button>
                        <div style="padding-top: 5px;">
                            <button id="geolocation-edition-add" class="btn btn-small btn-primary" ?disabled=${!mainLizmap.geolocation.hasEditionLinked}><span class="icon"></span>Add</button>
                            <button id="geolocation-edition-submit" class="btn btn-small btn-primary" ?disabled=${!mainLizmap.geolocation.hasEditionLinked}><span class="icon"></span>Finalize</button>
                        </div>
                    </div>
                </div>
            </div>`
            : ''
            }
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

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            'lizmapEditionDrawFeatureChanged'
        );

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            'geolocation.hasEditionLinked'
        );
    }

    disconnectedCallback() {
    }
}
