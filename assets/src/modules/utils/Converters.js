import { ConversionError } from './../Errors.js';

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
