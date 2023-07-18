/**
 * @module utils/AttributeTable.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 **/

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
 * @augments BaseObjectLayerConfig
 */
export class AttributeLayerConfig extends BaseObjectLayerConfig {
    /**
     * Create an attribute layer config instance
     *
     * @param {String} layerName - the layer name
     * @param {Object} cfg       - the lizmap config object for tooltip layer
     */
    constructor(layerName, cfg) {
        super(layerName, cfg, requiredProperties, optionalProperties)
    }

    /**
     * The layer primary key
     *
     * @type {String}
     **/
    get primaryKey() {
        return this._primaryKey;
    }

    /**
     * The layer hidden fields
     *
     * @type {String}
     **/
    get hiddenFields() {
        return this._hiddenFields;
    }

    /**
     * The layer is pivot table
     *
     * @type {Boolean}
     **/
    get pivot() {
        return this._pivot;
    }

    /**
     * The layer is hide as child
     *
     * @type {Boolean}
     **/
    get hideAsChild() {
        return this._hideAsChild;
    }

    /**
     * The layer is hide in attribute table list
     *
     * @type {Boolean}
     **/
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
     *
     * @param {Object} cfg - the lizmap attributeLayers config object
     */
    constructor(cfg) {
        super(AttributeLayerConfig, cfg)
    }
}
