import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import WMS from '../modules/WMS.js';

import LayerGroup from 'ol/layer/Group.js';
import { html, render } from 'lit-html';
import { when } from 'lit-html/directives/when.js';

export default class Treeview extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        this._getLegends();

        this._legends = {};

        this._onChange = () => {
            render(this._layerTemplate(mainLizmap.baseLayersMap.overlayLayersGroup), this);
        };

        this._layerTemplate = layerGroup =>
        html`
        <ul>
            ${layerGroup.getLayers().getArray().slice().reverse().map(layer => html`
            <li>
                <div class="${layer.getVisible() ? 'checked' : ''} ${layer instanceof LayerGroup ? 'group' : ''}">
                    <div class="loading ${layer?.getSource?.().get('loading') ? 'spinner' : ''}"></div>
                    <input class="${layerGroup.get('mutuallyExclusive') ? 'rounded-checkbox' : ''}" type="checkbox" id="node-${layer.get('name')}" .checked=${layer.getVisible()} @click=${() => layer.setVisible(!layer.getVisible())} >
                    <div class="node ${this._isFiltered(layer) ? 'filtered' : ''}">
                        ${!(layer instanceof LayerGroup)
                            ? html`<img class="legend" src="data:image/png;base64, ${this._legends[layer.getSource().getParams()['LAYERS']]}">`
                            : ''
                        }
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

        mainEventDispatcher.addListener(
            this._onChange,
            ['overlayLayers.changed', 'overlayLayer.loading.changed']
        );
    }

    disconnectedCallback() {
        mainEventDispatcher.removeListener(
            this._onChange,
            ['overlayLayers.changed', 'overlayLayer.loading.changed']
        );
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

    _getLegends() {
        // Get legends
        const wms = new WMS();
        const layersWMSName = mainLizmap.baseLayersMap.overlayLayers.map(layer => layer.getSource().getParams()['LAYERS']).join();
        const wmsParams = {
            LAYERS: layersWMSName
        };

        wms.getLegendGraphics(wmsParams).then(response => {
            for (const node of response.nodes) {
                this._legends[node.name] = node.icon;
            }
        });
    }
}