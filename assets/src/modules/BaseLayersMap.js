import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import Utils from '../modules/Utils.js';
import olMap from 'ol/Map';
import View from 'ol/View';
import { transformExtent, Projection } from 'ol/proj';
import ImageWMS from 'ol/source/ImageWMS.js';
import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS.js';
import WMTSCapabilities from 'ol/format/WMTSCapabilities.js';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer.js';
import OSM from 'ol/source/OSM';
import Stamen from 'ol/source/Stamen';
import XYZ from 'ol/source/XYZ';
import BingMaps from 'ol/source/BingMaps';
import LayerGroup from 'ol/layer/Group';

import DragPan from "ol/interaction/DragPan";
import MouseWheelZoom from "ol/interaction/MouseWheelZoom";
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom';
import { defaults as defaultInteractions } from 'ol/interaction.js';

/** Class initializing Openlayers Map. */
export default class BaseLayersMap extends olMap {

    constructor() {
        const qgisProjectProjection = mainLizmap.projection;
        let mapProjection = new Projection({code: qgisProjectProjection});

        if(!['EPSG:3857', 'EPSG:4326'].includes(qgisProjectProjection)){
            mapProjection.setExtent(mainLizmap.lizmap3.map.restrictedExtent.toArray());
        }

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

        if (mainLizmap.config.options?.['osmMapnik']) {
            this.addLayer(
                new TileLayer({
                    title: 'OpenStreetMap',
                    source: new OSM()
                })
            );
        }

        if (mainLizmap.config.options?.['osmStamenToner']) {
            this.addLayer(
                new TileLayer({
                    source: new Stamen({
                        title: 'OSM Stamen Toner',
                        layer: 'toner-lite',
                    }),
                }),
            );
        }

        if (mainLizmap.config.options?.['openTopoMap']) {
            this.addLayer(
                new TileLayer({
                    title: 'OpenTopoMap',
                    source: new XYZ({
                        url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
                    })
                })
            );
        }

        if(mainLizmap.config.options?.['osmCyclemap'] && mainLizmap.config.options?.['OCMKey']){
            this.addLayer(
                new TileLayer({
                    name: 'osm-cycle',
                    title: 'OSM CycleMap',
                    source: new XYZ({
                        url : 'https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + mainLizmap.config.options?.['OCMKey']
                    })
                })
            );
        }


        // Bing
        if(Object.keys(mainLizmap.config.options).some( option => option.startsWith('bing'))){
            const bingConfigs = {
                bingStreets : {
                    title: 'Bing Road',
                    imagerySet: 'RoadOnDemand'
                },
                bingSatellite : {
                    title: 'Bing Aerial',
                    imagerySet: 'Aerial'
                },
                bingHybrid : {
                    title: 'Bing Hybrid',
                    imagerySet: 'AerialWithLabelsOnDemand'
                }
            };

            for (const key in bingConfigs) {
                if(mainLizmap.config.options?.[key]){

                    const bingConfig = bingConfigs[key];

                    this.addLayer(
                        new TileLayer({
                            title: bingConfig.title,
                            preload: Infinity,
                            source: new BingMaps({
                                key: mainLizmap.config.options.bingKey,
                                imagerySet: bingConfig.imagerySet,
                                culture: navigator.language
                            }),
                        })
                    );
                }
            }
        }

        const baseLayers = [];
        let firstBaseLayer = true;
        let cfgBaseLayers = [];
        if(mainLizmap.config?.baseLayers){
            cfgBaseLayers = Object.entries(mainLizmap.config.baseLayers);
        }
        for (const [title, params] of cfgBaseLayers) {
            if(params.type = 'xyz'){
                baseLayers.push(
                    new TileLayer({
                        title: title,
                        visible: firstBaseLayer,
                        source: new XYZ({
                            url: params.url,
                            minZoom: params?.zmin,
                            maxZoom: params?.zmax,
                        })
                    })
                );
            }

            firstBaseLayer = false;
        }

        this._baseLayersGroup = new LayerGroup({
            layers: baseLayers
        });

        this._baseLayersGroup.on('change', () => {
            mainEventDispatcher.dispatch('baseLayers.changed');
        });

        // Array of layers and groups in overlayLayerGroup
        this._overlayLayersAndGroups = [];

        // Returns a layer or a layerGroup depending of the node type
        const createNode = (node, parentName) => {
            if(node.type === 'group'){
                const layers = [];
                for (const layer of node.children.slice().reverse()) {
                    layers.push(createNode(layer, node.name));
                }
                const layerGroup = new LayerGroup({
                    layers: layers,
                    properties: {
                        name: node.name,
                        parentName: parentName
                    }
                });

                if(node.name !== 'root'){
                    this._overlayLayersAndGroups.push(layerGroup);
                }

                return layerGroup;
            } else {
                let layer;
                const layerCfg = mainLizmap.config?.layers?.[node.name];
                // Keep only layers with a geometry
                if(layerCfg.type !== 'layer'){
                    return;
                }
                if(["", "none", "unknown"].includes(layerCfg.geometryType)){
                    return;
                }

                let extent = layerCfg.extent;
                if(layerCfg.crs !== "" && layerCfg.crs !== mainLizmap.projection){
                    extent = transformExtent(extent, layerCfg.crs, mainLizmap.projection);
                }

                // Set min/max resolution only if different from default
                let minResolution = layerCfg.minScale === 1 ? undefined : Utils.getResolutionFromScale(layerCfg.minScale);
                let maxResolution = layerCfg.maxScale === 1000000000000 ? undefined : Utils.getResolutionFromScale(layerCfg.maxScale);

                if (layerCfg.cached === "False") {
                    layer = new ImageLayer({
                        // extent: extent,
                        minResolution: minResolution,
                        maxResolution: maxResolution,
                        visible: layerCfg.toggled === "True",
                        source: new ImageWMS({
                            url: mainLizmap.serviceURL,
                            serverType: 'qgis',
                            params: {
                                LAYERS: layerCfg?.shortname || layerCfg.name,
                                FORMAT: layerCfg.imageFormat,
                                DPI: 96
                            },
                        })
                    });
                } else {
                    const parser = new WMTSCapabilities();
                    const result = parser.read(lizMap.wmtsCapabilities);
                    const options = optionsFromCapabilities(result, {
                        layer: layerCfg?.shortname || layerCfg.name,
                        matrixSet: layerCfg.crs,
                    });

                    layer = new TileLayer({
                        minResolution: minResolution,
                        maxResolution: maxResolution,
                        source: new WMTS(options)
                    });
                }

                layer.setProperties({
                    name: layerCfg.name,
                    parentName: parentName
                });

                // Set layer's group visible to `true` when layer's visible is set to `true`
                // As in QGIS
                layer.on('change:visible', evt => {
                    const layer = evt.target;
                    if (layer.getVisible()) {
                        const parentGroup = this.getLayerOrGroupByName(layer.get('parentName'));
                        parentGroup?.setVisible(true);
                    }
                });

                this._overlayLayersAndGroups.push(layer);
                return layer;
            }
        }

        this._overlayLayersGroup = createNode(mainLizmap.config.layersTree);

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
            duration: 0
        });
    }

    setLayerVisibilityByTitle(title){
        this.getAllLayers().map( baseLayer => baseLayer.setVisible(baseLayer.get('title') == title));
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

    /**
     * Return overlay layer if `typeName` matches
     */
    getLayerByTypeName(typeName){
        return this.overlayLayers.find(
            layer => layer.getSource().getParams?.()?.LAYERS === typeName
        );
    }
}
