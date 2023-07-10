import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';

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
                ${item.type === 'group'
                    ? html`<div class="expandable expanded" @click=${(event) => event.target.classList.toggle('expanded')}></div>`
                    : ''
                }
                ${item.symbologyChildrenCount
                    ? html`<div class="expandable" @click=${(event) => event.target.classList.toggle('expanded')}></div>`
                    : ''
                }
                <div class="${item.checked ? 'checked' : ''} ${item.type}">
                    <div class="loading ${item.loading ? 'spinner' : ''}"></div>
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
                            <a href="${this._createRemoveCacheLink(item.name)}" target="_blank">
                                <i class="icon-remove-sign" title="${lizDict['tree.button.removeCache']}" @click=${(event) => this._removeCache(event)}></i>
                            </a>
                            <i class="icon-info-sign" @click=${() => this._toggleMetadata(item.name, item.type)}></i>
                        </div>
                    </div>
                </div>
                ${item.symbologyChildrenCount
                    ? html`
                        <ul class="symbols">
                            ${item.symbologyChildren.map(symbol => html`
                            <li>
                                <label class="symbol-title">
                                    <input type="checkbox" .checked=${symbol.checked} @click=${() => symbol.checked = !symbol.checked}>
                                    <img class="legend" src="${symbol.icon}">
                                    ${symbol.title}
                                </label>
                            </li>`
                            )}
                        </ul>`
                    : ''
                }
                ${when(item.type === 'group', () => this._layerTemplate(item))}
            </li>`
            )}
        </ul>`;

        render(this._layerTemplate(mainLizmap.state.layerTree), this);

        mainLizmap.state.rootMapGroup.addListener(
            this._onChange,
            ['layer.loading.changed', 'layer.visibility.changed', 'group.visibility.changed', 'layer.style.changed', 'layer.symbology.changed', 'layer.filter.changed']
        );
    }

    disconnectedCallback() {
        mainLizmap.state.rootMapGroup.removeListener(
            this._onChange,
            ['layer.loading.changed', 'layer.visibility.changed', 'group.visibility.changed', 'layer.style.changed', 'layer.symbology.changed', 'layer.filter.changed']
        );
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