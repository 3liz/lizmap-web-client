import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';

export default class Snapping extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Display
        const mainTemplate = () => html`
        <div>
        </div>`;

        render(mainTemplate(), this);

    }

    disconnectedCallback() {
    }
}
