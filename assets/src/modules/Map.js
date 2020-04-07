import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';

export default class Map {

    constructor() {
        // Listen to old events to dispatch new ones
        mainLizmap.lizmap3.map.events.on({
            moveend: function () {
                mainEventDispatcher.dispatch('map.moveend');
            }
        });
    }
}
