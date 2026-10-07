/**
 * @module modules/utils/TimeManagerFilter.js
 * @name TimeManagerFilter
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

/**
 * Return the moment.js format pattern for a Time Manager resolution.
 *
 * The same patterns are used for the slider display and, once the resolution
 * has been passed through {@link timeManagerFilterResolution}, for the layer
 * filter expression sent to QGIS Server.
 * @param {string} resolution - a Time Manager resolution: milliseconds,
 *   seconds, minutes, hours, days, weeks, months or years
 * @returns {string} the moment.js format pattern
 */
export function timeManagerDatetimeFormat(resolution) {
    switch (resolution) {
        case 'milliseconds':
        case 'seconds':
            return 'YYYY-MM-DD HH:mm:ss';
        case 'minutes':
            return 'YYYY-MM-DD HH:mm:00';
        case 'hours':
            return 'YYYY-MM-DD HH:00';
        case 'days':
        case 'weeks':
            return 'YYYY-MM-DD';
        case 'months':
            return 'YYYY-MM';
        case 'years':
            return 'YYYY';
        default:
            return 'YYYY-MM-DD';
    }
}

/**
 * Return the resolution to use when formatting the layer filter expression.
 *
 * The filter must keep the layer's configured resolution so that sub-day
 * precision (minutes, hours, seconds) is preserved instead of being truncated
 * to date-only, which returns no features for non-midnight timestamps (#7056).
 *
 * The `months` and `years` resolutions are clamped to `days`: they would
 * otherwise emit month-only ('2020-06') or year-only ('1928') strings, which
 * fail for DATE-typed fields in QGIS Server expression evaluation (#6571). The
 * full ISO date ('YYYY-MM-DD') is valid for both DATE and timestamp fields.
 * @param {string} attributeResolution - the layer configured attribute resolution
 * @returns {string} the resolution to pass to {@link timeManagerDatetimeFormat}
 */
export function timeManagerFilterResolution(attributeResolution) {
    if (attributeResolution === 'months' || attributeResolution === 'years') {
        return 'days';
    }
    return attributeResolution || 'days';
}
