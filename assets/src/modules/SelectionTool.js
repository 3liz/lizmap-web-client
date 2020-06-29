import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';

export default class SelectionTool {

    constructor() {

        this._layers = [];
        this._allFeatureTypeSelected = [];

        this._geomOperator = 'intersects';

        this._newAddRemove = ['new', 'add', 'remove'];
        this._newAddRemoveSelected = this._newAddRemove[0];

        // Verifying WFS layers
        const featureTypes = mainLizmap.vectorLayerFeatureTypes;
        if (featureTypes.length === 0) {
            if (document.getElementById('button-selectiontool')) {
                document.getElementById('button-selectiontool').parentNode.remove();
            }
            return false;
        }

        const config = mainLizmap.config;
        const layersSorted = [];

        for (const attributeLayerName in config.attributeLayers) {
            if (config.attributeLayers.hasOwnProperty(attributeLayerName)) {
                for (const featureType of featureTypes) {
                    const lname = mainLizmap.getNameByTypeName(featureType.getElementsByTagName('Name')[0].textContent);

                    if (attributeLayerName === lname
                        && lname in config.layers
                        && config.layers[lname]['geometryType'] != 'none'
                        && config.layers[lname]['geometryType'] != 'unknown') {

                        layersSorted[config.attributeLayers[attributeLayerName].order] = {
                            name: lname,
                            title: config.layers[lname].title
                        };
                    }
                }
            }
        }

        for (const params of layersSorted) {
            if (params !== undefined) {
                this._layers.push(params);
                this._allFeatureTypeSelected.push(params.name);
            }
        }

        if (this._layers.length === 0) {
            if (document.getElementById('button-selectiontool')) {
                document.getElementById('button-selectiontool').parentNode.remove();
            }
            return false;
        }

        // List of WFS format
        this._exportFormats = mainLizmap.vectorLayerResultFormat.filter(
            format => !['GML2', 'GML3', 'GEOJSON'].includes(format.tagName)
        );

        // Listen to digitizing tool to query a selection when tool is active and a feature is drawn
        mainEventDispatcher.addListener(
            () => {
                if(this.isActive){
                    for (const featureType of this.allFeatureTypeSelected) {
                        mainLizmap.lizmap3.selectLayerFeaturesFromSelectionFeature(featureType, mainLizmap.digitizing.featureDrawn, this._geomOperator);
                    }
                }
            },
            ['digitizing.featureDrawn']
        );

        mainLizmap.lizmap3.events.on({
            'layerSelectionChanged': () => {
                mainEventDispatcher.dispatch('selectionTool.selectionChanged');
            },
            'layerFilteredFeaturesChanged': () => {
                mainEventDispatcher.dispatch('selectionTool.filteredFeaturesChanged');
            }
        });
    }

    
    /**
     * Is selection tool active or not
     * @todo active state should be set on UI's events
     * @readonly
     * @memberof SelectionTool
     * @return {boolean}
     */
    get isActive() {
        return document.getElementById('button-selectiontool').parentElement.classList.contains('active')
    }

    get layers() {
        return this._layers;
    }

    get exportFormats() {
        return this._exportFormats;
    }

    get selectedFeaturesCount() {
        let count = 0;

        for (const featureType of this.allFeatureTypeSelected) {
            if (featureType in mainLizmap.config.layers &&
                'selectedFeatures' in mainLizmap.config.layers[featureType]
                && mainLizmap.config.layers[featureType]['selectedFeatures'].length) {
                count += mainLizmap.config.layers[featureType]['selectedFeatures'].length;
            }
        }

        return count;
    }

    get filterActive() {
        return mainLizmap.lizmap3.lizmapLayerFilterActive;
    }

    set filterActive(active) {
        mainLizmap.lizmap3.lizmapLayerFilterActive = active;
    }

    get filteredFeaturesCount() {
        let count = 0;

        for (const featureType of this.allFeatureTypeSelected) {
            if (featureType in mainLizmap.config.layers &&
                'filteredFeatures' in mainLizmap.config.layers[featureType]) {
                count += mainLizmap.config.layers[featureType]['filteredFeatures'].length;
            }
        }

        return count;
    }

    get allFeatureTypeSelected() {
        return this._allFeatureTypeSelected;
    }

    set allFeatureTypeSelected(featureType) {
        if (this._allFeatureTypeSelected !== featureType) {
            if (featureType === 'selectable-layers') {
                this._allFeatureTypeSelected = this.layers.map(layer => layer.name);
            } else if (featureType === 'selectable-visible-layers') {
                this._allFeatureTypeSelected = this.layers.map(layer => layer.name).filter(layerName => {
                    for (let index = 0; index < mainLizmap.lizmap3.map.layers.length; index++) {
                        if (mainLizmap.lizmap3.map.layers[index].visibility
                            && mainLizmap.lizmap3.map.layers[index].name === layerName) {
                            return true;
                        }
                    }
                });
            } else {
                this._allFeatureTypeSelected = [featureType];
            }

            mainEventDispatcher.dispatch('selectionTool.allFeatureTypeSelected');
        }
    }

    set geomOperator(geomOperator) {
        if (this._geomOperator !== geomOperator) {
            this._geomOperator = geomOperator;
        }
    }

    get newAddRemoveSelected() {
        return this._newAddRemoveSelected;
    }

    set newAddRemoveSelected(newAddRemove) {
        if (this._newAddRemove.includes(newAddRemove)) {
            this._newAddRemoveSelected = newAddRemove;

            mainEventDispatcher.dispatch('selectionTool.newAddRemoveSelected');
        }
    }

    disable() {
        if (this.isActive) {
            document.getElementById('button-selectiontool').click();
        }
    }

    unselect() {
        for (const featureType of this.allFeatureTypeSelected) {
            mainLizmap.lizmap3.events.triggerEvent('layerfeatureunselectall',
                {'featureType': featureType, 'updateDrawing': true}
            );
        }
        mainLizmap.digitizing.drawLayer.destroyFeatures();
        mainLizmap.digitizing.bufferLayer.destroyFeatures();
    }

    filter() {
        if (this.filteredFeaturesCount) {
            for (const featureType of this.allFeatureTypeSelected) {
                mainLizmap.lizmap3.events.triggerEvent('layerfeatureremovefilter',
                    {'featureType': featureType}
                );
            }
            this.filterActive = null;
        } else {
            for (const featureType of this.allFeatureTypeSelected) {
                if (featureType in mainLizmap.config.layers &&
                    'selectedFeatures' in mainLizmap.config.layers[featureType]
                    && mainLizmap.config.layers[featureType]['selectedFeatures'].length) {
                    this.filterActive = featureType;

                    mainLizmap.lizmap3.events.triggerEvent('layerfeaturefilterselected',
                        {'featureType': featureType}
                    );
                }
            }
        }
    }

    // Invert selection on a single layer
    invert(mfeatureType) {
        const featureType = mfeatureType ? mfeatureType : this.allFeatureTypeSelected[0];

        if (featureType in mainLizmap.config.layers &&
            'selectedFeatures' in mainLizmap.config.layers[featureType]
            && mainLizmap.config.layers[featureType]['selectedFeatures'].length) {

            // Get all features
            mainLizmap.lizmap3.getFeatureData(featureType, null, null, 'extent', false, null, null,
                (aName, aFilter, cFeatures, cAliases) => {
                    const invertSelectionIds = [];
                    for (const feat of cFeatures) {
                        const fid = feat.id.split('.')[1];

                        if (!mainLizmap.config.layers[aName]['selectedFeatures'].includes(fid)) {
                            invertSelectionIds.push(fid);
                        }
                    }

                    mainLizmap.config.layers[featureType]['selectedFeatures'] = invertSelectionIds;

                    mainLizmap.lizmap3.events.triggerEvent('layerSelectionChanged',
                        {
                            'featureType': featureType,
                            'featureIds': '40',
                            'updateDrawing': true
                        }
                    );
                });
        }
    }

    export(format) {
        if (format == 'GML') {
            format = 'GML3';
        }
        mainLizmap.lizmap3.exportVectorLayer(this.allFeatureTypeSelected, format, false);
    }
}
