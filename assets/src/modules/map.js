import { mainLizmap, mainEventDispatcher } from './Globals.js';
import Utils from './Utils.js';
import { BaseLayerTypes } from './config/BaseLayer.js';
import { MapLayerLoadStatus } from './state/MapLayer.js';
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
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer.js';
import TileGrid from 'ol/tilegrid/TileGrid.js';
import TileWMS from 'ol/source/TileWMS.js';
import XYZ from 'ol/source/XYZ.js';
import BingMaps from 'ol/source/BingMaps.js';
import LayerGroup from 'ol/layer/Group.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';

import DragPan from "ol/interaction/DragPan.js";
import MouseWheelZoom from "ol/interaction/MouseWheelZoom.js";
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom.js';
import DragZoom from 'ol/interaction/DragZoom.js';
import { defaults as defaultInteractions } from 'ol/interaction.js';
import { always } from 'ol/events/condition.js';

/** Class initializing Openlayers Map. */
export default class map extends olMap {

    constructor() {
        const qgisProjectProjection = mainLizmap.projection;
        const mapProjection = getProjection(qgisProjectProjection);

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
                resolutions: mainLizmap.lizmap3.map.resolutions ? mainLizmap.lizmap3.map.resolutions : mainLizmap.lizmap3.map.baseLayer.resolutions,
                constrainResolution: true,
                center: [mainLizmap.lizmap3.map.getCenter().lon, mainLizmap.lizmap3.map.getCenter().lat],
                projection: mapProjection,
                enableRotation: false,
                extent: mainLizmap.lizmap3.map.restrictedExtent.toArray(),
                constrainOnlyCenter: true // allow view outside the restricted extent when zooming
            }),
            target: 'newOlMap'
        });

        this._newOlMap = true;

        // Zoom to box
        const dragZoom = new DragZoom({
            condition: always
        });

        document.querySelector('#navbar .pan').addEventListener('click', () => {
            this.removeInteraction(dragZoom);
        });

        document.querySelector('#navbar .zoom').addEventListener('click', () => {
            this.addInteraction(dragZoom);
        });

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

            mainLizmap.state.map.update({
                'type': 'map.state.changing',
                'projection': projection.getCode(),
                'center': [...view.getCenter()],
                'size': [...this.getSize()],
                'extent': view.calculateExtent(),
                'resolution': resolution,
                'scaleDenominator': scaleDenominator,
                'pointResolution': pointResolution,
                'pointScaleDenominator': pointScaleDenominator,
            });
        };

        // Ratio between WMS single tiles and map viewport
        this._WMSRatio = 1.1;

        // Respecting WMS max size
        const wmsMaxSize = [
            mainLizmap.initialConfig.options.wmsMaxWidth,
            mainLizmap.initialConfig.options.wmsMaxHeight,
        ];

        const customTileGrid = new TileGrid({
            extent: mainLizmap.lizmap3.map.restrictedExtent.toArray(),
            resolutions: mainLizmap.lizmap3.map.resolutions ? mainLizmap.lizmap3.map.resolutions : mainLizmap.lizmap3.map.baseLayer.resolutions,
            tileSize: this.getSize().map((x, i) => Math.min(Math.ceil(x*this._WMSRatio/2), Math.ceil(wmsMaxSize[i]*this._WMSRatio/2))),
        });

        const useTileWms = this.getSize().map((x) => Math.ceil(x*this._WMSRatio)).reduce(
            (r /*accumulator*/, x /*currentValue*/, i /*currentIndex*/) => r || x > wmsMaxSize[i],
            false,
        );

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
                            ratio: WMSRatio,
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

                    if (useTileWms) {
                        layer = new TileLayer({
                            // extent: extent,
                            minResolution: minResolution,
                            maxResolution: maxResolution,
                            source: new TileWMS({
                                url: mainLizmap.serviceURL,
                                serverType: 'qgis',
                                tileGrid: customTileGrid,
                                params: {
                                    LAYERS: node.wmsName,
                                    FORMAT: node.layerConfig.imageFormat,
                                    STYLES: node.wmsSelectedStyleName,
                                    DPI: 96,
                                    TILED: 'true'
                                },
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
                let minResolution = baseLayerState.wmsMinScaleDenominator <= 1 ? undefined : Utils.getResolutionFromScale(baseLayerState.layerConfig.minScale, metersPerUnit);
                let maxResolution = baseLayerState.wmsMaxScaleDenominator <= 1 ? undefined : Utils.getResolutionFromScale(baseLayerState.layerConfig.maxScale, metersPerUnit);
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
                let minResolution = baseLayerState.wmsMinScaleDenominator <= 1 ? undefined : Utils.getResolutionFromScale(baseLayerState.layerConfig.minScale, metersPerUnit);
                let maxResolution = baseLayerState.wmsMaxScaleDenominator <= 1 ? undefined : Utils.getResolutionFromScale(baseLayerState.layerConfig.maxScale, metersPerUnit);

                if (baseLayerState.layerConfig.cached) {
                    const parser = new WMTSCapabilities();
                    const result = parser.read(lizMap.wmtsCapabilities);
                    const options = optionsFromCapabilities(result, {
                        layer: baseLayerState.itemState.wmsName,
                        matrixSet: mainLizmap.projection,
                    });

                    baseLayer = new TileLayer({
                        minResolution: minResolution,
                        maxResolution: maxResolution,
                        source: new WMTS(options)
                    });
                } else {
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
                    if (useTileWms) {
                        baseLayer = new TileLayer({
                            // extent: extent,
                            minResolution: minResolution,
                            maxResolution: maxResolution,
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

        // Sync OL2 view with new OL view
        this.on('pointerdrag', () => {
            mainLizmap.lizmap3.map.setCenter(
                this.getView().getCenter(),
                null,
                true // avoid many WMS request in OL2 map and also movestart/end events.
            );
        });

        this.on('moveend', this.refreshOL2View);

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
        this.addLayer(this._highlightLayer);

        // Add startup features to map if any
        const startupFeatures = mainLizmap.state.map.startupFeatures;
        if (startupFeatures) {
            this.setHighlightFeatures(startupFeatures, "geojson");
        }
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
     * Add highlight features on top of all layer
     * @param {string} features features as GeoJSON or WKT
     * @param {string} format format string as `geojson` or `wkt`
     * @param {string|undefined} projection optional features projection
     */
    addHighlightFeatures(features, format, projection) {
        let olFeatures;
        if (format === "geojson") {
            olFeatures = (new GeoJSON()).readFeatures(features, {
                dataProjection: projection,
                featureProjection: mainLizmap.projection
            });
        } else if (format === "wkt") {
            olFeatures = (new WKT()).readFeatures(features, {
                dataProjection: projection,
                featureProjection: mainLizmap.projection
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
        this.getView().animate({
            center: mainLizmap.center,
            zoom: mainLizmap.lizmap3.map.getZoom(),
            duration: 50
        });
    }

    refreshOL2View() {
        // This refresh OL2 view and layers
        mainLizmap.lizmap3.map.setCenter(
            this.getView().getCenter(),
            this.getView().getZoom()
        );
    };

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
     */
    getLayerOrGroupByName(name){
        return this.overlayLayersAndGroups.find(
            layer => layer.get('name') === name
        );
    }
}
