import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';

export default class Snapping {

    constructor() {

        this._active = false;
        this._snapLayersRefreshable = false;

        this._maxFeatures = 1000;
        this._restrictToMapExtent = true;
        this._config = undefined;

        // Create layer to store snap features
        const snapLayer = new OpenLayers.Layer.Vector('snaplayer', {
            visibility: false,
            styleMap: new OpenLayers.StyleMap({
                pointRadius: 2,
                fill: false,
                stroke: true,
                strokeWidth: 3,
                strokeColor: 'red',
                strokeOpacity: 0.8
            })
        });

        mainLizmap.lizmap3.map.addLayer(snapLayer);

        const snapControl = new OpenLayers.Control.Snapping({
            layer: mainLizmap.edition.editLayer,
            targets: [{
                layer: snapLayer
            }]
        });
        mainLizmap.lizmap3.map.addControls([snapControl]);
        mainLizmap.lizmap3.controls['snapControl'] = snapControl;

        this._setSnapLayersRefreshable = () => {
            if(this._active){
                this.snapLayersRefreshable = true;
            }
        }

        // Activate snap when a layer is edited
        mainEventDispatcher.addListener(
            () => {
                // Get snapping configuration for edited layer
                for (const editionLayer in mainLizmap.config.editionLayers) {
                    if (mainLizmap.config.editionLayers.hasOwnProperty(editionLayer)) {
                        if (mainLizmap.config.editionLayers[editionLayer].layerId === mainLizmap.edition.layerId){
                            const editionLayerConfig = mainLizmap.config.editionLayers[editionLayer];
                            if (editionLayerConfig.hasOwnProperty('snap_layers') && editionLayerConfig.snap_layers.length > 0){
                                this.config = {
                                    'snap_layers': editionLayerConfig.snap_layers,
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
                    const snapControl = mainLizmap.lizmap3.controls.snapControl;

                    // Set edition layer as main layer
                    snapControl.setLayer(mainLizmap.edition.editLayer);

                    snapControl.targets[0].node = this._config.snap_vertices;
                    snapControl.targets[0].vertex = this._config.snap_intersections;
                    snapControl.targets[0].edge = this._config.snap_segments;
                    snapControl.targets[0].nodeTolerance = this._config.snap_vertices_tolerance;
                    snapControl.targets[0].vertexTolerance = this._config.snap_intersections_tolerance;
                    snapControl.targets[0].edgeTolerance = this._config.snap_segments_tolerance;

                    // Listen to moveend event to able data refreshing
                    mainEventDispatcher.addListener(
                        this._setSnapLayersRefreshable,
                        'map.moveend'
                    );
                }
            },
            'edition.formDisplayed'
        );

        // Clean snap when edition ends
        mainEventDispatcher.addListener(
            () => {
                this.active = false;
                mainLizmap.lizmap3.map.getLayersByName('snaplayer')[0].destroyFeatures();
                this.config = undefined;

                // Remove listener to moveend event
                mainEventDispatcher.removeListener(
                    this._setSnapLayersRefreshable,
                    'map.moveend'
                );
            },
            'edition.formClosed'
        );
    }

    getSnappingData () {
        // Empty snapping layer first
        mainLizmap.lizmap3.map.getLayersByName('snaplayer')[0].destroyFeatures();

        // TODO : group aync calls with Promises
        for (const snapLayer of this._config.snap_layers) {

            lizMap.getFeatureData(mainLizmap.lizmap3.getLayerConfigById(snapLayer)[0], null, null, 'geom', this._restrictToMapExtent, null, this._maxFeatures,
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
                        internalProjection: mainLizmap.projection
                    });

                    const tfeatures = gFormat.read({
                        type: 'FeatureCollection',
                        features: fFeatures
                    });

                    // Add features
                    mainLizmap.lizmap3.map.getLayersByName('snaplayer')[0].addFeatures(tfeatures);
                });
        }

        this.snapLayersRefreshable = false;
    }

    toggle(){
        this.active = !this._active;
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
            mainLizmap.lizmap3.controls.snapControl.activate();
        } else {
            // Disable refresh button when snapping is inactive
            this.snapLayersRefreshable = false;
            mainLizmap.lizmap3.controls.snapControl.deactivate();
        }

        // Set snap layer visibility
        mainLizmap.lizmap3.map.getLayersByName('snaplayer')[0].setVisibility(this._active);

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
