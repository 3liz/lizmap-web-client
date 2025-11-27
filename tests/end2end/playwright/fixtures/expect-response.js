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
     * Expecting the response is a valid JSON
     * @param {APIResponse} response the response to test
     *
     * @returns {MatcherReturnType} the result
     */
    toBeJson(response) {
        const assertionName = 'toBeJson';
        let pass = true;
        try {
            // check response status
            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
            // check content-type header
            expect(response.headers()['content-type']).toContain('application/json');
        } catch {
            pass = false;
        }

        if (this.isNot) {
            pass =!pass;
        }

        const message = pass
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Response is JSON: ${response.status()} ${response.headers()['content-type']}`
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Response is not JSON: ${response.status()} ${response.headers()['content-type']}`;

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
    }
});
