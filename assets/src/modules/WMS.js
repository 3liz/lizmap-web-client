/**
 * @module modules/WMS.js
 * @name WMS
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

/**
 * @class
 * @name WMS
 */
export default class WMS {

    constructor() {
        this._defaultGetFeatureInfoParameters = {
            repository: lizUrls.params.repository,
            project: lizUrls.params.project,
            SERVICE: 'WMS',
            REQUEST: 'GetFeatureInfo',
            VERSION: '1.3.0',
            CRS: 'EPSG:4326',
            INFO_FORMAT: 'text/html'
        };

        this._defaultGetLegendGraphicParameters = {
            repository: lizUrls.params.repository,
            project: lizUrls.params.project,
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
        const response = await fetch(lizUrls.wms, {
            method: "POST",
            body: new URLSearchParams({
                ...this._defaultGetFeatureInfoParameters,
                ...options
            })
        });
        return response.text();
    }

    /**
     * @param {object} options - optional parameters which can override this._defaultGetLegendGraphicsParameters
     * @returns {Promise} Promise object represents data
     * @memberof WMS
     */
    async getLegendGraphic(options) {
        const response = await fetch(lizUrls.wms, {
            method: "POST",
            body: new URLSearchParams({
                ...this._defaultGetLegendGraphicParameters,
                ...options
            })
        });
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.text);
    }
}
