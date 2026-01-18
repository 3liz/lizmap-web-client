// @ts-check
import { expect as baseExpect } from '@playwright/test';

/**
 * @typedef {import('@playwright/test').MatcherReturnType} MatcherReturnType
 */

/**
 * Playwright Response
 * @typedef {import('@playwright/test').Response} Response
 */

/**
 * Playwright APIResponse
 * @typedef {import('@playwright/test').APIResponse} APIResponse
 */

export const expect = baseExpect.extend({
    /**
     * Expecting the response is a valid image PNG
     * @param {APIResponse|Response|null} response the response to test
     *
     * @returns {MatcherReturnType} the result
     */
    toBeImagePng(response) {
        const assertionName = 'toBeImagePng';
        let pass = response !== null;
        try {
            if (pass) {
                // check response status
                expect(response?.ok()).toBeTruthy();
                expect(response?.status()).toBe(200);
                // check content-type header
                expect(response?.headers()['content-type']).toContain('image/png');
            }
        } catch {
            pass = false;
        }

        if (this.isNot) {
            pass =!pass;
        }

        const received = (response !== null ? `${response?.status()} ${response?.headers()['content-type']}` : 'null');

        const message = pass
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'Response is image PNG\n'+
                `Received: ${received}`
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'Response is not image PNG\n'+
                `Received: ${received}`;

        return {
            message,
            pass,
            name: assertionName,
        };
    },

    /**
     * Expecting the response is a valid Text plain
     * @param {APIResponse|Response|null} response the response to test
     *
     * @returns {MatcherReturnType} the result
     */
    toBeTextPlain(response) {
        const assertionName = 'toBeTextPlain';
        let pass = response !== null;
        try {
            if (pass) {
                // check response status
                expect(response?.ok()).toBeTruthy();
                expect(response?.status()).toBe(200);
                // check content-type header
                expect(response?.headers()['content-type']).toContain('text/plain');
            }
        } catch {
            pass = false;
        }

        if (this.isNot) {
            pass =!pass;
        }

        const received = (response !== null ? `${response?.status()} ${response?.headers()['content-type']}` : 'null');

        const message = pass
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'Response is Text plain\n'+
                `Received: ${received}`
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'Response is not Text plain\n'+
                `Received: ${received}`;

        return {
            message,
            pass,
            name: assertionName,
        };
    },

    /**
     * Expecting the response is a valid HTML
     * @param {APIResponse|Response|null} response the response to test
     *
     * @returns {MatcherReturnType} the result
     */
    toBeHtml(response) {
        const assertionName = 'toBeHtml';
        let pass = response !== null;
        try {
            if (pass) {
                // check response status
                expect(response?.ok()).toBeTruthy();
                expect(response?.status()).toBe(200);
                // check content-type header
                expect(response?.headers()['content-type']).toContain('text/html');
            }
        } catch {
            pass = false;
        }

        if (this.isNot) {
            pass =!pass;
        }

        const received = (response !== null ? `${response?.status()} ${response?.headers()['content-type']}` : 'null');

        const message = pass
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'Response is HTML\n'+
                `Received: ${received}`
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'Response is not HTML\n'+
                `Received: ${received}`;

        return {
            message,
            pass,
            name: assertionName,
        };
    },
    /**
     * Expecting the response is a valid XML
     * @param {APIResponse|Response|null} response the response to test
     * @param {number} status the response status
     *
     * @returns {MatcherReturnType} the result
     */
    toBeXml(response, status=200) {
        const assertionName = 'toBeXml';
        let pass = response !== null;
        try {
            if (pass) {
                // check response status
                if (status < 300) {
                    expect(response?.ok()).toBeTruthy();
                }
                expect(response?.status()).toBe(status);
                // check content-type header
                expect(response?.headers()['content-type']).toContain('text/xml');
            }
        } catch {
            pass = false;
        }

        if (this.isNot) {
            pass =!pass;
        }

        const received = (response !== null ? `${response?.status()} ${response?.headers()['content-type']}` : 'null');

        const message = pass
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'Response is XML\n'+
                `Received: ${received}`
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'Response is not XML\n'+
                `Received: ${received}`;

        return {
            message,
            pass,
            name: assertionName,
        };
    },

    /**
     * Expecting the response is a valid JSON
     * @param {APIResponse|Response|null} response the response to test
     * @param {number} status the response status
     *
     * @returns {MatcherReturnType} the result
     */
    toBeJson(response, status=200) {
        const assertionName = 'toBeJson';
        let pass = response !== null;
        try {
            if (pass) {
                // check response status
                if (status < 300) {
                    expect(response?.ok()).toBeTruthy();
                }
                expect(response?.status()).toBe(status);
                // check content-type header
                expect(response?.headers()['content-type']).toContain('application/json');
            }
        } catch {
            pass = false;
        }

        if (this.isNot) {
            pass =!pass;
        }

        const received = (response !== null ? `${response?.status()} ${response?.headers()['content-type']}` : 'null');

        const message = pass
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'Response is JSON\n'+
                `Received: ${received}`
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'Response is not JSON\n'+
                `Received: ${received}`;

        return {
            message,
            pass,
            name: assertionName,
        };
    },

    /**
     * Expecting the response is a valid GeoJSON
     * @param {APIResponse|Response|null} response the response to test
     *
     * @returns {MatcherReturnType} the result
     */
    toBeGeoJson(response) {
        const assertionName = 'toBeGeoJson';
        let pass = response !== null;
        try {
            if (pass) {
                // check response status
                expect(response?.ok()).toBeTruthy();
                expect(response?.status()).toBe(200);
                // check content-type header
                expect(response?.headers()['content-type']).toContain('application/vnd.geo+json');
            }
        } catch {
            pass = false;
        }

        if (this.isNot) {
            pass =!pass;
        }

        const received = (response !== null ? `${response?.status()} ${response?.headers()['content-type']}` : 'null');

        const message = pass
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'Response is GeoJSON\n'+
                `Received: ${received}`
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'Response is not GeoJSON\n'+
                `Received: ${received}`;

        return {
            message,
            pass,
            name: assertionName,
        };
    },

    /**
     * Expecting the response is a GeoJSON with numberOfFeatures property to expected
     * @param {APIResponse} response the response to test
     * @param {number} expected the expected value of numberOfFeatures property
     *
     * @returns {Promise<MatcherReturnType>} the result
     */
    async toHaveGeoJsonNumberOfFeatures(response, expected) {
        const assertionName = 'toBeGeoJsonNumberOfFeatures';
        let pass = true;
        /** @type {MatcherReturnType} matcherResult */
        let matcherResult = {
            message: () => '',
            pass: pass,
            name: assertionName,
            expected: expected,
            actual: '',
        };
        const response_body = await response.body();
        try {
            let body = await response.json();
            expect(body).toHaveProperty('type', 'FeatureCollection');
            expect(body).toHaveProperty('timeStamp');
            expect(body).toHaveProperty('numberOfFeatures', expected);
        } catch(/** @type {any} */ e) {
            matcherResult = e.matcherResult;
            pass = false;
        }

        if (this.isNot) {
            pass =!pass;
        }

        const message = pass
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: Response not to be JSON with property numberOfFeatures: ${this.utils.printExpected(expected)}\n`+
                `Actual: ${response_body} - ${matcherResult?.message()}`
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: Response to be JSON with property numberOfFeatures: ${this.utils.printExpected(expected)}\n`+
                `Actual: ${response_body} - ${matcherResult?.message()}`

        return {
            message,
            pass,
            name: assertionName,
            expected: expected,
            actual: matcherResult?.actual,
        };
    },

    /**
     * Expecting the response is a JSON Lizmap Config
     * @param {APIResponse} response the response to test
     *
     * @returns {Promise<MatcherReturnType>} the result
     */
    async toBeLizmapConfig(response) {
        const assertionName = 'toBeLizmapConfig';
        let pass = true;
        /** @type {MatcherReturnType} matcherResult */
        let matcherResult = {
            message: () => '',
            pass: pass,
            name: assertionName,
        };
        const response_body = await response.body();
        try {
            expect(response).toBeJson();
            let body = await response.json();

            expect(body).toHaveProperty('metadata');
            expect(body.metadata).toHaveProperty('qgis_desktop_version');
            expect(body.metadata).toHaveProperty('lizmap_plugin_version');
            expect(body.metadata).toHaveProperty('lizmap_plugin_version_str');
            expect(body.metadata).toHaveProperty('lizmap_web_client_target_version');
            expect(body.metadata).toHaveProperty('lizmap_web_client_target_status');

            expect(body).toHaveProperty('warnings');

            expect(body).toHaveProperty('options');
            expect(body.options).toHaveProperty('bbox');
            expect(body.options).toHaveProperty('initialExtent');
            expect(body.options).toHaveProperty('mapScales');
            expect(body.options).toHaveProperty('minScale');
            expect(body.options).toHaveProperty('maxScale');
            expect(body.options).toHaveProperty('projection');
            expect(body.options).toHaveProperty('pointTolerance');
            expect(body.options).toHaveProperty('lineTolerance');
            expect(body.options).toHaveProperty('polygonTolerance');
            expect(body.options).toHaveProperty('popupLocation');
            expect(body.options).toHaveProperty('datavizLocation');
            expect(body.options).toHaveProperty('wmsMaxHeight');
            expect(body.options).toHaveProperty('wmsMaxWidth');

            expect(body).toHaveProperty('layers');

            expect(body).toHaveProperty('locateByLayer');

            expect(body).toHaveProperty('attributeLayers');

            expect(body).toHaveProperty('timemanagerLayers');

            expect(body).toHaveProperty('relations');
            expect(body.relations).toHaveProperty('pivot');

            expect(body).toHaveProperty('printTemplates');

            expect(body).toHaveProperty('layouts');
            expect(body.layouts).toHaveProperty('config');
            expect(body.layouts.config).toHaveProperty('default_popup_print');
            expect(body.layouts).toHaveProperty('list');

            expect(body).toHaveProperty('atlas');
            expect(body.atlas).toHaveProperty('layers');

            expect(body).toHaveProperty('tooltipLayers');

            expect(body).toHaveProperty('formFilterLayers');

            expect(body).toHaveProperty('datavizLayers');
            expect(body.datavizLayers).toHaveProperty('locale');
            expect(body.datavizLayers).toHaveProperty('layers');
            expect(body.datavizLayers).toHaveProperty('dataviz');

            expect(body).toHaveProperty('loginFilteredLayers');

            expect(body).toHaveProperty('filter_by_polygon');
            expect(body.filter_by_polygon).toHaveProperty('config');
            expect(body.filter_by_polygon.config).toHaveProperty('filter_by_user');
            expect(body.filter_by_polygon.config).toHaveProperty('group_field');
            expect(body.filter_by_polygon.config).toHaveProperty('polygon_layer_id');
            expect(body.filter_by_polygon).toHaveProperty('layers');
        } catch(/** @type {any} */ e) {
            matcherResult = e.matcherResult;
            if (typeof matcherResult?.message !== 'function') {
                const message = matcherResult?.message
                matcherResult.message = () => message;
            }
            pass = false;
        }

        if (this.isNot) {
            pass =!pass;
        }

        const message = pass
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: Response not to be JSON Lizmap config\n`+
                `Actual: ${response_body} - ${matcherResult?.message()}`
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Expected: Response to be JSON  Lizmap config\n`+
                `Actual: ${response_body} - ${matcherResult?.message()}`

        return {
            message,
            pass,
            name: assertionName,
        };
    },
});
