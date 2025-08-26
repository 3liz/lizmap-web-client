// @ts-check
import {expect, test} from '@playwright/test';
import {
    checkJson,
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

            expect(response.status()).toBe(401)
        });
    });

test.describe('Connected via Basic auth',
    {
        tag: ['@requests', '@readonly'],
    }, () => {

        test('GET repositories', async ({request}) => {
            const response = await requestGETWithAdminBasicAuth(request, url + "/repositories")

            const json = await checkJson(response);

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

            const json = await checkJson(response);

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

            const json = await checkJson(response);

            expect(json[0].id).toBeDefined();
            expect(json[0].title).toBeDefined();
            expect(json[0].abstract).toBeDefined();
        });

        test('GET a specific project from a specific repository', async ({request}) => {
            const response = await requestGETWithAdminBasicAuth(request, url + "/repositories/testsrepository/projects/attribute_table")

            const json = await checkJson(response);

            expect(json.id).toBe("attribute_table");
            expect(json.projectName).toBeDefined();
            expect(json.title).toBe("attribute_table");
            expect(json.abstract).toBe("");
            expect(json.keywordList).toBe("");
            expect(json.proj).toBe("EPSG:2154");
            expect(json.bbox).toMatch(new RegExp("^(\\d+\\.\\d+, ){3}\\d+\\.\\d+$"));
            expect(json.needsUpdateError).toBeFalsy();
            expect(json.acl).toBeTruthy();
            expect(json.wmsGetCapabilitiesUrl).toBe("http://localhost:8130/index.php/lizmap/service?repository=testsrepository&project=attribute_table&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities");
            expect(json.wmtsGetCapabilitiesUrl).toBe("http://localhost:8130/index.php/lizmap/service?repository=testsrepository&project=attribute_table&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities");
            expect(json.version).toBeDefined();
            expect(json.saveDateTime).toBeDefined();
            expect(json.saveUser).toBeDefined();
            expect(json.saveUserFull).toBeDefined();
        });

        test('POST request to create a repository with a new folder', async ({request}) => {
            const before = await requestGETWithAdminBasicAuth(request, url + "/repositories")
            const listRepoBefore = await checkJson(before);
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
            const json = await checkJson(response, 201);

            const after = await requestGETWithAdminBasicAuth(request, url + "/repositories")
            const listRepoAfter = await checkJson(after);
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

            const json = await checkJson(response);

            expect(json["tests/"]).toEqual("Reserved");
        });

        test('GET all groups', async ({request}) => {
            const response = await requestGETWithAdminBasicAuth(request, url + "/groups")

            const json = await checkJson(response);

            expect(json.length).toBeGreaterThan(0);
        });

        test('GET all rights', async ({request}) => {
            const response = await requestGETWithAdminBasicAuth(request, url + "/rights")

            const json = await checkJson(response);

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
            await checkJson(createRepo, 201);

            const addRight = await requestPOSTWithAdminBasicAuth(
                request,
                url + "/repositories/nancy/rights",
                {
                    group: 'admins',
                    right: 'lizmap.tools.edition.use'
                }
            )
            await checkJson(addRight);

            let response = await requestGETWithAdminBasicAuth(request, url + "/repositories/nancy/rights")
            let json = await checkJson(response);


            expect(json["lizmap.tools.edition.use"]).toEqual(["admins"]);


            const deleteRight = await requestDELETEWithAdminBasicAuth(
                request,
                url + "/repositories/nancy/rights",
                {
                    group: 'admins',
                    right: 'lizmap.tools.edition.use'
                }
            )
            await checkJson(deleteRight, 200);

            response = await requestGETWithAdminBasicAuth(request, url + "/repositories/nancy/rights")
            json = await checkJson(response);


            expect(json["lizmap.tools.edition.use"]).toBeUndefined();
        });
    }
);
