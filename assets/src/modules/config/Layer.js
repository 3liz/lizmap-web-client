import { BaseObjectConfig } from './BaseObject.js';
import { ValidationError } from './../Errors.js';
//import { Extent } from './Tools.js';

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
    'noLegendImage': {type: 'boolean'},
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
    'geometryType': {type: 'string', nullable: true},
    'extent': {type: 'extent', nullable: true},
    'crs': {type: 'string', nullable: true},
    'popupFrame': {type: 'string', nullable: true},
    'serverFrame': {type: 'string', nullable: true},
    'mutuallyExclusive': {type: 'boolean', default: false},
};

export class LayerConfig extends BaseObjectConfig {

    /**
     * @param {Object} cfg - the lizmap config object for layer
     */
    constructor(cfg) {
        super(cfg, requiredProperties, optionalProperties)
    }

    /**
     * The layer id
     *
     * @type {String}
     **/
    get id() {
        return this._id;
    }

    /**
     * The layer name
     *
     * @type {String}
     **/
    get name() {
        return this._name;
    }

    /**
     * The layer type
     *
     * @type {String}
     **/
    get type() {
        return this._type;
    }

    /**
     * The layer short name
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
     * The layer geometry type (only layer)
     *
     * @type {?String}
     **/
    get geometryType() {
        return this._geometryType;
    }

    /**
     * The layer extent (only layer)
     *
     * @type {?Extent}
     **/
    get extent() {
        return this._extent;
    }

    /**
     * The layer crs (only layer)
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
     * The layer popup activation
     *
     * @type {?String} a String or null
     **/
    get popupFrame() {
        return this._popupFrame;
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
     * The layer no legend image activation
     *
     * @type {Boolean}
     **/
    get noLegendImage() {
        return this._noLegendImage;
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
     * The layer server frame
     *
     * @type {?String}
     **/
    get serverFrame() {
        return this._serverFrame;
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
}

export class LayersConfig {

    /**
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
     * The layer names from config
     *
     * @type {String[]} the copy of the layer names
     **/
    get layerNames() {
        return [...this._names];
    }

    /**
     * The layer ids from config
     *
     * @type {String[]} the copy of the layer ids
     **/
    get layerIds() {
        return [...this._ids];
    }

    /**
     * The layer configs from config
     *
     * @type {LayerConfig[]} the copy of the layer configs
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
}
