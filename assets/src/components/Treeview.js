import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';
import LayerGroup from 'ol/layer/Group.js';
import {html, render} from 'lit-html';
import {when} from 'lit-html/directives/when.js';

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
                <input class="${layerGroup.get('mutuallyExclusive') ? 'rounded-checkbox' : ''}" type="checkbox" id="node-${layer.get('name')}" .checked=${layer.getVisible()} @click=${() => layer.setVisible(!layer.getVisible())} >
                <div class="node ${this._isFiltered(layer) ? 'filtered' : ''}">
                    <label for="node-${layer.get('name')}">${layer.get('name')}</label>
                    <a href="${this._createLink(layer.get('name'))}" target="_blank" class="link" title="${lizDict['tree.button.link']}"><i class="icon-share"></i></a>
                    <i class="icon-info-sign" @click=${() => this._toggleMetadata(layer.get('name'), layer instanceof LayerGroup)}></i>
                </div>
                ${when((layer instanceof LayerGroup) && !layer.get('groupAsLayer'), () => this._layerTemplate(layer))}
            </li>`
            )}
        </ul>`;

        render(this._layerTemplate(mainLizmap.baseLayersMap.overlayLayersGroup), this);

        mainLizmap.baseLayersMap.overlayLayersGroup.on('change', this._onChange);
    }

    disconnectedCallback() {
    }

    _isFiltered(layer) {
        return !(layer instanceof LayerGroup) && layer.getSource().getParams()?.['FILTERTOKEN'];
    }

    _createLink(layerName) {
        let url = lizMap.config.layers?.[layerName]?.link;

        // Test if the url is internal
        const mediaRegex = /^(\/)?media\//;
        if (mediaRegex.test(url)) {
            const mediaLink = lizUrls.media + '?' + new URLSearchParams(lizUrls.params);
            url = mediaLink + '&path=/' + url;
        }
        return url;
    }

    _toggleMetadata (layerName, isGroup){
        lizMap.events.triggerEvent("lizmapswitcheritemselected",
          { 'name': layerName, 'type': isGroup ? "group" : "layer", 'selected': true}
        )
    }
}