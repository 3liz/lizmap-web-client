// @ts-check
import { test, expect } from '@playwright/test';
import { checkJson } from './globals';

test.describe('Datables Requests @requests @readonly', () => {

    test('Simple request', async({ request }) => {
        // Simple datatable request
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'attribute_table',
            layerId: 'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        let url = `/index.php/lizmap/datatables?${params}`;
        let response = await request.post(url, {
            data: {
                start: 0,
                length: 50,
                columns: [
                    {'data': 'lizSelected'},
                    {'data': 'featureToolbar'},
                    {'data': 'quartier'},
                ],
                order: [{'column': 2, 'dir': 'asc'}],
            }
        });

        const body = await checkJson(response);
        expect(body).toHaveProperty('draw');
        expect(body).toHaveProperty('recordsTotal', 7);
        expect(body).toHaveProperty('recordsFiltered', 7);
        // Check data
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('type', 'FeatureCollection');
        expect(body.data).toHaveProperty('features');
        expect(body.data.features).toHaveLength(7);
        /** @type {any[]} */
        const features = body.data.features;
        expect(features.map(feat => feat.properties.quartier)).toEqual(
            [1,2,3,4,5,6,7]
        );
        // Check editable features
        expect(body).toHaveProperty('editableFeatures');
        expect(body.editableFeatures).toHaveProperty('status', 'restricted');
        expect(body.editableFeatures).toHaveProperty('featuresids');
        expect(body.editableFeatures.featuresids).toHaveLength(0);
    });

    test('Bbox request', async({ request }) => {
        // Simple datatable request
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'attribute_table',
            layerId: 'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        let url = `/index.php/lizmap/datatables?${params}`;
        let response = await request.post(url, {
            data: {
                start: 0,
                length: 50,
                columns: [
                    {'data': 'lizSelected'},
                    {'data': 'featureToolbar'},
                    {'data': 'quartier'},
                ],
                order: [{'column': 2, 'dir': 'asc'}],
                bbox: '763699.512775506,6280476.5039667105,775413.9632877404,6284266.667797037',
                srsname: 'EPSG:2154',
            }
        });

        const body = await checkJson(response);
        expect(body).toHaveProperty('draw');
        expect(body).toHaveProperty('recordsTotal', 7);
        expect(body).toHaveProperty('recordsFiltered', 5);
        // Check data
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('type', 'FeatureCollection');
        expect(body.data).toHaveProperty('features');
        expect(body.data.features).toHaveLength(5);
        /** @type {any[]} */
        const features = body.data.features;
        expect(features.map(feat => feat.properties.quartier)).toEqual(
            [1,2,3,6,7]
        );
    });

    test('Order request with a shapefile layer', async({ request }) => {
        // Simple datatable request
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'attribute_table',
            layerId: 'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        let url = `/index.php/lizmap/datatables?${params}`;
        let response = await request.post(url, {
            data: {
                start: 0,
                length: 50,
                columns: [
                    {'data': 'lizSelected'},
                    {'data': 'featureToolbar'},
                    {'data': 'quartier'},
                ],
                order: [{'column': 2, 'dir': 'desc'}],
            }
        });

        const body = await checkJson(response);
        expect(body).toHaveProperty('draw');
        expect(body).toHaveProperty('recordsTotal', 7);
        expect(body).toHaveProperty('recordsFiltered', 7);
        // Check data
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('type', 'FeatureCollection');
        expect(body.data).toHaveProperty('features');
        expect(body.data.features).toHaveLength(7);
        /** @type {any[]} */
        const features = body.data.features;
        expect(features.map(feat => feat.properties.quartier)).toEqual(
            [1,2,3,4,5,6,7].reverse()
        );
    });

    test('Order request with a postgresql layer', async({ request }) => {
        // Simple datatable request
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'huge_attribute_table',
            layerId: 'huge_table_3a6c5511_aa6a_43fe_957e_e2c3f5b0a085',
        });
        let url = `/index.php/lizmap/datatables?${params}`;
        let response = await request.post(url, {
            data: {
                start: 0,
                length: 10,
                columns: [
                    {'data': 'lizSelected'},
                    {'data': 'featureToolbar'},
                    {'data': 'id'},
                ],
                order: [{'column': 2, 'dir': 'desc'}],
            }
        });

        const body = await checkJson(response);
        expect(body).toHaveProperty('draw');
        expect(body).toHaveProperty('recordsTotal', 5000);
        expect(body).toHaveProperty('recordsFiltered', 5000);
        // Check data
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('type', 'FeatureCollection');
        expect(body.data).toHaveProperty('features');
        expect(body.data.features).toHaveLength(10);
        /** @type {any[]} */
        const features = body.data.features;
        expect(features.map(feat => feat.properties.id)).toEqual(
            [5000,4999,4998,4997,4996,4995,4994,4993,4992,4991]
        );
    });

    test('Search request', async({ request }) => {
        // Simple datatable request
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'attribute_table',
            layerId: 'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        let url = `/index.php/lizmap/datatables?${params}`;
        let response = await request.post(url, {
            data: {
                start: 0,
                length: 50,
                columns: [
                    {'data': 'lizSelected'},
                    {'data': 'featureToolbar'},
                    {'data': 'quartier'},
                    {'data': 'quartmno'},
                ],
                order: [{'column': 2, 'dir': 'asc'}],
                searchBuilder: {
                    criteria: [
                        {'condition': '=', 'data': 'quartmno', 'origData': 'quartmno', 'value1': 'CX', 'type': 'string'},
                    ],
                    logic: 'AND',
                },
            }
        });

        let body = await checkJson(response);
        expect(body).toHaveProperty('draw');
        expect(body).toHaveProperty('recordsTotal', 7);
        expect(body).toHaveProperty('recordsFiltered', 1);
        // Check data
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('type', 'FeatureCollection');
        expect(body.data).toHaveProperty('features');
        expect(body.data.features).toHaveLength(1);
        /** @type {any[]} */
        let features = body.data.features;
        expect(features.map(feat => feat.properties.quartier)).toEqual(
            [4]
        );
        expect(features.map(feat => feat.properties.quartmno)).toEqual(
            ['CX']
        );

        response = await request.post(url, {
            data: {
                start: 0,
                length: 50,
                columns: [
                    {'data': 'lizSelected'},
                    {'data': 'featureToolbar'},
                    {'data': 'quartier'},
                    {'data': 'quartmno'},
                ],
                order: [{'column': 2, 'dir': 'asc'}],
                searchBuilder: {
                    criteria: [
                        {'condition': 'starts', 'data': 'quartmno', 'origData': 'quartmno', 'value1': 'C', 'type': 'string'},
                    ],
                    logic: 'AND',
                },
            }
        });

        body = await checkJson(response);
        expect(body).toHaveProperty('draw');
        expect(body).toHaveProperty('recordsTotal', 7);
        expect(body).toHaveProperty('recordsFiltered', 2);
        // Check data
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('type', 'FeatureCollection');
        expect(body.data).toHaveProperty('features');
        expect(body.data.features).toHaveLength(2);
        /** @type {any[]} */
        features = body.data.features;
        expect(features.map(feat => feat.properties.quartier)).toEqual(
            [3,4]
        );
        expect(features.map(feat => feat.properties.quartmno)).toEqual(
            ['CV','CX']
        );

        response = await request.post(url, {
            data: {
                start: 0,
                length: 50,
                columns: [
                    {'data': 'lizSelected'},
                    {'data': 'featureToolbar'},
                    {'data': 'quartier'},
                    {'data': 'quartmno'},
                ],
                order: [{'column': 2, 'dir': 'asc'}],
                searchBuilder: {
                    criteria: [
                        {'condition': 'starts', 'data': 'quartmno', 'origData': 'quartmno', 'value1': 'C', 'type': 'string'},
                        {'condition': 'starts', 'data': 'quartmno', 'origData': 'quartmno', 'value1': 'P', 'type': 'string'},
                    ],
                    logic: 'OR',
                },
            }
        });

        body = await checkJson(response);
        expect(body).toHaveProperty('draw');
        expect(body).toHaveProperty('recordsTotal', 7);
        expect(body).toHaveProperty('recordsFiltered', 4);
        // Check data
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('type', 'FeatureCollection');
        expect(body.data).toHaveProperty('features');
        expect(body.data.features).toHaveLength(4);
        /** @type {any[]} */
        features = body.data.features;
        expect(features.map(feat => feat.properties.quartier)).toEqual(
            [2,3,4,5]
        );
        expect(features.map(feat => feat.properties.quartmno)).toEqual(
            ['PA','CV','CX','PR']
        );
    });

    test('Pages request', async({ request }) => {
        // Simple datatable request
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'attribute_table',
            layerId: 'points_b288cb23_3e45_4e22_ad33_152363ef6d21',
        });
        let url = `/index.php/lizmap/datatables?${params}`;
        let response = await request.post(url, {
            data: {
                start: 0,
                length: 50,
                columns: [
                    {'data': 'lizSelected'},
                    {'data': 'featureToolbar'},
                    {'data': 'id'},
                    {'data': 'quartier'},
                ],
                order: [{'column': 2, 'dir': 'asc'}],
            }
        });
        let body = await checkJson(response);
        expect(body).toHaveProperty('draw');
        expect(body).toHaveProperty('recordsTotal', 700);
        expect(body).toHaveProperty('recordsFiltered', 700);
        // Check data
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('type', 'FeatureCollection');
        expect(body.data).toHaveProperty('features');
        expect(body.data.features).toHaveLength(50);
        expect(body.data.features[0].properties.id).toEqual(0);
        expect(body.data.features[49].properties.id).toEqual(49);

        response = await request.post(url, {
            data: {
                start: 650,
                length: 50,
                columns: [
                    {'data': 'lizSelected'},
                    {'data': 'featureToolbar'},
                    {'data': 'id'},
                    {'data': 'quartier'},
                ],
                order: [{'column': 2, 'dir': 'asc'}],
            }
        });
        body = await checkJson(response);
        expect(body).toHaveProperty('draw');
        expect(body).toHaveProperty('recordsTotal', 700);
        expect(body).toHaveProperty('recordsFiltered', 700);
        // Check data
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('type', 'FeatureCollection');
        expect(body.data).toHaveProperty('features');
        expect(body.data.features).toHaveLength(50);
        expect(body.data.features[0].properties.id).toEqual(650);
        expect(body.data.features[49].properties.id).toEqual(699);

        response = await request.post(url, {
            data: {
                start: 0,
                length: 50,
                columns: [
                    {'data': 'lizSelected'},
                    {'data': 'featureToolbar'},
                    {'data': 'id'},
                    {'data': 'quartier'},
                    {'data': 'libquart'},
                ],
                order: [{'column': 2, 'dir': 'asc'}],
                searchBuilder: {
                    criteria: [
                        {'condition': 'starts', 'data': 'libquart', 'origData': 'libquart', 'value1': 'pres', 'type': 'string'},
                    ],
                    logic: 'AND',
                },
            }
        });
        body = await checkJson(response);
        expect(body).toHaveProperty('draw');
        expect(body).toHaveProperty('recordsTotal', 700);
        expect(body).toHaveProperty('recordsFiltered', 100);
        // Check data
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('type', 'FeatureCollection');
        expect(body.data).toHaveProperty('features');
        expect(body.data.features).toHaveLength(50);
        expect(body.data.features[0].properties.id).toEqual(500);
        expect(body.data.features[49].properties.id).toEqual(549);
    });

    test('Filter featureIds request', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'attribute_table',
            layerId: 'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        let url = `/index.php/lizmap/datatables?${params}`;
        let response = await request.post(url, {
            data: {
                start: 0,
                length: 50,
                columns: [
                    {'data': 'lizSelected'},
                    {'data': 'featureToolbar'},
                    {'data': 'quartier'},
                    {'data': 'quartmno'},
                ],
                order: [{'column': 2, 'dir': 'asc'}],
                filteredfeatureids: '2,3',
            }
        });

        let body = await checkJson(response);
        expect(body).toHaveProperty('draw');
        expect(body).toHaveProperty('recordsTotal', 7);
        expect(body).toHaveProperty('recordsFiltered', 2);
        // Check data
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('type', 'FeatureCollection');
        expect(body.data).toHaveProperty('features');
        expect(body.data.features).toHaveLength(2);
        /** @type {any[]} */
        let features = body.data.features;
        expect(features.map(feat => feat.properties.quartier)).toEqual(
            [2,3]
        );
    });

    test('Error: The parameters repository, project and layerId are mandatory.', async({ request }) => {
        // layerId is forgotten
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'attribute_table',
            //layerId: 'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        let url = `/index.php/lizmap/datatables?${params}`;
        const data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],
            order: [{'column': 2, 'dir': 'asc'}],
        };
        let response = await request.post(url, {
            data: data,
        });
        // check response
        let body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message', 'The parameters repository, project and layerId are mandatory.');

        // project is forgotten
        params = new URLSearchParams({
            repository: 'testsrepository',
            //project: 'attribute_table',
            layerId: 'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        url = `/index.php/lizmap/datatables?${params}`;
        response = await request.post(url, {
            data: data,
        });
        // check response
        body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message', 'The parameters repository, project and layerId are mandatory.');

        // repository is forgotten
        params = new URLSearchParams({
            //repository: 'testsrepository',
            project: 'attribute_table',
            layerId: 'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        url = `/index.php/lizmap/datatables?${params}`;
        response = await request.post(url, {
            data: data,
        });
        // check response
        body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message', 'The parameters repository, project and layerId are mandatory.');

        // layerId is empty
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'attribute_table',
            layerId: '', //'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        url = `/index.php/lizmap/datatables?${params}`;
        response = await request.post(url, {
            data: data,
        });
        // check response
        body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message', 'The parameters repository, project and layerId are mandatory.');
    });

    test('Error: The DataTables parameters start, length, order and columns are mandatory.', async({ request }) => {
        const params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'attribute_table',
            layerId: 'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        const url = `/index.php/lizmap/datatables?${params}`;
        // start is forgotten
        let data = {
            //start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],
            order: [{'column': 2, 'dir': 'asc'}],
        };
        let response = await request.post(url, {
            data: data,
        });
        // check response
        let body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message', 'The DataTables parameters start, length, order and columns are mandatory.');

        // length is forgotten
        data = {
            start: 0,
            //length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],
            order: [{'column': 2, 'dir': 'asc'}],
        };
        response = await request.post(url, {
            data: data,
        });
        // check response
        body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message', 'The DataTables parameters start, length, order and columns are mandatory.');

        // columns is forgotten
        data = {
            start: 0,
            length: 50,
            /*columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],*/
            order: [{'column': 2, 'dir': 'asc'}],
        };
        response = await request.post(url, {
            data: data,
        });
        // check response
        body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message', 'The DataTables parameters start, length, order and columns are mandatory.');

        // order is forgotten
        data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],
            //order: [{'column': 2, 'dir': 'asc'}],
        };
        response = await request.post(url, {
            data: data,
        });
        // check response
        body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message', 'The DataTables parameters start, length, order and columns are mandatory.');
    });

    test('Error: The DataTables parameter order is not well formed.', async({ request }) => {
        const params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'attribute_table',
            layerId: 'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        const url = `/index.php/lizmap/datatables?${params}`;
        // order is not an array
        let data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],
            order: 2, //[{'column': 2, 'dir': 'asc'}],
        };
        let response = await request.post(url, {
            data: data,
        });
        // check response
        let body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message');
        expect(body.message).toMatch(/The DataTables parameter order .* is not well formed\./);

        // order is an empty array
        data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],
            order: [], //[{'column': 2, 'dir': 'asc'}],
        };
        response = await request.post(url, {
            data: data,
        });
        // check response
        body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message');
        expect(body.message).toMatch(/The DataTables parameter order .* is not well formed\./);

        // order is an object (in PHP an array without 0)
        data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],
            order: {'column': 2, 'dir': 'asc'}, //[{'column': 2, 'dir': 'asc'}],
        };
        response = await request.post(url, {
            data: data,
        });
        // check response
        body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message');
        expect(body.message).toMatch(/The DataTables parameter order .* is not well formed\./);

        // order is an array containing an object without column
        data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],
            order: [{'dir': 'asc'}], //[{'column': 2, 'dir': 'asc'}],
        };
        response = await request.post(url, {
            data: data,
        });
        // check response
        body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message');
        expect(body.message).toMatch(/The DataTables parameter order .* is not well formed\./);

        // order is an array containing an object without dir
        data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],
            order: [{'column': 2}], //[{'column': 2, 'dir': 'asc'}],
        };
        response = await request.post(url, {
            data: data,
        });
        // check response
        body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message');
        expect(body.message).toMatch(/The DataTables parameter order .* is not well formed\./);
    });

    test('Error: The DataTables parameter columns is not well formed.', async({ request }) => {
        const params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'attribute_table',
            layerId: 'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        const url = `/index.php/lizmap/datatables?${params}`;
        // columns is not an array
        let data = {
            start: 0,
            length: 50,
            columns: 2,
            /*[
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],*/
            order: [{'column': 2, 'dir': 'asc'}],
        };
        let response = await request.post(url, {
            data: data,
        });
        // check response
        let body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message');
        expect(body.message).toMatch(/The DataTables parameter columns .* is not well formed\./);

        // columns is an empty array
        data = {
            start: 0,
            length: 50,
            columns: [],
            /*[
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],*/
            order: [{'column': 2, 'dir': 'asc'}],
        };
        response = await request.post(url, {
            data: data,
        });
        // check response
        body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message');
        expect(body.message).toMatch(/The DataTables parameter columns .* is not well formed\./);

        // columns is an array of object without data
        data = {
            start: 0,
            length: 50,
            columns: [{},{},{}],
            /*[
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],*/
            order: [{'column': 2, 'dir': 'asc'}],
        };
        response = await request.post(url, {
            data: data,
        });
        // check response
        body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message');
        expect(body.message).toMatch(/The DataTables parameter columns .* is not well formed\./);
    });

    test('Error: The DataTables parameters order and columns are not compatible.', async({ request }) => {
        const params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'attribute_table',
            layerId: 'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        const url = `/index.php/lizmap/datatables?${params}`;
        // two columns but the third is used for order
        let data = {
            start: 0,
            length: 50,
            columns: [{},{}],
            /*[
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],*/
            order: [{'column': 2, 'dir': 'asc'}],
        };
        let response = await request.post(url, {
            data: data,
        });
        // check response
        let body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message', 'The DataTables parameters order and columns are not compatible.');
    });

    test('Error: The bbox parameter must contain 4 numbers separated by a comma.', async({ request }) => {
        // bbox parameter with less than 4 values separated by comma
        const params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'attribute_table',
            layerId: 'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        const url = `/index.php/lizmap/datatables?${params}`;
        const data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],
            order: [{'column': 2, 'dir': 'asc'}],
            srsname: 'EPSG:4326',
            bbox: '758900.4100877657,6275330.0494606085,782329.3111122344,6283452.774039391',
        };
        let response = await request.post(url, {
            data: Object.assign(
                {},
                data,
                {
                    bbox: '758900.4100877657,6275330.0494606085,782329.3111122344', //,6283452.774039391',
                },
            ),
        });
        // check response
        let body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message', 'The bbox parameter must contain 4 numbers separated by a comma.');

        // bbox parameter with more than 4 values separated by comma
        response = await request.post(url, {
            data: Object.assign(
                {},
                data,
                {
                    bbox: '758900.4100877657,6275330.0494606085,782329.3111122344,6283452.774039391,1234.5678',
                },
            ),
        });
        // check response
        body = await checkJson(response, 400);
        // check response body
        expect(body).toHaveProperty('status', 400);
        expect(body).toHaveProperty('code', 'Bad Request');
        expect(body).toHaveProperty('message', 'The bbox parameter must contain 4 numbers separated by a comma.');
    });

    test('Error: The lizmap project does not exists.', async({ request }) => {
        // Unknown project in testsrepository
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'unknown', //'attribute_table',
            layerId: 'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        let url = `/index.php/lizmap/datatables?${params}`;
        const data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],
            order: [{'column': 2, 'dir': 'asc'}],
        };
        let response = await request.post(url, {
            data: data,
        });
        // check response
        let body = await checkJson(response, 404);
        // check response body
        expect(body).toHaveProperty('status', 404);
        expect(body).toHaveProperty('code', 'Not Found');
        expect(body).toHaveProperty('message', 'The lizmap project testsrepository~unknown does not exist.');

        // Unknown repository
        params = new URLSearchParams({
            repository: 'unknown', //'testsrepository',
            project: 'attribute_table',
            layerId: 'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        url = `/index.php/lizmap/datatables?${params}`;
        response = await request.post(url, {
            data: data,
        });
        // check response
        body = await checkJson(response, 404);
        // check response body
        expect(body).toHaveProperty('status', 404);
        expect(body).toHaveProperty('code', 'Not Found');
        expect(body).toHaveProperty('message', 'The lizmap project unknown~attribute_table does not exist.');
    });

    test('Error: The layerId does not exists.', async({ request }) => {
        // Unknown project in testsrepository
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'attribute_table',
            layerId: 'unknown', //'quartiers_5fe55662_2cbf_48f4_a505_498c61fe978c',
        });
        let url = `/index.php/lizmap/datatables?${params}`;
        const data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'quartier'},
            ],
            order: [{'column': 2, 'dir': 'asc'}],
        };
        let response = await request.post(url, {
            data: data,
        });
        // check response
        let body = await checkJson(response, 404);
        // check response body
        expect(body).toHaveProperty('status', 404);
        expect(body).toHaveProperty('code', 'Not Found');
        expect(body).toHaveProperty('message', 'The layerId unknown does not exist.');
    });

    test('Extent request', async({ request }) => {
        // Unknown project in testsrepository
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'huge_attribute_table',
            layerId: 'bakeries_8ca232e6_df58_44f7_94df_b4c02cc7a79c',
        });
        let url = `/index.php/lizmap/datatables/filteredFeaturesExtent?${params}`;
        const data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'id'},
                {'data': 'polygon_id'},
            ],
            order: [{'column': 2, 'dir': 'asc'}],
            searchBuilder: {
                criteria: [
                    {'condition': '=', 'data': 'id', 'origData': 'id', 'value1': '1', 'type': 'num'},
                    {'condition': '=', 'data': 'id', 'origData': 'id', 'value1': '16', 'type': 'num'},
                ],
                logic: 'OR',
            },
        };
        let response = await request.post(url, {
            data: data,
        });
        // check response
        let body = await checkJson(response, 200);
        // check response body
        expect(body).toStrictEqual([
            3.811568,
            43.653714,
            3.913073,
            43.659122
        ]);
    });

    test('Extent request with bounding box', async({ request }) => {
        // Unknown project in testsrepository
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'huge_attribute_table',
            layerId: 'bakeries_8ca232e6_df58_44f7_94df_b4c02cc7a79c',
        });
        let url = `/index.php/lizmap/datatables/filteredFeaturesExtent?${params}`;
        const data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'id'},
                {'data': 'polygon_id'},
            ],
            order: [{'column': 2, 'dir': 'asc'}],
            searchBuilder: {
            },
            bbox: "3.742569554123125,43.533186092555084,3.8550758801931164,43.58580809903438",
        };
        let response = await request.post(url, {
            data: data,
        });
        // check response
        let body = await checkJson(response, 200);
        // check response body
        expect(body).toStrictEqual([
            3.766922,
            43.561103,
            3.942209,
            43.683412
        ]);
    });

    test('Extent request with filtered features', async({ request }) => {
        // Unknown project in testsrepository
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'huge_attribute_table',
            layerId: 'bakeries_8ca232e6_df58_44f7_94df_b4c02cc7a79c',
        });
        let url = `/index.php/lizmap/datatables/filteredFeaturesExtent?${params}`;
        const data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'id'},
                {'data': 'polygon_id'},
            ],
            order: [{'column': 2, 'dir': 'asc'}],
            searchBuilder: {
            },
            exp_filter: "$id IN ( 0 , 1 ) ",
            filteredfeatureids: "0,1",
        };
        let response = await request.post(url, {
            data: data,
        });
        // check response
        let body = await checkJson(response, 200);
        // check response body
        expect(body).toStrictEqual([
            3.811568,
            43.653714,
            3.913073,
            43.659122
        ]);
    });

    test('Extent request on a single point feature', async({ request }) => {
        // Unknown project in testsrepository
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'huge_attribute_table',
            layerId: 'bakeries_8ca232e6_df58_44f7_94df_b4c02cc7a79c',
        });
        let url = `/index.php/lizmap/datatables/filteredFeaturesExtent?${params}`;
        const data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'id'},
                {'data': 'polygon_id'},
            ],
            order: [{'column': 2, 'dir': 'asc'}],
            searchBuilder: {
                criteria: [
                    {'condition': '=', 'data': 'id', 'origData': 'id', 'value1': '1', 'type': 'num'},
                ],
                logic: 'AND',
            },
        };
        let response = await request.post(url, {
            data: data,
        });
        // check response
        let body = await checkJson(response, 200);
        // check response body
        expect(body).toStrictEqual([
            3.913073,
            43.659122,
            3.913073,
            43.659122
        ]);
    });

    test('Empty response on extent request', async({ request }) => {
        // Unknown project in testsrepository
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'huge_attribute_table',
            layerId: 'bakeries_8ca232e6_df58_44f7_94df_b4c02cc7a79c',
        });
        let url = `/index.php/lizmap/datatables/filteredFeaturesExtent?${params}`;
        const data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'id'},
                {'data': 'polygon_id'},
            ],
            order: [{'column': 2, 'dir': 'asc'}],
            searchBuilder: {
                criteria: [
                    {'condition': '=', 'data': 'id', 'origData': 'id', 'value1': '1', 'type': 'num'},
                    {'condition': '=', 'data': 'id', 'origData': 'id', 'value1': '16', 'type': 'num'},
                ],
                logic: 'AND',
            },
        };
        let response = await request.post(url, {
            data: data,
        });
        // check response
        let body = await checkJson(response, 200);
        // check response body
        expect(body).toStrictEqual([]);
    });

    test('Error: Invalid geometry on extent request', async({ request }) => {
        // Unknown project in testsrepository
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'huge_attribute_table',
            layerId: 'lookup_1_7c7e31d9_b595_4e70_bd13_47ed8df34896',
        });
        let url = `/index.php/lizmap/datatables/filteredFeaturesExtent?${params}`;
        const data = {
            start: 0,
            length: 50,
            columns: [
                {'data': 'lizSelected'},
                {'data': 'featureToolbar'},
                {'data': 'id'},
            ],
            order: [{'column': 2, 'dir': 'asc'}],
        };
        let response = await request.post(url, {
            data: data,
        });
        // check response
        let body = await checkJson(response, 404);
        // check response body
        expect(body).toHaveProperty('status', 404);
        expect(body).toHaveProperty('code', 'Not Found');
        expect(body).toHaveProperty('message', 'Invalid geometry');
    });

    test('Select datatables filtered features request', async({ request }) => {
        // Simple datatable request
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'huge_attribute_table',
            layerId: 'huge_table_3a6c5511_aa6a_43fe_957e_e2c3f5b0a085',
        });
        let url = `/index.php/lizmap/datatables/selectFilteredFeatures?${params}`;
        let response = await request.post(url, {
            data: {
                start: 0,
                length: 50,
                columns: [
                    {'data': 'lizSelected'},
                    {'data': 'featureToolbar'},
                    {'data': 'id'},
                    {'data': 'lookup_1'},
                ],
                order: [{'column': 2, 'dir': 'asc'}],
                searchBuilder: {
                    criteria: [
                        {'condition': '=', 'data': 'Large lookup', 'origData': 'lookup_1', 'value1': '18', 'type': 'string'},
                    ],
                    logic: 'AND',
                },
            }
        });

        let body = await checkJson(response, 200);
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(69);
        /** @type {any[]} */
        let features = body.features;
        expect(features.map(feat => feat.id.split('.')[1])).toStrictEqual(
            [
                "157",
                "241",
                "330",
                "349",
                "386",
                "490",
                "957",
                "1027",
                "1062",
                "1201",
                "1246",
                "1306",
                "1369",
                "1410",
                "1491",
                "1631",
                "1642",
                "1693",
                "1831",
                "1837",
                "1853",
                "1950",
                "2000",
                "2014",
                "2035",
                "2124",
                "2233",
                "2355",
                "2376",
                "2409",
                "2435",
                "2460",
                "2482",
                "2513",
                "2754",
                "2778",
                "2799",
                "2843",
                "2908",
                "3348",
                "3354",
                "3355",
                "3391",
                "3414",
                "3519",
                "3537",
                "3593",
                "3631",
                "3650",
                "3708",
                "3718",
                "3764",
                "3840",
                "3902",
                "3965",
                "4106",
                "4174",
                "4192",
                "4261",
                "4275",
                "4329",
                "4415",
                "4556",
                "4730",
                "4763",
                "4831",
                "4920",
                "4944",
                "4958"
            ]
        );
    })
});
