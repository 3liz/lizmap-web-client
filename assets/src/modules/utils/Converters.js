/**
 * @module utils/Converters.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 **/

import { ConversionError } from './../Errors.js';

/**
 * Convert a value to Number
 * @function
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
 * @function
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
 * Convert a value to array
 * @function
 *
 * @param {String|Array} val         - A value to convert to array
 * @param {String}       contentType - The type of values contained in the array
 *
 * @returns {Array} the converting value
 *
 * @throws {ConversionError}
 **/
export function convertArray(val, contentType) {
    if (!(Array.isArray(val) || 'string' == typeof val)) {
        throw new ConversionError(
            `'${JSON.stringify(
                val
            )}' could not be converted to array!`
        );
    }
    let newVal = [];
    if (Array.isArray(val)) {
        newVal = [...val];
    } else {
        newVal = val.split(',').map(v => v.trim());
    }
    switch (contentType){
        case 'boolean':
            newVal = newVal.map(v => convertBoolean(v));
            break;
        case 'number':
            newVal = newVal.map(v => convertNumber(v));
            break;
        case 'string':
            newVal = newVal.map(v => v+'');
            break;
    }
    return newVal;
}

/**
 * Returns a hash code for a string.
 * (Compatible to Java's String.hashCode())
 *
 * The hash code for a string object is computed as
 *     s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
 * using number arithmetic, where s[i] is the i th character
 * of the given string, n is the length of the string,
 * and ^ indicates exponentiation.
 * (The hash value of the empty string is zero.)
 * @function
 *
 * @param {string} s - A string
 * @return {number} a hash code value for the given string.
 **/
export function hashCode(s) {
    let h = 0;
    for(let i = 0; i < s.length; i++) {
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }

    return h;
}
