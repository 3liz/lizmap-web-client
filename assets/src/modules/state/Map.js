import { ValidationError } from './../Errors.js';
import EventDispatcher from './../../utils/EventDispatcher.js';
import { convertNumber, convertBoolean } from './../utils/Converters.js';
import { Extent } from './../utils/Extent.js';

const mapStateProperties = {
    projection: {type: 'string'},
    center: {type: 'array'},
    size: {type: 'array'},
    extent: {type: 'extent'},
    resolution: {type: 'number'},
    scaleDenominator: {type: 'number'},
    pointResolution: {type: 'number'},
    pointScaleDenominator: {type: 'number'},
};

export class MapState extends EventDispatcher {

    constructor() {
        super()
        // default values
        this._projection = 'EPSG:3857'
        this._center = [0, 0]
        this._size = [0, 0]
        this._extent = new Extent(0, 0, 0, 0)
        this._resolution = -1
        this._scaleDenominator = -1
        this._pointResolution = -1
        this._pointScaleDenominator = -1
    }


    /**
     * Update the map state
     *
     * @param {Object} evt - the map state changed object
     *
     **/
    update(evt) {
        let updatedProperties = {};
        for (const prop in mapStateProperties) {
            if (evt.hasOwnProperty(prop)) {
                // Get definition
                const def = mapStateProperties[prop];
                // save old value
                const oldValue = this['_'+prop];
                // convert value
                switch (def.type){
                    case 'boolean':
                        this['_'+prop] = convertBoolean(evt[prop]);
                        break;
                    case 'number':
                        this['_'+prop] = convertNumber(evt[prop]);
                        break;
                    case 'extent':
                        if (typeof(evt[prop]) == 'string'
                            || typeof(evt[prop]) == 'number'
                            || !(evt[prop] instanceof Array)) {
                            throw new ValidationError('The value for `'+prop+'` has to be an array!');
                        }
                        if (oldValue.length != evt[prop].length) {
                            throw new ValidationError('The length for `'+prop+'` is not expected! It has to be: '+oldValue.length);
                        }
                        this['_'+prop] = new Extent(...evt[prop]);
                        break;
                    case 'array':
                        if (typeof(evt[prop]) == 'string'
                            || typeof(evt[prop]) == 'number'
                            || !(evt[prop] instanceof Array)) {
                            throw new ValidationError('The value for `'+prop+'` has to be an array!');
                        }
                        this['_'+prop] = evt[prop];
                        break;
                    default:
                        this['_'+prop] = evt[prop];
                }
                // Check if the value has changed
                if (def.type == 'extent') {
                    if (!oldValue.equals([...this['_'+prop]])){
                        updatedProperties[prop] = evt[prop];
                    }
                } else if (def.type == 'array') {
                    if (oldValue.filter((v, i) => {return evt[prop][i] != v}).length != 0) {
                        updatedProperties[prop] = evt[prop];
                    }
                } else if (oldValue != this['_'+prop]) {
                    updatedProperties[prop] = evt[prop];
                }
            }
        }
        // Dispatch event only if something have changed
        if (Object.getOwnPropertyNames(updatedProperties).length != 0) {
            this.dispatch(
                Object.assign({
                    type: 'map.state.changed'
                }, updatedProperties)
            );
        }
    }

    /**
     * Map projection code
     *
     * @type {String}
     **/
    get projection() {
        return this._projection;
    }

    /**
     * Map center
     *
     * @type {Number[]}
     **/
    get center() {
        return this._center;
    }

    /**
     * Map size
     *
     * @type {Number[]}
     **/
    get size() {
        return this._size;
    }

    /**
     * Map extent (calculate by the map view)
     *
     * @type {Number[]}
     **/
    get extent() {
        return this._extent;
    }

    /**
     * Map resolution
     *
     * @type {Number}
     **/
    get resolution() {
        return this._resolution;
    }

    /**
     * Map scale denominator
     *
     * @type {Number}
     **/
    get scaleDenominator() {
        return this._scaleDenominator;
    }

    /**
     * Map resolution (calculate from the center)
     *
     * @type {Number}
     **/
    get pointResolution() {
        return this._pointResolution;
    }

    /**
     * Map scale denominator (calculate from the center)
     *
     * @type {Number}
     **/
    get pointScaleDenominator() {
        return this._pointScaleDenominator;
    }
}
