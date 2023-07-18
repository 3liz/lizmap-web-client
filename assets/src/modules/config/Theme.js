/**
 * @module config/Theme.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 **/

import { BaseObjectConfig } from './BaseObject.js';
import { ValidationError } from './../Errors.js';

const layerThemeRequiredProperties = {
    'style': {type: 'sting'},
    'expanded': {type: 'boolean'},
}

const layerThemeOptionalProperties = {
}

/**
 * Class representing a layer in theme config
 * @class
 * @augments BaseObjectConfig
 */
export class LayerThemeConfig extends BaseObjectConfig {

    /**
     * Create a layer in theme config instance
     *
     * @param {Object} cfg - the lizmap config object for a layer in theme
     */
    constructor(layerId, cfg) {
        super(cfg, layerThemeRequiredProperties, layerThemeOptionalProperties)
        this._layerId = layerId;
    }

    /**
     * The layer Id
     *
     * @type {String}
     **/
    get layerId() {
        return this._layerId;
    }

    /**
     * The style name
     *
     * @type {String}
     **/
    get style() {
        return this._style;
    }

    /**
     * Expanded
     *
     * @type {Boolean}
     **/
    get expanded() {
        return this._expanded;
    }
}

const themeRequiredProperties = {
    'layers': {type: 'object'},
    'expandedGroupNode': {type: 'array'},
}

const themeOptionalProperties = {
}

/**
 * Class representing a theme config
 * @class
 * @augments BaseObjectConfig
 */
export class ThemeConfig extends BaseObjectConfig {

    /**
     * Create a theme config instance
     *
     * @param {Object} cfg - the lizmap config object for a theme
     */
    constructor(name, cfg) {
        super(cfg, themeRequiredProperties, themeOptionalProperties)
        this._name = name;

        this._layerIds = [];
        this._layerConfigs = [];

        for (const key in this._layers) {
            const ltConfig = new LayerThemeConfig(key, this._layers[key]);
            this._layerIds.push(ltConfig.layerId);
            this._layerConfigs.push(ltConfig);
        }
    }

    /**
     * The theme name
     *
     * @type {String}
     **/
    get name() {
        return this._name;
    }

    /**
     * The layer ids of the theme
     *
     * @type {String[]} the copy of the layer ids of the theme
     **/
    get layerIds() {
        return [...this._layerIds];
    }

    /**
     * The layer configs of the theme
     *
     * @type {LayerThemeConfig[]} the copy of the layer configs of the theme
     **/
    get layerConfigs() {
        return [...this._layerConfigs];
    }

    /**
     * The expanded group nodes list
     *
     * @type {String[]} the copy of the expanded group nodes list
     **/
    get expandedGroupNodes() {
        return [...this._expandedGroupNode];
    }

    /**
     * Iterate through layer ids of the theme
     *
     * @generator
     * @yields {string} The next layer id of the theme
     **/
    *getLayerIds() {
        for (const id of this._layerIds) {
            yield id;
        }
    }

    /**
     * Iterate through layer configs of the theme
     *
     * @generator
     * @yields {LayerThemeConfig} The next layer config of the theme
     **/
    *getLayerConfigs() {
        for (const config of this._layerConfigs) {
            yield config;
        }
    }

    /**
     * Iterate through the expanded group nodes list
     *
     * @generator
     * @yields {string} The next expanded group node
     **/
    *getExpandedGroupNodes() {
        for (const node of this._expandedGroupNode) {
            yield node;
        }
    }

    /**
     * Get a layer config of the theme by layer id
     *
     * @param {String} layerId the layer id
     *
     * @returns {LayerThemeConfig} The layer config of the theme
     *
     * @throws {RangeError|Error} The layer id is unknown or the config has been corrupted
     **/
    getLayerConfigByLayerId(layerId) {
        const idx = this._layerIds.indexOf(layerId);
        if (idx == -1) {
            throw new RangeError('The theme name `'+ layerId +'` is unknown!');
        }

        const cfg = this._layerConfigs[idx];
        if (cfg.layerId != layerId) {
            throw 'The config has been corrupted!'
        }

        return cfg;
    }
}

/**
 * Class representing themes config
 * @class
 */
export class ThemesConfig {

    /**
     * Create themes config instance
     *
     * @param {Object} cfg - the lizmap config object for layer
     */
    constructor(cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }

        this._names = [];
        this._configs = [];

        for (const key in cfg) {
            const tConfig = new ThemeConfig(key, cfg[key]);
            this._names.push(tConfig.name);
            this._configs.push(tConfig);
        }
    }

    /**
     * The theme names from config
     *
     * @type {String[]} the copy of the theme names
     **/
    get themeNames() {
        return [...this._names];
    }

    /**
     * The theme configs from config
     *
     * @type {ThemeConfig[]} the copy of the theme configs
     **/
    get themeConfigs() {
        return [...this._configs];
    }

    /**
     * Iterate through theme names
     *
     * @generator
     * @yields {string} The next theme name
     **/
    *getThemeNames() {
        for (const name of this._names) {
            yield name;
        }
    }

    /**
     * Iterate through theme configs
     *
     * @generator
     * @yields {ThemeConfig} The next theme config
     **/
    *getThemeConfigs() {
        for (const config of this._configs) {
            yield config;
        }
    }

    /**
     * Get a theme config by theme name
     *
     * @param {String} name the theme name
     *
     * @returns {LayerConfig} The theme config associated to the name
     *
     * @throws {RangeError|Error} The theme name is unknown or the config has been corrupted
     **/
    getThemeConfigByThemeName(name) {
        const idx = this._names.indexOf(name);
        if (idx == -1) {
            throw new RangeError('The theme name `'+ name +'` is unknown!');
        }

        const cfg = this._configs[idx];
        if (cfg.name != name) {
            throw 'The config has been corrupted!'
        }

        return cfg;
    }
}
