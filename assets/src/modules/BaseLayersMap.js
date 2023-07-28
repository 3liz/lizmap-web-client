import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import Utils from '../modules/Utils.js';
import { BaseLayerTypes } from '../modules/config/BaseLayer.js';
import { MapLayerLoadStatus } from '../modules/state/MapLayer.js';
import olMap from 'ol/Map.js';
import View from 'ol/View.js';
import { get as getProjection } from 'ol/proj.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS.js';
import WMTSCapabilities from 'ol/format/WMTSCapabilities.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import {getWidth} from 'ol/extent.js';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer.js';
import XYZ from 'ol/source/XYZ.js';
import BingMaps from 'ol/source/BingMaps.js';
import LayerGroup from 'ol/layer/Group.js';

import DragPan from "ol/interaction/DragPan.js";
import MouseWheelZoom from "ol/interaction/MouseWheelZoom.js";
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom.js';
import { defaults as defaultInteractions } from 'ol/interaction.js';

/** Class initializing Openlayers Map. */
export default class BaseLayersMap extends olMap {

    constructor() {
        const qgisProjectProjection = mainLizmap.projection;
        const mapProjection = getProjection(qgisProjectProjection);

        super({
            controls: [], // disable default controls
            interactions: defaultInteractions({
                dragPan: false,
                mouseWheelZoom: false
            }).extend([
                new DragPan(),
                new MouseWheelZoom({ duration: 0 }),
                new DoubleClickZoom({ duration: 0 })
            ]),
            view: new View({
                resolutions: mainLizmap.lizmap3.map.resolutions ? mainLizmap.lizmap3.map.resolutions : mainLizmap.lizmap3.map.baseLayer.resolutions,
                constrainResolution: true,
                center: [mainLizmap.lizmap3.map.getCenter().lon, mainLizmap.lizmap3.map.getCenter().lat],
                projection: mapProjection,
                enableRotation: false,
                extent: mainLizmap.lizmap3.map.restrictedExtent.toArray(),
                constrainOnlyCenter: true // allow view outside the restricted extent when zooming
            }),
            target: 'baseLayersOlMap'
        });

        // Ratio between WMS single tiles and map viewport
        this._WMSRatio = 1.1;

        // Mapping between states and OL layers and groups
        this._statesOlLayersandGroupsMap = new Map();

        this._hasEmptyBaseLayer = false;
        const baseLayers = [];

        for (const baseLayerState of mainLizmap.state.baseLayers.getBaseLayers()) {
            let baseLayer;
            if (baseLayerState.type === BaseLayerTypes.XYZ) {
                baseLayer = new TileLayer({
                    source: new XYZ({
                        url: baseLayerState.url,
                        projection: baseLayerState.crs,
                        minZoom: baseLayerState.zmin,
                        maxZoom: baseLayerState.zmax,
                    })
                });
            } else if (baseLayerState.type === BaseLayerTypes.WMS) {
                let minResolution = baseLayerState.layerConfig.minScale === 1 ? undefined : Utils.getResolutionFromScale(baseLayerState.layerConfig.minScale);
                let maxResolution = baseLayerState.layerConfig.maxScale === 1000000000000 ? undefined : Utils.getResolutionFromScale(baseLayerState.layerConfig.maxScale);
                baseLayer = new ImageLayer({
                    minResolution: minResolution,
                    maxResolution: maxResolution,
                    source: new ImageWMS({
                        url: baseLayerState.url,
                        projection: baseLayerState.crs,
                        ratio: this._WMSRatio,
                        params: {
                            LAYERS: baseLayerState.layers,
                            STYLES: baseLayerState.styles,
                            FORMAT: baseLayerState.format
                        },
                    })
                });
            } else if (baseLayerState.type === BaseLayerTypes.WMTS) {
                const proj3857 = getProjection('EPSG:3857');
                const maxResolution = getWidth(proj3857.getExtent()) / 256;
                const resolutions = [];
                const matrixIds = [];

                for (let i = 0; i < baseLayerState.numZoomLevels; i++) {
                    matrixIds[i] = i.toString();
                    resolutions[i] = maxResolution / Math.pow(2, i);
                }

                const tileGrid = new WMTSTileGrid({
                    origin: [-20037508, 20037508],
                    resolutions: resolutions,
                    matrixIds: matrixIds,
                });

                let url = baseLayerState.url;
                if(baseLayerState.key && url.includes('{key}')){
                    url = url.replaceAll('{key}', baseLayerState.key);
                }

                baseLayer = new TileLayer({
                    source: new WMTS({
                        url: url,
                        layer: baseLayerState.layer,
                        matrixSet: baseLayerState.matrixSet,
                        format: baseLayerState.format,
                        projection: baseLayerState.crs,
                        tileGrid: tileGrid,
                        style: baseLayerState.style
                    })
                });
            } else if (baseLayerState.type === BaseLayerTypes.Bing) {
                baseLayer = new TileLayer({
                    preload: Infinity,
                    source: new BingMaps({
                        key: baseLayerState.key,
                        imagerySet: baseLayerState.imagerySet,
                    // use maxZoom 19 to see stretched tiles instead of the BingMaps
                    // "no photos at this zoom level" tiles
                    // maxZoom: 19
                    }),
                });
            } else if (baseLayerState.type === BaseLayerTypes.Lizmap) {
                let minResolution = baseLayerState.layerConfig.minScale === 1 ? undefined : Utils.getResolutionFromScale(baseLayerState.layerConfig.minScale);
                let maxResolution = baseLayerState.layerConfig.maxScale === 1000000000000 ? undefined : Utils.getResolutionFromScale(baseLayerState.layerConfig.maxScale);
                baseLayer = new ImageLayer({
                    // extent: extent,
                    minResolution: minResolution,
                    maxResolution: maxResolution,
                    source: new ImageWMS({
                        url: mainLizmap.serviceURL,
                        projection: qgisProjectProjection,
                        serverType: 'qgis',
                        ratio: this._WMSRatio,
                        params: {
                            LAYERS: baseLayerState.itemState.wmsName,
                            FORMAT: baseLayerState.layerConfig.imageFormat,
                            DPI: 96
                        },
                    })
                });
            } else if (baseLayerState.type === BaseLayerTypes.Empty) {
                this._hasEmptyBaseLayer = true;
            }

            if(!baseLayer){
                continue;
            }

            const visible = mainLizmap.initialConfig.baseLayers.startupBaselayerName === baseLayerState.name;

            baseLayer.setProperties({
                name: baseLayerState.name,
                title: baseLayerState.title,
                visible: visible
            });

            baseLayers.push(baseLayer);

            if (visible && baseLayer.getSource().getProjection().getCode() !== qgisProjectProjection) {
                this.getView().getProjection().setExtent(mainLizmap.lizmap3.map.restrictedExtent.toArray());
            }
        }

        this._baseLayersGroup;

        if (baseLayers.length) {
            this._baseLayersGroup = new LayerGroup({
                layers: baseLayers
            });
        } else {
            this._baseLayersGroup = new LayerGroup();
        }

        // Array of layers and groups in overlayLayerGroup
        this._overlayLayersAndGroups = [];

        // Returns a layer or a layerGroup depending of the node type
        const createNode = (node) => {
            if(node.type === 'group'){
                const layers = [];
                for (const layer of node.children.slice().reverse()) {
                    layers.push(createNode(layer, node.name));
                }
                const layerGroup = new LayerGroup({
                    layers: layers
                });

                if (node.name !== 'root') {
                    layerGroup.setVisible(node.visibility);
                    layerGroup.setProperties({
                        name: node.name
                    });

                    this._statesOlLayersandGroupsMap.set(node.name, [node, layerGroup]);
                    this._overlayLayersAndGroups.push(layerGroup);
                }

                return layerGroup;
            } else {
                let layer;
                // Keep only layers with a geometry
                if(node.type !== 'layer'){
                    return;
                }

                /* Sometimes throw an Error and extent is not used
                let extent = node.layerConfig.extent;
                if(node.layerConfig.crs !== "" && node.layerConfig.crs !== mainLizmap.projection){
                    extent = transformExtent(extent, node.layerConfig.crs, mainLizmap.projection);
                }
                */

                // Set min/max resolution only if different from default
                let minResolution = node.layerConfig.minScale === 1 ? undefined : Utils.getResolutionFromScale(node.layerConfig.minScale);
                let maxResolution = node.layerConfig.maxScale === 1000000000000 ? undefined : Utils.getResolutionFromScale(node.layerConfig.maxScale);

                if (node.layerConfig.cached) {
                    const parser = new WMTSCapabilities();
                    const result = parser.read(lizMap.wmtsCapabilities);
                    const options = optionsFromCapabilities(result, {
                        layer: node.wmsName,
                        matrixSet: mainLizmap.projection,
                    });

                    layer = new TileLayer({
                        minResolution: minResolution,
                        maxResolution: maxResolution,
                        source: new WMTS(options)
                    });
                } else {
                    layer = new ImageLayer({
                        // extent: extent,
                        minResolution: minResolution,
                        maxResolution: maxResolution,
                        source: new ImageWMS({
                            url: mainLizmap.serviceURL,
                            serverType: 'qgis',
                            ratio: this._WMSRatio,
                            params: {
                                LAYERS: node.wmsName,
                                FORMAT: node.layerConfig.imageFormat,
                                STYLES: node.wmsSelectedStyleName,
                                DPI: 96
                            },
                        })
                    });

                    // Force no cache w/ Firefox
                    if(navigator.userAgent.includes("Firefox")){
                        layer.getSource().setImageLoadFunction((image, src) => {
                            (image.getImage()).src = src + '&ts=' + Date.now();
                        });
                    }
                }

                layer.setVisible(node.visibility);

                layer.setProperties({
                    name: node.name
                });

                layer.getSource().setProperties({
                    name: node.name
                });

                this._overlayLayersAndGroups.push(layer);
                this._statesOlLayersandGroupsMap.set(node.name, [node, layer]);
                return layer;
            }
        }

        this._overlayLayersGroup = new LayerGroup();

        if(mainLizmap.state.layerTree.children.length){
            this._overlayLayersGroup = createNode(mainLizmap.state.rootMapGroup);
        }

        // Add base and overlay layers to the map's main LayerGroup
        this.setLayerGroup(new LayerGroup({
            layers: [this._baseLayersGroup, this._overlayLayersGroup]
        }));

        // Sync new OL view with OL2 view
        mainLizmap.lizmap3.map.events.on({
            move: () => {
                this.syncNewOLwithOL2View();
            }
        });

        // Init view
        this.syncNewOLwithOL2View();

        // Listen/Dispatch events
        this.getView().on('change:resolution', () => {
            mainEventDispatcher.dispatch('resolution.changed');
        });

        this._baseLayersGroup.on('change', () => {
            mainEventDispatcher.dispatch('baseLayers.changed');
        });

        this._overlayLayersGroup.on('change', () => {
            mainEventDispatcher.dispatch('overlayLayers.changed');
        });

        for (const layer of this.overlayLayers) {
            const source = layer.getSource();

            if (source instanceof ImageWMS) {
                source.on('imageloadstart', event => {
                    const mapLayer = mainLizmap.state.rootMapGroup.getMapLayerByName(event.target.get('name'))
                    mapLayer.loadStatus = MapLayerLoadStatus.Loading;
                });
                source.on('imageloadend', event => {
                    const mapLayer = mainLizmap.state.rootMapGroup.getMapLayerByName(event.target.get('name'))
                    mapLayer.loadStatus = MapLayerLoadStatus.Ready;
                });
                source.on('imageloaderror', event => {
                    const mapLayer = mainLizmap.state.rootMapGroup.getMapLayerByName(event.target.get('name'))
                    mapLayer.loadStatus = MapLayerLoadStatus.Error;
                });
            } else if (source instanceof WMTS) {
                source.on('tileloadstart', event => {
                    const mapLayer = mainLizmap.state.rootMapGroup.getMapLayerByName(event.target.get('name'))
                    mapLayer.loadStatus = MapLayerLoadStatus.Loading;
                });
                source.on('tileloadend', event => {
                    const mapLayer = mainLizmap.state.rootMapGroup.getMapLayerByName(event.target.get('name'))
                    mapLayer.loadStatus = MapLayerLoadStatus.Ready;
                });
                source.on('tileloaderror', event => {
                    const mapLayer = mainLizmap.state.rootMapGroup.getMapLayerByName(event.target.get('name'))
                    mapLayer.loadStatus = MapLayerLoadStatus.Error;
                });
            }
        }

        mainLizmap.state.rootMapGroup.addListener(
            evt => this.getLayerOrGroupByName(evt.name).setVisible(evt.visibility),
            ['layer.visibility.changed', 'group.visibility.changed']
        );

        mainLizmap.state.layersAndGroupsCollection.addListener(
            evt => {
                const activeBaseLayer = this.getActiveBaseLayer();
                if (activeBaseLayer && activeBaseLayer.get("name") === evt.name) {
                    activeBaseLayer.setOpacity(evt.opacity);
                } else {
                    this.getLayerOrGroupByName(evt.name).setOpacity(evt.opacity);
                }
            },
            ['layer.opacity.changed', 'group.opacity.changed']
        );

        mainLizmap.state.rootMapGroup.addListener(
            evt => {
                const [state, olLayer] = this._statesOlLayersandGroupsMap.get(evt.name);
                const wmsParams = olLayer.getSource().getParams();

                // Delete entries in `wmsParams` not in `state.wmsParameters`
                for(const key of Object.keys(wmsParams)){
                    if(!Object.hasOwn(state.wmsParameters, key)){
                        delete wmsParams[key];
                    }
                }
                Object.assign(wmsParams, state.wmsParameters);

                olLayer.getSource().updateParams(wmsParams);
            },
            ['layer.symbol.checked.changed', 'layer.style.changed', 'layer.selection.token.changed', 'layer.filter.token.changed']
        );

        mainLizmap.state.baseLayers.addListener(
            evt => {
                this.changeBaseLayer(evt.name);
            },
            ['baselayers.selection.changed']
        );
    }

    get hasEmptyBaseLayer() {
        return this._hasEmptyBaseLayer;
    }

    get baseLayersGroup(){
        return this._baseLayersGroup;
    }

    get overlayLayersAndGroups(){
        return this._overlayLayersAndGroups;
    }

    // Get overlay layers (not layerGroups)
    get overlayLayers(){
        return this._overlayLayersGroup.getLayersArray();
    }

    get overlayLayersGroup(){
        return this._overlayLayersGroup;
    }

    /**
     * Synchronize new OL view with OL2 one
     * @memberof Map
     */
    syncNewOLwithOL2View(){
        this.getView().animate({
            center: mainLizmap.center,
            zoom: mainLizmap.lizmap3.map.getZoom(),
            duration: 50
        });
    }

    changeBaseLayer(name){
        let selectedBaseLayer;
        // Choosen base layer is visible, others not
        this.baseLayersGroup.getLayers().forEach( baseLayer => {
            if (baseLayer.get('name') === name) {
                selectedBaseLayer = baseLayer;
                baseLayer.set("visible", true, true);
            } else {
                baseLayer.set("visible", false, true);
            }
        });

        this._baseLayersGroup.changed();

        // If base layer projection is different from project projection
        // We must set the project extent to the View to reproject nicely
        if (selectedBaseLayer?.getSource().getProjection().getCode() !== mainLizmap.projection) {
            this.getView().getProjection().setExtent(mainLizmap.lizmap3.map.restrictedExtent.toArray());
        } else {
            this.getView().getProjection().setExtent(getProjection(mainLizmap.projection).getExtent());
        }

        // Trigger legacy event
        lizMap.events.triggerEvent("lizmapbaselayerchanged", { 'layer': name });

        // Refresh metadatas if sub-dock is visible
        if ( document.getElementById('sub-dock').offsetParent !== null ) {
            lizMap.events.triggerEvent("lizmapswitcheritemselected", {
                'name': name, 'type': 'baselayer', 'selected': true
            });
        }
    }

    getActiveBaseLayer(){
        return this._baseLayersGroup.getLayers().getArray().find(
            layer => layer.getVisible()
        );
    }

    /**
     * Return overlay layer if `name` matches.
     * `name` is unique for every layers
     */
    getLayerByName(name){
        return this.overlayLayers.find(
            layer => layer.get('name') === name
        );
    }

    /**
     * Return overlay layer or group if `name` matches.
     * `name` is unique for every layers/groups
     */
    getLayerOrGroupByName(name){
        return this.overlayLayersAndGroups.find(
            layer => layer.get('name') === name
        );
    }
}
