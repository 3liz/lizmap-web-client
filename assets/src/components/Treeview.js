/**
 * @module components/Treeview.js
 * @name Treeview
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { Utils } from '../modules/Utils.js';
import { MapLayerLoadStatus } from '../modules/state/MapLayer.js';

import { html, render } from 'lit-html';

/**
 * @class
 * @name Treeview
 * @augments HTMLElement
 */
export default class Treeview extends HTMLElement {
    constructor() {
        super();
        this._itemNameSelected;
        this._clickTimestamp;
    }

    connectedCallback() {

        this._onChange = () => {
            if (this._freeze) return;
            render(this._rootTemplate(mainLizmap.state.layerTree), this);
        };

        this._olLayerTemplate = (olLayer) =>
            html`
        <li data-testid="ol-${olLayer.name}">
            <div class="${olLayer.checked ? 'checked' : ''} ${olLayer.type}">
                <div class="loading ${olLayer.loadStatus === MapLayerLoadStatus.Loading ? 'spinner' : ''}"></div>
                <input type="checkbox" id="node-ol-${olLayer.name}" .checked=${olLayer.checked} @click=${() => olLayer.checked = !olLayer.checked} >
                <div class="node ${olLayer.isFiltered ? 'filtered' : ''}">
                    <img class="legend" src="${olLayer.icon}">
                    <label for="node-ol-${olLayer.name}">${olLayer.wmsTitle}</label>
                    <div class="layer-actions">
                    </div>
                </div>
            </div>
        </li>`

        this._extGroupTemplate = (extGroup) =>
            html`
        <li data-testid="ext-${extGroup.name}">
            <div class="expandable ${extGroup.expanded ? 'expanded' : ''}" @click=${() => extGroup.expanded = !extGroup.expanded}></div>
            <div class="${extGroup.checked ? 'checked' : ''} ${extGroup.type} group">
                <div class="node">
                    <label for="node-ext-${extGroup.name}">${extGroup.wmsTitle}</label>
                    <div class="layer-actions">
                    </div>
                </div>
            </div>
            <ul>
                ${extGroup.children.map(item => html`
                    ${this._olLayerTemplate(item)}
                `)}
            </ul>
        </li>`

        this._symbolTemplate = symbol =>
            html`
        <li class="symbol ${symbol.type}${this._isInScale(symbol) ? '' : ' not-in-scale'}${symbol.ruleKey && !symbol.checked ? ' not-visible' : ''}">
            ${(symbol.childrenCount)
                ? html`
                        <div class="expandable ${symbol.expanded ? 'expanded' : ''}" @click=${() => symbol.expanded = !symbol.expanded}></div>`
                    : ''
            }
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

        this._layerTemplate = (layer, parent) =>
            html`
        <li data-testid="${layer.name}" class="${this._isVisible(layer) ? '' : 'not-visible'}">
            ${layer.symbologyChildrenCount && layer.layerConfig.legendImageOption !== "disabled"
                ? html`<div class="expandable ${layer.expanded ? 'expanded' : ''}" @click=${() => layer.expanded = !layer.expanded}></div>`
                : ''
            }
            <div class="${layer.checked ? 'checked' : ''} ${layer.type} ${layer.name === this._itemNameSelected ? 'selected' : ''}">
                <div class="loading ${layer.loadStatus === MapLayerLoadStatus.Loading ? 'spinner' : ''}"></div>
                <input type="checkbox"
                    class="${parent.mutuallyExclusive ? 'rounded-checkbox' : ''}"
                    id="node-${layer.name}"
                    .checked=${layer.checked}
                    @click=${() => layer.checked = !layer.checked} >
                <div class="node ${layer.isFiltered ? 'filtered' : ''}">
                    <img class="legend" src="${layer.icon}">
                    <label for="node-${layer.name}" >${layer.layerConfig.title}</label>
                    <div class="layer-actions">
                        <a href="${this._createDocLink(layer.name)}" target="_blank" title="${lizDict['tree.button.link']}">
                            <i class="icon-share"></i>
                        </a>
                        ${layer.layerConfig.cached
                            ? html`
                                <a href="${this._createRemoveCacheLink(layer.name)}" target="_blank">
                                    <i class="icon-remove-sign" title="${lizDict['tree.button.removeCache']}" @click=${event => this._removeCache(event)}></i>
                                </a>`
                            : ''
                        }
                        <i class="icon-info-sign" @click=${() => this.itemNameSelected = layer.name}></i>
                    </div>
                </div>
            </div>
            ${(layer.symbologyChildrenCount && layer.layerConfig.legendImageOption !== "disabled")
                ? html`
                    <ul class="symbols">
                        ${layer.symbologyChildren.map(symbol => this._symbolTemplate(symbol))}
                    </ul>`
                : ''
            }
        </li>`

        this._groupTemplate = (group, parent) =>
            html`
        <li data-testid="${group.name}" class="${this._isVisible(group) ? '' : 'not-visible'}">
            <div class="expandable ${group.expanded ? 'expanded' : ''}" @click=${() => group.expanded = !group.expanded}></div>
            <div class="${group.checked ? 'checked' : ''} ${group.type} ${group.name === this._itemNameSelected ? 'selected' : ''}">
                ${mainLizmap.initialConfig.options.hideGroupCheckbox
                    ? ''
                    : html`<input type="checkbox" class="${parent.mutuallyExclusive ? 'rounded-checkbox' : ''}"
                      id="node-${group.name}"
                      .checked=${group.checked}
                      @click=${(evt) => this._clickItem(evt, group)}
                      @dblclick=${() => this._dblclickItem(group)} >`
                }
                <div class="node ${group.isFiltered ? 'filtered' : ''}">
                    ${mainLizmap.initialConfig.options.hideGroupCheckbox
                        ? html`<label for="node-${group.name}" >${group.layerConfig.title}</label>`
                        : html`<label
                          for="node-${group.name}"
                          @dblclick=${() => this._dblclickItem(group)} } >${group.layerConfig.title}</label>`
                    }
                    <div class="layer-actions">
                        <a href="${this._createDocLink(group.name)}" target="_blank" title="${lizDict['tree.button.link']}">
                            <i class="icon-share"></i>
                        </a>
                        ${group.layerConfig.cached
                            ? html`
                                <a href="${this._createRemoveCacheLink(group.name)}" target="_blank">
                                    <i class="icon-remove-sign" title="${lizDict['tree.button.removeCache']}" @click=${event => this._removeCache(event)}></i>
                                </a>`
                            : ''
                        }
                        <i class="icon-info-sign" @click=${() => this.itemNameSelected = group.name}></i>
                    </div>
                </div>
            </div>
            <ul>
                ${group.children.map(item => html`
                    ${item.type === 'group' ? html`${this._groupTemplate(item, group)}` : ''}
                    ${item.type === 'layer' ? html`${this._layerTemplate(item, group)}` : ''}
                `)}
            </ul>
        </li>`

        this._rootTemplate = layerTreeRoot =>
            html`
        <ul>
            ${layerTreeRoot.children.map(item => html`
                ${item.type === 'group' ? html`${this._groupTemplate(item, layerTreeRoot)}` : ''}
                ${item.type === 'layer' ? html`${this._layerTemplate(item, layerTreeRoot)}` : ''}
                ${item.type === 'ext-group' && item.childrenCount ? html`${this._extGroupTemplate(item)}` : ''}
            `)}
        </ul>`;

        render(this._rootTemplate(mainLizmap.state.layerTree), this);

        mainLizmap.state.layerTree.addListener(
            this._onChange,
            [
                'layer.load.status.changed', 'layer.visibility.changed', 'group.visibility.changed', 'layer.style.changed',
                'layer.symbology.changed', 'layer.filter.changed', 'layer.expanded.changed', 'group.expanded.changed',
                'layer.symbol.expanded.changed', 'ol-layer.added', 'ext-group.expanded.changed', 'ol-layer.removed', 'ext-group.removed',
                'layer.visibility.changed', 'ol-layer.wmsTitle.changed', 'ol-layer.icon.changed', 'ext-group.wmsTitle.changed',
            ]
        );

        mainEventDispatcher.addListener(
            this._onChange, ['resolution.changed']
        );

        // layertree has been created, fire corresponding event
        mainLizmap.lizmap3.events.triggerEvent('treecreated');
    }

    disconnectedCallback() {
        mainLizmap.state.layerTree.removeListener(
            this._onChange,
            ['layer.load.status.changed', 'layer.visibility.changed', 'group.visibility.changed', 'layer.style.changed', 'layer.symbology.changed', 'layer.filter.changed', 'layer.expanded.changed', 'group.expanded.changed', 'layer.symbol.expanded.changed']
        );

        mainEventDispatcher.removeListener(
            this._onChange, ['resolution.changed']
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

    _isVisible(item) {
        if (item.type === 'group') {
            return item.visibility;
        }
        const metersPerUnit = mainLizmap.map.getView().getProjection().getMetersPerUnit();
        const scale = Utils.getScaleFromResolution(mainLizmap.map.getView().getResolution(), metersPerUnit);
        const visibility = item.isVisible(scale);
        return visibility;
    }

    _isInScale(symbol) {
        if (symbol.minScaleDenominator !== undefined && symbol.maxScaleDenominator !== undefined
            && symbol.maxScaleDenominator > symbol.minScaleDenominator){
            const metersPerUnit = mainLizmap.map.getView().getProjection().getMetersPerUnit();
            const scale = Utils.getScaleFromResolution(mainLizmap.map.getView().getResolution(), metersPerUnit);
            return symbol.minScaleDenominator < scale
            && scale < symbol.maxScaleDenominator;
        }
        return true;
    }

    _clickItem(evt, item) {
        // Freeze or dblclick received
        if (this._freeze || evt.detail > 1) {
            // Force input element to keep checked status
            evt.currentTarget.checked = item.checked;
            return false;
        }

        // It is much more end2end test purpose
        // a playwright dblclick is 2 clicks with detail 0
        // and the dblclick which is a click with detail 2
        if (this._clickTimestamp && evt.timeStamp - this._clickTimestamp < 1) {
            // Force input element to keep checked status
            evt.currentTarget.checked = item.checked;
            return false;
        }
        this._clickTimestamp = evt.timeStamp;

        item.checked = !item.checked;
        return false;
    }

    _dblclickItem(item) {
        if (item.type != 'group') {
            return false;
        }

        if (this._freeze) {
            return false;
        }

        this._freeze = true;
        item.propagateCheckedState(item.checked);
        this._freeze = false;
        this._onChange();
        return false;
    }

    _createDocLink(layerName) {
        let url = lizMap.config.layers?.[layerName]?.link;

        // Test if the url is internal
        const mediaRegex = /^(\/)?media\//;
        if (mediaRegex.test(url)) {
            const mediaLink = globalThis['lizUrls'].media + '?' + new URLSearchParams(globalThis['lizUrls'].params);
            url = mediaLink + '&path=/' + url;
        }
        return url;
    }

    _createRemoveCacheLink(layerName) {
        if(!globalThis['lizUrls'].removeCache){
            return;
        }
        const removeCacheServerUrl = globalThis['lizUrls'].removeCache + '?' + new URLSearchParams(globalThis['lizUrls'].params);
        return removeCacheServerUrl + '&layer=' + layerName;
    }

    _removeCache(event) {
        if (! confirm(lizDict['tree.button.removeCache.confirmation'])){
            event.preventDefault();
        }
    }
}
