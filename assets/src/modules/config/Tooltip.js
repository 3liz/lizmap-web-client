/**
 * @module config/Tooltip.js
 * @name Tooltip
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { BaseObjectLayerConfig, BaseObjectLayersConfig } from './BaseObject.js';

const requiredProperties = {
    'layerId': {type: 'string'},
    'displayGeom': {type: 'boolean'},
    'order': {type: 'number'},
};

const optionalProperties = {
    'fields': {type: 'string'},
    'template': {type: 'string'},
    'colorGeom': {type: 'string'},
};

/**
 * Class representing a tooltip layer config
 * @class
 * @augments BaseObjectLayerConfig
 */
export class TooltipLayerConfig extends BaseObjectLayerConfig {
    /**
     * Create a tooltip layer config instance
     * @param {string} layerName - the layer name
     * @param {object} cfg       - the lizmap config object for tooltip layer
     */
    constructor(layerName, cfg) {
        super(layerName, cfg, requiredProperties, optionalProperties)
    }

    /**
     * The layer tooltip fields
     * @type {string}
     */
    get fields() {
        return this._fields;
    }

    /**
     * The feature's geometry will be displayed
     * @type {boolean}
     */
    get displayGeom() {
        return this._displayGeom;
    }

    /**
     * The feature's geometry color
     * @type {string}
     */
    get colorGeom() {
        return this._colorGeom;
    }
}

/**
 * Class representing a tooltip layers config
 * @class
 * @augments BaseObjectLayersConfig
 */
export class TooltipLayersConfig extends BaseObjectLayersConfig {

    /**
     * Create a tooltip layers config instance
     * @param {object} cfg - the lizmap tooltipLayers config object
     */
    constructor(cfg) {
        super(TooltipLayerConfig, cfg)
    }
}
