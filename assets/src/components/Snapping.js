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
        <div class="btn-group ${mainLizmap.snapping.config !== undefined ? '' : 'hide'}">
            <button class="btn ${mainLizmap.snapping.active ? 'active btn-success' : ''}" @click=${ () => mainLizmap.snapping.toggle() }>Snapping</button>
            <button class="btn" ?disabled=${true}>
                <svg width="14" height="14">
                    <use xlink:href="#refresh"/>
                </svg>
            </button>
        </div>`;

        render(mainTemplate(), this);

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            [
                'snapping.config',
                'snapping.active'
            ]
        );
    }

    disconnectedCallback() {
    }
}
