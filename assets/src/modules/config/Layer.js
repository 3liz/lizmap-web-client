/**
 * @module config/Layer.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 **/

import { BaseObjectConfig } from './BaseObject.js';
import { ValidationError } from './../Errors.js';

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
     *
     * @param {Object}   cfg                       - the lizmap config object for layer
     * @param {String}   cfg.id                    - the layer id
     * @param {String}   cfg.name                  - the layer name
     * @param {String}   cfg.type                  - the layer type
     * @param {String}   cfg.title                 - the layer title
     * @param {String}   cfg.abstract              - the layer abstract
     * @param {String}   cfg.link                  - the layer link
     * @param {Number}   cfg.minScale              - the layer minScale
     * @param {Number}   cfg.maxScale              - the layer maxScale
     * @param {Boolean}  cfg.toggled               - the layer toggled activation
     * @param {Boolean}  cfg.popup                 - the layer popup activation
     * @param {String}   cfg.popupSource           - the layer popup source
     * @param {String}   cfg.popupTemplate         - the layer popup template
     * @param {Number}   cfg.popupMaxFeatures      - the layer popup max features
     * @param {Boolean}  cfg.popupDisplayChildren  - the layer popup display children activation
     * @param {Boolean}  cfg.groupAsLayer          - the layer as group as layer activation (only group type)
     * @param {Boolean}  cfg.baseLayer             - the layer as base layer activation
     * @param {Boolean}  cfg.displayInLegend       - the layer display in legend activation
     * @param {Boolean}  cfg.singleTile            - the layer singleTile activation
     * @param {String}   cfg.imageFormat           - the layer image format
     * @param {Boolean}  cfg.cached                - the layer cached activation
     * @param {Number}   cfg.clientCacheExpiration - the layer client cache expiration
     * @param {String}   [cfg.shortname]           - the layer short name
     * @param {String}   [cfg.layerType]           - the layer layer type (layer only)
     * @param {String}   [cfg.geometryType]        - the layer geometry type (layer only)
     * @param {Number[]} [cfg.extent]              - the layer extent (layer only)
     * @param {String}   [cfg.crs]                 - the layer crs (layer only)
     * @param {Number}   [cfg.opacity]             - the layer opacity defined in QGIS project
     * @param {Boolean}  [cfg.noLegendImage]       - the layer no legend image activation
     * @param {String}   [cfg.legend_image_option] - the layer legend image option
     * @param {Boolean}  [cfg.mutuallyExclusive]   - the layer mutuallyExclusive (only group type)
     * @param {Boolean}  [cfg.externalWmsToggle]   - the layer provides parameters for external access
     * @param {Object}   [cfg.externalAccess]      - the layer external access
     */
    constructor(cfg) {
        super(cfg, requiredProperties, optionalProperties)
    }

    /**
     * The layer id - QGIS layer id
     *
     * @type {String}
     **/
    get id() {
        return this._id;
    }

    /**
     * The layer name - QGIS layer name
     *
     * @type {String}
     **/
    get name() {
        return this._name;
    }

    /**
     * The layer type: layer or group
     *
     * @type {String}
     **/
    get type() {
        return this._type;
    }

    /**
     * The layer short name - will be the WMS/WFS/WMTS name if not null
     *
     * @type {?String}
     **/
    get shortname() {
        return this._shortname;
    }

    /**
     * The layer title
     *
     * @type {String}
     **/
    get title() {
        return this._title;
    }

    /**
     * The layer abstract
     *
     * @type {String}
     **/
    get abstract() {
        return this._abstract;
    }

    /**
     * The layer link
     *
     * @type {String}
     **/
    get link() {
        return this._link;
    }

    /**
     * The layer minScale
     *
     * @type {Number}
     **/
    get minScale() {
        return this._minScale;
    }

    /**
     * The layer maxScale
     *
     * @type {Number}
     **/
    get maxScale() {
        return this._maxScale;
    }

    /**
     * The layer type (layer only)
     *
     * @type {?String}
     **/
    get layerType() {
        return this._layerType;
    }

    /**
     * The layer geometry type (layer only)
     *
     * @type {?String}
     **/
    get geometryType() {
        return this._geometryType;
    }

    /**
     * The layer extent (layer only)
     *
     * @type {?Extent}
     **/
    get extent() {
        return this._extent;
    }

    /**
     * The layer crs (layer only)
     *
     * @type {?String}
     **/
    get crs() {
        return this._crs;
    }

    /**
     * The layer toggled activation
     *
     * @type {Boolean}
     **/
    get toggled() {
        return this._toggled;
    }

    /**
     * The layer popup activation
     *
     * @type {Boolean}
     **/
    get popup() {
        return this._popup;
    }

    /**
     * The layer popup source
     *
     * @type {String}
     **/
    get popupSource() {
        return this._popupSource;
    }

    /**
     * The layer popup template
     *
     * @type {String}
     **/
    get popupTemplate() {
        return this._popupTemplate;
    }

    /**
     * The layer popup max features
     *
     * @type {Number}
     **/
    get popupMaxFeatures() {
        return this._popupMaxFeatures;
    }

    /**
     * The layer popup display children activation
     *
     * @type {Boolean}
     **/
    get popupDisplayChildren() {
        return this._popupDisplayChildren;
    }

    /**
     * The layer as group as layer activation (group only)
     *
     * @type {Boolean}
     **/
    get groupAsLayer() {
        return this._groupAsLayer;
    }

    /**
     * The layer as base layer activation
     *
     * @type {Boolean}
     **/
    get baseLayer() {
        return this._baseLayer;
    }

    /**
     * The layer display in legend activation
     *
     * @type {Boolean}
     **/
    get displayInLegend() {
        return this._displayInLegend;
    }

    /**
     * The layer singleTile activation
     *
     * @type {Boolean}
     **/
    get singleTile() {
        return this._singleTile;
    }

    /**
     * The layer image format
     *
     * @type {String}
     **/
    get imageFormat() {
        return this._imageFormat;
    }

    /**
     * The layer cached activation
     *
     * @type {Boolean}
     **/
    get cached() {
        return this._cached;
    }

    /**
     * The layer opacity defined in QGIS project
     *
     * @type {Number}
     **/
    get opacity() {
        return this._opacity;
    }

    /**
     * The layer no legend image activation
     * replaced by legendImageOption
     *
     * @type {Boolean}
     * @deprecated
     **/
    get noLegendImage() {
        return this._noLegendImage;
    }

    /**
     * The layer legend image option
     *
     * @type {?String}
     **/
    get legendImageOption() {
        return this._legend_image_option;
    }

    /**
     * The layer client cache expiration
     *
     * @type {Number}
     **/
    get clientCacheExpiration() {
        return this._clientCacheExpiration;
    }

    /**
     * The layer mutually exclusive activation (group only)
     *
     * @type {Boolean}
     **/
    get mutuallyExclusive() {
        return this._mutuallyExclusive;
    }

    /**
     * The layer provides parameters for external access (layer only)
     *
     * @type {Boolean}
     **/
    get externalWmsToggle() {
        return this._externalWmsToggle;
    }

    /**
     * The layer layer external access (layer only)
     *
     * @type {?Object}
     **/
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
     *
     * @param {Object} cfg - the lizmap config object for layers
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
     *
     * @type {String[]}
     **/
    get layerNames() {
        return [...this._names];
    }

    /**
     * The copy of the layer ids
     *
     * @type {String[]}
     **/
    get layerIds() {
        return [...this._ids];
    }

    /**
     * The copy of the layer configs
     *
     * @type {LayerConfig[]}
     **/
    get layerConfigs() {
        return [...this._configs];
    }

    /**
     * Iterate through layer names
     *
     * @generator
     * @yields {string} The next layer name
     **/
    *getLayerNames() {
        for (const name of this._names) {
            yield name;
        }
    }

    /**
     * Iterate through layer ids
     *
     * @generator
     * @yields {string} The next layer id
     **/
    *getLayerIds() {
        for (const id of this._ids) {
            yield id;
        }
    }

    /**
     * Iterate through layer configs
     *
     * @generator
     * @yields {LayerConfig} The next layer config
     **/
    *getLayerConfigs() {
        for (const config of this._configs) {
            yield config;
        }
    }

    /**
     * Get a layer config by layer name
     *
     * @param {String} name the layer name
     *
     * @returns {LayerConfig} The layer config associated to the name
     *
     * @throws {RangeError|Error} The layer name is unknown or the config has been corrupted
     **/
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
     *
     * @param {String} id the layer id
     *
     * @returns {LayerConfig} The layer config associated to the id
     *
     * @throws {RangeError|Error} The layer name is unknown or the config has been corrupted
     **/
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
     *
     * @param {String} name the layer WMS name
     *
     * @returns {?LayerConfig} The layer config associated to the WMS name
     *
     * @throws {RangeError|Error} The layer name is unknown or the config has been corrupted
     **/
    getLayerConfigByWmsName(name) {
        const idx = this._names.indexOf(name);
        if (idx != -1) {
            const cfg = this._configs[idx];
            if (cfg.name != name) {
                throw 'The config has been corrupted!'
            }
            return cfg;
        }

        for (const layer of this.getLayerConfigs()) {
            if (layer.shortname == name) {
                return layer;
            }
        }

        return null;
    }
}
