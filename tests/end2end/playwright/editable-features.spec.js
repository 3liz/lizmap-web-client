import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js'
import { expect as responseExpect } from './fixtures/expect-response.js'
import {ProjectPage} from "./pages/project";
import { getAuthStorageStatePath } from './globals';

test.describe('Editable features - admin - @requests @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('admin') });

    test('failing tests', async ({ request }) => {
        const url = `/index.php/lizmap/edition/editableFeatures`;
        const form = {
            repository: 'testsrepository',
            project: 'attribute_table_editable_features',
            layerId: 'filter_layer_by_user_c733b070_38ab_425b_8c52_ae331633dcc6',
            features: '',
        };

        // No repository
        let response = await request.post(url, {
            data: {
                project: form['project'],
                layerId: form['layerId'],
                features: form['features'],
            }
        });
        responseExpect(response).toBeJson();

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('success', false);
        expect(body).toHaveProperty('message', 'The repository  does not exist !');
        expect(body).not.toHaveProperty('status');
        expect(body).not.toHaveProperty('features');

        // No project
        response = await request.post(url, {
            data: {
                repository: form['repository'],
                layerId: form['layerId'],
                features: form['features'],
            }
        });
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('success', false);
        expect(body).toHaveProperty('message', "The 'project' parameter is mandatory.");
        expect(body).not.toHaveProperty('status');
        expect(body).not.toHaveProperty('features');

        // No layerId
        response = await request.post(url, {
            data: {
                repository: form['repository'],
                project: form['project'],
                features: form['features'],
            }
        });
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('success', false);
        expect(body).toHaveProperty('message', "The layer is not editable.");
        expect(body).not.toHaveProperty('status');
        expect(body).not.toHaveProperty('features');
    });

    test('Check attribute table editable features', async ({ request }) => {
        const url = `/index.php/lizmap/edition/editableFeatures`;
        const form = {
            repository: 'testsrepository',
            project: 'attribute_table_editable_features',
            layerId: 'filter_layer_by_user_c733b070_38ab_425b_8c52_ae331633dcc6',
        };
        let response = await request.post(url, {
            data: form
        });
        responseExpect(response).toBeJson();

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('success', true);
        expect(body).toHaveProperty('message', 'Success');
        expect(body).toHaveProperty('status', 'unrestricted');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);

        // Empty features
        form['features'] = '';
        response = await request.post(url, {
            data: form
        });
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('success', true);
        expect(body).toHaveProperty('message', 'Success');
        expect(body).toHaveProperty('status', 'unrestricted');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);

        form['features'] = '"gid" IN ( \'1\' , \'3\' , \'2\' )';
        response = await request.post(url, {
            data: form
        });
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('success', true);
        expect(body).toHaveProperty('message', 'Success');
        expect(body).toHaveProperty('status', 'unrestricted');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);
    });
});

test.describe('Editable features - user in group a - @requests @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('user_in_group_a') });

    test('failing tests', async ({ request }) => {
        const url = `/index.php/lizmap/edition/editableFeatures`;
        const form = {
            repository: 'testsrepository',
            project: 'attribute_table_editable_features',
            layerId: 'filter_layer_by_user_c733b070_38ab_425b_8c52_ae331633dcc6',
            features: '',
        };

        // No repository
        let response = await request.post(url, {
            data: {
                project: form['project'],
                layerId: form['layerId'],
                features: form['features'],
            }
        });
        responseExpect(response).toBeJson();

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('success', false);
        expect(body).toHaveProperty('message', 'The repository  does not exist !');
        expect(body).not.toHaveProperty('status');
        expect(body).not.toHaveProperty('features');

        // No project
        response = await request.post(url, {
            data: {
                repository: form['repository'],
                layerId: form['layerId'],
                features: form['features'],
            }
        });
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('success', false);
        expect(body).toHaveProperty('message', "The 'project' parameter is mandatory.");
        expect(body).not.toHaveProperty('status');
        expect(body).not.toHaveProperty('features');

        // No layerId
        response = await request.post(url, {
            data: {
                repository: form['repository'],
                project: form['project'],
                features: form['features'],
            }
        });
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('success', false);
        expect(body).toHaveProperty('message', "The layer is not editable.");
        expect(body).not.toHaveProperty('status');
        expect(body).not.toHaveProperty('features');
    });

    test('Check attribute table editable features', async ({ request }) => {
        const url = `/index.php/lizmap/edition/editableFeatures`;
        const form = {
            repository: 'testsrepository',
            project: 'attribute_table_editable_features',
            layerId: 'filter_layer_by_user_c733b070_38ab_425b_8c52_ae331633dcc6',
        };
        let response = await request.post(url, {
            data: form
        });
        responseExpect(response).toBeJson();

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('success', true);
        expect(body).toHaveProperty('message', 'Success');
        expect(body).toHaveProperty('status', 'restricted');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'filter_layer_by_user.2');
        expect(feature).toHaveProperty('geometry', null);
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('gid', 2);

        // Empty features
        form['features'] = '';
        response = await request.post(url, {
            data: form
        });
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('success', true);
        expect(body).toHaveProperty('message', 'Success');
        expect(body).toHaveProperty('status', 'restricted');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'filter_layer_by_user.2');
        expect(feature).toHaveProperty('geometry', null);
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('gid', 2);

        form['features'] = '"gid" IN ( \'1\' , \'3\' , \'2\' )';
        response = await request.post(url, {
            data: form
        });
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('success', true);
        expect(body).toHaveProperty('message', 'Success');
        expect(body).toHaveProperty('status', 'restricted');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'filter_layer_by_user.2');
        expect(feature).toHaveProperty('geometry', null);
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('gid', 2);
    });
});

test.describe('Editable features - anonymous - @requests @readonly', () => {
    test('failing tests', async ({ request }) => {
        const url = `/index.php/lizmap/edition/editableFeatures`;
        const form = {
            repository: 'testsrepository',
            project: 'attribute_table_editable_features',
            layerId: 'filter_layer_by_user_c733b070_38ab_425b_8c52_ae331633dcc6',
            features: '',
        };

        // No repository
        let response = await request.post(url, {
            data: {
                project: form['project'],
                layerId: form['layerId'],
                features: form['features'],
            }
        });
        responseExpect(response).toBeJson();

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('success', false);
        expect(body).toHaveProperty('message', 'The repository  does not exist !');
        expect(body).not.toHaveProperty('status');
        expect(body).not.toHaveProperty('features');

        // No project
        response = await request.post(url, {
            data: {
                repository: form['repository'],
                layerId: form['layerId'],
                features: form['features'],
            }
        });
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('success', false);
        expect(body).toHaveProperty('message', "The 'project' parameter is mandatory.");
        expect(body).not.toHaveProperty('status');
        expect(body).not.toHaveProperty('features');

        // No layerId
        response = await request.post(url, {
            data: {
                repository: form['repository'],
                project: form['project'],
                features: form['features'],
            }
        });
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('success', false);
        expect(body).toHaveProperty('message', "The layer is not editable.");
        expect(body).not.toHaveProperty('status');
        expect(body).not.toHaveProperty('features');
    });

    test('Check attribute table editable features', async ({ request }) => {
        const url = `/index.php/lizmap/edition/editableFeatures`;
        const form = {
            repository: 'testsrepository',
            project: 'attribute_table_editable_features',
            layerId: 'filter_layer_by_user_c733b070_38ab_425b_8c52_ae331633dcc6',
        };
        let response = await request.post(url, {
            data: form
        });
        responseExpect(response).toBeJson();

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('success', true);
        expect(body).toHaveProperty('message', 'Success');
        expect(body).toHaveProperty('status', 'restricted');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);

        // Empty features
        form['features'] = '';
        response = await request.post(url, {
            data: form
        });
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('success', true);
        expect(body).toHaveProperty('message', 'Success');
        expect(body).toHaveProperty('status', 'restricted');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);

        form['features'] = '"gid" IN ( \'1\' , \'3\' , \'2\' )';
        response = await request.post(url, {
            data: form
        });
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('success', true);
        expect(body).toHaveProperty('message', 'Success');
        expect(body).toHaveProperty('status', 'restricted');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);
    });
});

test.describe('Editable features',
    {
        tag: ['@readonly'],
    },()=> {
        test('Check attribute table editable features - anonymous', async ({ page }) => {
            const project = new ProjectPage(page, 'attribute_table_editable_features');
            await project.open();

            const layerName = 'filter_layer_by_user';
            let getFeatureRequest = await project.openAttributeTable(layerName);
            let getFeatureResponse = await getFeatureRequest.response();
            responseExpect(getFeatureResponse).toBeGeoJson();
            const tableHtml = project.attributeTableHtml(layerName);

            await expect(tableHtml.locator('tbody tr')).toHaveCount(3);

            for (let i = 1; i<=3; i++) {
                let tr = tableHtml.locator('tbody tr[id="'+i+'"]');
                await expect(tr.locator('lizmap-feature-toolbar .feature-edit')).toBeHidden()
            }
        })

        test('Check attribute table editable features - user_in_group_a', async ({ browser }) => {
            // login with specific user
            const userContext = await browser.newContext({storageState: getAuthStorageStatePath('user_in_group_a')});
            const userPage = await userContext.newPage();

            const project = new ProjectPage(userPage, 'attribute_table_editable_features');
            await project.open();

            const layerName = 'filter_layer_by_user';
            let getFeatureRequest = await project.openAttributeTable(layerName);
            const getEditableFeaturesRequestPromise = project.waitForEditableFeaturesRequest();
            let getFeatureResponse = await getFeatureRequest.response();
            responseExpect(getFeatureResponse).toBeGeoJson();

            const getEditableFeaturesRequest = await getEditableFeaturesRequestPromise;
            const expectedParameters = {
                'layerId': 'filter_layer_by_user_c733b070_38ab_425b_8c52_ae331633dcc6',
                'features': '"gid" IN ( \'1\' , \'3\' , \'2\' )',
            };

            requestExpect(getEditableFeaturesRequest).toContainParametersInPostData(expectedParameters);
            const response = await getEditableFeaturesRequest.response();

            // check response
            responseExpect(response).toBeJson();

            const tableHtml = project.attributeTableHtml('filter_layer_by_user');

            await expect(tableHtml.locator('tbody tr')).toHaveCount(3);

            for (let i = 1; i<=3; i++) {
                let tr = tableHtml.locator('tbody tr[id="'+i+'"]');
                let featureEditButton = tr.locator('lizmap-feature-toolbar .feature-edit');
                if (i==2) {
                    await expect(featureEditButton).toBeVisible();
                } else {
                    await expect(featureEditButton).toBeHidden();
                }
            }
        })
    })
