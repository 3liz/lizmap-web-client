// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'
import { ProjectPage } from './pages/project';

test.describe('Key/value in attribute table @readonly', () => {

    const attribute_table_headers = [
        'id',
        'label_from_array_int_multiple_value_relation',
        'label_from_array_text_multiple_value_relation',
        'label from int (relation reference)',
        'label from int (value map)',
        'label from int (value relation)',
        'label_from_text_multiple_value_relation',
        'label from text (relation reference)',
        'label from text (value map)',
        'label from text (value relation)',
    ];

    const attribute_table_rows = [
        { id: 1, values: [
            '1',
            'first',
            'premier',
            'one',
            'one',
            'first',
            'premier',
            'first',
            'premier',
            'premier',
        ] }, { id: 2, values: [
            '2',
            'second',
            'deuxième',
            'two',
            'two',
            'second',
            'deuxième',
            'second',
            'deuxième',
            'deuxième',
        ] }, { id: 3, values: [
            '3',
            'third',
            'troisième',
            'three',
            'three',
            'third',
            'troisième',
            'third',
            'troisième',
            'troisième',
        ] }, { id: 4, values: [
            '4',
            'fourth',
            'quatrième',
            'four',
            'four',
            'fourth',
            'quatrième',
            'first, second, third, fourth',
            'premier, deuxième, troisième, quatrième',
            'premier, deuxième, troisième, quatrième',
        ] },
    ];

    const attribute_table_shortname_headers = [...attribute_table_headers];

    const attribute_table_shortname_rows = [
        { id: 1, values: [
            '1',
            '1',
            'first',
            'one',
            'one',
            '1',
            'first',
            '{"first"}',
            '1',
            'first',
        ] }, { id: 2, values: [
            '2',
            '2',
            'second',
            'two',
            'two',
            '2',
            'second',
            '{"second"}',
            '2',
            'second',
        ] }, { id: 3, values: [
            '3',
            '3',
            'third',
            'three',
            'three',
            '3',
            'third',
            '{"third"}',
            '3',
            'third',
        ] }, { id: 4, values: [
            '4',
            '4',
            'fourth',
            'four',
            'four',
            '4',
            'fourth',
            '{"first","second","third","fourth"}',
            '1,2,3,4',
            'first,second,third,fourth',
        ] },
    ];

    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'key_value_mapping');
        project.layersInTreeView = 0;
        project.waitForGetLegendGraphicDuringLoad = false;
        await project.open();

        await page.locator('#button-attributeLayers').click();

        await page.locator('#bottom-dock-window-buttons .btn-bottomdock-size').click();
    });

    test('must display values instead of key in parent attribute table', async ({ page }) => {
        const project = new ProjectPage(page, 'key_value_mapping');

        let layerName = 'attribute_table';
        let getFeatureRequest = await project.openAttributeTable(layerName);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        let tableWrapper = project.attributeTableWrapper(layerName);
        const theaders = tableWrapper.locator('div.dataTables_scrollHead th');
        await expect(theaders).toHaveCount(11);
        const headers = await theaders.allTextContents();
        expect(headers).toEqual(expect.arrayContaining(attribute_table_headers));

        for (const row of attribute_table_rows) {
            const tdata = tableWrapper.locator(`div.dataTables_scrollBody tr[id="${row.id}"] td`);
            await expect(tdata).toHaveCount(11);
            const data = await tdata.allTextContents();
            expect(data).toEqual(expect.arrayContaining(row.values));
        }
    });

    test('must display values instead of key in children attribute table', async ({ page }) => {
        const project = new ProjectPage(page, 'key_value_mapping');

        let layerName = 'data_integers';
        let getFeatureRequest = await project.openAttributeTable(layerName);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        // Check main table
        let tableWrapper = project.attributeTableWrapper(layerName);
        const theaders = tableWrapper.locator('div.dataTables_scrollHead th');
        await expect(theaders).toHaveCount(3);
        const headers = await theaders.allTextContents();
        expect(headers).toEqual(expect.arrayContaining([
            'id',
            'label',
        ]));

        const table = [
            { id: 1, values: ['1', 'first'] },
            { id: 2, values: ['2', 'second'] },
            { id: 3, values: ['3', 'third'] },
            { id: 4, values: ['4', 'fourth'] },
            { id: 5, values: ['5', 'fifth'] },
            { id: 6, values: ['6', 'sixth'] },
            { id: 7, values: ['7', 'seventh'] },
            { id: 8, values: ['8', 'eighth'] },
            { id: 9, values: ['9', 'ninth'] },
            { id: 10, values: ['10', 'tenth'] },
        ];
        for (const row of table) {
            const tdata = tableWrapper.locator(`div.dataTables_scrollBody tr[id="${row.id}"] td`);
            await expect(tdata).toHaveCount(3);
            const data = await tdata.allTextContents();
            expect(data).toEqual(expect.arrayContaining(row.values));
        }

        const childLayerName = 'attribute_table';
        const childTableContainer = page.locator(`#attribute-child-tab-${layerName}-${childLayerName}`);
        const childTableWrapper = page.locator(`#attribute-layer-table-${layerName}-${childLayerName}_wrapper`);
        // Child table is hidden
        await expect(childTableContainer).toBeHidden();

        const child_table = [ attribute_table_rows[0], attribute_table_rows[2] ];
        for (const row of child_table) {
            // click on the line
            const getFeaturePromise = project.waitForGetFeatureRequest();
            tableWrapper.locator(`div.dataTables_scrollBody tr[id="${row.id}"]`).click();
            getFeatureRequest = await getFeaturePromise;
            getFeatureResponse = await getFeatureRequest.response();
            responseExpect(getFeatureResponse).toBeGeoJson();
            // Child table is visible
            await expect(childTableContainer).toBeVisible();
            await expect(childTableWrapper).toBeVisible();
            // Child table headers
            const child_theaders = childTableWrapper.locator('div.dataTables_scrollHead th');
            await expect(child_theaders).toHaveCount(11);
            const child_headers = await child_theaders.allTextContents();
            expect(child_headers).toEqual(expect.arrayContaining(attribute_table_headers));
            // Child table data
            await expect(childTableWrapper.locator(`div.dataTables_scrollBody tr[id="${row.id}"]`)).toHaveCount(1);
            const child_tdata = childTableWrapper.locator(`div.dataTables_scrollBody tr[id="${row.id}"] td`);
            await expect(child_tdata).toHaveCount(11);
            const data = await child_tdata.allTextContents();
            expect(data).toEqual(expect.arrayContaining(row.values));
        }
    });

    test('must display values instead of key for edition in children attribute table', async ({ page }) => {
        const project = new ProjectPage(page, 'key_value_mapping');

        let layerName = 'data_integers';
        let getFeatureRequest = await project.openAttributeTable(layerName);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        // Get table wrapper
        let tableWrapper = project.attributeTableWrapper(layerName);

        // Attribute table in edition mode
        // Create the promise to wait for the request to modify feature
        const modifyFeaturePromise = page.waitForRequest(/lizmap\/edition\/modifyFeature/);
        // click on edit button of the first row
        tableWrapper.locator('div.dataTables_scrollBody tr[id="1"] td lizmap-feature-toolbar .feature-edit').click();
        const modifyFeatureRequest = await modifyFeaturePromise;
        // Create the promise to wait for the request to open the form
        const editFeaturePromise = page.waitForRequest(/lizmap\/edition\/editFeature/);
        // Wait for modify feature response
        await modifyFeatureRequest.response();
        const editFeatureRequest = await editFeaturePromise;
        // Wait for the form and check it
        responseExpect(await editFeatureRequest.response()).toBeTextPlain();
        // Create the promise to wait for datatables request
        const getFeaturePromise = project.waitForGetFeatureRequest();
        getFeatureRequest = await getFeaturePromise;
        getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();

        // Child layer
        const childLayerName = 'attribute_table';
        const editionChildTable = page.locator(`#edition-child-tab-${layerName}-${childLayerName}`);
        const editionChildTableWrapper = page.locator(`#edition-table-${layerName}-${childLayerName}_wrapper`);

        // Child table is visible
        await expect(editionChildTable).toBeVisible();
        await expect(editionChildTableWrapper).toBeVisible();
        // Child table headers
        const child_theaders = editionChildTableWrapper.locator('div.dataTables_scrollHead th');
        await expect(child_theaders).toHaveCount(11);
        const child_headers = await child_theaders.allTextContents();
        expect(child_headers).toEqual(expect.arrayContaining(attribute_table_headers));
        // Child table data
        const row = attribute_table_rows[0];
        await expect(editionChildTableWrapper.locator(`div.dataTables_scrollBody tr[id="${row.id}"]`)).toHaveCount(1);
        const child_tdata = editionChildTableWrapper.locator(`div.dataTables_scrollBody tr[id="${row.id}"] td`);
        await expect(child_tdata).toHaveCount(11);
        const data = await child_tdata.allTextContents();
        expect(data).toEqual(expect.arrayContaining(row.values));
    });

    test('As children layers are not published in WFS, it must display keys and not values in attribute table', async ({ page }) => {
        const project = new ProjectPage(page, 'key_value_mapping');

        let layerName = 'attribute_table_shortname';
        let getFeatureRequest = await project.openAttributeTable(layerName);
        let getFeatureResponse = await getFeatureRequest.response();
        responseExpect(getFeatureResponse).toBeGeoJson();
        let tableWrapper = project.attributeTableWrapper(layerName);
        const theaders = tableWrapper.locator('div.dataTables_scrollHead th');
        await expect(theaders).toHaveCount(11);
        const headers = await theaders.allTextContents();
        expect(headers).toEqual(expect.arrayContaining(attribute_table_shortname_headers));

        for (const row of attribute_table_shortname_rows) {
            const tdata = tableWrapper.locator(`div.dataTables_scrollBody tr[id="${row.id}"] td`);
            await expect(tdata).toHaveCount(11);
            const data = await tdata.allTextContents();
            expect(data).toEqual(expect.arrayContaining(row.values));
        }
    });
});

test.describe('Key/value in form filter @readonly', () => {

    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'key_value_mapping');
        project.layersInTreeView = 0;
        project.waitForGetLegendGraphicDuringLoad = false;
        await project.open();

        await page.locator('#button-filter').click();
    });

    test('must display form filter with values instead of keys', async ({ page }) => {
        const form_fields = [{
            title: 'label from int (value relation)',
            labels :['first', 'second', 'third', 'fourth'],
        }, {
            title: 'label from text (value relation)',
            labels: ['premier', 'quatrième', 'deuxième', 'troisième'],
        }, {
            title: 'label from int (value map)',
            labels: ['one', 'two', 'three', 'four'],
        }, {
            title: 'label from text (value map)',
            labels: ['two', 'four', 'three', 'one'],
        }, {
            title: 'label from int (relation reference)',
            labels: ['first', 'second', 'third', 'fourth'],
        }, {
            title: 'label from text (relation reference)',
            labels: ['premier', 'quatrième', 'deuxième', 'troisième'],
        }];
        for (let len = form_fields.length, i = 0; i < len; i++) {
            const field = form_fields[i];
            await expect(page.locator(`#filter-field-order${i} span`)).toHaveText(field.title);
            const labels = await page.locator(`#filter-field-order${i} label`).allTextContents();
            expect(labels).toEqual(expect.arrayContaining(field.labels));
        }
    });
});
