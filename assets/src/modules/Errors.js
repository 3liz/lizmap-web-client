/**
 * @module Errors.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 **/

/**
 * Representing an HTTP error with message and status code
 * @class
 * @augments Error
 **/
class HttpError extends Error {

    /**
     * Creating an HTTP error with message and status code
     *
     * @param {String} message - Error message
     * @param {int}    statusCode - HTTP Error status code
     */
    constructor(message, statusCode) {
        super(message);
        this.name = "HttpError";
        this.statusCode = statusCode;
    }
}

/**
 * Representing a conversion error
 *
 * @class
 * @augments Error
 **/
class ConversionError extends Error {

    /**
     * Creating a conversion error
     *
     * @param {String} message - Error message
     */
    constructor(message) {
        super(message);
        this.name = "ConversionError";
    }

}

/**
 * Representing a validation error
 *
 * @class
 * @augments Error
 **/
class ValidationError extends Error {

    /**
     * Creating a validation error
     *
     * @param {String} message - Error message
     */
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }

}

/**
 * Representing a property required error
 *
 * @class
 * @augments ValidationError
 **/
class PropertyRequiredError extends ValidationError {

    /**
     * @param {String} property - The object property in error
     */
    constructor(property) {
        super("No property:" + property);
        this.property = property;
    }

}

export { HttpError, ConversionError, ValidationError, PropertyRequiredError };
