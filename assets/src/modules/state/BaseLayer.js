import EventDispatcher from './../../utils/EventDispatcher.js';
import { BaseLayerTypes } from './../config/BaseLayer.js';
import { MapLayerLoadStatus } from './MapLayer.js';

/**
 * Class representing a base layer state
 * @class
 */
export class BaseLayerState extends EventDispatcher {
    /**
     * Create a base layer state based on the base layer config
     *
     * @param {BaseLayersConfig}                                  baseLayersCfg - the lizmap config object for base layer
     * @param {LayerVectorState|LayerRasterState|LayerGroupState} [itemState]   - the lizmap layer item state of the base layer if exists
     */
    constructor(baseLayerCfg, itemState = null ) {
        if (itemState !== null && baseLayerCfg.name !== itemState.name) {
            throw new TypeError('Base layer config and layer item sate have not the same name!\n- `'+baseLayerCfg.name+'` for base layer config\n- `'+itemState.name+'` for layer item state');
        }
        super()
        this._baseLayerConfig = baseLayerCfg;
        this._itemState = itemState;
        this._loadStatus = MapLayerLoadStatus.Undefined;
    }

    /**
     * The base layer type
     *
     * @type {String}
     **/
    get type() {
        return this._baseLayerConfig.type;
    }

    /**
     * The base layer name
     *
     * @type {String}
     **/
    get name() {
        return this._baseLayerConfig.name;
    }

    /**
     * The base layer title
     *
     * @type {String}
     **/
    get title() {
        return this._baseLayerConfig.title;
    }

    /**
     * The base layer key is defined
     *
     * @type {boolean}
     **/
    get hasKey() {
        return this._baseLayerConfig.hasKey;
    }

    /**
     * The base layer key
     *
     * @type {?String}
     **/
    get key() {
        return this._baseLayerConfig.key;
    }

    /**
     * Attribution is defined
     *
     * @type {Boolean}
     **/
    get hasAttribution() {
        return this._baseLayerConfig.hasAttribution;
    }
    /**
     * Attribution
     *
     * @type {?AttributionConfig}
     **/
    get attribution() {
        return this._baseLayerConfig.attribution;
    }

    /**
     * A Lizmap layer config is associated with this base layer
     *
     * @type {Boolean}
     **/
    get hasLayerConfig() {
        return this._baseLayerConfig.hasLayerConfig;
    }
    /**
     * The Lizmap layer config associated with this base layer
     *
     * @type {?LayerConfig}
     **/
    get layerConfig() {
        return this._baseLayerConfig.layerConfig;
    }

    /**
     * A Lizmap layer item state is associated with this base layer
     *
     * @type {Boolean}
     **/
    get hasItemState() {
        return this._itemState !== null;
    }
    /**
     * The Lizmap layer item state associated with this base layer
     *
     * @type {?LayerVectorState|LayerRasterState|LayerGroupState}
     **/
    get itemState() {
        return this._itemState;
    }

    /**
     * The layer load status
     * @see MapLayerLoadStatus
     *
     * @type {String}
     **/
    get loadStatus() {
        return this._loadStatus;
    }


    /**
     * Set layer load status
     * @see MapLayerLoadStatus
     *
     * @param {String} status - Expected values provided by the map layer load status enum
     **/
    set loadStatus(status) {
        const statusKeys = Object.keys(MapLayerLoadStatus).filter(key => MapLayerLoadStatus[key] === status);
        if (statusKeys.length != 1) {
            throw new TypeError('Unkonw status: `'+status+'`!');
        }

        // No changes
        if (this._loadStatus == status) {
            return;
        }
        // Set new value
        this._loadStatus = status;

        this.dispatch({
            type: 'layer.load.status.changed',
            name: this.name,
            loadStatus: this.loadStatus,
        })
    }
}

/**
 * Class representing an empty base layer state
 * @class
 * @augments BaseLayerState
 */
export class EmptyBaseLayerState extends BaseLayerState {
    /**
     * Create a base layers empty state based on the empty base layer config
     *
     * @param {EmptyBaseLayersConfig} baseLayersCfg - the lizmap empty base layer config object
     * @param {LayerGroupState}       [itemState]   - the lizmap empty layer group state
     */
    constructor(baseLayerCfg, itemState = null ) {
        if (baseLayerCfg.type !== BaseLayerTypes.Empty) {
            throw new TypeError('Not an `' + BaseLayerTypes.Empty + '` base layer config. Get `' + baseLayerCfg.type + '` type for `' + baseLayerCfg.name + '` base layer!');
        }
        super(baseLayerCfg, itemState)
    }
}

/**
 * Class representing an xyz base layer state
 * @class
 * @augments BaseLayerState
 */
export class XyzBaseLayerState extends BaseLayerState {
    /**
     * Create a base layers xyz state based on the xyz base layer config
     *
     * @param {EmptyBaseLayersConfig} baseLayersCfg - the lizmap xyz base layer config object
     * @param {LayerRasterState}      [itemState]   - the lizmap xyz layer layer state
     */
    constructor(baseLayerCfg, itemState = null ) {
        if (baseLayerCfg.type !== BaseLayerTypes.XYZ) {
            throw new TypeError('Not an `' + BaseLayerTypes.XYZ + '` base layer config. Get `' + baseLayerCfg.type + '` type for `' + baseLayerCfg.name + '` base layer!');
        }
        super(baseLayerCfg, itemState)
    }

    /**
     * The base layer url
     *
     * @type {String}
     **/
    get url() {
        return this._baseLayerConfig.url;
    }

    /**
     * The base layer zmin
     *
     * @type {Number}
     **/
    get zmin() {
        return this._baseLayerConfig.zmin;
    }

    /**
     * The base layer zmax
     *
     * @type {Number}
     **/
    get zmax() {
        return this._baseLayerConfig.zmax;
    }

    /**
     * The base layer crs
     *
     * @type {String}
     **/
    get crs() {
        return this._baseLayerConfig.crs;
    }
}

/**
 * Class representing an bing base layer state
 * @class
 * @augments BaseLayerState
 */
export class BingBaseLayerState extends BaseLayerState {
    /**
     * Create a base layers bing state based on the bing base layer config
     *
     * @param {EmptyBaseLayersConfig} baseLayersCfg - the lizmap bing base layer config object
     * @param {LayerRasterState}      [itemState]   - the lizmap bing layer layer state
     */
    constructor(baseLayerCfg, itemState = null ) {
        if (baseLayerCfg.type !== BaseLayerTypes.Bing) {
            throw new TypeError('Not an `' + BaseLayerTypes.Bing + '` base layer config. Get `' + baseLayerCfg.type + '` type for `' + baseLayerCfg.name + '` base layer!');
        }
        super(baseLayerCfg, itemState)
    }

    /**
     * The bing imagerySet
     *
     * @type {String}
     **/
    get imagerySet() {
        return this._baseLayerConfig.imagerySet;
    }
}

/**
 * Class representing an WMTS base layer state
 * @class
 * @augments BaseLayerState
 */
export class WmtsBaseLayerState extends BaseLayerState {
    /**
     * Create a base layers WMTS state based on the WMTS base layer config
     *
     * @param {EmptyBaseLayersConfig} baseLayersCfg - the lizmap WMTS base layer config object
     * @param {LayerRasterState}      [itemState]   - the lizmap WMTS layer layer state
     */
    constructor(baseLayerCfg, itemState = null ) {
        if (baseLayerCfg.type !== BaseLayerTypes.WMTS) {
            throw new TypeError('Not an `' + BaseLayerTypes.WMTS + '` base layer config. Get `' + baseLayerCfg.type + '` type for `' + baseLayerCfg.name + '` base layer!');
        }
        super(baseLayerCfg, itemState)
    }

    /**
     * The base layer url
     *
     * @type {String}
     **/
    get url() {
        return this._baseLayerConfig.url;
    }

    /**
     * The base layer wmts layer
     *
     * @type {String}
     **/
    get layer() {
        return this._baseLayerConfig.layer;
    }

    /**
     * The base layer wmts format
     *
     * @type {String}
     **/
    get format() {
        return this._baseLayerConfig.format;
    }

    /**
     * The base layer wmts style
     *
     * @type {String}
     **/
    get style() {
        return this._baseLayerConfig.style;
    }

    /**
     * The base layer matrixSet
     *
     * @type {String}
     **/
    get matrixSet() {
        return this._baseLayerConfig.matrixSet;
    }

    /**
     * The base layer crs
     *
     * @type {String}
     **/
    get crs() {
        return this._baseLayerConfig.crs;
    }

    /**
     * The base layer numZoomLevels
     *
     * @type {Number}
     **/
    get numZoomLevels() {
        return this._baseLayerConfig.numZoomLevels;
    }
}

/**
 * Class representing an WMS base layer state
 * @class
 * @augments BaseLayerState
 */
export class WmsBaseLayerState extends BaseLayerState {
    /**
     * Create a base layers WMS state based on the WMS base layer config
     *
     * @param {EmptyBaseLayersConfig} baseLayersCfg - the lizmap WMS base layer config object
     * @param {LayerRasterState}      [itemState]   - the lizmap WMS layer layer state
     */
    constructor(baseLayerCfg, itemState = null ) {
        if (baseLayerCfg.type !== BaseLayerTypes.WMS) {
            throw new TypeError('Not an `' + BaseLayerTypes.WMS + '` base layer config. Get `' + baseLayerCfg.type + '` type for `' + baseLayerCfg.name + '` base layer!');
        }
        super(baseLayerCfg, itemState)
    }

    /**
     * The base layer url
     *
     * @type {String}
     **/
    get url() {
        return this._baseLayerConfig.url;
    }

    /**
     * The base layer wms layer
     *
     * @type {String}
     **/
    get layers() {
        return this._baseLayerConfig.layers;
    }

    /**
     * The base layer wms format
     *
     * @type {String}
     **/
    get format() {
        return this._baseLayerConfig.format;
    }

    /**
     * The base layer wms style
     *
     * @type {String}
     **/
    get styles() {
        return this._baseLayerConfig.styles;
    }

    /**
     * The base layer crs
     *
     * @type {String}
     **/
    get crs() {
        return this._baseLayerConfig.crs;
    }
}

/**
 * Class representing a base layers state
 * @class
 */
export class BaseLayersState extends EventDispatcher {

    /**
     * Create a base layers state based on the base layers config
     *
     * @param {BaseLayersConfig}          baseLayersCfg - the lizmap config object for base layers
     * @param {LayersAndGroupsCollection} lgCollection  - the collection of layers and groups state
     */
    constructor(baseLayersCfg, lgCollection) {
        super()

        //this._baseLayersMap = new Map(baseLayersCfg.baseLayerConfigs.map(l => [l.name, l]));
        this._baseLayersMap = new Map()
        for (const blConfig of baseLayersCfg.getBaseLayerConfigs()) {
            let itemState = null;
            if (blConfig.hasLayerConfig) {
                itemState = lgCollection.getLayerOrGroupByName(blConfig.name);
            }
            switch(blConfig.type) {
                case BaseLayerTypes.Empty:
                    this._baseLayersMap.set(blConfig.name, new EmptyBaseLayerState(blConfig, itemState));
                    break;
                case BaseLayerTypes.XYZ:
                    this._baseLayersMap.set(blConfig.name, new XyzBaseLayerState(blConfig, itemState));
                    break;
                case BaseLayerTypes.Bing:
                    this._baseLayersMap.set(blConfig.name, new BingBaseLayerState(blConfig, itemState));
                    break;
                case BaseLayerTypes.WMTS:
                    this._baseLayersMap.set(blConfig.name, new WmtsBaseLayerState(blConfig, itemState));
                    break;
                case BaseLayerTypes.WMS:
                    this._baseLayersMap.set(blConfig.name, new WmsBaseLayerState(blConfig, itemState));
                    break;
                default:
                    this._baseLayersMap.set(blConfig.name, new BaseLayerState(blConfig, itemState));
                    break;
            }
        }
        this._selectedBaseLayerName = baseLayersCfg.startupBaselayerName;
    }

    /**
     * Selected base layer name
     *
     * @type {String}
     **/
    get selectedBaseLayerName() {
        return this._selectedBaseLayerName;
    }

    /**
     * Set elected base layer name
     *
     * @param {String} name
     *
     * @throws {RangeError} When the base layer name is unknown!
     **/
    set selectedBaseLayerName(name) {
        if (this._selectedBaseLayerName === name) {
            return;
        }
        if (this._baseLayersMap.get(name) === undefined) {
            throw new RangeError('The base layer name `'+ name +'` is unknown!');
        }
        this._selectedBaseLayerName = name;
        this.dispatch({
            type: 'baselayers.selection.changed',
            name: this.selectedBaseLayerName
        });
    }

    /**
     * Selected base layer config
     *
     * @type {BaseLayerState}
     **/
    get selectedBaseLayer() {
        return this._baseLayersMap.get(this._selectedBaseLayerName);
    }

    /**
     * Base layer names
     *
     * @type {String[]}
     **/
    get baseLayerNames() {
        return [...this._baseLayersMap.keys()];
    }

    /**
     * Base layer configs
     *
     * @type {BaseLayerState[]}
     **/
    get baseLayers() {
        return [...this._baseLayersMap.values()];
    }

    /**
     * Get a base layer config by base layer name
     *
     * @param {String} name - the base layer name
     *
     * @returns {BaseLayerState} The base layer config associated to the name
     *
     * @throws {RangeError} The base layer name is unknown
     **/
    getBaseLayerByName(name) {
        const layer = this._baseLayersMap.get(name);
        if (layer !== undefined) {
            if (layer.name !== name) {
                throw 'The base layers state has been corrupted!'
            }
            return layer;
        }
        throw new RangeError('The base layer name `'+ name +'` is unknown!');
    }

    /**
     * Iterate through base layer names
     *
     * @generator
     * @yields {String} The next base layer name
     **/
    *getBaseLayerNames() {
        for (const name of this._baseLayersMap.keys()) {
            yield name;
        }
    }

    /**
     * Iterate through base layer configs
     *
     * @generator
     * @yields {BaseLayerState} The next base layer config
     **/
    *getBaseLayers() {
        for (const layer of this._baseLayersMap.values()) {
            yield layer;
        }
    }
}
