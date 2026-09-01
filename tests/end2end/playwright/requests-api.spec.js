// @ts-check
import {expect, test} from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js';
import {
    expectParametersToContain,
    requestGETWithAdminBasicAuth,
    requestPOSTWithAdminBasicAuth,
    requestDELETEWithAdminBasicAuth,
    getAuthStorageStatePath
} from './globals';

const url = 'api.php/admin';

test.describe('Not connected via context or Basic auth',
    {
        tag: ['@requests', '@readonly'],
    }, () => {

        test('GET', async ({request}) => {
            const response = await request.get(url + "/repositories", {});
            expect(response.status()).toBe(401)
        });

        test('PUT', async ({request}) => {
            const response = await request.put(url + "/repositories", {});
            expect(response.status()).toBe(501)
        });
    }
);

test.describe('Connected from context, as an admin',
    {
        tag: ['@requests', '@readonly'],
    }, () => {

        test.use({ storageState: getAuthStorageStatePath('admin') });

        test('Request metadata', async ({ request }) => {
            const response = await request.get(url + "/repositories");

            responseExpect(response).toBeJson();
            const json = await response.json();

            // Check the repositories of the test instance are all listed. An exact
            // count was asserted here, which broke as soon as another repository
            // existed: the tests below create some, and a developer instance may
            // have its own.
            expect(json.map(repository => repository.key)).toEqual(
                expect.arrayContaining([
                    'testsrepository',
                    'private',
                    'badrepository',
                    'mockinspection',
                    'montpellier',
                    'intranet',
                ])
            );

            // Check first repository has expected
            expect(json[0].key).toBeDefined();
            expect(json[0].label).toBeDefined();
            expect(json[0].path).toBeDefined();

        });
    });

test.describe('Connected via Basic auth',
    {
        tag: ['@requests', '@readonly'],
    }, () => {

        // The tests below create repositories. Remove them so that running the
        // suite twice against the same instance gives the same result: the
        // repository list is asserted above, and a leftover repository key makes
        // the creation requests answer 409.
        // The directories they create (`grenoble_agglo/`, `folderNancy/`) cannot be
        // removed through HTTP; `tests/end2end/run-all-tests.sh` takes care of them.
        test.afterAll(async ({ browser }) => {
            const context = await browser.newContext({ storageState: getAuthStorageStatePath('admin') });
            const page = await context.newPage();
            for (const repository of ['grenoble', 'nancy']) {
                await page.goto('admin.php/admin/maps/removeSection?repository=' + repository);
            }
            await context.close();
        });

        test('GET repositories', async ({request}) => {
            const response = await requestGETWithAdminBasicAuth(request, url + "/repositories")

            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json[0].key).toBeDefined();
            expect(json[0].label).toBeDefined();
            expect(json[0].path).toBeDefined();
        });

        test('GET specific repository wrong key', async ({request}) => {
            const response = await requestGETWithAdminBasicAuth(request, url + "/repositories/test")

            expect(response.status()).toBe(404)
        });

        test('GET specific repository good key', async ({request}) => {
            const response = await requestGETWithAdminBasicAuth(request, url + "/repositories/testsrepository")

            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json.key).toBe("testsrepository");
            expect(json.label).toBe("Tests repository");
            expect(json.path).toBe("tests/");
            expect(json.allowUserDefinedThemes).toBeTruthy();
            expect(json.accessControlAllowOrigin).toBe("");
            expect(json.rightsGroup["lizmap.tools.displayGetCapabilitiesLinks"]).toBeDefined();
            expect(json.rightsGroup["lizmap.repositories.view"]).toBeDefined();
            expect(json.rightsGroup["lizmap.tools.loginFilteredLayers.override"]).toBeDefined();
            expect(json.rightsGroup["lizmap.tools.layer.export"]).toBeDefined();
            expect(json.rightsGroup["lizmap.tools.edition.use"]).toBeDefined();
        });

        test('GET all projects from a specific repository', async ({request}) => {
            const response = await requestGETWithAdminBasicAuth(request, url + "/repositories/testsrepository/projects")

            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json[0].id).toBeDefined();
            expect(json[0].title).toBeDefined();
            expect(json[0].abstract).toBeDefined();
        });

        test('GET a specific project from a specific repository', async ({request}) => {
            const response = await requestGETWithAdminBasicAuth(request, url + "/repositories/testsrepository/projects/attribute_table")

            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json.id).toBe("attribute_table");
            expect(json.projectName).toBeDefined();
            expect(json.title).toBe("attribute_table");
            expect(json.abstract).toBe("");
            expect(json.keywordList).toBe("");
            expect(json.proj).toBe("EPSG:2154");
            expect(json.bbox).toMatch(new RegExp("^(\\d+\\.\\d+, ){3}\\d+\\.\\d+$"));
            expect(json.needsUpdateError).toBeFalsy();
            expect(json.acl).toBeTruthy();
            expect(json.wmsGetCapabilitiesUrl).toBeDefined();
            const wmsGetCapabilitiesUrl = new URL(json.wmsGetCapabilitiesUrl);
            expect(wmsGetCapabilitiesUrl.protocol).toBe('http:');
            expect(wmsGetCapabilitiesUrl.host).toBe('localhost:8130');
            expect(wmsGetCapabilitiesUrl.pathname).toBe('/index.php/lizmap/service/testsrepository/attribute_table');
            const wmsGetCapabilitiesParams = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetCapabilities',
            };
            await expectParametersToContain('wmsGetCapabilitiesUrl', wmsGetCapabilitiesUrl.search, wmsGetCapabilitiesParams);
            expect(json.wmtsGetCapabilitiesUrl).toBeDefined();
            const wmtsGetCapabilitiesUrl = new URL(json.wmtsGetCapabilitiesUrl);
            expect(wmtsGetCapabilitiesUrl.protocol).toBe('http:');
            expect(wmtsGetCapabilitiesUrl.host).toBe('localhost:8130');
            expect(wmtsGetCapabilitiesUrl.pathname).toBe('/index.php/lizmap/service/testsrepository/attribute_table');
            const wmtsGetCapabilitiesParams = {
                'SERVICE': 'WMTS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetCapabilities',
            };
            await expectParametersToContain('wmtsGetCapabilitiesUrl', wmtsGetCapabilitiesUrl.search, wmtsGetCapabilitiesParams);
            expect(json.version).toBeDefined();
            expect(json.saveDateTime).toBeDefined();
            expect(json.saveUser).toBeDefined();
            expect(json.saveUserFull).toBeDefined();
        });

        test('POST request to create a repository with a new folder', async ({request}) => {
            const before = await requestGETWithAdminBasicAuth(request, url + "/repositories");
            responseExpect(before).toBeJson();
            const listRepoBefore = await before.json();
            const amountRepoBefore = listRepoBefore.length;

            const response = await requestPOSTWithAdminBasicAuth(
                request,
                url + "/repositories/grenoble",
                {
                    label: 'Grenoble',
                    path: "grenoble_agglo/",
                    allowUserDefinedThemes: "false",
                    createDirectory: "true"
                }
            )
            responseExpect(response).toBeJson(201);
            const json = await response.json();

            const after = await requestGETWithAdminBasicAuth(request, url + "/repositories")
            responseExpect(after).toBeJson();
            const listRepoAfter = await after.json();
            const amountRepoAfter = listRepoAfter.length;

            expect(json.newDirectoryCreated).toBeTruthy();
            expect(json.repoCreated).toBeTruthy();
            expect(amountRepoBefore).toBeLessThan(amountRepoAfter);
        });

        test('POST request to create a repository with a creation of folder but already existing', async ({request}) => {
            const response = await requestPOSTWithAdminBasicAuth(
                request,
                url + "/repositories/tours",
                {
                    label: 'Tours',
                    path: "demoqgis/",
                    allowUserDefinedThemes: "false",
                    createDirectory: "true"
                }
            )

            expect(response.status()).toBe(409);
        });

        test('POST request to create a repository with a creation of folder but wrong syntax', async ({request}) => {
            const response = await requestPOSTWithAdminBasicAuth(
                request,
                url + "/repositories/tours",
                {
                    label: 'Tours',
                    path: "/demoqgis",
                    allowUserDefinedThemes: "false",
                    createDirectory: "true"
                }
            )
            const response2 = await requestPOSTWithAdminBasicAuth(
                request,
                url + "/repositories/tours",
                {
                    label: 'Tours',
                    path: "folder/demoqgis",
                    allowUserDefinedThemes: "false",
                    createDirectory: "true"
                }
            )
            const response3 = await requestPOSTWithAdminBasicAuth(
                request,
                url + "/repositories/tours",
                {
                    label: 'Tours',
                    path: "../demoqgis/",
                    allowUserDefinedThemes: "false",
                    createDirectory: "true"
                }
            )

            expect(response.status()).toBeGreaterThanOrEqual(400);
            expect(response2.status()).toBeGreaterThanOrEqual(400);
            expect(response3.status()).toBeGreaterThanOrEqual(400);
        });

        test('POST request to create a repository, error 409, repo reserved', async ({request}) => {
            const response = await requestPOSTWithAdminBasicAuth(
                request,
                url + "/repositories/amiens",
                {
                    label: 'New repo',
                    path: "tests/",
                    allowUserDefinedThemes: "false"
                }
            );

            expect(response.status()).toBe(409);
        });

        test('GET all paths used for repositories', async ({request}) => {
            const response = await requestGETWithAdminBasicAuth(request, url + "/paths")

            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json["tests/"]).toEqual("Reserved");
        });

        test('GET all groups', async ({request}) => {
            const response = await requestGETWithAdminBasicAuth(request, url + "/groups")

            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json.length).toBeGreaterThan(0);
        });

        test('GET all rights', async ({request}) => {
            const response = await requestGETWithAdminBasicAuth(request, url + "/rights")

            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json).toEqual({
                "lizmap.repositories.view": "View projects in the repository",
                "lizmap.tools.displayGetCapabilitiesLinks": "Display projects WMS links",
                "lizmap.tools.edition.use": "Use the Edition tool",
                "lizmap.tools.layer.export": "Allow export of vector layers",
                "lizmap.tools.loginFilteredLayers.override": "See all the data of the filtered layers (attribute or spatial filters)",
            });
        });

        test('ADD (POST) and DELETE a specific right on a repository for a group', async ({request}) => {
            const createRepo = await requestPOSTWithAdminBasicAuth(
                request,
                url + "/repositories/nancy",
                {
                    label: 'Test repo',
                    path: "folderNancy/",
                    allowUserDefinedThemes: "false",
                    createDirectory: "true"
                }
            )
            responseExpect(createRepo).toBeJson(201);

            const addRight = await requestPOSTWithAdminBasicAuth(
                request,
                url + "/repositories/nancy/rights",
                {
                    group: 'admins',
                    right: 'lizmap.tools.edition.use'
                }
            )
            responseExpect(addRight).toBeJson();

            let response = await requestGETWithAdminBasicAuth(request, url + "/repositories/nancy/rights")
            responseExpect(response).toBeJson();
            let json = await response.json();


            expect(json["lizmap.tools.edition.use"]).toEqual(["admins"]);


            const deleteRight = await requestDELETEWithAdminBasicAuth(
                request,
                url + "/repositories/nancy/rights",
                {
                    group: 'admins',
                    right: 'lizmap.tools.edition.use'
                }
            )
            responseExpect(deleteRight).toBeJson();

            response = await requestGETWithAdminBasicAuth(request, url + "/repositories/nancy/rights")
            responseExpect(response).toBeJson();
            json = await response.json();


            expect(json["lizmap.tools.edition.use"]).toBeUndefined();
        });
    }
);
