import { mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';

export default class FeatureToolbar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        this._isEditable = false;

        // TODO: handle remove link instead of delete
        const mainTemplate = () => html`
        <div class="feature-toolbar">
            <button class="btn btn-mini ${this.isSelected ? 'btn-warning' : ''}" @click=${() => this.select()} data-original-title="${lizDict['attributeLayers.btn.select.title']}"><i class="icon-ok"></i></button>
            <button class="btn btn-mini" @click=${() => this.zoom()} data-original-title="${lizDict['attributeLayers.btn.zoom.title']}"><i class="icon-zoom-in"></i></button>
            <button class="btn btn-mini" @click=${() => this.center()} data-original-title="${lizDict['attributeLayers.btn.center.title']}"><i class="icon-screenshot"></i></button>
            <button class="btn btn-mini" @click=${() => this.edit()} ?disabled="${!this._isEditable}" data-original-title="${lizDict['attributeLayers.btn.edit.title']}"><i class="icon-pencil"></i></button>
            <button class="btn btn-mini" @click=${() => this.delete()} data-original-title="${lizDict['attributeLayers.btn.delete.title']}"><i class="icon-trash"></i></button>
            <button class="btn btn-mini" data-original-title="${lizDict['attributeLayers.toolbar.btn.data.filter.title']}"><i class="icon-filter"></i></button>
        </div>`;

        render(mainTemplate(), this);

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            }, 'selection.changed'
        );

        // TODO: add handler to remove listener
        mainEventDispatcher.addListener(
            (editableFeatures) => {
                this.updateIsEditable(editableFeatures.properties);
                render(mainTemplate(), this);
            }, 'edition.editableFeatures'
        );
    }

    disconnectedCallback() {
        mainEventDispatcher.removeListener(
            () => {
                render(mainTemplate(), this);
            }, 'selection.changed'
        );
    }

    get fid() {
        return this.getAttribute('value').split('.').pop();
    }

    get layerId() {
        return this.getAttribute('value').replace('.' + this.fid, '');
    }

    get featureType() {
        return lizMap.getLayerConfigById(this.layerId)[0];
    }

    get isSelected() {
        return lizMap.config.layers[this.featureType]['selectedFeatures'].includes(this.fid);
    }

    updateIsEditable(editableFeatures) {
        this._isEditable = false;
        for (const editableFeature of editableFeatures) {
            const [featureType, fid] = editableFeature.id.split('.');
            if(featureType === this.featureType && fid === this.fid){
                this._isEditable = true;
                break;
            }
        }
    }

    select() {
        lizMap.events.triggerEvent('layerfeatureselected',
            { 'featureType': this.featureType, 'fid': this.fid, 'updateDrawing': true }
        );
    }

    zoom() {
        // FIXME: necessary?
        // Remove map popup to avoid confusion
        if (lizMap.map.popups.length != 0){
            lizMap.map.removePopup(lizMap.map.popups[0]);
        }

        lizMap.zoomToFeature(this.featureType, this.fid, 'zoom');
    }

    center(){
        lizMap.zoomToFeature(this.featureType, this.fid, 'center');
    }

    edit(){
        lizMap.launchEdition(this.layerId, this.fid);
    }

    delete(){
        lizMap.deleteEditionFeature(this.layerId, this.fid);
    }
}
