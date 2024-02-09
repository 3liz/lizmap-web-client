/**
 * @module config/TimeManager.js
 * @name TimeManager
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

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
 * @class TimeManagerLayerConfig
 * @augments BaseObjectLayerConfig
 */
export class TimeManagerLayerConfig extends BaseObjectLayerConfig {
    /**
     * Create a time manager layer config instance
     * @param {string} layerName - the layer name
     * @param {object} cfg       - the lizmap config object for tooltip layer
     */
    constructor(layerName, cfg) {
        super(layerName, cfg, requiredProperties, optionalProperties)
    }

    /**
     * The start attribute
     * @type {string}
     */
    get startAttribute() {
        return this._startAttribute;
    }

    /**
     * The end attribute
     * @type {string}
     */
    get endAttribute() {
        return this._endAttribute;
    }

    /**
     * The attribute resolution
     * @type {string}
     */
    get attributeResolution() {
        return this._attributeResolution;
    }

    /**
     * The minimum timestamp
     * @type {string}
     */
    get minTimestamp() {
        return this._min_timestamp;
    }

    /**
     * The maximum timestamp
     * @type {string}
     */
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
     * @param {object} cfg - the lizmap tooltipLayers config object
     */
    constructor(cfg) {
        super(TimeManagerLayerConfig, cfg)
    }
}
