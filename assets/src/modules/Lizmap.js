import Geolocation from '../modules/Geolocation.js';
import { mainEventDispatcher } from '../modules/Globals.js';

export default class Lizmap {

    constructor() {

        this.geolocation = new Geolocation();
        this.lizmapEditionDrawFeatureActivated = false;

        lizMap.events.on({
            uicreated: () => {
                this._lizmap3 = lizMap;
            },
            lizmapeditiondrawfeatureactivated: () => {
                this.lizmapEditionDrawFeatureActivated = true;
                mainEventDispatcher.dispatch('lizmapEditionDrawFeatureChanged');
            },
            lizmapeditiondrawfeaturedeactivated: () => {
                this.lizmapEditionDrawFeatureActivated = false;
                mainEventDispatcher.dispatch('lizmapEditionDrawFeatureChanged');
            }
        });
    }

    get hasEditionLayers(){
        return 'editionLayers' in this._lizmap3.config;
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
