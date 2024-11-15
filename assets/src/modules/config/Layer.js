/**
 * @module config/Layer.js
 * @name Layer
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { BaseObjectConfig } from './BaseObject.js';
import { ValidationError } from './../Errors.js';
import { Extent } from './../utils/Extent.js';

const requiredProperties = {
    'id': {type: 'string'},
    'name': {type: 'string'},
    'type': {type: 'string'},
    'title': {type: 'string'},
    'abstract': {type: 'string'},
    'link': {type: 'string'},
    'minScale': {type: 'number'},
    'maxScale': {type: 'number'},
    'toggled': {type: 'boolean'},
    'popup': {type: 'boolean'},
    'popupSource': {type: 'string'},
    'popupTemplate': {type: 'string'},
    'popupMaxFeatures': {type: 'number'},
    'popupDisplayChildren': {type: 'boolean'},
    'groupAsLayer': {type: 'boolean'},
    'baseLayer': {type: 'boolean'},
    'displayInLegend': {type: 'boolean'},
    'singleTile': {type: 'boolean'},
    'imageFormat': {type: 'string'},
    'cached': {type: 'boolean'},
    'clientCacheExpiration': {type: 'number'}
};

const optionalProperties = {
    'shortname': {type: 'string'},
    'layerType': {type: 'string', nullable: true},
    'geometryType': {type: 'string', nullable: true},
    'extent': {type: 'extent', nullable: true},
    'crs': {type: 'string', nullable: true},
    'opacity': {type: 'number', default:1},
    'noLegendImage': {type: 'boolean', default:false},
    'legend_image_option': {type: 'string', nullable: true},
    'mutuallyExclusive': {type: 'boolean', default: false},
    'externalWmsToggle': {type: 'boolean', default: false},
    'externalAccess': {type: 'object'},
};

/**
 * Class representing a layer config
 * @class
 * @augments BaseObjectConfig
 */
export class LayerConfig extends BaseObjectConfig {
    /**
     * Create a layer config instance based on a config object
     * @param {object}   cfg                       - the lizmap config object for layer
     * @param {string}   cfg.id                    - the layer id
     * @param {string}   cfg.name                  - the layer name
     * @param {string}   cfg.type                  - the layer type
     * @param {string}   cfg.title                 - the layer title
     * @param {string}   cfg.abstract              - the layer abstract
     * @param {string}   cfg.link                  - the layer link
     * @param {number}   cfg.minScale              - the layer minScale
     * @param {number}   cfg.maxScale              - the layer maxScale
     * @param {boolean}  cfg.toggled               - the layer toggled activation
     * @param {boolean}  cfg.popup                 - the layer popup activation
     * @param {string}   cfg.popupSource           - the layer popup source
     * @param {string}   cfg.popupTemplate         - the layer popup template
     * @param {number}   cfg.popupMaxFeatures      - the layer popup max features
     * @param {boolean}  cfg.popupDisplayChildren  - the layer popup display children activation
     * @param {boolean}  cfg.groupAsLayer          - the layer as group as layer activation (only group type)
     * @param {boolean}  cfg.baseLayer             - the layer as base layer activation
     * @param {boolean}  cfg.displayInLegend       - the layer display in legend activation
     * @param {boolean}  cfg.singleTile            - the layer singleTile activation
     * @param {string}   cfg.imageFormat           - the layer image format
     * @param {boolean}  cfg.cached                - the layer cached activation
     * @param {number}   cfg.clientCacheExpiration - the layer client cache expiration
     * @param {string}   [cfg.shortname]           - the layer short name
     * @param {string}   [cfg.layerType]           - the layer layer type (layer only)
     * @param {string}   [cfg.geometryType]        - the layer geometry type (layer only)
     * @param {number[]} [cfg.extent]              - the layer extent (layer only)
     * @param {string}   [cfg.crs]                 - the layer crs (layer only)
     * @param {number}   [cfg.opacity]             - the layer opacity defined in QGIS project
     * @param {boolean}  [cfg.noLegendImage]       - the layer no legend image activation
     * @param {string}   [cfg.legend_image_option] - the layer legend image option
     * @param {boolean}  [cfg.mutuallyExclusive]   - the layer mutuallyExclusive (only group type)
     * @param {boolean}  [cfg.externalWmsToggle]   - the layer provides parameters for external access
     * @param {object}   [cfg.externalAccess]      - the layer external access
     */
    constructor(cfg) {
        super(cfg, requiredProperties, optionalProperties)
    }

    /**
     * The layer id - QGIS layer id
     * @type {string}
     */
    get id() {
        return this._id;
    }

    /**
     * The layer name - QGIS layer name
     * @type {string}
     */
    get name() {
        return this._name;
    }

    /**
     * The layer type: layer or group
     * @type {string}
     */
    get type() {
        return this._type;
    }

    /**
     * The layer short name - will be the WMS/WFS/WMTS name if not null
     * @type {?string}
     */
    get shortname() {
        return this._shortname;
    }

    /**
     * The layer title
     * @type {string}
     */
    get title() {
        return this._title;
    }

    /**
     * The layer abstract
     * @type {string}
     */
    get abstract() {
        return this._abstract;
    }

    /**
     * The layer link
     * @type {string}
     */
    get link() {
        return this._link;
    }

    /**
     * The layer minScale
     * @type {number}
     */
    get minScale() {
        return this._minScale;
    }

    /**
     * The layer maxScale
     * @type {number}
     */
    get maxScale() {
        return this._maxScale;
    }

    /**
     * The layer type (layer only)
     * @type {?string}
     */
    get layerType() {
        return this._layerType;
    }

    /**
     * The layer geometry type (layer only)
     * @type {?string}
     */
    get geometryType() {
        return this._geometryType;
    }

    /**
     * The layer extent (layer only)
     * @type {?Extent}
     */
    get extent() {
        return this._extent;
    }

    /**
     * The layer crs (layer only)
     * @type {?string}
     */
    get crs() {
        return this._crs;
    }

    /**
     * The layer toggled activation
     * @type {boolean}
     */
    get toggled() {
        return this._toggled;
    }

    /**
     * The layer popup activation
     * @type {boolean}
     */
    get popup() {
        return this._popup;
    }

    /**
     * The layer popup source
     * @type {string}
     */
    get popupSource() {
        return this._popupSource;
    }

    /**
     * The layer popup template
     * @type {string}
     */
    get popupTemplate() {
        return this._popupTemplate;
    }

    /**
     * The layer popup max features
     * @type {number}
     */
    get popupMaxFeatures() {
        return this._popupMaxFeatures;
    }

    /**
     * The layer popup display children activation
     * @type {boolean}
     */
    get popupDisplayChildren() {
        return this._popupDisplayChildren;
    }

    /**
     * The layer as group as layer activation (group only)
     * @type {boolean}
     */
    get groupAsLayer() {
        return this._groupAsLayer;
    }

    /**
     * The layer as base layer activation
     * @type {boolean}
     */
    get baseLayer() {
        return this._baseLayer;
    }

    /**
     * The layer display in legend activation
     * @type {boolean}
     */
    get displayInLegend() {
        return this._displayInLegend;
    }

    /**
     * The layer singleTile activation
     * @type {boolean}
     */
    get singleTile() {
        return this._singleTile;
    }

    /**
     * The layer image format
     * @type {string}
     */
    get imageFormat() {
        return this._imageFormat;
    }

    /**
     * The layer cached activation
     * @type {boolean}
     */
    get cached() {
        return this._cached;
    }

    /**
     * The layer opacity defined in QGIS project
     * @type {number}
     */
    get opacity() {
        return this._opacity;
    }

    /**
     * The layer no legend image activation
     * replaced by legendImageOption
     * @type {boolean}
     * @deprecated
     */
    get noLegendImage() {
        return this._noLegendImage;
    }

    /**
     * The layer legend image option
     * @type {?string}
     */
    get legendImageOption() {
        return this._legend_image_option;
    }

    /**
     * The layer client cache expiration
     * @type {number}
     */
    get clientCacheExpiration() {
        return this._clientCacheExpiration;
    }

    /**
     * The layer mutually exclusive activation (group only)
     * @type {boolean}
     */
    get mutuallyExclusive() {
        return this._mutuallyExclusive;
    }

    /**
     * The layer provides parameters for external access (layer only)
     * @type {boolean}
     */
    get externalWmsToggle() {
        return this._externalWmsToggle;
    }

    /**
     * The layer external access (layer only)
     * @type {?object}
     */
    get externalAccess() {
        return this._externalAccess;
    }
}

/**
 * Class representing the layers config accessor
 * @class
 */
export class LayersConfig {

    /**
     * Create a layers config accessor instance based on a config object
     * @param {object} cfg - the lizmap config object for layers
     */
    constructor(cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }

        this._names = [];
        this._ids = [];
        this._configs = [];

        for (const key in cfg) {
            const lConfig = new LayerConfig(cfg[key]);
            this._names.push(lConfig.name);
            this._ids.push(lConfig.id);
            this._configs.push(lConfig);
        }
    }

    /**
     * The copy of the layer names
     * @type {string[]}
     */
    get layerNames() {
        return [...this._names];
    }

    /**
     * The copy of the layer ids
     * @type {string[]}
     */
    get layerIds() {
        return [...this._ids];
    }

    /**
     * The copy of the layer configs
     * @type {LayerConfig[]}
     */
    get layerConfigs() {
        return [...this._configs];
    }

    /**
     * Iterate through layer names
     * @generator
     * @yields {string} The next layer name
     */
    *getLayerNames() {
        for (const name of this._names) {
            yield name;
        }
    }

    /**
     * Iterate through layer ids
     * @generator
     * @yields {string} The next layer id
     */
    *getLayerIds() {
        for (const id of this._ids) {
            yield id;
        }
    }

    /**
     * Iterate through layer configs
     * @generator
     * @yields {LayerConfig} The next layer config
     */
    *getLayerConfigs() {
        for (const config of this._configs) {
            yield config;
        }
    }

    /**
     * Get a layer config by layer name
     * @param {string} name the layer name
     * @returns {LayerConfig} The layer config associated to the name
     * @throws {RangeError|Error} The layer name is unknown or the config has been corrupted
     */
    getLayerConfigByLayerName(name) {
        const idx = this._names.indexOf(name);
        if (idx == -1) {
            throw new RangeError('The layer name `'+ name +'` is unknown!');
        }

        const cfg = this._configs[idx];
        if (cfg.name != name) {
            throw 'The config has been corrupted!'
        }

        return cfg;
    }

    /**
     * Get a layer config by layer id
     * @param {string} id the layer id
     * @returns {LayerConfig} The layer config associated to the id
     * @throws {RangeError|Error} The layer name is unknown or the config has been corrupted
     */
    getLayerConfigByLayerId(id) {
        const idx = this._ids.indexOf(id);
        if (idx == -1) {
            throw new RangeError('The layer id `'+ id +'` is unknown!');
        }

        const cfg = this._configs[idx];
        if (cfg.id != id) {
            throw 'The config has been corrupted!'
        }

        return cfg;
    }

    /**
     * Get a layer config by layer WMS name
     * @param {string} name the layer WMS name
     * @returns {?LayerConfig} The layer config associated to the WMS name
     * @throws {RangeError|Error} The layer name is unknown or the config has been corrupted
     */
    getLayerConfigByWmsName(name) {
        // WMS Name can be the layer name
        let idx = this._names.indexOf(name);
        if (idx != -1) {
            const cfg = this._configs[idx];
            if (cfg.name != name) {
                throw 'The config has been corrupted!'
            }
            return cfg;
        }

        // WMS Name can be the layer id
        idx = this._ids.indexOf(name);
        if (idx != -1) {
            const cfg = this._configs[idx];
            if (cfg.id != name) {
                throw 'The config has been corrupted!'
            }
            return cfg;
        }

        // WMS Name can be the short name
        for (const layer of this.getLayerConfigs()) {
            if (layer.shortname == name) {
                return layer;
            }
        }

        return null;
    }
}
