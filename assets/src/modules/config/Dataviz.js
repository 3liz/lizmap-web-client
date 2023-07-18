/**
 * @module utils/Dataviz.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 **/

import { BaseObjectConfig } from './BaseObject.js';
import { ValidationError } from './../Errors.js';

const optionRequiredProperties = {
    'location': {type: 'string'},
    'theme': {type: 'string'},
}

const optionOptionalProperties = {
}

/**
 * Class representing a dataviz options config
 * @class
 * @augments BaseObjectConfig
 */
export class DatavizOptionsConfig extends BaseObjectConfig {
    /**
     * Create a dataviz options config instance
     *
     * @param {Object} cfg - the lizmap config object for layer
     */
    constructor(cfg) {
        super(cfg, optionRequiredProperties, optionOptionalProperties)
    }

    /**
     * The location
     *
     * @type {String}
     **/
    get location() {
        return this._location;
    }

    /**
     * The theme
     *
     * @type {String}
     **/
    get theme() {
        return this._theme;
    }
}

const traceRequiredProperties = {
    'color': {type: 'string'},
    'colorfield': {type: 'string'},
    'y_field': {type: 'string'},
}

const traceOptionalProperties = {
    'z_field': {type: 'string'},
}

/**
 * Class representing a dataviz trace config
 * @class
 * @augments BaseObjectConfig
 */
export class DatavizTraceConfig extends BaseObjectConfig {
    /**
     * Create a dataviz trace config instance
     *
     * @param {Object} cfg - the lizmap config object for layer
     */
    constructor(cfg) {
        super(cfg, traceRequiredProperties, traceOptionalProperties)
    }

    /**
     * The color
     *
     * @type {String}
     **/
    get color() {
        return this._color;
    }

    /**
     * The color field
     *
     * @type {String}
     **/
    get colorField() {
        return this._colorfield;
    }

    /**
     * The y field
     *
     * @type {String}
     **/
    get yField() {
        return this._y_field;
    }

    /**
     * The x field
     *
     * @type {String}
     **/
    get zField() {
        return this._z_field;
    }
}

const plotRequiredProperties = {
    'type': {type: 'string'},
    'aggregation': {type: 'string'},
    'display_when_layer_visible': {type: 'boolean'},
    'stacked': {type: 'boolean'},
    'horizontal': {type: 'boolean'},
    'display_legend': {type: 'boolean'},
}

const plotOptionalProperties = {
    'x_field': {type: 'string'},
}

/**
 * Class representing a dataviz plot config
 * @class
 * @augments BaseObjectConfig
 */
export class DatavizPlotConfig extends BaseObjectConfig {
    /**
     * Create a dataviz plot config instance
     *
     * @param {Object} cfg - the lizmap config object for layer
     */
    constructor(cfg) {
        super(cfg, plotRequiredProperties, plotOptionalProperties)

        const prop = 'traces';
        if (!cfg.hasOwnProperty(prop)) {
            throw new ValidationError('No `' + prop + '` in the cfg object!');
        }
        this._traces = [];
        for (const traceCfg of cfg[prop]) {
            this._traces.push(new DatavizTraceConfig(traceCfg));
        }
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
     * The x field
     *
     * @type {String}
     **/
    get xField() {
        return this._x_field;
    }

    /**
     * The aggregation
     *
     * @type {String}
     **/
    get aggregation() {
        return this._aggregation;
    }

    /**
     * The traces
     *
     * @type {DatavizTraceConfig[]}
     **/
    get traces() {
        return this._traces;
    }

    /**
     * The stacked
     *
     * @type {Boolean}
     **/
    get stacked() {
        return this._stacked;
    }

    /**
     * The horizontal
     *
     * @type {Boolean}
     **/
    get horizontal() {
        return this._horizontal;
    }

    /**
     * The display legend
     *
     * @type {Boolean}
     **/
    get displayLegend() {
        return this._display_legend;
    }

    /**
     * The display when layer visible
     *
     * @type {Boolean}
     **/
    get displayWhenLayerVisible() {
        return this._display_when_layer_visible;
    }
}

const requiredProperties = {
    'plot_id': {type: 'number'},
    'layer_id': {type: 'string'},
    'title': {type: 'string'},
    'popup_display_child_plot': {type: 'boolean'},
    'only_show_child': {type: 'boolean'},
};

const optionalProperties = {
    'abstract': {type: 'string', default: ''},
};

/**
 * Class representing a dataviz element config
 * @class
 * @augments BaseObjectConfig
 */
export class DatavizElementConfig extends BaseObjectConfig {
    /**
     * Create a dataviz element config instance
     *
     * @param {Object} cfg - the lizmap config object for layer
     */
    constructor(cfg) {
        super(cfg, requiredProperties, optionalProperties)

        const prop = 'plot';
        if (!cfg.hasOwnProperty(prop)) {
            throw new ValidationError('No `' + prop + '` in the cfg object!');
        }
        this._plot = new DatavizPlotConfig(cfg[prop]);
    }

    /**
     * The plot id
     *
     * @type {Number}
     **/
    get plotId() {
        return this._plot_id;
    }

    /**
     * The layer id
     *
     * @type {String}
     **/
    get layerId() {
        return this._layer_id;
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
     * The title
     *
     * @type {String}
     **/
    get abstract() {
        return this._abstract;
    }

    /**
     * The plot
     *
     * @type {DatavizPlotConfig[]}
     **/
    get plot() {
        return this._plot;
    }

    /**
     * The popup display child plot
     *
     * @type {Boolean}
     **/
    get popupDisplayChildPlot() {
        return this._popup_display_child_plot;
    }

    /**
     * The only show child
     *
     * @type {Boolean}
     **/
    get onlyShowChild() {
        return this._only_show_child;
    }
}

/**
 * Class representing a dataviz layer config
 * @class
 */
export class DatavizLayersConfig {

    /**
     * Create a dataviz layers config instance
     *
     * @param {Object} cfg - the lizmap config object for layer
     */
    constructor(cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The cfg parameter is not an Object!');
        }

        this._layerIds = [];
        this._configs = [];

        for (const key in cfg) {
            const lConfig = new DatavizElementConfig(cfg[key]);
            this._configs.push(lConfig);
        }

        this._configs.sort((a, b) => {
            return a.plotId - b.plotId;
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
     * @yields {DatavizElementConfig} The next edition layer config
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
     * @returns {DatavizElementConfig[]} The element configs associated to the layer id
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
