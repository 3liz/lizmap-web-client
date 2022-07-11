import { BaseObjectConfig } from './Base.js';
//import { Extent } from './Tools.mjs';
import { ValidationError } from './../Errors.js';

const requiredProperties = {
    'hideProject': {type: 'boolean'},
    'bbox': {type: 'extent'},
    'initialExtent': {type: 'extent'},
    'mapScales': {type: 'array'},
    'minScale': {type: 'number'},
    'maxScale': {type: 'number'},
    'projection': {type: 'object'},
    'pointTolerance': {type: 'number'},
    'lineTolerance': {type: 'number'},
    'polygonTolerance': {type: 'number'},
    'popupLocation': {type: 'string'},
    'datavizLocation': {type: 'string'}
};

const optionalProperties = {
    'wmsMaxHeight': {type: 'number', default: 3000},
    'wmsMaxWidth': {type: 'number', default: 3000},
    'fixed_scale_overview_map': {type: 'boolean', default: true},
};

export class OptionsConfig  extends BaseObjectConfig {

    /**
     * @param {Object} cfg - the lizmap config object for options
     */
    constructor(cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The `options` in the config is not an Object!');
        }

        if (Object.getOwnPropertyNames(cfg).length == 0) {
            throw new ValidationError('The `options` in the config is empty!');
        }

        super(cfg, requiredProperties, optionalProperties)
    }

    /**
     * The project is hidden in user interface
     * Services are still available
     *
     * @type {Boolean}
     **/
    get hideProject() {
        return this._hideProject;
    }

    /**
     * The project and web services max extent
     *
     * @type {Extent}
     **/
    get bbox() {
        return this._bbox;
    }

    /**
     * The map extent at the loading page
     *
     * @type {Extent}
     **/
    get initialExtent() {
        return this._initialExtent;
    }

    /**
     * The web map scales
     *
     * @type {Array}
     **/
    get mapScales() {
        return this._mapScales;
    }

    /**
     * The web map min scale
     *
     * @type {Number}
     **/
    get minScale() {
        return this._minScale;
    }

    /**
     * The web map max scale
     *
     * @type {Number}
     **/
    get maxScale() {
        return this._maxScale;
    }

    /**
     * The web map projection
     *
     * @type {Object}
     **/
    get projection() {
        return this._projection;
    }

    /**
     * The QGIS Server point tolerance for
     * WMS GetFeatureInfo request
     *
     * @type {Number}
     **/
    get pointTolerance() {
        return this._pointTolerance;
    }

    /**
     * The QGIS Server line tolerance for
     * WMS GetFeatureInfo request
     *
     * @type {Number}
     **/
    get lineTolerance() {
        return this._lineTolerance;
    }

    /**
     * The QGIS Server polygon tolerance for
     * WMS GetFeatureInfo request
     *
     * @type {Number}
     **/
    get polygonTolerance() {
        return this._polygonTolerance;
    }

    /**
     * The popup location in the User interface
     * dock, bottom-dock, right-dock, mini-dock, map
     *
     * @type {String}
     **/
    get popupLocation() {
        return this._popupLocation;
    }

    /**
     * The popup location in the User interface
     * dock, bottom-dock, right-dock
     *
     * @type {String}
     **/
    get datavizLocation() {
        return this._datavizLocation;
    }

    /**
     * The image max height for WMS GetMap request
     *
     * @type {Number}
     **/
    get wmsMaxHeight() {
        return this._wmsMaxHeight;
    }

    /**
     * The image max width for WMS GetMap request
     *
     * @type {Number}
     **/
    get wmsMaxWidth() {
        return this._wmsMaxWidth;
    }

    /**
     * The Overview map has fixed scale
     *
     * @type {Boolean}
     **/
    get fixed_scale_overview_map() {
        return this._fixed_scale_overview_map;
    }
}
