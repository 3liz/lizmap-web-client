import { mainLizmap } from '../modules/Globals.js';
import olMap from 'ol/Map';
import View from 'ol/View';

import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Stamen from 'ol/source/Stamen';
import XYZ from 'ol/source/XYZ';

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
