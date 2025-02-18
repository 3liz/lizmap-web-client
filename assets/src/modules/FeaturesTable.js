/**
 * @module modules/FeaturesTable.js
 * @name FeaturesTable
 * @copyright 2024 3Liz
 * @license MPL-2.0
 */
import { Config } from './Config.js';
import { Utils } from './Utils.js';

/**
 * @class
 * @name FeaturesTable
 */
export default class FeaturesTable {

    /**
     * Create a features table instance
     * @param {Config} initialConfig - The lizmap initial config instance
     * @param {object} lizmap3   - The old lizmap object
     */
    constructor(initialConfig, lizmap3) {
        this._initialConfig = initialConfig;
        this._lizmap3 = lizmap3;
    }

    /**
     * Get the list of features containing the display expression
     * @param
     * @returns {Promise} features - Promise with the JSON list of features
     */


    /**
     * Get the list of features containing the display expression
     * @param {string}      layerId The QGIS layer ID
     * @param {string|null} filter An QGIS expression filter
     * @param {boolean}     withGeometry If we need to get the geometry
     * @param {string|null} fields List of field names separated by comma
     * @param {object | Array} additionalFields JSON object with the field names and expressions
     * @param {number}      limit Number of features to return
     * @param {string|null}      sortingField Field name to sort the features
     * @param {string|null}      sortingOrder Sorting order
     * @returns {Promise} — A Promise that resolves with the result of parsing the response body text as JSON.
     * @throws {ResponseError} In case of invalid content type (not application/json or application/vnd.geo+json) or invalid JSON
     * @throws {HttpError} In case of not successful response (status not in the range 200–299)
     * @throws {NetworkError} In case of catch exceptions
     */
    getFeatures(layerId, filter = null, withGeometry = false, fields = 'null', additionalFields = [], limit = 1000, sortingField = null, sortingOrder = null) {

        // Build URL
        const url = `${lizUrls.service.replace('service?','features/displayExpression?')}&`;

        // Build parameters
        let formData = new FormData();
        formData.append('layerId', layerId);
        formData.append('exp_filter', filter);
        formData.append('with_geometry', withGeometry.toString());
        formData.append('fields', fields);
        formData.append('additionalFields',JSON.stringify(additionalFields));
        formData.append('limit', limit);
        formData.append('sorting_field', sortingField);
        formData.append('sorting_order', sortingOrder);
        // Return promise
        return Utils.fetchJSON(url, {
            method: "POST",
            body: formData
        });
    }


    /**
     * Display a lizMap message
     * @param {string} message  Message to display
     * @param {string} type     Type : error or info
     * @param {number} duration Number of millisecond the message must be displayed
     */
    addMessage(message, type='info', duration=60000) {

        let previousMessage = document.getElementById('lizmap-features-table-message');
        if (previousMessage) previousMessage.remove();
        this._lizmap3.addMessage(
            message, type, true, duration
        ).attr('id', 'lizmap-features-table-message');
    }



    /**
     * Open a Lizmap Popup
     * @param {string} layerId       QGIS layer ID
     * @param {object} feature       WFS Feature
     * @param {string} uniqueField   Field containing unique values (used to set the filter for the WMS request)
     * @param {HTMLElement} targetElement Target HTML element to display the popup content for the given feature
     * @param {Function} aCallBack   Callback function
     * @returns {null|void}          Return null if the layerId is not in the configuration
     */
    openPopup(layerId, feature, uniqueField, targetElement, aCallBack) {

        // Get the layer name & configuration
        if (!this._initialConfig.layers.layerIds.includes(layerId)) {
            return null;
        }
        const layerConfig = this._initialConfig.layers.getLayerConfigByLayerId(layerId);
        const layerName = layerConfig.name;

        // Layer WMS name
        const wmsName = layerConfig?.shortname || layerConfig?.name || layerName;

        // Filter
        const filter = `${wmsName}:"${uniqueField}" = '${feature.properties[uniqueField]}'`;

        var crs = 'EPSG:4326';
        if(layerConfig.crs && layerConfig.crs != ''){
            crs = layerConfig.crs;
        }

        var wmsOptions = {
            'LAYERS': wmsName
            ,'QUERY_LAYERS': wmsName
            ,'STYLES': ''
            ,'SERVICE': 'WMS'
            ,'VERSION': '1.3.0'
            ,'CRS': crs
            ,'REQUEST': 'GetFeatureInfo'
            ,'EXCEPTIONS': 'application/vnd.ogc.se_inimage'
            ,'INFO_FORMAT': 'text/html'
            ,'FEATURE_COUNT': 1
            ,'FILTER': filter,

        };

        // Query the server
        $.get(globalThis['lizUrls'].service, wmsOptions, function(data) {
            // Display the popup in the target element
            if (targetElement) {
                targetElement.innerHTML = data;
            }

            // Launch callback
            aCallBack(layerId, feature, targetElement);
        });
    }


}
