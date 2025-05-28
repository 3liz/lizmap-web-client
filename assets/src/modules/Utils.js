/**
 * @module modules/Utils.js
 * @name Utils
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import { NetworkError, HttpError, ResponseError } from './Errors.js';
import DOMPurify from 'dompurify';

/**
 * The main utils methods
 * @class
 * @name Utils
 */
export class Utils {

    /**
     * Download a file provided as a string
     * @static
     * @param {string} text - file content
     * @param {string} fileType - file's MIME type
     * @param {string} fileName - file'name with extension
     */
    static downloadFileFromString(text, fileType, fileName) {
        var blob = new Blob([text], { type: fileType });

        var a = document.createElement('a');
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => { URL.revokeObjectURL(a.href); }, 1500);
    }

    /**
     * Send an ajax POST request to download a file
     * @static
     * @param {string} url        - A string or any other object with a stringifier — including a URL object — that provides the URL of the resource to send the request to.
     * @param {Array} parameters  - Parameters that will be serialize as a Query string
     * @param {Function} callback - optional callback executed when download ends
     * @param {Function} errorCallback - optional callback executed when error event occurs
     */
    static downloadFile(url, parameters, callback, errorCallback) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            if (this.status === 200) {
                var filename = "";
                var disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('filename') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                }

                let type = xhr.getResponseHeader('Content-Type');

                // Firefox >= 98 opens blob in its pdf viewer
                // This is a hack to force download as in Chrome
                if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && type == 'application/pdf') {
                    type = 'application/octet-stream';
                }
                const blob = new File([this.response], filename, { type: type });
                const downloadUrl = URL.createObjectURL(blob);

                if (filename) {
                    // use HTML5 a[download] attribute to specify filename
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = filename;
                    a.dispatchEvent(new MouseEvent('click'));
                } else {
                    window.open(downloadUrl);
                }

                setTimeout(() => URL.revokeObjectURL(downloadUrl), 100); // cleanup
            } else {
                // Execute callback if any
                if (typeof errorCallback === 'function') {
                    errorCallback(new HttpError('HTTP error: ' + this.status, this.status, url, {method:'POST', body:$.param(parameters, true)}));
                }
            }

            // Execute callback if any
            if (typeof callback === 'function') {
                callback();
            }
        };
        // Add error callback if any
        if (typeof errorCallback === 'function') {
            xhr.addEventListener("error", errorCallback);
        }
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send($.param(parameters, true));
    }

    /**
     * Fetching a resource from the network, returning a promise that is fulfilled once the response is successful.
     * @static
     * @param {string} resource - This defines the resource that you wish to fetch. A string or any other object with a stringifier — including a URL object — that provides the URL of the resource you want to fetch.
     * @param {object} options  - An object containing any custom settings you want to apply to the request.
     * @returns {Promise} A Promise that resolves to a successful Response object (status in the range 200 – 299)
     * @throws {HttpError} In case of not successful response (status not in the range 200 – 299)
     * @throws {NetworkError} In case of catch exceptions
     * @see https://developer.mozilla.org/en-US/docs/Web/API/fetch
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Response
     */
    static fetch(resource, options) {
        return fetch(resource, options).then(response => {
            if (response.ok) {
                return response;
            }

            return Promise.reject(new HttpError('HTTP error: ' + response.status, response.status, resource, options));
        }).catch(error => {
            if (error instanceof NetworkError) {
                return Promise.reject(error);
            }
            return Promise.reject(new NetworkError(error.message, resource, options));
        });
    }

    /**
     * Fetching a resource from the network, which is JSON or GeoJSON, returning a promise that resolves with the result of parsing the response body text as JSON.
     * @static
     * @param {string} resource - This defines the resource that you wish to fetch. A string or any other object with a stringifier — including a URL object — that provides the URL of the resource you want to fetch.
     * @param {object} options - An object containing any custom settings you want to apply to the request.
     * @returns {Promise} A Promise that resolves with the result of parsing the response body text as JSON.
     * @throws {ResponseError} In case of invalid content type (not application/json or application/vnd.geo+json) or Invalid JSON
     * @throws {HttpError} In case of not successful response (status not in the range 200 – 299)
     * @throws {NetworkError} In case of catch exceptions
     * @see https://developer.mozilla.org/en-US/docs/Web/API/fetch
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Response
     */
    static fetchJSON(resource, options) {
        return Utils.fetch(resource, options).then(response => {
            const contentType = response.headers.get('Content-Type') || '';

            if (contentType.includes('application/json') ||
                contentType.includes('application/vnd.geo+json')) {
                return response.json().catch(error => {
                    return Promise.reject(new ResponseError('Invalid JSON: ' + error.message, response, resource, options));
                });
            }

            return Promise.reject(new ResponseError('Invalid content type: ' + contentType, response, resource, options));
        }).catch(error => {return Promise.reject(error)});
    }

    /**
     * Fetching a resource from the network, which is HTML, returning a promise that resolves with a text representation of the response body.
     * @static
     * @param {string} resource - This defines the resource that you wish to fetch. A string or any other object with a stringifier — including a URL object — that provides the URL of the resource you want to fetch.
     * @param {object} options - An object containing any custom settings you want to apply to the request.
     * @returns {Promise} A Promise that resolves with a text representation of the response body.
     * @throws {ResponseError} In case of invalid content type (not text/html)
     * @throws {HttpError} In case of not successful response (status not in the range 200 – 299)
     * @throws {NetworkError} In case of catch exceptions
     * @see https://developer.mozilla.org/en-US/docs/Web/API/fetch
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Response
     */
    static fetchHTML(resource, options) {
        return Utils.fetch(resource, options).then(response => {
            const contentType = response.headers.get('Content-Type') || '';

            if (contentType.includes('text/html')) {
                return response.text().catch(error => {
                    return Promise.reject(new ResponseError('HTML error: ' + error.message, response, resource, options));
                });
            }

            return Promise.reject(new ResponseError('Invalid content type: ' + contentType, response, resource, options));
        }).catch(error => {return Promise.reject(error)});
    }

    /**
     * Get the corresponding resolution for the scale with meters per unit
     * @static
     * @param {number} scale         - The scale
     * @param {number} metersPerUnit - The meters per unit
     * @returns {number} The corresponding resolution
     * @see https://github.com/openlayers/ol2/blob/master/lib/OpenLayers/Util.js#L1101
     */
    static getResolutionFromScale(scale, metersPerUnit) {
        const inchesPerMeter = 1000 / 25.4;
        const DPI = 96;
        const resolution = scale / (inchesPerMeter * DPI * metersPerUnit);
        return resolution;
    }

    /**
     * Get the corresponding scale for the resolution with meters per unit
     * @static
     * @param {number} resolution    - The resolution
     * @param {number} metersPerUnit - The meters per unit
     * @returns {number} The corresponding scale
     * @see getResolutionFromScale
     */
    static getScaleFromResolution(resolution, metersPerUnit) {
        const inchesPerMeter = 1000 / 25.4;
        const DPI = 96;
        const scale = resolution * inchesPerMeter * DPI * metersPerUnit;
        return scale;
    }

    /**
     * Sanitize the GetFeatureInfo content
     * @param {string} content - The content to sanitize
     * @returns {string} The sanitized content
     */
    static sanitizeGFIContent(content) {
        DOMPurify.addHook('afterSanitizeAttributes', node => {
            // Sandbox all iframes except those from the same origin
            if (node.nodeName === 'IFRAME' &&
                !node.attributes['src'].textContent.startsWith(document.location.origin)) {
                node.setAttribute('sandbox','allow-scripts allow-forms');
            }
        });
        return DOMPurify.sanitize(content, {
            ADD_TAGS: ['iframe'],
            ADD_ATTR: ['target'],
            CUSTOM_ELEMENT_HANDLING: {
                tagNameCheck: /^lizmap-/,
                attributeNameCheck: /crs|bbox|edition-restricted|layerid|layertitle|uniquefield|expressionfilter|withgeometry|sortingfield|sortingorder|draggable/,
            }
        });
    }
}
