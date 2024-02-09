/**
 * @module utils/AttributeTable.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 */

import { BaseObjectLayerConfig, BaseObjectLayersConfig } from './BaseObject.js';

const requiredProperties = {
    'primaryKey': {type: 'string'},
    'pivot': {type: 'boolean'},
    'hideAsChild': {type: 'boolean'},
    'hideLayer': {type: 'boolean'}
};

const optionalProperties = {
    'hiddenFields': {type: 'string', default: ''},
};

/**
 * Class representing an attribute layer config
 * @class
 * @name AttributeLayerConfig
 * @augments BaseObjectLayerConfig
 */
export class AttributeLayerConfig extends BaseObjectLayerConfig {
    /**
     * Create an attribute layer config instance
     * @param {string} layerName - the layer name
     * @param {object} cfg       - the lizmap config object for tooltip layer
     */
    constructor(layerName, cfg) {
        super(layerName, cfg, requiredProperties, optionalProperties)
    }

    /**
     * The layer primary key
     * @type {string}
     */
    get primaryKey() {
        return this._primaryKey;
    }

    /**
     * The layer hidden fields
     * @type {string}
     */
    get hiddenFields() {
        return this._hiddenFields;
    }

    /**
     * The layer is pivot table
     * @type {boolean}
     */
    get pivot() {
        return this._pivot;
    }

    /**
     * The layer is hide as child
     * @type {boolean}
     */
    get hideAsChild() {
        return this._hideAsChild;
    }

    /**
     * The layer is hide in attribute table list
     * @type {boolean}
     */
    get hideLayer() {
        return this._hideLayer;
    }
}

/**
 * Class representing an attribute layers config
 * @class
 * @augments BaseObjectLayersConfig
 */
export class AttributeLayersConfig extends BaseObjectLayersConfig {

    /**
     * Create an attribute layers config instance
     * @param {object} cfg - the lizmap attributeLayers config object
     */
    constructor(cfg) {
        super(AttributeLayerConfig, cfg)
    }
}
