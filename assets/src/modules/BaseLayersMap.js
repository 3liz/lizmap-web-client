import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import olMap from 'ol/Map';
import View from 'ol/View';

import TileLayer from 'ol/layer/Tile';
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
                projection: mainLizmap.projection === 'EPSG:900913' ? 'EPSG:3857' : mainLizmap.projection,
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

        this._baseLayers = [];
        let firstBaseLayer = true;
        for (const [title, params] of Object.entries(mainLizmap.config?.baseLayers)) {
            if(params.type = 'xyz'){
                this._baseLayers.push(
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
}
