import { BaseLayerConfig, BaseLayersConfig } from './Base.js';

const requiredProperties = {
    'startAttribute': {type: 'string'},
    'endAttribute': {type: 'string'},
    'attributeResolution': {type: 'string'},
    'min_timestamp': {type: 'string'},
    'max_timestamp': {type: 'string'}
};

const optionalProperties = {
};

export class TimeManagerLayerConfig extends BaseLayerConfig {
    /**
     * @param {String} layerName - the layer name
     * @param {Object} cfg - the lizmap config object for tooltip layer
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

export class TimeManagerLayersConfig extends BaseLayersConfig {

    /**
     * @param {Object} cfg - the lizmap tooltipLayers config object
     */
    constructor(cfg) {
        super(TimeManagerLayerConfig, cfg)
    }
}
