import { BaseLayerConfig, BaseLayersConfig } from './Base.js';

const requiredProperties = {
    'layerId': {type: 'string'},
    'fieldName': {type: 'string'},
    'minLength': {type: 'number'},
    'displayGeom': {type: 'boolean'},
    'filterOnLocate': {type: 'boolean'},
    'order': {type: 'number'}
};

const optionalProperties = {
    'fieldAlias': {type: 'string', default: ''},
};

export class LocateLayerConfig extends BaseLayerConfig {
    /**
     * @param {String} layerName - the layer name
     * @param {Object} cfg - the lizmap config object for tooltip layer
     */
    constructor(layerName, cfg) {
        super(layerName, cfg, requiredProperties, optionalProperties)
    }

    /**
     * The field name used to identify feature to locate
     *
     * @type {String}
     **/
    get fieldName() {
        return this._fieldName;
    }

    /**
     * The field alias used to identify feature to locate
     *
     * @type {String}
     **/
    get fieldAlias() {
        return this._fieldAlias;
    }

    /**
     * The minimum number of input letters to display list
     *
     * @type {Number}
     **/
    get minLength() {
        return this._minLength;
    }

    /**
     * Display the geometry on locate
     *
     * @type {Boolean}
     **/
    get displayGeom() {
        return this._displayGeom;
    }

    /**
     * Filter the layer on locate
     *
     * @type {Boolean}
     **/
    get filterOnLocate() {
        return this._filterOnLocate;
    }
}

export class LocateByLayerConfig  extends BaseLayersConfig {

    /**
     * @param {Object} cfg - the lizmap tooltipLayers config object
     */
    constructor(cfg) {
        super(LocateLayerConfig, cfg)
    }
}
