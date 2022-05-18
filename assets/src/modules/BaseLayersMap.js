import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import olMap from 'ol/Map';
import View from 'ol/View';

import ImageWMS from 'ol/source/ImageWMS';
import {Image as ImageLayer} from 'ol/layer';

import LayerGroup from 'ol/layer/Group';

import OSM from 'ol/source/OSM';
import Stamen from 'ol/source/Stamen';
import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';
import BingMaps from 'ol/source/BingMaps';

import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import {get as getProjection} from 'ol/proj';
import {getWidth} from 'ol/extent';

import DragPan from "ol/interaction/DragPan";
import MouseWheelZoom from "ol/interaction/MouseWheelZoom";
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom';
import { defaults as defaultInteractions } from 'ol/interaction.js';
import { Kinetic } from "ol";

/** Class initializing Openlayers Map. */
export default class Map extends olMap {

    constructor() {
        super({
            controls: [], // disable default controls
            interactions: defaultInteractions({
                dragPan: false,
                mouseWheelZoom: false
            }).extend([
                new DragPan({ kinetic: new Kinetic(0, 0, 0) }),
                new MouseWheelZoom({ duration: 0 }),
                new DoubleClickZoom({ duration: 0 })
            ]),
            view: new View({
                resolutions: mainLizmap.lizmap3.map.baseLayer.resolutions,
                constrainResolution: true,
                center: mainLizmap.center,
                projection: mainLizmap.projection,
                enableRotation: false,
                extent: mainLizmap.lizmap3.map.restrictedExtent.toArray(),
                constrainOnlyCenter: true // allow view outside the restricted extent when zooming
            }),
            target: 'baseLayersOlMap'
        });

        var startupBaselayersReplacement = {
            'osm-mapnik': 'OpenStreetMap',
            'osm-stamen-toner': 'OSM Stamen Toner',
            'opentopomap': 'OpenTopoMap',
            'osm-cyclemap': 'OSM CycleMap',
            'google-satellite': 'Google Satellite',
            'google-hybrid': 'Google Hybrid',
            'google-terrain': 'Google Terrain',
            'google-street': 'Google Streets',
            'bing-road': 'Bing Road',
            'bing-aerial': 'Bing Aerial',
            'bing-hybrid': 'Bing Hybrid',
            'ign-scan': 'IGN Scan',
            'ign-plan': 'IGN Plan',
            'ign-photo': 'IGN Photos',
            'ign-cadastral': 'IGN Cadastre',
            'empty': lizDict['baselayer.empty.title']
        };

        this._baseLayers = [];

        // OSM
        if(mainLizmap.config.options?.['osmMapnik']){
            this._baseLayers.push(
                new TileLayer({
                    title: 'OpenStreetMap',
                    source: new OSM()
                })
            );
        }

        if(mainLizmap.config.options?.['osmStamenToner']){
            this._baseLayers.push(
                new TileLayer({
                    title: 'OSM Stamen Toner',
                    source: new Stamen({
                        layer: 'toner-lite',
                    }),
                }),
            );
        }

        if(mainLizmap.config.options?.['openTopoMap']){
            this._baseLayers.push(
                new TileLayer({
                    title: 'OpenTopoMap',
                    source: new XYZ({
                        url : 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
                    })
                })
            );
        }

        if(mainLizmap.config.options?.['osmCyclemap'] && mainLizmap.config.options?.['OCMKey']){
            this._baseLayers.push(
                new TileLayer({
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

                    this._baseLayers.push(
                        new TileLayer({
                            title: bingConfig.title,
                            preload: Infinity,
                            source: new BingMaps({
                                key: mainLizmap.config.options.bingKey,
                                imagerySet: bingConfig.imagerySet,
                            // use maxZoom 19 to see stretched tiles instead of the BingMaps
                            // "no photos at this zoom level" tiles
                            // maxZoom: 19
                            }),
                        })
                    );
                }
            }
        }

        // IGN
        if(Object.keys(mainLizmap.config.options).some( option => option.startsWith('ign'))){

            const proj3857 = getProjection('EPSG:3857');
            const maxResolution = getWidth(proj3857.getExtent()) / 256;

            const ignConfigs = {
                ignStreets : {
                    title : 'IGN Plan',
                    layer : 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
                    urlPart : 'cartes',
                    format : 'image/png',
                    numZoomLevels: 20
                },
                ignSatellite : {
                    title : 'IGN Photos',
                    layer : 'ORTHOIMAGERY.ORTHOPHOTOS',
                    urlPart : 'ortho',
                    format : 'image/jpeg',
                    numZoomLevels: 22
                },
                ignTerrain : {
                    title : 'IGN Scan',
                    layer : 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
                    urlPart : mainLizmap.config.options?.ignKey,
                    format : 'image/jpeg',
                    numZoomLevels: 18
                },
                ignCadastral : {
                    title : 'IGN Cadastre',
                    layer : 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS',
                    urlPart : 'parcellaire',
                    format : 'image/png',
                    numZoomLevels: 20
                }
            };

            for (const key in ignConfigs) {
                if(mainLizmap.config.options?.[key]){

                    const ignConfig = ignConfigs[key];

                    const resolutions = [];
                    const matrixIds = [];
                    
                    for (let i = 0; i < ignConfig.numZoomLevels; i++) {
                        matrixIds[i] = i.toString();
                        resolutions[i] = maxResolution / Math.pow(2, i);
                    }
                    
                    const tileGrid = new WMTSTileGrid({
                        origin: [-20037508, 20037508],
                        resolutions: resolutions,
                        matrixIds: matrixIds,
                    });

                    const ign_source = new WMTS({
                        url: 'https://wxs.ign.fr/' + ignConfig.urlPart + '/geoportail/wmts',
                        layer: ignConfig.layer,
                        matrixSet: 'PM',
                        format: ignConfig.format,
                        projection: 'EPSG:3857',
                        tileGrid: tileGrid,
                        style: 'normal',
                        attributions:
                          '<a href="https://www.ign.fr/" target="_blank">' +
                          '<img src="https://wxs.ign.fr/static/logos/IGN/IGN.gif" title="Institut national de l\'' +
                          'information géographique et forestière" alt="IGN"></a>',
                    });
                      
                    const ign = new TileLayer({
                        title: ignConfig.title,
                        source: ign_source,
                    });
                      
                    this._baseLayers.push(ign);
                }
            }
        }

        // User-defined
        for (const key in mainLizmap.config?.layers) {
            const layerCfg = mainLizmap.config.layers[key];
            if(layerCfg?.baseLayer === "True"){

                if(layerCfg.singleTile === "True"){
                    this._baseLayers.push(
                        new ImageLayer({
                            title: layerCfg.title,
                            extent: mainLizmap.lizmap3.map.restrictedExtent.toArray(),
                            source: new ImageWMS({
                                url: mainLizmap.serviceURL,
                                projection: mainLizmap.projection,
                                params: {
                                    'LAYERS': layerCfg.name,
                                    'FORMAT': layerCfg.imageFormat
                                },
                                serverType: 'qgis',
                            }),
                        }),
                    )
                }else{
                    const parser = new WMTSCapabilities();
                    const result = parser.read(mainLizmap.wmtsCapaData);
                    const options = optionsFromCapabilities(result, {
                        layer: layerCfg.name,
                    });

                    this._baseLayers.push(
                        new TileLayer({
                            title: layerCfg.title,
                            source: new WMTS(options),
                        }),
                    )
                }
            }
        }

        // Handle visibility at startup
        const startupBaselayer = mainLizmap.config.options?.['startupBaselayer'];

        this._baseLayers.map((baseLayer) => {
            baseLayer.setVisible(baseLayer.get('title') === (startupBaselayersReplacement?.[startupBaselayer] || startupBaselayer) );
        });

        const layerGroup = new LayerGroup({
            layers: this._baseLayers
        });

        layerGroup.on('change', () => {
            mainEventDispatcher.dispatch('baseLayers.changed');
        });

        this.setLayerGroup(layerGroup);

        // Sync new OL view with OL2 view
        mainLizmap.lizmap3.map.events.on({
            move: () => {
                this.syncNewOLwithOL2View();
            }
        });

        // Init view
        this.syncNewOLwithOL2View();
    }

    get hasEmptyBaseLayer() {
        return mainLizmap.config.options?.['emptyBaselayer'];
    }

    get hasEmptyBaseLayerAtStartup() {
        return mainLizmap.config.options?.['startupBaselayer'] === "empty";
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
        this.getAllLayers().map( baseLayer => baseLayer.setVisible(baseLayer.get('title') === title));
    }
}
