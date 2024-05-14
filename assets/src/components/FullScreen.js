/**
 * @module components/FullScreen.js
 * @name FullScreen
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { html, render } from 'lit-html';

import '../images/svg/fullscreen.svg';
import '../images/svg/fullscreen-exit.svg';

/**
 * @class
 * @name FullScreen
 * @augments HTMLElement
 */
export default class FullScreen extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Handle API support
        if (!this.requestFullscreen) {
            console.log('Your browser does not support the Fullscreen API');
            return;
        }
        // Get element selector
        const selector = this.getAttribute('selector');
        if (!selector) {
            console.warn('Fullscreen: a selector must be provided as an attribute for the element to work.');
            return;
        }

        this._elementFullscreened = document.querySelector(selector);
        if (!this._elementFullscreened) {
            console.warn('Fullscreen: the selected element does not exist.');
            return;
        }

        this._template = () =>
            html`
        <button @click=${() => document.fullscreenElement ? document.exitFullscreen() : this._elementFullscreened.requestFullscreen()}>
            ${document.fullscreenElement
                ? html`<svg><use xlink:href="#fullscreen-exit"></use></svg>`
                : html`<svg><use xlink:href="#fullscreen"></use></svg>`
            }
        </button>`;

        this._fullscreenchangeCallBack = () => render(this._template(), this);

        this._elementFullscreened.addEventListener("fullscreenchange", this._fullscreenchangeCallBack);

        render(this._template(), this);
    }

    disconnectedCallback() {
        this._elementFullscreened.removeEventListener("fullscreenchange", this._fullscreenchangeCallBack);
    }
}
