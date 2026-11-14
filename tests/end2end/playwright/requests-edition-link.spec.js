// @ts-check
import { test, expect } from '@playwright/test';
import { getAuthStorageStatePath } from './globals';

/**
 * Playwright API request context
 * @typedef {import('@playwright/test').APIRequestContext} APIRequestContext
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
 * Send a link or unlink request and get the message of the response.
 * @param {APIRequestContext} request the request context
 * @param {string} action the edition action: linkFeatures or unlinkChild
 * @param {{[key: string]: string}} params the parameters of the action
 * @returns {Promise<string>} the text of the message
 */
async function getMessage(request, action, params) {
    const response = await request.post(`/index.php/lizmap/edition/${action}`, {
        form: { repository: repository, project: project, ...params },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.text();

    // The message is in the HTML fragment
    const match = body.match(/<li class="jelix-msg-item-[^"]*">([^<]*)<\/li>/);
    expect(match).not.toBeNull();

    return match ? match[1] : '';
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
        expect(await getMessage(request, 'unlinkChild', unlinkParams)).toBe(denied);
        expect(await getMessage(request, 'linkFeatures', linkParams)).toBe(denied);
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
        expect(await getMessage(request, 'unlinkChild', unlinkParams)).toBe(refused);
        expect(await getMessage(request, 'linkFeatures', linkParams)).toBe(refused);
    });
});
