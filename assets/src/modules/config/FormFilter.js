/**
 * @module utils/FormFilter.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 **/

import { BaseObjectConfig } from './BaseObject.js';
import { ValidationError } from './../Errors.js';

const requiredProperties = {
    'layerId': {type: 'string'},
    'type': {type: 'string'},
    'title': {type: 'string'},
    'format': {type: 'string'},
    'order': {type: 'number'},
    'provider': {type: 'string'},
};

const optionalProperties = {
    'field': {type: 'string'},
    'min_date': {type: 'string'},
    'max_date': {type: 'string'},
    'splitter': {type: 'string'},
};

/**
 * Class representing a form filter element config
 * @class
 * @augments BaseObjectConfig
 */
export class FormFilterElementConfig extends BaseObjectConfig {
    /**
     * Create a form filter element config instance
     *
     * @param {Object} cfg - the lizmap config object for form filter element config
     */
    constructor(cfg) {
        super(cfg, requiredProperties, optionalProperties)
    }

    /**
     * The layer id
     *
     * @type {String}
     **/
    get layerId() {
        return this._layerId;
    }

    /**
     * The type
     *
     * @type {String}
     **/
    get type() {
        return this._type;
    }

    /**
     * The title
     *
     * @type {String}
     **/
    get title() {
        return this._title;
    }

    /**
     * The field
     *
     * @type {String}
     **/
    get field() {
        return this._field;
    }

    /**
     * The splitter
     *
     * @type {?String}
     **/
    get splitter() {
        return this._splitter;
    }

    /**
     * The min date
     *
     * @type {?String}
     **/
    get minDate() {
        return this._min_date;
    }

    /**
     * The max date
     *
     * @type {?String}
     **/
    get maxDate() {
        return this._max_date;
    }

    /**
     * The format
     *
     * @type {String}
     **/
    get format() {
        return this._format;
    }

    /**
     * The order
     *
     * @type {Number}
     **/
    get order() {
        return this._order;
    }

    /**
     * The provider
     *
     * @type {String}
     **/
    get provider() {
        return this._provider;
    }
}

/**
 * Class representing a form filter config
 * @class
 */
export class FormFilterConfig {

    /**
     * Create a form filter config instance
     *
     * @param {Object} cfg - the lizmap config object for form filter
     */
    constructor(cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }

        this._layerIds = [];
        this._configs = [];

        for (const key in cfg) {
            const lConfig = new FormFilterElementConfig(cfg[key]);
            this._configs.push(lConfig);
        }

        this._configs.sort((a, b) => {
            return a.order - b.order;
        });
        this._layerIds = this._configs.map((v) => {
            return v.layerId;
        }).filter((v, i, a) => {
            return a.indexOf(v) === i;
        });
    }

    /**
     * The layer ids from config
     *
     * @type {String[]} the copy of the layer ids
     **/
    get layerIds() {
        return [...this._layerIds];
    }

    /**
     * The element configs from config
     *
     * @type {FormFilterElementConfig[]} the copy of the edition layer configs
     **/
    get elementConfigs() {
        return [...this._configs];
    }

    /**
     * Iterate through layer ids
     *
     * @generator
     * @yields {string} The next layer id
     **/
    *getLayerIds() {
        for (const id of this._layerIds) {
            yield id;
        }
    }

    /**
     * Iterate through layer configs
     *
     * @generator
     * @yields {FormFilterElementConfig} The next edition layer config
     **/
    *getElementConfigs() {
        for (const config of this._configs) {
            yield config;
        }
    }

    /**
     * Get element configs by layer id
     *
     * @param {String} id the layer id
     *
     * @returns {FormFilterElementConfig[]} The element configs associated to the layer id
     *
     * @throws {RangeError|Error} The layer name is unknown or the config has been corrupted
     **/
    getElementConfigsByLayerId(id) {
        const idx = this._layerIds.indexOf(id);
        if (idx == -1) {
            throw new RangeError('The layer id `'+ id +'` is unknown!');
        }

        const elements = this._configs.filter((v) => {
            return v.layerId === id;
        });

        return elements;
    }
}
