/**
 * @module components/FeatureToolbar.js
 * @name FeatureToolbar
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { Utils } from '../modules/Utils.js';
import { html, render } from 'lit-html';

import { transformExtent } from 'ol/proj.js';
import { getCenter } from 'ol/extent.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import GPX from 'ol/format/GPX.js';
import KML from 'ol/format/KML.js';
import Point from 'ol/geom/Point.js';
import {fromExtent} from 'ol/geom/Polygon.js';

import '../images/svg/map-print.svg';

/**
 * @class
 * @name FeatureToolbar
 * @augments HTMLElement
 */
export default class FeatureToolbar extends HTMLElement {
    constructor() {
        super();

        [this._layerId, this._fid] = this.getAttribute('value').split('.');
        [this._pivotLayerId, this._parentFeatureId] = (this.getAttribute('pivot-layer') && this.getAttribute('pivot-layer').split(':') ) || [null, null];
        [this._pivotType, this._pivotLayerConfig] = this._pivotLayerId ? lizMap.getLayerConfigById(this._pivotLayerId) : [null, null];
        [this._featureType, this._layerConfig] = lizMap.getLayerConfigById(this.layerId);
        this._typeName = this._layerConfig?.shortname || this._layerConfig?.typename || this._layerConfig?.name;
        this._parentLayerId = this.getAttribute('parent-layer-id');

        this._isFeatureEditable = true;

        // Edition can be restricted by polygon
        if (this.hasEditionRestricted){
            this._isFeatureEditable = !this.hasEditionRestricted;
        }

        this._downloadFormats = ['GeoJSON', 'GPX', 'KML'];

        // Note: Unlink button deletes the feature for pivot layer and unlinks otherwise
        this._mainTemplate = () => html`
        <div class="feature-toolbar">
            <button
                type="button"
                class="btn btn-sm feature-select ${this.attributeTableConfig ? '' : 'hide'} ${this.isSelected ? 'btn-primary' : ''}"
                @click=${() => this.select()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['attributeLayers.btn.select.title']}"
                ><i class="icon-ok"></i>
            </button>
            <button
                type="button"
                class="btn btn-sm feature-filter ${this.attributeTableConfig && this.hasFilter ? '' : 'hide'} ${this.isFiltered ? 'btn-primary' : ''}"
                @click=${() => this.filter()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['attributeLayers.toolbar.btn.data.filter.title']}"
                ><i class="icon-filter"></i>
            </button>
            <button
                type="button"
                class="btn btn-sm feature-zoom ${this.getAttribute('crs') || (this.attributeTableConfig && this.hasGeometry) ? '' : 'hide'}"
                @click=${() => this.zoom()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['attributeLayers.btn.zoom.title']}"
                ><i class="icon-zoom-in"></i>
            </button>
            <button
                type="button"
                class="btn btn-sm feature-center ${this.getAttribute('crs') || (this.attributeTableConfig && this.hasGeometry) ? '' : 'hide'}"
                @click=${() => this.center()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['attributeLayers.btn.center.title']}"
                ><i class="icon-screenshot"></i>
            </button>
            <button
                type="button"
                class="btn btn-sm feature-edit ${this.isLayerEditable && this._isFeatureEditable ? '' : 'hide'}"
                @click=${() => this.edit()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['attributeLayers.btn.edit.title']}"><i class="icon-pencil"></i></button>
            <button
                type="button"
                class="btn btn-sm feature-delete ${(this.isDeletable && !this._pivotLayerId) ? '' : 'hide'}"
                @click=${() => this.delete()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['attributeLayers.btn.delete.title']}"
                ><i class="icon-trash"></i>
            </button>
            <button
                type="button"
                class="btn btn-sm feature-unlink ${this.isUnlinkable ? '' : 'hide'}"
                @click=${() => this.isNToMRelation ? this.deleteFromPivot() : this.unlink()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['attributeLayers.btn.remove.link.title']}"
                ><i class="icon-minus"></i>
            </button>


            ${this.isFeatureExportable
                ? html`<div class="btn-group feature-export">
                        <button
                            type="button"
                            class="btn btn-sm dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            data-bs-toggle="tooltip"
                            data-bs-title="${lizDict['attributeLayers.toolbar.btn.data.export.title']}"
                            >
                            <i class="icon-download"></i>
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu pull-right" role="menu">
                            ${this._downloadFormats.map((format) =>
                                html`<li><a href="#" @click=${() => this.export(format)}>${format}</a></li>`)}
                        </ul>
                    </div>`
                : ''
            }

            ${this.hasDefaultPopupPrint
            ? html`<button
                        type="button"
                        class="btn btn-sm feature-print"
                        @click=${() => this.print()}
                        data-bs-toggle="tooltip"
                        data-bs-title="${lizDict['print.launch']}"
                        ><i class="icon-print"></i>
                    </button>`
            : ''
            }

            ${this.atlasLayouts.map( layout => html`
                <div class="feature-atlas">
                    <button
                        type="button"
                        class="btn btn-sm"
                        data-bs-toggle="tooltip"
                        data-bs-title="${layout.title}"
                        @click=${
                            event => layout.labels.length
                            ? event.currentTarget.parentElement.querySelector('.custom-labels').classList.toggle('hide')
                            : this.printAtlas(layout.title, layout.default_format)}
                        >
                            ${layout.icon
                            ? html`<img src="${mainLizmap.mediaURL}&path=${layout.icon}"/>`
                            : html`<svg>
                                    <use xlink:href="#map-print"></use>
                                </svg>`
                            }
                    </button>
                    ${layout.labels.length
                        ? html`<div class="custom-labels hide">
                            ${layout.labels.filter( label => !["lizmap_user", "lizmap_user_groups"].includes(label.id)).slice().reverse().map( label =>
                                label.htmlState
                                    ? html`
                                        <textarea
                                            class="input-medium custom-label"
                                            data-labelid="${label.id}"
                                            name="${label.id}"
                                            placeholder="${label.text}"
                                            >${label.text}</textarea>`
                                    : html`
                                        <input
                                            class="input-medium custom-label"
                                            type="text"
                                            size="15"
                                            data-labelid="${label.id}"
                                            name="${label.id}"
                                            placeholder="${label.text}"
                                            value="${label.text}"
                                            >`
                                )}
                                <button
                                    class="btn btn-primary btn-print-launch"
                                    @click=${() => { this.printAtlas(layout.title, layout.default_format) }}
                                    >${lizDict['print.launch']}</button>
                            </div>`
                        : ''
                    }
                </div>
            `)}

            ${this.editableChildrenLayers.length
                ? html`
                <div class="btn-group feature-create-child" style="margin-left: 0px;">
                    <button
                        type="button"
                        class="btn btn-sm dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        data-bs-title="${lizDict['attributeLayers.toolbar.btn.data.createFeature.title']}"
                        >
                        <i class="icon-plus-sign"></i>
                        <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu" role="menu">
                        ${this.editableChildrenLayers.map((child) =>
                            html`
                                <li>
                                    <a
                                        data-child-layer-id="${child.layerId}"
                                        @click=${() => this.createChild(child)}
                                        >${child.title}
                                    </a>
                                </li>
                            `)}
                    </ul>
                </div>
                `
                : ''
            }

        </div>`;

        render(this._mainTemplate(), this);

        this._editableFeaturesCallBack = (editableFeatures) => {
            this.updateIsFeatureEditable(editableFeatures.properties);
            render(this._mainTemplate(), this);
        };
    }

    connectedCallback() {
        mainEventDispatcher.addListener(
            () => {
                render(this._mainTemplate(), this);
            }, ['selection.changed', 'filteredFeatures.changed']
        );

        mainEventDispatcher.addListener(
            this._editableFeaturesCallBack,
            'edition.editableFeatures'
        );

        // Add tooltip on buttons
        const tooltipTriggerList = this.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
            trigger: 'hover',
            container:this
        }));
    }

    disconnectedCallback() {
        mainEventDispatcher.removeListener(
            () => {
                render(this._mainTemplate(), this);
            }, 'selection.changed'
        );

        mainEventDispatcher.removeListener(
            this._editableFeaturesCallBack,
            'edition.editableFeatures'
        );
    }

    get fid() {
        return this._fid;
    }

    get layerId() {
        return this._layerId;
    }

    get featureType() {
        return this._featureType;
    }

    get parentLayerId(){
        return this._parentLayerId;
    }

    get pivotLayerId(){
        const pivotAttributeLayerConf = lizMap.getLayerConfigById(
            this._pivotLayerId, lizMap.config.attributeLayers, 'layerId' );
        const config = lizMap.config;
        if (pivotAttributeLayerConf
            && pivotAttributeLayerConf[1]?.pivot == 'True'
            && config.relations.pivot
            && config.relations.pivot[this._pivotLayerId]
            && config.relations.pivot[this._pivotLayerId][this.layerId]
            && config.relations.pivot[this._pivotLayerId][this.parentLayerId]
        ){
            return this._pivotLayerId;
        }

        return null;

    }

    get isSelected() {
        const selectedFeatures = this._layerConfig?.['selectedFeatures'];
        return selectedFeatures && selectedFeatures.includes(this.fid);
    }

    get isFiltered() {
        const filteredFeatures = this._layerConfig?.['filteredFeatures'];
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

    get attributeTableConfig(){
        return lizMap.getLayerConfigById(this.layerId, lizMap.config.attributeLayers, 'layerId')?.[1];
    }

    get pivotAttributeTableConfig(){
        return lizMap.getLayerConfigById(this.pivotLayerId, lizMap.config.attributeLayers,'layerId')?.[1];
    }

    get isLayerEditable(){
        return lizMap.config?.editionLayers?.[this.featureType]?.capabilities?.modifyAttribute === "True"
            || lizMap.config?.editionLayers?.[this.featureType]?.capabilities?.modifyGeometry === "True";
    }

    get isNToMRelation() {
        if (this.pivotLayerId) return true;
        else return false;
    }

    get isUnlinkable(){
        return this.parentLayerId &&
            (this.isLayerEditable && !this.isNToMRelation) ||
            (lizMap.config?.editionLayers?.[this._pivotType]?.capabilities?.deleteFeature === "True" && this.isNToMRelation);
    }

    get pivotFeatureId(){
        const pivotLayerId = this.pivotLayerId;

        if(!pivotLayerId) return null;

        const parentLayerId = this.parentLayerId;
        const config = lizMap.config;

        // parent and current layer should be configured in relations object
        if (!(parentLayerId in config.relations) || !(this.layerId in config.relations) || !this._parentFeatureId){
            return null;
        }

        // pivot contains features?
        const features = config.layers[this._pivotType]['features'];
        if (!features || Object.keys(features).length <= 0){
            return null;
        }
        // get pivot primary key
        const primaryKey = this.pivotAttributeTableConfig?.['primaryKey'];
        if(!primaryKey){
            return null;
        }

        //get referencing field for the pivot
        const layerReferencingField = config.relations[this.layerId].filter((rel)=>{
            return rel.referencingLayer == pivotLayerId && rel.referencingField == config.relations.pivot[pivotLayerId][this.layerId]
        })?.[0]?.referencingField;

        const parentLayerReferencingField = config.relations[this.parentLayerId].filter((rel)=>{
            return rel.referencingLayer == pivotLayerId && rel.referencingField == config.relations.pivot[pivotLayerId][this.parentLayerId]
        })?.[0]?.referencingField;

        if (!layerReferencingField || !parentLayerReferencingField) return null;

        // get features from pivot corresponding to the current layer
        const pivotFeature = Object.keys(features).filter((feat) =>{
            const properties = features[feat].properties;
            return (
                properties &&
                properties[layerReferencingField] &&
                properties[layerReferencingField] == this.fid &&
                properties[parentLayerReferencingField] &&
                properties[parentLayerReferencingField] == this._parentFeatureId
            )
        })

        if (pivotFeature.length == 1 && features[pivotFeature[0]].properties[primaryKey]) {
            return features[pivotFeature[0]].properties[primaryKey]
        } else return null
    }

    /**
     * Feature can be deleted if it is editable & if it has delete capabilities & if layer is not pivot
     * If layer is a pivot, unlink button is displayed but a delete action is made instead
     * @readonly
     * @returns {boolean} - True if feature can be deleted
     */
    get isDeletable(){
        return this._isFeatureEditable
            && ((lizMap.config?.editionLayers?.[this.featureType]?.capabilities?.deleteFeature === "True"
            && !this.isNToMRelation) || (
                this.isNToMRelation &&
                lizMap.config?.editionLayers?.[this.featureType]?.capabilities?.deleteFeature === "True" &&
                lizMap.config?.editionLayers?.[this._pivotType]?.capabilities?.deleteFeature === "True"
            ));
    }

    get hasEditionRestricted(){
        return this.getAttribute('edition-restricted') === 'true';
    }

    /**
     * Return true if childLayer has a relation with parentLayer
     * @readonly
     * @returns {boolean} - True if childLayer has a relation with parentLayer
     */
    get hasRelation(){
        return (
            lizMap.config?.relations?.[this.parentLayerId]?.some((relation) => relation.referencingLayer === this.layerId));
    }

    /**
     * Return true if layer has geometry, WFS capability and popup_allow_download = true
     * @readonly
     * @returns {boolean} - True if layer has geometry, WFS capability and popup_allow_download = true
     */
    get isFeatureExportable(){
        return this.attributeTableConfig &&
                this.hasGeometry &&
                this._layerConfig?.popup_allow_download
    }

    get hasDefaultPopupPrint(){
        return mainLizmap.config?.layouts?.config?.default_popup_print;
    }

    get atlasLayouts() {
        const atlasLayouts = [];

        // Lizmap >= 3.7
        this._layouts = mainLizmap.config?.layouts;

        mainLizmap.config?.printTemplates.map((template, index) => {
            if (this._layerId === template?.atlas?.coverageLayer
                && (template?.atlas?.enabled === '1' || template?.atlas?.enabled === true)) {
                // Lizmap >= 3.7
                if (mainLizmap.config?.layouts?.list) {
                    if (mainLizmap.config?.layouts?.list?.[index]?.enabled) {
                        atlasLayouts.push({
                            title: mainLizmap.config?.layouts?.list?.[index]?.layout,
                            icon: mainLizmap.config?.layouts?.list?.[index]?.icon,
                            labels: template?.labels,
                            formats_available: mainLizmap.config?.layouts?.list?.[index]?.formats_available,
                            default_format: mainLizmap.config?.layouts?.list?.[index]?.default_format,
                        });
                    }
                    // Lizmap < 3.7
                } else {
                    atlasLayouts.push({
                        title: template?.title,
                        labels: template?.labels
                    });
                }
            }
        });

        return atlasLayouts;
    }


    /**
     * Return the list of children layers for which a feature can be created
     * @returns {Array} - List of children layers for which a feature can be created
     */
    get editableChildrenLayers() {
        const editableChildrenLayers = [];
        lizMap.config?.relations?.[this.layerId]?.some((relation) => {

            // Check if the child layer has insert capabilities
            let [childFeatureType, childLayerConfig] = lizMap.getLayerConfigById(relation.referencingLayer);
            let isPivot = (
                lizMap.config?.attributeLayers?.[childFeatureType]?.pivot === "True" &&
                !!lizMap.config?.relations?.pivot?.[relation.referencingLayer]
            )
            if (isPivot || lizMap.config?.editionLayers?.[childFeatureType]?.capabilities?.createFeature !== "True") {
                return;
            }
            editableChildrenLayers.push({
                'layerId': childLayerConfig.id,
                'layerName': childFeatureType,
                'title': childLayerConfig.title
            });
        })

        return editableChildrenLayers;
    }

    updateIsFeatureEditable(editableFeatures) {
        this._isFeatureEditable = false;
        for (const editableFeature of editableFeatures) {
            const [featureType, fid] = editableFeature.id.split('.');
            if(featureType === this.featureType && fid === this.fid){
                this._isFeatureEditable = true;
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
        if (this.getAttribute('crs')){
            const featureExtent = [
                parseFloat(this.getAttribute('bbox-minx')),
                parseFloat(this.getAttribute('bbox-miny')),
                parseFloat(this.getAttribute('bbox-maxx')),
                parseFloat(this.getAttribute('bbox-maxy'))
            ];
            const targetMapExtent = transformExtent(
                featureExtent,
                this.getAttribute('crs'),
                lizMap.mainLizmap.projection
            );

            let geom;
            // The geom is a Point
            if (targetMapExtent[0] == targetMapExtent[2] && targetMapExtent[1] == targetMapExtent[3]) {
                geom = new Point([targetMapExtent[0], targetMapExtent[1]])
            } else {
                geom = fromExtent(targetMapExtent);
            }

            mainLizmap.map.zoomToGeometryOrExtent(geom);
        } else {
            mainLizmap.map.zoomToFid(this.featureType + '.' + this.fid);
        }
    }

    center(){
        if (this.getAttribute('crs')) {
            const featureExtent = [
                parseFloat(this.getAttribute('bbox-minx')),
                parseFloat(this.getAttribute('bbox-miny')),
                parseFloat(this.getAttribute('bbox-maxx')),
                parseFloat(this.getAttribute('bbox-maxy'))
            ];
            const targetMapCenter = getCenter(transformExtent(
                featureExtent,
                this.getAttribute('crs'),
                lizMap.mainLizmap.projection
            ));
            lizMap.mainLizmap.center = targetMapCenter;
        } else {
            lizMap.zoomToFeature(this.featureType, this.fid, 'center');
        }
    }

    edit(){
        const parentFeatureId = this.getAttribute('parent-feature-id');
        if (parentFeatureId && this.hasRelation){
            const parentLayerName = lizMap.getLayerConfigById(this.parentLayerId)?.[0];
            lizMap.getLayerFeature(parentLayerName, parentFeatureId, (feat) => {
                lizMap.launchEdition(this.layerId, this.fid, { layerId: this.parentLayerId, feature: feat });
            });
        }else{
            lizMap.launchEdition(this.layerId, this.fid);
        }
    }

    delete(){
        // get list of tables that are linked to the pivot
        let relations = lizMap.config?.relations?.[this.layerId], message = "";
        if(relations && lizMap.config?.relations?.pivot){

            let pivotNames = relations.map((relation)=>{
                return relation.referencingLayer
            }).filter((refLayer)=>{
                const attributeTableConf = (
                    lizMap.getLayerConfigById(refLayer, lizMap.config.attributeLayers,'layerId')
                )
                return (
                    attributeTableConf &&
                    attributeTableConf[1]?.pivot == 'True' &&
                    refLayer &&
                    refLayer in lizMap.config.relations.pivot &&
                    Object.keys(lizMap.config.relations.pivot[refLayer]).some((kp)=>{return kp == this.layerId})
                )
            }).map((key)=>{
                let relatedLayerId = (
                    Object.keys(lizMap.config.relations.pivot[key]).filter((k)=> {
                        return k !== this.layerId
                    })?.[0])
                if (relatedLayerId) {
                    return (
                        lizMap.getLayerConfigById(relatedLayerId)?.[1]?.title ||
                        lizMap.getLayerConfigById(relatedLayerId)?.[1]?.name
                    )
                }
                else return "";
            }).reduce((acc,current)=> acc+"\n" +current,"")

            if (pivotNames) {
                message = lizDict['edition.confirm.pivot.delete'].replace('%s',pivotNames);
            }
        }

        lizMap.deleteEditionFeature(this.layerId, this.fid, message);
    }

    deleteFromPivot(){
        let pivotFeatureId = this.pivotFeatureId;
        if( pivotFeatureId ){
            let unlinkMessage = (
                lizDict['edition.confirm.pivot.unlink'].replace(
                    "%l", lizMap.getLayerConfigById(this.parentLayerId)[1].title
                )
            )
            lizMap.deleteEditionFeature(this.pivotLayerId, pivotFeatureId, unlinkMessage, ()=>{
                // refresh mlayer
                lizMap.events.triggerEvent("lizmapeditionfeaturedeleted",
                    {
                        'layerId': this.layerId,
                        'featureId': this.fid,
                        'featureType': this.featureType,
                        'updateDrawing': true
                    });
            });
        }
    }

    unlink(){
        // Get parent layer id
        const parentLayerId = this.parentLayerId;
        const config = lizMap.config;

        // Get foreign key column
        let fKey = null;
        if (!(parentLayerId in config.relations)){
            return false;
        }
        for (const rp in config.relations[parentLayerId]) {
            const rpItem = config.relations[parentLayerId][rp];
            if (rpItem.referencingLayer == this.layerId) {
                fKey = rpItem.referencingField
            } else {
                continue;
            }
        }
        if (!fKey)
            return false;

        // Get features for the child layer
        const features = config.layers[this.featureType]['features'];
        if (!features || Object.keys(features).length <= 0){
            return false;
        }

        // Get primary key value for clicked child item
        const primaryKey = this.attributeTableConfig?.['primaryKey'];
        if(!primaryKey){
            return false;
        }

        const afeat = features[this.fid];
        if (!afeat){
            return false;
        }

        let cPkeyVal = afeat.properties[primaryKey];
        // Check if pkey is integer
        if (!Number.isInteger(cPkeyVal)){
            cPkeyVal = " '" + cPkeyVal + "' ";
        }

        fetch(globalThis['lizUrls'].edition.replace('getFeature', 'unlinkChild'), {
            method: "POST",
            body: new URLSearchParams({
                repository: globalThis['lizUrls'].params.repository,
                project: globalThis['lizUrls'].params.project,
                lid: this.layerId,
                pkey: primaryKey,
                pkeyval: cPkeyVal,
                fkey: fKey
            })
        }).then(response => {
            return response.text();
        }).then( data => {
            // Show response message
            $('#lizmap-edition-message').remove();
            lizMap.addMessage(data, 'info', true).attr('id', 'lizmap-edition-message');

            // Send signal saying edition has been done on table
            lizMap.events.triggerEvent("lizmapeditionfeaturemodified",
                { 'layerId': this.layerId }
            );
        });
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

    export(format){
        lizMap.mainLizmap.wfs.getFeature({
            TYPENAME: this._typeName,
            FEATUREID: this._typeName + '.' + this._fid
        }).then(response => {
            if(format == 'GeoJSON'){
                Utils.downloadFileFromString(
                    JSON.stringify(response), 'application/geo+json', this.featureType + '.json'
                );
            }else{
                // Convert GeoJSON to GPX or KML
                const features = (new GeoJSON()).readFeatures(response);
                if(format == 'GPX'){
                    const gpx = (new GPX()).writeFeatures(features);
                    Utils.downloadFileFromString(
                        gpx,
                        'application/gpx+xml',
                        this.featureType + '.gpx'
                    );
                }else{
                    const kml = (new KML()).writeFeatures(features);
                    Utils.downloadFileFromString(
                        kml,
                        'application/vnd.google-earth.kml+xml',
                        this.featureType + '.kml'
                    );
                }
            }
        });
    }

    /**
     * Launch browser's print box with print_popup.css applied
     * to print current popup content
     */
    print() {
        // Clone popup and insert at begin of <body>
        const clonedPopup = document.querySelector('.lizmapPopupContent').cloneNode(true);
        clonedPopup.classList.add('print', 'hide');
        document.querySelector('body').insertAdjacentElement('afterbegin', clonedPopup);

        // Add special class to body to activate CSS in print_popup.css
        document.querySelector('body').classList.add('print_popup');

        // On afterprint event, delete clonedPopup + remove special class
        window.addEventListener('afterprint', () => {
            clonedPopup.remove();
            document.querySelector('body').classList.remove('print_popup');
        }, {
            once: true
        });

        // Launch print box
        window.print();
    }

    printAtlas(templateName, format) {
        const escapeFeatureId = (value) => {
            const valueType = typeof value;

            if (valueType === 'string') {
                const intRegex = /^[0-9]+$/;
                if( intRegex.test(value) ) {
                    // value is a string but represents an integer
                    // return unquoted string
                    return value;
                }

                // surround value with simple quotes and escape existing single-quote
                return `'${value.replaceAll("'", "''")}'`
            }

            // fallback: return value as-is
            return value;
        }

        const wmsParams = {
            SERVICE: 'WMS',
            REQUEST: 'GetPrintAtlas',
            VERSION: '1.3.0',
            FORMAT: format || 'pdf',
            EXCEPTION: 'application/vnd.ogc.se_inimage',
            TRANSPARENT: true,
            DPI: 100,
            TEMPLATE: templateName,
            LAYER: this._layerConfig?.shortname || this._layerConfig?.name,
            EXP_FILTER: '$id IN ('+ escapeFeatureId(this._fid) +')',
        };

        // Custom labels
        this.querySelectorAll(
            '.custom-labels:not(.hide) .custom-label'
        ).forEach(field => wmsParams[field.dataset.labelid] = field.value);

        // Disable buttons and display message while waiting for print
        this.querySelectorAll('.feature-atlas button').forEach(element => {
            element.disabled = true;
            if (element.classList.contains('btn-print-launch')) {
                element.classList.add('spinner');
            }
        });

        mainLizmap._lizmap3.addMessage(
            lizDict['print.started'],
            'info',
            true
        ).addClass('print-in-progress');

        Utils.downloadFile(mainLizmap.serviceURL, wmsParams, () => {
            this.querySelectorAll('.feature-atlas button').forEach(element => {
                element.disabled = false;
                if (element.classList.contains('btn-print-launch')) {
                    element.classList.remove('spinner');
                }
            });

            document.querySelector('#message .print-in-progress button').click();
        }, (errorEvent) => {
            console.error(errorEvent)
            mainLizmap._lizmap3.addMessage(
                lizDict['print.error'],
                'danger',
                true
            ).addClass('print-error');
        });
    }

    /**
     * Launch the creation of a new feature for the given child layer
     * @param {object} childItem - Child layer configuration
     */
    createChild(childItem) {
        // Get the parent feature corresponding to the popup
        // where the create child button has been clicked
        lizMap.getLayerFeature(this.featureType, this.fid, (parentFeature) => {
            lizMap.launchEdition(
                // Id of the layer to edit
                childItem.layerId,
                // Feature id (fid). Here null which means we want to create a new feature
                null,
                // Parent data
                { layerId: this.layerId, feature: parentFeature }
            );
        });
    }
}
