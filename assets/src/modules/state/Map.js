import { ValidationError } from './../Errors.js';
import { convertNumber, convertBoolean } from './../utils/Converters.js';
import { Extent } from './../utils/Extent.js';

const mapStateProperties = {
    projection: {type: 'string'},
    center: {type: 'array'},
    resolution: {type: 'number'},
    size: {type: 'array'},
    extent: {type: 'extent'},
    scaleDenominator: {type: 'number'},
};

export class MapState {

    constructor() {
        // default values
        this._projection = 'EPSG:3857'
        this._center = [0, 0]
        this._resolution = -1
        this._size = [0, 0]
        this._extent = new Extent(0, 0, 0, 0)
        this._scaleDenominator = -1
    }


    /**
     * Update the map state
     *
     * @param {Object} evt - the map state changed object
     *
     **/
    update(evt) {
        //console.log(evt);
        for (const prop in mapStateProperties) {
            const def = mapStateProperties[prop];
            if (evt.hasOwnProperty(prop)) {
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
            }
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
     * Map resolution (calculate from the center)
     *
     * @type {Number}
     **/
    get resolution() {
        return this._resolution;
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
     * Map scale denominator (calculate from the center)
     *
     * @type {Number}
     **/
    get scaleDenominator() {
        return this._scaleDenominator;
    }
}
