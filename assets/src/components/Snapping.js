import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';
import '../images/svg/refresh.svg';

export default class Snapping extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Display
        const mainTemplate = () => html`
        <div class="${mainLizmap.snapping.config !== undefined ? '' : 'hide'}">
            <h3>${lizDict['snapping.title']}</h3>
            <div class="control-group">
                <div class="controls">
                    <div class="btn-group">
                        <button class="btn ${mainLizmap.snapping.active ? 'active btn-success' : ''}" @click=${() => mainLizmap.snapping.toggle()}>${mainLizmap.snapping.active ? lizDict['geolocate.toolbar.stop'] : lizDict['geolocate.toolbar.start']}</button>
                        <button class="btn ${mainLizmap.snapping._snapLayersRefreshable ? 'btn-warning' : ''}" ?disabled=${!mainLizmap.snapping._snapLayersRefreshable} @click=${() => mainLizmap.snapping.getSnappingData() }>
                            <svg width="14" height="14">
                                <use xlink:href="#refresh"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        <div>`;

        render(mainTemplate(), this);

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            [
                'snapping.config',
                'snapping.active',
                'snapping.refreshable'
            ]
        );
    }

    disconnectedCallback() {
    }
}
