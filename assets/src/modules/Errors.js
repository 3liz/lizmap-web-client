class HttpError extends Error {

    /**
     * @param {String} message - Error message
     * @param {int}    statusCode - HTTP Error status code
     */
    constructor(message, statusCode) {
        super(message);
        this.name = "HttpError";
        this.statusCode = statusCode;
    }
}

class ConversionError extends Error {

    /**
     * @param {String} message - Error message
     */
    constructor(message) {
        super(message);
        this.name = "ConversionError";
    }

}

class ValidationError extends Error {

    /**
     * @param {String} message - Error message
     */
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }

}

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
