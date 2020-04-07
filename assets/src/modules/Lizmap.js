import Map from '../modules/Map.js';
import Edition from '../modules/Edition.js';
import Geolocation from '../modules/Geolocation.js';
import GeolocationSurvey from '../modules/GeolocationSurvey.js';
import SelectionTool from '../modules/SelectionTool.js';
import Snapping from '../modules/Snapping.js';

export default class Lizmap {

    constructor() {
        lizMap.events.on({
            uicreated: () => {
                this._lizmap3 = lizMap;
                this.map = new Map();
                this.edition = new Edition();
                this.geolocation = new Geolocation();
                this.geolocationSurvey = new GeolocationSurvey();
                this.selectionTool = new SelectionTool();
                this.snapping = new Snapping();
            }
        });
    }

    get lizmap3() {
        return this._lizmap3;
    }

    get config() {
        return this._lizmap3.config;
    }

    get projection() {
        return this._lizmap3.map.getProjection();
    }

    get vectorLayerFeatureTypes() {
        return this._lizmap3.getVectorLayerFeatureTypes();
    }

    get vectorLayerResultFormat() {
        return this._lizmap3.getVectorLayerResultFormat().toArray();
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

    getNameByTypeName(typeName) {
        return this._lizmap3.getNameByTypeName(typeName);
    }

    // Display message on screen for users
    displayMessage(message, type, close) {
        this._lizmap3.addMessage(message, type, close);
    }
}
