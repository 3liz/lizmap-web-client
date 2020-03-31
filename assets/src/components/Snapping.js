import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';

export default class Snapping extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Display
        const mainTemplate = () => html`
        <div class="btn-group">
            <button class="btn ${mainLizmap.snapping.config !== undefined ? '' : 'hide'} ${mainLizmap.snapping.active ? 'active btn-success' : ''}" @click=${ () => mainLizmap.snapping.toggle() }>Snapping</button>
            <button class="btn">R</button>
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
