// @ts-check
import { test, expect } from '@playwright/test';
import { checkJson } from './globals';

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
            const json = await checkJson(response);

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
            expect(data[0]).toHaveProperty('y');
            expect(data[0].y).toEqual(expect.arrayContaining([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));

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
            const json = await checkJson(response);

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
            expect(data[0].values).toEqual(expect.arrayContaining([4, 2, 6, 1, 2, 1, 2, 1, 4, 2]));

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
            const json = await checkJson(response);

            expect(json).toHaveProperty('title', 'Horizontal bar bakeries in municipalities');
            expect(json).toHaveProperty('data');

            // check data
            const data = json.data;
            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('type', 'bar');
            expect(data[0]).toHaveProperty('orientation', 'h');
            expect(data[0]).toHaveProperty('transforms');
            expect(data[0].transforms).toEqual(
                [
                    {
                        "type": "aggregate",
                        "groups": "y",
                        "aggregations": [
                            {
                                "target": "x",
                                "func": "count",
                                "enabled": true
                            }
                        ]
                    }
                ]
            );
            expect(data[0]).toHaveProperty('x');
            expect(data[0].x).toEqual(
                expect.arrayContaining([
                    1, 16, 68, 69, 73, 79, 99, 102, 103, 119, 126, 140, 143,
                    151, 155, 157, 158, 163, 168, 173, 174, 181, 195, 197, 199
                ])
            );
            expect(data[0]).toHaveProperty('y');
            expect(data[0].y).toEqual(
                expect.arrayContaining([
                    "Grabels", "Grabels", "Montferrier-sur-Lez", "Lavérune", "Montpellier", "Montpellier",
                    "Saint-Jean-de-Védas", "Grabels", "Clapiers", "Clapiers", "Montpellier", "Juvignac",
                    "Castelnau-le-Lez", "Castelnau-le-Lez", "Grabels", "Grabels", "Le Crès", "Lattes",
                    "Lattes", "Castelnau-le-Lez", "Castelnau-le-Lez", "Saint-Jean-de-Védas", "Montpellier",
                    "Le Crès", "Grabels"
                ])
            );

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
            const json = await checkJson(response);

            expect(json).toHaveProperty('title', 'Number of bakeries by polygon');
            expect(json).toHaveProperty('data');

            // check data
            const data = json.data;
            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('type', 'bar');
            expect(data[0]).toHaveProperty('x');
            expect(data[0].x).toEqual(expect.arrayContaining([5, 5, 5, 5]));
            expect(data[0]).toHaveProperty('y');
            expect(data[0].y).toEqual(expect.arrayContaining([73, 79, 126, 195]) );

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
            const json = await checkJson(response);

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
            const json = await checkJson(response);

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
            const json = await checkJson(response);

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
            const json = await checkJson(response, 404);
            expect(json).toHaveProperty('errors');
            // check errors
            const errors = json.errors;
            expect(errors).toHaveProperty('code', 404);
            expect(errors).toHaveProperty('error_code', 'no_data');
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
            const json = await checkJson(response);

            expect(json).toHaveProperty('title', 'Bakeries by district');
            expect(json).toHaveProperty('data');

            // check data
            const data = json.data;
            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('type', 'bar');
            expect(data[0]).toHaveProperty('marker');
            expect(data[0].marker).toHaveProperty('color', 'cyan');
            expect(data[0]).toHaveProperty('transforms');
            expect(data[0].transforms).toHaveLength(1);
            expect(data[0].transforms[0]).toHaveProperty('aggregations');
            expect(data[0].transforms[0].aggregations).toHaveLength(1);
            expect(data[0].transforms[0].aggregations[0]).toHaveProperty('func', 'count');
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
            const json = await checkJson(response, 404);
            expect(json).toHaveProperty('errors');
            // check errors
            const errors = json.errors;
            expect(errors).toHaveProperty('code', 404);
            expect(errors).toHaveProperty('error_code', 'layer_not_found');
        });
    });
