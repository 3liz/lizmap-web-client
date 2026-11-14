// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js';

const url = '/index.php/dataviz/service';
const projectParams = new URLSearchParams({
    repository: 'testsrepository',
    project: 'dataviz',
});

test.describe('Dataviz API tests',
    {
        tag: ['@requests', '@readonly'],
    }, () => {

        test('Test JSON data for plot 0 - Municipalities', async ({request}) => {
            const response = await request.get(
                `${url}?${projectParams}`,
                {
                    params:{
                        'request': 'getPlot',
                        'plot_id': '0',
                    }
                });
            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json).toHaveProperty('title', 'Municipalities');
            expect(json).toHaveProperty('data');

            // check data
            const data = json.data;
            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('type', 'bar');
            expect(data[0]).toHaveProperty('x');
            expect(data[0].x).toEqual(
                expect.arrayContaining([
                    "Grabels", "Clapiers", "Montferrier-sur-Lez", "Saint-Jean-de-Védas", "Lattes", "Montpellier",
                    "Lavérune", "Juvignac", "Le Crès", "Castelnau-le-Lez"
                ])
            );
            // Values are aggregated server side: one polygon per municipality
            expect(data[0]).not.toHaveProperty('transforms');
            expect(data[0].x).toHaveLength(10);
            expect(data[0]).toHaveProperty('y');
            expect(data[0].y).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

            expect(json).toHaveProperty('layout')
        });

        test('Test JSON data for plot 2 - Pie bakeries by municipalities', async ({request}) => {
            const response = await request.get(
                `${url}?${projectParams}`,
                {
                    params:{
                        'request': 'getPlot',
                        'plot_id': '2',
                    }
                });
            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json).toHaveProperty('title', 'Pie Bakeries by municipalities');
            expect(json).toHaveProperty('data');

            // check data
            const data = json.data;
            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('type', 'pie');
            expect(data[0]).toHaveProperty('labels');
            expect(data[0].labels).toEqual(
                expect.arrayContaining([
                    "Castelnau-le-Lez", "Clapiers", "Grabels", "Juvignac", "Lattes", "Lavérune", "Le Crès",
                    "Montferrier-sur-Lez", "Montpellier", "Saint-Jean-de-Védas"
                ])
            );
            expect(data[0]).toHaveProperty('values');
            expect(data[0].values).toEqual([4, 2, 6, 1, 2, 1, 2, 1, 4, 2]);

            expect(json).toHaveProperty('layout')
        });

        test('Test JSON data for plot 3 - Horizontal bar bakeries in municipalities', async ({request}) => {
            const response = await request.get(
                `${url}?${projectParams}`,
                {
                    params:{
                        'request': 'getPlot',
                        'plot_id': '3',
                    }
                });
            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json).toHaveProperty('title', 'Horizontal bar bakeries in municipalities');
            expect(json).toHaveProperty('data');

            // check data
            const data = json.data;
            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('type', 'bar');
            expect(data[0]).toHaveProperty('orientation', 'h');
            // Values are aggregated server side: count of bakeries per municipality
            expect(data[0]).not.toHaveProperty('transforms');
            expect(data[0]).toHaveProperty('x');
            expect(data[0]).toHaveProperty('y');
            expect(data[0].y).toHaveLength(10);
            expect(data[0].x).toHaveLength(10);
            const countByMunicipality = Object.fromEntries(
                data[0].y.map((municipality, i) => [municipality, data[0].x[i]])
            );
            expect(countByMunicipality).toEqual({
                "Castelnau-le-Lez": 4,
                "Clapiers": 2,
                "Grabels": 6,
                "Juvignac": 1,
                "Lattes": 2,
                "Lavérune": 1,
                "Le Crès": 2,
                "Montferrier-sur-Lez": 1,
                "Montpellier": 4,
                "Saint-Jean-de-Védas": 2,
            });

            expect(json).toHaveProperty('layout')
        });
    });

test.describe('Dataviz API tests JSON data filtered for plot in popup',
    {
        tag: ['@requests', '@readonly'],
    }, () => {

        test('Number of bakeries by polygon', async ({request}) => {
            const projParams = new URLSearchParams({
                repository: 'testsrepository',
                project: 'dataviz_filtered_in_popup',
            });
            const response = await request.get(
                `${url}?${projParams}`,
                {
                    params:{
                        'request': 'getPlot',
                        'plot_id': '0',
                        'exp_filter': `"polygon_id" IN ('5')`,
                    }
                });
            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json).toHaveProperty('title', 'Number of bakeries by polygon');
            expect(json).toHaveProperty('data');

            // check data
            const data = json.data;
            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('type', 'bar');
            expect(data[0]).toHaveProperty('x');
            // Values are aggregated server side: 4 bakeries in polygon 5
            expect(data[0].x).toEqual([5]);
            expect(data[0]).toHaveProperty('y');
            expect(data[0].y).toEqual([4]);

            expect(json).toHaveProperty('layout')
        });

        test('Bakeries', async ({request}) => {
            const projParams = new URLSearchParams({
                repository: 'testsrepository',
                project: 'dataviz_filtered_in_popup',
            });
            const response = await request.get(
                `${url}?${projParams}`,
                {
                    params:{
                        'request': 'getPlot',
                        'plot_id': 1,
                        'exp_filter': `"polygon_id" IN ('5')`,
                    }
                });
            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json).toHaveProperty('title', 'Bakeries');
            expect(json).toHaveProperty('data');

            // check data
            const data = json.data;
            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('type', 'html');
            expect(data[0]).toHaveProperty('name', 'id');
            expect(data[0].x).toEqual(expect.arrayContaining([5]));
        });

        test('popup_bar users of point 1', async ({request}) => {
            const projParams = new URLSearchParams({
                repository: 'testsrepository',
                project: 'popup_bar',
            });
            const response = await request.get(
                `${url}?${projParams}`,
                {
                    params:{
                        'request': 'getPlot',
                        'plot_id': '0',
                        'exp_filter': `"fid_point" IN ('1')`,
                    }
                });
            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json).toHaveProperty('title', 'users');
            expect(json).toHaveProperty('data');

            // check data
            const data = json.data;
            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('type', 'scattergl');
            expect(data[0]).toHaveProperty('x');
            expect(data[0].x).toEqual(expect.arrayContaining(["2024-04-04", "2024-04-18", "2024-04-30"]));
            expect(data[0]).toHaveProperty('y');
            expect(data[0].y).toEqual(expect.arrayContaining([10, 15, 1]) );

            expect(json).toHaveProperty('layout')
        });

        test('popup_bar users of point 2', async ({request}) => {
            const projParams = new URLSearchParams({
                repository: 'testsrepository',
                project: 'popup_bar',
            });
            const response = await request.get(
                `${url}?${projParams}`,
                {
                    params:{
                        'request': 'getPlot',
                        'plot_id': '0',
                        'exp_filter': `"fid_point" IN ('2')`,
                    }
                });
            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json).toHaveProperty('title', 'users');
            expect(json).toHaveProperty('data');

            // check data
            const data = json.data;
            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('type', 'scattergl');
            expect(data[0]).toHaveProperty('x');
            expect(data[0].x).toEqual(expect.arrayContaining(["2024-04-04", "2024-04-30"]));
            expect(data[0]).toHaveProperty('y');
            expect(data[0].y).toEqual(expect.arrayContaining([45, 89]) );

            expect(json).toHaveProperty('layout')
        });

        test('popup_bar users of point 3 - empty', async ({request}) => {
            const projParams = new URLSearchParams({
                repository: 'testsrepository',
                project: 'popup_bar',
            });
            const response = await request.get(
                `${url}?${projParams}`,
                {
                    params:{
                        'request': 'getPlot',
                        'plot_id': '0',
                        'exp_filter': `"fid_point" IN ('3')`,
                    }
                });
            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json).toHaveProperty('title', 'users');
            expect(json).toHaveProperty('data');

            // check data
            const data = json.data;
            expect(data).toHaveLength(0);

            expect(json).toHaveProperty('layout')
        });
    });

test.describe('Dataviz API tests with Basic Auth',
    {
        tag: ['@requests', '@readonly'],
    }, () => {

        test('Create a new plot', async ({request}) => {
            const json_body = {
                "repository": "testsrepository",
                "project": "dataviz",
                "plot_config": {
                    "type": "bar",
                    "title": "Bakeries by district",
                    "layerId": "bakeries_1dbdac14_931c_4568_ad56_3a947a77d810",
                    "x_field": "polygons_name",
                    "aggregation": "count",
                    "traces": [
                        {
                            "color": "cyan",
                            "colorfield": "",
                            "y_field": "id",
                            "z_field": ""
                        }
                    ],
                    "popup_display_child_plot": "False",
                    "stacked": "False",
                    "horizontal": "False",
                    "only_show_child": "False",
                    "display_legend": "True",
                    "display_when_layer_visible": "False",
                    "order": 5
                }
            };
            const response = await request.post(url, {
                headers: {
                    authorization: "Basic " + btoa("admin:admin")
                },
                data: json_body,
            });
            responseExpect(response).toBeJson();
            const json = await response.json();

            expect(json).toHaveProperty('title', 'Bakeries by district');
            expect(json).toHaveProperty('data');

            // check data
            const data = json.data;
            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('type', 'bar');
            expect(data[0]).toHaveProperty('marker');
            expect(data[0].marker).toHaveProperty('color', 'cyan');
            // Values are aggregated server side: count of bakeries per district
            expect(data[0]).not.toHaveProperty('transforms');
            expect(data[0].x).toHaveLength(10);
            expect(data[0].y).toHaveLength(10);
            expect(data[0].y.reduce((total, count) => total + count, 0)).toBe(25);
        });

        test('Error with wrong layer ID', async ({request}) => {
            const json_body = {
                "repository": "testsrepository",
                "project": "dataviz",
                "plot_config": {
                    "type": "bar",
                    "title": "Bakeries by district",
                    "layerId": "bakeries_1dbdac14_931c_4568_ad56_3a947a77d810_WRONG_LAYER_ID",
                    "x_field": "polygons_name",
                    "aggregation": "count",
                    "traces": [
                        {
                            "color": "cyan",
                            "colorfield": "",
                            "y_field": "id",
                            "z_field": ""
                        }
                    ],
                    "popup_display_child_plot": "False",
                    "stacked": "False",
                    "horizontal": "False",
                    "only_show_child": "False",
                    "display_legend": "True",
                    "display_when_layer_visible": "False",
                    "order": 5
                }
            };
            const response = await request.post(url, {
                headers: {
                    authorization: "Basic " + btoa("admin:admin")
                },
                data: json_body,
            });
            responseExpect(response).toBeJson(404);
            const json = await response.json();
            expect(json).toHaveProperty('errors');
            // check errors
            const errors = json.errors;
            expect(errors).toHaveProperty('code', 404);
            expect(errors).toHaveProperty('error_code', 'layer_not_found');
        });
    });

/**
 * Get a plot from a plot configuration given to the dataviz API,
 * with a basic authentication.
 *
 * The plot groups the features by the X field and counts them,
 * with a second trace summing the Y field.
 * @param {import('@playwright/test').APIRequestContext} request The request context
 * @param {string} login    The user login, the password is "admin" for all the test users
 * @param {string} project  The project name
 * @param {string} layerId  The layer identifier
 * @param {string} xField   The field grouping the features
 * @param {string} yField   The numeric field to sum
 * @returns {Promise<object>} The plot JSON
 */
async function getAggregatedPlot(request, login, project, layerId, xField, yField) {
    const response = await request.post(url, {
        headers: {
            authorization: 'Basic ' + btoa(`${login}:admin`),
        },
        data: {
            repository: 'testsrepository',
            project: project,
            plot_config: {
                type: 'bar',
                title: 'Aggregation',
                layerId: layerId,
                x_field: xField,
                aggregation: 'count',
                traces: [
                    { y_field: yField, color: '', colorfield: '', z_field: '' },
                ],
                display_legend: 'True',
                stacked: 'False',
                horizontal: 'False',
                order: 0,
            },
        },
    });
    responseExpect(response).toBeJson();

    return await response.json();
}

/**
 * Get the features of a layer with a WFS GetFeature request,
 * with a basic authentication.
 * @param {import('@playwright/test').APIRequestContext} request The request context
 * @param {string} login    The user login, the password is "admin" for all the test users
 * @param {string} project  The project name
 * @param {string} typeName The WFS type name of the layer
 * @returns {Promise<Array<object>>} The GeoJSON features
 */
async function getWfsFeatures(request, login, project, typeName) {
    const response = await request.get('/index.php/lizmap/service', {
        headers: {
            authorization: 'Basic ' + btoa(`${login}:admin`),
        },
        params: {
            repository: 'testsrepository',
            project: project,
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            TYPENAME: typeName,
            OUTPUTFORMAT: 'GeoJSON',
            GEOMETRYNAME: 'none',
        },
    });
    expect(response.ok()).toBeTruthy();

    return (await response.json()).features;
}

/**
 * Count the features by value of a field, ignoring the null values,
 * as the dataviz aggregation does.
 * @param {Array<object>} features The GeoJSON features
 * @param {string}        field    The field grouping the features
 * @returns {object} The number of features by value
 */
function countByValue(features, field) {
    const counts = {};
    for (const feature of features) {
        const value = feature.properties[field];
        if (value !== null) {
            counts[value] = (counts[value] ?? 0) + 1;
        }
    }

    return counts;
}

test.describe('Dataviz API - aggregation of PostgreSQL layers in the database',
    {
        tag: ['@requests', '@readonly'],
    }, () => {

        // For PostgreSQL layers, the aggregated values are computed by the
        // database. The aggregated features must be exactly the ones the user
        // can get with WFS: the filters by polygon and by login must be applied.

        for (const login of ['admin', 'user_in_group_a', 'user_in_group_b']) {
            test(`Filter by polygon is applied for ${login}`, async ({request}) => {
                const project = 'filter_layer_data_by_polygon_for_groups';

                // The bakeries visible by the user, and their number by name
                const features = await getWfsFeatures(request, login, project, 'shop_bakery_pg');
                const expectedCounts = countByValue(features, 'name');

                // The dataviz count of bakeries by name
                const json = await getAggregatedPlot(
                    request, login, project, 'shop_bakery_pg_403084fe_041d_4ede_a2dc_cd9866a53623', 'name', 'id'
                );

                // No visible bakery: no trace
                if (features.length === 0) {
                    expect(json.data).toHaveLength(0);
                    return;
                }

                // Same counts by name as the WFS features
                const trace = json.data[0];
                expect(trace).not.toHaveProperty('transforms');
                const counts = Object.fromEntries(trace.x.map((name, i) => [name, trace.y[i]]));
                expect(counts).toEqual(expectedCounts);
            });

            test(`Filter by login is applied for ${login}`, async ({request}) => {
                const project = 'filter_layer_by_user';

                // The features visible by the user, and their number by user field
                const features = await getWfsFeatures(request, login, project, 'blue_filter_layer_by_user');
                const expectedCounts = countByValue(features, 'user');

                // The dataviz count of features by user field
                const json = await getAggregatedPlot(
                    request, login, project, 'filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0', 'user', 'gid'
                );

                // Same counts as the WFS features
                const trace = json.data[0];
                const counts = Object.fromEntries(trace.x.map((user, i) => [user, trace.y[i]]));
                expect(counts).toEqual(expectedCounts);
            });
        }
    });

test.describe('Dataviz API - sunburst',
    {
        tag: ['@requests', '@readonly'],
    }, () => {

        test('Sunburst of a PostgreSQL layer, aggregated in the database', async ({request}) => {
            const project = 'attribute_table';

            // The sub-neighbourhoods, counted by neighbourhood (parent) and name (label)
            const response = await request.post(url, {
                headers: {
                    authorization: 'Basic ' + btoa('admin:admin'),
                },
                data: {
                    repository: 'testsrepository',
                    project: project,
                    plot_config: {
                        type: 'sunburst',
                        title: 'Sunburst',
                        layerId: 'sousquartiers_3481452b_0a5b_4e0e_8c97_436fbfe60512',
                        x_field: 'libsquart',
                        aggregation: 'count',
                        traces: [
                            { y_field: 'id', color: '', colorfield: '', z_field: 'quartmno' },
                        ],
                        display_legend: 'True',
                        stacked: 'False',
                        horizontal: 'False',
                        order: 0,
                    },
                },
            });
            responseExpect(response).toBeJson();
            const trace = (await response.json()).data[0];

            // All the node ids are unique
            expect(new Set(trace.ids).size).toBe(trace.ids.length);

            // The root is the last node, with the number of features
            const features = await getWfsFeatures(request, 'admin', project, 'child_neighbourhood');
            const last = trace.ids.length - 1;
            expect(trace.parents[last]).toBe('');
            expect(trace.values[last]).toBe(features.length);

            // Each parent has the number of features of its neighbourhood,
            // which is the sum of the values of its children
            const expectedCounts = countByValue(features, 'quartmno');
            const root = trace.ids[last];
            const counts = {};
            const childSums = {};
            for (let i = 0; i < last; i++) {
                if (trace.parents[i] === root && trace.labels[i] in expectedCounts) {
                    counts[trace.labels[i]] = trace.values[i];
                }
                childSums[trace.parents[i]] = (childSums[trace.parents[i]] ?? 0) + trace.values[i];
            }
            expect(counts).toEqual(expectedCounts);
            for (let i = 0; i < last; i++) {
                if (trace.ids[i] in childSums) {
                    expect(trace.values[i]).toBe(childSums[trace.ids[i]]);
                }
            }
        });
    });

test.describe('Dataviz API - colors',
    {
        tag: ['@requests', '@readonly'],
    }, () => {

        /**
         * Get a bar plot of a PostgreSQL layer, aggregated in the database,
         * colored by the "user" field, which is null for the feature 3.
         * @param {import('@playwright/test').APIRequestContext} request The request context
         * @param {string} expFilter A QGIS expression to filter the features
         * @returns {Promise<object>} The trace of the plot
         */
        async function getColoredTrace(request, expFilter) {
            const response = await request.post(url, {
                headers: {
                    authorization: 'Basic ' + btoa('admin:admin'),
                },
                data: {
                    repository: 'testsrepository',
                    project: 'filter_layer_by_user',
                    exp_filter: expFilter,
                    plot_config: {
                        type: 'bar',
                        title: 'Colors',
                        layerId: 'filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0',
                        x_field: 'gid',
                        aggregation: 'sum',
                        traces: [
                            { y_field: 'gid', color: 'green', colorfield: 'user', z_field: '' },
                        ],
                        display_legend: 'True',
                        stacked: 'False',
                        horizontal: 'False',
                        order: 0,
                    },
                },
            });
            responseExpect(response).toBeJson();

            return (await response.json()).data[0];
        }

        test('The trace color is used for the groups without color', async ({request}) => {
            const trace = await getColoredTrace(request, '');
            expect(trace.x).toEqual([1, 2, 3]);
            expect(trace.marker.color).toEqual(['admin', 'user_in_group_a,user_in_group_b', 'green']);
        });

        test('The trace color is kept when no group has a color', async ({request}) => {
            const trace = await getColoredTrace(request, '"gid" = 3');
            expect(trace.x).toEqual([3]);
            expect(trace.marker.color).toBe('green');
        });
    });
