import { mainLizmap } from '../modules/Globals.js';
import olMap from 'ol/Map';
import View from 'ol/View';

import ImageWMS from 'ol/source/ImageWMS';
import {Image as ImageLayer} from 'ol/layer';

import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';

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
            target: 'baseLayersOlMap',
            layers: [
                new TileLayer({
                  source: new OSM(),
                }),
                new ImageLayer({
                    extent: mainLizmap.lizmap3.map.restrictedExtent.toArray(),
                    source: new ImageWMS({
                      url: 'https://demo.lizmap.com/lizmap/index.php/lizmap/service/?repository=feat1&project=multi_atlas',
                      projection: 'EPSG:2154',
                      params: {
                          'LAYERS': 'VilleMTP_MTP_Quartiers_2011'
                        },
                      ratio: 2, // This avoids to have many extra requests when panning on long distance
                      serverType: 'qgis',
                    }),
                  }),
              ]
        });

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
