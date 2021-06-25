import Map from './Map.js';
import Edition from './Edition.js';
import Geolocation from './Geolocation.js';
import GeolocationSurvey from './GeolocationSurvey.js';
import SelectionTool from './SelectionTool.js';
import Digitizing from './Digitizing.js';
import Snapping from './Snapping.js';
import Draw from './interaction/Draw.js';
import Layers from './Layers.js';

import { get as getProjection } from 'ol/proj';
import { register } from 'ol/proj/proj4';

import proj4 from 'proj4';

export default class Lizmap {

    constructor() {
        lizMap.events.on({
            uicreated: () => {
                this._lizmap3 = lizMap;

                // Register projections if unknown
                if (!getProjection(this.projection)) {
                    const proj = this.config.options.projection;
                    proj4.defs(proj.ref, proj.proj4);
                }

                if (!getProjection(this.config.options.qgisProjectProjection.ref)) {
                    const proj = this.config.options.qgisProjectProjection;
                    proj4.defs(proj.ref, proj.proj4);
                }
                register(proj4);

                // Override getPointResolution method to always return resolution
                // without taking care of geodesic adjustment as it can be confusing for user to not have rounded scales
                (getProjection(this.projection)).setGetPointResolution((resolution) => resolution);
                (getProjection(this.config.options.qgisProjectProjection.ref)).setGetPointResolution((resolution) => resolution);

                // Create Lizmap modules
                this.map = new Map();
                this.edition = new Edition();
                this.geolocation = new Geolocation();
                this.geolocationSurvey = new GeolocationSurvey();
                this.selectionTool = new SelectionTool();
                this.digitizing = new Digitizing();
                this.snapping = new Snapping();
                this.draw = new Draw();
                this.layers = new Layers();
            }
        });
    }

    /**
     * @param {Boolean} mode - switch new OL map on top of OL2 one
     */
    set newOlMap(mode){
        this.map._newOlMap = mode;
        document.getElementById('newOlMap').style.zIndex = mode ? 750 : 'auto';
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

    get qgisProjectProjection(){
        return this.config.options.qgisProjectProjection.ref;
    }

    get vectorLayerFeatureTypes() {
        return this._lizmap3.getVectorLayerFeatureTypes();
    }

    get vectorLayerResultFormat() {
        return this._lizmap3.getVectorLayerResultFormat();
    }

    get serviceURL() {
        return lizUrls.wms + '?' + (new URLSearchParams(lizUrls.params).toString());
    }

    get hasOverview() {
        return this._lizmap3.config.layers.hasOwnProperty('Overview');
    }

    /**
     * @param {Array} lonlat - lonlat to center to.
     */
    set center(lonlat) {
        this._lizmap3.map.setCenter(lonlat);
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

    getLayerNameByCleanName(cleanName) {
        return this._lizmap3.getLayerNameByCleanName(cleanName);
    }

    // Display message on screen for users
    displayMessage(message, type, close) {
        this._lizmap3.addMessage(message, type, close);
    }
}
