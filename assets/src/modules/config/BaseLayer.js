
import { ValidationError } from './../Errors.js';
import { BaseObjectConfig } from './BaseObject.js';
import { convertBoolean } from './Tools.js';
import { AttributionConfig } from './Attribution.js';
import { LayerConfig, LayersConfig } from './Layer.js';

/**
 * Class representing a base layer config
 * @class
 * @augments BaseObjectConfig
 */
export class BaseLayerConfig extends BaseObjectConfig {
    /**
     * Create a base layer config based on a config object
     * @param {String}      type                                                           - the base layer type
     * @param {String}      name                                                           - the base layer name
     * @param {Object}      cfg                                                            - the base layer lizmap config object
     * @param {String}      cfg.title                                                      - the base layer title
     * @param {LayerConfig} [cfg.layerConfig]                                              - the base layer Lizmap layer config
     * @param {String}      [cfg.key]                                                      - the base layer key
     * @param {Object}      [cfg.attribution]                                              - the base layer attribution config object
     * @param {Object}      [requiredProperties={'title': {type: 'string'}}]               - the required properties definition
     * @param {Object}      [optionalProperties={'key': {type: 'string', nullable: true}}] - the optional properties definition
     */
    constructor(type, name, cfg, requiredProperties = { 'title': { type: 'string' } }, optionalProperties = { 'key': { type: 'string', nullable: true } }) {

        if (!requiredProperties.hasOwnProperty('title')) {
            requiredProperties['title'] = { type: 'string' };
        }

        if (!optionalProperties.hasOwnProperty('key')) {
            optionalProperties['key'] = { type: 'string', nullable: true };
        }

        super(cfg, requiredProperties, optionalProperties);

        this._name = name;

        this._type = type;

        this._hasLayerConfig = false;
        this._layerConfig = null;
        if (cfg.hasOwnProperty('layerConfig')
            && cfg.layerConfig instanceof LayerConfig) {
            this._layerConfig = cfg.layerConfig;
            this._hasLayerConfig = true;
        }

        this._hasAttribution = false;
        this._attribution = null;
        if (cfg.hasOwnProperty('attribution')) {
            if (cfg['attribution'] instanceof AttributionConfig) {
                this._attribution = cfg['attribution'];
                this._hasAttribution = true;
            } else if (Object.getOwnPropertyNames(cfg['attribution']).length != 0) {
                this._attribution = new AttributionConfig(cfg['attribution']);
                this._hasAttribution = true;
            }
        }
    }

    /**
     * The base layer type
     *
     * @type {String}
     **/
    get type() {
        return this._type;
    }

    /**
     * The base layer name
     *
     * @type {String}
     **/
    get name() {
        return this._name;
    }

    /**
     * The base layer title
     *
     * @type {String}
     **/
    get title() {
        return this._title;
    }

    /**
     * A Lizmap layer config is associated with this base layer
     *
     * @type {Boolean}
     **/
    get hasLayerConfig() {
        return this._hasLayerConfig;
    }
    /**
     * The Lizmap layer config associated with this base layer
     *
     * @type {?LayerConfig}
     **/
    get layerConfig() {
        return this._layerConfig;
    }

    /**
     * The base layer key is defined
     *
     * @type {boolean}
     **/
    get hasKey() {
        return (this._key != null && typeof this._key == 'string' && this._key != '');
    }

    /**
     * The base layer key
     *
     * @type {?String}
     **/
    get key() {
        if (this.hasKey)
            return this._key;
        return null;
    }

    /**
     * Attribution is defined
     *
     * @type {Boolean}
     **/
    get hasAttribution() {
        return this._hasAttribution;
    }
    /**
     * Attribution
     *
     * @type {?AttributionConfig}
     **/
    get attribution() {
        return this._attribution;
    }
}

/**
 * Class representing an empty base layer config
 * @class
 * @augments BaseLayerConfig
 */
export class EmptyBaseLayerConfig extends BaseLayerConfig {
    /**
     * Create an empty base layer config based on a config object (it can be empty)
     * @param {Object} cfg - an object for empty base layer
     */
    constructor(cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }
        const emptyCfg = {
            title: 'empty'
        };
        const emptyProperties = {
            'title': { type: 'string' }
        };
        super('empty', 'empty', emptyCfg, emptyProperties, {});
    }
}

const xyzProperties = {
    'title': { type: 'string' },
    'url': { type: 'string' },
    'crs': { type: 'string' }
}

const xyzOptionalProperties = {
    'zmin': { type: 'number', default: 0 },
    'zmax': { type: 'number', default: 20 },
    'key': { type: 'string', nullable: true }
}

/**
 * Class representing an XYZ base layer config
 * @class
 * @augments BaseLayerConfig
 */
export class XyzBaseLayerConfig extends BaseLayerConfig {
    /**
     * Create an XYZ base layer config based on a config object
     * @param {String} name              - the base layer name
     * @param {Object} cfg               - the lizmap config object for XYZ base layer
     * @param {String} cfg.title         - the base layer title
     * @param {String} cfg.url           - the base layer url
     * @param {String} cfg.crs           - the base layer crs
     * @param {Number} [cfg.zmin]        - the base layer zmin
     * @param {Number} [cfg.zmax]        - the base layer zmax
     * @param {String} [cfg.key]         - the base layer key
     * @param {Object} [cfg.attribution] - the base layer attribution config object
     */
    constructor(name, cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }

        if (Object.getOwnPropertyNames(cfg).length == 0) {
            throw new ValidationError('The `options` in the config is empty!');
        }

        super('xyz', name, cfg, xyzProperties, xyzOptionalProperties);
    }

    /**
     * The base layer url
     *
     * @type {String}
     **/
    get url() {
        return this._url;
    }

    /**
     * The base layer key is defined
     *
     * @type {boolean}
     **/
    get hasKey() {
        return (this._key != null && typeof this._key == 'string' && this._key != '');
    }

    /**
     * The base layer key
     *
     * @type {?String}
     **/
    get key() {
        if (this.hasKey)
            return this._key;
        return null;
    }

    /**
     * The base layer zmin
     *
     * @type {Number}
     **/
    get zmin() {
        return this._zmin;
    }

    /**
     * The base layer zmax
     *
     * @type {Number}
     **/
    get zmax() {
        return this._zmax;
    }

    /**
     * The base layer crs
     *
     * @type {String}
     **/
    get crs() {
        return this._crs;
    }
}

const bingProperties = {
    'title': { type: 'string' },
    'imagerySet': { type: 'string' }
}

const bingOptionalProperties = {
    'key': { type: 'string', nullable: true }
}

/**
 * Class representing a BING base layer config
 * @class
 * @augments BaseLayerConfig
 */
export class BingBaseLayerConfig extends BaseLayerConfig {
    /**
     * Create a BING base layer config based on a config object
     * @param {String} name           - the base layer name
     * @param {Object} cfg            - the lizmap config object for BING base layer
     * @param {String} cfg.title      - the base layer title
     * @param {String} cfg.imagerySet - the base layer imagerySet
     * @param {String} [cfg.key]      - the base layer key
     */
    constructor(name, cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }

        if (Object.getOwnPropertyNames(cfg).length == 0) {
            throw new ValidationError('The `options` in the config is empty!');
        }

        super('bing', name, cfg, bingProperties, bingOptionalProperties)
    }

    /**
     * The bing imagerySet
     *
     * @type {String}
     **/
    get imagerySet() {
        return this._imagerySet;
    }

}

const wmtsProperties = {
    'title': { type: 'string' },
    'url': { type: 'string' },
    'layer': { type: 'string' },
    'format': { type: 'string' },
    'style': { type: 'string' },
    'matrixSet': { type: 'string' },
    'crs': { type: 'string' }
}

const wmtsOptionalProperties = {
    'numZoomLevels': { type: 'number', default: 19 },
    'key': { type: 'string', nullable: true }
}

/**
 * Class representing a WMTS base layer config
 * @class
 * @augments BaseLayerConfig
 */
export class WmtsBaseLayerConfig extends BaseLayerConfig {
    /**
     * Create a WMTS base layer config based on a config object
     * @param {String} name                - the base layer name
     * @param {Object} cfg                 - the lizmap config object for WMTS base layer
     * @param {String} cfg.title           - the base layer title
     * @param {String} cfg.url             - the base layer url
     * @param {String} cfg.layer           - the base layer layer
     * @param {String} cfg.format          - the base layer format
     * @param {String} cfg.style           - the base layer style
     * @param {String} cfg.matrixSet       - the base layer matrixSet
     * @param {String} cfg.crs             - the base layer crs
     * @param {Number} [cfg.numZoomLevels] - the base layer numZoomLevels
     * @param {String} [cfg.key]           - the base layer key
     * @param {Object} [cfg.attribution]   - the base layer attribution config object
     */
    constructor(name, cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }

        if (Object.getOwnPropertyNames(cfg).length == 0) {
            throw new ValidationError('The `options` in the config is empty!');
        }

        super('wmts', name, cfg, wmtsProperties, wmtsOptionalProperties);
    }

    /**
     * The base layer url
     *
     * @type {String}
     **/
    get url() {
        return this._url;
    }

    /**
     * The base layer wmts layer
     *
     * @type {String}
     **/
    get layer() {
        return this._layer;
    }

    /**
     * The base layer wmts format
     *
     * @type {String}
     **/
    get format() {
        return this._format;
    }

    /**
     * The base layer wmts style
     *
     * @type {String}
     **/
    get style() {
        return this._style;
    }

    /**
     * The base layer matrixSet
     *
     * @type {String}
     **/
    get matrixSet() {
        return this._matrixSet;
    }

    /**
     * The base layer crs
     *
     * @type {String}
     **/
    get crs() {
        return this._crs;
    }

    /**
     * The base layer numZoomLevels
     *
     * @type {Number}
     **/
    get numZoomLevels() {
        return this._numZoomLevels;
    }

    /**
     * The base layer zmax
     *
     * @type {Number}
     **/
    get zmax() {
        return this._zmax;
    }
}

/**
 * The default complete lizmap config object for base layers
 * It will be used to translate lizmap options config to base layers config
 * @constant
 * @type {Object}
 * @private
 */
const defaultCompleteBaseLayersCfg = {
    "empty": {},
    "project-background-color": {},
    "osm-mapnik": {
        "type": "xyz",
        "title": "OpenStreetMap",
        "url": "http://tile.openstreetmap.org/{z}/{x}/{y}.png",
        "zmin": 0,
        "zmax": 19,
        "crs": "EPSG:3857",
        "attribution": {
            "title": "© OpenStreetMap contributors, CC-BY-SA",
            "url": "https://www.openstreetmap.org/copyright"
        }
    },
    "osm-stamen-toner": {
        "type": "xyz",
        "title": "OSM Stamen Toner",
        "url": "https://stamen-tiles-{a-d}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png",
        "zmin": 0,
        "zmax": 20,
        "crs": "EPSG:3857",
        "attribution": {
            "title": "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL",
            "url": "https://maps.stamen.com/"
        }
    },
    "open-topo-map": {
        "type": "xyz",
        "title": "OpenTopoMap",
        "url": "https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png",
        "zmin": 0,
        "zmax": 18,
        "crs": "EPSG:3857",
        "attribution": {
            "title": "Kartendaten: © OpenStreetMap-Mitwirkende, SRTM | Kartendarstellung: © OpenTopoMap (CC-BY-SA)",
            "url": "https://www.openstreetmap.org/copyright"
        }
    },
    "osm-cyclemap": {
        "type": "xyz",
        "title": "OSM CycleMap",
        "url": "https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey={key}",
        "key": "",
        "zmin": 0,
        "zmax": 18,
        "crs": "EPSG:3857",
        "attribution": {
            "title": "Thunderforest",
            "url": "https://www.thunderforest.com/"
        }
    },
    "google-street": {
        "type": "xyz",
        "title": "Google Streets",
        "url": "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        "zmin": 0,
        "zmax": 20,
        "crs": "EPSG:3857",
        "attribution": {
            "title": "Map data ©2019 Google",
            "url": "https://about.google/brand-resource-center/products-and-services/geo-guidelines/#required-attribution"
        }
    },
    "google-satellite": {
        "type": "xyz",
        "title": "Google Satellite",
        "url": "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        "zmin": 0,
        "zmax": 20,
        "crs": "EPSG:3857",
        "attribution": {
            "title": "Map data ©2019 Google",
            "url": "https://about.google/brand-resource-center/products-and-services/geo-guidelines/#required-attribution"
        }
    },
    "google-hybrid": {
        "type": "xyz",
        "title": "Google Hybrid",
        "url": "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        "zmin": 0,
        "zmax": 20,
        "crs": "EPSG:3857",
        "attribution": {
            "title": "Map data ©2019 Google",
            "url": "https://about.google/brand-resource-center/products-and-services/geo-guidelines/#required-attribution"
        }
    },
    "google-terrain": {
        "type": "xyz",
        "title": "Google Terrain",
        "url": "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
        "zmin": 0,
        "zmax": 20,
        "crs": "EPSG:3857",
        "attribution": {
            "title": "Map data ©2019 Google",
            "url": "https://about.google/brand-resource-center/products-and-services/geo-guidelines/#required-attribution"
        }
    },
    "bing-road": {
        "type": "bing",
        "title": "Bing Streets",
        "imagerySet": "RoadOnDemand",
        "key": "",
    },
    "bing-aerial": {
        "type": "bing",
        "title": "Bing Satellite",
        "imagerySet": "Aerial",
        "key": "",
    },
    "bing-hybrid": {
        "type": "bing",
        "title": "Bing Hybrid",
        "imagerySet": "AerialWithLabelsOnDemand",
        "key": "",
    },
    "ign-plan": {
        "type": "wmts",
        "title": "IGN Plan",
        "url": "https://wxs.ign.fr/cartes/geoportail/wmts",
        "layer": "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2",
        "format": "image/png",
        "style": "normal",
        "matrixSet": "PM",
        "crs": "EPSG:3857",
        "numZoomLevels": 20,
        "attribution": {
            "title": "Institut national de l'information géographique et forestière",
            "url": "https://www.ign.fr/"
        }
    },
    "ign-photo": {
        "type": "wmts",
        "title": "IGN Orthophoto",
        "url": "https://wxs.ign.fr/ortho/geoportail/wmts",
        "layer": "ORTHOIMAGERY.ORTHOPHOTOS",
        "format": "image/jpeg",
        "style": "normal",
        "matrixSet": "PM",
        "crs": "EPSG:3857",
        "numZoomLevels": 22,
        "attribution": {
            "title": "Institut national de l'information géographique et forestière",
            "url": "https://www.ign.fr/"
        }
    },
    "ign-scan": {
        "type": "wmts",
        "title": "IGN Scans",
        "url": "https://wxs.ign.fr/{key}/geoportail/wmts",
        "key": "",
        "layer": "GEOGRAPHICALGRIDSYSTEMS.MAPS",
        "format": "image/jpeg",
        "style": "normal",
        "matrixSet": "PM",
        "crs": "EPSG:3857",
        "numZoomLevels": 18,
        "attribution": {
            "title": "Institut national de l'information géographique et forestière",
            "url": "https://www.ign.fr/"
        }
    },
    "ign-cadastral": {
        "type": "wmts",
        "title": "IGN Cadastre",
        "url": "https://wxs.ign.fr/parcellaire/geoportail/wmts",
        "layer": "CADASTRALPARCELS.PARCELLAIRE_EXPRESS",
        "format": "image/png",
        "style": "normal",
        "matrixSet": "PM",
        "crs": "EPSG:3857",
        "numZoomLevels": 20,
        "attribution": {
            "title": "Institut national de l'information géographique et forestière",
            "url": "https://www.ign.fr/"
        }
    },

};

/**
 * Class representing a base layers config
 * @class
 */
export class BaseLayersConfig {
    /**
     * Create a base layers config based on a config object, the options config object and the layers config
     * @param {Object} cfg          - the lizmap config object for base layers
     * @param {Object} options      - the lizmap config object for options
     * @param {LayersConfig} layers - the lizmap layers config
     * @param {LayerTreeGroupConfig} [baseLayersTreeGroup]
     */
    constructor(cfg, options, layers, baseLayersTreeGroup) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }
        if (!options || typeof options !== "object") {
            throw new ValidationError('The options parameter is not an Object!');
        }
        if (!layers || typeof layers !== "object" || !(layers instanceof LayersConfig)) {
            throw new ValidationError('The layers parameter is not a LayersConfig instance!');
        }

        // Clone config to extend it with options and layers
        let extendedCfg = structuredClone(cfg);

        // Converting options properties to base layers config
        const optionsProperties = {
            emptyBaselayer: { name: 'empty' },
            osmMapnik: { name: 'osm-mapnik' },
            osmStamenToner: { name: 'osm-stamen-toner' },
            openTopoMap: { name: 'open-topo-map' },
            osmCyclemap: { name: 'osm-cyclemap', key: 'OCMKey' },
            googleStreets: { name: 'google-street' },
            googleSatellite: { name: 'google-satellite' },
            googleHybrid: { name: 'google-hybrid' },
            googleTerrain: { name: 'google-terrain' },
            bingStreets: { name: 'bing-road', key: 'bingKey' },
            bingSatellite: { name: 'bing-aerial', key: 'bingKey' },
            bingHybrid: { name: 'bing-hybrid', key: 'bingKey' },
            ignTerrain: { name: 'ign-plan' },
            ignStreets: { name: 'ign-scan', key: 'ignKey' },
            ignSatellite: { name: 'ign-photo' },
            ignCadastral: { name: 'ign-cadastral' }
        };
        for (const key in optionsProperties) {
            if (options.hasOwnProperty(key) && convertBoolean(options[key])) {
                const opt = optionsProperties[key];
                extendedCfg[opt.name] = structuredClone(defaultCompleteBaseLayersCfg[opt.name]);
                if (opt.hasOwnProperty('key') && options.hasOwnProperty(opt['key'])) {
                    extendedCfg[opt.name]['key'] = options[opt['key']];
                }
            }
        }

        // Add base layers from tree and collect names
        let names = [];
        if (baseLayersTreeGroup) {
            for (const layerTreeItem of baseLayersTreeGroup.getChildren()) {
                if ( !extendedCfg.hasOwnProperty(layerTreeItem.name) ) {
                    if ( defaultCompleteBaseLayersCfg.hasOwnProperty(layerTreeItem.name) ) {
                        extendedCfg[layerTreeItem.name] = structuredClone(defaultCompleteBaseLayersCfg[layerTreeItem.name]);
                    } else if ( layerTreeItem.layerCfg.externalWmsToggle ){
                        extendedCfg[layerTreeItem.name] = structuredClone(defaultCompleteBaseLayersCfg[layerTreeItem.layerCfg.externalAccess]);
                    } else {
                        extendedCfg[layerTreeItem.name] = {
                            "type": "lizmap",
                        }
                    }
                }
                // Override title and set layer config
                extendedCfg[layerTreeItem.name].title = layerTreeItem.wmsTitle;
                extendedCfg[layerTreeItem.name].layerConfig = layerTreeItem.layerConfig;
                const wmsAttribution = layerTreeItem.wmsAttribution;
                if (wmsAttribution != null) {
                    extendedCfg[layerTreeItem.name].attribution = wmsAttribution;
                }
                names.push(layerTreeItem.name);
            }
        }

        // Add layers from config
        for (const layerCfg of layers.getLayerConfigs()) {
            if (!layerCfg.baseLayer) {
                continue;
            }
            if (!extendedCfg.hasOwnProperty(layerCfg.name) ) {
                if ( defaultCompleteBaseLayersCfg.hasOwnProperty(layerCfg.name) ) {
                    extendedCfg[layerCfg.name] = structuredClone(defaultCompleteBaseLayersCfg[layerCfg.name]);
                    // Override title
                    extendedCfg[layerCfg.name].title = layerCfg.title;
                } else if ( layerCfg.externalWmsToggle ){
                    extendedCfg[layerCfg.name] = structuredClone(defaultCompleteBaseLayersCfg[layerCfg.externalAccess]);
                } else {
                    extendedCfg[layerCfg.name] = {
                        "type": "lizmap",
                        "title": layerCfg.title,
                    }
                }
            }
            // Set layer config
            extendedCfg[layerCfg.name].layerConfig = layerCfg;
        }

        // Define startup base layer based on names from tree
        this._startupBaselayer = null;
        if (names.length != 0) {
            this._startupBaselayer = names[0];
        }

        // Add names from keys
        for (const key in extendedCfg) {
            if (names.indexOf(key) == -1) {
                names.push(key);
            }
        }

        this._names = [];
        this._configs = [];
        for (const key of names) {
            if (key == 'empty' || key == 'project-background-color') {
                this._configs.push(new EmptyBaseLayerConfig({}));
                this._names.push(key);
                continue;
            }
            const blCfg = extendedCfg[key];
            if (!blCfg.hasOwnProperty('type')) {
                throw new ValidationError('No `type` in the baseLayer cfg object!');
            }
            switch (blCfg.type) {
                case 'xyz':
                    this._configs.push(new XyzBaseLayerConfig(key, blCfg));
                    this._names.push(key);
                    break;
                case 'bing':
                    this._configs.push(new BingBaseLayerConfig(key, blCfg));
                    this._names.push(key);
                    break;
                case 'wmts':
                    this._configs.push(new WmtsBaseLayerConfig(key, blCfg));
                    this._names.push(key);
                    break;
                default:
                    this._configs.push(new BaseLayerConfig(blCfg.type, key, blCfg));
                    this._names.push(key);
                    break;
            }
        }

        if (this._startupBaselayer == null) {
            if (options.hasOwnProperty('startupBaselayer')) {
                let startupBlName = options.startupBaselayer
                if (optionsProperties.hasOwnProperty(startupBlName)) {
                    startupBlName = optionsProperties[startupBlName].name;
                }
                if (this._names.indexOf(startupBlName) == -1) {
                    this._startupBaselayer = null;
                } else {
                    this._startupBaselayer = startupBlName;
                }
            } else {
                this._startupBaselayer = null;
            }
        }
    }

    /**
     *  The startup base layer name
     *
     * @type {?String}
     **/
    get startupBaselayerName() {
        return this._startupBaselayer;
    }

    /**
     * The copy of base layer names
     *
     * @type {String[]}
     **/
    get baseLayerNames() {
        return [...this._names];
    }

    /**
     * The copy of base layer configs
     *
     * @type {BaseLayerConfig[]}
     **/
    get baseLayerConfigs() {
        return [...this._configs];
    }

    /**
     * Iterate through base layer names
     *
     * @generator
     * @yields {string} The next base layer name
     **/
    *getBaseLayerNames() {
        for (const name of this._names) {
            yield name;
        }
    }

    /**
     * Iterate through base layer configs
     *
     * @generator
     * @yields {BaseLayerConfig} The next base layer config
     **/
    *getBaseLayerConfigs() {
        for (const config of this._configs) {
            yield config;
        }
    }

    /**
     * Get a base layer config by base layer name
     *
     * @param {String} name the base layer name
     *
     * @returns {BaseLayerConfig} The base layer config associated to the name
     *
     * @throws {RangeError|Error} The base layer name is unknown or the config has been corrupted
     **/
    getBaseLayerConfigByBaseLayerName(name) {
        const idx = this._names.indexOf(name);
        if (idx == -1) {
            throw new RangeError('The base layer name `' + name + '` is unknown!');
        }

        const cfg = this._configs[idx];
        if (cfg.name != name) {
            throw 'The config has been corrupted!'
        }

        return cfg;
    }
}
