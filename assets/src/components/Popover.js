/**
 * @module components/Popover.js
 * @name Popover
 * @copyright 2024 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import bsPopover from 'bootstrap/js/dist/popover.js';

/**
 * @class
 * @name Popover
 * @augments HTMLElement
 */
export default class Popover extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        const aElement = document.createElement("a");

        aElement.textContent = this.getAttribute('pop-text') || "";
        aElement.setAttribute('data-bs-title', this.getAttribute('pop-title') || "");
        aElement.setAttribute('data-bs-content', this.getAttribute('pop-content') || "");

        aElement.classList.add('btn', 'btn-sm', 'btn-outline-success');
        aElement.setAttribute('tabindex', '0');
        aElement.setAttribute('role', 'button');
        aElement.setAttribute('data-bs-toggle', 'popover');

        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', '/assets/css/custom-bootstrap5.css');
        this.shadowRoot.appendChild(link);

        shadow.appendChild(aElement);

        this._popover = new bsPopover(aElement, {
            container: shadow,
            trigger: 'focus',
            html: true,
        });
    }
}