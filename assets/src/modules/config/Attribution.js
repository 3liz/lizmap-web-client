/**
 * @module config/Attribution.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 */

import { ValidationError } from './../Errors.js';
import { BaseObjectConfig } from './BaseObject.js';

const attributionProperties = {
    'title': { type: 'string' }
}

const optionalAttributionProperties = {
    'url': { type: 'string' }
}

/**
 * Class representing an attribution
 * @class AttributionConfig
 * @augments BaseObjectConfig
 */
export class AttributionConfig extends BaseObjectConfig {
    /**
     * Create an attribution instance based on a config object
     * @param {object} cfg       - the lizmap config object for attribution
     * @param {string} cfg.title - the attribution title
     * @param {?string} cfg.url   - the attribution url
     */
    constructor(cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }

        if (Object.getOwnPropertyNames(cfg).length == 0) {
            throw new ValidationError('The `options` in the config is empty!');
        }

        super(cfg, attributionProperties, optionalAttributionProperties)
    }

    /**
     * The attribution title
     * @type {string}
     */
    get title() {
        return this._title;
    }

    /**
     * The attribution url
     * @type {?string}
     */
    get url() {
        return this._url;
    }

}
