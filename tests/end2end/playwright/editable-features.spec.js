import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js'
import { expect as responseExpect } from './fixtures/expect-response.js'
import {ProjectPage} from "./pages/project";
import { getAuthStorageStatePath } from './globals';

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
