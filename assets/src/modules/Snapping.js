/**
 * @module modules/Snapping.js
 * @name Snapping
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import { Utils } from './Utils.js';
import { mainEventDispatcher } from '../modules/Globals.js';
import Edition from './Edition.js';
import { MapLayerLoadStatus, MapRootState } from './state/MapLayer.js';
import { TreeRootState } from './state/LayerTree.js';
import WFS from './WFS.js';
import { WKT } from 'ol/format.js';
import { Feature } from 'ol';
import { fromCircle } from 'ol/geom/Polygon.js';
import {
    Circle as CircleGeom,
} from 'ol/geom.js';
import Digitizing from './Digitizing.js';

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
     * @param {Digitizing}    digitizing   - The digitizing module
     */
    constructor(edition, rootMapGroup, layerTree, lizmap3, digitizing) {

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
        this._snapOnStart = false;
        this._pendingMapReadyListener = null;
        this._wfsErrorNotified = false;

        this._digitizing = digitizing;
        this._snapOnDrawings = false;
        this._snapType = null;

        // sketch geometry style when snapping to vertices/points
        this._snapOnPointStyle = {
            graphicName: "square",
            pointRadius: 6,
            fill:false,
            strokeColor: "#FF7F00",
            strokeWidth: 3
        }

        // sketch geometry style when snapping to segments edges
        this._snapOnEdgeStyle = {
            graphicName: "circle",
            pointRadius: 6,
            fill:false,
            strokeColor: "#FF7F00",
            strokeWidth: 3
        }

        // sketch geometry style when snapping to intersections
        this._snapOnIntersectionStyle = {
            graphicName: "cross",
            pointRadius: 8,
            rotation: 45,
            fillColor: "#FF7F00",
            strokeColor: "#FF7F00",
            strokeWidth: 1,
            strokeOpacity: 1
        }

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

        // create a layer to store drawings snap features.
        // The layer settings (visibility/style) are the same as those of the main "snapLayer".
        this._snapDrawingsLayer = new OpenLayers.Layer.Vector('snapDrawingsLayer', {
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
        this._lizmap3.map.addLayer(this._snapDrawingsLayer);
        this._snapLayer = snapLayer;

        const snapControl = new OpenLayers.Control.Snapping({
            layer: this._edition.editLayer,
            targets: [{
                layer: snapLayer
            }]
        });

        this._snapDrawingsControl = new OpenLayers.Control.Snapping({
            layer: this._edition.editLayer,
            targets: [{
                layer: this._snapDrawingsLayer,
                node:true,
                vertex:true,
                edge: true,
                // fixed tolerance
                nodeTolerance: 10,
                vertexTolerance: 10,
                edgeTolerance:10
            }]
        });

        this._lizmap3.map.addControls([snapControl, this._snapDrawingsControl]);

        this._lizmap3.controls['snapControl'] = snapControl;
        this._lizmap3.controls['snapDrawingsControl'] = this._snapDrawingsControl;

        // register snap/unsnap event on both snapControl and snapDrawings control
        // snap event on map features
        snapControl.events.register('snap', this, (e) => {
            // The e.snapType property is used to set the style of the sketch geometry;
            // for map elements, only snapping to edges/vertices is supported. In the future, with a newer version of OL 10,
            // it will be possible to make improvements, as that version natively supports snapping to intersections.
            this._edition.setOL2SketchGeometryStyle(e.snapType == 'edge' ? this._snapOnEdgeStyle : this._snapOnPointStyle);
        })

        // unsnap on map features
        snapControl.events.register('unsnap',this, () => {
            // setting the style to null to restore the default style of the sketch geometry
            this._edition.setOL2SketchGeometryStyle(null);
        })

        // snap on drawings
        this._snapDrawingsControl.events.register('snap',this, (e) => {
            // In this case, the type of snap is determined by the custom component; therefore, we are fully aware of the
            // snapping functionality currently in use. Since OL2 does not support intersection, we can rely on the _snapType class property
            // to set the correct style in the event of an intersection, and use e.snapType to distinguish between an edge and a vertex.
            if(this._snapType == 'intersection'){
                this._edition.setOL2SketchGeometryStyle(this._snapOnIntersectionStyle);
            } else {
                this._edition.setOL2SketchGeometryStyle(e.snapType == 'edge' ? this._snapOnEdgeStyle : this._snapOnPointStyle);
            }
        })

        // unsnap on drawings
        this._snapDrawingsControl.events.register('unsnap',this, () => {
            // setting the style to null to restore the default style of the sketch geometry
            this._edition.setOL2SketchGeometryStyle(null);
        })

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

                                this._snapOnStart = editionLayerConfig.hasOwnProperty('snap_on_start')
                                    && editionLayerConfig.snap_on_start === 'True';
                            }
                        }
                    }
                }

                if (this._config !== undefined){
                    // Configure snapping
                    const snapControl = this._lizmap3.controls.snapControl;

                    // Set edition layer as main layer
                    snapControl.setLayer(this._edition.editLayer);
                    this._snapDrawingsControl.setLayer(this._edition.editLayer);

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

                    // Auto-activate snapping if configured (snap_on_start).
                    // Legacy configs without the key do not auto-activate.
                    if (this._snapOnStart) {
                        this._activateWhenMapReady();
                    }
                }
            },
            'edition.formDisplayed'
        );

        // Clean snap when edition ends
        mainEventDispatcher.addListener(
            () => {
                // Remove pending map-ready listener if still waiting
                if (this._pendingMapReadyListener) {
                    this._rootMapGroup.removeListener(
                        this._pendingMapReadyListener, 'layer.load.status.changed'
                    );
                    this._pendingMapReadyListener = null;
                }
                this.active = false;
                this._snapOnDrawings = false;
                this._snapLayer.destroyFeatures();
                this._snapDrawingsLayer.destroyFeatures();
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

    /**
     * Activate snapping only after all visible map layers have finished loading.
     * This prevents snap WFS requests from competing with map tile rendering
     * on QGIS Server, which can significantly slow down large projects.
     * @private
     */
    _activateWhenMapReady() {
        const visibleLayers = this._rootMapGroup.findMapLayers().filter(l => l.visibility);
        const stillLoading = visibleLayers.filter(
            l => l.loadStatus === MapLayerLoadStatus.Loading
              || l.loadStatus === MapLayerLoadStatus.Undefined
        );

        if (stillLoading.length === 0) {
            this.active = true;
            let previousMessage = document.getElementById('lizmap-snapping-message');
            if (previousMessage) previousMessage.remove();
            this._lizmap3.addMessage(lizDict['snapping.message.activated'] || 'Snapping has been automatically activated.', 'info', true, 7000).attr('id', 'lizmap-snapping-message');
        } else {
            const listener = () => {
                const remaining = this._rootMapGroup.findMapLayers().filter(
                    l => l.visibility
                      && (l.loadStatus === MapLayerLoadStatus.Loading
                       || l.loadStatus === MapLayerLoadStatus.Undefined)
                );
                if (remaining.length === 0) {
                    this._rootMapGroup.removeListener(listener, 'layer.load.status.changed');
                    this._pendingMapReadyListener = null;
                    this.active = true;
                    let previousMessage = document.getElementById('lizmap-snapping-message');
                    if (previousMessage) previousMessage.remove();
                    this._lizmap3.addMessage(lizDict['snapping.message.activated'] || 'Snapping has been automatically activated.', 'info', true, 7000).attr('id', 'lizmap-snapping-message');
                }
            };
            this._pendingMapReadyListener = listener;
            this._rootMapGroup.addListener(listener, 'layer.load.status.changed');
        }
    }

    /**
     * Log a WFS snap failure and surface a user-visible message, once per refresh batch.
     * Called from both the rejection and the "no valid FeatureCollection" path.
     * @param {string}              layerName - the layer whose WFS request failed
     * @param {Error|object|string}  detail    - the error or payload that triggered the notice
     * @private
     */
    _notifySnapWfsError(layerName, detail) {
        console.warn('Snapping: WFS request failed for layer', layerName, detail);
        if (this._wfsErrorNotified) return;
        this._wfsErrorNotified = true;
        const msg = lizDict['snapping.message.wfs_error']
            || 'Snapping: failed to load data for some layers — snap may be incomplete.';
        this._lizmap3.addMessage(msg, 'error', true, 7000);
    }

    getSnappingData () {
        // Empty snapping layer first
        this._snapLayer.destroyFeatures();

        // Reset the once-per-refresh error notification flag so a new batch of
        // requests can re-surface a user-visible message if WFS still fails.
        this._wfsErrorNotified = false;

        // filter only visible layers and toggled layers on the the snap list
        const currentSnapLayers = this._snapLayers.filter(
            (layerId) => this._snapEnabled[layerId] && this._snapToggled[layerId]
        );

        // Request the map projection so QGIS Server reprojects server-side with full
        // PROJ accuracy (including datum grid shifts). This prevents the ~cm coordinate
        // drift that occurs when OL2 performs a client-side EPSG:4326 → map-projection
        // transform using a simplified Helmert approximation instead of an NTv2 grid.
        const mapProjection = this._lizmap3.map.getProjection();
        const mapExtent = this._restrictToMapExtent ? this._lizmap3.map.getExtent() : null;
        const wfs = new WFS();
        const gFormat = new OpenLayers.Format.GeoJSON({ ignoreExtraDims: true });

        for (const snapLayer of currentSnapLayers) {
            const layerConfigById = this._lizmap3.getLayerConfigById(snapLayer);
            if (!layerConfigById || !layerConfigById[0]) continue;

            const layerName = layerConfigById[0];
            const layerConf = this._lizmap3.config.layers[layerName];
            if (!layerConf) continue;

            // Resolve typename (same logic as getVectorLayerWfsUrl)
            let typeName = layerName.split(' ').join('_');
            if (layerConf.hasOwnProperty('shortname') && layerConf['shortname']) typeName = layerConf['shortname'];
            else if (layerConf.hasOwnProperty('typename') && layerConf['typename']) typeName = layerConf['typename'];

            const wfsOptions = {
                VERSION: '1.1.0',
                TYPENAME: typeName,
                SRSNAME: mapProjection,
                MAXFEATURES: this._maxFeatures,
            };

            // Apply existing layer filter if present (e.g. login-based filter)
            if (layerConf.hasOwnProperty('request_params') && layerConf['request_params'].hasOwnProperty('filter')) {
                const layerFilter = layerConf['request_params']['filter'];
                if (layerFilter) {
                    wfsOptions['EXP_FILTER'] = layerFilter.replace(layerName + ':', '');
                }
            }

            // Append CRS code so the server interprets the extent in the map projection
            if (mapExtent) {
                wfsOptions['BBOX'] = [mapExtent.left, mapExtent.bottom, mapExtent.right, mapExtent.top].join(',') + ',' + mapProjection;
            }

            wfs.getFeature(wfsOptions).then(data => {
                if (!data || !Array.isArray(data.features)) {
                    // The WFS endpoint returned something (no rejection) but not a
                    // FeatureCollection — most likely an OGC ExceptionReport wrapped as
                    // JSON. Treat as a failure so the user sees that snap may be incomplete.
                    this._notifySnapWfsError(layerName, data);
                    return;
                }
                // Features are already in map projection — no client-side reprojection needed.
                const tfeatures = gFormat.read({
                    type: 'FeatureCollection',
                    features: data.features
                });
                this._snapLayer.addFeatures(tfeatures);
            }).catch(err => {
                this._notifySnapWfsError(layerName, err);
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

    /**
     * Enable/disable snap on drawings and set
     * snap features accordingly
     * @param {Event} e - snap selection event
     * @returns {void}
     */
    setSnapOnDrawings(e){
        this.removeSnapDigitizingFeatures();
        this._snapOnDrawings = false;
        this._snapType = null;
        if (e.active) {
            this._snapOnDrawings = true;
            this._snapType = e.snapSelected;
            this.addSnapDigitizingFeatures();
        }
    }

    /**
     * Add features to digitizing snap layer
     * @fires Snapping#snappingDigitizingFeaturesAdded
     * @returns {void}
     */
    addSnapDigitizingFeatures(){
        if (this._digitizing.featureDrawn?.length && this._snapOnDrawings) {
            // transfrom Circe gometry in Polygon
            const transformedFeatures = this._digitizing.featureDrawn.map((f)=>{
                if(f.getGeometry() instanceof CircleGeom) {
                    const polygonFromCircleGeom = fromCircle(f.getGeometry(), 128);
                    return new Feature(polygonFromCircleGeom);
                }

                return f;
            })

            // get snap features accordingly to snap type
            const featuresForSnap = this._snapType == 'intersection' ?
                Utils.calculateGeometriesIntersections(transformedFeatures) : transformedFeatures;

            // trasform OL10 features to OL2 features
            const ol2Features = featuresForSnap.map((f)=>{
                const wktFormat = new WKT();
                const wkt = wktFormat.writeFeature(f,{
                    // digiting features are in map projection
                    dataProjection: this._lizmap3.map.getProjection(),
                    featureProjection: this._lizmap3.map.getProjection()
                });

                const wktParser = new OpenLayers.Format.WKT();
                const wktOl2 = wktParser.read(wkt);
                wktOl2.attributes.digitizing = true;

                return wktOl2;
            })

            // add calculated features to snap on drawings layer
            this._snapDrawingsLayer.addFeatures(ol2Features);

            // dispatch event for external js customization purpose
            /**
             * @event snappingDigitizingFeaturesAdded
             */
            mainEventDispatcher.dispatch('snapping.digitizingFeatures.added');
        }
    }

    /**
     * Empty snap on drawings layer
     * @returns {void}
     */
    removeSnapDigitizingFeatures(){
        this._snapDrawingsLayer.destroyFeatures();
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
            this._snapDrawingsControl.activate();
            this.addSnapDigitizingFeatures();
        } else {
            // Disable refresh button when snapping is inactive
            this.snapLayersRefreshable = false;
            this._lizmap3.controls.snapControl.deactivate();
            this._snapDrawingsControl.deactivate();
        }

        // Set snap layer visibility
        this._snapLayer.setVisibility(this._active);
        this._snapDrawingsLayer.setVisibility(this._active);

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
