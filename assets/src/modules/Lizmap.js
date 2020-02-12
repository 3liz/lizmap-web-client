import Edition from '../modules/Edition.js';
import Geolocation from '../modules/Geolocation.js';
import GeolocationSurvey from '../modules/GeolocationSurvey.js';

export default class Lizmap {

    constructor() {
        lizMap.events.on({
            uicreated: () => {
                this._lizmap3 = lizMap;
                this.edition = new Edition();
                this.geolocation = new Geolocation();
                this.geolocationSurvey = new GeolocationSurvey();
            }
        });
    }

    get lizmap3() {
        return this._lizmap3;
    }

    get projection() {
        return this._lizmap3.map.getProjection();
    }

    /**
     * @param {Array} coordinates - Point coordinates to center to.
     */
    set center(coordinates) {
        this._lizmap3.map.setCenter(coordinates);
    }

    /**
     * @param {Array} bounds - Left, bottom, right, top
     */
    set extent(bounds) {
        this._lizmap3.map.zoomToExtent(bounds);
    }

    // Display message on screen for users
    displayMessage(message, type, close) {
        this._lizmap3.addMessage(message, type, close);
    }
}
