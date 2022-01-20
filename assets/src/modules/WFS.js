export default class WFS {

    constructor() {
        this._requiredParameters = {
            repository: lizUrls.params.repository,
            project: lizUrls.params.project,
            SERVICE: 'WFS',
            REQUEST: 'GetFeature',
            OUTPUTFORMAT: 'GeoJSON'
        };
    }

    /**
     * @param {Object} options - optional parameters which can override this._requiredParameters
     * @return {Promise} Promise object represents data
     * @memberof WFS
     */
    async getFeature(options){
        const response = await fetch(lizUrls.wms, {
            method: "POST",
            body: new URLSearchParams({
                ...this._requiredParameters, 
                ...options
            })
        });
        return await response.json();
    }
}
