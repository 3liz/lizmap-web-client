// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js';
import { getAuthStorageStatePath } from './globals';

/**
 * Playwright API request context
 * @typedef {import('@playwright/test').APIRequestContext} APIRequestContext
 */

/**
 * A row of the filter service response
 * @typedef {{[key: string]: string|number|null}} FilterRow
 */

/**
 * Tests of the filter service, used by the form filter and the time manager
 * to get the feature count, the unique values, the min and max values and
 * the extent of a layer.
 *
 * The service must return the same data as WFS: the filter by login and
 * the filter by polygon must be applied, unless the user can override them,
 * and only the layers configured for the filter tools can be queried.
 */

// The filter service URL
const url = '/index.php/filter/service';

// Layer filtered by login: 3 features, one for admin, one for
// user_in_group_a and user_in_group_b, and one without user
const loginParams = {
    repository: 'testsrepository',
    project: 'filter_layer_by_user',
    layerId: 'filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0',
};

// Layer filtered by polygon: 17 features, 4 in the polygons of the group_a
const polygonParams = {
    repository: 'testsrepository',
    project: 'filter_layer_data_by_polygon_for_groups',
    layerId: 'shop_bakery_pg_403084fe_041d_4ede_a2dc_cd9866a53623',
};

/**
 * Request the filter service and get the JSON rows of the response.
 *
 * The filter service returns the rows of the SQL query as a JSON array.
 * @param {APIRequestContext} request the request context
 * @param {{[key: string]: string}} layerParams the repository, project and layer id
 * @param {{[key: string]: string}} params the request and its parameters
 * @returns {Promise<FilterRow[]>} the rows of the response
 */
async function getRows(request, layerParams, params) {
    const searchParams = new URLSearchParams({...layerParams, ...params});
    const response = await request.get(`${url}?${searchParams}`);
    responseExpect(response).toBeJson();
    const json = await response.json();
    // The response must contain data and not errors
    expect(json).not.toHaveProperty('errors');
    expect(Array.isArray(json)).toBeTruthy();

    return json;
}

/**
 * Get the number of features returned by the getFeatureCount request.
 * @param {APIRequestContext} request the request context
 * @param {{[key: string]: string}} layerParams the repository, project and layer id
 * @param {string} filter the SQL filter sent by the client
 * @returns {Promise<number>} the number of features
 */
async function getFeatureCount(request, layerParams, filter = '') {
    const rows = await getRows(request, layerParams, { request: 'getFeatureCount', filter: filter });
    expect(rows).toHaveLength(1);

    // The count is returned as a string by the PostgreSQL driver
    return Number(rows[0].c);
}

/**
 * Get the unique values of the "user" field of the layer filtered by login.
 * @param {APIRequestContext} request the request context
 * @returns {Promise<Array<string|number|null>>} the unique values
 */
async function getUserUniqueValues(request) {
    const rows = await getRows(request, loginParams, { request: 'getUniqueValues', fieldname: 'user' });

    return rows.map(row => row.v);
}

/**
 * Get the min and max values of the "gid" field of the layer filtered by login.
 * @param {APIRequestContext} request the request context
 * @returns {Promise<{min: number|null, max: number|null}>} the min and max values
 */
async function getGidMinAndMax(request) {
    const rows = await getRows(request, loginParams, { request: 'getMinAndMaxValues', fieldname: 'gid' });
    expect(rows).toHaveLength(1);

    // The values are returned as strings by the PostgreSQL driver
    return {
        min: rows[0].min === null ? null : Number(rows[0].min),
        max: rows[0].max === null ? null : Number(rows[0].max),
    };
}

/**
 * Get the extent returned by the getExtent request, as a GeoJSON string.
 * @param {APIRequestContext} request the request context
 * @param {{[key: string]: string}} layerParams the repository, project and layer id
 * @returns {Promise<string|number|null>} the extent, null if there is no feature
 */
async function getExtent(request, layerParams) {
    const rows = await getRows(request, layerParams, { request: 'getExtent', crs: 'EPSG:4326' });
    expect(rows).toHaveLength(1);

    return rows[0].bbox;
}

/**
 * Request the filter service and check that an error is returned.
 *
 * The errors are returned with an HTTP error status code. The errors about
 * the project or the layer are returned by the controller in an "errors"
 * property, the errors about the request parameters, like the field name,
 * are returned directly by the request.
 * @param {APIRequestContext} request the request context
 * @param {{[key: string]: string}} params the layer, the request and its parameters
 * @param {number} status the expected HTTP status code
 * @param {string} detail the expected error detail
 * @param {boolean} inErrorsProperty true if the error is in an "errors" property
 */
async function expectError(request, params, status, detail, inErrorsProperty = true) {
    const searchParams = new URLSearchParams(params);
    const response = await request.get(`${url}?${searchParams}`);
    // A JSON error with the expected status code
    responseExpect(response).toBeJson(status);
    let error = await response.json();
    if (inErrorsProperty) {
        expect(error).toHaveProperty('errors');
        error = error.errors;
    }
    expect(error).toHaveProperty('status', 'error');
    expect(error).toHaveProperty('code', status);
    expect(error).toHaveProperty('detail', detail);
}

test.describe('Filter API - requests - @requests @readonly', () => {

    /**
     * An unknown request returns a client error.
     */
    test('Error: Request not supported', async ({ request }) => {
        await expectError(
            request,
            {...loginParams, request: 'getAllValues'},
            400,
            'The request "getAllValues" is not supported!'
        );
    });

    /**
     * An unknown project returns a not found error.
     */
    test('Error: Project not found', async ({ request }) => {
        await expectError(
            request,
            {...loginParams, project: 'unknown_project'},
            404,
            'The lizmap project UNKNOWN_PROJECT does not exist !'
        );
    });
});

test.describe('Filter API - layers - @requests @readonly', () => {

    /**
     * A layer of the project which is not used by the form filter nor by
     * the time manager cannot be queried.
     */
    test('Error: Layer not configured for the filter tools', async ({ request }) => {
        const layerId = 'layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f';
        await expectError(
            request,
            {...loginParams, layerId: layerId, request: 'getFeatureCount'},
            400,
            `The layer ${layerId} is not configured for the filter tools`
        );
    });

    /**
     * An unknown layer returns a JSON error, and not a server error.
     */
    test('Error: Layer not in project', async ({ request }) => {
        await expectError(
            request,
            {...loginParams, layerId: 'unknown_layer', request: 'getFeatureCount'},
            400,
            'The layer unknown_layer is not configured for the filter tools'
        );
    });
});

test.describe('Filter API - fields - @requests @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('admin') });

    /**
     * The field "group" exists in the table, but it is not used by the form
     * filter nor by the time manager: its values cannot be queried,
     * even by an admin.
     */
    test('Error: Unique values of a field not configured for the filter tools', async ({ request }) => {
        await expectError(
            request,
            {...loginParams, request: 'getUniqueValues', fieldname: 'group'},
            400,
            'The field group is not configured for the filter tools',
            false
        );
    });

    /**
     * The min and max values can only be queried for configured fields:
     * the primary key "gid" is allowed, not the field "group".
     */
    test('Error: Min and max values of a field not configured for the filter tools', async ({ request }) => {
        await expectError(
            request,
            {...loginParams, request: 'getMinAndMaxValues', fieldname: 'gid,group'},
            400,
            'The field group is not configured for the filter tools',
            false
        );
    });
});

test.describe('Filter API - not connected - @requests @readonly', () => {

    /**
     * An anonymous user only gets the features for all users: there is none.
     * The filter sent by the client cannot get around the filter by login.
     */
    test('Filter by login is applied', async ({ request }) => {
        expect(await getFeatureCount(request, loginParams)).toBe(0);
        expect(await getFeatureCount(request, loginParams, '"gid" > 0')).toBe(0);
        expect(await getUserUniqueValues(request)).toEqual([]);
        expect(await getGidMinAndMax(request)).toEqual({ min: null, max: null });
        expect(await getExtent(request, loginParams)).toBeNull();
    });

    /**
     * An anonymous user has no polygon: no feature is returned.
     */
    test('Filter by polygon is applied', async ({ request }) => {
        expect(await getFeatureCount(request, polygonParams)).toBe(0);
        expect(await getExtent(request, polygonParams)).toBeNull();
    });
});

test.describe('Filter API - user in group a - @requests @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('user_in_group_a') });

    /**
     * The user only gets the feature of user_in_group_a and user_in_group_b.
     * The filter sent by the client cannot get around the filter by login.
     */
    test('Filter by login is applied', async ({ request }) => {
        expect(await getFeatureCount(request, loginParams)).toBe(1);
        expect(await getFeatureCount(request, loginParams, '"gid" > 0')).toBe(1);
        expect(await getUserUniqueValues(request)).toEqual(['user_in_group_a,user_in_group_b']);
        expect(await getGidMinAndMax(request)).toEqual({ min: 2, max: 2 });
        expect(await getExtent(request, loginParams)).not.toBeNull();
    });

    /**
     * The user only gets the features in the polygons of the group_a.
     */
    test('Filter by polygon is applied', async ({ request }) => {
        expect(await getFeatureCount(request, polygonParams)).toBe(4);
        expect(await getExtent(request, polygonParams)).not.toBeNull();
    });
});

test.describe('Filter API - admin - @requests @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('admin') });

    /**
     * The admin can override the filter by login and gets all the features.
     * The filter sent by the client is still applied.
     */
    test('Filter by login is overridden', async ({ request }) => {
        expect(await getFeatureCount(request, loginParams)).toBe(3);
        expect(await getFeatureCount(request, loginParams, '"gid" = 3')).toBe(1);
        const values = await getUserUniqueValues(request);
        expect(values).toHaveLength(3);
        expect(values).toEqual(expect.arrayContaining(['admin', 'user_in_group_a,user_in_group_b', null]));
        expect(await getGidMinAndMax(request)).toEqual({ min: 1, max: 3 });
        expect(await getExtent(request, loginParams)).not.toBeNull();
    });

    /**
     * The admin can override the filter by polygon and gets all the features.
     */
    test('Filter by polygon is overridden', async ({ request }) => {
        expect(await getFeatureCount(request, polygonParams)).toBe(17);
        expect(await getExtent(request, polygonParams)).not.toBeNull();
    });
});
