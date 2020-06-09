import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import olMap from 'ol/Map';
import View from 'ol/View';

/** Class initializing Openlayers Map. */
export default class Map {

    constructor() {
        this._olMap = new olMap({
            view: new View({
                center: [0, 0],
                zoom: 2,
                projection: mainLizmap.projection,
                constrainResolution: true
            }),
            target: 'newOlMap'
        });

        // Init view
        this.syncViews();

        // Listen to old map events to dispatch new ones
        mainLizmap.lizmap3.map.events.on({
            moveend: () => {
                this.syncViews();

                mainEventDispatcher.dispatch('map.moveend');
            },
            zoomend: () => {
                this.syncViews();

                mainEventDispatcher.dispatch('map.zoomend');
            }
        });
    }

    /**
     * Synchronize new OL view with old one
     * @memberof Map
     */
    syncViews(){
        this._olMap.getView().setResolution(mainLizmap.lizmap3.map.getResolution());

        const lizmap3Center = mainLizmap.lizmap3.map.getCenter();
        this._olMap.getView().setCenter([lizmap3Center.lon, lizmap3Center.lat]);
    }
}
