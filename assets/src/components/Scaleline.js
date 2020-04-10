import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';
import 'ol/ol.css';

export default class Scaleline extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Display

        // const mainTemplate = () => html`
        // <div id="olScaleline">
        // </div>`;

        // render(mainTemplate(), this);

    }

    disconnectedCallback() {
    }
}
