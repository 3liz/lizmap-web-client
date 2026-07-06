/**
 * @module components/Panoramax.js
 * @name Panoramax
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */
import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { PNX_DATE_PALETTE } from '../modules/Panoramax.js';
import { html, render } from 'lit-html';

const DEFAULT_PANORAMAX_URL = 'https://panoramax.openstreetmap.fr/api';

/**
 * @class
 * @name Panoramax
 * @augments HTMLElement
 * @classdesc
 * Dock content for the Panoramax tool. It embeds the `<pnx-photo-viewer>` web
 * component (lazy-loaded the first time the dock is opened) and connects it to
 * the `Panoramax` map module (`mainLizmap.panoramax`):
 * - a click on the coverage layer asks the viewer to load the matching picture,
 * - the picture position/orientation drives the arrow drawn on the map.
 */
export default class Panoramax extends HTMLElement {
    constructor() {
        super();
        this._viewer = null;
        this._psv = null;
    }

    connectedCallback() {
        // Cached suggestions from the last account search (used for UUID lookup).
        this._accounts = [];
        this._searchDebounce = null;
        this._searchAbort = null;

        // Toggle the tool when its dock (whatever its location) is opened/closed.
        this._dockHandler = (e) => {
            if (e.id !== 'panoramax') {
                return;
            }
            if (typeof e.type === 'string' && e.type.endsWith('opened')) {
                this._open();
            } else {
                this._close();
            }
        };
        this._dockEvents = {
            dockopened: this._dockHandler,
            dockclosed: this._dockHandler,
            minidockopened: this._dockHandler,
            minidockclosed: this._dockHandler,
            bottomdockopened: this._dockHandler,
            bottomdockclosed: this._dockHandler,
            rightdockopened: this._dockHandler,
            rightdockclosed: this._dockHandler,
        };
        lizMap.events.on(this._dockEvents);

        // A picture has been selected by clicking the coverage layer on the map.
        this._onPictureSelected = (e) => {
            if (!this._viewer) {
                return;
            }
            this._viewer.select(e.seqId || null, e.picId || null);
        };
        mainEventDispatcher.addListener(this._onPictureSelected, 'panoramax.picture.selected');

        // No precise picture id: load the picture closest to the clicked position.
        this._onPositionSelected = (e) => {
            if (!this._psv) {
                return;
            }
            this._psv.goToPosition(e.lat, e.lon);
        };
        mainEventDispatcher.addListener(this._onPositionSelected, 'panoramax.position.selected');

        // Date filter: read both inputs and push the new range to the module.
        this._onDateChange = () => {
            const start = this.querySelector('input[data-filter="start"]')?.value || null;
            const end   = this.querySelector('input[data-filter="end"]')?.value   || null;
            mainLizmap.panoramax?.setDateFilter(start, end);
        };

        // Picture type filter: push the selected value (or null) to the module.
        this._onTypeChange = () => {
            const type = this.querySelector('select[data-filter="type"]')?.value || null;
            mainLizmap.panoramax?.setTypeFilter(type);
        };

        // Style mode selector: switch between 'classic' and 'date' rendering.
        this._onStyleModeChange = () => {
            const mode = this.querySelector('select[data-style="mode"]')?.value || 'classic';
            mainLizmap.panoramax?.setStyleMode(mode);
            const legend = this.querySelector('.panoramax-date-legend');
            if (legend) { legend.classList.toggle('d-none', mode !== 'date'); }
        };

        // Account filter: apply immediately from cache if exact match, then debounce
        // a search request against the Panoramax API to refresh the datalist.
        this._onAccountInput = () => {
            const input = this.querySelector('input[data-filter="account"]');
            const val = (input?.value || '').trim();

            if (this._searchAbort) {
                this._searchAbort.abort();
                this._searchAbort = null;
            }
            clearTimeout(this._searchDebounce);

            if (!val) {
                this._accounts = [];
                const datalist = this.querySelector('#pnx-accounts-list');
                if (datalist) { datalist.replaceChildren(); }
                mainLizmap.panoramax?.setAccountFilter(null);
                return;
            }

            // Exact match in the current suggestions (e.g. the user picked a value
            // from the datalist): apply the filter and skip any further API request.
            const cached = this._accounts.find(a => a.name === val);
            if (cached) {
                mainLizmap.panoramax?.setAccountFilter(cached.id);
                return;
            }
            mainLizmap.panoramax?.setAccountFilter(null);

            // Debounced API search to refresh the datalist.
            this._searchDebounce = setTimeout(async () => {
                const abort = new AbortController();
                this._searchAbort = abort;
                const accounts = await mainLizmap.panoramax?.searchAccounts(val, abort.signal) || [];
                if (abort.signal.aborted) { return; }
                this._searchAbort = null;
                this._accounts = accounts;

                const datalist = this.querySelector('#pnx-accounts-list');
                if (!datalist) { return; }
                const frag = document.createDocumentFragment();
                for (const { name } of accounts) {
                    const opt = document.createElement('option');
                    opt.value = name;
                    frag.appendChild(opt);
                }
                datalist.replaceChildren(frag);

                // Re-check for exact match now that the list is updated.
                const currentInput = this.querySelector('input[data-filter="account"]');
                const currentVal = (currentInput?.value || '').trim();
                const exact = accounts.find(a => a.name === currentVal);
                mainLizmap.panoramax?.setAccountFilter(exact ? exact.id : null);
            }, 300);
        };
    }

    disconnectedCallback() {
        lizMap.events.off(this._dockEvents);
        mainEventDispatcher.removeListener(this._onPictureSelected, 'panoramax.picture.selected');
        mainEventDispatcher.removeListener(this._onPositionSelected, 'panoramax.position.selected');
        clearTimeout(this._searchDebounce);
        if (this._searchAbort) { this._searchAbort.abort(); }
        this._unwirePSV();
        if (this._viewer && typeof this._viewer.destroy === 'function') {
            this._viewer.destroy();
        }
        this._viewer = null;
    }

    /**
     * Open the tool: activate the map module, and lazy-load + render the viewer
     * the first time.
     */
    async _open() {
        const module = mainLizmap.panoramax;
        if (!module) {
            return;
        }
        module.activate();

        if (this._viewer) {
            return;
        }

        const endpoint = mainLizmap.config.options.panoramaxUrl || DEFAULT_PANORAMAX_URL;
        this._externalBaseUrl = new URL(endpoint).origin;
        this._currentLon = null;
        this._currentLat = null;

        // Lazy-load the Panoramax viewer bundle in its own chunk (only when used).
        // Importing the package registers the <pnx-photo-viewer> custom element.
        await import(/* webpackChunkName: 'panoramax-viewer' */ '@panoramax/web-viewer');

        render(
            html`
            <div class="d-flex flex-column">
                <pnx-photo-viewer
                    class="panoramax-viewer"
                    endpoint="${endpoint}"
                    url-parameters="false"
                    widgets="false"
                ></pnx-photo-viewer>
                <div class="panoramax-filters border-top flex-shrink-0">
                    <div class="d-flex align-items-center justify-content-between px-2 py-1">
                        <span class="fw-semibold small"><i class="icon-filter"></i></span>
                        <a class="panoramax-open-external btn btn-sm btn-link p-0 d-none"
                           target="_blank" rel="noopener noreferrer">${lizDict['panoramax.open.external']}</a>
                    </div>
                    <div class="d-flex align-items-center gap-2 px-2 py-1">
                        <i class="icon-calendar text-muted flex-shrink-0"></i>
                        <input type="date" class="form-control form-control-sm" data-filter="start"
                            aria-label="${lizDict['panoramax.filter.date.start']}"
                            title="${lizDict['panoramax.filter.date.start']}"
                            @change=${this._onDateChange}>
                        <span class="text-muted fs-4">⇨</span>
                        <input type="date" class="form-control form-control-sm" data-filter="end"
                            aria-label="${lizDict['panoramax.filter.date.end']}"
                            title="${lizDict['panoramax.filter.date.end']}"
                            @change=${this._onDateChange}>
                    </div>
                    <div class="d-flex align-items-center gap-2 px-2 pb-1">
                        <i class="icon-picture text-muted flex-shrink-0"></i>
                        <select class="form-select form-select-sm w-auto" data-filter="type"
                            aria-label="${lizDict['panoramax.filter.type']}"
                            title="${lizDict['panoramax.filter.type']}"
                            @change=${this._onTypeChange}>
                            <option value="">—</option>
                            <option value="flat">${lizDict['panoramax.filter.type.flat']}</option>
                            <option value="equirectangular">360°</option>
                        </select>
                    </div>
                    <div class="d-flex align-items-center gap-2 px-2 pb-1">
                        <i class="icon-user text-muted flex-shrink-0"></i>
                        <input type="text" class="form-control form-control-sm" data-filter="account"
                            aria-label="${lizDict['panoramax.filter.account']}"
                            title="${lizDict['panoramax.filter.account']}"
                            placeholder="${lizDict['panoramax.filter.account.placeholder']}"
                            list="pnx-accounts-list"
                            autocomplete="off"
                            @input=${this._onAccountInput}>
                        <datalist id="pnx-accounts-list"></datalist>
                    </div>
                </div>
                <div class="panoramax-map-style border-top flex-shrink-0 bg-body-tertiary px-2 py-2">
                    <div class="d-flex align-items-center gap-2">
                        <i class="icon-adjust text-muted flex-shrink-0"></i>
                        <span class="small text-muted flex-shrink-0">${lizDict['panoramax.layer.style']}</span>
                        <select class="form-select form-select-sm w-auto" data-style="mode"
                            aria-label="${lizDict['panoramax.layer.style']}"
                            @change=${this._onStyleModeChange}>
                            <option value="classic">${lizDict['panoramax.layer.style.classic']}</option>
                            <option value="date">${lizDict['panoramax.layer.style.date']}</option>
                        </select>
                    </div>
                    <div class="panoramax-date-legend d-none mt-2">
                        <div class="d-flex flex-column gap-1 small">
                            ${[
                                { color: PNX_DATE_PALETTE[3], label: lizDict['panoramax.layer.style.age.4'] },
                                { color: PNX_DATE_PALETTE[2], label: lizDict['panoramax.layer.style.age.3'] },
                                { color: PNX_DATE_PALETTE[1], label: lizDict['panoramax.layer.style.age.2'] },
                                { color: PNX_DATE_PALETTE[0], label: lizDict['panoramax.layer.style.age.1'] },
                            ].map(({ color, label }) => html`
                                <div class="d-flex align-items-center gap-2">
                                    <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${color};border:1px solid rgba(0,0,0,.2);flex-shrink:0"></span>
                                    <span class="text-muted">${label}</span>
                                </div>
                            `)}
                        </div>
                    </div>
                </div>
            </div>`,
            this
        );
        this._viewer = this.querySelector('pnx-photo-viewer');

        // Wire the inner Photo (Photo Sphere Viewer) events once it is ready.
        this._viewer.oncePSVReady().then(() => {
            this._wirePSV();
        });
    }

    /**
     * Close the tool: deactivate the map module (stops click handling, hides arrow).
     */
    _close() {
        if (mainLizmap.panoramax) {
            mainLizmap.panoramax.deactivate();
        }
    }

    /**
     * Listen to the photo viewer events to drive the map arrow.
     */
    _wirePSV() {
        if (!this._viewer || this._psv) {
            return;
        }
        this._psv = this._viewer.psv;
        if (!this._psv) {
            return;
        }

        // A picture is (being) loaded: place and orient the arrow.
        // detail = { picId, lon, lat, x (heading 0-360°, 0 = North), y, z, first }
        this._onPicture = (ev) => {
            const d = ev.detail || {};
            mainLizmap.panoramax?.updateArrow(d.lon, d.lat, d.x);
            if (typeof d.lon === 'number') { this._currentLon = d.lon; }
            if (typeof d.lat === 'number') { this._currentLat = d.lat; }
            this._updateExternalLink();
            if (ev.type === 'picture-loaded') {
                const seqId = this._psv.getPictureMetadata()?.sequence?.id || null;
                mainLizmap.panoramax?.setSelectedSequence(seqId);
            }
        };
        // The user rotated the view: update only the arrow heading.
        // detail = { x (heading 0-360°, 0 = North), y, z }
        this._onViewRotated = (ev) => {
            const d = ev.detail || {};
            mainLizmap.panoramax?.updateHeading(d.x);
            this._updateExternalLink();
        };

        this._psv.addEventListener('picture-loading', this._onPicture);
        this._psv.addEventListener('picture-loaded', this._onPicture);
        this._psv.addEventListener('view-rotated', this._onViewRotated);
    }

    /**
     * Remove the photo viewer event listeners.
     */
    _unwirePSV() {
        if (!this._psv) {
            return;
        }
        this._psv.removeEventListener('picture-loading', this._onPicture);
        this._psv.removeEventListener('picture-loaded', this._onPicture);
        this._psv.removeEventListener('view-rotated', this._onViewRotated);
        this._psv = null;
        const link = this.querySelector('a.panoramax-open-external');
        if (link) { link.classList.add('d-none'); }
        this._currentLon = null;
        this._currentLat = null;
    }

    /**
     * Build and set the href of the "Open in Panoramax" link from the current
     * viewer state (picture id, sequence id, position, heading/pitch/zoom).
     */
    _updateExternalLink() {
        const link = this.querySelector('a.panoramax-open-external');
        if (!link || !this._psv) { return; }

        const picId = this._psv.getPictureId();
        if (!picId || this._currentLon === null || this._currentLat === null) {
            link.classList.add('d-none');
            return;
        }

        const seqId = this._psv.getPictureMetadata()?.sequence?.id;
        const { x, y, z } = this._psv.getXYZ();
        const zoom = 17;
        const lat = this._currentLat.toFixed(6);
        const lon = this._currentLon.toFixed(6);
        const xStr = x.toFixed(2);
        const yStr = y.toFixed(2);
        const zStr = Math.round(z || 0);

        const styleMode = this.querySelector('select[data-style="mode"]')?.value || 'classic';

        let url = `${this._externalBaseUrl}/?focus=pic&map=${zoom}/${lat}/${lon}&pic=${picId}`;
        if (seqId) { url += `&seq=${seqId}`; }
        url += `&xyz=${xStr}/${yStr}/${zStr}`;
        if (styleMode === 'date') { url += '&theme=age'; }

        link.href = url;
        link.classList.remove('d-none');
    }
}
