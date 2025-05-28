/**
 * @module modules/Snapping.js
 * @name Snapping
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import { mainEventDispatcher } from '../modules/Globals.js';
import Edition from './Edition.js';
import { MapRootState } from './state/MapLayer.js';
import { TreeRootState } from './state/LayerTree.js';

/**
 * @class
 * @name Snapping
 */
export default class Snapping {

    /**
     * Create a snapping instance
     * @param {Edition}       edition      - The edition module
     * @param {MapRootState}  rootMapGroup - Root map group
     * @param {TreeRootState} layerTree    - Root tree layer group
     * @param {object}        lizmap3      - The old lizmap object
     */
    constructor(edition, rootMapGroup, layerTree, lizmap3) {

        this._edition = edition;
        this._rootMapGroup = rootMapGroup;
        this._layerTree = layerTree;
        this._lizmap3 = lizmap3;

        this._active = false;
        this._snapLayersRefreshable = false;

        this._maxFeatures = 1000;
        this._restrictToMapExtent = true;
        this._config = undefined;
        this._snapEnabled = {};
        this._snapToggled = {};
        this._snapLayers = [];

        // Create layer to store snap features
        const snapLayer = new OpenLayers.Layer.Vector('snaplayer', {
            visibility: false,
            styleMap: new OpenLayers.StyleMap({
                pointRadius: 2,
                fill: false,
                stroke: false,
                strokeWidth: 3,
                strokeColor: 'red',
                strokeOpacity: 0.8
            })
        });

        this._lizmap3.map.addLayer(snapLayer);

        const snapControl = new OpenLayers.Control.Snapping({
            layer: this._edition.editLayer,
            targets: [{
                layer: snapLayer
            }]
        });
        this._lizmap3.map.addControls([snapControl]);
        this._lizmap3.controls['snapControl'] = snapControl;

        this._setSnapLayersRefreshable = () => {
            if(this._active){
                this.snapLayersRefreshable = true;
            }
        }

        this._setSnapLayersVisibility = () => {
            if(this._active){
                this._snapLayers.forEach((layer)=>{
                    this._snapEnabled[layer] = this.getLayerTreeVisibility(layer);
                })

                this._sortSnapLayers();
                const config = structuredClone(this._config);
                config.snap_layers = this._snapLayers;
                config.snap_enabled = this._snapEnabled;

                this.config = config;
                this.snapLayersRefreshable = true;

                // dispatch an event, it might be useful to know when the list of visible layer for snap changed
                mainEventDispatcher.dispatch('snapping.layer.visibility.changed');
            }
        }

        this._sortSnapLayers = () => {
            let snapLayers = [...this._snapLayers];
            let visibleLayers = [];
            for (let id in this._snapEnabled) {
                if(this._snapEnabled[id]){
                    let visibileLayer = snapLayers.splice(snapLayers.indexOf(id),1)
                    visibleLayers = visibleLayers.concat(visibileLayer)
                }
            }
            visibleLayers.sort();
            snapLayers.sort();
            this._snapLayers = visibleLayers.concat(snapLayers);
        }

        // Activate snap when a layer is edited
        mainEventDispatcher.addListener(
            () => {
                // Get snapping configuration for edited layer
                for (const editionLayer in this._lizmap3.config.editionLayers) {
                    if (this._lizmap3.config.editionLayers.hasOwnProperty(editionLayer)) {
                        if (this._lizmap3.config.editionLayers[editionLayer].layerId === this._edition.layerId){
                            const editionLayerConfig = this._lizmap3.config.editionLayers[editionLayer];
                            if (editionLayerConfig.hasOwnProperty('snap_layers') && editionLayerConfig.snap_layers.length > 0){

                                this._snapLayers = [...editionLayerConfig.snap_layers];
                                this._snapLayers.forEach((layer)=>{
                                    this._snapEnabled[layer] = this.getLayerTreeVisibility(layer);
                                })
                                this._snapLayers.forEach((layer)=>{
                                    // on init enable snap by default on visible layers
                                    this._snapToggled[layer] = this.getLayerTreeVisibility(layer);
                                })

                                // sorting of layers by name and put disabled layers on bottom of the list
                                this._sortSnapLayers();

                                this.config = {
                                    'snap_layers': this._snapLayers,
                                    'snap_enabled': this._snapEnabled,
                                    'snap_on_layers':this._snapToggled,
                                    'snap_vertices': (editionLayerConfig.hasOwnProperty('snap_vertices') && editionLayerConfig.snap_vertices === 'True') ? true : false,
                                    'snap_segments': (editionLayerConfig.hasOwnProperty('snap_segments') && editionLayerConfig.snap_segments === 'True') ? true : false,
                                    'snap_intersections': (editionLayerConfig.hasOwnProperty('snap_intersections') && editionLayerConfig.snap_intersections === 'True') ? true : false,
                                    'snap_vertices_tolerance': editionLayerConfig.hasOwnProperty('snap_vertices_tolerance') ? editionLayerConfig.snap_vertices_tolerance : 10,
                                    'snap_segments_tolerance': editionLayerConfig.hasOwnProperty('snap_segments_tolerance') ? editionLayerConfig.snap_segments_tolerance : 10,
                                    'snap_intersections_tolerance': editionLayerConfig.hasOwnProperty('snap_intersections_tolerance') ? editionLayerConfig.snap_intersections_tolerance : 10
                                };
                            }
                        }
                    }
                }

                if (this._config !== undefined){
                    // Configure snapping
                    const snapControl = this._lizmap3.controls.snapControl;

                    // Set edition layer as main layer
                    snapControl.setLayer(this._edition.editLayer);

                    snapControl.targets[0].node = this._config.snap_vertices;
                    snapControl.targets[0].vertex = this._config.snap_intersections;
                    snapControl.targets[0].edge = this._config.snap_segments;
                    snapControl.targets[0].nodeTolerance = this._config.snap_vertices_tolerance;
                    snapControl.targets[0].vertexTolerance = this._config.snap_intersections_tolerance;
                    snapControl.targets[0].edgeTolerance = this._config.snap_segments_tolerance;

                    // Listen to moveend event and to layers visibility changes to able data refreshing
                    this._lizmap3.map.events.register('moveend', this, this._setSnapLayersRefreshable);
                    this._rootMapGroup.addListener(
                        this._setSnapLayersVisibility,
                        ['layer.visibility.changed','group.visibility.changed']
                    );
                }
            },
            'edition.formDisplayed'
        );

        // Clean snap when edition ends
        mainEventDispatcher.addListener(
            () => {
                this.active = false;
                this._lizmap3.map.getLayersByName('snaplayer')[0].destroyFeatures();
                this.config = undefined;

                // Remove listener to moveend event to layers visibility event
                this._lizmap3.map.events.unregister('moveend', this, this._setSnapLayersRefreshable);
                this._rootMapGroup.removeListener(
                    this._setSnapLayersVisibility,
                    ['layer.visibility.changed','group.visibility.changed']
                )
            },
            'edition.formClosed'
        );
    }

    getSnappingData () {
        // Empty snapping layer first
        this._lizmap3.map.getLayersByName('snaplayer')[0].destroyFeatures();

        // filter only visible layers and toggled layers on the the snap list
        const currentSnapLayers = this._snapLayers.filter(
            (layerId) => this._snapEnabled[layerId] && this._snapToggled[layerId]
        );

        // TODO : group aync calls with Promises
        for (const snapLayer of currentSnapLayers) {

            lizMap.getFeatureData(this._lizmap3.getLayerConfigById(snapLayer)[0], null, null, 'geom', this._restrictToMapExtent, null, this._maxFeatures,
                (fName, fFilter, fFeatures) => {

                    // Transform features
                    const snapLayerConfig = lizMap.config.layers[fName];
                    let snapLayerCrs = snapLayerConfig['featureCrs'];
                    if (!snapLayerCrs) {
                        snapLayerCrs = snapLayerConfig['crs'];
                    }

                    // TODO : use OL 6 instead ?
                    const gFormat = new OpenLayers.Format.GeoJSON({
                        ignoreExtraDims: true,
                        externalProjection: snapLayerCrs,
                        internalProjection: this._lizmap3.map.getProjection()
                    });

                    const tfeatures = gFormat.read({
                        type: 'FeatureCollection',
                        features: fFeatures
                    });

                    // Add features
                    this._lizmap3.map.getLayersByName('snaplayer')[0].addFeatures(tfeatures);
                });
        }

        this.snapLayersRefreshable = false;
    }

    toggle(){
        this.active = !this._active;
    }
    /**
     * Getting the layer visibility from the layer tree state
     * @param   {string} layerId - the layer id
     * @returns {boolean} the layer visibility
     */
    getLayerTreeVisibility(layerId){
        let visible = false;
        let layerConfig = this._lizmap3.getLayerConfigById(layerId);

        if(layerConfig && layerConfig[0]) {
            try {
                visible = this._layerTree.getTreeLayerByName(layerConfig[0]).visibility
            } catch {
                visible = false
            }
        }
        return visible;
    }
    /**
     * Getting the layer tile or the layer name for snap layers list
     * @param   {string} layerId - the layer id
     * @returns {string} the layer title or layer name
     */
    getLayerTitle(layerId){
        let layerConfig = this._lizmap3.getLayerConfigById(layerId);
        if (layerConfig) {
            return layerConfig[1].title || layerConfig[1].name;
        }
        return "";
    }

    get snapEnabled(){
        return this._snapEnabled;
    }

    set snapToggled(layerId){
        this._snapToggled[layerId] = !this._snapToggled[layerId];

        const config = structuredClone(this._config);
        config.snap_on_layers = this._snapToggled;

        this.config = config;
        this.snapLayersRefreshable = true;
    }

    get snapLayersRefreshable(){
        return this._snapLayersRefreshable;
    }

    set snapLayersRefreshable(refreshable) {
        this._snapLayersRefreshable = refreshable;
        mainEventDispatcher.dispatch('snapping.refreshable');
    }

    get active() {
        return this._active;
    }

    set active(active) {
        this._active = active;

        // (de)activate snap control
        if (this._active) {
            this.getSnappingData();
            this._lizmap3.controls.snapControl.activate();
        } else {
            // Disable refresh button when snapping is inactive
            this.snapLayersRefreshable = false;
            this._lizmap3.controls.snapControl.deactivate();
        }

        // Set snap layer visibility
        this._lizmap3.map.getLayersByName('snaplayer')[0].setVisibility(this._active);

        mainEventDispatcher.dispatch('snapping.active');
    }

    get config() {
        return this._config;
    }

    set config(config) {
        this._config = config;

        mainEventDispatcher.dispatch('snapping.config');
    }
}
