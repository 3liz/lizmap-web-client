/**
 * @module components/LayerCompare.js
 * @name LayerCompare
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */

import { mainLizmap } from '../modules/Globals.js';
import { html, render } from 'lit-html';

import TileLayer from 'ol/layer/Tile.js';
import TileWMS from 'ol/source/TileWMS.js';
import { getRenderPixel } from 'ol/render.js';
import RenderEvent from 'ol/render/Event.js';
import WMSCapabilities from 'ol/format/WMSCapabilities.js';

/**
 * A layer that can be shown on one side of the divider.
 * @typedef {object} CompareCandidate
 * @property {string} name - Layer name
 * @property {string} title - Title displayed in the lists
 * @property {object} olLayer - OpenLayers layer (ol/layer/Base)
 */

/**
 * Layer comparator (swipe): displays one layer on the left of a draggable
 * divider and another one on the right.
 *
 * Compared layers are rendered by dedicated OpenLayers layers added to the
 * tools group. They share the source of the project layers, so the layer
 * tree state is never modified. External WMS layers can also be added,
 * by reading the WMS capabilities and picking a layer, or with an
 * `url|layer` or `Title|wms|url|layer` line.
 * @class
 * @name LayerCompare
 * @augments HTMLElement
 */
export default class LayerCompare extends HTMLElement {
    constructor() {
        super();

        this._active = false;
        this._position = 50;
        this._leftName = '';
        this._rightName = '';
        // External WMS layers added by the user: name => {title, olLayer}
        this._externalLayers = new Map();
        this._compareLayers = [];
        this._divider = null;
        // Layers read from the WMS capabilities: [{name, title}]
        this._wmsLayers = [];
        this._wmsUrl = '';
        this._loading = false;
    }

    connectedCallback() {
        this._dockHandler = (e) => {
            if (e.id !== 'layercompare') {
                return;
            }
            if (e.type === 'minidockopened') {
                this._render();
            } else {
                this.deactivate();
            }
        };
        lizMap.events.on({
            minidockopened: this._dockHandler,
            minidockclosed: this._dockHandler,
        });
        // Close button of the mini-dock title, like the other tools
        this._stopHandler = () => document.getElementById('button-layercompare')?.click();
        document.getElementById('layercompare-stop')?.addEventListener('click', this._stopHandler);
        this._render();
    }

    disconnectedCallback() {
        this.deactivate();
        lizMap.events.off({
            minidockopened: this._dockHandler,
            minidockclosed: this._dockHandler,
        });
        document.getElementById('layercompare-stop')?.removeEventListener('click', this._stopHandler);
    }

    /**
     * Candidate layers for comparison: base layers, overlay layers and
     * external WMS layers added in the tool.
     * @type {CompareCandidate[]}
     */
    get candidates() {
        const map = mainLizmap.map;
        const list = [];
        const seen = new Set();
        const push = (olLayer, title) => {
            const name = olLayer.get('name');
            // Layer groups and nameless layers cannot be cloned
            if (!name || seen.has(name) || typeof olLayer.getSource !== 'function' || !olLayer.getSource()) {
                return;
            }
            seen.add(name);
            list.push({ name, title: title || name, olLayer });
        };

        for (const [name, ext] of this._externalLayers) {
            push(ext.olLayer, ext.title);
            seen.add(name);
        }
        map.baseLayersGroup.getLayers().forEach(olLayer => {
            let title;
            try {
                title = mainLizmap.state.baseLayers.getBaseLayerByName(olLayer.get('name'))?.title;
            } catch { /* not a known base layer */ }
            push(olLayer, title);
        });
        map.overlayLayers.forEach(olLayer => {
            let title;
            try {
                title = mainLizmap.state.layersAndGroupsCollection.getLayerOrGroupByName(olLayer.get('name'))?.wmsTitle;
            } catch { /* not a project layer */ }
            push(olLayer, title);
        });
        return list;
    }

    /**
     * Add an external WMS layer to the candidates.
     * @param {string} url - WMS URL, or a `Title|wms|url|layer` line
     * @param {string} [layerName] - WMS layer name
     * @param {string} [title] - Displayed title
     * @returns {string|null} the candidate name, or null if invalid
     */
    addExternalWms(url, layerName, title) {
        url = (url || '').trim();
        const parts = url.split('|');
        if (parts.length >= 4 && parts[1].trim().toLowerCase() === 'wms') {
            [title, , url, layerName] = parts.map(p => p.trim());
        } else if (parts.length === 2) {
            [url, layerName] = parts.map(p => p.trim());
        }
        url = LayerCompare.cleanWmsUrl(url);
        layerName = (layerName || '').trim();
        if (!/^https?:\/\//.test(url) || !layerName) {
            return null;
        }
        const name = `layercompare-ext-${url}-${layerName}`;
        if (!this._externalLayers.has(name)) {
            const olLayer = new TileLayer({
                source: new TileWMS({
                    url,
                    params: { LAYERS: layerName, TILED: true },
                }),
            });
            olLayer.set('name', name);
            this._externalLayers.set(name, { title: title || layerName, olLayer });
        }
        return name;
    }

    /**
     * Remove the OGC request parameters from a WMS URL, e.g. a GetCapabilities URL.
     * @param {string} url - WMS URL
     * @returns {string} the service URL
     */
    static cleanWmsUrl(url) {
        try {
            const u = new URL(url);
            for (const key of [...u.searchParams.keys()]) {
                if (['service', 'request', 'version'].includes(key.toLowerCase())) {
                    u.searchParams.delete(key);
                }
            }
            return u.toString().replace(/\?$/, '');
        } catch {
            return url;
        }
    }

    /**
     * Read the layers of a WMS service from its capabilities.
     * @param {string} url - WMS URL
     * @returns {Promise<Array<{name: string, title: string}>>} the named layers
     */
    static async fetchWmsLayers(url) {
        const u = new URL(LayerCompare.cleanWmsUrl(url));
        u.searchParams.set('SERVICE', 'WMS');
        u.searchParams.set('REQUEST', 'GetCapabilities');
        const response = await fetch(u);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const capabilities = new WMSCapabilities().read(await response.text());
        const layers = [];
        const walk = (layer) => {
            if (!layer) {
                return;
            }
            if (layer.Name) {
                layers.push({ name: layer.Name, title: layer.Title || layer.Name });
            }
            (layer.Layer || []).forEach(walk);
        };
        walk(capabilities?.Capability?.Layer);
        return layers;
    }

    /**
     * Start comparing the selected layers.
     */
    activate() {
        this.deactivate();
        const candidates = this.candidates;
        const left = candidates.find(c => c.name === this._leftName);
        const right = candidates.find(c => c.name === this._rightName);
        if (!left || !right) {
            return;
        }
        const map = mainLizmap.map;
        const toolLayers = map.toolsGroup.getLayers();

        [[left, 'left'], [right, 'right']].forEach(([candidate, side]) => {
            const original = candidate.olLayer;
            // Same layer class sharing the same source
            const clone = new original.constructor({
                source: original.getSource(),
                opacity: original.getOpacity(),
            });
            if (typeof original.getStyle === 'function' && typeof clone.setStyle === 'function') {
                clone.setStyle(original.getStyle());
            }
            clone.set('name', `layercompare-${side}`);
            clone.on('prerender', (e) => this._clip(e, side));
            clone.on('postrender', (e) => e.context?.restore?.());
            // Below the highlight layer and other tool layers
            toolLayers.insertAt(0, clone);
            this._compareLayers.push(clone);
        });

        this._createDivider();
        this._active = true;
        map.render();
        this._render();
    }

    /**
     * Stop comparing and remove the comparison layers.
     */
    deactivate() {
        const map = mainLizmap.map;
        if (map) {
            this._compareLayers.forEach(layer => map.toolsGroup.getLayers().remove(layer));
        }
        this._compareLayers = [];
        this._divider?.remove();
        this._divider = null;
        if (this._active) {
            this._active = false;
            this._render();
        }
    }

    /**
     * Clip the layer canvas on its side of the divider.
     * @param {RenderEvent} event - prerender event
     * @param {string} side - 'left' or 'right'
     */
    _clip(event, side) {
        const ctx = event.context;
        const size = mainLizmap.map.getSize();
        const x = size[0] * this._position / 100;
        const [x0, x1] = side === 'left' ? [0, x] : [x, size[0]];
        const tl = getRenderPixel(event, [x0, 0]);
        const tr = getRenderPixel(event, [x1, 0]);
        const bl = getRenderPixel(event, [x0, size[1]]);
        const br = getRenderPixel(event, [x1, size[1]]);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tl[0], tl[1]);
        ctx.lineTo(bl[0], bl[1]);
        ctx.lineTo(br[0], br[1]);
        ctx.lineTo(tr[0], tr[1]);
        ctx.closePath();
        ctx.clip();
    }

    _createDivider() {
        const viewport = mainLizmap.map.getViewport();
        const divider = document.createElement('div');
        divider.className = 'lizmap-layercompare-divider';
        divider.setAttribute('role', 'separator');
        divider.title = lizDict['layercompare.divider'];
        divider.style.left = `${this._position}%`;
        divider.innerHTML = '<span class="lizmap-layercompare-handle">⇔</span>';

        const move = (e) => {
            const rect = viewport.getBoundingClientRect();
            this._position = Math.min(100, Math.max(0, (e.clientX - rect.left) / rect.width * 100));
            divider.style.left = `${this._position}%`;
            mainLizmap.map.render();
        };
        const stop = () => {
            document.removeEventListener('pointermove', move);
            document.removeEventListener('pointerup', stop);
        };
        divider.addEventListener('pointerdown', (e) => {
            // Do not pan the map
            e.preventDefault();
            e.stopPropagation();
            document.addEventListener('pointermove', move);
            document.addEventListener('pointerup', stop);
        });
        viewport.appendChild(divider);
        this._divider = divider;
    }

    async _onLoadCapabilities() {
        const urlInput = this.querySelector('.layercompare-ext-url');
        const value = urlInput.value.trim();
        // Lines with a layer name are added directly
        if (value.includes('|')) {
            this._addExternal(this.addExternalWms(value));
            urlInput.value = '';
            return;
        }
        if (!/^https?:\/\//.test(value)) {
            lizMap.addMessage(lizDict['layercompare.external.invalid'], 'danger', true);
            return;
        }
        this._loading = true;
        this._render();
        try {
            this._wmsLayers = await LayerCompare.fetchWmsLayers(value);
            this._wmsUrl = LayerCompare.cleanWmsUrl(value);
            if (!this._wmsLayers.length) {
                lizMap.addMessage(lizDict['layercompare.external.nolayer'], 'warning', true);
            }
        } catch (error) {
            console.error(error);
            this._wmsLayers = [];
            lizMap.addMessage(lizDict['layercompare.external.error'], 'danger', true);
        }
        this._loading = false;
        this._render();
    }

    _onAddWmsLayer() {
        const select = this.querySelector('.layercompare-ext-layer');
        const layer = this._wmsLayers.find(l => l.name === select.value);
        if (layer) {
            this._addExternal(this.addExternalWms(this._wmsUrl, layer.name, layer.title));
        }
    }

    _addExternal(name) {
        if (!name) {
            lizMap.addMessage(lizDict['layercompare.external.invalid'], 'danger', true);
            return;
        }
        // External layers fill the left side, then the right side, alternately
        if (this._externalLayers.size % 2 === 1) {
            this._leftName = name;
        } else {
            this._rightName = name;
        }
        this._refreshComparison();
    }

    _onSelect(side, name) {
        if (side === 'left') {
            this._leftName = name;
        } else {
            this._rightName = name;
        }
        this._refreshComparison();
    }

    _refreshComparison() {
        if (this._active) {
            this.activate();
        } else {
            this._render();
        }
    }

    _render() {
        if (!mainLizmap.map) {
            return;
        }
        const candidates = this.candidates;
        const names = candidates.map(c => c.name);
        if (!names.includes(this._leftName)) {
            this._leftName = names[0] || '';
        }
        if (!names.includes(this._rightName)) {
            this._rightName = names.find(n => n !== this._leftName) || '';
        }
        const select = (side, value) => html`
            <select class="form-select form-select-sm layercompare-${side}"
                @change=${(e) => this._onSelect(side, e.target.value)}>
                ${candidates.map(c => html`
                    <option value=${c.name} ?selected=${c.name === value}>${c.title}</option>`)}
            </select>`;

        render(html`
            <div class="menu-content">
                <label class="form-label">${lizDict['layercompare.left']}</label>
                ${select('left', this._leftName)}
                <label class="form-label">${lizDict['layercompare.right']}</label>
                ${select('right', this._rightName)}
                <button type="button" class="btn btn-sm ${this._active ? 'active' : ''} layercompare-toggle"
                    ?disabled=${!this._leftName || !this._rightName}
                    @click=${() => this._active ? this.deactivate() : this.activate()}>
                    ${this._active ? lizDict['layercompare.stop'] : lizDict['layercompare.start']}
                </button>
                <details class="layercompare-external">
                    <summary>${lizDict['layercompare.external.title']}</summary>
                    <div class="input-group input-group-sm">
                        <input type="text" class="form-control form-control-sm layercompare-ext-url"
                            placeholder="${lizDict['layercompare.external.url']}"
                            @keydown=${(e) => e.key === 'Enter' && this._onLoadCapabilities()}>
                        <button type="button" class="btn btn-sm layercompare-ext-load" ?disabled=${this._loading}
                            @click=${() => this._onLoadCapabilities()}>${lizDict['layercompare.external.load']}</button>
                    </div>
                    ${this._wmsLayers.length ? html`
                        <div class="input-group input-group-sm">
                            <select class="form-select form-select-sm layercompare-ext-layer">
                                ${this._wmsLayers.map(l => html`<option value=${l.name}>${l.title}</option>`)}
                            </select>
                            <button type="button" class="btn btn-sm layercompare-ext-add"
                                @click=${() => this._onAddWmsLayer()}>${lizDict['layercompare.external.add']}</button>
                        </div>` : ''}
                </details>
            </div>`, this);
    }
}
