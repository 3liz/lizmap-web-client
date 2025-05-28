/**
 * @module modules/WMS.js
 * @name WMS
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import { Utils } from './Utils.js';

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
     * Get feature info from WMS
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
     * Get legend graphic from WMS
     * @param {object} options - optional parameters which can override this._defaultGetLegendGraphicsParameters
     * @returns {Promise} Promise object represents data
     * @memberof WMS
     */
    async getLegendGraphic(options) {
        return Utils.fetchJSON(globalThis['lizUrls'].wms, {
            method: "POST",
            body: new URLSearchParams({
                ...this._defaultGetLegendGraphicParameters,
                ...options
            })
        });
    }
}
