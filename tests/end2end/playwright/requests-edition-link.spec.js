// @ts-check
import { test } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js';
import { getAuthStorageStatePath } from './globals';

/**
 * Playwright API request context
 * @typedef {import('@playwright/test').APIRequestContext} APIRequestContext
 */

/**
 * Playwright API response
 * @typedef {import('@playwright/test').APIResponse} APIResponse
 */

/**
 * Tests of the edition requests used to link and unlink features,
 * from the attribute table and the popup.
 *
 * They must do the same checks as the other edition requests: right to use
 * the edition tools, layer editable by the user, and only the fields of the
 * project relations can be updated.
 * Each request is refused before any data is modified.
 */

// Project and layer editable by the groups admins, group_a and group_b
const repository = 'testsrepository';
const project = 'attribute_table_editable_features';
const layerId = 'filter_layer_by_user_c733b070_38ab_425b_8c52_ae331633dcc6';

/**
 * Send a link or unlink request.
 * @param {APIRequestContext} request the request context
 * @param {string} action the edition action: linkFeatures or unlinkChild
 * @param {{[key: string]: string}} params the parameters of the action
 * @returns {Promise<APIResponse>} the response, with the Jelix messages as text
 */
async function sendLinkRequest(request, action, params) {
    const response = await request.post(`/index.php/lizmap/edition/${action}`, {
        form: { repository: repository, project: project, ...params },
    });
    responseExpect(response).toBeTextPlain();

    return response;
}

// Unlink a child feature, with a field which is not a relation field
const unlinkParams = {
    lid: layerId,
    pkey: 'gid',
    fkey: 'user',
    pkeyval: '1',
};

// Link features of the layer, with a field which is not a relation field
const linkParams = {
    features1: `${layerId}:gid:1`,
    features2: `${layerId}:user:2`,
    pivot: layerId,
};

test.describe('Edition link - not connected - @requests @readonly', () => {

    /**
     * An anonymous user cannot use the edition tools.
     */
    test('Unlink and link are refused', async ({ request }) => {
        const denied = 'You have not the right to use the edition tools.';
        await responseExpect(await sendLinkRequest(request, 'unlinkChild', unlinkParams))
            .toContainJelixMessage(denied, 'AuthorizationRequired');
        await responseExpect(await sendLinkRequest(request, 'linkFeatures', linkParams))
            .toContainJelixMessage(denied, 'AuthorizationRequired');
    });
});

test.describe('Edition link - admin - @requests @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('admin') });

    /**
     * The admin can edit the layer, but only the fields of the project
     * relations can be updated: the layer has no relation.
     */
    test('Fields which are not relation fields are refused', async ({ request }) => {
        const refused = 'Given fields do not exist.';
        await responseExpect(await sendLinkRequest(request, 'unlinkChild', unlinkParams))
            .toContainJelixMessage(refused, 'error');
        await responseExpect(await sendLinkRequest(request, 'linkFeatures', linkParams))
            .toContainJelixMessage(refused, 'error');
    });
});
