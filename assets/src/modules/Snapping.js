import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';

export default class Snapping {

    constructor() {

        this._maxFeatures = 1000;
        this._restrictToMapExtent = true;
        this._config = undefined;

        // Create layer to store snap features
        const snapLayer = new OpenLayers.Layer.Vector('snaplayer', {
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

        // Activate snap when a layer is edited
        mainEventDispatcher.addListener(
            () => {
                // Get snapping configuration for edited layer
                for (const editionLayer in mainLizmap.config.editionLayers) {
                    if (mainLizmap.config.editionLayers.hasOwnProperty(editionLayer)) {
                        if (mainLizmap.config.editionLayers[editionLayer].layerId === mainLizmap.edition.layerId){
                            const editionLayerConfig = mainLizmap.config.editionLayers[editionLayer];
                            if (editionLayerConfig.hasOwnProperty('snap_layers')){
                                this._config = {
                                    'snap_layers': editionLayerConfig.snap_layers.split(','),
                                    'snap_vertices': editionLayerConfig.snap_vertices === 'True' ? true : false,
                                    'snap_segments': editionLayerConfig.snap_segments === 'True' ? true : false,
                                    'snap_intersections': editionLayerConfig.snap_intersections === 'True' ? true : false
                                };
                            }
                        }
                    }
                }

                if (this._config !== undefined){
                    // Empty snapping layer first
                    mainLizmap.lizmap3.map.getLayersByName('snaplayer')[0].destroyFeatures();

                    for (const snapLayer of this._config.snap_layers) {

                        lizMap.getFeatureData(mainLizmap.lizmap3.getLayerConfigById(snapLayer)[0], null, null, 'geom', this._restrictToMapExtent, null, this._maxFeatures,
                            (fName, fFilter, fFeatures, fAliases) => {

                                // Transform features
                                const snapLayerConfig = lizMap.config.layers[fName];
                                let snapLayerCrs = snapLayerConfig['featureCrs'];
                                if (!snapLayerCrs){
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

                    // Activate snapping
                    const snapControl = mainLizmap.lizmap3.controls.snapControl;

                    // Set edition layer as
                    snapControl.setLayer(mainLizmap.edition.editLayer);

                    snapControl.targets[0].node = this._config.snap_vertices;
                    snapControl.targets[0].vertex = this._config.snap_intersections;
                    snapControl.targets[0].edge = this._config.snap_segments;
                    snapControl.activate();
                }
            },
            'edition.formDisplayed'
        );

        // deactivate snap when edition ends
        mainEventDispatcher.addListener(
            () => {
                mainLizmap.lizmap3.controls.snapControl.deactivate();
                mainLizmap.lizmap3.map.getLayersByName('snaplayer')[0].destroyFeatures();
            },
            'edition.formClosed'
        );
    }
}
