/**
 * @module modules/Errors.js
 * @name Errors
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

/**
 * Representing a request error with message and parameters before fetching
 * @class
 * @augments Error
 * @property {string} name       - Error name: RequestError
 * @property {string} message    - Error message
 * @property {object} parameters - The request parameters
 */
export class RequestError extends Error {

    /**
     * Creating a request error with message and parameters before fetching
     * @param {string} message    - Error message
     * @param {object} params     - The request parameters
     */
    constructor(message, params) {
        super(message);
        this.name = "RequestError";
        this.parameters = params;
    }
}

/**
 * Representing a network error with message, resource and options fetched
 * @class
 * @augments Error
 * @property {string} name - Error name: NetworkError
 * @property {string} message - Error message
 * @property {string} resource - The resource has been fetched
 * @property {string} options - The resource options
 */
export class NetworkError extends Error {

    /**
     * Creating an HTTP error with message, resource and options fetched
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
 * @augments NetworkError
 * @property {string} name - Error name: HttpError
 * @property {string} message - Error message
 * @property {string} resource - The resource has been fetched
 * @property {string} options - The resource options
 * @property {number} statusCode - HTTP Error status code
 */
export class HttpError extends NetworkError {

    /**
     * Creating an HTTP error with message and status code
     * @param {string} message    - Error message
     * @param {number} statusCode - HTTP Error status code
     * @param {string} resource   - The resource has been fetched
     * @param {string} options    - The resource options
     */
    constructor(message, statusCode, resource, options) {
        super(message, resource, options);
        this.name = "HttpError";
        this.statusCode = statusCode;
    }
}

/**
 * Representing an response error with message, response, resource and options fetched
 * @class
 * @augments HttpError
 * @property {string} name - Error name: ResponseError
 * @property {string} message - Error message
 * @property {string} resource - The resource has been fetched
 * @property {string} options - The resource options
 * @property {number} statusCode - HTTP Error status code
 * @property {Response} response - Response object from fetch
 */
export class ResponseError extends HttpError {

    /**
     * Creating an HTTP error with message and status code
     * @param {string}   message    - Error message
     * @param {Response} response   - Response object from fetch
     * @param {string}   resource   - The resource has been fetched
     * @param {string}   options    - The resource options
     */
    constructor(message, response, resource, options) {
        super(message, response.status, resource, options);
        this.name = "ResponseError";
        this.response = response;
    }
}

/**
 * Representing a conversion error
 * @class
 * @augments Error
 */
export class ConversionError extends Error {

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
export class ValidationError extends Error {

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
export class PropertyRequiredError extends ValidationError {

    /**
     * @param {string} property - The object property in error
     */
    constructor(property) {
        super("No property:" + property);
        this.property = property;
    }

}
