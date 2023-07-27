import {Config} from './Config.js';
import {State} from './State.js';
import Map from './Map.js';
import BaseLayersMap from './BaseLayersMap.js';
import Edition from './Edition.js';
import Geolocation from './Geolocation.js';
import GeolocationSurvey from './GeolocationSurvey.js';
import SelectionTool from './SelectionTool.js';
import Digitizing from './Digitizing.js';
import Snapping from './Snapping.js';
import Draw from './interaction/Draw.js';
import Layers from './Layers.js';
import WFS from './WFS.js';
import WMS from './WMS.js';
import Utils from './Utils.js';
import Action from './Action.js';
import FeatureStorage from './FeatureStorage.js';
import Popup from './Popup.js';
import Legend from './Legend.js';

import WMSCapabilities from 'ol/format/WMSCapabilities.js';
import { transform as transformOL, transformExtent as transformExtentOL, get as getProjection } from 'ol/proj.js';
import { register } from 'ol/proj/proj4.js';

import proj4 from 'proj4';
import ProxyEvents from './ProxyEvents.js';

export default class Lizmap {

    constructor() {
        lizMap.events.on({
            configsloaded: (configs) => {
                const wmsParser = new WMSCapabilities();
                const wmsCapabilities = wmsParser.read(configs.wmsCapabilities);
                // The initialConfig has been cloned because it will be freezed
                this._initialConfig = new Config(structuredClone(configs.initialConfig), wmsCapabilities);
                this._state = new State(this._initialConfig);
            },
            uicreated: () => {
                this._lizmap3 = lizMap;

                // Register projections if unknown
                for (const [ref, def] of Object.entries(lizProj4)) {
                    if (ref !== "" && !getProjection(ref)) {
                        proj4.defs(ref, def);
                    }
                }

                register(proj4);

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
                this.baseLayersMap = new BaseLayersMap();
                this.edition = new Edition();
                this.geolocation = new Geolocation();
                this.geolocationSurvey = new GeolocationSurvey();
                this.selectionTool = new SelectionTool();
                this.digitizing = new Digitizing();
                this.snapping = new Snapping();
                this.draw = new Draw();
                this.layers = new Layers();
                this.proxyEvents = new ProxyEvents();
                this.wfs = new WFS();
                this.wms = new WMS();
                this.utils = Utils;
                this.action = new Action();
                this.featureStorage = new FeatureStorage();
                this.popup = new Popup();
                this.legend = new Legend();
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

    /**
     * The lizmap initial config instance
     * It is based on the freezed config
     *
     * @type {Config}
     **/
    get initialConfig() {
        return this._initialConfig;
    }

    /**
     * The lizmap user interface state
     *
     * @type {Config}
     **/
    get state() {
        return this._state;
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

    get mediaURL() {
        return lizUrls.media + '?' + (new URLSearchParams(lizUrls.params).toString());
    }

    get center() {
        const center = this._lizmap3.map.getCenter();
        return [center.lon, center.lat];
    }

    /**
     * @param {Array} lonlat - lonlat to center to.
     */
    set center(lonlat) {
        this.map.getView().setCenter(lonlat);
    }

    /**
     * @param {Array} bounds - Left, bottom, right, top
     */
    set extent(bounds) {
        this.map.getView().fit(bounds);
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

    /**
     * Expose OpenLayers transform method for external JS.
     * Transforms a coordinate from source projection to destination projection.
     * This returns a new coordinate (and does not modify the original).
     *
     * See {@link module:ol/proj.transformExtent} for extent transformation.
     * See the transform method of {@link module:ol/geom/Geometry~Geometry} and its
     * subclasses for geometry transforms.
     *
     * @param {import("./coordinate.js").Coordinate} coordinate Coordinate.
     * @param {ProjectionLike} source Source projection-like.
     * @param {ProjectionLike} destination Destination projection-like.
     * @return {import("./coordinate.js").Coordinate} Coordinate.
     */
    transform(coordinate, source, destination) {
        return transformOL(coordinate, source, destination);
    }

    /**
     * Expose OpenLayers transformExtent method for external JS.
     * Transforms an extent from source projection to destination projection.  This
     * returns a new extent (and does not modify the original).
     *
     * @param {import("./extent.js").Extent} extent The extent to transform.
     * @param {ProjectionLike} source Source projection-like.
     * @param {ProjectionLike} destination Destination projection-like.
     * @return {import("./extent.js").Extent} The transformed extent.
     */
    transformExtent(extent, source, destination){
        return transformExtentOL(extent, source, destination);
    }
}
