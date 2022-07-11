import { ValidationError, ConversionError } from './../Errors.js';

/**
 * Freeze in depth an object
 *
 * @param {Object} object - An object to deep freeze
 *
 * @returns {Object} the object deep freezed
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
 **/
export function deepFreeze(object) {
    // Retrieve the property names defined on object
    const propNames = Object.getOwnPropertyNames(object);

    // Freeze properties before freezing self
    for (const name of propNames) {
        const value = object[name];

        if (value && typeof value === "object") {1
            deepFreeze(value);
        }
    }

    return Object.freeze(object);
}

/**
 * Convert a value to Number
 *
 * @param {*} val - A value to convert to number
 *
 * @returns {Number} the converting value
 *
 * @throws {ConversionError}
 **/
export function convertNumber(val) {
    const value = val*1;
    if (isNaN(value)) {
        throw new ConversionError('`'+val+'` is not a number!');
    }
    return value;
}

/**
 * Convert a value to boolean
 *
 * @param {*} val - A value to convert to boolean
 *
 * @returns {Boolean} the converting value
 *
 * @throws {ConversionError}
 **/
export function convertBoolean(val) {
    switch (typeof val) {
        case 'boolean':
            return val;
        case 'number': {
            if (val === 1) {
                return true;
            } else if (val === 0) {
                return false;
            }
            throw new ConversionError('`'+val+'` is not an expected boolean: 1 or 0!');
        }
        case 'string': {
            const value = val.toLowerCase();
            if (value === 'true' || value === 't'
                || value === 'yes' || value === 'y'
                || value === '1') {
                return true;
            } else if (value === 'false' || value === 'f'
                || value === 'no' || value === 'n'
                || value === '0' || value === '') {
                return false;
            }
            throw new ConversionError('`'+val+'` is not an expected boolean: true, t, yes, y, 1, false, f, no, n, 0 or empty string ``!');
        }
        default: {
            if (val === null) {
                return false;
            } else if (Array.isArray(val)) {
                throw new ConversionError('The Array `['+val+']` is not an expected boolean!');
            }
            throw new ConversionError('The Object is not an expected boolean!');
        }
    }
}

/**
 * Get values from source not contains in target
 *
 * @param {Array} source - A source Array
 * @param {Array} target - A target Array
 *
 * @returns {Array} the source values not in target
 **/
export function getNotContains(source, target) {
    return source.filter(function(item){ return target.indexOf(item) == -1});
}

/**
 *
 **/
export class Extent extends Array {

    /**
     * @param {...(number|string)} args - the 4 values describing the extent
     *
     * @throws {ValidationError} for number of args different of 4
     * @throws {ConversionError} for values not number
     **/
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
     * @type {Number}
     **/
    get xmin() {
        return this[0];
    }

    /**
     * @type {Number}
     **/
    get ymin() {
        return this[1];
    }

    /**
     * @type {Number}
     **/
    get xmax() {
        return this[2];
    }

    /**
     * @type {Number}
     **/
    get ymax() {
        return this[3];
    }
}
