import { mainLizmap } from '../modules/Globals.js';
import olMap from 'ol/Map';
import View from 'ol/View';

import ImageWMS from 'ol/source/ImageWMS';
import {Image as ImageLayer} from 'ol/layer';

import OSM from 'ol/source/OSM';
import Stamen from 'ol/source/Stamen';
import TileLayer from 'ol/layer/Tile';

import WMTS from 'ol/source/WMTS';
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
                projection: mainLizmap.projection === 'EPSG:900913' ? 'EPSG:3857' : mainLizmap.projection,
                enableRotation: false,
                extent: mainLizmap.lizmap3.map.restrictedExtent.toArray(),
                constrainOnlyCenter: true // allow view outside the restricted extent when zooming
            }),
            target: 'baseLayersOlMap'
        });

        if(mainLizmap.config.options?.['osmMapnik']){
            this.addLayer(
                new TileLayer({
                  source: new OSM()
                })
            );
        }

        if(mainLizmap.config.options?.['osmStamenToner']){
            this.addLayer(
                new TileLayer({
                    source: new Stamen({
                      layer: 'toner-lite',
                    }),
                  }),
            );
        }

        // IGN
        if(Object.keys(lizMap.config.options).some( option => option.startsWith('ign'))){

            const proj3857 = getProjection('EPSG:3857');
            const maxResolution = getWidth(proj3857.getExtent()) / 256;

            const ignConfigs = {
                ignStreets : {
                    layer : 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
                    urlPart : 'cartes',
                    format : 'image/png',
                    numZoomLevels: 20
                },
                ignSatellite : {
                    layer : 'ORTHOIMAGERY.ORTHOPHOTOS',
                    urlPart : 'ortho',
                    format : 'image/jpeg',
                    numZoomLevels: 22
                },
                ignTerrain : {
                    layer : 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
                    urlPart : lizMap.config.options?.ignKey,
                    format : 'image/jpeg',
                    numZoomLevels: 18
                },
                ignCadastral : {
                    layer : 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS',
                    urlPart : 'parcellaire',
                    format : 'image/png',
                    numZoomLevels: 20
                }
            };

            for (const key in ignConfigs) {
                if(lizMap.config.options?.[key]){

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
                        source: ign_source,
                      });
                      
                      this.addLayer(ign);
                }
            }
        }

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
}
