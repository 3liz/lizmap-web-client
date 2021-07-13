import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import olMap from 'ol/Map';
import View from 'ol/View';

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
                center: [mainLizmap.lizmap3.map.getCenter().lon, mainLizmap.lizmap3.map.getCenter().lat],
                projection: mainLizmap.projection === 'EPSG:900913' ? 'EPSG:3857' : mainLizmap.projection,
                enableRotation: false,
                extent: mainLizmap.lizmap3.map.restrictedExtent.toArray(),
                constrainOnlyCenter: true // allow view outside the restricted extent when zooming
            }),
            target: 'newOlMap'
        });

        this._newOlMap = false;

        this._refreshOL2View = () => {
            // This refresh OL2 view and layers
            mainLizmap.lizmap3.map.setCenter(
                this.getView().getCenter(),
                this.getView().getZoom()
            );
        };

        // Sync new OL view with OL2 view
        mainLizmap.lizmap3.map.events.on({
            moveend: () => {
                // Remove moveend listener and add it after animate ends
                // to avoid extra sync
                this.un('moveend', this._refreshOL2View);

                // Sync center
                this.getView().animate({
                    center: this._lizmap3Center,
                    zoom: mainLizmap.lizmap3.map.getZoom(),
                    duration: 0
                }, () => this.on('moveend', this._refreshOL2View));

                mainEventDispatcher.dispatch('map.moveend');
            },
            zoomstart: (evt) => {
                // Remove moveend listener and add it after animate ends
                // to avoid extra sync
                this.un('moveend', this._refreshOL2View);

                // Sync zoom level
                this.getView().animate({
                    zoom: evt.zoom,
                    duration: 0
                }, () => this.on('moveend', this._refreshOL2View));

                mainEventDispatcher.dispatch('map.zoomstart');
            },
            zoomend: () => {
                mainEventDispatcher.dispatch('map.zoomend');
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

        // TODO: we need a OL6 movestart or zoomstart event giving the target zoom
        // to sync OL2 zoom without waiting moveend event as done with OL2 zoomstart
        // This would avoid a visual shift between OL2 and OL6 when zooming
        this.on('moveend', this._refreshOL2View);

        // Init view
        this.syncNewOLwithOL2View();
    }

    /**
     * Returns Lizmap 3 map center
     * @readonly
     * @memberof Map
     * @return {[number, number]} lon, lat coords
     */
    get _lizmap3Center(){
        return [mainLizmap.lizmap3.map.getCenter().lon, mainLizmap.lizmap3.map.getCenter().lat];
    }

    /**
     * Synchronize new OL view with OL2 one
     * @memberof Map
     */
    syncNewOLwithOL2View(){
        this.getView().animate({
            center: this._lizmap3Center,
            zoom: mainLizmap.lizmap3.map.getZoom(),
            duration: 0
        });
    }
}
