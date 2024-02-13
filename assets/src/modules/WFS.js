/**
 * @module modules/WFS.js
 * @name WFS
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

/**
 * @class
 * @name WFS
 */
export default class WFS {

    constructor() {
        this._defaultGetFeatureParameters = {
            repository: lizUrls.params.repository,
            project: lizUrls.params.project,
            SERVICE: 'WFS',
            REQUEST: 'GetFeature',
            VERSION: '1.0.0',
            OUTPUTFORMAT: 'GeoJSON'
        };

        this._defaultDescribeFeatureTypeParameters = {
            repository: lizUrls.params.repository,
            project: lizUrls.params.project,
            SERVICE: 'WFS',
            REQUEST: 'DescribeFeatureType',
            VERSION: '1.0.0',
            OUTPUTFORMAT: 'JSON'
        };
    }

    /**
     * @param {object} options - optional parameters which can override this._defaultParameters
     * @returns {Promise} Promise object represents data
     * @memberof WFS
     */
    async getFeature(options) {
        const response = await fetch(lizUrls.wms, {
            method: "POST",
            body: new URLSearchParams({
                ...this._defaultGetFeatureParameters,
                ...options
            })
        });
        return response.json();
    }

    /**
     * @param {object} options - optional parameters which can override this._defaultParameters
     * @returns {Promise} Promise object represents data
     * @memberof WFS
     */
    async describeFeatureType(options) {
        const response = await fetch(lizUrls.wms, {
            method: "POST",
            body: new URLSearchParams({
                ...this._defaultDescribeFeatureTypeParameters,
                ...options
            })
        });
        return response.json();
    }
}
