/**
 * @module config/BaseObject.js
 * @name BaseObject
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { convertNumber, convertBoolean, convertArray } from './../utils/Converters.js';
import { Extent } from './../utils/Extent.js';
import { getNotContains } from './Tools.js';
import { ValidationError, ConversionError } from './../Errors.js';

/**
 * The function to update an instance based on required and optional properties description
 * The values of each properties defined in requiredProperties and optionalProperties will be converted to is type:
 * boolean, number, extent; and will be stored in an _{name} attribute
 * This will help to get values respecting the type defined in getter and to validate the config
 * @param {object} obj                  - the instance on which apply the config
 * @param {object} cfg                  - the lizmap config object
 * @param {object} [requiredProperties] - the required properties definition
 * @param {object} [optionalProperties] - the optional properties definition
 * @returns {object} - The instance updated
 * @throws {ValidationError} for required properties
 * @throws {ConversionError} for values
 */
export function applyConfig(obj, cfg, requiredProperties={}, optionalProperties={}) {
    if (!cfg || typeof cfg !== "object") {
        throw new ValidationError('The cfg parameter is not an Object!');
    }

    const cfgOwnPropertyNames = Object.getOwnPropertyNames(cfg);
    const requiredOwnPropertyNames = Object.getOwnPropertyNames(requiredProperties);
    if (cfgOwnPropertyNames.length < requiredOwnPropertyNames.length) {
        let errorMsg = 'The cfg object has not enough properties compared to required!';
        errorMsg += '\n- The cfg properties: '+cfgOwnPropertyNames;
        errorMsg += '\n- The required properties: '+requiredOwnPropertyNames;
        throw new ValidationError(errorMsg);
    }

    const requiredNotContainsInCfg = getNotContains(requiredOwnPropertyNames, cfgOwnPropertyNames);
    if (requiredNotContainsInCfg.length > 0) {
        throw new ValidationError('The properties: `' + requiredNotContainsInCfg + '` are required in the cfg object!');
    }

    for (const prop in requiredProperties) {
        if (!cfg.hasOwnProperty(prop)) {
            throw new ValidationError('No `' + prop + '` in the cfg object!');
        }
        const def = requiredProperties[prop];
        switch (def.type){
            case 'boolean':
                obj['_'+prop] = convertBoolean(cfg[prop]);
                break;
            case 'number':
                obj['_'+prop] = convertNumber(cfg[prop]);
                break;
            case 'array':
                obj['_'+prop] = convertArray(cfg[prop], def.contentType);
                break;
            case 'extent':
                obj['_'+prop] = new Extent(...cfg[prop]);
                break;
            default:
                obj['_'+prop] = cfg[prop];
        }
    }

    for (const prop in optionalProperties) {
        const def = optionalProperties[prop];
        if (cfg.hasOwnProperty(prop)) {
            // keep null value for nullable property
            if (def.hasOwnProperty('nullable') &&
                def['nullable'] &&
                cfg[prop] === null) {
                obj['_'+prop] = null;
                continue;
            }
            // convert value
            switch (def.type){
                case 'boolean':
                    obj['_'+prop] = convertBoolean(cfg[prop]);
                    break;
                case 'number':
                    obj['_'+prop] = convertNumber(cfg[prop]);
                    break;
                case 'extent':
                    obj['_'+prop] = new Extent(...cfg[prop]);
                    break;
                default:
                    obj['_'+prop] = cfg[prop];
            }
        } else if (def.hasOwnProperty('default')) {
            obj['_'+prop] = def.default;
        } else {
            obj['_'+prop] = null;
        }
    }
    return obj;
}

/**
 * Class representing a base object config
 * @class
 */
export class BaseObjectConfig {
    /**
     * The generic constructor to build an instance based on required and optional properties description
     * The values of each properties defined in requiredProperties and optionalProperties will be converted to is type:
     * boolean, number, extent ; and will be stored in an _{name} attribute
     * This will help to get values respecting the type defined in getter and to validate the config
     * @param {object} cfg                     - the lizmap config object
     * @param {object} [requiredProperties] - the required properties definition
     * @param {object} [optionalProperties] - the optional properties definition
     */
    constructor(cfg, requiredProperties={}, optionalProperties={}) {
        applyConfig(this, cfg, requiredProperties, optionalProperties);
    }
}

/**
 * Class representing an object layer config with layerId and order attribute
 * @name BaseObjectLayerConfig
 * @class
 * @augments BaseObjectConfig
 */
export class BaseObjectLayerConfig extends BaseObjectConfig {
    /**
     * Constructor to instantiate a layer config
     * @param {string} layerName                                          - the layer name
     * @param {object} cfg                                                - the lizmap config object
     * @param {string} cfg.layerId                                        - the layer id
     * @param {number} [cfg.order]                                        - the layer order
     * @param {object} [requiredProperties] - the required properties definition
     * @param {object} [optionalProperties]   - the optional properties definition
     */
    constructor(layerName, cfg, requiredProperties={'layerId': {type: 'string'}}, optionalProperties={'order': {type: 'number'}}) {
        if (!layerName) {
            throw new ValidationError('The layerName parameter is mandatory!');
        }
        if (!requiredProperties.hasOwnProperty('layerId')) {
            requiredProperties['layerId'] = {type: 'string'};
        }
        if (!optionalProperties.hasOwnProperty('order')) {
            optionalProperties['order'] = {type: 'number'};
        }
        super(cfg, requiredProperties, optionalProperties)
        this._layerName = layerName;
    }

    /**
     * The layer id
     * @type {string}
     */
    get id() {
        return this._layerId;
    }

    /**
     * The layer name
     * @type {string}
     */
    get name() {
        return this._layerName;
    }

    /**
     * The layer config order in the list
     * @type {number}
     */
    get order() {
        if (this._order == undefined || this._order == null) {
            return -1;
        }
        return this._order;
    }
}

/**
 * Class representing an object with layer configs with layerId and order attribute
 * @class
 */
export class BaseObjectLayersConfig {

    /**
     * Constructor to instantiate a layers config
     * @param {Function} layerConfig - the class name to construct instances contain in cfg
     * @param {object}   cfg         - the lizmap layers config object
     */
    constructor(layerConfig, cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }

        this._names = [];
        this._ids = [];
        this._configs = [];

        for (const key in cfg) {
            const lConfig = new layerConfig(key, cfg[key]);
            this._configs.push(lConfig);
        }

        this._configs.sort((a, b) => {
            return a.order - b.order;
        });
        this._ids = this._configs.map((v) => {
            return v.id;
        });
        this._names = this._configs.map((v) => {
            return v.name;
        });
    }

    /**
     * The copy of the layer names
     * @type {string[]}
     */
    get layerNames() {
        return [...this._names];
    }

    /**
     * The copy of the layer ids
     * @type {string[]}
     */
    get layerIds() {
        return [...this._ids];
    }

    /**
     * The copy of the base layer configs or extended class
     * @type {BaseObjectLayerConfig[]}
     */
    get layerConfigs() {
        return [...this._configs];
    }

    /**
     * Iterate through layer names
     * @generator
     * @yields {string} The next layer name
     */
    *getLayerNames() {
        for (const name of this._names) {
            yield name;
        }
    }

    /**
     * Iterate through layer ids
     * @generator
     * @yields {string} The next layer id
     */
    *getLayerIds() {
        for (const id of this._ids) {
            yield id;
        }
    }

    /**
     * Iterate through layer configs
     * @generator
     * @yields {BaseObjectLayerConfig} The next layer config or extended class
     */
    *getLayerConfigs() {
        for (const config of this._configs) {
            yield config;
        }
    }

    /**
     * Get a layer config or extended class by layer name
     * @param {string} name the layer name
     * @returns {BaseObjectLayerConfig} The base layer config or extended class associated to the name
     * @throws {RangeError|Error} The layer name is unknown or the config has been corrupted
     */
    getLayerConfigByLayerName(name) {
        const idx = this._names.indexOf(name);
        if (idx == -1) {
            throw new RangeError('The layer name `'+ name +'` is unknown!');
        }

        const cfg = this._configs[idx];
        if (cfg.name != name) {
            throw 'The config has been corrupted!'
        }

        return cfg;
    }

    /**
     * Get a layer config or extended class by layer id
     * @param {string} id the layer id
     * @returns {BaseObjectLayerConfig} The base layer config or extended class associated to the id
     * @throws {RangeError|Error} The layer name is unknown or the config has been corrupted
     */
    getLayerConfigByLayerId(id) {
        const idx = this._ids.indexOf(id);
        if (idx == -1) {
            throw new RangeError('The layer id `'+ id +'` is unknown!');
        }

        const cfg = this._configs[idx];
        if (cfg.id != id) {
            throw 'The config has been corrupted!'
        }

        return cfg;
    }
}
