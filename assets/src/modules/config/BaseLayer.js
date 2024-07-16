/**
 * @module config/BaseLayer.js
 * @name BaseLayer
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { ValidationError } from './../Errors.js';
import { BaseObjectConfig } from './BaseObject.js';
import { convertBoolean } from './../utils/Converters.js';
import { createEnum } from './../utils/Enums.js';
import { AttributionConfig } from './Attribution.js';
import { LayerConfig, LayersConfig } from './Layer.js';
import { LayerTreeGroupConfig } from './LayerTree.js';

/**
 * Enum for base layer types
 * @readonly
 * @enum {string}
 * @property {string} Empty  - The base layer type for project background color
 * @property {string} XYZ    - The base layer type for xyz layers
 * @property {string} Bing   - The base layer type for Bing layers
 * @property {string} WMTS   - The base layer type for Web Map Tile Service layers
 * @property {string} Lizmap - The base layer type for Lizmap layers
 */
export const BaseLayerTypes = createEnum({
    'Empty': 'empty',
    'XYZ': 'xyz',
    'Bing': 'bing',
    'WMTS': 'wmts',
    'WMS': 'wms',
    'Lizmap': 'lizmap',
    'Google': 'google',
});

/**
 * Class representing a base layer config
 * @class
 * @name BaseLayerConfig
 * @augments BaseObjectConfig
 */
export class BaseLayerConfig extends BaseObjectConfig {
    /**
     * Create a base layer config instance based on a config object
     * @param {string}      name                                                           - the base layer name
     * @param {object}      cfg                                                            - the base layer lizmap config object
     * @param {string}      cfg.title                                                      - the base layer title
     * @param {LayerConfig} [cfg.layerConfig]                                              - the base layer Lizmap layer config
     * @param {string}      [cfg.key]                                                      - the base layer key
     * @param {object}      [cfg.attribution]                                              - the base layer attribution config object
     * @param {object}      [requiredProperties]               - the required properties definition
     * @param {object}      [optionalProperties] - the optional properties definition
     */
    constructor(name, cfg, requiredProperties = { 'title': { type: 'string' } }, optionalProperties = { 'key': { type: 'string', nullable: true } }) {

        if (!requiredProperties.hasOwnProperty('title')) {
            requiredProperties['title'] = { type: 'string' };
        }

        if (!optionalProperties.hasOwnProperty('key')) {
            optionalProperties['key'] = { type: 'string', nullable: true };
        }

        super(cfg, requiredProperties, optionalProperties);
        this._type = BaseLayerTypes.Lizmap;

        this._name = name;

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
     * @see BaseLayerTypes
     * @type {string}
     */
    get type() {
        return this._type;
    }

    /**
     * The base layer name
     * @type {string}
     */
    get name() {
        return this._name;
    }

    /**
     * The base layer title
     * @type {string}
     */
    get title() {
        return this._title;
    }

    /**
     * A Lizmap layer config is associated with this base layer
     * @type {boolean}
     */
    get hasLayerConfig() {
        return this._hasLayerConfig;
    }
    /**
     * The Lizmap layer config associated with this base layer
     * @type {?LayerConfig}
     */
    get layerConfig() {
        return this._layerConfig;
    }

    /**
     * The base layer key is defined
     * @type {boolean}
     */
    get hasKey() {
        return (this._key != null && typeof this._key == 'string' && this._key != '');
    }

    /**
     * The base layer key
     * @type {?string}
     */
    get key() {
        if (this.hasKey)
            return this._key;
        return null;
    }

    /**
     * Attribution is defined
     * @type {boolean}
     */
    get hasAttribution() {
        return this._hasAttribution;
    }
    /**
     * Attribution
     * @type {?AttributionConfig}
     */
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
     * @param {string} name - the base layer name
     * @param {object} cfg - an object for empty base layer
     */
    constructor(name, cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }
        const emptyCfg = Object.assign({
            title: name
        }, cfg);
        const emptyProperties = {
            'title': { type: 'string' }
        };
        super(name, emptyCfg, emptyProperties, {});
        this._type = BaseLayerTypes.Empty;
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
     * @param {string} name              - the base layer name
     * @param {object} cfg               - the lizmap config object for XYZ base layer
     * @param {string} cfg.title         - the base layer title
     * @param {string} cfg.url           - the base layer url
     * @param {string} cfg.crs           - the base layer crs
     * @param {number} [cfg.zmin]        - the base layer zmin
     * @param {number} [cfg.zmax]        - the base layer zmax
     * @param {string} [cfg.key]         - the base layer key
     * @param {object} [cfg.attribution] - the base layer attribution config object
     */
    constructor(name, cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }

        if (Object.getOwnPropertyNames(cfg).length == 0) {
            throw new ValidationError('The cfg parameter is empty!');
        }

        super(name, cfg, xyzProperties, xyzOptionalProperties);
        this._type = BaseLayerTypes.XYZ;
    }

    /**
     * The base layer url
     * @type {string}
     */
    get url() {
        return this._url;
    }

    /**
     * The base layer zmin
     * @type {number}
     */
    get zmin() {
        return this._zmin;
    }

    /**
     * The base layer zmax
     * @type {number}
     */
    get zmax() {
        return this._zmax;
    }

    /**
     * The base layer crs
     * @type {string}
     */
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
     * @param {string} name           - the base layer name
     * @param {object} cfg            - the lizmap config object for BING base layer
     * @param {string} cfg.title      - the base layer title
     * @param {string} cfg.imagerySet - the base layer imagerySet
     * @param {string} [cfg.key]      - the base layer key
     */
    constructor(name, cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }

        if (Object.getOwnPropertyNames(cfg).length == 0) {
            throw new ValidationError('The cfg parameter is empty!');
        }

        super(name, cfg, bingProperties, bingOptionalProperties)
        this._type = BaseLayerTypes.Bing;
    }

    /**
     * The bing imagerySet
     * @type {string}
     */
    get imagerySet() {
        return this._imagerySet;
    }

}

const googleProperties = {
    'title': { type: 'string' },
    'mapType': { type: 'string' }
}

const googleOptionalProperties = {
    'key': { type: 'string', nullable: true }
}

/**
 * Class representing a Google base layer config
 * @class
 * @augments BaseLayerConfig
 */
export class GoogleBaseLayerConfig extends BaseLayerConfig {
    /**
     * Create a GOOGLE base layer config based on a config object
     * @param {string} name           - the base layer name
     * @param {object} cfg            - the lizmap config object for GOOGLE base layer
     * @param {string} cfg.title      - the base layer title
     * @param {string} cfg.mapType    - the base layer mapType
     * @param {string} [cfg.key]      - the base layer key
     */
    constructor(name, cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }

        if (Object.getOwnPropertyNames(cfg).length == 0) {
            throw new ValidationError('The cfg parameter is empty!');
        }

        super(name, cfg, googleProperties, googleOptionalProperties)
        this._type = BaseLayerTypes.Google;
    }

    /**
     * The Google mapType
     * @type {string}
     */
    get mapType() {
        return this._mapType;
    }

}

const wmtsProperties = {
    'title': { type: 'string' },
    'url': { type: 'string' },
    'layers': { type: 'string' },
    'format': { type: 'string' },
    'styles': { type: 'string' },
    'tileMatrixSet': { type: 'string' },
    'crs': { type: 'string' }
}

const wmtsOptionalProperties = {
    'numZoomLevels': { type: 'number', default: 19   },
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
     * @param {string} name                - the base layer name
     * @param {object} cfg                 - the lizmap config object for WMTS base layer
     * @param {string} cfg.title           - the base layer title
     * @param {string} cfg.url             - the base layer url
     * @param {string} cfg.layers          - the base layer layer
     * @param {string} cfg.format          - the base layer format
     * @param {string} cfg.styles          - the base layer style
     * @param {string} cfg.tileMatrixSet   - the base layer matrixSet
     * @param {string} cfg.crs             - the base layer crs
     * @param {number} [cfg.numZoomLevels] - the base layer numZoomLevels
     * @param {string} [cfg.key]           - the base layer key
     * @param {object} [cfg.attribution]   - the base layer attribution config object
     */
    constructor(name, cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }

        if (Object.getOwnPropertyNames(cfg).length == 0) {
            throw new ValidationError('The cfg parameter is empty!');
        }

        super(name, cfg, wmtsProperties, wmtsOptionalProperties);
        this._type = BaseLayerTypes.WMTS;

        // Remove unnecessary parameters
        let wmtsUrl = new URL(this._url);
        let keysToRemove = []
        for (const [key, ] of wmtsUrl.searchParams) {
            if (key.toLowerCase() == 'service'
                || key.toLowerCase() == 'version'
                || key.toLowerCase() == 'request') {
                keysToRemove.push(key);
            }
        }
        if (keysToRemove.length != 0) {
            for (const key of keysToRemove) {
                wmtsUrl.searchParams.delete(key);
            }
            this._url = wmtsUrl.toString();
        }
    }

    /**
     * The base layer url
     * @type {string}
     */
    get url() {
        return this._url;
    }

    /**
     * The base layer wmts layer
     * @type {string}
     */
    get layer() {
        return decodeURIComponent(this._layers);
    }

    /**
     * The base layer wmts format
     * @type {string}
     */
    get format() {
        return decodeURIComponent(this._format);
    }

    /**
     * The base layer wmts style
     * @type {string}
     */
    get style() {
        return decodeURIComponent(this._styles);
    }

    /**
     * The base layer matrixSet
     * @type {string}
     */
    get matrixSet() {
        return decodeURIComponent(this._tileMatrixSet);
    }

    /**
     * The base layer crs
     * @type {string}
     */
    get crs() {
        return this._crs;
    }

    /**
     * The base layer numZoomLevels
     * @type {number}
     */
    get numZoomLevels() {
        return this._numZoomLevels;
    }

}

const wmsProperties = {
    'title': { type: 'string' },
    'url': { type: 'string' },
    'layers': { type: 'string' },
    'format': { type: 'string' },
    'styles': { type: 'string' },
    'crs': { type: 'string' }
}

const wmsOptionalProperties = {
    'key': { type: 'string', nullable: true }
}

/**
 * Class representing a WMS base layer config
 * @class
 * @augments BaseLayerConfig
 */
export class WmsBaseLayerConfig extends BaseLayerConfig {
    /**
     * Create a WMS base layer config based on a config object
     * @param {string} name                - the base layer name
     * @param {object} cfg                 - the lizmap config object for WMTS base layer
     * @param {string} cfg.title           - the base layer title
     * @param {string} cfg.url             - the base layer url
     * @param {string} cfg.layers          - the base layer layer
     * @param {string} cfg.format          - the base layer format
     * @param {string} cfg.styles          - the base layer style
     * @param {string} cfg.crs             - the base layer crs
     * @param {string} [cfg.key]           - the base layer key
     */
    constructor(name, cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }

        if (Object.getOwnPropertyNames(cfg).length == 0) {
            throw new ValidationError('The cfg parameter is empty!');
        }

        super(name, cfg, wmsProperties, wmsOptionalProperties);
        this._type = BaseLayerTypes.WMS;

        // Remove unnecessary parameters
        let wmtsUrl = new URL(this._url);
        let keysToRemove = []
        for (const [key, ] of wmtsUrl.searchParams) {
            if (key.toLowerCase() == 'service'
                || key.toLowerCase() == 'version'
                || key.toLowerCase() == 'request') {
                keysToRemove.push(key);
            }
        }
        if (keysToRemove.length != 0) {
            for (const key of keysToRemove) {
                wmtsUrl.searchParams.delete(key);
            }
            this._url = wmtsUrl.toString();
        }
    }

    /**
     * The base layer url
     * @type {string}
     */
    get url() {
        return this._url;
    }

    /**
     * The base layer wms layers
     * @type {string}
     */
    get layers() {
        return decodeURIComponent(this._layers);
    }

    /**
     * The base layer wms format
     * @type {string}
     */
    get format() {
        return decodeURIComponent(this._format);
    }

    /**
     * The base layer wms styles
     * @type {string}
     */
    get styles() {
        return decodeURIComponent(this._styles);
    }

    /**
     * The base layer crs
     * @type {string}
     */
    get crs() {
        return this._crs;
    }
}

/**
 * The default complete lizmap config object for base layers
 * It will be used to translate lizmap options config to base layers config
 * @constant
 * @type {object}
 * @private
 */
const defaultCompleteBaseLayersCfg = {
    "empty": {},
    "project-background-color": {},
    "osm-mapnik": {
        "type": "xyz",
        "title": "OpenStreetMap",
        "url": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
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
        "url": "https://data.geopf.fr/wmts?",
        "layers": "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2",
        "format": "image/png",
        "styles": "normal",
        "tileMatrixSet": "PM",
        "crs": "EPSG:3857",
        "numZoomLevels": 19,
        "attribution": {
            "title": "Institut national de l'information géographique et forestière",
            "url": "https://www.ign.fr/"
        }
    },
    "ign-photo": {
        "type": "wmts",
        "title": "IGN Orthophoto",
        "url": "https://data.geopf.fr/wmts?",
        "layers": "ORTHOIMAGERY.ORTHOPHOTOS",
        "format": "image/jpeg",
        "styles": "normal",
        "tileMatrixSet": "PM",
        "crs": "EPSG:3857",
        "numZoomLevels": 19,
        "attribution": {
            "title": "Institut national de l'information géographique et forestière",
            "url": "https://www.ign.fr/"
        }
    },
    "ign-scan": {
        "type": "wmts",
        "title": "IGN Scans",
        "url": "https://data.geopf.fr/private/wmts/?apikey={key}&",
        "key": "",
        "layers": "GEOGRAPHICALGRIDSYSTEMS.MAPS",
        "format": "image/jpeg",
        "styles": "normal",
        "tileMatrixSet": "PM",
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
        "url": "https://data.geopf.fr/wmts?",
        "layers": "CADASTRALPARCELS.PARCELLAIRE_EXPRESS",
        "format": "image/png",
        "styles": "normal",
        "tileMatrixSet": "PM",
        "crs": "EPSG:3857",
        "numZoomLevels": 19,
        "attribution": {
            "title": "Institut national de l'information géographique et forestière",
            "url": "https://www.ign.fr/"
        }
    },

};

/**
 * The QuickMapServices external layers object configuration
 * It will be used to define base layers config based on the type of external layer
 * @constant
 * @type {object}
 * @see https://plugins.qgis.org/plugins/quick_map_services/
 * @private
 */
const QMSExternalLayer = {
    "qms-bing-roads": {
        "type": "bing",
        "title": "Bing Streets",
        "imagerySet": "RoadOnDemand",
        "key": "",
    },
    "qms-bing-satellite": {
        "type": "bing",
        "title": "Bing Satellite",
        "imagerySet": "Aerial",
        "key": "",
    },
    "google-streets": {
        "type" :"google",
        "title": "Google Streets",
        "mapType": "roadmap",
        "key":""
    },
    "google-satellite": {
        "type" :"google",
        "title": "Google Satellite",
        "mapType": "satellite",
        "key":""
    }
}

/**
 * Class representing a base layers config
 * @class
 */
export class BaseLayersConfig {
    /**
     * Create a base layers config based on a config object, the options config object and the layers config
     * @param {object} cfg                                 - the lizmap config object for base layers
     * @param {object} options                             - the lizmap config object for options
     * @param {LayersConfig} layers                        - the lizmap layers config
     * @param {LayerTreeGroupConfig} [baseLayersTreeGroup] - the layer tree group config which contains base layers
     * @param {LayerTreeGroupConfig} [hiddenTreeGroup]     - the layer tree group config which contains hidden layers and in old config base layers
     */
    constructor(cfg, options, layers, baseLayersTreeGroup, hiddenTreeGroup) {
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
            ignTerrain: { name: 'ign-scan', key: 'ignKey' },
            ignStreets: { name: 'ign-plan' },
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

        // Add base layers config from hidden tree group
        if (hiddenTreeGroup && typeof hiddenTreeGroup.getChildren == "function") {
            for (const layerTreeItem of hiddenTreeGroup.getChildren()) {
                if ( !extendedCfg.hasOwnProperty(layerTreeItem.name) ) {
                    continue;
                }
                extendedCfg[layerTreeItem.name].layerConfig = layerTreeItem.layerConfig;
            }
        }

        // Add base layers from tree and collect names
        let names = [];
        if (baseLayersTreeGroup) {
            for (const layerTreeItem of baseLayersTreeGroup.getChildren()) {
                if ( !extendedCfg.hasOwnProperty(layerTreeItem.name) ) {
                    if ( defaultCompleteBaseLayersCfg.hasOwnProperty(layerTreeItem.name) ) {
                        // The name is known has a default base layer
                        extendedCfg[layerTreeItem.name] = structuredClone(defaultCompleteBaseLayersCfg[layerTreeItem.name]);
                    } else if ( layerTreeItem.layerConfig.externalWmsToggle ){
                        // The layer config has external access parameters
                        if (layerTreeItem.layerConfig.externalAccess.hasOwnProperty('type')) {
                            // search for QuickMapSevice plugin layers.
                            // The layers identification is based on the url property of the externalAccess object
                            const externalUrl = layerTreeItem.layerConfig.externalAccess.url;
                            if (externalUrl && externalUrl.includes('virtualearth.net') && options["bingKey"]) {
                                // Bing maps
                                // detect if the url is for roads or satellite
                                if (externalUrl.includes('dynamic')) {
                                    // roads
                                    extendedCfg[layerTreeItem.name] = structuredClone(QMSExternalLayer["qms-bing-roads"])
                                } else {
                                    // fallback on satellite map
                                    extendedCfg[layerTreeItem.name] = structuredClone(QMSExternalLayer["qms-bing-satellite"])
                                }
                                // add the apikey to the configuration
                                Object.assign(extendedCfg[layerTreeItem.name],{key:options["bingKey"]})
                            } else if (externalUrl && externalUrl.includes('google.com') && options["googleKey"]){
                                if (externalUrl.includes('lyrs=m')) {
                                    // roads
                                    extendedCfg[layerTreeItem.name] = structuredClone(QMSExternalLayer["google-streets"])
                                } else if (externalUrl.includes('lyrs=s')){
                                    // fallback on satellite map
                                    extendedCfg[layerTreeItem.name] = structuredClone(QMSExternalLayer["google-satellite"])
                                } else {
                                    extendedCfg[layerTreeItem.name] = structuredClone(QMSExternalLayer["google-streets"])
                                }
                                // add the apikey to the configuration
                                Object.assign(extendedCfg[layerTreeItem.name],{key:options["googleKey"]})
                            }
                            else {
                                // layer could be converted to XYZ or WMTS background layers
                                extendedCfg[layerTreeItem.name] = structuredClone(layerTreeItem.layerConfig.externalAccess);
                            }
                        } else {
                            extendedCfg[layerTreeItem.name] = Object.assign(
                                structuredClone(layerTreeItem.layerConfig.externalAccess),
                                {type: BaseLayerTypes.WMS}
                            );
                        }
                    } else {
                        // If the tree item is a layer associated to QGIS group do not keep
                        // we already keep empty or project-background-color QGIS group
                        if (layerTreeItem.type === 'layer' && layerTreeItem.layerConfig.type === 'group') {
                            continue;
                        }
                        // If the tree item is a group without any QGIS layer do not keep
                        if (layerTreeItem.type === 'group'
                            && layerTreeItem.findTreeLayerConfigs().filter(l => l.layerConfig.type === 'layer').length == 0) {
                            continue;
                        }
                        // It is a lizmap layer
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
                    // The layer config has external access parameters
                    if (layerCfg.externalAccess.hasOwnProperty('type')) {
                        // layer could be converted to XYZ or WMTS background layers
                        extendedCfg[layerCfg.name] = structuredClone(layerCfg.externalAccess);
                    } else {
                        extendedCfg[layerCfg.name] = Object.assign(
                            structuredClone(layerCfg.externalAccess),
                            {type: BaseLayerTypes.WMS}
                        );
                    }
                    // set title
                    extendedCfg[layerCfg.name].title = layerCfg.title;
                } else {
                    extendedCfg[layerCfg.name] = {
                        "type": BaseLayerTypes.Lizmap,
                        "title": layerCfg.title,
                    }
                }
            }
            // Set layer config
            extendedCfg[layerCfg.name].layerConfig = layerCfg;
        }

        // Add base layer as project default background color
        // Get provided default background color index from options
        const default_background_color_index = options.hasOwnProperty('default_background_color_index') ? options.default_background_color_index : -1;
        if (isNaN(default_background_color_index)) {
            throw new ValidationError('The default_background_color_index parameter is not a number!');
        }
        // Apply default background color if it is not already defined
        if (names.indexOf('empty') == -1
            && names.indexOf('project-background-color') == -1) {
            let background_color_index = default_background_color_index;
            // Calculate background color index if
            // * it is not provided by options
            // * baselayers and project-background-color have lizmap layer config
            // * baselayers group is before project-background-color
            if (background_color_index == -1
                && layers.layerNames.indexOf('baselayers') !== -1
                && layers.layerNames.indexOf('project-background-color') !== -1
                && layers.layerNames.indexOf('baselayers') < layers.layerNames.indexOf('project-background-color')) {
                const baselayersGroupIndex = layers.layerNames.indexOf('baselayers');
                const global_background_color_index = layers.layerNames.indexOf('project-background-color');
                // The background color index will be the number of layers before project-background-color in baselayers group
                for (const [i, baselayerCfg] of layers.layerConfigs.entries()) {
                    if (i <= baselayersGroupIndex) {
                        continue;
                    }
                    if (i > global_background_color_index) {
                        break;
                    }
                    if (baselayerCfg.type != 'group') {
                        background_color_index += 1
                    }
                    if (baselayerCfg.name == 'project-background-color') {
                        background_color_index += 1
                    }
                }
            }
            // Add base layer as project default background color
            if (background_color_index !== -1) {
                if (background_color_index < names.length) {
                    names.splice(background_color_index, 0, 'project-background-color');
                } else {
                    names.push('project-background-color');
                }
            }
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
                if (extendedCfg.hasOwnProperty(key)) {
                    this._configs.push(new EmptyBaseLayerConfig(key, extendedCfg[key]));
                } else {
                    this._configs.push(new EmptyBaseLayerConfig(key, {}));
                }
                this._names.push(key);
                continue;
            }
            const blCfg = extendedCfg[key];
            if (!blCfg.hasOwnProperty('type')) {
                throw new ValidationError('No `type` in the baseLayer cfg object!');
            }
            switch (blCfg.type) {
                case BaseLayerTypes.XYZ:
                    this._configs.push(new XyzBaseLayerConfig(key, blCfg));
                    this._names.push(key);
                    break;
                case BaseLayerTypes.Bing:
                    this._configs.push(new BingBaseLayerConfig(key, blCfg));
                    this._names.push(key);
                    break;
                case BaseLayerTypes.Google:
                    this._configs.push(new GoogleBaseLayerConfig(key, blCfg));
                    this._names.push(key);
                    break;
                case BaseLayerTypes.WMTS:
                    this._configs.push(new WmtsBaseLayerConfig(key, blCfg));
                    this._names.push(key);
                    break;
                case BaseLayerTypes.WMS:
                    this._configs.push(new WmsBaseLayerConfig(key, blCfg));
                    this._names.push(key);
                    break;
                default:
                    this._configs.push(new BaseLayerConfig(key, blCfg));
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

                // If there is a single baselayer defined, it is the startup one
                if (this._names.length === 1) {
                    this._startupBaselayer = this._names[0];
                } else if (this._names.indexOf(startupBlName) == -1) {
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
     * @type {?string}
     */
    get startupBaselayerName() {
        return this._startupBaselayer;
    }

    /**
     * The copy of base layer names
     * @type {string[]}
     */
    get baseLayerNames() {
        return [...this._names];
    }

    /**
     * The copy of base layer configs
     * @type {BaseLayerConfig[]}
     */
    get baseLayerConfigs() {
        return [...this._configs];
    }

    /**
     * Iterate through base layer names
     * @generator
     * @yields {string} The next base layer name
     */
    *getBaseLayerNames() {
        for (const name of this._names) {
            yield name;
        }
    }

    /**
     * Iterate through base layer configs
     * @generator
     * @yields {BaseLayerConfig} The next base layer config
     */
    *getBaseLayerConfigs() {
        for (const config of this._configs) {
            yield config;
        }
    }

    /**
     * Get a base layer config by base layer name
     * @param {string} name the base layer name
     * @returns {BaseLayerConfig} The base layer config associated to the name
     * @throws {RangeError|Error} The base layer name is unknown or the config has been corrupted
     */
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
