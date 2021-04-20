import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import olMap from 'ol/Map';
import View from 'ol/View';

/** Class initializing Openlayers Map. */
export default class Map {

    constructor() {
        this._olMap = new olMap({
            controls: [], // disable default controls
            view: new View({
                center: [0, 0],
                zoom: 2,
                projection: mainLizmap.projection === 'EPSG:900913' ? 'EPSG:3857' : mainLizmap.projection
            }),
            target: 'newOlMap'
        });

        this._olMap.on('moveend', () => {
            mainLizmap.lizmap3.map.setCenter(this._olMap.getView().getCenter());
        });

        // Init view
        this.syncNewOLwithOL2View();

        // Listen to old map events to dispatch new ones
        mainLizmap.lizmap3.map.events.on({
            moveend: () => {
                this.syncNewOLwithOL2View();

                mainEventDispatcher.dispatch('map.moveend');
            },
            zoomend: () => {
                this.syncNewOLwithOL2View();

                mainEventDispatcher.dispatch('map.zoomend');
            }
        });
    }

    /**
     * Synchronize new OL view with OL2 one
     * @memberof Map
     */
    syncNewOLwithOL2View(){
        this._olMap.getView().setResolution(mainLizmap.lizmap3.map.getResolution());

        const lizmap3Center = mainLizmap.lizmap3.map.getCenter();
        this._olMap.getView().setCenter([lizmap3Center.lon, lizmap3Center.lat]);
    }
}
