import { BaseObjectConfig } from './Base.js';
import { ValidationError } from './../Errors.js';

const atlasRequiredProperties = {
    'enabled': {type: 'boolean'},
    'coverageLayer': {type: 'string'},
}

export class PrintAtlasConfig extends BaseObjectConfig {
    /**
     * @param {Object} cfg - the lizmap config object for layer
     */
    constructor(cfg) {
        super(cfg, atlasRequiredProperties, {})
    }

    /**
     * Atlas is enabled
     *
     * @type {Boolean}
     **/
    get enabled() {
        return this._enabled;
    }

    /**
     * The coverage layer id
     *
     * @type {String}
     **/
    get coverageLayerId() {
        return this._coverageLayer;
    }
}

const labelRequiredProperties = {
    'id': {type: 'string'},
    'htmlState': {type: 'boolean'},
    'text': {type: 'string'},
}

export class PrintLabelConfig extends BaseObjectConfig {
    /**
     * @param {Object} cfg - the lizmap config object for layer
     */
    constructor(cfg) {
        super(cfg, labelRequiredProperties, {})
    }

    /**
     * The id
     *
     * @type {String}
     **/
    get id() {
        return this._id;
    }

    /**
     * html state
     *
     * @type {Boolean}
     **/
    get htmlState() {
        return this._htmlState;
    }

    /**
     * The text
     *
     * @type {String}
     **/
    get text() {
        return this._text;
    }
}

const mapRequiredProperties = {
    'id': {type: 'string'},
    'uuid': {type: 'string'},
    'width': {type: 'number'},
    'height': {type: 'number'},
}

export class PrintMapConfig extends BaseObjectConfig {
    /**
     * @param {Object} cfg - the lizmap config object for layer
     */
    constructor(cfg) {
        super(cfg, mapRequiredProperties, {})
    }

    /**
     * The id
     *
     * @type {String}
     **/
    get id() {
        return this._id;
    }

    /**
     * The uuid
     *
     * @type {String}
     **/
    get uuid() {
        return this._uuid;
    }

    /**
     * The width
     *
     * @type {Number}
     **/
    get width() {
        return this._width;
    }

    /**
     * The height
     *
     * @type {Number}
     **/
    get height() {
        return this._height;
    }
}

const requiredProperties = {
    'title': {type: 'string'},
    'width': {type: 'number'},
    'height': {type: 'number'},
}

const optionalProperties = {
}

export class PrintTemplateConfig extends BaseObjectConfig {
    /**
     * @param {Object} cfg - the lizmap config object for layer
     */
    constructor(cfg) {
        super(cfg, requiredProperties, optionalProperties)

        this._maps = []
        if (cfg.hasOwnProperty('maps')) {
            for (const map of cfg['maps']) {
                this._maps.push(new PrintMapConfig(map))
            }
        }

        this._labels = []
        if (cfg.hasOwnProperty('labels')) {
            for (const label of cfg['labels']) {
                this._labels.push(new PrintLabelConfig(label))
            }
        }

        const prop = 'atlas';
        if (!cfg.hasOwnProperty(prop)) {
            throw new ValidationError('No `' + prop + '` in the cfg object!');
        }
        this._atlas = new PrintAtlasConfig(cfg[prop]);
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
     * The width
     *
     * @type {Number}
     **/
    get width() {
        return this._width;
    }

    /**
     * The height
     *
     * @type {Number}
     **/
    get height() {
        return this._height;
    }

    /**
     * The maps
     *
     * @type {PrintMapConfig[]} the copy of print maps
     **/
    get maps() {
        return [...this._maps];
    }

    /**
     * Iterate through print maps
     *
     * @generator
     * @yields {PrintMapConfig} The next print map
     **/
    *getMaps() {
        for (const map of this._maps) {
            yield map;
        }
    }

    /**
     * The labels
     *
     * @type {PrintLabelConfig[]} the copy of print labels
     **/
    get labels() {
        return [...this._labels];
    }

    /**
     * Iterate through print labels
     *
     * @generator
     * @yields {PrintLabelConfig} The next print label
     **/
    *getLabels() {
        for (const label of this._labels) {
            yield label;
        }
    }

    /**
     * The atlas
     *
     * @type {PrintAtlasConfig}
     **/
    get atlas() {
        return this._atlas;
    }
}
