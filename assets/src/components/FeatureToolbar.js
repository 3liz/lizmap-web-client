import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import Utils from '../modules/Utils.js';
import { html, render } from 'lit-html';

import { transformExtent } from 'ol/proj.js';
import { getCenter } from 'ol/extent.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import GPX from 'ol/format/GPX.js';
import KML from 'ol/format/KML.js';

import '../images/svg/map-print.svg';

export default class FeatureToolbar extends HTMLElement {
    constructor() {
        super();

        [this._layerId, this._fid] = this.getAttribute('value').split('.');
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
            <button type="button" class="btn btn-mini feature-select ${this.attributeTableConfig ? '' : 'hide'} ${this.isSelected ? 'btn-primary' : ''}" @click=${() => this.select()} title="${lizDict['attributeLayers.btn.select.title']}"><i class="icon-ok"></i></button>
            <button type="button" class="btn btn-mini feature-filter ${this.attributeTableConfig && this.hasFilter ? '' : 'hide'} ${this.isFiltered ? 'btn-primary' : ''}" @click=${() => this.filter()} title="${lizDict['attributeLayers.toolbar.btn.data.filter.title']}"><i class="icon-filter"></i></button>
            <button type="button" class="btn btn-mini feature-zoom ${this.getAttribute('crs') || (this.attributeTableConfig && this.hasGeometry) ? '' : 'hide'}" @click=${() => this.zoom()} title="${lizDict['attributeLayers.btn.zoom.title']}"><i class="icon-zoom-in"></i></button>
            <button type="button" class="btn btn-mini feature-center ${this.getAttribute('crs') || (this.attributeTableConfig && this.hasGeometry) ? '' : 'hide'}"  @click=${() => this.center()} title="${lizDict['attributeLayers.btn.center.title']}"><i class="icon-screenshot"></i></button>
            <button type="button" class="btn btn-mini feature-edit ${this.isLayerEditable && this._isFeatureEditable ? '' : 'hide'}" @click=${() => this.edit()} title="${lizDict['attributeLayers.btn.edit.title']}"><i class="icon-pencil"></i></button>
            <button type="button" class="btn btn-mini feature-delete ${this.isDeletable ? '' : 'hide'}" @click=${() => this.delete()} title="${lizDict['attributeLayers.btn.delete.title']}"><i class="icon-trash"></i></button>
            <button type="button" class="btn btn-mini feature-unlink ${this.isUnlinkable ? '' : 'hide'}" @click=${() => this.isLayerPivot ? this.delete() : this.unlink()} title="${lizDict['attributeLayers.btn.remove.link.title']}"><i class="icon-minus"></i></button>


            ${this.isFeatureExportable
                ? html`<div class="btn-group feature-export">
                        <button type="button" class="btn btn-mini dropdown-toggle" data-toggle="dropdown" title="${lizDict['attributeLayers.toolbar.btn.data.export.title']}">
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
            ? html`<button type="button" class="btn btn-mini feature-print" @click=${() => this.print()} title="${lizDict['print.launch']}"><i class="icon-print"></i></button>`
            : ''
            }

            ${this.atlasLayouts.map( layout => html`
                <div class="feature-atlas">
                    <button type="button" class="btn btn-mini" title="${layout.title}" @click=${
                        event => layout.labels.length
                        ? event.currentTarget.parentElement.querySelector('.custom-labels').classList.toggle('hide')
                        : this.printAtlas(layout.title)}>
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
                                    ? html`<textarea class="input-medium custom-label" data-labelid="${label.id}" name="${label.id}" placeholder="${label.text}">${label.text}</textarea>`
                                    : html`<input class="input-medium custom-label" type="text" size="15" data-labelid="${label.id}" name="${label.id}" placeholder="${label.text}" value="${label.text}">`
                                )}
                                <button class="btn btn-primary btn-print-launch" @click=${() => { this.printAtlas(layout.title) }}>${lizDict['print.launch']}</button>
                            </div>`
                        : ''
                    }
                </div>
            `)}

            ${this.editableChildrenLayers.length
                ? html`
                <div class="btn-group feature-create-child" style="margin-left: 0px;">
                    <button type="button" class="btn btn-mini dropdown-toggle" data-toggle="dropdown" title="${lizDict['attributeLayers.toolbar.btn.data.createFeature.title']}">
                        <i class="icon-plus-sign"></i>
                        <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu pull-right" role="menu">
                        ${this.editableChildrenLayers.map((child) =>
                            html`<li><a data-child-layer-id="${child.layerId}" @click=${() => this.createChild(child)}>${child.title}</a></li>`)}
                    </ul>
                </div>
                `
                : ''
            }

        </div>`;

        render(this._mainTemplate(), this);

        // Add tooltip on buttons
        $('.btn', this).tooltip({
            placement: 'top'
        });

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

    get isLayerEditable(){
        return lizMap.config?.editionLayers?.[this.featureType]?.capabilities?.modifyAttribute === "True"
            || lizMap.config?.editionLayers?.[this.featureType]?.capabilities?.modifyGeometry === "True";
    }

    get isLayerPivot(){
        return this.attributeTableConfig?.['pivot'] === 'True';
    }

    get isUnlinkable(){
        return this.parentLayerId &&
            (this.isLayerEditable && !this.isLayerPivot) ||
            (lizMap.config?.editionLayers?.[this.featureType]?.capabilities?.deleteFeature === "True" && this.isLayerPivot);
    }

    /**
     * Feature can be deleted if it is editable & if it has delete capabilities & if layer is not pivot
     * If layer is a pivot, unlink button is displayed but a delete action is made instead
     * @readonly
     */
    get isDeletable(){
        return this._isFeatureEditable
            && lizMap.config?.editionLayers?.[this.featureType]?.capabilities?.deleteFeature === "True"
            && !this.isLayerPivot;
    }

    get hasEditionRestricted(){
        return this.getAttribute('edition-restricted') === 'true';
    }

    /**
     * Return true if childLayer has a relation with parentLayer
     *
     * @readonly
     */
    get hasRelation(){
        return lizMap.config?.relations?.[this.parentLayerId]?.some((relation) => relation.referencingLayer === this.layerId);
    }

    /**
     * Return true if layer has geometry, WFS capability and popup_allow_download = true
     *
     * @readonly
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
            if (this._layerId === template?.atlas?.coverageLayer && template?.atlas?.enabled === '1') {
                // Lizmap >= 3.7
                if (mainLizmap.config?.layouts?.list) {
                    if (mainLizmap.config?.layouts?.list?.[index]?.enabled) {
                        atlasLayouts.push({
                            title: mainLizmap.config?.layouts?.list?.[index]?.layout,
                            icon: mainLizmap.config?.layouts?.list?.[index]?.icon,
                            labels: template?.labels
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
     *
     * @return array
     */
    get editableChildrenLayers() {
        const editableChildrenLayers = [];
        lizMap.config?.relations?.[this.layerId]?.some((relation) => {

            // Check if the child layer has insert capabilities
            let [childFeatureType, childLayerConfig] = lizMap.getLayerConfigById(relation.referencingLayer);
            if (lizMap.config?.editionLayers?.[childFeatureType]?.capabilities?.createFeature !== "True") {
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
        lizMap.deleteEditionFeature(this.layerId, this.fid);
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

        fetch(lizUrls.edition.replace('getFeature', 'unlinkChild'), {
            method: "POST",
            body: new URLSearchParams({
                repository: lizUrls.params.repository,
                project: lizUrls.params.project,
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
                Utils.downloadFileFromString(JSON.stringify(response), 'application/geo+json', this.featureType + '.json');
            }else{
                // Convert GeoJSON to GPX or KML
                const features = (new GeoJSON()).readFeatures(response);
                if(format == 'GPX'){
                    const gpx = (new GPX()).writeFeatures(features);
                    Utils.downloadFileFromString(gpx, 'application/gpx+xml', this.featureType + '.gpx');
                }else{
                    const kml = (new KML()).writeFeatures(features);
                    Utils.downloadFileFromString(kml, 'application/vnd.google-earth.kml+xml', this.featureType + '.kml');
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

    printAtlas(templateName) {
        const projectProjection = mainLizmap.config.options.qgisProjectProjection.ref;
        const wmsParams = {
            SERVICE: 'WMS',
            REQUEST: 'GetPrint',
            VERSION: '1.3.0',
            FORMAT: 'pdf',
            TRANSPARENT: true,
            SRS: projectProjection,
            DPI: 100,
            TEMPLATE: templateName,
            ATLAS_PK: this._fid
        };

        // Add layers
        const layers = [];

        // Get active baselayer, and add the corresponding QGIS layer if needed
        const activeBaseLayerName = mainLizmap._lizmap3.map.baseLayer.name;
        const externalBaselayersReplacement = mainLizmap._lizmap3.getExternalBaselayersReplacement();
        const exbl = externalBaselayersReplacement?.[activeBaseLayerName];
        if (this._layerConfig?.[exbl]) {
            const activeBaseLayerConfig = this._layerConfig[exbl];
            if (activeBaseLayerConfig?.id && mainLizmap.config.options?.useLayerIDs == 'True') {
                layers.push(activeBaseLayerConfig.id);
            } else {
                layers.push(exbl);
            }
        }

        layers.push(this._typeName);

        wmsParams['LAYERS'] = layers.join(',');

        // Custom labels
        this.querySelectorAll('.custom-labels:not(.hide) .custom-label').forEach(field => wmsParams[field.dataset.labelid] = field.value);

        // Disable buttons and display message while waiting for print
        this.querySelectorAll('.feature-atlas button').forEach(element => {
            element.disabled = true;
            if (element.classList.contains('btn-print-launch')) {
                element.classList.add('spinner');
            }
        });

        mainLizmap._lizmap3.addMessage(lizDict['print.started'], 'info', true).addClass('print-in-progress');

        Utils.downloadFile(mainLizmap.serviceURL, wmsParams, () => {
            this.querySelectorAll('.feature-atlas button').forEach(element => {
                element.disabled = false;
                if (element.classList.contains('btn-print-launch')) {
                    element.classList.remove('spinner');
                }
            });

            document.querySelector('#message .print-in-progress a').click();
        });
    }

    /**
     * Launch the creation of a new feature for the given child layer
     *
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
