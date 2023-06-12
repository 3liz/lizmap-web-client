import { mainLizmap } from '../modules/Globals.js';
import LayerGroup from 'ol/layer/Group.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import WMTS from 'ol/source/WMTS.js';
import { html, render } from 'lit-html';
import { when } from 'lit-html/directives/when.js';

export default class Treeview extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        this._onChange = () => {
            render(this._layerTemplate(mainLizmap.baseLayersMap.overlayLayersGroup), this);
        };

        this._layerTemplate = layerGroup =>
        html`
        <ul>
            ${layerGroup.getLayers().getArray().slice().reverse().map(layer => html`
            <li>
                <div class="${layer.getVisible() ? 'checked' : ''}">
                    <div class="loading ${layer?.getSource?.().get('loading') ? 'spinner' : ''}"></div>
                    <input class="${layerGroup.get('mutuallyExclusive') ? 'rounded-checkbox' : ''}" type="checkbox" id="node-${layer.get('name')}" .checked=${layer.getVisible()} @click=${() => layer.setVisible(!layer.getVisible())} >
                    <div class="node ${this._isFiltered(layer) ? 'filtered' : ''}">
                        <label for="node-${layer.get('name')}">${layer.get('name')}</label>
                        <div class="layer-actions">
                            <a href="${this._createDocLink(layer.get('name'))}" target="_blank" title="${lizDict['tree.button.link']}">
                                <i class="icon-share"></i>
                            </a>
                            <a href="${this._createRemoveCacheLink(layer.get('name'))}" target="_blank">
                                <i class="icon-remove-sign" title="${lizDict['tree.button.removeCache']}" @click=${(event) => this._removeCache(event)}></i>
                            </a>
                            <i class="icon-info-sign" @click=${() => this._toggleMetadata(layer.get('name'), layer instanceof LayerGroup)}></i>
                        </div>
                    </div>
                </div>
                ${when((layer instanceof LayerGroup) && !layer.get('groupAsLayer'), () => this._layerTemplate(layer))}
            </li>`
            )}
        </ul>`;

        render(this._layerTemplate(mainLizmap.baseLayersMap.overlayLayersGroup), this);

        mainLizmap.baseLayersMap.overlayLayersGroup.on('change', this._onChange);

        // Display a spinner when a layer is loading
        for (const layer of mainLizmap.baseLayersMap.overlayLayers) {
            const source = layer.getSource();

            if (source instanceof ImageWMS) {
                source.on('imageloadstart', event => {
                    event.target.set('loading', true, true);
                    this._onChange();
                });
                source.on(['imageloadend', 'imageloaderror'], event => {
                    event.target.set('loading', false, true);
                    this._onChange()
                });
            } else if (source instanceof WMTS) {
                source.on('tileloadstart', event => {
                    event.target.set('loading', true, true);
                    this._onChange();
                });
                source.on(['tileloadend', 'imageloaderror'], event => {
                    event.target.set('loading', false, true);
                    this._onChange()
                });
            }
        }
    }

    disconnectedCallback() {
    }

    _isFiltered(layer) {
        return !(layer instanceof LayerGroup) && layer.getSource().getParams?.()?.['FILTERTOKEN'];
    }

    _createDocLink(layerName) {
        let url = lizMap.config.layers?.[layerName]?.link;

        // Test if the url is internal
        const mediaRegex = /^(\/)?media\//;
        if (mediaRegex.test(url)) {
            const mediaLink = lizUrls.media + '?' + new URLSearchParams(lizUrls.params);
            url = mediaLink + '&path=/' + url;
        }
        return url;
    }

    _createRemoveCacheLink(layerName) {
        if(!lizUrls.removeCache){
            return;
        }
        const removeCacheServerUrl = lizUrls.removeCache + '?' + new URLSearchParams(lizUrls.params);
        return removeCacheServerUrl + '&layer=' + layerName;
    }

    _removeCache(event) {
        if (! confirm(lizDict['tree.button.removeCache.confirmation'])){
            event.preventDefault();
        }
    }

    _toggleMetadata (layerName, isGroup){
        lizMap.events.triggerEvent("lizmapswitcheritemselected",
          { 'name': layerName, 'type': isGroup ? "group" : "layer", 'selected': true}
        )
    }
}