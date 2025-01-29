/**
 * @module modules/utils/Extent.js
 * @name Extent
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { ValidationError, ConversionError } from './../Errors.js';
import { convertNumber } from './Converters.js';

/**
 * Class representing an extent
 * @class
 * @augments Array
 */
export class Extent extends Array {

    /**
     * Create an extent
     * @param {...(number|string)} args - the 4 values describing the extent
     * @throws {ValidationError} for number of args different of 4
     * @throws {ConversionError} for values not number
     */
    constructor(...args) {
        if (args.length < 4) {
            throw new ValidationError('Not enough arguments for Extent constructor!');
        } else if (args.length > 4) {
            throw new ValidationError('Too many arguments for Extent constructor!');
        }
        let values = [];
        for (const val of args) {
            values.push(convertNumber(val));
        }
        super(...values);
    }

    /**
     * Get the x minimum value
     * @type {number}
     */
    get xmin() {
        return this[0];
    }

    /**
     * Get the y minimum value
     * @type {number}
     */
    get ymin() {
        return this[1];
    }

    /**
     * Get the x maximum value
     * @type {number}
     */
    get xmax() {
        return this[2];
    }

    /**
     * Get the y maximum value
     * @type {number}
     */
    get ymax() {
        return this[3];
    }

    /**
     * Get the center of the extent
     * @type {number[]}
     */
    get center() {
        return [
            this.xmin + (this.xmax-this.xmin)/2,
            this.ymin + (this.ymax-this.ymin)/2
        ];
    }

    /**
     * Checks equality with an other extent or array
     * @param {Extent|Array} anOther - An other extent or array with 4 values
     * @returns {boolean} the other extent or array as the same values
     */
    equals(anOther) {
        return ( anOther instanceof Array
            && anOther.length == 4
            && anOther[0] == this[0]
            && anOther[1] == this[1]
            && anOther[2] == this[2]
            && anOther[3] == this[3])
    }

}
