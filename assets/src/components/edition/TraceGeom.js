/**
 * @module components/edition/TraceGeom.js
 * @name TraceGeom
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from '../../modules/Globals.js';
import EditionTrace from '../../modules/EditionTrace.js';
import { html, render } from 'lit-html';

/**
 * Web component to trace the snapping features while drawing,
 * with an optional offset distance
 * @class
 * @name TraceGeom
 * @augments HTMLElement
 */
export default class TraceGeom extends HTMLElement {
    constructor() {
        super();
        this._events = [
            'edition.trace.changed',
            'edition.drawFeatureActivated',
            'edition.formDisplayed',
            'edition.formClosed',
            'snapping.config',
        ];
    }

    connectedCallback() {
        const t = EditionTrace.translate;
        // Tooltip is initialized on the inner <button>, the wrapper must not carry
        // data-bs-toggle/data-bs-title attributes (see PasteGeom)
        const template = () => {
            const trace = mainLizmap?.editionTrace;
            const available = trace?.available ?? false;
            const active = trace?.active ?? false;
            return html`
            <!-- Not disabled when unavailable: a disabled button shows no tooltip,
                 the click explains why tracing can not be used -->
            <button
                type="button"
                class="btn btn-sm edition-trace-toggle ${active ? 'active btn-primary' : ''} ${available || active ? '' : 'edition-trace-unavailable'}"
                data-bs-toggle="tooltip"
                data-bs-title="${t('edition.geom.trace')}"
                aria-disabled="${available || active ? 'false' : 'true'}"
                @click=${() => trace?.toggle()}>
                <svg>
                    <use href="${lizUrls.svgSprite}#mActionTracing"/>
                </svg>
            </button>
            ${active ? html`
            <div class="input-group input-group-sm edition-trace-offset-group">
                <input
                    type="number"
                    step="any"
                    class="form-control edition-trace-offset"
                    title="${t('edition.trace.offset.help')}"
                    aria-label="${t('edition.trace.offset')}"
                    .value=${String(trace.offset)}
                    @change=${event => trace.offset = event.target.value}
                    @keydown=${event => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            event.target.blur();
                        }
                    }}
                    >
                <span class="input-group-text">m</span>
            </div>` : ''}`;
        };

        this._render = () => render(template(), this);
        // Listen first: nothing below must prevent the component from updating
        mainEventDispatcher.addListener(this._render, this._events);
        this._render();

        this.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipTriggerEl => {
            new bootstrap.Tooltip(tooltipTriggerEl, { trigger: 'hover' });
        });
    }

    disconnectedCallback() {
        mainEventDispatcher.removeListener(this._render, this._events);
    }
}
