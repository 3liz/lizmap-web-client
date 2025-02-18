/**
 * @module modules/Lizmap.js
 * @name Lizmap
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */
import {Config} from './Config.js';
import {State} from './State.js';
import map from './map.js';
import Edition from './Edition.js';
import FeaturesTable from './FeaturesTable.js';
import Geolocation from './Geolocation.js';
import GeolocationSurvey from './GeolocationSurvey.js';
import SelectionTool from './SelectionTool.js';
import { Digitizing } from './Digitizing.js';
import Snapping from './Snapping.js';
import Layers from './Layers.js';
import WFS from './WFS.js';
import WMS from './WMS.js';
import { Utils } from './Utils.js';
import Action from './Action.js';
import FeatureStorage from './FeatureStorage.js';
import Popup from './Popup.js';
import Legend from './Legend.js';
import Permalink from './Permalink.js';
import Search from './Search.js';
import Tooltip from './Tooltip.js';
import LocateByLayer from './LocateByLayer.js';

import WMSCapabilities from 'ol/format/WMSCapabilities.js';
import WFSCapabilities from 'ol-wfs-capabilities';
import { Coordinate as olCoordinate } from 'ol/coordinate.js'
import { Extent as olExtent, intersects as olExtentIntersects} from 'ol/extent.js';
import { transform as olTransform, transformExtent as olTransformExtent, get as getProjection, clearAllProjections, addCommon } from 'ol/proj.js';
import { register } from 'ol/proj/proj4.js';

import proj4 from 'proj4';
import ProxyEvents from './ProxyEvents.js';

/**
 * A projection as Projection, SRS identifier string or undefined.
 * @typedef {import("ol/proj/Projection").default | string | undefined} ProjectionLike
 */

/**
 * The main Lizmap definition
 * @class
 * @name Lizmap
 */
export default class Lizmap {

    constructor() {
        lizMap.events.on({
            configsloaded: (configs) => {
                const wmsParser = new WMSCapabilities();
                const wmsCapabilities = wmsParser.read(configs.wmsCapabilities);
                const wfsParser = new WFSCapabilities();
                const wfsCapabilities = wfsParser.read(configs.wfsCapabilities);
                // The initialConfig has been cloned because it will be freezed
                this._initialConfig = new Config(structuredClone(configs.initialConfig), wmsCapabilities, wfsCapabilities);
                this._state = new State(this._initialConfig, configs.startupFeatures);
                this._utils = Utils;

                // Register projections if unknown
                for (const [ref, def] of Object.entries(globalThis['lizProj4'])) {
                    if (ref !== "" && !proj4.defs(ref)) {
                        proj4.defs(ref, def);
                    }
                }
                // Register project projection if unknown
                const configProj = this._initialConfig.options.projection;
                if (configProj.ref !== "" && !proj4.defs(configProj.ref)) {
                    proj4.defs(configProj.ref, configProj.proj4);
                }
                // About axis orientation https://proj.org/en/9.3/usage/projections.html#axis-orientation
                // Add CRS:84 projection, same as EPSG:4326 but with ENU axis orientation
                proj4.defs("CRS:84","+proj=longlat +datum=WGS84 +no_defs +type=crs");
                register(proj4);
                // Update project projection if its axis orientation is not ENU
                if (configProj.ref !== "") {
                    // loop through bounding boxes of the project provided by WMS capabilities
                    for (const bbox of wmsCapabilities.Capability.Layer.BoundingBox) {
                        // If the BBOX CRS is not the same of the project projection, continue.
                        if (bbox.crs !== configProj.ref) {
                            continue;
                        }
                        // Get project projection
                        const projectProj = getProjection(configProj.ref);
                        // Check axis orientation, if it is not ENU, break, we don't have to do anything
                        if (projectProj.getAxisOrientation() !== 'enu') {
                            break;
                        }
                        // Transform geographic extent to project projection
                        const extent = olTransformExtent(wmsCapabilities.Capability.Layer.EX_GeographicBoundingBox, 'CRS:84', bbox.crs);
                        // Check closest coordinates
                        if (Math.abs(extent[0] - bbox.extent[1]) < Math.abs(extent[0] - bbox.extent[0])
                            && Math.abs(extent[1] - bbox.extent[0]) < Math.abs(extent[1] - bbox.extent[1])
                            && Math.abs(extent[2] - bbox.extent[3]) < Math.abs(extent[2] - bbox.extent[2])
                            && Math.abs(extent[3] - bbox.extent[2]) < Math.abs(extent[3] - bbox.extent[3])) {
                            // If inverted axis are closest, we have to update the projection definition
                            proj4.defs(configProj.ref, configProj.proj4+' +axis=neu');
                            // Clear all cached projections and transforms.
                            clearAllProjections();
                            // Add transforms to and from EPSG:4326 and EPSG:3857.  This function should
                            // need to be called again after `clearAllProjections()`
                            // @see ol/proj.js#L731
                            addCommon();
                            // Need to register projections again
                            register(proj4);
                            break;
                        }
                        // Transform extent from project projection to CRS:84
                        const geoExtent = olTransformExtent(bbox.extent, bbox.crs, 'CRS:84');
                        // Check intersects between transform extent and provided extent by WMS Capapbilities
                        if (!olExtentIntersects(geoExtent, wmsCapabilities.Capability.Layer.EX_GeographicBoundingBox)) {
                            // if extents do not intersect, we have to update the projection definition
                            proj4.defs(configProj.ref, configProj.proj4+' +axis=neu');
                            clearAllProjections();
                            // Add transforms to and from EPSG:4326 and EPSG:3857. This function should
                            // need to be called again after `clearAllProjections()`
                            // @see ol/proj.js#L731
                            addCommon();
                            // Need to re register projections again
                            register(proj4);
                            break;
                        }
                    }
                }
            },
            toolbarcreated: () => {
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
                this.permalink = new Permalink();
                this.map = new map('newOlMap', this.initialConfig, this.serviceURL, this.state.map, this.state.baseLayers, this.state.rootMapGroup, this.lizmap3);
                this.edition = new Edition(this._lizmap3);
                this.featuresTable = new FeaturesTable(this.initialConfig, this.lizmap3);
                this.geolocation = new Geolocation(this.map, this.lizmap3);
                this.geolocationSurvey = new GeolocationSurvey(this.geolocation, this.edition);
                this.digitizing = new Digitizing(this.map, this.lizmap3);
                this.selectionTool = new SelectionTool(this.map, this.digitizing, this.initialConfig, this.lizmap3);
                this.snapping = new Snapping(this.edition, this.state.rootMapGroup, this.state.layerTree, this.lizmap3);
                this.layers = new Layers();
                this.proxyEvents = new ProxyEvents();
                this.wfs = new WFS();
                this.wms = new WMS();
                this.action = new Action(this.map, this.selectionTool, this.digitizing, this.lizmap3);
                this.featureStorage = new FeatureStorage();
                this.popup = new Popup(this.initialConfig, this.state, this.map, this.digitizing);
                this.legend = new Legend(this.state.layerTree);
                this.search = new Search(this.map, this.lizmap3);
                this.tooltip = new Tooltip(this.map, this.initialConfig.tooltipLayers, this.lizmap3);
                this.locateByLayer = new LocateByLayer(
                    this.initialConfig.locateByLayer,
                    this.initialConfig.vectorLayerFeatureTypeList,
                    this.map,
                    this._lizmap3
                );

                // Removed unusable button
                if (!this.config['printTemplates'] || this.config.printTemplates.length == 0 ) {
                    $('#button-print').parent().remove();
                }
            }
        });
    }

    /**
     * Is new OL map on top of OL2 one?
     * @type {boolean}
     */
    get newOlMap() {
        return this.map._newOlMap;
    }

    /**
     * Setting if the new OL map is on top of OL2 one
     * @param {boolean} mode - switch new OL map on top of OL2 one
     */
    set newOlMap(mode){
        this.map._newOlMap = mode;
        document.getElementById('newOlMap').style.zIndex = mode ? 750 : 'unset';

        if (!mode) {
            this.updateOL2MapSize();
            this.map.refreshOL2View();
            this.map.getView().setRotation(0);
            window.addEventListener('resize', this.updateOL2MapSize);
        } else {
            window.removeEventListener('resize', this.updateOL2MapSize);
        }
    }

    /**
     * The old lizmap object
     * @type {object}
     */
    get lizmap3() {
        return this._lizmap3;
    }

    /**
     * The lizmap initial config instance
     * It is based on the freezed config
     * @type {Config}
     */
    get initialConfig() {
        return this._initialConfig;
    }

    /**
     * The lizmap user interface state
     * @type {State}
     */
    get state() {
        return this._state;
    }

    /**
     * The Utils class
     * @type {Utils}
     */
    get utils() {
        return this._utils;
    }

    /**
     * The old lizmap config object
     * @type {object}
     */
    get config() {
        return this._lizmap3.config;
    }

    /**
     * The lizmap map OL2 projection
     * @type {object}
     */
    get projection() {
        return this._lizmap3.map.getProjection();
    }

    /**
     * The QGIS Project crs authentification id
     * @type {string}
     */
    get qgisProjectProjection(){
        return this.config.options.qgisProjectProjection.ref;
    }

    /**
     * The list of XML FeatureType Elements
     * @type {Array}
     * @deprecated Use initialConfig.vectorLayerFeatureTypeList
     */
    get vectorLayerFeatureTypes() {
        return this._lizmap3.getVectorLayerFeatureTypes();
    }

    /**
     * The list of format for file export
     * @type {string[]}
     */
    get vectorLayerResultFormat() {
        return this._initialConfig.vectorLayerResultFormat;
    }

    /**
     * The Lizmap service URL
     * @type {string}
     */
    get serviceURL() {
        return globalThis['lizUrls'].wms + '?' + (new URLSearchParams(globalThis['lizUrls'].params).toString());
    }

    /**
     * The Lizmap media URL
     * @type {string}
     */
    get mediaURL() {
        return globalThis['lizUrls'].media + '?' + (new URLSearchParams(globalThis['lizUrls'].params).toString());
    }

    /**
     * The map center
     * @type {number[]}
     */
    get center() {
        return this.state.map.center;
    }

    /**
     * Setting the map center
     * @param {number[]} center - The center of the view.
     */
    set center(center) {
        this.map.getView().setCenter(center);
    }

    /**
     * The view extent - an array with left, bottom, right, top
     * @type {number[]}
     */
    get extent() {
        return this.map.getView().calculateExtent();
    }

    /**
     * Setting the view extent
     * @param {Array<number>} bounds - Left, bottom, right, top
     */
    set extent(bounds) {
        this.map.getView().fit(bounds, {nearest: true});
    }

    updateOL2MapSize() {
        lizMap.map.updateSize();
    }

    /**
     * Getting the layer name from the WFS typeName
     * @param {string} typeName - the WFS typeName
     * @returns {string} the layer name corresponding to the WFS typeName
     */
    getNameByTypeName(typeName) {
        return this._lizmap3.getNameByTypeName(typeName);
    }

    /**
     * Getting the layer name from the Lizmap cleanName
     * @param {string} cleanName - the Lizmap cleanName
     * @returns {string} the layer name corresponding to the Lizmap cleanName
     */
    getLayerNameByCleanName(cleanName) {
        return this._lizmap3.getLayerNameByCleanName(cleanName);
    }

    /**
     * Display message on screen for users
     * @param {string}  message - the message to display to the user
     * @param {string}  type    - the message type: 'info', 'error' or 'success'; default 'info'
     * @param {boolean} close   - add a close button; default false
     * @param {number}  delay   - The time, in milliseconds that the message will stay on the screen
     */
    displayMessage(message, type, close, delay) {
        this._lizmap3.addMessage(message, type, close, delay);
    }

    /**
     * Expose OpenLayers transform method for external JS.
     * Transforms a coordinate from source projection to destination projection.
     * This returns a new coordinate (and does not modify the original).
     *
     * See {@link module:ol/proj.transformExtent} for extent transformation.
     * See the transform method of {@link module:ol/geom/Geometry~Geometry} and its
     * subclasses for geometry transforms.
     * @param {olCoordinate} coordinate    - Coordinate.
     * @param {ProjectionLike} source      - Source projection-like.
     * @param {ProjectionLike} destination - Destination projection-like.
     * @returns {olCoordinate} Coordinate.
     */
    transform(coordinate, source, destination) {
        return olTransform(coordinate, source, destination);
    }

    /**
     * Expose OpenLayers transformExtent method for external JS.
     * Transforms an extent from source projection to destination projection.  This
     * returns a new extent (and does not modify the original).
     * @param {olExtent}       extent      - The extent to transform.
     * @param {ProjectionLike} source      - Source projection-like.
     * @param {ProjectionLike} destination - Destination projection-like.
     * @returns {olExtent} The transformed extent.
     */
    transformExtent(extent, source, destination){
        return olTransformExtent(extent, source, destination);
    }
}
