/**
 * @module config/Tools.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 **/

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

        if (value && typeof value === "object") {
            deepFreeze(value);
        }
    }

    return Object.freeze(object);
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
