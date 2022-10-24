import { BaseObjectConfig, BaseLayerConfig, BaseLayersConfig } from './Base.js';
import { ValidationError } from './../Errors.js';

const capabilitiesProperties = {
    'createFeature': {type: 'boolean'},
    'modifyAttribute': {type: 'boolean'},
    'modifyGeometry': {type: 'boolean'},
    'deleteFeature': {type: 'boolean'}
};

export class EditionCapabilitiesConfig extends BaseObjectConfig {
    /**
     * @param {Object} cfg - the lizmap config object for edition layer
     */
    constructor(cfg) {
        super(cfg, capabilitiesProperties, {})
    }

    /**
     * Create feature capability
     *
     * @type {Boolean}
     **/
    get createFeature() {
        return this._createFeature;
    }

    /**
     * Modify attribute capability
     *
     * @type {Boolean}
     **/
    get modifyAttribute() {
        return this._modifyAttribute;
    }

    /**
     * Modify geometry capability
     *
     * @type {Boolean}
     **/
    get modifyGeometry() {
        return this._modifyGeometry;
    }

    /**
     * Delete feature capability
     *
     * @type {Boolean}
     **/
    get deleteFeature() {
        return this._deleteFeature;
    }
}
const requiredProperties = {
    'geometryType': {type: 'string'},
    'acl': {type: 'string'}
};

const optionalProperties = {
};

export class EditionLayerConfig extends BaseLayerConfig {
    /**
     * @param {String} layerName - the layer name
     * @param {Object} cfg - the lizmap config object for edition layer
     */
    constructor(layerName, cfg) {
        super(layerName, cfg, requiredProperties, optionalProperties)

        const prop = 'capabilities';
        if (!cfg.hasOwnProperty(prop)) {
            throw new ValidationError('No `' + prop + '` in the cfg object!');
        }
        this._capabilities = new EditionCapabilitiesConfig(cfg[prop]);
    }

    /**
     * The layer geometry type
     *
     * @type {String}
     **/
    get geometryType() {
        return this._geometryType;
    }

    /**
     * The capabilities
     *
     * @type {capabilitiesEditionConfig}
     **/
    get capabilities() {
        return this._capabilities;
    }

    /**
     * Acces control list
     *
     * @type {String}
     **/
    get acl() {
        return this._acl;
    }
}

export class EditionLayersConfig extends BaseLayersConfig {

    /**
     * @param {Object} cfg - the lizmap editionLayers config object
     */
    constructor(cfg) {
        super(EditionLayerConfig, cfg)
    }
}
