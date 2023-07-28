import { mainLizmap } from '../modules/Globals.js';
import { MapLayerLoadStatus } from '../modules/state/MapLayer.js';

import { html, render } from 'lit-html';
import { when } from 'lit-html/directives/when.js';

export default class Treeview extends HTMLElement {
    constructor() {
        super();
        this._itemNameSelected;
    }

    connectedCallback() {

        this._onChange = () => {
            render(this._layerTemplate(mainLizmap.state.layerTree), this);
        };

        this._symbolTemplate = symbol =>
        html`
        <li>
            <label class="symbol-title">
                ${symbol.ruleKey
                    ? html`<input type="checkbox" .checked=${symbol.checked} @click=${() => symbol.checked = !symbol.checked}>`
                    : ''
                }
                <img class="legend" src="${symbol.icon}">
                ${symbol.title}
            </label>
            ${(symbol.childrenCount)
                ? html`
                        <ul class="symbols">
                            ${symbol.children.map(s => this._symbolTemplate(s))}
                        </ul>`
                    : ''
            }
        </li>`

        this._layerTemplate = layerTreeGroupState =>
        html`
        <ul>
            ${layerTreeGroupState.children.map(item => html`
            <li data-testid="${item.name}">
                ${item.type === 'group' || (item.symbologyChildrenCount && item.layerConfig.legendImageOption !== "disabled")
                    ? html`<div class="expandable ${item.expanded ? 'expanded' : ''}" @click=${() => item.expanded = !item.expanded}></div>`
                    : ''
                }
                <div class="${item.checked ? 'checked' : ''} ${item.type} ${item.name === this._itemNameSelected ? 'selected' : ''}">
                    ${item.type === 'layer'
                        ? html`<div class="loading ${item.loadStatus === MapLayerLoadStatus.Loading ? 'spinner' : ''}"></div>`
                        : ''
                    }
                    <input class="${layerTreeGroupState.mutuallyExclusive ? 'rounded-checkbox' : ''}" type="checkbox" id="node-${item.name}" .checked=${item.checked} @click=${() => item.checked = !item.checked} >
                    <div class="node ${item.isFiltered ? 'filtered' : ''}">
                        ${item.type === 'layer'
                            ? html`<img class="legend" src="${item.icon}">`
                            : ''
                        }
                        <label for="node-${item.name}">${item.name}</label>
                        <div class="layer-actions">
                            <a href="${this._createDocLink(item.name)}" target="_blank" title="${lizDict['tree.button.link']}">
                                <i class="icon-share"></i>
                            </a>
                            ${item.layerConfig.cached
                                ? html`
                                    <a href="${this._createRemoveCacheLink(item.name)}" target="_blank">
                                        <i class="icon-remove-sign" title="${lizDict['tree.button.removeCache']}" @click=${event => this._removeCache(event)}></i>
                                    </a>`
                                : ''
                            }
                            <i class="icon-info-sign" @click=${() => this.itemNameSelected = item.name}></i>
                        </div>
                    </div>
                </div>
                ${(item.symbologyChildrenCount && item.layerConfig.legendImageOption !== "disabled")
                    ? html`
                        <ul class="symbols">
                            ${item.symbologyChildren.map(symbol => this._symbolTemplate(symbol))}
                        </ul>`
                    : ''
                }
                ${when(item.type === 'group', () => this._layerTemplate(item))}
            </li>`
            )}
        </ul>`;

        render(this._layerTemplate(mainLizmap.state.layerTree), this);

        mainLizmap.state.layerTree.addListener(
            this._onChange,
            ['layer.load.status.changed', 'layer.visibility.changed', 'group.visibility.changed', 'layer.style.changed', 'layer.symbology.changed', 'layer.filter.changed', 'layer.expanded.changed', 'group.expanded.changed']
        );
    }

    disconnectedCallback() {
        mainLizmap.state.layerTree.removeListener(
            this._onChange,
            ['layer.load.status.changed', 'layer.visibility.changed', 'group.visibility.changed', 'layer.style.changed', 'layer.symbology.changed', 'layer.filter.changed', 'layer.expanded.changed', 'group.expanded.changed']
        );
    }

    set itemNameSelected(itemName) {
        if (this._itemNameSelected === itemName) {
            this._itemNameSelected = undefined;
        } else {
            this._itemNameSelected = itemName;
        }

        lizMap.events.triggerEvent("lizmapswitcheritemselected",
            { 'name': itemName, 'selected': this._itemNameSelected !== undefined }
        );

        this._onChange();
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
}
