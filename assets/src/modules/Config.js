import { ValidationError, ConversionError } from './Errors.js';

/**
 * Freeze in depth an object
 *
 * @param {Object} object - An object to deep freeze
 *
 * @returns {Object} the object deep freezed
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
 **/
function deepFreeze(object) {
    // Retrieve the property names defined on object
    const propNames = Object.getOwnPropertyNames(object);

    // Freeze properties before freezing self
    for (const name of propNames) {
        const value = object[name];

        if (value && typeof value === "object") {1
            deepFreeze(value);
        }
    }

    return Object.freeze(object);
}

/**
 * Convert a value to Number
 *
 * @param {*} val - A value to convert to number
 *
 * @returns {Number} the converting value
 *
 * @throws {ConversionError}
 **/
function convertNumber(val) {
    const value = val*1;
    if (isNaN(value)) {
        throw new ConversionError('`'+val+'` is not a number!');
    }
    return value;
}

/**
 * Convert a value to boolean
 *
 * @param {*} val - A value to convert to boolean
 *
 * @returns {Boolean} the converting value
 *
 * @throws {ConversionError}
 **/
function convertBoolean(val) {
    switch (typeof val) {
        case 'boolean':
            return val;
        case 'number': {
            if (val === 1) {
                return true;
            } else if (val === 0) {
                return false;
            }
            throw new ConversionError('`'+val+'` is not an expected boolean: 1 or 0!');
        }
        case 'string': {
            const value = val.toLowerCase();
            if (value === 'true' || value === 't'
                || value === 'yes' || value === 'y'
                || value === '1') {
                return true;
            } else if (value === 'false' || value === 'f'
                || value === 'no' || value === 'n'
                || value === '0') {
                return false;
            }
            throw new ConversionError('`'+val+'` is not an expected boolean: true, t, yes, y, 1, false, f, no, n or 0!');
        }
        default:
            throw new ConversionError('`'+val+'` is not an expected boolean!');
    }
}

/**
 *
 **/
export class Extent extends Array {

    /**
     * @param {...(number|string)} args - the 4 values describing the extent
     *
     * @throws {ValidationError} for number of args different of 4
     * @throws {ConversionError} for values not number
     **/
    constructor(...args) {
        if (args.length < 4) {
            throw new ValidationError('Not enough arguments for Extent constructor!');
        } else if (args.length > 4) {
            throw new ValidationError('Too many arguments for Extent constructor!');
        }
        let values = [];
        for (const val of args) {
            values.push(convertNumber(val));
        }
        super(...values);
    }

    /**
     * @type {Number}
     **/
    get xmin() {
        return this[0];
    }

    /**
     * @type {Number}
     **/
    get ymin() {
        return this[1];
    }

    /**
     * @type {Number}
     **/
    get xmax() {
        return this[2];
    }

    /**
     * @type {Number}
     **/
    get ymax() {
        return this[3];
    }
}

export class Metadata {

    /**
     * @param {Object} cfg - the lizmap config object
     */
    constructor(cfg) {
        this._lizmap_plugin_version_str = "3.1.8";
        this._lizmap_plugin_version = 30108;
        this._lizmap_web_client_target_version = 30200;
        this._project_valid = null;
        this._qgis_desktop_version = 30000;

        if (!cfg || typeof cfg !== "object") {
            return this;
        }

        if (Object.getOwnPropertyNames(cfg).length == 0) {
            return this;
        }

        const metadataProperties = [
            'lizmap_plugin_version_str',
            'lizmap_plugin_version',
            'lizmap_web_client_target_version',
            'project_valid',
            'qgis_desktop_version'
        ];

        for (const prop of metadataProperties) {
            if (cfg.hasOwnProperty(prop)) {
                this['_'+prop] = cfg[prop];
            }
        }
    }

    get lizmap_plugin_version_str() {
        return this._lizmap_plugin_version_str;
    }

    get lizmap_plugin_version() {
        return this._lizmap_plugin_version;
    }

    get lizmap_web_client_target_version() {
        return this._lizmap_web_client_target_version;
    }

    get project_valid() {
        return this._project_valid;
    }

    get qgis_desktop_version() {
        return this._qgis_desktop_version;
    }
}


const optionsRequiredProperties = {
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
const optionsOtherProperties = {
    'wmsMaxHeight': {type: 'number', default: 3000},
    'wmsMaxWidth': {type: 'number', default: 3000},
    'fixed_scale_overview_map': {type: 'boolean', default: true},
}

export class Options {

    /**
     * @param {Object} cfg - the lizmap config object
     */
    constructor(cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The `options` in the config is not an Object!');
        }

        if (Object.getOwnPropertyNames(cfg).length == 0) {
            throw new ValidationError('The `options` in the config is empty!');
        }

        for (const prop in optionsRequiredProperties) {
            if (!cfg.hasOwnProperty(prop)) {
                throw new ValidationError('No `' + prop + '` in `options` in the config!');
            }
            const def = optionsRequiredProperties[prop];
            switch (def.type){
                case 'boolean':
                    this['_'+prop] = convertBoolean(cfg[prop]);
                    break;
                case 'number':
                    this['_'+prop] = convertNumber(cfg[prop]);
                    break;
                case 'extent':
                    this['_'+prop] = new Extent(...cfg[prop]);
                    break;
                default:
                    this['_'+prop] = cfg[prop];
            }
        }

        for (const prop in optionsOtherProperties) {
            const def = optionsOtherProperties[prop];
            if (cfg.hasOwnProperty(prop)) {
                switch (def.type){
                    case 'boolean':
                        this['_'+prop] = convertBoolean(cfg[prop]);
                        break;
                    case 'number':
                        this['_'+prop] = convertNumber(cfg[prop]);
                        break;
                    default:
                        this['_'+prop] = cfg[prop];
                }
            } else if (def.hasOwnProperty('default')) {
                this['_'+prop] = def.default;
            }
        }
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
     * @type {Array}
     **/
    get bbox() {
        return this._bbox;
    }

    /**
     * The map extent at the loading page
     *
     * @type {Array}
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

export class Config {

    /**
     * @param {Object} cfg - the lizmap config object
     */
    constructor(cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The config is not an Object!');
        }

        if (Object.getOwnPropertyNames(cfg).length == 0) {
            throw new ValidationError('The config is empty!');
        }

        this._theConfig = null;
        this._hasMetadata = true;
        this._metadata = null;
        this._hasLocateByLayer = true;
        this._hasAttributeLayers = true;
        this._hasTimemanagerLayers = true;
        this._hasRelations = true;
        this._hasPrintTemplates = true;
        this._hasTooltipLayers = true;
        this._hasFormFilterLayers = true;
        this._hasLoginFilteredLayers = true;
        this._hasDatavizConfig = true;

        const theConfig = deepFreeze(cfg);

        // checking config
        const mandatoryConfigProperties = [
            'options',
            'layers',
            'datavizLayers' // needed for locale property to build plot
        ];
        for (const prop of mandatoryConfigProperties) {
            if (!theConfig.hasOwnProperty(prop)) {
                throw new ValidationError('No `' + prop + '` in the config!');
            }
        }

        for (const prop in optionsRequiredProperties) {
            if (!theConfig.options.hasOwnProperty(prop)) {
                throw new ValidationError('No `' + prop + '` in `options` in the config!');
            }
        }

        this._theConfig = theConfig;

        const optionalConfigProperties = [
            'metadata',
            'locateByLayer',
            'attributeLayers',
            'timemanagerLayers',
            'relations',
            'printTemplates',
            'tooltipLayers',
            'formFilterLayers',
            'loginFilteredLayers'
        ];
        for (const prop of optionalConfigProperties) {
            if (!theConfig.hasOwnProperty(prop)
                || Object.getOwnPropertyNames(theConfig[prop]).length == 0) {
                this['_has'+prop.charAt(0).toUpperCase() + prop.slice(1)] = false;
            }
        }

        // check datavizConfig
        if ((!theConfig.datavizLayers.hasOwnProperty('layers')
            || Object.getOwnPropertyNames(theConfig.datavizLayers.layers).length == 0)
            && (!theConfig.datavizLayers.hasOwnProperty('dataviz')
            || Object.getOwnPropertyNames(theConfig.datavizLayers.dataviz).length == 0)) {
            this._hasDatavizConfig = false;
        }
    }

    /**
     * Config metadata
     *
     * @type {Metadata}
     **/
    get metadata() {
        if (this._metadata != null) {
            return this._metadata;
        }
        if (this._hasMetadata) {
            this._metadata = new Metadata(this._theConfig.metadata);
        } else {
            this._metadata = new Metadata();
        }
        return this._metadata;
    }

    /**
     * Locate by layer config is defined
     *
     * @type {Boolean}
     **/
    get hasLocateByLayer() {
        return this._hasLocateByLayer;
    }

    /**
     * Attribute layers config is defined
     *
     * @type {Boolean}
     **/
    get hasAttributeLayers() {
        return this._hasAttributeLayers;
    }

    /**
     * Time manager config is defined
     *
     * @type {Boolean}
     **/
    get hasTimemanagerLayers() {
        return this._hasTimemanagerLayers;
    }

    /**
     * Relations config is defined
     *
     * @type {Boolean}
     **/
    get hasRelations() {
        return this._hasRelations;
    }

    /**
     * Print templates config is defined
     *
     * @type {Boolean}
     **/
    get hasPrintTemplates() {
        return this._hasPrintTemplates;
    }

    /**
     * Tooltip layers config is defined
     *
     * @type {Boolean}
     **/
    get hasTooltipLayers() {
        return this._hasTooltipLayers;
    }

    /**
     * Form filter layers config is defined
     *
     * @type {Boolean}
     **/
    get hasFormFilterLayers() {
        return this._hasFormFilterLayers;
    }

    /**
     * Login filtered layers config is defined
     *
     * @type {Boolean}
     **/
    get hasLoginFilteredLayers() {
        return this._hasLoginFilteredLayers;
    }

    /**
     * Dataviz config is defined
     *
     * @type {Boolean}
     **/
    get hasDatavizConfig() {
        return this._hasDatavizConfig;
    }

    /**
     * Dataviz locale
     *
     * @type {String}
     **/
    get datavizLocale() {
        return this._theConfig.datavizLayers.locale;
    }
}
