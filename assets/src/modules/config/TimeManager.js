/**
 * @module config/TimeManager.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 **/

import { BaseObjectLayerConfig, BaseObjectLayersConfig } from './BaseObject.js';

const requiredProperties = {
    'startAttribute': {type: 'string'},
    'endAttribute': {type: 'string'},
    'attributeResolution': {type: 'string'},
    'min_timestamp': {type: 'string'},
    'max_timestamp': {type: 'string'}
};

const optionalProperties = {
};

/**
 * Class representing a time manager layer config
 * @class
 * @augments BaseObjectLayerConfig
 */
export class TimeManagerLayerConfig extends BaseObjectLayerConfig {
    /**
     * Create a time manager layer config instance
     *
     * @param {String} layerName - the layer name
     * @param {Object} cfg       - the lizmap config object for tooltip layer
     */
    constructor(layerName, cfg) {
        super(layerName, cfg, requiredProperties, optionalProperties)
    }

    /**
     * The start attribute
     *
     * @type {String}
     **/
    get startAttribute() {
        return this._startAttribute;
    }

    /**
     * The end attribute
     *
     * @type {String}
     **/
    get endAttribute() {
        return this._endAttribute;
    }

    /**
     * The attribute resolution
     *
     * @type {String}
     **/
    get attributeResolution() {
        return this._attributeResolution;
    }

    /**
     * The minimum timestamp
     *
     * @type {String}
     **/
    get minTimestamp() {
        return this._min_timestamp;
    }

    /**
     * The maximum timestamp
     *
     * @type {String}
     **/
    get maxTimestamp() {
        return this._max_timestamp;
    }
}

/**
 * Class representing a time manager layers config
 * @class
 * @augments BaseObjectLayersConfig
 */
export class TimeManagerLayersConfig extends BaseObjectLayersConfig {

    /**
     * Create a time manager layers config instance
     *
     * @param {Object} cfg - the lizmap tooltipLayers config object
     */
    constructor(cfg) {
        super(TimeManagerLayerConfig, cfg)
    }
}
