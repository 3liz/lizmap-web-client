/**
 * @module modules/maps.js
 * @name maps
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */
import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import Utils from '../modules/Utils.js';
import { BaseLayerTypes } from '../modules/config/BaseLayer.js';
import { MapLayerLoadStatus } from '../modules/state/MapLayer.js';
import olMap from 'ol/Map.js';
import View from 'ol/View.js';
import { get as getProjection } from 'ol/proj.js';
import { Attribution } from 'ol/control.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS.js';
import WMTSCapabilities from 'ol/format/WMTSCapabilities.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import {getWidth} from 'ol/extent.js';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer.js';
import TileGrid from 'ol/tilegrid/TileGrid.js';
import TileWMS from 'ol/source/TileWMS.js';
import XYZ from 'ol/source/XYZ.js';
import BingMaps from 'ol/source/BingMaps.js';
import LayerGroup from 'ol/layer/Group.js';

import DragPan from "ol/interaction/DragPan.js";
import MouseWheelZoom from "ol/interaction/MouseWheelZoom.js";
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom.js';
import { defaults as defaultInteractions } from 'ol/interaction.js';

/**
 * Class initializing Openlayers Map.
 * @class
 * @name BaseLayersMap
 * @augments olMap
 */
export default class BaseLayersMap extends olMap {

    constructor() {
        const qgisProjectProjection = mainLizmap.projection;
        const mapProjection = getProjection(qgisProjectProjection);

        // Get resolutions from OL2 map
        let resolutions = mainLizmap.lizmap3.map.resolutions ? mainLizmap.lizmap3.map.resolutions : mainLizmap.lizmap3.map.baseLayer.resolutions;
        if (resolutions == undefined) {
            resolutions= [mainLizmap.lizmap3.map.resolution];
        }
        // Remove duplicated values
        resolutions = [... new Set(resolutions)];
        // Sorting in descending order
        resolutions = resolutions.sort((a, b) => a < b);

        super({
            controls: [
                new Attribution({ target: 'attribution-ol', collapsed: false })
            ],
            interactions: defaultInteractions({
                dragPan: false,
                mouseWheelZoom: false
            }).extend([
                new DragPan(),
                new MouseWheelZoom({ duration: 0 }),
                new DoubleClickZoom({ duration: 0 })
            ]),
            view: new View({
                resolutions: resolutions,
                constrainResolution: true,
                center: [mainLizmap.lizmap3.map.getCenter().lon, mainLizmap.lizmap3.map.getCenter().lat],
                projection: mapProjection,
                enableRotation: false,
                extent: mainLizmap.lizmap3.map.restrictedExtent.toArray(),
                constrainOnlyCenter: true // allow view outside the restricted extent when zooming
            }),
            target: 'baseLayersOlMap'
        });

        // Disable High DPI for requests
        this._hidpi = false;

        // Ratio between WMS single tiles and map viewport
        this._WMSRatio = 1.1;

        // Respecting WMS max size
        const wmsMaxSize = [
            mainLizmap.initialConfig.options.wmsMaxWidth,
            mainLizmap.initialConfig.options.wmsMaxHeight,
        ];

        // Get pixel ratio, if High DPI is disabled do not use device pixel ratio
        const pixelRatio = this._hidpi ? this.pixelRatio_ : 1;

        const useTileWms = this.getSize().reduce(
            (r /*accumulator*/, x /*currentValue*/, i /*currentIndex*/) => r || Math.ceil(x*this._WMSRatio*pixelRatio) > wmsMaxSize[i],
            false,
        );

        const customTileGrid = useTileWms ? new TileGrid({
            extent: mainLizmap.lizmap3.map.restrictedExtent.toArray(),
            resolutions: resolutions,
            tileSize: this.getSize().map((x, i) => {
                // Get the min value between the map size and the max size
                // divided by pixel ratio
                const vMin = Math.min(
                    Math.floor(x/pixelRatio),
                    Math.floor(wmsMaxSize[i]/pixelRatio)
                );
                // If the min value with a margin of WMS ratio is less
                // than max size divided by pixel ratio the keep it
                if (vMin*this._WMSRatio < wmsMaxSize[i]/pixelRatio) {
                    return vMin;
                }
                // Else get the min value divided by WMS ratio
                return Math.floor(vMin/this._WMSRatio);
            })
        }) : null;

        // Mapping between states and OL layers and groups
        this._statesOlLayersandGroupsMap = new Map();

        // Array of layers and groups in overlayLayerGroup
        this._overlayLayersAndGroups = [];

        const layersCount = mainLizmap.state.rootMapGroup.countExplodedMapLayers();

        // Returns a layer or a layerGroup depending of the node type
        const createNode = (node, statesOlLayersandGroupsMap, overlayLayersAndGroups, metersPerUnit, WMSRatio) => {
            if(node.type === 'group'){
                const layers = [];
                for (const layer of node.children.slice().reverse()) {
                    // Keep only layers with a geometry and groups
                    if(node.type !== 'layer' && node.type !== 'group'){
                        continue;
                    }
                    layers.push(createNode(layer, statesOlLayersandGroupsMap, overlayLayersAndGroups, metersPerUnit, WMSRatio));
                }
                const layerGroup = new LayerGroup({
                    layers: layers
                });

                if (node.name !== 'root') {
                    layerGroup.setVisible(node.visibility);
                    layerGroup.setProperties({
                        name: node.name
                    });

                    statesOlLayersandGroupsMap.set(node.name, [node, layerGroup]);
                    overlayLayersAndGroups.push(layerGroup);
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
                let minResolution = node.wmsMinScaleDenominator <= 1 ? undefined : Utils.getResolutionFromScale(node.layerConfig.minScale, metersPerUnit);
                let maxResolution = node.wmsMaxScaleDenominator <= 1 ? undefined : Utils.getResolutionFromScale(node.layerConfig.maxScale, metersPerUnit);

                // The layer is configured to be cached
                if (node.layerConfig.cached) {
                    // Using WMTS
                    const parser = new WMTSCapabilities();
                    const result = parser.read(lizMap.wmtsCapabilities);

                    // Build WMTS options
                    let options;
                    if (result['Contents']['Layer']) {
                        options = optionsFromCapabilities(result, {
                            layer: node.wmsName,
                            matrixSet: mainLizmap.projection,
                        });
                    }

                    // The options could be null if the layer has not be found in
                    // WMTS capabilities
                    if (options) {
                        layer = new TileLayer({
                            minResolution: minResolution,
                            maxResolution: maxResolution,
                            source: new WMTS(options)
                        });
                    }
                }

                // The layer has not been yet build
                if (!layer) {
                    const itemState = node.itemState;
                    const useExternalAccess = (itemState.externalWmsToggle && itemState.externalAccess.type !== 'wmts' && itemState.externalAccess.type !== 'xyz')
                    layer = new ImageLayer({
                        // extent: extent,
                        minResolution: minResolution,
                        maxResolution: maxResolution,
                        source: new ImageWMS({
                            url: useExternalAccess ? itemState.externalAccess.url : mainLizmap.serviceURL,
                            serverType: 'qgis',
                            ratio: WMSRatio,
                            hidpi: this._hidpi,
                            params: {
                                LAYERS: useExternalAccess ? decodeURIComponent(itemState.externalAccess.layers) : node.wmsName,
                                FORMAT: useExternalAccess ? decodeURIComponent(itemState.externalAccess.format) : node.layerConfig.imageFormat,
                                STYLES: useExternalAccess ? decodeURIComponent(itemState.externalAccess.styles) : node.wmsSelectedStyleName,
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

                    if (useTileWms) {
                        layer = new TileLayer({
                            // extent: extent,
                            minResolution: minResolution,
                            maxResolution: maxResolution,
                            source: new TileWMS({
                                url: useExternalAccess ? itemState.externalAccess.url : mainLizmap.serviceURL,
                                serverType: 'qgis',
                                tileGrid: customTileGrid,
                                params: {
                                    LAYERS: useExternalAccess ? decodeURIComponent(itemState.externalAccess.layers) : node.wmsName,
                                    FORMAT: useExternalAccess ? decodeURIComponent(itemState.externalAccess.format) : node.layerConfig.imageFormat,
                                    STYLES: useExternalAccess ? decodeURIComponent(itemState.externalAccess.styles) : node.wmsSelectedStyleName,
                                    DPI: 96,
                                    TILED: 'true'
                                },
                                wrapX: false, // do not reused across the 180° meridian.
                                hidpi: this._hidpi, // pixelRatio is used in useTileWms and customTileGrid definition
                            })
                        });

                        // Force no cache w/ Firefox
                        if(navigator.userAgent.includes("Firefox")){
                            layer.getSource().setTileLoadFunction((image, src) => {
                                (image.getImage()).src = src + '&ts=' + Date.now();
                            });
                        }
                    }

                }

                layer.setVisible(node.visibility);

                layer.setOpacity(node.opacity);

                layer.setProperties({
                    name: node.name
                });

                layer.getSource().setProperties({
                    name: node.name
                });

                // OL layers zIndex is the reverse of layer's order given by cfg
                layer.setZIndex(layersCount - 1 - node.layerOrder);

                // Add attribution
                if (node.wmsAttribution != null) {
                    const url = node.wmsAttribution.url;
                    const title = node.wmsAttribution.title;
                    let attribution = title;

                    if (url) {
                        attribution = `<a href='${url}' target='_blank'>${title}</a>`;
                    }

                    layer.getSource().setAttributions(attribution);
                }

                overlayLayersAndGroups.push(layer);
                statesOlLayersandGroupsMap.set(node.name, [node, layer]);
                return layer;
            }
        }

        this._overlayLayersGroup = new LayerGroup();

        const metersPerUnit = this.getView().getProjection().getMetersPerUnit();
        if(mainLizmap.state.layerTree.children.length){
            this._overlayLayersGroup = createNode(
                mainLizmap.state.rootMapGroup,
                this._statesOlLayersandGroupsMap,
                this._overlayLayersAndGroups,
                metersPerUnit,
                this._WMSRatio
            );
        }

        // Get the base layers zIndex which is the layer min zIndex - 1
        // to be sure base layers are under the others layers
        const baseLayerZIndex = this.overlayLayers.map((layer) => layer.getZIndex()).reduce(
            (minValue, currentValue) => minValue <= currentValue ? minValue : currentValue,
            0
        ) - 1;

        const proj3857 = getProjection('EPSG:3857');
        const max3857Resolution = getWidth(proj3857.getExtent()) / 256;
        this._hasEmptyBaseLayer = false;
        const baseLayers = [];

        for (const baseLayerState of mainLizmap.state.baseLayers.getBaseLayers()) {
            let baseLayer;
            let layerMinResolution;
            let layerMaxResolution;
            if (baseLayerState.hasItemState && baseLayerState.hasLayerConfig) {
                layerMinResolution = baseLayerState.itemState.wmsMinScaleDenominator <= 1 ? undefined : Utils.getResolutionFromScale(baseLayerState.layerConfig.minScale, metersPerUnit);
                layerMaxResolution = baseLayerState.itemState.wmsMaxScaleDenominator <= 1 ? undefined : Utils.getResolutionFromScale(baseLayerState.layerConfig.maxScale, metersPerUnit);
            }
            if (baseLayerState.type === BaseLayerTypes.XYZ) {
                const zMinResolution = max3857Resolution / Math.pow(2, baseLayerState.zmin);
                // Get max resolution
                if (layerMaxResolution !== undefined || layerMaxResolution > zMinResolution) {
                    layerMaxResolution = zMinResolution;
                }
                const zMaxResolution = max3857Resolution / Math.pow(2, baseLayerState.zmax);
                // Get min resolution
                if (layerMinResolution === undefined || layerMinResolution < zMaxResolution) {
                    layerMinResolution = zMaxResolution;
                }
                baseLayer = new TileLayer({
                    minResolution: layerMinResolution,
                    maxResolution: layerMaxResolution,
                    source: new XYZ({
                        url: baseLayerState.url,
                        projection: baseLayerState.crs,
                        minZoom: baseLayerState.zmin,
                        maxZoom: baseLayerState.zmax,
                    })
                });
            } else if (baseLayerState.type === BaseLayerTypes.WMS) {
                baseLayer = new ImageLayer({
                    minResolution: layerMinResolution,
                    maxResolution: layerMaxResolution,
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
                // Note: min/max resolutions are handled by OpenLayers
                const resolutions = [];
                const matrixIds = [];

                for (let i = 0; i < baseLayerState.numZoomLevels; i++) {
                    matrixIds[i] = i.toString();
                    resolutions[i] = max3857Resolution / Math.pow(2, i);
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
                    minResolution: layerMinResolution,
                    maxResolution: layerMaxResolution,
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
                if (baseLayerState.layerConfig.cached) {
                    const parser = new WMTSCapabilities();
                    const result = parser.read(lizMap.wmtsCapabilities);
                    const options = optionsFromCapabilities(result, {
                        layer: baseLayerState.itemState.wmsName,
                        matrixSet: mainLizmap.projection,
                    });

                    baseLayer = new TileLayer({
                        minResolution: layerMinResolution,
                        maxResolution: layerMaxResolution,
                        source: new WMTS(options)
                    });
                } else {
                    baseLayer = new ImageLayer({
                        // extent: extent,
                        minResolution: layerMinResolution,
                        maxResolution: layerMaxResolution,
                        source: new ImageWMS({
                            url: mainLizmap.serviceURL,
                            projection: qgisProjectProjection,
                            serverType: 'qgis',
                            ratio: this._WMSRatio,
                            hidpi: this._hidpi,
                            params: {
                                LAYERS: baseLayerState.itemState.wmsName,
                                FORMAT: baseLayerState.layerConfig.imageFormat,
                                DPI: 96
                            },
                        })
                    });
                    if (useTileWms) {
                        baseLayer = new TileLayer({
                            // extent: extent,
                            minResolution: layerMinResolution,
                            maxResolution: layerMaxResolution,
                            source: new TileWMS({
                                url: mainLizmap.serviceURL,
                                projection: qgisProjectProjection,
                                serverType: 'qgis',
                                tileGrid: customTileGrid,
                                params: {
                                    LAYERS: baseLayerState.itemState.wmsName,
                                    FORMAT: baseLayerState.layerConfig.imageFormat,
                                    DPI: 96,
                                    TILED: 'true'
                                },
                                wrapX: false, // do not reused across the 180° meridian.
                                hidpi: this._hidpi, // pixelRatio is used in useTileWms and customTileGrid definition
                            })
                        });
                    }
                }
            } else if (baseLayerState.type === BaseLayerTypes.Empty) {
                this._hasEmptyBaseLayer = true;
            }

            if (!baseLayer) {
                continue;
            }

            if (baseLayerState.hasAttribution) {
                const url = baseLayerState.attribution.url;
                const title = baseLayerState.attribution.title;
                let attribution = title;

                if (url) {
                    attribution = `<a href='${url}' target='_blank'>${title}</a>`;
                }

                baseLayer.getSource().setAttributions(attribution);
            }

            const visible = mainLizmap.initialConfig.baseLayers.startupBaselayerName === baseLayerState.name;

            baseLayer.setProperties({
                name: baseLayerState.name,
                title: baseLayerState.title,
                visible: visible
            });

            // Force baselayer to be under the others layers
            baseLayer.setZIndex(baseLayerZIndex);

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
     * @param name
     * @returns {Layer|undefined}
     */
    getLayerByName(name){
        return this.overlayLayers.find(
            layer => layer.get('name') === name
        );
    }

    /**
     * Return overlay layer or group if `name` matches.
     * `name` is unique for every layers/groups
     * @param name
     * @returns {Layer|LayerGroup|undefined}
     */
    getLayerOrGroupByName(name){
        return this.overlayLayersAndGroups.find(
            layer => layer.get('name') === name
        );
    }
}
