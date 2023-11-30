/**
 * @module utils/Edition.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 */

import { BaseObjectConfig, BaseObjectLayerConfig, BaseObjectLayersConfig } from './BaseObject.js';
import { ValidationError } from './../Errors.js';

const capabilitiesProperties = {
    'createFeature': {type: 'boolean'},
    'modifyAttribute': {type: 'boolean'},
    'modifyGeometry': {type: 'boolean'},
    'deleteFeature': {type: 'boolean'}
};

/**
 * Class representing an edition capabilities config
 * @class
 * @augments BaseObjectConfig
 */
export class EditionCapabilitiesConfig extends BaseObjectConfig {
    /**
     * Create an editions capabilities config instance
     * @param {object} cfg - the lizmap config object for edition capabilities
     */
    constructor(cfg) {
        super(cfg, capabilitiesProperties, {})
    }

    /**
     * Create feature capability
     * @type {boolean}
     */
    get createFeature() {
        return this._createFeature;
    }

    /**
     * Modify attribute capability
     * @type {boolean}
     */
    get modifyAttribute() {
        return this._modifyAttribute;
    }

    /**
     * Modify geometry capability
     * @type {boolean}
     */
    get modifyGeometry() {
        return this._modifyGeometry;
    }

    /**
     * Delete feature capability
     * @type {boolean}
     */
    get deleteFeature() {
        return this._deleteFeature;
    }
}
const requiredProperties = {
    'geometryType': {type: 'string'}
};

const optionalProperties = {
    'acl': {type: 'string'}
};

/**
 * Class representing an edition layer config
 * @class
 * @augments BaseObjectLayerConfig
 */
export class EditionLayerConfig extends BaseObjectLayerConfig {
    /**
     * Create an edition layer config instance
     * @param {string} layerName - the layer name
     * @param {object} cfg       - the lizmap config object for edition layer
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
     * @type {string}
     */
    get geometryType() {
        return this._geometryType;
    }

    /**
     * The capabilities
     * @type {capabilitiesEditionConfig}
     */
    get capabilities() {
        return this._capabilities;
    }

    /**
     * Acces control list
     * @type {?string}
     */
    get acl() {
        return this._acl;
    }
}

/**
 * Class representing an edition layers config
 * @class
 * @augments BaseObjectLayersConfig
 */
export class EditionLayersConfig extends BaseObjectLayersConfig {

    /**
     * Create an edition layers config instance
     * @param {object} cfg - the lizmap editionLayers config object
     */
    constructor(cfg) {
        super(EditionLayerConfig, cfg)
    }
}
