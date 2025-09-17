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
        expect(body).toHaveProperty('recordsTotal', '7');
        expect(body).toHaveProperty('recordsFiltered', '7');
        // Check data
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('type', 'FeatureCollection');
        expect(body.data).toHaveProperty('features');
        expect(body.data.features).toHaveLength(7);
        expect(body.data.features.map(feat => feat.properties.quartier)).toEqual(
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
        expect(body).toHaveProperty('recordsTotal', '7');
        expect(body).toHaveProperty('recordsFiltered', '5');
        // Check data
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('type', 'FeatureCollection');
        expect(body.data).toHaveProperty('features');
        expect(body.data.features).toHaveLength(5);
        expect(body.data.features.map(feat => feat.properties.quartier)).toEqual(
            [1,2,3,6,7]
        );
    });

    test('Order request', async({ request }) => {
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
        expect(body).toHaveProperty('recordsTotal', '7');
        expect(body).toHaveProperty('recordsFiltered', '7');
        // Check data
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('type', 'FeatureCollection');
        expect(body.data).toHaveProperty('features');
        expect(body.data.features).toHaveLength(7);
        expect(body.data.features.map(feat => feat.properties.quartier)).toEqual(
            [1,2,3,4,5,6,7].reverse()
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
        let data = {};
        // start is forgotten
        data = {
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
        let data = {};
        // order is not an array
        data = {
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
        let data = {};
        // columns is not an array
        data = {
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
        let data = {};
        // two columns but the third is used for order
        data = {
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
});
