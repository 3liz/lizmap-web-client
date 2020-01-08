import { mainEventDispatcher } from '../modules/Globals.js';
import Geolocation from '../modules/Geolocation.js';

export default class Lizmap {

    constructor() {
        lizMap.events.on({
            uicreated: () => {
                this._lizmap3 = lizMap;
                this.geolocation = new Geolocation();
                this.lizmapEditionDrawFeatureActivated = false;
                this.lizmapEditionLayerGeometry = "";
            },
            lizmapeditiondrawfeatureactivated: (properties) => {
                this.lizmapEditionDrawFeatureActivated = true;
                this.lizmapEditionLayerGeometry = properties.editionConfig.geometryType;
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
