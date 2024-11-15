/**
 * @module modules/utils/Enums.js
 * @name Enums
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

/**
 * A factory function that accepts a plain enum object and returns a proxied enum object.
 * The enum proxy intercepts the read and write operations on an enum object and:
 * Throws an error when a non-existent enum value is accessed
 * Throws an error when an enum object property is changed
 * @function
 * @example
 * const Sizes = createEnum({
 *      Small: 'small',
 *      Medium: 'medium',
 *      Large: 'large',
 *  })
 * @example
 * const Bool = createEnum({
 *      'Yes': true,
 *      'No': false,
 *      'Undefined': undefined,
 *  });
 * @param {object} structure - The enum structure
 * @throws {TypeError} Will throws an error if the structure is not an object and the values
 * associated to the structure keys are not 'number', 'string', 'boolean' or 'undefined'.
 * @returns {Proxy} The enum based on the structure
 */
const createEnum = (structure) => {
    if (structure === null || typeof structure !== 'object' || Array.isArray(structure)) {
        throw new TypeError(`'${structure}' is not a valid enum structure.`);
    }

    for (const key in structure) {
        if (!['number', 'string', 'boolean', 'undefined'].includes(typeof structure[key])) {
            throw new TypeError(
                `You are only allowed to use 'number', 'string', 'boolean' or 'undefined' types, but you are using '${JSON.stringify(
                    structure[key]
                )}'`
            );
        }
    }

    return new Proxy(structure, {
        set(target, prop) {
            if (Reflect.has(target, prop)) {
                throw new TypeError(`Cannot assign to read only property '${prop}' of an Enum.`);
            } else {
                throw new TypeError(`Property '${prop}' does not exist in the Enum.`);
            }
        },
        get(target, prop) {
            return Reflect.get(target, prop);
        },
    });
};

export { createEnum };
