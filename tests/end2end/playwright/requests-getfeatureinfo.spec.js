// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js';
import { parse as parseHtml } from 'node-html-parser';

/**
 * @typedef {import('@playwright/test').MatcherReturnType} MatcherReturnType
 */

const popupExpect = expect.extend({
    /**
     * Expecting the HTML element to be div with class lizmapPopupSingleFeature
     *
     * @param {parseHtml.HTMLElement} element The HTML element to test
     *
     * @returns {MatcherReturnType} the result
     */
    toBeLizmapPopupSingleFeature(element) {
        const assertionName = 'toBeLizmapPopupSingleFeature';
        let pass = true;
        let theMessage = '';
        /** @type {MatcherReturnType} matcherResult */
        let matcherResult = {
            message: () => theMessage,
            pass: pass,
            name: assertionName,
            expected: '<div class="lizmapPopupSingleFeature">...</div>',
            actual: '',
        };
        try {
            expect(element.tagName).toBe('DIV');
            // have class lizmapPopupSingleFeature
            expect(element.classNames).toContain('lizmapPopupSingleFeature');
            // have data attributes
            expect(element.hasAttribute('data-feature-id')).toBe(true);
            expect(element.hasAttribute('data-layer-id')).toBe(true);
            // have title
            expect(element.querySelectorAll('h4.lizmapPopupTitle')).toHaveLength(1);

            // have popup content
            expect(element.querySelectorAll('div.lizmapPopupDiv')).toHaveLength(1);
            let popupDiv = element.querySelector('div.lizmapPopupDiv');
            expect(popupDiv).not.toBeNull();

            // have hidden inputs
            expect(popupDiv?.querySelectorAll('input[type="hidden"]').length).toBeGreaterThanOrEqual(1);
            expect(popupDiv?.querySelectorAll('input[type="hidden"].lizmap-popup-layer-feature-id')).toHaveLength(1);

            // have feature toolbar
            expect(popupDiv?.querySelectorAll('lizmap-feature-toolbar')).toHaveLength(1);
            let featureToolbar = popupDiv?.querySelector('lizmap-feature-toolbar');
            expect(featureToolbar).not.toBeNull();
            expect(featureToolbar?.hasAttribute('value')).toBe(true);

            // Same value for input and lizmap-feature-toobar
            expect(featureToolbar?.getAttribute('value')).toBe(
                popupDiv?.querySelector('input[type="hidden"].lizmap-popup-layer-feature-id')?.getAttribute('value')
            );
        } catch(/** @type {any} */ e) {
            theMessage = e.matcherResult.message;
            pass = false;
        }

        const message = this.isNot
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: not DIV element with class lizmapPopupSingleFeature\n`+
                `Actual: ${element.outerHTML} - ${matcherResult.message()}`
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: DIV element with class lizmapPopupSingleFeature\n`+
                `Actual: ${element.outerHTML} - ${matcherResult.message()}`

        return {
            message,
            pass,
            name: assertionName,
        };
    },

    /**
     * Expecting the HTML element to have an h4 element with class lizmapPopupTile and the expected title content
     *
     * @param {parseHtml.HTMLElement} element The HTML element to test
     * @param {string} expected the expected title value
     *
     * @returns {MatcherReturnType} the result
     */
    toHaveLizmapPopupTitle(element, expected) {
        const assertionName = 'toHaveLizmapPopupTitle';
        let pass = true;
        let theMessage = '';
        /** @type {MatcherReturnType} matcherResult */
        let matcherResult = {
            message: () => theMessage,
            pass: pass,
            name: assertionName,
            expected: `DIV element with class lizmapPopupSingleFeature and with a child H4 element`
                +` with class lizmapPopupTtile and the expected title content:`
                +` <h4 class="lizmapPopupTitle">${expected}</h4>`,
            actual: '',
        };

        try {
            expect(element.querySelectorAll('h4.lizmapPopupTitle')).toHaveLength(1);
            expect(element.querySelector('h4.lizmapPopupTitle')?.textContent).toBe(expected);
        } catch(/** @type {any} */ e) {
            theMessage = e.matcherResult.message;
            pass = false;
        }

        const message = this.isNot
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: not DIV element with class lizmapPopupSingleFeature and with a child H4 element`
                +` with class lizmapPopupTtile and the expected title content:`
                +` <h4 class="lizmapPopupTitle">${expected}</h4>\n`+
                `Actual: ${element.outerHTML} - ${matcherResult.message()}`
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: DIV element with class lizmapPopupSingleFeature and with a child H4 element`
                +` with class lizmapPopupTtile and the expected title content:`
                +` <h4 class="lizmapPopupTitle">${expected}</h4>\n`+
                `Actual: ${element.outerHTML} - ${matcherResult.message()}`

        return {
            message,
            pass,
            name: assertionName,
            expected: expected,
            actual: matcherResult?.actual,
        };
    },

    /**
     * Expecting the HTML element to have
     *
     * @param {parseHtml.HTMLElement} element The HTML element to test
     *
     * @returns {MatcherReturnType} the result
     */
    toHaveLizmapPopupSpatialInfo(element) {
        const assertionName = 'toHaveLizmapPopupSpatialInfo';
        let pass = true;
        let theMessage = '';
        /** @type {MatcherReturnType} matcherResult */
        let matcherResult = {
            message: () => theMessage,
            pass: pass,
            name: assertionName,
            expected: `DIV element with class lizmapPopupSingleFeature and with input[type="hidden"] children`
                + ` and lizmap-feature-toolbar element than contain spatial info.`,
            actual: '',
        };
        try {
            let popupDiv = element.querySelector('div.lizmapPopupDiv');
            expect(popupDiv).not.toBeNull();

            // have hidden inputs
            expect(popupDiv?.querySelectorAll('input[type="hidden"]').length).toBeGreaterThanOrEqual(7);
            expect(popupDiv?.querySelectorAll('input[type="hidden"].lizmap-popup-layer-feature-geometry')).toHaveLength(1);
            expect(popupDiv?.querySelectorAll('input[type="hidden"].lizmap-popup-layer-feature-crs')).toHaveLength(1);
            expect(popupDiv?.querySelectorAll('input[type="hidden"].lizmap-popup-layer-feature-bbox-minx')).toHaveLength(1);
            expect(popupDiv?.querySelectorAll('input[type="hidden"].lizmap-popup-layer-feature-bbox-miny')).toHaveLength(1);
            expect(popupDiv?.querySelectorAll('input[type="hidden"].lizmap-popup-layer-feature-bbox-maxx')).toHaveLength(1);
            expect(popupDiv?.querySelectorAll('input[type="hidden"].lizmap-popup-layer-feature-bbox-maxy')).toHaveLength(1);

            let featureToolbar = popupDiv?.querySelector('lizmap-feature-toolbar');
            expect(featureToolbar).not.toBeNull();

            expect(featureToolbar?.hasAttribute('crs')).toBe(true);
            expect(featureToolbar?.hasAttribute('bbox-minx')).toBe(true);
            expect(featureToolbar?.hasAttribute('bbox-miny')).toBe(true);
            expect(featureToolbar?.hasAttribute('bbox-maxx')).toBe(true);
            expect(featureToolbar?.hasAttribute('bbox-maxy')).toBe(true);

            // Same value for input and lizmap-feature-toobar
            expect(featureToolbar?.getAttribute('crs')).toBe(
                popupDiv?.querySelector('input[type="hidden"].lizmap-popup-layer-feature-crs')?.getAttribute('value')
            );
            expect(featureToolbar?.getAttribute('bbox-minx')).toBe(
                popupDiv?.querySelector('input[type="hidden"].lizmap-popup-layer-feature-bbox-minx')?.getAttribute('value')
            );
            expect(featureToolbar?.getAttribute('bbox-miny')).toBe(
                popupDiv?.querySelector('input[type="hidden"].lizmap-popup-layer-feature-bbox-miny')?.getAttribute('value')
            );
            expect(featureToolbar?.getAttribute('bbox-maxx')).toBe(
                popupDiv?.querySelector('input[type="hidden"].lizmap-popup-layer-feature-bbox-maxx')?.getAttribute('value')
            );
            expect(featureToolbar?.getAttribute('bbox-maxy')).toBe(
                popupDiv?.querySelector('input[type="hidden"].lizmap-popup-layer-feature-bbox-maxy')?.getAttribute('value')
            );
        } catch(/** @type {any} */ e) {
            theMessage = e.matcherResult.message;
            pass = false;
        }

        const message = this.isNot
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: not DIV element with class lizmapPopupSingleFeature and with input[type="hidden"] children`
                    + ` and lizmap-feature-toolbar element than contain spatial info.\n`+
                `Actual: ${element.outerHTML} - ${matcherResult.message()}`
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: DIV element with class lizmapPopupSingleFeature and with input[type="hidden"] children`
                    + ` and lizmap-feature-toolbar element than contain spatial info.\n`+
                `Actual: ${element.outerHTML} - ${matcherResult.message()}`

        return {
            message,
            pass,
            name: assertionName,
        };
    },

    /**
     * Expecting the HTML element to have
     *
     * @param {parseHtml.HTMLElement} element The HTML element to test
     *
     * @returns {MatcherReturnType} the result
     */
    toHaveLizmapPopupTable(element) {
        const assertionName = 'toHaveLizmapPopupTable';
        let pass = true;
        let theMessage = '';
        /** @type {MatcherReturnType} matcherResult */
        let matcherResult = {
            message: () => theMessage,
            pass: pass,
            name: assertionName,
            expected: `DIV element with class lizmapPopupSingleFeature and with table element`
                + ` with lizmapPopupTable class.`,
            actual: '',
        };
        try {
            let popupDiv = element.querySelector('div.lizmapPopupDiv');
            expect(popupDiv).not.toBeNull();

            expect(popupDiv?.querySelectorAll('table.lizmapPopupTable')).toHaveLength(1);
            let popupTable = popupDiv?.querySelector('table.lizmapPopupTable');
            expect(popupTable).not.toBeNull();

            expect(popupTable?.querySelectorAll('thead')).toHaveLength(1);
            expect(popupTable?.querySelectorAll('thead tr')).toHaveLength(1);
            expect(popupTable?.querySelectorAll('thead tr th')).toHaveLength(2);

            expect(popupTable?.querySelectorAll('tbody')).toHaveLength(1);
            expect(popupTable?.querySelectorAll('tbody tr').length).toBeGreaterThanOrEqual(1);

            expect(popupTable?.querySelectorAll('tbody tr')[0]?.querySelectorAll('th')).toHaveLength(1);
            expect(popupTable?.querySelectorAll('tbody tr')[0]?.querySelectorAll('td')).toHaveLength(1);

        } catch(/** @type {any} */ e) {
            theMessage = e.matcherResult.message;
            pass = false;
        }

        const message = this.isNot
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: not DIV element with class lizmapPopupSingleFeature and with input[type="hidden"] children`
                    + ` and lizmap-feature-toolbar element than contain spatial info.\n`+
                `Actual: ${element.outerHTML} - ${matcherResult.message()}`
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: DIV element with class lizmapPopupSingleFeature and with input[type="hidden"] children`
                    + ` and lizmap-feature-toolbar element than contain spatial info.\n`+
                `Actual: ${element.outerHTML} - ${matcherResult.message()}`

        return {
            message,
            pass,
            name: assertionName,
        };
    },

    /**
     * Expecting the HTML element to have
     *
     * @param {parseHtml.HTMLElement} element The HTML element to test
     * @param {string} startLayerId The start of layer ID to build RegExp
     * @param {string} featureId The feature ID in the layer
     *
     * @returns {MatcherReturnType} the result
     */
    toHaveLizmapFeatureId(element, startLayerId, featureId) {
        const assertionName = 'toHaveLizmapFeatureId';
        let pass = true;
        let theMessage = '';
        /** @type {MatcherReturnType} matcherResult */
        let matcherResult = {
            message: () => theMessage,
            pass: pass,
            name: assertionName,
            expected: `DIV element with class lizmapPopupSingleFeature and with attributes and elements`
                + `that provides layer and feature id information.`,
            actual: '',
        };

        const layerIdRegExp = new RegExp(`^${startLayerId}_[\\d\\w_]{36}$`);
        const featureIdRegExp = new RegExp(`^${startLayerId}_[\\d\\w_]{36}\\.${featureId}$`);

        try {
            expect(element.getAttribute('data-feature-id')).toBe(featureId);
            expect(element.getAttribute('data-layer-id')).toMatch(layerIdRegExp);

            let popupDiv = element.querySelector('div.lizmapPopupDiv');
            expect(popupDiv).not.toBeNull();

            expect(
                popupDiv?.querySelector('input[type="hidden"].lizmap-popup-layer-feature-id')?.getAttribute('value')
            ).toMatch(featureIdRegExp);

            let featureToolbar = popupDiv?.querySelector('lizmap-feature-toolbar');
            expect(featureToolbar).not.toBeNull();

            expect(featureToolbar?.getAttribute('value')).toMatch(featureIdRegExp);
        } catch(/** @type {any} */ e) {
            theMessage = e.matcherResult.message;
            pass = false;
        }

        const message = this.isNot
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: not DIV element with class lizmapPopupSingleFeature and with attributes and elements`
                    + `that provides layer and feature id information.\n`+
                `Actual: ${element.outerHTML} - ${matcherResult.message()}`
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: DIV element with class lizmapPopupSingleFeature and with attributes and elements`
                    + `that provides layer and feature id information.\n`+
                `Actual: ${element.outerHTML} - ${matcherResult.message()}`

        return {
            message,
            pass,
            name: assertionName,
        };
    },

    /**
     * Expecting the HTML element to be div with class popupAllFeaturesCompact
     *
     * @param {parseHtml.HTMLElement} element The HTML element to test
     *
     * @returns {MatcherReturnType} the result
     */
    toBePopupAllFeaturesCompact(element) {
        const assertionName = 'toBePopupAllFeaturesCompact';
        let pass = true;
        let theMessage = '';
        /** @type {MatcherReturnType} matcherResult */
        let matcherResult = {
            message: () => theMessage,
            pass: pass,
            name: assertionName,
            expected: '<div class="popupAllFeaturesCompact">...</div>',
            actual: '',
        };
        try {
            expect(element.tagName).toBe('DIV');
            // have class popupAllFeaturesCompact
            expect(element.classNames).toContain('popupAllFeaturesCompact');

            // have title
            expect(element.querySelectorAll('h4')).toHaveLength(1);

            // have table
            expect(element.querySelectorAll('table.lizmapPopupTable')).toHaveLength(1);
            let popupTable = element?.querySelector('table.lizmapPopupTable');
            expect(popupTable).not.toBeNull();

            expect(popupTable?.querySelectorAll('thead')).toHaveLength(1);
            expect(popupTable?.querySelectorAll('thead tr')).toHaveLength(1);
            expect(popupTable?.querySelectorAll('thead tr th').length).toBeGreaterThanOrEqual(2);
            expect(popupTable?.querySelectorAll('thead tr th')[0]?.textContent).toBe('');

            expect(popupTable?.querySelectorAll('tbody')).toHaveLength(1);
            expect(popupTable?.querySelectorAll('tbody tr').length).toBeGreaterThanOrEqual(1);

            let firstRow = popupTable?.querySelectorAll('tbody tr')[0];
            expect(firstRow).not.toBeNull();
            expect(firstRow?.querySelectorAll('th')).toHaveLength(0);
            expect(firstRow?.querySelectorAll('td').length).toBeGreaterThanOrEqual(2);
            expect(firstRow?.querySelectorAll('td').length).toBe(
                popupTable?.querySelectorAll('thead tr th').length
            );

            let firstCell = firstRow?.querySelectorAll('td')[0];
            expect(firstCell).not.toBeNull();
            expect(firstCell?.querySelectorAll('lizmap-feature-toolbar')).toHaveLength(1);

            let featureToolbar = firstCell?.querySelector('lizmap-feature-toolbar');
            expect(featureToolbar).not.toBeNull();
            expect(featureToolbar?.hasAttribute('value')).toBe(true);
        } catch(/** @type {any} */ e) {
            theMessage = e.matcherResult.message;
            pass = false;
        }

        if (this.isNot) {
            pass =!pass;
        }

        const message = pass
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: not DIV element with class lizmapPopupSingleFeature\n`+
                `Actual: ${element.outerHTML} - ${matcherResult.message()}`
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: DIV element with class lizmapPopupSingleFeature\n`+
                `Actual: ${element.outerHTML} - ${matcherResult.message()}`

        return {
            message,
            pass,
            name: assertionName,
        };
    },
});

test.describe('GetFeatureInfo Requests - anonymous - @requests @readonly', () => {

    test('Click on map with 2 features', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'feature_toolbar',
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetFeatureInfo',
            INFO_FORMAT: 'text/html',
            LAYERS: 'parent_layer',
            QUERY_LAYERS: 'parent_layer',
            STYLE: "défaut",
            CRS: "EPSG:2154",
            BBOX: "599285.8893180595,6165210.947246418,944567.8298819406,6393414.528653582",
            WIDTH: "870",
            HEIGHT: "575",
            FEATURE_COUNT: "10",
            I: "436",
            J: "290",
            FI_POINT_TOLERANCE: "25",
            FI_LINE_TOLERANCE: "10",
            FI_POLYGON_TOLERANCE: "5",
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeHtml();

        let htmlRoot = parseHtml(await response.text());
        /** @type {parseHtml.HTMLElement[]} htmlElements */
        let htmlElements = htmlRoot.childNodes.filter(n => n.nodeType === 1);
        expect(htmlElements).toHaveLength(3);

        let firstDiv = htmlElements[0];
        popupExpect(firstDiv).toBePopupAllFeaturesCompact();

        let secondDiv = htmlElements[1];
        popupExpect(secondDiv).toBeLizmapPopupSingleFeature();
        popupExpect(secondDiv).toHaveLizmapPopupTitle('parent_layer');
        popupExpect(secondDiv).toHaveLizmapPopupSpatialInfo();
        popupExpect(secondDiv).toHaveLizmapPopupTable();
        popupExpect(secondDiv).toHaveLizmapFeatureId('parent_layer', '2');

        let secondPopupDiv = secondDiv.querySelector('div.lizmapPopupDiv');
        expect(
            secondPopupDiv?.querySelector('input[type="hidden"].lizmap-popup-layer-feature-geometry')?.getAttribute('value')
        ).toMatch(/^POINT \(-?\d+\.\d* -?\d+\.\d*\)$/);

        let thirdDiv = htmlElements[2];
        popupExpect(thirdDiv).toBeLizmapPopupSingleFeature();
        popupExpect(thirdDiv).toHaveLizmapPopupTitle('parent_layer');
        popupExpect(thirdDiv).toHaveLizmapPopupSpatialInfo();
        popupExpect(thirdDiv).toHaveLizmapPopupTable();
        popupExpect(thirdDiv).toHaveLizmapFeatureId('parent_layer', '1');

        let thirdPopupDiv = thirdDiv.querySelector('div.lizmapPopupDiv');
        expect(
            thirdPopupDiv?.querySelector('input[type="hidden"].lizmap-popup-layer-feature-geometry')?.getAttribute('value')
        ).toMatch(/^POINT \(-?\d+\.\d* -?\d+\.\d*\)$/);
    });

    test('Filter with 2 features', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'feature_toolbar',
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetFeatureInfo',
            INFO_FORMAT: 'text/html',
            LAYERS: 'children_layer',
            QUERY_LAYERS: 'children_layer',
            STYLE: "",
            FEATURE_COUNT: "10",
            FILTER: 'children_layer:"parent_id" = \'1\''
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeHtml();

        let htmlRoot = parseHtml(await response.text());
        /** @type {parseHtml.HTMLElement[]} htmlElements */
        let htmlElements = htmlRoot.childNodes.filter(n => n.nodeType === 1);
        expect(htmlElements).toHaveLength(3);

        let firstDiv = htmlElements[0];
        popupExpect(firstDiv).toBePopupAllFeaturesCompact();

        let secondDiv = htmlElements[1];
        popupExpect(secondDiv).toBeLizmapPopupSingleFeature();
        popupExpect(secondDiv).toHaveLizmapPopupTitle('children_layer');
        popupExpect(secondDiv).toBeLizmapPopupSingleFeature();
        popupExpect(secondDiv).not.toHaveLizmapPopupSpatialInfo();
        popupExpect(secondDiv).toHaveLizmapPopupTable();
        popupExpect(secondDiv).toHaveLizmapFeatureId('children_layer', '3');

        let thirdDiv = htmlElements[2];
        popupExpect(thirdDiv).toBeLizmapPopupSingleFeature();
        popupExpect(thirdDiv).toHaveLizmapPopupTitle('children_layer');
        popupExpect(thirdDiv).not.toHaveLizmapPopupSpatialInfo();
        popupExpect(thirdDiv).toHaveLizmapPopupTable();
        popupExpect(thirdDiv).toHaveLizmapFeatureId('children_layer', '2');
    });

    test('Click on map with 2 features and display name', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'feature_toolbar',
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetFeatureInfo',
            INFO_FORMAT: 'text/html',
            LAYERS: 'parent_layer',
            QUERY_LAYERS: 'parent_layer',
            STYLE: "défaut",
            CRS: "EPSG:2154",
            BBOX: "599285.8893180595,6165210.947246418,944567.8298819406,6393414.528653582",
            WIDTH: "870",
            HEIGHT: "575",
            FEATURE_COUNT: "10",
            I: "436",
            J: "290",
            FI_POINT_TOLERANCE: "25",
            FI_LINE_TOLERANCE: "10",
            FI_POLYGON_TOLERANCE: "5",
            WITH_DISPLAY_NAME: "true",
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeHtml();

        let htmlRoot = parseHtml(await response.text());
        let htmlElements = htmlRoot.childNodes.filter(n => n.nodeType === 1);
        expect(htmlElements).toHaveLength(3);

        // displayName is not a column of the compact table
        let firstDiv = htmlElements[0];
        popupExpect(firstDiv).toBePopupAllFeaturesCompact();
        expect(
            firstDiv.querySelectorAll('thead tr th').map(th => th.textContent)
        ).not.toContain('displayName');

        // The display expression of parent_layer is "id"
        for (const featureId of ['1', '2']) {
            let featureDiv = (htmlRoot.querySelector(
                `div.lizmapPopupSingleFeature[data-feature-id="${featureId}"]`
            ));
            expect(featureDiv).not.toBeNull();
            popupExpect(featureDiv).toBeLizmapPopupSingleFeature();
            popupExpect(featureDiv).toHaveLizmapPopupTable();
            expect(featureDiv.getAttribute('data-feature-display-name')).toBe(featureId);
            // displayName is not a row of the popup table
            expect(featureDiv.querySelectorAll('tr[data-field-name="displayName"]')).toHaveLength(0);
        }
    });

    test('Filter with 2 features and display name', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'feature_toolbar',
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetFeatureInfo',
            INFO_FORMAT: 'text/html',
            LAYERS: 'children_layer',
            QUERY_LAYERS: 'children_layer',
            STYLE: "",
            FEATURE_COUNT: "10",
            FILTER: 'children_layer:"parent_id" = \'1\'',
            WITH_DISPLAY_NAME: "true",
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeHtml();

        let htmlRoot = parseHtml(await response.text());
        /** @type {parseHtml.HTMLElement[]} htmlElements */
        let htmlElements = htmlRoot.childNodes.filter(n => n.nodeType === 1);
        expect(htmlElements).toHaveLength(3);

        // The display expression of children_layer is "comment"
        const expectedDisplayNames = {
            '2': 'first comment',
            '3': 'second comment',
        };
        for (const [featureId, displayName] of Object.entries(expectedDisplayNames)) {
            let featureDiv = htmlRoot.querySelector(
                `div.lizmapPopupSingleFeature[data-feature-id="${featureId}"]`
            );
            expect(featureDiv).not.toBeNull();
            popupExpect(featureDiv).toBeLizmapPopupSingleFeature();
            expect(featureDiv?.getAttribute('data-feature-display-name')).toBe(displayName);
            expect(featureDiv?.querySelectorAll('tr[data-field-name="displayName"]')).toHaveLength(0);
        }
    });

    // The display name is only requested when WITH_DISPLAY_NAME is "true"
    for (const withDisplayName of [null, 'false']) {
        test(`Click on map without display name - WITH_DISPLAY_NAME: ${withDisplayName}`, async({ request }) => {
            let params = new URLSearchParams({
                repository: 'testsrepository',
                project: 'feature_toolbar',
                SERVICE: 'WMS',
                VERSION: '1.3.0',
                REQUEST: 'GetFeatureInfo',
                INFO_FORMAT: 'text/html',
                LAYERS: 'parent_layer',
                QUERY_LAYERS: 'parent_layer',
                STYLE: "défaut",
                CRS: "EPSG:2154",
                BBOX: "599285.8893180595,6165210.947246418,944567.8298819406,6393414.528653582",
                WIDTH: "870",
                HEIGHT: "575",
                FEATURE_COUNT: "10",
                I: "436",
                J: "290",
                FI_POINT_TOLERANCE: "25",
                FI_LINE_TOLERANCE: "10",
                FI_POLYGON_TOLERANCE: "5",
            });
            if (withDisplayName !== null) {
                params.set('WITH_DISPLAY_NAME', withDisplayName);
            }
            let url = `/index.php/lizmap/service?${params}`;
            let response = await request.get(url, {});
            // check response
            responseExpect(response).toBeHtml();

            let htmlRoot = parseHtml(await response.text());
            let featureDivs = htmlRoot.querySelectorAll('div.lizmapPopupSingleFeature');
            expect(featureDivs).toHaveLength(2);
            for (const featureDiv of featureDivs) {
                popupExpect(featureDiv).toBeLizmapPopupSingleFeature();
                expect(featureDiv.hasAttribute('data-feature-display-name')).toBe(false);
                expect(featureDiv.querySelectorAll('tr[data-field-name="displayName"]')).toHaveLength(0);
            }
        });
    }

    test('Error: Layer not in project', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'feature_toolbar',
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetFeatureInfo',
            INFO_FORMAT: 'text/html',
            LAYERS: 'unknown', // 'parent_layer',
            QUERY_LAYERS: 'unknown', // 'parent_layer',
            STYLE: "défaut",
            CRS: "EPSG:2154",
            BBOX: "599285.8893180595,6165210.947246418,944567.8298819406,6393414.528653582",
            WIDTH: "870",
            HEIGHT: "575",
            FEATURE_COUNT: "10",
            I: "436",
            J: "290",
            FI_POINT_TOLERANCE: "25",
            FI_LINE_TOLERANCE: "10",
            FI_POLYGON_TOLERANCE: "5",
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml(400);
    });
});
