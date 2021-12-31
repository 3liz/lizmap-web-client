import { mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';

import { transformExtent } from 'ol/proj';
import { getCenter } from 'ol/extent';

export default class FeatureToolbar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        this._isEditable = false;

        // TODO: handle remove link instead of delete
        const mainTemplate = () => html`
        <div class="feature-toolbar">
            <button class="btn btn-mini feature-select ${this.hasAttributeTableConfig ? '' : 'hide'} ${this.isSelected ? 'btn-warning' : ''}" @click=${() => this.select()} title="${lizDict['attributeLayers.btn.select.title']}"><i class="icon-ok"></i></button>
            <button class="btn btn-mini feature-filter ${this.hasAttributeTableConfig && this.hasFilter ? '' : 'hide'} ${this.isFiltered ? 'btn-warning' : ''}" @click=${() => this.filter()} title="${lizDict['attributeLayers.toolbar.btn.data.filter.title']}"><i class="icon-filter"></i></button>
            <button class="btn btn-mini feature-zoom ${this.hasGeometry ? '' : 'hide'}" @click=${() => this.zoom()} title="${lizDict['attributeLayers.btn.zoom.title']}"><i class="icon-zoom-in"></i></button>
            <button class="btn btn-mini feature-center ${this.hasGeometry ? '' : 'hide'}"  @click=${() => this.center()} title="${lizDict['attributeLayers.btn.center.title']}"><i class="icon-screenshot"></i></button>
            <button class="btn btn-mini feature-edit" @click=${() => this.edit()} ?disabled="${!this._isEditable}" title="${lizDict['attributeLayers.btn.edit.title']}"><i class="icon-pencil"></i></button>
            <button class="btn btn-mini feature-delete ${this.isDeletable ? '' : 'hide'}" @click=${() => this.delete()} title="${lizDict['attributeLayers.btn.delete.title']}"><i class="icon-trash"></i></button>
        </div>`;

        render(mainTemplate(), this);

        // Add tooltip on buttons
        $('.btn', this).tooltip({
            placement: 'top'
        });

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            }, 'selection.changed'
        );

        this._editableFeaturesCallBack = (editableFeatures) => {
            this.updateIsEditable(editableFeatures.properties);
            render(mainTemplate(), this);
        };

        mainEventDispatcher.addListener(
            this._editableFeaturesCallBack,
            'edition.editableFeatures'
        );
    }

    disconnectedCallback() {
        mainEventDispatcher.removeListener(
            () => {
                render(mainTemplate(), this);
            }, 'selection.changed'
        );

        mainEventDispatcher.removeListener(
            this._editableFeaturesCallBack,
            'edition.editableFeatures'
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
        const selectedFeatures = lizMap.config.layers[this.featureType]['selectedFeatures'];
        return selectedFeatures && selectedFeatures.includes(this.fid);
    }

    get isFiltered() {
        const filteredFeatures = lizMap.config.layers[this.featureType]['filteredFeatures'];
        return filteredFeatures && filteredFeatures.includes(this.fid);
    }

    get hasFilter() {
        // lizLayerFilter is a global variable set only when there is a filter in the URL
        if (typeof lizLayerFilter === 'undefined'
            && (lizMap.lizmapLayerFilterActive === this.featureType || !lizMap.lizmapLayerFilterActive)){
            return true;
        }
        return false;
    }

    get hasGeometry(){
        const geometryType = lizMap.getLayerConfigById(this.layerId)[1].geometryType;
        return (geometryType != 'none' && geometryType != 'unknown');
    }

    get hasAttributeTableConfig(){
        return lizMap.getLayerConfigById(this.layerId, lizMap.config.attributeLayers, 'layerId');
    }

    get isDeletable(){
        return lizMap.config?.editionLayers?.[this.featureType]?.capabilities?.deleteFeature === "True";
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

        if (this.getAttribute('crs')){
            lizMap.mainLizmap.extent = transformExtent(
                [this.getAttribute('bbox-minx'), this.getAttribute('bbox-miny'), this.getAttribute('bbox-maxx'), this.getAttribute('bbox-maxy')],
                this.getAttribute('crs'),
                lizMap.mainLizmap.projection
                );
        }else{
            lizMap.zoomToFeature(this.featureType, this.fid, 'zoom');
        }
    }

    center(){
        if (this.getAttribute('crs')) {
            lizMap.mainLizmap.center = getCenter(transformExtent(
                [this.getAttribute('bbox-minx'), this.getAttribute('bbox-miny'), this.getAttribute('bbox-maxx'), this.getAttribute('bbox-maxy')],
                this.getAttribute('crs'),
                lizMap.mainLizmap.projection
            ));
        } else {
            lizMap.zoomToFeature(this.featureType, this.fid, 'center');
        }
    }

    edit(){
        lizMap.launchEdition(this.layerId, this.fid);
    }

    delete(){
        lizMap.deleteEditionFeature(this.layerId, this.fid);
    }

    filter(){
        const wasFiltered = this.isFiltered;

        // First deselect all features
        lizMap.events.triggerEvent('layerfeatureunselectall',
            { 'featureType': this.featureType, 'updateDrawing': false }
        );

        if (!wasFiltered) {
            // Then select this feature only
            lizMap.events.triggerEvent('layerfeatureselected',
                { 'featureType': this.featureType, 'fid': this.fid, 'updateDrawing': false }
            );
            // Then filter for the selected features
            lizMap.events.triggerEvent('layerfeaturefilterselected',
                { 'featureType': this.featureType }
            );
            lizMap.lizmapLayerFilterActive = this.featureType;
        } else {
            // Then remove filter for this selected feature
            lizMap.events.triggerEvent('layerfeatureremovefilter',
                { 'featureType': this.featureType }
            );
            lizMap.lizmapLayerFilterActive = null;
        }
    }
}
