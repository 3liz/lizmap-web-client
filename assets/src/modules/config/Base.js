import { convertNumber, convertBoolean, getNotContains, Extent } from './Tools.js';
import { ValidationError } from './../Errors.js';

export class BaseObjectConfig {
    /**
     * @param {Object} cfg                - the lizmap config object
     * @param {Object} requiredProperties - the required properties definition
     * @param {Object} optionalProperties - the optional properties definition
     */
    constructor(cfg, requiredProperties={}, optionalProperties={}) {
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
                    this['_'+prop] = convertBoolean(cfg[prop]);
                    break;
                case 'number':
                    this['_'+prop] = convertNumber(cfg[prop]);
                    break;
                case 'extent':
                    this['_'+prop] = new Extent(...cfg[prop]);
                    break;
                default:
                    this['_'+prop] = cfg[prop];
            }
        }

        for (const prop in optionalProperties) {
            const def = optionalProperties[prop];
            if (cfg.hasOwnProperty(prop)) {
                // keep null value for nullable property
                if (def.hasOwnProperty('nullable') &&
                    def['nullable'] &&
                    cfg[prop] === null) {
                    this['_'+prop] = null;
                    continue;
                }
                // convert value
                switch (def.type){
                    case 'boolean':
                        this['_'+prop] = convertBoolean(cfg[prop]);
                        break;
                    case 'number':
                        this['_'+prop] = convertNumber(cfg[prop]);
                        break;
                    case 'extent':
                        this['_'+prop] = new Extent(...cfg[prop]);
                        break;
                    default:
                        this['_'+prop] = cfg[prop];
                }
            } else if (def.hasOwnProperty('default')) {
                this['_'+prop] = def.default;
            } else {
                this['_'+prop] = null;
            }
        }

    }
}
