import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { LayerTreeGroupState } from '../modules/state/LayerTree.js';

import LayerGroup from 'ol/layer/Group.js';
import { html, render } from 'lit-html';
import { when } from 'lit-html/directives/when.js';

export default class Treeview extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        this._onChange = () => {
            render(this._layerTemplate(mainLizmap.state.layerTree), this);
        };

        this._layerTemplate = layerTreeGroupState =>
        html`
        <ul>
            ${layerTreeGroupState.children.map(item => html`
            <li>
                <div class="${item.checked ? 'checked' : ''} ${item instanceof LayerTreeGroupState ? 'group' : ''}">
                    <!-- <div class="loading ${item?.getSource?.().get('loading') ? 'spinner' : ''}"></div> -->
                    <input class="${layerTreeGroupState.mutuallyExclusive ? 'rounded-checkbox' : ''}" type="checkbox" id="node-${item.name}" .checked=${item.checked} @click=${() => item.checked = !item.checked} >
                    <div class="node ${this._isFiltered(item) ? 'filtered' : ''}">
                        ${!(item instanceof LayerTreeGroupState)
                            ? html`<img class="legend" src="${item.icon}">`
                            : ''
                        }
                        <label for="node-${item.name}">${item.name}</label>
                        <div class="layer-actions">
                            <a href="${this._createDocLink(item.name)}" target="_blank" title="${lizDict['tree.button.link']}">
                                <i class="icon-share"></i>
                            </a>
                            <a href="${this._createRemoveCacheLink(item.name)}" target="_blank">
                                <i class="icon-remove-sign" title="${lizDict['tree.button.removeCache']}" @click=${(event) => this._removeCache(event)}></i>
                            </a>
                            <i class="icon-info-sign" @click=${() => this._toggleMetadata(item.name, item instanceof LayerTreeGroupState)}></i>
                        </div>
                    </div>
                </div>
                ${when(item instanceof LayerTreeGroupState, () => this._layerTemplate(item))}
            </li>`
            )}
        </ul>`;

        render(this._layerTemplate(mainLizmap.state.layerTree), this);

        mainEventDispatcher.addListener(
            this._onChange,
            ['overlayLayers.changed', 'overlayLayer.loading.changed', 'overlayLayer.visibility.changed']
        );
    }

    disconnectedCallback() {
        mainEventDispatcher.removeListener(
            this._onChange,
            ['overlayLayers.changed', 'overlayLayer.loading.changed', 'overlayLayer.visibility.changed']
        );
    }

    _isFiltered(layer) {
        // return !(layer instanceof LayerGroup) && layer.getSource().getParams?.()?.['FILTERTOKEN'];
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