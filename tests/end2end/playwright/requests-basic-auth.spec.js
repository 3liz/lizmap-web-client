// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js';
import { requestGETWithAdminBasicAuth, getAuthStorageStatePath } from './globals';

/**
 * Playwright API request context and response
 * @typedef {import('@playwright/test').APIRequestContext} APIRequestContext
 * @typedef {import('@playwright/test').APIResponse} APIResponse
 */

const metadataUrl = 'index.php/view/app/metadata';

/**
 * Build the value of an Authorization header for a BASIC authentication
 * @param {string} login The login
 * @param {string} password The password
 * @returns {string} The header value
 */
function basicAuth(login, password) {
    return 'Basic ' + btoa(`${login}:${password}`);
}

/**
 * Request the metadata and return the QGIS Server information, only visible for admins
 * @param {APIRequestContext} request The request context, with its cookies
 * @param {object} headers The request headers
 * @returns {Promise<{error?: string, metadata?: {name?: string}}>} The qgis_server_info property of the JSON response
 */
async function qgisServerInfo(request, headers = {}) {
    const response = await request.get(metadataUrl, { headers: headers });
    responseExpect(response).toBeJson();
    const json = await response.json();
    return json.qgis_server_info;
}

test.describe('BASIC authentication is stateless, not connected from context',
    {
        tag: ['@requests', '@readonly'],
    },
    () => {

        test('Metadata: the BASIC user is not kept in the session', async ({ request }) => {
            // Authenticated as admin with BASIC credentials
            let info = await qgisServerInfo(request, { authorization: basicAuth('admin', 'admin') });
            expect(info.metadata.name).toBeDefined();

            // Same cookies, without credentials: anonymous
            info = await qgisServerInfo(request);
            expect(info.error).toBe('NO_ACCESS');
        });

        test('Service: the BASIC user is not kept after an early error', async ({ request }) => {
            // Unknown service: the controller returns before the end of the action
            const response = await requestGETWithAdminBasicAuth(
                request,
                'index.php/lizmap/service?repository=testsrepository&project=events&SERVICE=UNKNOWN'
            );
            // 501: ServiceNotSupported
            expect(response.status()).toBe(501);

            // Same cookies, without credentials: anonymous
            const info = await qgisServerInfo(request);
            expect(info.error).toBe('NO_ACCESS');
        });
    });

test.describe('BASIC authentication is stateless, connected as admin from context',
    {
        tag: ['@requests', '@readonly'],
    },
    () => {

        test.use({ storageState: getAuthStorageStatePath('admin') });

        test('Metadata: the session user is not replaced by the BASIC user', async ({ request }) => {
            // Authenticated as user_in_group_a with BASIC credentials, for this request only
            let info = await qgisServerInfo(request, { authorization: basicAuth('user_in_group_a', 'admin') });
            expect(info.error).toBe('NO_ACCESS');

            // Same cookies, without credentials: still connected as admin
            info = await qgisServerInfo(request);
            expect(info.metadata.name).toBeDefined();
        });

        test('Admin API: wrong credentials are refused, even with a session', async ({ request }) => {
            const response = await request.get(
                'api.php/admin/repositories',
                { headers: { authorization: basicAuth('admin', 'wrong-password') } }
            );
            expect(response.status()).toBe(401);
        });
    });
