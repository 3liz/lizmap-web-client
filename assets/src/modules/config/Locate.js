/**
 * @module config/Locate.js
 * @name Locate
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { BaseObjectLayerConfig, BaseObjectLayersConfig } from './BaseObject.js';

const requiredProperties = {
    'layerId': {type: 'string'},
    'fieldName': {type: 'string'},
    'minLength': {type: 'number'},
    'displayGeom': {type: 'boolean'},
    'filterOnLocate': {type: 'boolean'},
    'order': {type: 'number'}
};

const optionalProperties = {
};

/**
 * Class representing a locate layer config
 * @class
 * @augments BaseObjectLayerConfig
 */
export class LocateLayerConfig extends BaseObjectLayerConfig {
    /**
     * Create a locate layer config instance
     * @param {string} layerName - the layer name
     * @param {object} cfg       - the lizmap config object for tooltip layer
     */
    constructor(layerName, cfg) {
        super(layerName, cfg, requiredProperties, optionalProperties)
    }

    /**
     * The field name used to identify feature to locate
     * @type {string}
     */
    get fieldName() {
        return this._fieldName;
    }

    /**
     * The minimum number of input letters to display list
     * @type {number}
     */
    get minLength() {
        return this._minLength;
    }

    /**
     * Display the geometry on locate
     * @type {boolean}
     */
    get displayGeom() {
        return this._displayGeom;
    }

    /**
     * Filter the layer on locate
     * @type {boolean}
     */
    get filterOnLocate() {
        return this._filterOnLocate;
    }
}

/**
 * Class representing a locate by layer config
 * @class
 * @augments BaseObjectLayersConfig
 */
export class LocateByLayerConfig  extends BaseObjectLayersConfig {

    /**
     * Create a locate by layers config instance
     * @param {object} cfg - the lizmap locateByLayers config object
     */
    constructor(cfg) {
        super(LocateLayerConfig, cfg)
    }
}
