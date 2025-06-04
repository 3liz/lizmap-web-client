/**
 * @module modules/WMS.js
 * @name WMS
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import Utils from './Utils.js';
import { RequestError } from './Errors.js';

/**
 * @class
 * @name WMS
 */
export default class WMS {

    constructor() {
        this._defaultGetFeatureInfoParameters = {
            repository: globalThis['lizUrls'].params.repository,
            project: globalThis['lizUrls'].params.project,
            SERVICE: 'WMS',
            REQUEST: 'GetFeatureInfo',
            VERSION: '1.3.0',
            CRS: 'EPSG:4326',
            INFO_FORMAT: 'text/html'
        };

        this._defaultGetLegendGraphicParameters = {
            repository: globalThis['lizUrls'].params.repository,
            project: globalThis['lizUrls'].params.project,
            SERVICE: 'WMS',
            REQUEST: 'GetLegendGraphic',
            VERSION: '1.3.0',
            FORMAT: 'application/json',
        };
    }

    /**
     * @param {object} options - optional parameters which can override this._defaultGetFeatureInfoParameters
     * @returns {Promise} Promise object represents data
     * @memberof WMS
     */
    async getFeatureInfo(options) {
        return Utils.fetchHTML(globalThis['lizUrls'].wms, {
            method: "POST",
            body: new URLSearchParams({
                ...this._defaultGetFeatureInfoParameters,
                ...options
            })
        });
    }

    /**
     * @param {object} options - optional parameters which can override this._defaultGetLegendGraphicsParameters
     * @returns {Promise} Promise object represents data
     * @throws {HttpError} In case of not successful response (status not in the range 200 – 299)
     * @throws {NetworkError} In case of catch exceptions
     * @memberof WMS
     */
    async getLegendGraphic(options) {
        const layers = options['LAYERS'] ?? options['LAYER'];
        // Check if layer is specified
        if (!layers) {
            return Promise.reject(
                new RequestError(
                    'LAYERS or LAYER parameter is required for getLegendGraphic request',
                    options,
                )
            );
        }
        const params = new URLSearchParams({
            ...this._defaultGetLegendGraphicParameters,
            ...options
        });
        // Check if multiple layers are specified
        if ((Array.isArray(layers) && layers.length == 1) ||
            (!Array.isArray(layers) && layers.split(',').length == 1)) {
            // Use GET request for single layer
            return Utils.fetchJSON(`${globalThis['lizUrls'].wms}?${params}`);
        }
        // Use POST request for multiple layers
        return Utils.fetchJSON(globalThis['lizUrls'].wms, {
            method: "POST",
            body: params,
        });
    }
}
