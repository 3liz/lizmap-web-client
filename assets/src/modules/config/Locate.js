/**
 * @module config/Locate.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 **/

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
     *
     * @param {String} layerName - the layer name
     * @param {Object} cfg       - the lizmap config object for tooltip layer
     */
    constructor(layerName, cfg) {
        super(layerName, cfg, requiredProperties, optionalProperties)
    }

    /**
     * The field name used to identify feature to locate
     *
     * @type {String}
     **/
    get fieldName() {
        return this._fieldName;
    }

    /**
     * The minimum number of input letters to display list
     *
     * @type {Number}
     **/
    get minLength() {
        return this._minLength;
    }

    /**
     * Display the geometry on locate
     *
     * @type {Boolean}
     **/
    get displayGeom() {
        return this._displayGeom;
    }

    /**
     * Filter the layer on locate
     *
     * @type {Boolean}
     **/
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
     *
     * @param {Object} cfg - the lizmap locateByLayers config object
     */
    constructor(cfg) {
        super(LocateLayerConfig, cfg)
    }
}
