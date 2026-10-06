// @ts-check
import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js';
import { expect as responseExpect } from './fixtures/expect-response.js';
import { FormFilterPage } from './pages/formfilterpage';

test.describe('Form filter  @readonly', () => {
    test.beforeEach(async ({ page }) => {
        const project = new FormFilterPage(page, 'form_filter');
        await project.open();
        await project.openFormFilterPanel();
        await expect(project.formFilterPanel).toBeVisible();
    });

    test('Form filter UI', async ({ page }) => {
        const project = new FormFilterPage(page, 'form_filter');
        await expect(project.layerSelector).toBeVisible();
        await expect(project.layerSelector.locator('option')).toHaveCount(1);
        await expect(project.layerSelector).toHaveValue('form_filter_8bfd580f_2848_4bd4_80cf_facb270a9af5');
        await expect(project.countFeatureSpan).toBeVisible();
        await expect(project.countFeatureSpan).toHaveText('4');
        await expect(project.zoomButton).toBeVisible();
        await expect(project.exportButton).toBeVisible();
        await expect(project.unfilterButton).toBeVisible();

        await expect(project.formFilterPanel.locator('.liz-filter-field-box')).toHaveCount(3)
    });

    test('Form filter with combobox', async ({ page }) => {
        const project = new FormFilterPage(page, 'form_filter');
        await expect(project.countFeatureSpan).toHaveText('4');

        // Check the combobox to filter form_filter_layer
        const combo = project.formFilterPanel.locator('#liz-filter-field-test_filter');
        await expect(combo).toHaveValue('');
        await expect(combo.locator('option:nth-child(1)')).toHaveText(' --- ');
        await expect(combo.locator('option[value="_uvres_d_art_et_monuments_de_l_espace_urbain"]')).toHaveCount(1);
        await expect(combo.locator('option[value="simple_label"]')).toHaveCount(1);

        // Prepare promises to wait for requests
        let parentGetFeatureCountPromise = project.waitForGetFeatureCountRequest()
        let parentGetFeaturePromise = project.waitForGetFeatureRequest('form_filter_layer')
        let parentGetFilterTokenPromise = project.waitForGetFilterTokenRequest('form_filter_layer');
        let childGetFeaturePromise = project.waitForGetFeatureRequest('form_filter_child_bus_stops');
        let childGetFilterTokenPromise = project.waitForGetFilterTokenRequest('form_filter_child_bus_stops');
        let childGetMapPromise = project.waitForGetMapRequest('form_filter_child_bus_stops')
        let parentGetMapPromise = project.waitForGetMapRequest('form_filter_layer')

        // Select a value
        await combo.selectOption('_uvres_d_art_et_monuments_de_l_espace_urbain');
        await expect(combo).toHaveValue('_uvres_d_art_et_monuments_de_l_espace_urbain');

        // Wait for all requests
        let [
            parentGetFeatureCountRequest,
            parentGetFeatureRequest,
            parentGetFilterTokenRequest,
            childGetFeatureRequest,
            childGetFilterTokenRequest,
            childGetMapRequest,
            parentGetMapRequest,
        ] = await Promise.all([
            parentGetFeatureCountPromise,
            parentGetFeaturePromise,
            parentGetFilterTokenPromise,
            childGetFeaturePromise,
            childGetFilterTokenPromise,
            childGetMapPromise,
            parentGetMapPromise,
        ]);

        // Checking requests parameters
        /** @type {{[key: string]: string|RegExp}} */
        let parentGetFeatureCountExpectedParameters = {
            layerId: /^form_filter_[\d\w_]+/,
            filter: '"label" IN ( \'Œuvres d\'\'art et monuments de l\'\'espace urbain\' ) '
        }
        requestExpect(parentGetFeatureCountRequest).toContainParametersInUrl(parentGetFeatureCountExpectedParameters);

        /** @type {{[key: string]: string|RegExp}} */
        let parentGetFeatureExpectedParameters = {
            TYPENAME: 'form_filter_layer',
            EXP_FILTER: '$id IN ( 2 ) ',
        };
        requestExpect(parentGetFeatureRequest).toContainParametersInPostData(parentGetFeatureExpectedParameters);

        /** @type {{[key: string]: string|RegExp}} */
        let parentGetFilterTokenExpectedParameters = {
            typename: 'form_filter_layer',
            filter: 'form_filter_layer:"id" IN ( 2 ) ',
        };
        requestExpect(parentGetFilterTokenRequest).toContainParametersInPostData(parentGetFilterTokenExpectedParameters);

        /** @type {{[key: string]: string|RegExp}} */
        let childGetFeatureExpectedParameters = {
            TYPENAME: 'form_filter_child_bus_stops',
            EXP_FILTER: '"id_parent" IN ( \'2\' )',
        };
        requestExpect(childGetFeatureRequest).toContainParametersInPostData(childGetFeatureExpectedParameters);

        /** @type {{[key: string]: string|RegExp}} */
        let childGetFilterTokenExpectedParameters = {
            typename: 'form_filter_child_bus_stops',
            filter: 'form_filter_child_bus_stops:"id_parent" IN ( \'2\' )',
        };
        requestExpect(childGetFilterTokenRequest).toContainParametersInPostData(childGetFilterTokenExpectedParameters);

        // Check responses
        // Is the GetFeatureCount JSON and it's value is 1
        let parentGetFeatureCountResponse = await parentGetFeatureCountRequest.response()
        responseExpect(parentGetFeatureCountResponse).toBeJson();
        let parentGetFeatureCountJson = await parentGetFeatureCountResponse?.json();
        expect(parentGetFeatureCountJson).toHaveLength(1)
        expect(parentGetFeatureCountJson[0]).toHaveProperty('c', '1');

        // Is the GetFeature GeoJSON with 1 features
        let parentGetFeatureResponse = await parentGetFeatureRequest.response();
        responseExpect(parentGetFeatureResponse).toBeGeoJson();
        await responseExpect(parentGetFeatureResponse).toHaveGeoJsonFeaturesLength(1);

        // Is the GetFilterToken a JSON with a valid token
        let parentGetFilterTokenResponse = await parentGetFilterTokenRequest.response();
        responseExpect(parentGetFilterTokenResponse).toBeJson();
        // get the token
        let parentGetFilterTokenJson = await parentGetFilterTokenResponse?.json();
        expect(parentGetFilterTokenJson).toHaveProperty('token');
        let parentToken = parentGetFilterTokenJson['token'];
        expect(parentToken).toBeTruthy();
        expect(parentToken).toHaveLength(32);
        expect(parentToken).toMatch(/[\d\w_]{32}/);

        // Is the GetFilterToken JSON
        responseExpect(await childGetFilterTokenRequest.response()).toBeJson();

        // Is the GetFeature a GeoJSON with 3 features
        let childGetFeatureResponse = await childGetFeatureRequest.response();
        responseExpect(childGetFeatureResponse).toBeGeoJson();
        await responseExpect(childGetFeatureResponse).toHaveGeoJsonFeaturesLength(3);

        // Check the GetMap request
        /** @type {{[key: string]: string|RegExp}} */
        let parentGetMapExpectedParameters = {
            LAYERS: 'form_filter_layer',
            FILTERTOKEN: parentToken,
        };
        requestExpect(parentGetMapRequest).toContainParametersInUrl(parentGetMapExpectedParameters);

        // Check that the GetMap responses are png
        responseExpect(await childGetMapRequest.response()).toBeImagePng();
        responseExpect(await parentGetMapRequest.response()).toBeImagePng();

        // Check count fetaures
        await expect(project.countFeatureSpan).toHaveText('1');

        // Prepare promises to wait for requests
        parentGetFeatureCountPromise = project.waitForGetFeatureCountRequest()
        parentGetFeaturePromise = project.waitForGetFeatureRequest('form_filter_layer')
        parentGetFilterTokenPromise = project.waitForGetFilterTokenRequest('form_filter_layer');
        childGetFeaturePromise = project.waitForGetFeatureRequest('form_filter_child_bus_stops')
        childGetFilterTokenPromise = project.waitForGetFilterTokenRequest('form_filter_child_bus_stops');
        childGetMapPromise = project.waitForGetMapRequest('form_filter_child_bus_stops')
        parentGetMapPromise = project.waitForGetMapRequest('form_filter_layer')

        // Select an other value
        await combo.selectOption('simple_label');
        await expect(combo).toHaveValue('simple_label');

        // Wait for all requests
        [
            parentGetFeatureCountRequest,
            parentGetFeatureRequest,
            parentGetFilterTokenRequest,
            childGetFeatureRequest,
            childGetFilterTokenRequest,
            childGetMapRequest,
            parentGetMapRequest,
        ] = await Promise.all([
            parentGetFeatureCountPromise,
            parentGetFeaturePromise,
            parentGetFilterTokenPromise,
            childGetFeaturePromise,
            childGetFilterTokenPromise,
            childGetMapPromise,
            parentGetMapPromise,
        ]);

        // Checking requests parameters
        parentGetFeatureCountExpectedParameters = {
            layerId: /^form_filter_[\d\w_]+/,
            filter: '"label" IN ( \'simple label\' ) '
        }
        requestExpect(parentGetFeatureCountRequest).toContainParametersInUrl(parentGetFeatureCountExpectedParameters);

        parentGetFeatureExpectedParameters = {
            TYPENAME: 'form_filter_layer',
            EXP_FILTER: '$id IN ( 1 ) ',
        };
        requestExpect(parentGetFeatureRequest).toContainParametersInPostData(parentGetFeatureExpectedParameters);

        parentGetFilterTokenExpectedParameters = {
            typename: 'form_filter_layer',
            filter: 'form_filter_layer:"id" IN ( 1 ) ',
        };
        requestExpect(parentGetFilterTokenRequest).toContainParametersInPostData(parentGetFilterTokenExpectedParameters);

        childGetFeatureExpectedParameters = {
            TYPENAME: 'form_filter_child_bus_stops',
            EXP_FILTER: '"id_parent" IN ( \'1\' )',
        };
        requestExpect(childGetFeatureRequest).toContainParametersInPostData(childGetFeatureExpectedParameters);

        childGetFilterTokenExpectedParameters = {
            typename: 'form_filter_child_bus_stops',
            filter: 'form_filter_child_bus_stops:"id_parent" IN ( \'1\' )',
        };
        requestExpect(childGetFilterTokenRequest).toContainParametersInPostData(childGetFilterTokenExpectedParameters);

        // Check responses
        // Is the GetFeatureCount JSON and it's value is 1
        parentGetFeatureCountResponse = await parentGetFeatureCountRequest.response()
        responseExpect(parentGetFeatureCountResponse).toBeJson();
        parentGetFeatureCountJson = await parentGetFeatureCountResponse?.json();
        expect(parentGetFeatureCountJson).toHaveLength(1)
        expect(parentGetFeatureCountJson[0]).toHaveProperty('c', '1');

        // Is the GetFeature GeoJSON with 1 features
        parentGetFeatureResponse = await parentGetFeatureRequest.response();
        responseExpect(parentGetFeatureResponse).toBeGeoJson();
        await responseExpect(parentGetFeatureResponse).toHaveGeoJsonFeaturesLength(1);

        // Is the GetFilterToken a JSON with a valid token
        parentGetFilterTokenResponse = await parentGetFilterTokenRequest.response();
        responseExpect(parentGetFilterTokenResponse).toBeJson();
        // get the token
        parentGetFilterTokenJson = await parentGetFilterTokenResponse?.json();
        expect(parentGetFilterTokenJson).toHaveProperty('token');
        parentToken = parentGetFilterTokenJson['token'];
        expect(parentToken).toBeTruthy();
        expect(parentToken).toHaveLength(32);
        expect(parentToken).toMatch(/[\d\w_]{32}/);

        // Is the GetFilterToken JSON
        responseExpect(await childGetFilterTokenRequest.response()).toBeJson();

        // Is the GetFeature a GeoJSON with 3 features
        childGetFeatureResponse = await childGetFeatureRequest.response();
        responseExpect(childGetFeatureResponse).toBeGeoJson();
        await responseExpect(childGetFeatureResponse).toHaveGeoJsonFeaturesLength(2);

        // Check the GetMap request
        parentGetMapExpectedParameters = {
            LAYERS: 'form_filter_layer',
            FILTERTOKEN: parentToken,
        };
        requestExpect(parentGetMapRequest).toContainParametersInUrl(parentGetMapExpectedParameters);

        // Check that the GetMap responses are png
        responseExpect(await childGetMapRequest.response()).toBeImagePng();
        responseExpect(await parentGetMapRequest.response()).toBeImagePng();

        // Check feature count
        await expect(project.countFeatureSpan).toHaveText('1');

        // Prepare promises to wait for requests
        // Unfilter
        [
            parentGetFeatureCountRequest,
            childGetMapRequest,
            parentGetMapRequest,
        ] = await Promise.all([
            project.waitForGetFeatureCountRequest(),
            project.waitForGetMapRequest('form_filter_child_bus_stops'),
            project.waitForGetMapRequest('form_filter_layer'),
            project.unfilterButton.click(),
        ]);

        await expect(combo).toHaveValue('');

        // Checking GetFeatureCount request parameters
        parentGetFeatureCountExpectedParameters = {
            layerId: /^form_filter_[\d\w_]+/,
            filter: '',
        }
        requestExpect(parentGetFeatureCountRequest).toContainParametersInUrl(parentGetFeatureCountExpectedParameters);

        // Is the GetFeatureCount JSON and it's value is 4
        parentGetFeatureCountResponse = await parentGetFeatureCountRequest.response()
        responseExpect(parentGetFeatureCountResponse).toBeJson();
        parentGetFeatureCountJson = await parentGetFeatureCountResponse?.json();
        expect(parentGetFeatureCountJson).toHaveLength(1)
        expect(parentGetFeatureCountJson[0]).toHaveProperty('c', '4');

        // Check feature count
        await expect(project.countFeatureSpan).toHaveText('4');

        // Check the GetMap request: do not contain filter
        /** @type {{[key: string]: string|RegExp}} */
        let parentGetMapNotExpectedParameters = {
            FILTERTOKEN: parentToken,
        };
        requestExpect(parentGetMapRequest).not.toContainParametersInUrl(parentGetMapNotExpectedParameters);
        parentGetMapNotExpectedParameters = {
            FILTERTOKEN: /[\d\w_]{32}/,
        };
        requestExpect(parentGetMapRequest).not.toContainParametersInUrl(parentGetMapNotExpectedParameters);
        expect(parentGetMapRequest.url()).not.toContain('FILTERTOKEN');

        responseExpect(await childGetMapRequest.response()).toBeImagePng();
        responseExpect(await parentGetMapRequest.response()).toBeImagePng();
    });

    test('Form filter with autocomplete', async ({ page }) => {
        const project = new FormFilterPage(page, 'form_filter');
        await expect(project.countFeatureSpan).toHaveText('4');

        // Check the autocomplete to filter form_filter_layer
        const autocomplete = project.formFilterPanel.locator('#liz-filter-field-textautocomplete');
        await expect(autocomplete).toHaveValue('');

        // Fill data to autocomplete and checks provided items
        let getUniqueValuesPromise = project.waitForGetUniqueValuesRequest('POST');
        await autocomplete.fill('mon');

        let getUniqueValuesRequest = await getUniqueValuesPromise;
        /** @type {{[key: string]: string|RegExp}} */
        let getUniqueValuesExpectedParameters = {
            layerId: /^form_filter_[\d\w_]{32}/,
            fieldname: 'label',
            filter: '"label" ILIKE \'%mon%\' ',
        };
        requestExpect(getUniqueValuesRequest).toContainParametersInPostData(getUniqueValuesExpectedParameters);

        await expect(autocomplete).toHaveValue('mon');

        // Assert autocomplete list has 3 values
        const autocompleteItems = page.locator('#ui-id-2 .ui-menu-item');
        await expect(autocompleteItems).toHaveCount(3);

        // Reset autocomplete
        await autocomplete.fill('');
        await expect(autocomplete).toHaveValue('');

        // Filter by ID then assert autocomplete list has now 2 values
        // when filling 'mon' in the autocomplete field
        const maxNumericIds = project.formFilterPanel.locator('#liz-filter-field-max-numericIDs');
        await expect(maxNumericIds).toHaveValue('4');
        const minNumericIds = project.formFilterPanel.locator('#liz-filter-field-min-numericIDs');
        await expect(minNumericIds).toHaveValue('1');
        // first prepare requests promise
        getUniqueValuesPromise = project.waitForGetUniqueValuesRequest('GET');
        let getFeatureCountPromise = project.waitForGetFeatureCountRequest();
        // then fill the IDs
        await maxNumericIds.fill('3');
        await maxNumericIds.blur(); // force event
        // wait for request
        getUniqueValuesRequest = await getUniqueValuesPromise;
        getUniqueValuesExpectedParameters['fieldname'] = "id";
        getUniqueValuesExpectedParameters['filter'] = " ( ( "
            + "\"id\" >= '1' OR  \"id\" >= '1'"
            + " ) AND ( "
            + "\"id\" <= '3' OR  \"id\" <= '3'"
            + " ) ) ";
        requestExpect(getUniqueValuesRequest).toContainParametersInUrl(getUniqueValuesExpectedParameters);
        let getFeatureCountRequest = await getFeatureCountPromise;
        responseExpect(await getFeatureCountRequest.response()).toBeJson();
        responseExpect(await getUniqueValuesRequest.response()).toBeJson();

        // Check feature count
        await expect(project.countFeatureSpan).toHaveText('3');

        // Set autocomplete
        getUniqueValuesPromise = project.waitForGetUniqueValuesRequest('POST');
        await autocomplete.fill('mon');
        getUniqueValuesRequest = await getUniqueValuesPromise;
        getUniqueValuesExpectedParameters['fieldname'] = "label";
        getUniqueValuesExpectedParameters['filter'] = " (  ( ( "
            + "\"id\" >= '1' OR  \"id\" >= '1'"
            + " ) AND ( "
            + "\"id\" <= '3' OR  \"id\" <= '3'"
            + " ) )  ) AND \"label\" ILIKE '%mon%' ";
        requestExpect(getUniqueValuesRequest).toContainParametersInPostData(getUniqueValuesExpectedParameters);
        await expect(autocomplete).toHaveValue('mon');

        // Assert autocomplete list has 2 values
        await expect(autocompleteItems).toHaveCount(2);

        // Reset
        getFeatureCountPromise = project.waitForGetFeatureCountRequest();
        await autocomplete.fill('');
        await expect(autocomplete).toHaveValue('');
        await project.unfilterButton.click();
        getFeatureCountRequest = await getFeatureCountPromise;
        responseExpect(await getFeatureCountRequest.response()).toBeJson();

        // Check feature count
        await expect(project.countFeatureSpan).toHaveText('4');

        // Filter by combobox then assert autocomplete list has now 1 value
        // when filling 'mon' in the autocomplete field
        const combo = project.formFilterPanel.locator('#liz-filter-field-test_filter');
        await expect(combo).toHaveValue('');
        getUniqueValuesPromise = project.waitForGetUniqueValuesRequest('GET');
        getFeatureCountPromise = project.waitForGetFeatureCountRequest();
        await combo.selectOption('monuments');
        // wait for request
        getUniqueValuesRequest = await getUniqueValuesPromise;
        getUniqueValuesExpectedParameters['fieldname'] = "id";
        getUniqueValuesExpectedParameters['filter'] = "\"label\" IN ( 'monuments' ) ";
        requestExpect(getUniqueValuesRequest).toContainParametersInUrl(getUniqueValuesExpectedParameters);
        getFeatureCountRequest = await getFeatureCountPromise;
        responseExpect(await getFeatureCountRequest.response()).toBeJson();
        responseExpect(await getUniqueValuesRequest.response()).toBeJson();

        // Check feature count
        await expect(project.countFeatureSpan).toHaveText('1');

        // Set autocomplete
        getUniqueValuesPromise = project.waitForGetUniqueValuesRequest('POST');
        await autocomplete.fill('mon');
        getUniqueValuesRequest = await getUniqueValuesPromise;
        getUniqueValuesExpectedParameters['fieldname'] = "label";
        getUniqueValuesExpectedParameters['filter'] = " ( \"label\" IN ( 'monuments' )  ) AND \"label\" ILIKE '%mon%' ";
        requestExpect(getUniqueValuesRequest).toContainParametersInPostData(getUniqueValuesExpectedParameters);
        await expect(autocomplete).toHaveValue('mon');

        // Assert autocomplete list has 1 values
        await expect(autocompleteItems).toHaveCount(1);
        await expect(autocompleteItems.first()).toHaveText('monuments');

        // Reset
        getFeatureCountPromise = project.waitForGetFeatureCountRequest();
        await autocomplete.fill('');
        await expect(autocomplete).toHaveValue('');
        await project.unfilterButton.click();
        getFeatureCountRequest = await getFeatureCountPromise;
        responseExpect(await getFeatureCountRequest.response()).toBeJson();

        // Check feature count
        await expect(project.countFeatureSpan).toHaveText('4');
    });

    test('Form filter attribute table', async ({ page }) => {
        const project = new FormFilterPage(page, 'form_filter');
        await expect(project.countFeatureSpan).toHaveText('4');
        const combo = project.formFilterPanel.locator('#liz-filter-field-test_filter');

        let layerName = 'form_filter__a_';
        let datatablesRequest = await project.openAttributeTable(layerName, true);
        let datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();
        let tableHtml = project.attributeTableHtml(layerName);

        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(4);

        // Prepare promises to wait for requests
        let parentGetFeatureCountPromise = project.waitForGetFeatureCountRequest()
        let parentGetFeaturePromise = project.waitForGetFeatureRequest('form_filter_layer')
        let parentGetFilterTokenPromise = project.waitForGetFilterTokenRequest('form_filter_layer');
        let childGetFeaturePromise = project.waitForGetFeatureRequest('form_filter_child_bus_stops');
        let childGetFilterTokenPromise = project.waitForGetFilterTokenRequest('form_filter_child_bus_stops');
        let parentDatatablesPromise = project.waitForDatatablesRequest()

        // Select a value
        await combo.selectOption('_uvres_d_art_et_monuments_de_l_espace_urbain');
        await expect(combo).toHaveValue('_uvres_d_art_et_monuments_de_l_espace_urbain');

        // Wait for all requests
        let [
            parentGetFeatureCountRequest,
            parentGetFeatureRequest,
            parentGetFilterTokenRequest,
            childGetFeatureRequest,
            childGetFilterTokenRequest,
            parentDatatablesRequest,
        ] = await Promise.all([
            parentGetFeatureCountPromise,
            parentGetFeaturePromise,
            parentGetFilterTokenPromise,
            childGetFeaturePromise,
            childGetFilterTokenPromise,
            parentDatatablesPromise,
        ]);

        // Check responses
        responseExpect(await parentGetFeatureCountRequest.response()).toBeJson();
        responseExpect(await parentGetFeatureRequest.response()).toBeGeoJson();
        responseExpect(await parentGetFilterTokenRequest.response()).toBeJson();;
        responseExpect(await childGetFeatureRequest.response()).toBeGeoJson();
        responseExpect(await childGetFilterTokenRequest.response()).toBeJson();
        responseExpect(await parentDatatablesRequest.response()).toBeJson();

        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(1);
        await expect(tableHtml.locator('tr td:nth-child(2)')).toHaveText('2');
        await expect(tableHtml.locator('tr td:nth-child(3)')).toHaveText('Œuvres d\'art et monuments de l\'espace urbain');

        let childLayerName = 'form_filter_child_bus_stops';
        datatablesRequest = await project.openAttributeTable(childLayerName, true);
        datatablesResponse = await datatablesRequest.response();
        responseExpect(datatablesResponse).toBeJson();
        let childTableHtml = project.attributeTableHtml(childLayerName);

        // Check table lines
        await expect(childTableHtml.locator('tbody tr')).toHaveCount(3);

        // Close the child attribute table
        project.closeLayerAttributeTable(childLayerName);

        // Prepare promises to wait for requests
        parentGetFeatureCountPromise = project.waitForGetFeatureCountRequest()
        parentGetFeaturePromise = project.waitForGetFeatureRequest('form_filter_layer')
        parentGetFilterTokenPromise = project.waitForGetFilterTokenRequest('form_filter_layer');
        parentDatatablesPromise = project.waitForDatatablesRequest()

        // Select a value
        await combo.selectOption('simple_label');
        await expect(combo).toHaveValue('simple_label');

        // Wait for all requests
        [
            parentGetFeatureCountRequest,
            parentGetFeatureRequest,
            parentGetFilterTokenRequest,
            parentDatatablesRequest,
        ] = await Promise.all([
            parentGetFeatureCountPromise,
            parentGetFeaturePromise,
            parentGetFilterTokenPromise,
            parentDatatablesPromise,
        ]);

        // Check responses
        responseExpect(await parentGetFeatureCountRequest.response()).toBeJson();
        responseExpect(await parentGetFeatureRequest.response()).toBeGeoJson();
        responseExpect(await parentGetFilterTokenRequest.response()).toBeJson();
        responseExpect(await parentDatatablesRequest.response()).toBeJson();

        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(1);
        await expect(tableHtml.locator('tr td:nth-child(2)')).toHaveText('1');
        await expect(tableHtml.locator('tr td:nth-child(3)')).toHaveText('simple label');

        // Prepare promises to wait for requests
        parentGetFeatureCountPromise = project.waitForGetFeatureCountRequest()
        parentDatatablesPromise = project.waitForDatatablesRequest()

        // Unfilter
        await project.unfilterButton.click();
        await expect(combo).toHaveValue('');

        // Wait for all requests
        [
            parentGetFeatureCountRequest,
            parentDatatablesRequest,
        ] = await Promise.all([
            parentGetFeatureCountPromise,
            parentDatatablesPromise,
        ]);

        // Check responses
        responseExpect(await parentGetFeatureCountRequest.response()).toBeJson();
        responseExpect(await parentDatatablesRequest.response()).toBeJson();

        // Check table lines
        await expect(tableHtml.locator('tbody tr')).toHaveCount(4);
    });
});
