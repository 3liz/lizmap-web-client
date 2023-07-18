/**
 * @module config/Tooltip.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 **/

import { BaseObjectLayerConfig, BaseObjectLayersConfig } from './BaseObject.js';

const requiredProperties = {
    'fields': {type: 'string'},
    'displayGeom': {type: 'boolean'},
    'colorGeom': {type: 'string'},
};

const optionalProperties = {
};

/**
 * Class representing a tooltip layer config
 * @class
 * @augments BaseObjectLayerConfig
 */
export class TooltipLayerConfig extends BaseObjectLayerConfig {
    /**
     * Create a tooltip layer config instance
     *
     * @param {String} layerName - the layer name
     * @param {Object} cfg       - the lizmap config object for tooltip layer
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

/**
 * Class representing a tooltip layers config
 * @class
 * @augments BaseObjectLayersConfig
 */
export class TooltipLayersConfig extends BaseObjectLayersConfig {

    /**
     * Create a tooltip layers config instance
     *
     * @param {Object} cfg - the lizmap tooltipLayers config object
     */
    constructor(cfg) {
        super(TooltipLayerConfig, cfg)
    }
}
