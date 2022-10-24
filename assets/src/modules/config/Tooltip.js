import { BaseLayerConfig, BaseLayersConfig } from './Base.js';

const requiredProperties = {
    'fields': {type: 'string'},
    'displayGeom': {type: 'boolean'},
    'colorGeom': {type: 'string'},
};

const optionalProperties = {
};

export class TooltipLayerConfig extends BaseLayerConfig {
    /**
     * @param {String} layerName - the layer name
     * @param {Object} cfg - the lizmap config object for tooltip layer
     */
    constructor(layerName, cfg) {
        super(layerName, cfg, requiredProperties, optionalProperties)
    }

    /**
     * The layer tooltip fields
     *
     * @type {String}
     **/
    get fields() {
        return this._fields;
    }

    /**
     * The feature's geometry will be displayed
     *
     * @type {Boolean}
     **/
    get displayGeom() {
        return this._displayGeom;
    }

    /**
     * The feature's geometry color
     *
     * @type {String}
     **/
    get colorGeom() {
        return this._colorGeom;
    }
}

export class TooltipLayersConfig extends BaseLayersConfig {

    /**
     * @param {Object} cfg - the lizmap tooltipLayers config object
     */
    constructor(cfg) {
        super(TooltipLayerConfig, cfg)
    }
}
