/**
 * @module modules/filter/FilterExpression.js
 * @name FilterExpression
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */

/**
 * Combine several SQL filter fragments into a single one, joined with AND.
 * Entries that are null, undefined, or blank once trimmed are skipped.
 * When several fragments remain, each one is wrapped in parentheses so
 * that an OR inside a fragment cannot take precedence over the AND.
 * @function
 * @param {Array<?string>} filters - the filter fragments to combine
 * @returns {?string} the combined filter, or null if none of the entries
 *   held anything to combine
 */
export function combineFilters(filters) {
    const nonEmpty = filters
        .filter((f) => f !== null && f !== undefined && String(f).trim() !== '');

    if (nonEmpty.length === 0) {
        return null;
    }

    if (nonEmpty.length === 1) {
        return nonEmpty[0];
    }

    return nonEmpty.map((f) => `( ${f} )`).join(' AND ');
}
