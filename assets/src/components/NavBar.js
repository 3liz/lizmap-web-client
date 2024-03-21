/**
 * @module components/NavBar.js
 * @name NavBar
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap } from '../modules/Globals.js';
import { html, render } from 'lit-html';

/**
 * @class
 * @name NavBar
 * @augments HTMLElement
 */
export default class NavBar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Display
        const mainTemplate = () => html`
            <button class="btn pan active" title="${lizDict['navbar.pan.hover']}"></button>
            <button class="btn zoom" title="${lizDict['navbar.zoom.hover']}"></button>
            <button class="btn zoom-extent" title="${lizDict['navbar.zoomextent.hover']}"></button>
            <button class="btn zoom-in" title="${lizDict['navbar.zoomin.hover']}"></button>
            <div class="slider" title="${lizDict['navbar.slider.hover']}"></div>
            <button class="btn zoom-out" title="${lizDict['navbar.zoomout.hover']}"></button>
        `;

        render(mainTemplate(), this);
    }

    disconnectedCallback() {
    }
}
