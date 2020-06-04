import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import olMap from 'ol/Map';
import View from 'ol/View';

export default class Map {

    constructor() {
        this._olMap = new olMap({
            view: new View({
                center: [0, 0],
                zoom: 2
            }),
            target: 'newOlMap'
        });

        // TODO : init when extent change
        this._olMap.getView().fit(mainLizmap.config.options.initialExtent);

        // Listen to old events to dispatch new ones
        mainLizmap.lizmap3.map.events.on({
            moveend: () => {
                this._olMap.getView().fit(mainLizmap.lizmap3.map.getExtent().toArray());

                mainEventDispatcher.dispatch('map.moveend');
            }
        });
    }
}
