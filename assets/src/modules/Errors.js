/**
 * @module modules/Errors.js
 * @name Errors
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

/**
 * Representing a network error with message, resource and options fetched
 * @class
 * @augments Error
 */
class NetworkError extends Error {

    /**
     * Creating an HTTP error with message and status code
     * @param {string} message    - Error message
     * @param {string} resource   - The resource has been fetched
     * @param {string} options    - The resource options
     */
    constructor(message, resource, options) {
        super(message);
        this.name = "NetworkError";
        this.resource = resource;
        this.options = options;
    }
}

/**
 * Representing an HTTP error with message, status code, resource and options fetched
 * @class
 * @augments Error
 */
class HttpError extends NetworkError {

    /**
     * Creating an HTTP error with message and status code
     * @param {string} message    - Error message
     * @param {number} statusCode - HTTP Error status code
     * @param {string} resource   - The resource has been fetched
     * @param {string} options    - The resource options
     */
    constructor(message, statusCode, resource, options) {
        super(message);
        this.name = "HttpError";
        this.statusCode = statusCode;
        this.resource = resource;
        this.options = options;
    }
}

/**
 * Representing an HTTP error with message, response, resource and options fetched
 * @class
 * @augments Error
 */
class ResponseError extends NetworkError {

    /**
     * Creating an HTTP error with message and status code
     * @param {string}   message    - Error message
     * @param {Response} response - HTTP Error status code
     * @param {string}   resource   - The resource has been fetched
     * @param {string}   options    - The resource options
     */
    constructor(message, response, resource, options) {
        super(message);
        this.name = "ResponseError";
        this.response = response;
        this.resource = resource;
        this.options = options;
    }
}

/**
 * Representing a conversion error
 * @class
 * @augments Error
 */
class ConversionError extends Error {

    /**
     * Creating a conversion error
     * @param {string} message - Error message
     */
    constructor(message) {
        super(message);
        this.name = "ConversionError";
    }

}

/**
 * Representing a validation error
 * @class
 * @augments Error
 */
class ValidationError extends Error {

    /**
     * Creating a validation error
     * @param {string} message - Error message
     */
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }

}

/**
 * Representing a property required error
 * @class
 * @augments ValidationError
 */
class PropertyRequiredError extends ValidationError {

    /**
     * Creating a property required error
     * @param {string} property - The object property in error
     */
    constructor(property) {
        super("No property:" + property);
        this.property = property;
    }

}

export { NetworkError, HttpError, ResponseError, ConversionError, ValidationError, PropertyRequiredError };
