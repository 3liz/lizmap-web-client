// @ts-check
import { expect as baseExpect } from '@playwright/test';

/**
 * @typedef {import('@playwright/test').MatcherReturnType} MatcherReturnType
 */

/**
 * Playwright Request
 * @typedef {import('@playwright/test').Request} Request
 */

/**
 * Playwright APIRequest
 * @typedef {import('@playwright/test').APIRequest} APIRequest
 */

/**
 * Check that the search params contains the expected parameters
 *
 * @param {URLSearchParams} searchParams The search aprams to test
 * @param {{[key: string]: string|RegExp}} expectedParameters  List of expected parameters
 *
 * @returns {{pass: boolean, message: string}} the result
 */
const containParameters = (searchParams, expectedParameters) => {
    let pass = true;

    const expectedKeys = Object.keys(expectedParameters);
    if (searchParams.size < expectedKeys.length) {
        pass = false;
    }
    /** @type {string[]} */
    let missingParameters = [];
    /** @type {[string, string][]} */
    let invalidParameters = [];
    // Check if all expected parameters are present in the request
    // and validate their values
    for (const param in expectedParameters) {
        if (!searchParams.has(param)) {
            pass = false;
            missingParameters.push(param);
            continue;
        }
        const expectedValue = expectedParameters[param]
        const val = searchParams.get(param) ?? '';
        if (expectedValue instanceof RegExp) {
            if ((new RegExp(expectedValue)).exec(val) !== null) {
                continue;
            }
            pass = false;
            invalidParameters.push([param, val]);
        } else {
            if (expectedValue === val) {
                continue;
            }
            invalidParameters.push([param, val]);
            pass = false;
        }
    }

    const expected = `${JSON.stringify(
        expectedParameters,
        (key, value) => value instanceof RegExp ? value.toString() : value,
        1
    )}`
    const received = `${JSON.stringify(
        Object.fromEntries(searchParams.entries()), null, 1
    )}`;
    const message = '' +
        (missingParameters.length > 0 ? `Missing parameters: ${missingParameters.join(', ')}\n` : '') +
        (invalidParameters.length > 0 ? `Invalid parameters: ${JSON.stringify(
            Object.fromEntries(invalidParameters), null, 1
        )}\n` : '') +
        `Expected: ${expected}\n`+
        `Received: ${received}`;

    return {
        pass: pass,
        message: message,
    }
}

export const expect = baseExpect.extend({
    /**
     * Expected the request url to contain parameters
     *
     * @param {Request|null} request The request to test
     * @param {{[key: string]: string|RegExp}} expectedParameters  List of expected parameters
     *
     * @returns {MatcherReturnType} the result
     */
    toContainParametersInUrl(request, expectedParameters) {
        const assertionName = 'toContainParametersInUrl';
        let pass = request !== null;
        const searchParams = new URLSearchParams(request?.url().split('?')[1] ?? '');

        const values = containParameters(searchParams, expectedParameters);
        pass = (pass && values.pass);

        if (this.isNot) {
            pass =!pass;
        }

        const message = pass
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'The request contains the expected parameters in URL\n'+
                values.message
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'The request does not contain the expected parameters in URL\n'+
                values.message;

        return {
            message,
            pass,
            name: assertionName,
            expected: expectedParameters,
        };
    },

    /**
     *Expected the request url to contain parameters
     *
     * @param {Request|null} request The request to test
     * @param {{[key: string]: string|RegExp}} expectedParameters  List of expected parameters
     *
     * @returns {MatcherReturnType} the result
     */
    toContainParametersInPostData(request, expectedParameters) {
        const assertionName = 'toContainParametersInPostData';
        let pass = request !== null;
        const searchParams = new URLSearchParams(request?.postData() ?? '')

        const values = containParameters(searchParams, expectedParameters);
        pass = (pass && values.pass);

        if (this.isNot) {
            pass =!pass;
        }

        const message = pass
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'The request contains the expected parameters in POST Data\n'+
                values.message
            : () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                'The request does not contain the expected parameters in POST Data\n'+
                values.message;

        return {
            message,
            pass,
            name: assertionName,
            expected: expectedParameters,
        };
    }
})
