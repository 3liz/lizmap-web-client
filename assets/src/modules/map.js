/**
 * @module modules/maps.js
 * @name maps
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import { mainEventDispatcher } from './Globals.js';
import { Utils } from './Utils.js';
import { Config } from './Config.js';
import { MapState } from './state/Map.js';
import { BaseLayersState, BaseLayerTypes } from './config/BaseLayer.js';
import { MapLayerLoadStatus, MapLayerState, MapRootState } from './state/MapLayer.js';
import olMap from 'ol/Map.js';
import View from 'ol/View.js';
import { ADJUSTED_DPI } from '../utils/Constants.js';
import { get as getProjection, getPointResolution } from 'ol/proj.js';
import { Attribution } from 'ol/control.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS.js';
import { WMTSCapabilities, GeoJSON, WKT } from 'ol/format.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import {getWidth} from 'ol/extent.js';
import { Image as ImageLayer, Tile as TileLayer } from 'ol/layer.js';
import TileGrid from 'ol/tilegrid/TileGrid.js';
import TileWMS from 'ol/source/TileWMS.js';
import XYZ from 'ol/source/XYZ.js';
import BingMaps from 'ol/source/BingMaps.js';
import Google from 'ol/source/Google.js';
import { BaseLayer as LayerBase } from 'ol/layer/Base.js';
import LayerGroup from 'ol/layer/Group.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';

import DragZoom from 'ol/interaction/DragZoom.js';
import { always } from 'ol/events/condition.js';
import SingleWMSLayer from './SingleWMSLayer.js';

/**
 * Class initializing Openlayers Map.
 * @class
 * @name map
 * @augments olMap
 */
export default class map extends olMap {
    /**
     * Create the OpenLayers Map
     * @param {string}   mapTarget - The id of the container element for the OpenLayers Map
     * @param {Config} initialConfig - The lizmap initial config instance
     * @param {string} serviceURL - The lizmap service URL
     * @param {MapState} mapState  - The lizmap map state
     * @param {BaseLayersState} baseLayersState - The lizmap base layers state
     * @param {MapRootState} rootMapGroup - The lizmap root map group
     * @param {object}   lizmap3   - The old lizmap object
     */
    constructor(mapTarget, initialConfig, serviceURL, mapState, baseLayersState, rootMapGroup, lizmap3) {
        const qgisProjectProjection = lizmap3.map.getProjection();
        const mapProjection = getProjection(qgisProjectProjection);

        // Get resolutions from OL2 map
        let resolutions = lizmap3.map.resolutions ? lizmap3.map.resolutions : lizmap3.map.baseLayer.resolutions;
        if (resolutions == undefined) {
            resolutions= [lizmap3.map.resolution];
        }
        // Remove duplicated values
        resolutions = [... new Set(resolutions)];
        // Sorting in descending order
        resolutions = resolutions.sort((a, b) => a < b);

        super({
            controls: [
                new Attribution({ target: 'attribution-ol', collapsed: false })
            ],
            view: new View({
                resolutions: resolutions,
                constrainResolution: true,
                center: [lizmap3.map.getCenter().lon, lizmap3.map.getCenter().lat],
                projection: mapProjection,
                extent: lizmap3.map.restrictedExtent.toArray(),
                constrainOnlyCenter: true // allow view outside the restricted extent when zooming
            }),
            target: mapTarget
        });

        this._lizmap3 = lizmap3;
        this._initialConfig = initialConfig;
        this._newOlMap = true;

        // Zoom to box
        this._dragZoom = new DragZoom({
            condition: always
        });
        this._dragZoom.setActive(false);
        this.addInteraction(this._dragZoom);

        this._dispatchMapStateChanged = () => {
            const view = this.getView();
            const projection = view.getProjection();
            const dpi = ADJUSTED_DPI;
            const inchesPerMeter = 1000 / 25.4;
            const resolution = view.getResolution();
            const scaleDenominator = resolution * inchesPerMeter * dpi;
            // The Scale line control uses this method to defined scale denominator
            const pointResolution = getPointResolution(projection, view.getResolution(), view.getCenter(), projection.getUnits());
            const pointScaleDenominator = pointResolution * inchesPerMeter * dpi;

            mapState.update({
                'type': 'map.state.changing',
                'projection': projection.getCode(),
                'center': [...view.getCenter()],
                'zoom': view.getZoom(),
                'size': [...this.getSize()],
                'extent': view.calculateExtent(),
                'resolution': resolution,
                'scaleDenominator': scaleDenominator,
                'pointResolution': pointResolution,
                'pointScaleDenominator': pointScaleDenominator,
            });
        };

        // Disable High DPI for requests
        this._hidpi = false;

        // Ratio between WMS single tiles and map viewport
        this._WMSRatio = 1.1;

        // Respecting WMS max size
        const wmsMaxSize = [
            initialConfig.options.wmsMaxWidth,
            initialConfig.options.wmsMaxHeight,
        ];

        // Get pixel ratio, if High DPI is disabled do not use device pixel ratio
        const pixelRatio = this._hidpi ? this.pixelRatio_ : 1;

        this._useCustomTileWms = this.getSize().reduce(
            (r /*accumulator*/, x /*currentValue*/, i /*currentIndex*/) => r || Math.ceil(x*this._WMSRatio*pixelRatio) > wmsMaxSize[i],
            false,
        );

        this._customTileGrid = this._useCustomTileWms ? new TileGrid({
            extent: lizmap3.map.restrictedExtent.toArray(),
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
        // Mapping between layers name and states used to construct the singleWMSLayer, if needed
        this._statesSingleWMSLayers = new Map();

        const layersCount = rootMapGroup.countExplodedMapLayers();

        // Returns a layer or a layerGroup depending of the node type
        const createNode = (node, statesOlLayersandGroupsMap, overlayLayersAndGroups, metersPerUnit, WMSRatio) => {
            if(node.type === 'group'){
                const layers = [];
                for (const layer of node.children.slice().reverse()) {
                    // Keep only layers with a geometry and groups
                    if(node.type !== 'layer' && node.type !== 'group'){
                        continue;
                    }
                    let newNode = createNode(layer, statesOlLayersandGroupsMap, overlayLayersAndGroups, metersPerUnit, WMSRatio)
                    if(newNode){
                        layers.push(newNode);
                    }
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
                if(node.layerConfig.crs !== "" && node.layerConfig.crs !== qgisProjectProjection){
                    extent = transformExtent(extent, node.layerConfig.crs, qgisProjectProjection);
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
                            matrixSet: qgisProjectProjection,
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
                } else {
                    if(mapState.singleWMSLayer){
                        this._statesSingleWMSLayers.set(node.name,node);
                        node.singleWMSLayer = true;
                        return
                    } else {
                        const itemState = node.itemState;
                        const useExternalAccess = (itemState.externalWmsToggle && itemState.externalAccess.type !== 'wmts' && itemState.externalAccess.type !== 'xyz')
                        if (this._useCustomTileWms) {
                            layer = new TileLayer({
                                minResolution: minResolution,
                                maxResolution: maxResolution,
                                source: new TileWMS({
                                    url: useExternalAccess ? itemState.externalAccess.url : serviceURL,
                                    serverType: 'qgis',
                                    tileGrid: this._customTileGrid,
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
                        } else if (!node.layerConfig.singleTile) {
                            layer = new TileLayer({
                                minResolution: minResolution,
                                maxResolution: maxResolution,
                                source: new TileWMS({
                                    url: useExternalAccess ? itemState.externalAccess.url : serviceURL,
                                    serverType: 'qgis',
                                    params: {
                                        LAYERS: useExternalAccess ? decodeURIComponent(itemState.externalAccess.layers) : node.wmsName,
                                        FORMAT: useExternalAccess ? decodeURIComponent(itemState.externalAccess.format) : node.layerConfig.imageFormat,
                                        STYLES: useExternalAccess ? decodeURIComponent(itemState.externalAccess.styles) : node.wmsSelectedStyleName,
                                        DPI: 96,
                                        TILED: 'true'
                                    },
                                }),
                            });
                        } else {
                            layer = new ImageLayer({
                                // extent: extent,
                                minResolution: minResolution,
                                maxResolution: maxResolution,
                                source: new ImageWMS({
                                    url: useExternalAccess ? itemState.externalAccess.url : serviceURL,
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
                        }
                    }
                }

                if(layer){
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
        }

        this._overlayLayersGroup = new LayerGroup();


        const metersPerUnit = this.getView().getProjection().getMetersPerUnit();
        if(rootMapGroup.children.length){
            this._overlayLayersGroup = createNode(
                rootMapGroup,
                this._statesOlLayersandGroupsMap,
                this._overlayLayersAndGroups,
                metersPerUnit,
                this._WMSRatio
            );
        }
        this._overlayLayersGroup.setProperties({
            name: 'LizmapOverLayLayersGroup'
        });

        // Get the max layers zIndex
        const maxZIndex = this.overlayLayers.map((layer) => layer.getZIndex()).reduce(
            (maxValue, currentValue) => maxValue <= currentValue ? currentValue : maxValue,
            0
        );

        // Get the base layers zIndex which is the layer min zIndex - 1
        // to be sure base layers are under the others layers
        const baseLayerZIndex = this.overlayLayers.map((layer) => layer.getZIndex()).reduce(
            (minValue, currentValue) => minValue <= currentValue ? minValue : currentValue,
            0
        ) - 1;

        const proj3857 = getProjection('EPSG:3857');
        const max3857Resolution = getWidth(proj3857.getExtent()) / 256;
        const map3857Resolutions = [max3857Resolution];
        while (map3857Resolutions.at(-1) > resolutions.at(-1)) {
            map3857Resolutions.push(max3857Resolution / Math.pow(2, map3857Resolutions.length));
        }
        this._hasEmptyBaseLayer = false;
        const baseLayers = [];

        for (const baseLayerState of baseLayersState.getBaseLayers()) {
            let baseLayer;
            let layerMinResolution;
            let layerMaxResolution;
            if (baseLayerState.hasItemState && baseLayerState.hasLayerConfig) {
                layerMinResolution = baseLayerState.itemState.wmsMinScaleDenominator <= 1 ? undefined : Utils.getResolutionFromScale(baseLayerState.layerConfig.minScale, metersPerUnit);
                layerMaxResolution = baseLayerState.itemState.wmsMaxScaleDenominator <= 1 ? undefined : Utils.getResolutionFromScale(baseLayerState.layerConfig.maxScale, metersPerUnit);
            }
            if (baseLayerState.type === BaseLayerTypes.XYZ) {
                const tileGrid =new TileGrid({
                    origin: [-20037508, 20037508],
                    resolutions: map3857Resolutions,
                });
                tileGrid.minZoom = baseLayerState.zmin;
                tileGrid.maxZoom = baseLayerState.zmax;
                baseLayer = new TileLayer({
                    minResolution: layerMinResolution,
                    maxResolution: layerMaxResolution,
                    source: new XYZ({
                        url: baseLayerState.url,
                        projection: baseLayerState.crs,
                        minZoom: baseLayerState.zmin,
                        maxZoom: baseLayerState.zmax,
                        tileGrid : tileGrid,
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
                const tileGrid = new WMTSTileGrid({
                    origin: [-20037508, 20037508],
                    resolutions: map3857Resolutions,
                    matrixIds: map3857Resolutions.map((r, i) => i.toString()),
                });
                tileGrid.maxZoom = baseLayerState.numZoomLevels;


                let url = baseLayerState.url;
                if(baseLayerState.key && url.includes('{key}')){
                    url = url.replaceAll('{key}', baseLayerState.key);
                }

                baseLayer = new TileLayer({
                    minResolution: layerMinResolution,
                    maxResolution: layerMaxResolution,
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
            } else if (baseLayerState.type === BaseLayerTypes.Google) {
                baseLayer = new TileLayer({
                    minResolution: layerMinResolution,
                    maxResolution: layerMaxResolution,
                    preload: Infinity,
                    source: new Google({
                        key: baseLayerState.key,
                        mapType: baseLayerState.mapType,
                    }),
                });
            } else if (baseLayerState.type === BaseLayerTypes.Lizmap) {
                if (baseLayerState.layerConfig.cached) {
                    const parser = new WMTSCapabilities();
                    const result = parser.read(lizMap.wmtsCapabilities);
                    const options = optionsFromCapabilities(result, {
                        layer: baseLayerState.itemState.wmsName,
                        matrixSet: qgisProjectProjection,
                    });

                    baseLayer = new TileLayer({
                        minResolution: layerMinResolution,
                        maxResolution: layerMaxResolution,
                        source: new WMTS(options)
                    });
                } else {
                    if(mapState.singleWMSLayer){
                        baseLayerState.singleWMSLayer = true;
                        this._statesSingleWMSLayers.set(baseLayerState.name, baseLayerState);
                    } else {
                        if (this._useCustomTileWms) {
                            baseLayer = new TileLayer({
                                // extent: extent,
                                minResolution: layerMinResolution,
                                maxResolution: layerMaxResolution,
                                source: new TileWMS({
                                    url: serviceURL,
                                    projection: qgisProjectProjection,
                                    serverType: 'qgis',
                                    tileGrid: this._customTileGrid,
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
                        } else {
                            baseLayer = new ImageLayer({
                                // extent: extent,
                                minResolution: layerMinResolution,
                                maxResolution: layerMaxResolution,
                                source: new ImageWMS({
                                    url: serviceURL,
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
                        }
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

            const visible = initialConfig.baseLayers.startupBaselayerName === baseLayerState.name;

            baseLayer.setProperties({
                name: baseLayerState.name,
                title: baseLayerState.title,
                visible: visible
            });

            // Force baselayer to be under the others layers
            baseLayer.setZIndex(baseLayerZIndex);

            baseLayers.push(baseLayer);

            if (visible && baseLayer.getSource().getProjection().getCode() !== qgisProjectProjection) {
                this.getView().getProjection().setExtent(lizmap3.map.restrictedExtent.toArray());
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
        this._baseLayersGroup.setProperties({
            name: 'LizmapBaseLayersGroup'
        });

        this._singleImageWmsGroup = new LayerGroup();
        this._singleImageWmsGroup.setProperties({
            name: 'LizmapSingleImageWmsGroup'
        });

        if (this._statesSingleWMSLayers.size > 0) {
            //create new Image layer and add it to the map
            const singleWMSLayer = new SingleWMSLayer(this);

            // create a new group
            this._singleImageWmsGroup = new LayerGroup({
                layers:[singleWMSLayer.layer]
            });
        }

        this._toolsGroup = new LayerGroup();
        this._toolsGroup.setZIndex(maxZIndex+2);
        this._toolsGroup.setProperties({
            name: 'LizmapToolsGroup'
        });

        // Add base and overlay layers to the map's main LayerGroup
        this.setLayerGroup(new LayerGroup({
            layers: [this._baseLayersGroup, this._singleImageWmsGroup, this._overlayLayersGroup, this._toolsGroup]
        }));

        // Sync new OL view with OL2 view
        lizmap3.map.events.on({
            move: () => {
                this.syncNewOLwithOL2View();
            }
        });

        this.on('moveend', () => {
            this._dispatchMapStateChanged();

            if (!this._newOlMap) {
                lizMap.map.setCenter(undefined,this.getView().getZoom(), false, false);
            }
        });

        // Init view
        this.syncNewOLwithOL2View();

        // Listen/Dispatch events
        this.getView().on('change', () => {
            if (this.isDragZoomActive) {
                this.deactivateDragZoom();
            }
        });

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
                    const mapLayer = rootMapGroup.getMapLayerByName(event.target.get('name'))
                    mapLayer.loadStatus = MapLayerLoadStatus.Loading;
                });
                source.on('imageloadend', event => {
                    const mapLayer = rootMapGroup.getMapLayerByName(event.target.get('name'))
                    mapLayer.loadStatus = MapLayerLoadStatus.Ready;
                });
                source.on('imageloaderror', event => {
                    const mapLayer = rootMapGroup.getMapLayerByName(event.target.get('name'))
                    mapLayer.loadStatus = MapLayerLoadStatus.Error;
                });
            } else if (source instanceof WMTS) {
                source.on('tileloadstart', event => {
                    const mapLayer = rootMapGroup.getMapLayerByName(event.target.get('name'))
                    mapLayer.loadStatus = MapLayerLoadStatus.Loading;
                });
                source.on('tileloadend', event => {
                    const mapLayer = rootMapGroup.getMapLayerByName(event.target.get('name'))
                    mapLayer.loadStatus = MapLayerLoadStatus.Ready;
                });
                source.on('tileloaderror', event => {
                    const mapLayer = rootMapGroup.getMapLayerByName(event.target.get('name'))
                    mapLayer.loadStatus = MapLayerLoadStatus.Error;
                });
            }
        }

        rootMapGroup.addListener(
            evt => {
                // if the layer is loaded ad single WMS, the visibility events are managed by the dedicated class
                if (this.isSingleWMSLayer(evt.name)) return;

                const olLayerOrGroup = this.getLayerOrGroupByName(evt.name);
                if (olLayerOrGroup) {
                    olLayerOrGroup.setVisible(evt.visibility);
                } else {
                    console.log('`'+evt.name+'` is not an OpenLayers layer or group!');
                }
            },
            ['layer.visibility.changed', 'group.visibility.changed']
        );

        rootMapGroup.addListener(
            evt => {
                // conservative control since the opacity events should not be fired for single WMS layers
                if (this.isSingleWMSLayer(evt.name)) return;

                const activeBaseLayer = this.getActiveBaseLayer();
                if (activeBaseLayer && activeBaseLayer.get("name") === evt.name) {
                    activeBaseLayer.setOpacity(evt.opacity);
                } else {
                    this.getLayerOrGroupByName(evt.name)?.setOpacity(evt.opacity);
                }
            },
            ['layer.opacity.changed', 'group.opacity.changed']
        );

        rootMapGroup.addListener(
            evt => {
                const stateOlLayerAndMap = this._statesOlLayersandGroupsMap.get(evt.name);
                if (!stateOlLayerAndMap) return;
                const [state, olLayer] = stateOlLayerAndMap;
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

        baseLayersState.addListener(
            evt => {
                this.changeBaseLayer(evt.name);
            },
            ['baselayers.selection.changed']
        );

        rootMapGroup.addListener(
            evt => {
                const extGroup = rootMapGroup.children[0];
                if (evt.name != extGroup.name)
                    return;
                const extLayerGroup = new LayerGroup({
                    layers: []
                });

                extLayerGroup.setVisible(extGroup.visibility);
                extLayerGroup.setZIndex(maxZIndex+1);
                extLayerGroup.setProperties({
                    name: extGroup.name,
                    type: 'ext-group'
                });
                this._overlayLayersGroup.getLayers().push(extLayerGroup);
                extGroup.addListener(
                    evtLayer => {
                        const extLayer = extGroup.children[0];
                        if (evtLayer.childName != extLayer.name)
                            return;
                        extLayer.olLayer.setProperties({
                            name: evtLayer.childName,
                            type: 'ol-layer'
                        });
                        extLayerGroup.getLayers().push(extLayer.olLayer);
                    }, ['ol-layer.added']
                );
                extGroup.addListener(
                    evtLayer => {
                        const layers = extLayerGroup
                            .getLayers()
                            .getArray()
                            .filter((item) => item.get('name') == evtLayer.childName);
                        if (layers.length == 0)
                            return;
                        extLayerGroup.getLayers().remove(layers[0]);
                    }, ['ol-layer.removed']
                );
            }, ['ext-group.added']
        );

        rootMapGroup.addListener(
            evt => {
                const groups = this._overlayLayersGroup
                    .getLayers()
                    .getArray()
                    .filter((item) => item.get('name') == evt.childName && item.get('type') == 'ext-group');
                if (groups.length == 0)
                    return;
                this._overlayLayersGroup.getLayers().remove(groups[0]);
            }, ['ext-group.removed']
        );

        // Create the highlight layer
        // used to display features on top of all layers
        const styleColor = 'rgba(255,255,0,0.8)';
        const styleWidth = 3;
        this._highlightLayer = new VectorLayer({
            source: new VectorSource({
                wrapX: false
            }),
            style: {
                'circle-stroke-color': styleColor,
                'circle-stroke-width': styleWidth,
                'circle-radius': 6,
                'stroke-color': styleColor,
                'stroke-width': styleWidth,
            }
        });
        this.addToolLayer(this._highlightLayer);

        // Add startup features to map if any
        const startupFeatures = mapState.startupFeatures;
        if (startupFeatures) {
            this.setHighlightFeatures(startupFeatures, "geojson");
        }

        mapState.addListener(
            evt => {
                const view = this.getView();
                const updateCenter = ('center' in evt && view.getCenter().filter((v, i) => {return evt['center'][i] != v}).length != 0);
                const updateZoom = ('zoom' in evt  && evt['zoom'] !== view.getZoom());
                const updateResolution = ('resolution' in evt  && evt['resolution'] !== view.getResolution());
                const updateExtent = ('extent' in evt && view.calculateExtent().filter((v, i) => {return evt['extent'][i] != v}).length != 0);
                if (updateCenter && updateResolution) {
                    view.animate({
                        center: evt['center'],
                        resolution: evt['resolution'],
                        duration: 50
                    });
                } else if (updateCenter) {
                    view.setCenter(evt['center']);
                } else if (updateZoom) {
                    view.animate({
                        zoom: evt['zoom'],
                        duration: 250
                    });
                } else if (updateResolution) {
                    view.setResolution(evt['resolution']);
                } else if (updateExtent) {
                    view.fit(evt['extent'], {nearest: true});
                }
            },
            ['map.state.changed']
        );
    }

    get hasEmptyBaseLayer() {
        return this._hasEmptyBaseLayer;
    }

    get baseLayersGroup(){
        return this._baseLayersGroup;
    }

    get toolsGroup(){
        return this._toolsGroup;
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
     * Key (name) / value (state) Map of layers loaded in a single WMS image
     * @type {Map}
     */
    get statesSingleWMSLayers(){
        return this._statesSingleWMSLayers;
    }
    /**
     * Map and base Layers are loaded as TileWMS
     * @type {boolean}
     */
    get useTileWms(){
        return this._useCustomTileWms;
    }
    /**
     * TileGrid configuration when layers is loaded as TileWMS
     * @type {null|TileGrid}
     */
    get customTileGrid(){
        return this._customTileGrid;
    }
    /**
     * WMS/TileWMS high dpi support
     * @type {boolean}
     */
    get hidpi(){
        return this._hidpi;
    }
    /**
     * Is dragZoom active?
     * @type {boolean}
     */
    get isDragZoomActive(){
        return this._dragZoom.getActive();
    }

    /**
     * Add highlight features on top of all layer
     * @param {string} features features as GeoJSON or WKT
     * @param {string} format format string as `geojson` or `wkt`
     * @param {string|undefined} projection optional features projection
     */
    addHighlightFeatures(features, format, projection) {
        const qgisProjectProjection = this._lizmap3.map.getProjection();
        let olFeatures;
        if (format === "geojson") {
            olFeatures = (new GeoJSON()).readFeatures(features, {
                dataProjection: projection,
                featureProjection: qgisProjectProjection
            });
        } else if (format === "wkt") {
            olFeatures = (new WKT()).readFeatures(features, {
                dataProjection: projection,
                featureProjection: qgisProjectProjection
            });
        } else {
            return;
        }
        this._highlightLayer.getSource().addFeatures(olFeatures);
    }

    /**
     * Set highlight features on top of all layer
     * @param {string} features features as GeoJSON or WKT
     * @param {string} format format string as `geojson` or `wkt`
     * @param {string|undefined} projection optional features projection
     */
    setHighlightFeatures(features, format, projection){
        this.clearHighlightFeatures();
        this.addHighlightFeatures(features, format, projection);
    }

    /**
     * Clear all highlight features
     */
    clearHighlightFeatures() {
        this._highlightLayer.getSource().clear();
    }

    /**
     * Synchronize new OL view with OL2 one
     * @memberof Map
     */
    syncNewOLwithOL2View(){
        const center = this._lizmap3.map.getCenter();
        this.getView().animate({
            center: [center.lon, center.lat],
            zoom: this._lizmap3.map.getZoom(),
            duration: 50
        });
    }

    refreshOL2View() {
        // This refresh OL2 view and layers
        this._lizmap3.map.setCenter(
            this.getView().getCenter(),
            this.getView().getZoom()
        );
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
        const qgisProjectProjection = this._lizmap3.map.getProjection();
        if (selectedBaseLayer?.getSource().getProjection().getCode() !== qgisProjectProjection) {
            this.getView().getProjection().setExtent(this._lizmap3.map.restrictedExtent.toArray());
        } else {
            this.getView().getProjection().setExtent(getProjection(qgisProjectProjection).getExtent());
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
     * @param {string} name The layer name.
     * @returns {ImageLayer|undefined} The OpenLayers layer or undefined
     */
    getLayerByName(name){
        // if the layer is included in the singleWMSLayer, return the single ImageLayer instance
        if(this._statesSingleWMSLayers.get(name)){
            return this._singleImageWmsGroup.getLayersArray()[0]
        }

        return this.overlayLayers.find(
            layer => layer.get('name') === name
        );
    }

    /**
     * Return overlay layer or group if `name` matches.
     * `name` is unique for every layers/groups
     * @param {string} name The layer or group name.
     * @returns {ImageLayer|LayerGroup|undefined} The OpenLayers layer or OpenLayers group or undefined
     */
    getLayerOrGroupByName(name){
        return this.overlayLayersAndGroups.find(
            layer => layer.get('name') === name
        );
    }

    /**
     * Return MapLayerState instance of WMS layer or group if the layer is loaded in the single WMS image, undefined if not.
     * @param {string} name the WMS layer or group name
     * @returns {MapLayerState|undefined} the MapLayerState instance of WMS layer or group if the layer is loaded in the single WMS image or undefined.
     */
    isSingleWMSLayer(name){

        return this.statesSingleWMSLayers.get(name);
    }

    /**
     * Activate DragZoom interaction
     */
    activateDragZoom() {
        this._dragZoom.setActive(true);
        mainEventDispatcher.dispatch('dragZoom.activated');
    }

    /**
     * Deactivate DragZoom interaction
     */
    deactivateDragZoom() {
        this._dragZoom.setActive(false);
        mainEventDispatcher.dispatch('dragZoom.deactivated');
    }

    /**
     * Adds the given layer to the top of the tools group layers.
     * @param {LayerBase} layer Layer.
     */
    addToolLayer(layer) {
        this._toolsGroup.getLayers().push(layer);
    }

    /**
     * Removes the given layer from the tools group layers.
     * @param {LayerBase} layer Layer.
     */
    removeToolLayer(layer) {
        this._toolsGroup.getLayers().remove(layer);
    }

    /**
     * Zoom to given geometry or extent
     * @param {Geometry|Extent} geometryOrExtent The geometry or extent to zoom to. CRS is 4326 by default.
     * @param {object} [options] Options.
     */
    zoomToGeometryOrExtent(geometryOrExtent, options) {
        const geometryType = geometryOrExtent.getType?.();
        if (geometryType && (this._initialConfig.options.max_scale_lines_polygons || this._initialConfig.options.max_scale_lines_polygons)) {
            let maxScale;
            if (['Polygon', 'Linestring', 'MultiPolygon', 'MultiLinestring'].includes(geometryType)){
                maxScale = this._initialConfig.options.max_scale_lines_polygons;
            } else if (geometryType === 'Point'){
                maxScale = this._initialConfig.options.max_scale_points;
            }
            const resolution = Utils.getResolutionFromScale(
                maxScale,
                this.getView().getProjection().getMetersPerUnit()
            );
            if (!options?.minResolution) {
                if (!options) {
                    options = { minResolution: resolution };
                } else {
                    options.minResolution = resolution;
                }
            }
        }
        this.getView().fit(geometryOrExtent, options);
    }

    /**
     * Zoom to given feature id
     * @param {string} featureTypeDotId The string as `featureType.fid` to zoom to.
     * @param {object} [options] Options.
     */
    zoomToFid(featureTypeDotId, options) {
        const [featureType, fid] = featureTypeDotId.split('.');
        if (!featureType || !fid) {
            console.log('Wrong string for featureType.fid');
            return;
        }
        lizMap.getLayerFeature(featureType, fid, feat => {
            const olFeature = (new GeoJSON()).readFeature(feat, {
                dataProjection: 'EPSG:4326',
                featureProjection: this.getView().getProjection()
            });
            this.zoomToGeometryOrExtent(olFeature.getGeometry(), options);
        });
    }
}
