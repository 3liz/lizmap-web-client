import EventDispatcher from './../../utils/EventDispatcher.js';

/**
 * Class representing a base layers state
 * @class
 */
export class BaseLayersState extends EventDispatcher {

    /**
     * Create a base layers state based on the base layers config
     *
     * @param {BaseLayersConfig} baseLayersCfg - the lizmap config object for base layers
     */
    constructor(baseLayersCfg) {
        super()

        this._baseLayersMap = new Map(baseLayersCfg.baseLayerConfigs.map(l => [l.name, l]));
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
     * @type {BaseLayerConfig}
     **/
    get selectedBaseLayerConfig() {
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
     * @type {BaseLayerConfig[]}
     **/
    get baseLayerConfigs() {
        return [...this._baseLayersMap.values()];
    }

    /**
     * Get a base layer config by base layer name
     *
     * @param {String} name - the base layer name
     *
     * @returns {BaseLayerConfig} The base layer config associated to the name
     *
     * @throws {RangeError} The base layer name is unknown
     **/
    getBaseLayerConfigByName(name) {
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
     * @yields {BaseLayerConfig} The next base layer config
     **/
    *getBaseLayerConfigs() {
        for (const layer of this._baseLayersMap.values()) {
            yield layer;
        }
    }
}
