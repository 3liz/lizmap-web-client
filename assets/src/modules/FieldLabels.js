/**
 * @module modules/FieldLabels.js
 * @name FieldLabels
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */

/**
 * The maximum number of codes requested with a filter on their values.
 * Above, the labels of the whole source layer are requested.
 * @type {number}
 */
export const MAX_FILTERED_CODES = 500;

/**
 * The default time to live of the cached labels, in milliseconds.
 * @type {number}
 */
export const DEFAULT_TTL = 5 * 60 * 1000;

/**
 * @typedef {object} FieldLabelsSource
 * @property {string}   layerId    - The source layer id
 * @property {string}   typeName   - The WFS type name of the source layer
 * @property {string}   codeField  - The field containing the codes
 * @property {string}   labelField - The field containing the labels
 * @property {string}   [expFilter] - The expression filter of the source layer, if any
 * @property {Array}    [codes]     - The codes to get the labels of, all the codes if not given
 */

/**
 * Get the labels of the codes of the value relation and relation reference fields.
 *
 * The labels are requested with WFS on the source layer, without geometry, and kept
 * in a cache for a few minutes, so that the attribute tables built again, e.g. the child
 * tables when a parent feature is selected, do not request them again.
 * The cached labels of a layer are removed when one of its features is edited.
 * @class
 * @name FieldLabels
 */
export default class FieldLabels {

    /**
     * Create the cache of the labels.
     * @param {object} wfs      - The WFS module, with a getFeature method
     * @param {object} [lizmap3] - The legacy lizMap object, to listen to the edition events
     * @param {number} [ttl]     - The time to live of the cached labels, in milliseconds
     */
    constructor(wfs, lizmap3, ttl = DEFAULT_TTL) {
        this._wfs = wfs;
        this._ttl = ttl;
        // The cached requests by key: {layerId, time, promise}
        this._cache = new Map();

        // Remove the cached labels of a layer when one of its features is edited
        if (lizmap3?.events) {
            const invalidate = (evt) => this.invalidate(evt?.layerId);
            lizmap3.events.on({
                lizmapeditionfeaturecreated: invalidate,
                lizmapeditionfeaturemodified: invalidate,
                lizmapeditionfeaturedeleted: invalidate,
            });
        }
    }

    /**
     * Quote a value as a string of an expression filter.
     *
     * The single quotes are doubled: the literal is valid for QGIS Server
     * and PostgreSQL, which converts it to the type of the compared field.
     * @param {string|number} value - The value to quote
     * @returns {string} The quoted value
     */
    static quoteString(value) {
        return `'${String(value).replaceAll("'", "''")}'`;
    }

    /**
     * Build the expression filter of the labels request.
     *
     * The filter of the source layer is combined with a filter on the codes,
     * when the codes are given and are not too many.
     * @param {FieldLabelsSource} source - The source of the labels
     * @returns {string} The expression filter, empty if there is no filter
     */
    static buildExpFilter(source) {
        const filters = [];

        // The filter of the source layer
        if (source.expFilter) {
            filters.push(source.expFilter);
        }

        // Only the given codes, without null values
        const codes = FieldLabels._getCodes(source);
        if (codes !== null) {
            const quotedField = `"${source.codeField.replaceAll('"', '""')}"`;
            filters.push(`${quotedField} IN (${codes.map(code => FieldLabels.quoteString(code)).join(', ')})`);
        }

        // One filter is used as is, several are enclosed with parenthesis
        if (filters.length < 2) {
            return filters.join('');
        }
        return filters.map(filter => `( ${filter} )`).join(' AND ');
    }

    /**
     * Get the codes to filter the labels request on, sorted and without null values.
     * @param {FieldLabelsSource} source - The source of the labels
     * @returns {Array|null} The codes, or null to request all the labels
     * @private
     */
    static _getCodes(source) {
        if (!Array.isArray(source.codes)) {
            return null;
        }
        const codes = [...new Set(source.codes
            .filter(code => code !== null && code !== undefined)
            .map(code => String(code)))].sort();
        if (codes.length > MAX_FILTERED_CODES) {
            return null;
        }
        return codes;
    }

    /**
     * Get the labels of the codes, from the cache or from the source layer.
     * @param {FieldLabelsSource} source - The source of the labels
     * @returns {Promise<object>} The labels by code
     */
    getLabels(source) {
        // No code, no label to request
        const codes = FieldLabels._getCodes(source);
        if (codes !== null && codes.length == 0) {
            return Promise.resolve({});
        }

        const expFilter = FieldLabels.buildExpFilter(source);
        const key = JSON.stringify([source.typeName, source.codeField, source.labelField, expFilter]);

        // The cached labels, if not too old
        const now = Date.now();
        const cached = this._cache.get(key);
        if (cached && now - cached.time < this._ttl) {
            return cached.promise;
        }

        // Request the codes and the labels, without geometry
        const promise = this._wfs.getFeature({
            TYPENAME: source.typeName,
            PROPERTYNAME: source.codeField + ',' + source.labelField,
            GEOMETRYNAME: 'none',
            // we must not use null for exp_filter but '' if no filter is active
            EXP_FILTER: expFilter,
        }).then(response => {
            // The labels by code
            const labels = {};
            for (const feature of response?.features ?? []) {
                labels[feature.properties[source.codeField]] = feature.properties[source.labelField];
            }
            return labels;
        }).catch(error => {
            // A failed request is not kept
            if (this._cache.get(key)?.promise === promise) {
                this._cache.delete(key);
            }
            throw error;
        });

        // Keep the request, so that the simultaneous calls share it
        this._cache.set(key, { layerId: source.layerId, time: now, promise: promise });
        return promise;
    }

    /**
     * Remove the cached labels of a source layer.
     * @param {string} layerId - The source layer id
     */
    invalidate(layerId) {
        for (const [key, cached] of this._cache) {
            if (cached.layerId === layerId) {
                this._cache.delete(key);
            }
        }
    }

    /**
     * Remove all the cached labels.
     */
    clear() {
        this._cache.clear();
    }
}
