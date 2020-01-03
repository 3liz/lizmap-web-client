import Geolocation from '../modules/Geolocation.js';

export default class Lizmap {

    constructor() {

        lizMap.events.on({
            uicreated: () => {
                this._lizmap3 = lizMap;
            }
        });

        this.geolocation = new Geolocation();
    }

    get projection(){
        return this._lizmap3.map.getProjection();
    }

    /**
     * @param {Array} coordinates
     */
    set center(coordinates){
        this._lizmap3.map.setCenter(coordinates);
    }

    /**
     * @param {Array} coordinates
     */
    set extent(coordinates) {
        this._lizmap3.map.zoomToExtent(coordinates);
    }
}
