// @ts-check
import { test, expect } from '@playwright/test';
import { getAuthStorageStatePath } from './globals';

/**
 * Playwright Page
 * @typedef {import('@playwright/test').APIResponse} APIResponse
 */

const url = 'index.php/view/app/metadata';

/**
 * Check for a JSON response about the metadata
 * @param {APIResponse} response The response object
 * @returns {Promise<any>} The JSON response
 */
export async function checkJson(response) {
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('application/json');
    const json = await response.json();

    // LWC metadata are always accessible...
    expect(json.info.version).toBeDefined();
    expect(json.info.date).toBeDefined();
    expect(json.info.commit).toBeDefined();
    return json;
}

test.describe('Not connected from context, so testing basic auth',
    {
        tag: ['@requests', '@readonly'],
    }, () => {

        test('As anonymous', async ({request}) => {
            const response = await request.get(url, {});
            const json = await checkJson(response);
            // Only testing the access to qgis_server_info
            expect(json.qgis_server_info.error).toBe("NO_ACCESS")
        });

        test('Wrong credentials', async ({request}) => {
            const response = await request.get(
                url,
                {
                    headers: {
                        authorization: 'Basic dXNlcl9pbl9ncm91cF9hOm1hdXZhaXM'
                    }
                });
            const json = await checkJson(response);
            // Only testing the access to qgis_server_info
            expect(json.qgis_server_info.error).toBe("WRONG_CREDENTIALS")
        });

        test('As admin', async ({request}) => {
            const response = await request.get(
                url,
                {
                    headers: {
                        authorization: 'Basic YWRtaW46YWRtaW4=',
                    }
                });
            const json = await checkJson(response);
            // Only testing the access to qgis_server_info
            expect(json.qgis_server_info.metadata.name).toBeDefined();
        });
    });

test.describe('Connected from context, as a normal user',
    {
        tag: ['@requests', '@readonly'],
    },
    () => {

        test.use({ storageState: getAuthStorageStatePath('user_in_group_a') });

        test('Request metadata', async ({ request }) => {
            const response = await request.get(url, {});
            const json = await checkJson(response);
            // Only testing the access to qgis_server_info
            expect(json.qgis_server_info.error).toBe("NO_ACCESS");
        });
    });

test.describe('Connected from context, as a publisher',
    {
        tag: ['@requests', '@readonly'],
    },
    () => {

        test.use({ storageState: getAuthStorageStatePath('publisher') });

        test('Checking JSON metadata content as a publisher', async ({ request }) => {
            const response = await request.get(url, {});
            const json = await checkJson(response);
            // More checks are done on admin tests below
            expect(json.qgis_server_info.metadata.name).toBeDefined();

            // Desktop plugin
            expect(json.lizmap_desktop_plugin_version).toBeGreaterThan(10000);

            // Repositories
            expect(json.repositories.testsrepository.label).toBe("Tests repository");
            expect(json.repositories.testsrepository.path).toBe("tests/");
            expect(json.repositories.testsrepository.authorized_groups.sort()).toStrictEqual(
                [
                    "__anonymous",
                    "admins",
                    "group_a",
                    "group_b",
                    "publishers"
                ].sort()
            );
            expect(json.repositories.testsrepository.authorized_groups.sort()).toStrictEqual(
                [
                    "__anonymous",
                    "admins",
                    "group_a",
                    "group_b",
                    "publishers"
                ].sort()
            );
            expect(json.repositories.testsrepository.projects.events.title).toBe('Touristic events around Montpellier, France');

            // Check the groups of users
            expect(json.acl.groups).toStrictEqual(
                {
                    "admins": {
                        "label": "admins"
                    },
                    "group_a": {
                        "label": "group_a"
                    },
                    "group_b": {
                        "label": "group_b"
                    },
                    "intranet": {
                        "label": "Intranet demos group"
                    },
                    "lizadmins": {
                        "label": "lizadmins"
                    },
                    "publishers": {
                        "label": "Publishers"
                    },
                    "users": {
                        "label": "users"
                    }
                }
            )
        });
    });

test.describe('Request JSON metadata as admin, connected from context',
    {
        tag: ['@requests', '@readonly'],
    },
    () => {

        test.use({ storageState: getAuthStorageStatePath('admin') });

        test('Checking JSON metadata content as admin', async ({ request }) => {
            const response = await request.get(url, {});
            const json = await checkJson(response);

            // QGIS Server info
            expect(json.qgis_server_info.py_qgis_server.found).toBe(true);
            expect(json.qgis_server_info.py_qgis_server.version).toMatch(/\.|n\/a/i);
            expect(json.qgis_server_info.metadata.version).toContain('3.');
            expect(json.qgis_server_info.plugins.lizmap_server.version).toMatch(/(\d+\.\d+|master|dev)/i);

            // Modules
            expect(json.modules.lizmapdemo.version).toMatch(/\d+\.\d+/i)

            // Desktop plugin
            expect(json.lizmap_desktop_plugin_version).toBeGreaterThan(10000);

            // Repositories
            expect(json.repositories.testsrepository.label).toBe("Tests repository");
            expect(json.repositories.testsrepository.path).toBe("tests/");
            expect(json.repositories.testsrepository.authorized_groups.sort()).toStrictEqual(
                [
                    "__anonymous",
                    "admins",
                    "group_a",
                    "group_b",
                    "publishers"
                ].sort()
            );
            expect(json.repositories.testsrepository.authorized_groups.sort()).toStrictEqual(
                [
                    "__anonymous",
                    "admins",
                    "group_a",
                    "group_b",
                    "publishers"
                ].sort()
            );
            expect(json.repositories.montpellier.projects).toStrictEqual(
                {
                    "events": {
                        "title": "Touristic events around Montpellier, France"
                    },
                    "montpellier": {
                        "title": "Montpellier - Transports"
                    }
                }
            );

            // Check the groups of users
            expect(json.acl.groups).toStrictEqual(
                {
                    "admins": {
                        "label": "admins"
                    },
                    "group_a": {
                        "label": "group_a"
                    },
                    "group_b": {
                        "label": "group_b"
                    },
                    "intranet": {
                        "label": "Intranet demos group"
                    },
                    "lizadmins": {
                        "label": "lizadmins"
                    },
                    "publishers": {
                        "label": "Publishers"
                    },
                    "users": {
                        "label": "users"
                    }
                }
            )

        });
    });
