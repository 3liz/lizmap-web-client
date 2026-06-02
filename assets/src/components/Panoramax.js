/**
 * @module components/Panoramax.js
 * @name Panoramax
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */
import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
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
    }

    disconnectedCallback() {
        lizMap.events.off(this._dockEvents);
        mainEventDispatcher.removeListener(this._onPictureSelected, 'panoramax.picture.selected');
        mainEventDispatcher.removeListener(this._onPositionSelected, 'panoramax.position.selected');
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

        // Lazy-load the Panoramax viewer bundle in its own chunk (only when used).
        // Importing the package registers the <pnx-photo-viewer> custom element.
        await import(/* webpackChunkName: 'panoramax-viewer' */ '@panoramax/web-viewer');

        render(
            html`
            <div class="d-flex flex-column h-100">
                <pnx-photo-viewer
                    class="panoramax-viewer"
                    endpoint="${endpoint}"
                ></pnx-photo-viewer>
                <div class="panoramax-date-filter d-flex align-items-center gap-2 px-2 py-1 border-top flex-shrink-0">
                    <input type="date" class="form-control form-control-sm" data-filter="start"
                        aria-label="Start date" title="Start date"
                        @change=${this._onDateChange}>
                    <span class="text-muted">→</span>
                    <input type="date" class="form-control form-control-sm" data-filter="end"
                        aria-label="End date" title="End date"
                        @change=${this._onDateChange}>
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
        };
        // The user rotated the view: update only the arrow heading.
        // detail = { x (heading 0-360°, 0 = North), y, z }
        this._onViewRotated = (ev) => {
            const d = ev.detail || {};
            mainLizmap.panoramax?.updateHeading(d.x);
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
    }
}
