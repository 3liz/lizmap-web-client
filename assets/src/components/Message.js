/**
 * @module components/Message.js
 * @name Message
 * @copyright 2024 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import {html, render} from 'lit-html';

/**
 * @class
 * @name Message
 * @augments HTMLElement
 */
export default class Message extends HTMLElement {
    constructor() {
        super();

        this.message = this.innerHTML;
        this.innerHTML = '';
        this.buttontext = this.getAttribute('buttontext') || '';
        this.type = this.getAttribute('type') || 'info';
        this.close = this.getAttribute('close') || true;
        this.timeout = this.getAttribute('timeout');
        this.placement = this.getAttribute('placement') || 'top';
        this.allowhtml = this.getAttribute('allowhtml') || true;
    }

    connectedCallback() {
        this._template = () => html`
            <button class="btn btn-sm" @click=${() => {
                // Remove previous message if any
                if (this.element) {
                    this.element.remove();
                    this.element = undefined;
                } else {
                    this.element = lizMap.addMessage(this.message, this.type, this.close, this.timeout);
                    this.element.bind('closed',  () => {
                        this.element = undefined;
                    });
                }
            }
            }>${this.buttontext}</button>
        `;

        render(this._template(), this);

        $('button', this).tooltip({
            title: this.message,
            placement: this.placement,
            html: this.allowhtml
        });
    }
}
