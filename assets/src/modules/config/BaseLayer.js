/**
 * @module utils/BaseLayer.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 **/

import { ValidationError } from './../Errors.js';
import { BaseObjectConfig } from './BaseObject.js';
import { convertBoolean } from './../utils/Converters.js';
import { createEnum } from './../utils/Enums.js';
import { AttributionConfig } from './Attribution.js';
import { LayerConfig, LayersConfig } from './Layer.js';

/**
 * Enum for base layer types
 * @readonly
 * @enum {String}
 * @property {String} Empty  - The base layer type for project background color
 * @property {String} XYZ    - The base layer type for xyz layers
 * @property {String} Bing   - The base layer type for Bing layers
 * @property {String} WMTS   - The base layer type for Web Map Tile Service layers
 * @property {String} Lizmap - The base layer type for Lizmap layers
 */
export const BaseLayerTypes = createEnum({
    'Empty': 'empty',
    'XYZ': 'xyz',
    'Bing': 'bing',
    'WMTS': 'wmts',
    'WMS': 'wms',
    'Lizmap': 'lizmap',
});

/**
 * Class representing a base layer config
 * @class
 * @augments BaseObjectConfig
 */
export class BaseLayerConfig extends BaseObjectConfig {
    /**
     * Create a base layer config instance based on a config object
     * @param {String}      name                                                           - the base layer name
     * @param {Object}      cfg                                                            - the base layer lizmap config object
     * @param {String}      cfg.title                                                      - the base layer title
     * @param {LayerConfig} [cfg.layerConfig]                                              - the base layer Lizmap layer config
     * @param {String}      [cfg.key]                                                      - the base layer key
     * @param {Object}      [cfg.attribution]                                              - the base layer attribution config object
     * @param {Object}      [requiredProperties={'title': {type: 'string'}}]               - the required properties definition
     * @param {Object}      [optionalProperties={'key': {type: 'string', nullable: true}}] - the optional properties definition
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
            throw new ValidationError('The cfg parameter is empty!');
        }

        super(name, cfg, xyzProperties, xyzOptionalProperties);
        this._type = BaseLayerTypes.XYZ;
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
            throw new ValidationError('The cfg parameter is empty!');
        }

        super(name, cfg, bingProperties, bingOptionalProperties)
        this._type = BaseLayerTypes.Bing;
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
    'layers': { type: 'string' },
    'format': { type: 'string' },
    'styles': { type: 'string' },
    'tileMatrixSet': { type: 'string' },
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
     * @param {String} cfg.layers          - the base layer layer
     * @param {String} cfg.format          - the base layer format
     * @param {String} cfg.styles          - the base layer style
     * @param {String} cfg.tileMatrixSet   - the base layer matrixSet
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
        return decodeURIComponent(this._layers);
    }

    /**
     * The base layer wmts format
     *
     * @type {String}
     **/
    get format() {
        return decodeURIComponent(this._format);
    }

    /**
     * The base layer wmts style
     *
     * @type {String}
     **/
    get style() {
        return decodeURIComponent(this._styles);
    }

    /**
     * The base layer matrixSet
     *
     * @type {String}
     **/
    get matrixSet() {
        return decodeURIComponent(this._tileMatrixSet);
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
     * @param {String} name                - the base layer name
     * @param {Object} cfg                 - the lizmap config object for WMTS base layer
     * @param {String} cfg.title           - the base layer title
     * @param {String} cfg.url             - the base layer url
     * @param {String} cfg.layers          - the base layer layer
     * @param {String} cfg.format          - the base layer format
     * @param {String} cfg.styles          - the base layer style
     * @param {String} cfg.crs             - the base layer crs
     * @param {String} [cfg.key]           - the base layer key
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
     *
     * @type {String}
     **/
    get url() {
        return this._url;
    }

    /**
     * The base layer wms layers
     *
     * @type {String}
     **/
    get layers() {
        return decodeURIComponent(this._layers);
    }

    /**
     * The base layer wms format
     *
     * @type {String}
     **/
    get format() {
        return decodeURIComponent(this._format);
    }

    /**
     * The base layer wms styles
     *
     * @type {String}
     **/
    get styles() {
        return decodeURIComponent(this._styles);
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
        "layers": "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2",
        "format": "image/png",
        "styles": "normal",
        "tileMatrixSet": "PM",
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
        "layers": "ORTHOIMAGERY.ORTHOPHOTOS",
        "format": "image/jpeg",
        "styles": "normal",
        "tileMatrixSet": "PM",
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
        "url": "https://wxs.ign.fr/parcellaire/geoportail/wmts",
        "layers": "CADASTRALPARCELS.PARCELLAIRE_EXPRESS",
        "format": "image/png",
        "styles": "normal",
        "tileMatrixSet": "PM",
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
                        // The name is known has a default base layer
                        extendedCfg[layerTreeItem.name] = structuredClone(defaultCompleteBaseLayersCfg[layerTreeItem.name]);
                    } else if ( layerTreeItem.layerConfig.externalWmsToggle ){
                        // The layer config has external access parameters
                        if (layerTreeItem.layerConfig.externalAccess.hasOwnProperty('type')) {
                            // layer could be converted to XYZ or WMTS background layers
                            extendedCfg[layerTreeItem.name] = structuredClone(layerTreeItem.layerConfig.externalAccess);
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
